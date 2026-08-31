"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export interface AdminChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface AdminAiContextValue {
  isOpen: boolean;
  openAi: () => void;
  closeAi: () => void;
  toggleAi: () => void;
  askAi: (question: string) => void;
  messages: AdminChatMessage[];
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  clearMessages: () => void;
}

const AdminAiContext = createContext<AdminAiContextValue | null>(null);

const INITIAL_ADMIN_WELCOME: AdminChatMessage = {
  id: "admin-welcome-msg",
  role: "assistant",
  content: `Olá! Sou o **Shopify Sidekick (Admin AI)**, seu assistente e co-piloto oficial da loja **SensaShop**. 🛍️⚡

Comigo você pode gerenciar sua loja em segundos por comandos de voz ou texto:
- 📦 **Criar e Editar Produtos** instantaneamente
- 🎨 **Editar Cores, Tipografia e Banners do Tema**
- 📢 **Atualizar a Barra de Anúncio** no topo
- 📊 **Consultar Métricas de Vendas e Faturamento**

O que você gostaria de fazer na loja hoje?`,
};

export function AdminAiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AdminChatMessage[]>([INITIAL_ADMIN_WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const openAi = useCallback(() => setIsOpen(true), []);
  const closeAi = useCallback(() => setIsOpen(false), []);
  const toggleAi = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([INITIAL_ADMIN_WELCOME]);
    setIsLoading(false);
  }, []);

  const sendPrompt = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMsg: AdminChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText.trim(),
      };

      const assistantMsgId = `assistant-${Date.now()}`;
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/admin/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Falha ao comunicar com o Shopify Sidekick");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: assistantText } : msg
            )
          );
        }

        // If a product was created or theme was updated, refresh the router to reflect changes in Admin UI!
        if (
          assistantText.includes("[[ADMIN_PRODUCT_CREATED:") ||
          assistantText.includes("[[ADMIN_THEME_UPDATED:")
        ) {
          router.refresh();
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Erro no Admin AI:", err);
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content:
                "Desculpe, tive um imprevisto ao executar a ação no Admin. Por favor, tente novamente!",
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, router]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      sendPrompt(input);
    },
    [input, sendPrompt]
  );

  const askAi = useCallback(
    (question: string) => {
      setIsOpen(true);
      sendPrompt(question);
    },
    [sendPrompt]
  );

  return (
    <AdminAiContext.Provider
      value={{
        isOpen,
        openAi,
        closeAi,
        toggleAi,
        askAi,
        messages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        isLoading,
        clearMessages,
      }}
    >
      {children}
    </AdminAiContext.Provider>
  );
}

export function useAdminAi() {
  const context = useContext(AdminAiContext);
  if (!context) {
    throw new Error("useAdminAi must be used within an AdminAiProvider");
  }
  return context;
}
