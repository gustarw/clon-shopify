"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { cn } from "@/components/ui/cn";

function mergeClassName<T>(
  baseClasses: string,
  customClasses?: string | ((state: T) => string | undefined)
) {
  if (typeof customClasses === "function") {
    return (state: T) => cn(baseClasses, customClasses(state));
  }
  return cn(baseClasses, customClasses);
}

function Drawer({
  ...props
}: React.ComponentProps<typeof BaseDrawer.Root>) {
  return <BaseDrawer.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof BaseDrawer.Trigger>) {
  return <BaseDrawer.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof BaseDrawer.Portal>) {
  return <BaseDrawer.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof BaseDrawer.Close>) {
  return <BaseDrawer.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof BaseDrawer.Backdrop>) {
  return (
    <BaseDrawer.Backdrop
      data-slot="drawer-overlay"
      className={mergeClassName(
        "fixed inset-0 z-50 bg-black/20 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  overlayClassName,
  viewportClassName,
  children,
  ...props
}: React.ComponentProps<typeof BaseDrawer.Popup> & {
  overlayClassName?: string;
  viewportClassName?: string;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay className={overlayClassName} />
      <BaseDrawer.Viewport
        className={cn(
          "fixed inset-0 z-50 flex pointer-events-none justify-end items-end sm:items-center sm:justify-end p-0 sm:p-4",
          viewportClassName
        )}
      >
        <BaseDrawer.Popup
          data-slot="drawer-content"
          className={mergeClassName(
            "pointer-events-auto flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out border border-[#ececee] " +
              "w-full max-w-md sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl max-h-[88vh] sm:max-h-full sm:h-full overflow-hidden",
            className
          )}
          {...props}
        >
          {children}
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4 sm:p-5", className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4 sm:p-5", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDrawer.Title>) {
  return (
    <BaseDrawer.Title
      data-slot="drawer-title"
      className={mergeClassName(
        "text-base font-semibold leading-none text-ink-900 tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDrawer.Description>) {
  return (
    <BaseDrawer.Description
      data-slot="drawer-description"
      className={mergeClassName("text-xs text-ink-500", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
