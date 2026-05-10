import { type ReactNode } from "react";

// Styled keyboard-shortcut chip. Used in CommandPalette and any future
// shortcut help surface.
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-neutral-300 leading-none">
      {children}
    </kbd>
  );
}
