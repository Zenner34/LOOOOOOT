"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { forwardRef, type ReactNode } from "react";

// Modern dropdown built on Radix Select. Drop-in replacement for native
// <select> usage. The popup is rendered into a portal, animated, and matches
// the rest of the design system (vermillion-tinted highlight on focus/active).

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectGroup = {
  label?: string;
  options: SelectOption[];
};

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "md";
  // Either pass `options` (flat) or `groups` (with section headers) or
  // `children` (render-prop with <SelectItem>) — matches Radix API.
  options?: SelectOption[];
  groups?: SelectGroup[];
  children?: ReactNode;
  ariaLabel?: string;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  disabled,
  className,
  triggerClassName,
  size = "md",
  options,
  groups,
  children,
  ariaLabel,
}: SelectProps) {
  const sizeCls = size === "sm"
    ? "px-2.5 py-1 text-xs min-h-[28px]"
    : "px-3 py-2 text-sm min-h-[38px]";

  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        className={`group inline-flex items-center justify-between gap-2 w-full rounded-lg border border-white/10 bg-black/30 ${sizeCls} text-neutral-100 outline-none transition placeholder:text-neutral-500 hover:border-white/20 focus:border-vermillion-400/60 focus:ring-2 focus:ring-vermillion-500/20 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed ${triggerClassName ?? className ?? ""}`}
      >
        <RadixSelect.Value placeholder={<span className="text-neutral-500">{placeholder}</span>} />
        <RadixSelect.Icon className="text-neutral-400 group-hover:text-neutral-200 transition flex-shrink-0">
          <Chevron />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-lg border border-white/10 bg-[var(--surface-2)] shadow-2xl backdrop-blur-md min-w-[var(--radix-select-trigger-width)] max-h-[60vh] data-[state=open]:animate-fade-in"
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-neutral-500">
            <ChevronUp />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-1">
            {options && options.map(opt => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
            {groups && groups.map((g, i) => (
              <RadixSelect.Group key={i}>
                {g.label && (
                  <RadixSelect.Label className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {g.label}
                  </RadixSelect.Label>
                )}
                {g.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </SelectItem>
                ))}
                {i < groups.length - 1 && <RadixSelect.Separator className="my-1 h-px bg-white/5" />}
              </RadixSelect.Group>
            ))}
            {children}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-neutral-500">
            <ChevronDown />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export const SelectItem = forwardRef<HTMLDivElement, { value: string; disabled?: boolean; children: ReactNode; className?: string }>(
  function SelectItem({ value, disabled, children, className }, ref) {
    return (
      <RadixSelect.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-200 cursor-pointer outline-none select-none data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[highlighted]:bg-vermillion-500/12 data-[highlighted]:text-vermillion-200 data-[state=checked]:text-vermillion-200 ${className ?? ""}`}
      >
        <RadixSelect.ItemIndicator className="absolute right-2 text-vermillion-300">
          <Check />
        </RadixSelect.ItemIndicator>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  },
);

export const SelectGroup = RadixSelect.Group;
export const SelectLabel = RadixSelect.Label;
export const SelectSeparator = RadixSelect.Separator;

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevronUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
