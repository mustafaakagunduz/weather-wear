"use client";

// components/theme-toggle.tsx
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-10 w-10 smooth-transition"
            title={theme === 'light' ? t('darkModeToggle') : t('lightModeToggle')}
        >
            {theme === 'light' ? (
                <Moon className="h-4 w-4 text-primary" />
            ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
            )}
        </Button>
    );
};

export default ThemeToggle;