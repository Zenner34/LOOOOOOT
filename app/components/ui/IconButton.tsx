import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

// Square 32-36px button for toolbar / icon-only triggers.
// Replaces ad-hoc inline `<button className="…p-2">` instances.
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md"; tone?: "ghost" | "danger" }>(
  function IconButton({ children, className, size = "md", tone = "ghost", ...rest }, ref) {
    const sizeCls = size === "sm" ? "h-8 w-8" : "h-9 w-9";
    const toneCls =
      tone === "danger"
        ? "text-neutral-400 hover:bg-red-500/10 hover:text-red-300"
        : "text-neutral-400 hover:bg-white/5 hover:text-white";
    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center justify-center rounded-lg border border-white/10 transition active:scale-[0.96] ${sizeCls} ${toneCls} ${className ?? ""}`}
        {...rest}
      >
        {children as ReactNode}
      </button>
    );
  },
);
