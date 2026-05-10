import { type ReactNode } from "react";

// Composable card primitive over the existing .panel utility.
// Default 24px padding (p-6); pass `compact` for 16px (p-4).
export function Card({
  children,
  compact = false,
  hoverable = false,
  className,
}: {
  children: ReactNode;
  compact?: boolean;
  hoverable?: boolean;
  className?: string;
}) {
  const pad = compact ? "p-4" : "p-6";
  return (
    <div className={`panel ${pad} ${hoverable ? "hoverable" : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 flex items-center justify-between gap-3 ${className ?? ""}`}>{children}</div>;
}

function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t hairline flex items-center justify-end gap-2 ${className ?? ""}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
