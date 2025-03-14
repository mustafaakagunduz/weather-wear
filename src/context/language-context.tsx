"use client";

// context/language-context.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'tr' | 'en';

type Translations = {
    [key: string]: {
        tr: string;
        en: string;
    };
};

// Çeviriler (tema ile ilgili yeni çeviriler eklendi)
export const translations: Translations = {
    pageTitle: {
        tr: "Hava Durumuna Göre Giyim Önerileri",
        en: "Weather-Based Clothing Recommendations"
    },
    formTitle: {
        tr: "Konum ve Kişisel Bilgiler",
        en: "Location and Personal Information"
    },
    formDescription: {
        tr: "Giyim önerisi alabilmek için aşağıdaki bilgileri doldurun",
        en: "Fill in the information below to get clothing recommendations"
    },
    manualLocation: {
        tr: "Manuel konum girişi",
        en: "Manual location input"
    },
    cityLabel: {
        tr: "Şehir Adı:",
        en: "City Name:"
    },
    cityPlaceholder: {
        tr: "Örn: Istanbul",
        en: "Ex: London"
    },
    genderLabel: {
        tr: "Cinsiyet:",
        en: "Gender:"
    },
    genderSelect: {
        tr: "Seçiniz",
        en: "Select"
    },
    male: {
        tr: "Erkek",
        en: "Male"
    },
    female: {
        tr: "Kadın",
        en: "Female"
    },
    getRecommendation: {
        tr: "Giyim Önerisi Al",
        en: "Get Clothing Recommendation"
    },
    loading: {
        tr: "Yükleniyor",
        en: "Loading"
    },
    weatherTitle: {
        tr: "Hava Durumu",
        en: "Weather Forecast"
    },
    temperature: {
        tr: "Sıcaklık:",
        en: "Temperature:"
    },
    condition: {
        tr: "Durum:",
        en: "Condition:"
    },
    humidity: {
        tr: "Nem:",
        en: "Humidity:"
    },
    wind: {
        tr: "Rüzgar:",
        en: "Wind:"
    },
    recommendationTitle: {
        tr: "Giyim Önerisi",
        en: "Clothing Recommendation"
    },
    locationError: {
        tr: "Konum bilgisi alınamadı. Lütfen manuel olarak giriş yapınız veya tarayıcınıza konum erişim izni sağlayınız.",
        en: "Could not get location. Please enter manually or provide location access permission to your browser."
    },
    browserLocationError: {
        tr: "Tarayıcınız konum servislerini desteklemiyor. Lütfen manuel olarak giriş yapın.",
        en: "Your browser does not support location services. Please enter manually."
    },
    weatherError: {
        tr: "Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.",
        en: "Could not get weather information. Please try again later."
    },
    validationError: {
        tr: "Hava durumu bilgisi ve cinsiyet seçimi gerekli!",
        en: "Weather information and gender selection are required!"
    },
    recommendationError: {
        tr: "Giyim önerisi alınamadı. Lütfen daha sonra tekrar deneyin.",
        en: "Could not get clothing recommendation. Please try again later."
    },
    languageToggle: {
        tr: "English",
        en: "Türkçe"
    },
    // Tema ile ilgili yeni çeviriler
    darkModeToggle: {
        tr: "Karanlık Moda Geç",
        en: "Switch to Dark Mode"
    },
    lightModeToggle: {
        tr: "Aydınlık Moda Geç",
        en: "Switch to Light Mode"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // Start with a default language
    const [language, setLanguage] = useState<Language>("tr");
    const [isClient, setIsClient] = useState(false);

    // This effect will run only on the client after hydration is complete
    useEffect(() => {
        setIsClient(true);

        // Now it's safe to access browser APIs
        const savedLanguage = localStorage.getItem("language") as Language;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        } else if (navigator.language.startsWith("tr")) {
            setLanguage("tr");
        } else {
            setLanguage("en");
        }
    }, []);

    // This effect handles saving the language preference
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("language", language);
        }
    }, [language, isClient]);

    // Çeviri fonksiyonu
    const t = (key: string): string => {
        if (!translations[key]) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        return translations[key][language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Özel hook
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};