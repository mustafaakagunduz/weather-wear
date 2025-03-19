"use client";

// components/weather-display.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Droplets, Thermometer, CloudRain } from "lucide-react";
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

interface WeatherDisplayProps {
    weatherData: WeatherData;
}

const WeatherDisplay = ({ weatherData }: WeatherDisplayProps) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    // Hava durumu ikonunun rengini belirle
    const getWeatherIconColor = () => {
        const icon = weatherData.weather[0].icon;
        if (theme === 'dark') {
            // Dark mode için daha parlak renkler
            if (icon.includes('n') || icon.includes('09') || icon.includes('10') || icon.includes('11')) {
                return "text-blue-300"; // Daha açık mavi
            } else if (icon.includes('01') || icon.includes('02')) {
                return "text-yellow-300"; // Daha açık sarı
            } else {
                return "text-gray-300"; // Daha açık gri
            }
        } else {
            // Light mode için mavi tonlar
            if (icon.includes('n') || icon.includes('09') || icon.includes('10') || icon.includes('11')) {
                return "text-blue-600";
            } else if (icon.includes('01') || icon.includes('02')) {
                return "text-blue-500";
            } else {
                return "text-blue-400";
            }
        }
    };

    // Hava durumuna göre farklı ikon göster
    const WeatherIcon = () => {
        const icon = weatherData.weather[0].icon;
        const iconClass = `h-6 w-6 ${getWeatherIconColor()}`;

        if (icon.includes('09') || icon.includes('10') || icon.includes('11')) {
            return <CloudRain className={iconClass} />;
        } else {
            return <Cloud className={iconClass} />;
        }
    };

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden card-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-blue-700 dark:text-blue-300">
                    <span className="flex items-center">
                        <WeatherIcon />
                        <span className="ml-2">{weatherData.name} {t('weatherTitle')}</span>
                    </span>
                    <img
                        src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                        alt={weatherData.weather[0].description}
                        className="w-12 h-12"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-4 md:gap-6 flex-grow">
                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 smooth-transition">
                        <Thermometer className="mr-3 h-6 w-6 text-primary dark:text-blue-300" />
                        <div>
                            <div className="text-sm text-blue-500 dark:text-blue-300">{t('temperature')}</div>
                            <div className="font-semibold text-lg text-blue-800 dark:text-white">{weatherData.main.temp}°C</div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 smooth-transition">
                        <Cloud className="mr-3 h-6 w-6 text-primary dark:text-blue-300" />
                        <div>
                            <div className="text-sm text-blue-500 dark:text-blue-300">{t('condition')}</div>
                            <div className="font-semibold text-lg capitalize text-blue-800 dark:text-white">{weatherData.weather[0].description}</div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 smooth-transition">
                        <Droplets className="mr-3 h-6 w-6 text-primary dark:text-blue-300" />
                        <div>
                            <div className="text-sm text-blue-500 dark:text-blue-300">{t('humidity')}</div>
                            <div className="font-semibold text-lg text-blue-800 dark:text-white">%{weatherData.main.humidity}</div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 smooth-transition">
                        <Wind className="mr-3 h-6 w-6 text-primary dark:text-blue-300" />
                        <div>
                            <div className="text-sm text-blue-500 dark:text-blue-300">{t('wind')}</div>
                            <div className="font-semibold text-lg text-blue-800 dark:text-white">{weatherData.wind.speed} m/s</div>
                        </div>
                    </div>
                </div>
                <div className="flex-grow py-3"></div>
            </CardContent>
        </Card>
    );
};

export default WeatherDisplay;