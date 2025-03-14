"use client";

// components/language-toggle.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(prev => prev === "tr" ? "en" : "tr");
    };

    return (
        <Button
            variant="outline"
            onClick={toggleLanguage}
            className="rounded-full smooth-transition"
            title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
        >
            <Languages className="h-4 w-4 mr-2" />
            {t('languageToggle')}
        </Button>
    );
};

export default LanguageToggle;