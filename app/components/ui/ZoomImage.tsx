"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@/app/components/ui/Icon";

/**
 * Click-to-zoom image. The thumbnail opens a centered in-page lightbox
 * (portal at document.body) instead of navigating away — backdrop blur,
 * Escape / backdrop / ✕ to close, image capped to the viewport.
 * z-[130] so it also floats above the guide popup (z-[100]).
 *
 * On load error the thumbnail hides itself, or defers to `onError`
 * when the parent wants to swap in its own fallback.
 */
export function ZoomImage({
  src,
  alt,
  caption,
  imgClassName,
  imgStyle,
  wrapperClassName,
  onError,
}: {
  src: string;
  alt: string;
  /** Shown under the enlarged image. */
  caption?: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
  wrapperClassName?: string;
  onError?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errored, setErrored] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (errored && !onError) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block cursor-zoom-in ${wrapperClassName ?? "w-full"}`}
        title="Click to enlarge"
        aria-label={`${alt} (click to enlarge)`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => { setErrored(true); onError?.(); }}
          className={imgClassName}
          style={imgStyle}
        />
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[130] flex cursor-zoom-out items-center justify-center p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in" />
          <figure
            className="relative max-h-full max-w-full animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[88vh] max-w-[94vw] cursor-default rounded-xl border border-white/15 object-contain shadow-2xl"
            />
            {caption && (
              <figcaption className="mt-2 text-center text-xs text-neutral-300">{caption}</figcaption>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/80 text-neutral-200 shadow-lg transition hover:border-white/40 hover:text-white"
              aria-label="Close"
            >
              <X size={15} aria-hidden />
            </button>
          </figure>
        </div>,
        document.body,
      )}
    </>
  );
}
