"use client";

import React, { useState } from 'react';
import WeatherForm from '@/components/weather-form';
import WeatherDisplay from '@/components/weather-display';
import ClothingRecommendation from '@/components/clothing-recommendation';
import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';

interface WeatherData {
    main: {
        temp: number;
        humidity: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
    };
    name: string;
}

// Hata mesajlarını anahtar olarak saklıyoruz
type ErrorKey = string | null;

export default function Home() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorKey, setErrorKey] = useState<ErrorKey>(null); // Hata anahtarını saklıyoruz
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const { t } = useLanguage();
    const { theme } = useTheme();

    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl min-h-screen bg-blue-50/30 dark:bg-gray-900/20">
            <div className="flex justify-end gap-2 fixed top-4 right-4 z-50">
                <ThemeToggle />
                <LanguageToggle />
            </div>

            <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300">
                {t('pageTitle')}
            </h1>

            {errorKey && (

                <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex justify-center">
                    <AlertDescription className="text-red-800 dark:text-red-300">{t(errorKey)}</AlertDescription>
                </Alert>
            )}



            {weatherData && (
                <WeatherDisplay
                    weatherData={weatherData}
                />
            )}

            <WeatherForm
                setWeatherData={setWeatherData}
                setLoading={setLoading}
                setErrorKey={setErrorKey}
                setRecommendation={setRecommendation}
                loading={loading}
                weatherData={weatherData}
            />

            {recommendation && (
                <ClothingRecommendation
                    recommendation={recommendation}
                />
            )}
        </main>
    );
}