import type { Metadata } from "next";
import { Syne, DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eval Studio | AI Prompt Evaluation Platform",
  description: "Browser-based LLM evaluation tool. Test prompts and models on your own data with multi-model judge council, cost tracking, and ranked results.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Eval Studio | AI Prompt Evaluation Platform",
    description: "Which prompt, which model, at what cost? Test prompts and models on your own data with multi-model judge council, cost tracking, and ranked results.",
    url: "https://eval.harshit.ai",
    siteName: "Eval Studio",
    images: [
      {
        url: "https://eval.harshit.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eval Studio - AI Prompt Evaluation Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eval Studio | AI Prompt Evaluation Platform",
    description: "Which prompt, which model, at what cost? Browser-based LLM evaluation with multi-model judge council.",
    images: ["https://eval.harshit.ai/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg font-body antialiased">
        {children}
      </body>
    </html>
  );
}
