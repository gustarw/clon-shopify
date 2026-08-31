"use client";

import { useEffect, useState, useCallback } from "react";
import { ThemeConfig, SectionConfig } from "@/lib/repo/theme";
import { Product, Category } from "@/lib/types";
import { ThemeEditorTopBar, ViewportMode } from "./ThemeEditorTopBar";
import { ThemeEditorSidebar } from "./ThemeEditorSidebar";
import { LivePreviewCanvas } from "./LivePreviewCanvas";
import { AddSectionModal } from "./AddSectionModal";
import { SectionPropertiesPanel } from "./SectionPropertiesPanel";
import { ThemeSettingsPanel } from "./ThemeSettingsPanel";
import { Settings, X } from "lucide-react";

interface ThemeEditorShellProps {
  initialTheme: ThemeConfig;
  products?: Product[];
  categories?: Category[];
}

export function ThemeEditorShell({
  initialTheme,
  products = [],
  categories = [],
}: ThemeEditorShellProps) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [history, setHistory] = useState<ThemeConfig[]>([initialTheme]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialTheme.sections[0]?.id || null);
  const [activeRightTab, setActiveRightTab] = useState<"section" | "theme_settings" | null>("section");
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [currentPage, setCurrentPage] = useState("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Update theme with history tracking
  const updateTheme = useCallback((updated: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const nextTheme = { ...prev, ...updated };
      setHistory((h) => [...h.slice(0, historyIndex + 1), nextTheme]);
      setHistoryIndex((i) => i + 1);
      setIsDirty(true);
      return nextTheme;
    });
  }, [historyIndex]);

  // Undo / Redo
  function handleUndo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTheme(history[newIndex]);
      setIsDirty(true);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTheme(history[newIndex]);
      setIsDirty(true);
    }
  }

  // Save changes to server
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: theme }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDirty(false);
        showToast("✓ Tema salvo e publicado com sucesso!");
        return true;
      } else {
        alert("Erro ao salvar tema: " + (data.error || "Tente novamente."));
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão ao salvar.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [theme]);

  // Auto-save and open live store
  const handleViewLiveStore = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: theme }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDirty(false);
        showToast("✓ Tema sincronizado! Abrindo loja ao vivo...");
      }
    } catch (err) {
      console.error("Auto-save before live preview failed:", err);
    } finally {
      setIsSaving(false);
      window.open("/", "_blank");
    }
  }, [theme]);

  // Reset to default
  async function handleReset() {
    try {
      setIsSaving(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setTheme(data.config);
        setHistory([data.config]);
        setHistoryIndex(0);
        setIsDirty(false);
        showToast("✓ Tema restaurado para o padrão original!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  // Export JSON
  function handleExport() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `theme-shopify-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("✓ Arquivo do tema exportado com sucesso!");
  }

  // Import JSON
  function handleImport(jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr);
      updateTheme(parsed);
      showToast("✓ Tema importado com sucesso! Clique em Salvar para publicar.");
    } catch (e) {
      alert("JSON inválido.");
    }
  }

  // Section actions
  function handleSelectSection(id: string | null) {
    setSelectedSectionId(id);
    if (id) {
      setActiveRightTab("section");
    }
  }

  function handleOpenThemeSettings() {
    setActiveRightTab("theme_settings");
  }

  function updateCurrentSection(updated: SectionConfig) {
    const newSections = theme.sections.map((s) => (s.id === updated.id ? updated : s));
    updateTheme({ sections: newSections });
  }

  function deleteSection(id: string) {
    const newSections = theme.sections.filter((s) => s.id !== id);
    updateTheme({ sections: newSections });
    if (selectedSectionId === id) {
      const fallbackId = newSections[0]?.id || null;
      setSelectedSectionId(fallbackId);
      if (!fallbackId) {
        setActiveRightTab(null);
      }
    }
  }

  function duplicateSection(section: SectionConfig) {
    const duplicated: SectionConfig = {
      ...section,
      id: `sec-${Date.now()}`,
      name: `${section.name} (Cópia)`,
      settings: { ...section.settings },
      blocks: section.blocks ? JSON.parse(JSON.stringify(section.blocks)) : undefined,
    };

    const index = theme.sections.findIndex((s) => s.id === section.id);
    const newSections = [...theme.sections];
    newSections.splice(index + 1, 0, duplicated);

    updateTheme({ sections: newSections });
    setSelectedSectionId(duplicated.id);
    setActiveRightTab("section");
  }

  // Selected section object
  const selectedSection = theme.sections.find((s) => s.id === selectedSectionId) || theme.sections[0] || null;

  // Keyboard Shortcuts (⌘S for save, ⌘Z for undo, ⌘Y for redo)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, historyIndex, history]);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-white select-none">
      {/* Top Bar */}
      <ThemeEditorTopBar
        currentThemeName={theme.name}
        onSelectThemePreset={(preset) => {
          setTheme(preset.config);
          setHistory((h) => [...h.slice(0, historyIndex + 1), preset.config]);
          setHistoryIndex((i) => i + 1);
          setIsDirty(true);
          setSelectedSectionId(preset.config.sections[0]?.id || null);
          setActiveRightTab("section");
          showToast(`✓ Tema "${preset.name}" carregado! Clique em Salvar para publicar.`);
        }}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        viewportMode={viewportMode}
        onChangeViewport={setViewportMode}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onViewLiveStore={handleViewLiveStore}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Studio Area: Airbnb Surface Background with Dual Sidebars */}
      <div className="flex flex-1 overflow-hidden bg-[#f7f7f7]">
        {/* Left Sidebar (Section Tree & Navigation) */}
        <aside className="w-72 lg:w-80 flex-col shrink-0 flex border-r border-[#ebebeb] bg-white z-10 shadow-2xs">
          <ThemeEditorSidebar
            theme={theme}
            selectedSectionId={selectedSectionId}
            activeRightTab={activeRightTab}
            onSelectSection={handleSelectSection}
            onOpenThemeSettings={handleOpenThemeSettings}
            onUpdateTheme={updateTheme}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        </aside>

        {/* Center Live Preview Canvas */}
        <main className="flex-1 flex overflow-hidden">
          <LivePreviewCanvas
            theme={theme}
            products={products}
            categories={categories}
            viewportMode={viewportMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => handleSelectSection(id)}
          />
        </main>

        {/* Right Sidebar (Inspector: Section Properties or Theme Settings) */}
        {activeRightTab && (
          <aside className="w-80 lg:w-96 flex-col shrink-0 flex border-l border-[#ebebeb] bg-white z-10 shadow-2xs animate-fade-up">
            {activeRightTab === "section" && selectedSection ? (
              <SectionPropertiesPanel
                section={selectedSection}
                onUpdateSection={updateCurrentSection}
                onDeleteSection={deleteSection}
                onDuplicateSection={duplicateSection}
                onClose={() => setActiveRightTab(null)}
              />
            ) : activeRightTab === "theme_settings" ? (
              <div className="flex h-full flex-col bg-white">
                <div className="flex items-center justify-between border-b border-[#ebebeb] px-4 py-3.5 bg-[#f7f7f7]">
                  <div className="flex items-center gap-2">
                    <Settings className="size-4 text-[#ff385c]" />
                    <span className="text-xs font-bold text-[#222222]">Configurações do Tema</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab(null)}
                    className="size-7 rounded-full flex items-center justify-center text-[#6a6a6a] hover:bg-[#ebebeb] hover:text-[#222222] transition-colors cursor-pointer"
                    title="Fechar configurações"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <ThemeSettingsPanel theme={theme} onUpdateTheme={updateTheme} />
              </div>
            ) : null}
          </aside>
        )}
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={(newSec) => {
          updateTheme({
            sections: [...theme.sections, newSec],
          });
          setSelectedSectionId(newSec.id);
          setActiveRightTab("section");
          showToast(`✓ Seção "${newSec.name}" adicionada ao tema.`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-[#222222] px-5 py-3 text-xs font-semibold text-white shadow-airbnb-modal border border-[#333333] animate-fade-up flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[#ff385c]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
