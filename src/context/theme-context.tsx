"use client";

// context/theme-context.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Tercih edilen temayı localStorage'dan al veya sistem tercihini kontrol et
    const [theme, setTheme] = useState<Theme>('light');

    // Başlangıçta tarayıcı/sistem tercihini kontrol et
    useEffect(() => {
        // localStorage'dan kayıtlı temayı kontrol et
        const storedTheme = localStorage.getItem('theme') as Theme | null;

        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Sistem koyu tema kullanıyorsa
            setTheme('dark');
        }
    }, []);

    // Tema değiştiğinde HTML class'ını ve localStorage'ı güncelle
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Tercihi localStorage'a kaydet
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Tema değiştirme fonksiyonu
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Özel hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};