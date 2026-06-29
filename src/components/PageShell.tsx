import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className }: Props) {
  return (
    <main className={`panel ${className || ''}`} role="main">
      {children}
    </main>
  );
}
