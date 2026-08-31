"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";

type DeleteAction = (id: number) => Promise<void>;

export function DeleteButton({
  action,
  id,
  label = "Excluir",
  itemName,
  variant = "icon",
  onSuccess,
}: {
  action: DeleteAction;
  id: number;
  label?: string;
  itemName?: string;
  variant?: "icon" | "block" | "button";
  onSuccess?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await action(id);
      setShowModal(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Não foi possível excluir o item.");
    } finally {
      setBusy(false);
    }
  }

  const modalContent = showModal && mounted ? createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !busy && setShowModal(false)}
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Floating Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-airbnb-modal animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff0f3] text-[#c13515] border border-[#ffd1dc]">
            <AlertTriangle className="size-5" />
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={busy}
            className="size-8 rounded-full flex items-center justify-center text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-[#222222]">
            Confirmar exclusão
          </h3>
          <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[#6a6a6a] font-normal">
            {itemName ? (
              <>
                Tem certeza que deseja excluir <strong className="text-[#222222] font-semibold">{itemName}</strong>?
              </>
            ) : (
              "Tem certeza que deseja excluir este registro?"
            )}
            {" "}Esta ação é permanente e removerá o item do catálogo da loja.
          </p>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowModal(false)}
            className="rounded-full border border-[#ebebeb] bg-white px-4 py-2 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c13515] px-4.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#a12a10] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Excluir definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {variant === "block" ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 py-2.5 px-4 text-xs font-medium transition-all cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>{label}</span>
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>{label}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          aria-label={label}
          title={label}
          className="flex size-8.5 items-center justify-center rounded-full text-[#6a6a6a] hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
        >
          <AdminIcon name={SOLAR_ICONS.trash} size={16} />
        </button>
      )}

      {modalContent}
    </>
  );
}
