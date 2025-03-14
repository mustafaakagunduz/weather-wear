// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from "react";
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Hava Durumuna Göre Giyim Önerileri | Weather-Based Clothing Recommendations',
    description: 'Bulunduğunuz yerin hava durumuna ve cinsiyetinize göre kişiselleştirilmiş giyim önerileri alın | Get personalized clothing recommendations based on your location\'s weather and gender',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}