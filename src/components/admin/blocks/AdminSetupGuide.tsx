"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { cn } from "@/components/ui/cn";

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  solarIcon: string;
  badgeText?: string;
  actionText: string;
}

export interface AdminSetupGuideProps {
  steps?: SetupStep[];
  className?: string;
}

const DEFAULT_STEPS: SetupStep[] = [
  {
    id: "products",
    title: "Adicione seu primeiro produto",
    description: "Cadastre fotos em alta definição, preços e controle de estoque para começar a vender.",
    completed: true,
    href: "/admin/produtos/novo",
    solarIcon: SOLAR_ICONS.products,
    actionText: "Adicionar produto",
  },
  {
    id: "theme",
    title: "Personalize a vitrine da sua loja virtual",
    description: "Edite o design system, tipografia e seções visuais em tempo real com o Theme Editor OS 2.0.",
    completed: true,
    href: "/admin/temas/editor",
    solarIcon: SOLAR_ICONS.palette,
    badgeText: "Editor Visual",
    actionText: "Editar tema",
  },
  {
    id: "payments",
    title: "Configure os meios de pagamento",
    description: "Habilite Pix com 5% de desconto, cartões de crédito em até 12x e boleto bancário.",
    completed: true,
    href: "/admin/pedidos",
    solarIcon: SOLAR_ICONS.card,
    actionText: "Ver pedidos",
  },
  {
    id: "shipping",
    title: "Defina taxas de frete e envio",
    description: "Conecte transportadoras, calcule prazos em tempo real e crie regras de frete grátis.",
    completed: false,
    href: "/admin/pedidos",
    solarIcon: SOLAR_ICONS.delivery,
    badgeText: "Recomendado",
    actionText: "Configurar frete",
  },
];

export function AdminSetupGuide({
  steps = DEFAULT_STEPS,
  className,
}: AdminSetupGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs", className)}>
      <div
        className="cursor-pointer select-none p-5 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#ebebeb] bg-[#f7f7f7] transition-colors hover:bg-[#ebebeb]/50"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff385c] text-white shadow-sm">
            <AdminIcon name={SOLAR_ICONS.sparkles} size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#222222]">
                Guia de Configuração da Loja
              </h3>
              <span className="bg-[#ff385c] text-white text-[11px] font-semibold py-0.5 px-2.5 rounded-full">
                {progressPercent}% Concluído
              </span>
            </div>
            <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
              {completedCount} de {totalCount} etapas essenciais concluídas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-[#ebebeb]">
              <div
                className="h-full rounded-full bg-[#222222] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <ChevronDown
            className={cn(
              "size-4.5 text-[#6a6a6a] stroke-[2] transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="p-0 divide-y divide-[#ebebeb]">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 transition-colors",
                step.completed ? "bg-[#ffffff] hover:bg-[#f7f7f7]" : "bg-[#f7f7f7]/40 hover:bg-[#f7f7f7]"
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="mt-0.5 shrink-0">
                  {step.completed ? (
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
                      <AdminIcon name={SOLAR_ICONS.check} size={14} />
                    </span>
                  ) : (
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff385c] border border-[#ffd1dc]">
                      <AdminIcon name={SOLAR_ICONS.bolt} size={14} />
                    </span>
                  )}
                </span>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("text-[14px] font-semibold truncate", step.completed ? "text-[#222222]" : "text-[#222222] font-bold")}>
                      {step.title}
                    </h4>
                    {step.badgeText && (
                      <span className="bg-[#ffffff] border border-[#ebebeb] text-[#6a6a6a] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        {step.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#6a6a6a] font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 pl-8 sm:pl-0">
                <Link
                  href={step.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all",
                    step.completed
                      ? "border border-[#ebebeb] bg-[#ffffff] text-[#222222] hover:bg-[#f7f7f7]"
                      : "bg-[#222222] text-[#ffffff] hover:bg-[#000000] shadow-2xs"
                  )}
                >
                  <span>{step.actionText}</span>
                  <ChevronRight className="size-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
