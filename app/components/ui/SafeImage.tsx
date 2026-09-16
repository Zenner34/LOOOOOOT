"use client";

import { useCallback, useState } from "react";

/**
 * An `<img>` that removes itself when the source fails to load, leaving
 * whatever sits behind it (a monogram plate, nothing at all) instead of
 * the browser's broken-image glyph.
 *
 * A plain `onError` isn't enough: server-rendered images often fail
 * *before* hydration attaches the handler, so that event is never seen
 * and the broken glyph sticks. The ref callback covers that case by
 * checking the element's own load state on mount; `onError` covers
 * everything that fails later (lazy images below the fold).
 */
export function SafeImage({
  src,
  alt = "",
  width,
  height,
  className,
  lazy = true,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
}) {
  const [broken, setBroken] = useState(false);

  const ref = useCallback((el: HTMLImageElement | null) => {
    // complete + zero intrinsic width === the fetch already failed.
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, []);

  if (broken) return null;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : undefined}
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
