"use client";

import * as RT from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";

// Themed Radix Tooltip wrapper. The provider lives once at the layout root
// (see app/layout.tsx); each <Tooltip> here is a self-contained instance.
export function Tooltip({
  content,
  side = "top",
  children,
  delayDuration = 200,
}: {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
  delayDuration?: number;
}) {
  if (!content) return <>{children}</>;
  return (
    <RT.Root delayDuration={delayDuration}>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className="z-50 rounded-md border border-white/10 bg-[var(--surface-2)] px-2 py-1 text-xs text-neutral-100 shadow-card data-[state=delayed-open]:animate-fade-in"
        >
          {content}
          <RT.Arrow className="fill-[var(--surface-2)]" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}

export const TooltipProvider = RT.Provider;
