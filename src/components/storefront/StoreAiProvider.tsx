"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface StoreAiContextValue {
  isOpen: boolean;
  openAi: () => void;
  closeAi: () => void;
  toggleAi: () => void;
  askAi: (question: string) => void;
  messages: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  clearMessages: () => void;
}

const StoreAiContext = createContext<StoreAiContextValue | null>(null);

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content: `Olá! Sou o **SensaBot**, seu consultor de compras inteligente da **SensaShop**. 🛍️✨

Posso te ajudar a encontrar os melhores produtos, comparar preços, consultar prazos de **frete grátis** ou rastrear seus pedidos em tempo real.

Como posso te ajudar hoje?`,
};

export function StoreAiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setIsLoading(false);
  }, []);

  const sendPrompt = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText.trim(),
      };

      const assistantMsgId = `assistant-${Date.now()}`;
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      // Create abort controller for streaming cancellation if needed
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Falha ao comunicar com o assistente IA");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        // Append initial empty assistant message
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
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Erro no chat IA:", err);
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content:
                "Desculpe, tive um imprevisto ao processar sua resposta. Por favor, tente novamente em instantes!",
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
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
    <StoreAiContext.Provider
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
    </StoreAiContext.Provider>
  );
}

export function useStoreAi() {
  const context = useContext(StoreAiContext);
  if (!context) {
    throw new Error("useStoreAi must be used within a StoreAiProvider");
  }
  return context;
}
