import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recipe Finder',
  description: 'Snap a photo of your ingredients and get AI‑powered recipe suggestions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="m-0 p-0 overflow-hidden">{children}</body>
    </html>
  );
}