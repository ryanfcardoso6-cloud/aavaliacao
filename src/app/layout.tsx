import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gelato Borelli — Avaliação de Atendimento & Ouvidoria',
  description: 'Avaliação de clientes, controle de qualidade e ouvidoria artesanal da Gelato Borelli',
  icons: {
    icon: '/logo-borelli.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1E3A24',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="min-h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased bg-[#FAF7F0] text-[#1E3A24] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
