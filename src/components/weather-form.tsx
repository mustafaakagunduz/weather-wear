"use client";

// components/weather-form.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, User } from "lucide-react";
import { useLanguage } from '@/context/language-context';
import { Separator } from "@/components/ui/separator";


interface WeatherFormProps {
    setWeatherData: React.Dispatch<React.SetStateAction<any>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setErrorKey: React.Dispatch<React.SetStateAction<string | null>>;
    setRecommendation: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    weatherData: any;
}

const WeatherForm = ({
                         setWeatherData,
                         setLoading,
                         setErrorKey,
                         setRecommendation,
                         loading,
                         weatherData
                     }: WeatherFormProps) => {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [gender, setGender] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [useManualLocation, setUseManualLocation] = useState<boolean>(false);
    const { language, t } = useLanguage();

    // Konum bilgisini al
    useEffect(() => {
        if (!useManualLocation) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                        });
                        setLoading(false);
                    },
                    (error) => {
                        setErrorKey('locationError');
                        setLoading(false);
                        setUseManualLocation(true);
                    }
                );
            } else {
                setErrorKey('browserLocationError');
                setLoading(false);
                setUseManualLocation(true);
            }
        }
    }, [useManualLocation, setErrorKey, setLoading]);

    // Hava durumu verilerini al
    useEffect(() => {
        const fetchWeatherData = async () => {
            if (location || city) {
                try {
                    setLoading(true);
                    const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
                    let url;

                    if (location && !useManualLocation) {
                        url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`;
                    } else if (city) {
                        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
                    } else {
                        return;
                    }

                    // Dil parametresi ekle
                    url += `&lang=${language}`;

                    const response = await axios.get(url);
                    setWeatherData(response.data);
                    setLoading(false);
                } catch (error) {
                    setErrorKey('weatherError');
                    setLoading(false);
                }
            }
        };

        fetchWeatherData();
    }, [location, city, useManualLocation, setWeatherData, setLoading, setErrorKey, language]);

    // ChatGPT'den giyim önerisi al - Sunucu taraflı API kullanarak
    const getClothingRecommendation = async () => {
        if (!weatherData || !gender) {
            setErrorKey('validationError');
            return;
        }

        try {
            setLoading(true);

            // Kendi API ara katmanımızı kullanıyoruz
            const response = await axios.post('/api/recommendation', {
                weatherData,
                gender,
                language
            });

            if (response.data.success) {
                setRecommendation(response.data.recommendation);
            } else {
                throw new Error(response.data.error);
            }

            setLoading(false);
        } catch (error) {
            console.error('API Error:', error);
            setErrorKey('recommendationError');
            setLoading(false);
        }
    };

    return (
        <Card className="mb-6 card-shadow">
            <CardHeader className="text-center"> {/* text-center sınıfı eklendi */}
                <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300"> {/* justify-center sınıfı eklendi */}
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('formTitle')}
                </CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-gray-300">{t('formDescription')}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">

                <Separator className="my-2" />
                {/* Redesigned Gender Selection Cards */}
                <div className="space-y-4">
                    <label
                        className="block text-sm font-medium text-center text-blue-700 dark:text-gray-200 flex items-center justify-center gap-1"
                    >
                        <User className="h-4 w-4 text-primary"/>
                        {t('genderLabel')}
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                                gender === 'male'
                                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'bg-white border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setGender('male')}
                        >
                            <div className="flex flex-col items-center justify-center">
                                {/* You can add an icon here if you want */}
                                <span className="mt-2 text-blue-700 dark:text-gray-100">
                                    {t('male')}
                                </span>
                            </div>
                        </div>

                        <div
                            className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                                gender === 'female'
                                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'bg-white border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setGender('female')}
                        >
                            <div className="flex flex-col items-center justify-center">
                                {/* You can add an icon here if you want */}
                                <span className="mt-2 text-blue-700 dark:text-gray-100">
                                    {t('female')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="manualLocation"
                        checked={useManualLocation}
                        onCheckedChange={() => setUseManualLocation(!useManualLocation)}
                        className="border-blue-300 dark:border-gray-500"
                    />
                    <label htmlFor="manualLocation"
                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 smooth-transition text-blue-700 dark:text-gray-200">
                        {t('manualLocation')}
                    </label>
                </div>

                {useManualLocation && (
                    <div className="space-y-2 smooth-transition">
                        <label htmlFor="city"
                               className="text-sm font-medium flex items-center gap-1 text-blue-700 dark:text-gray-200">
                            <MapPin className="h-4 w-4 text-primary"/>
                            {t('cityLabel')}
                        </label>
                        <Input
                            id="city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={t('cityPlaceholder')}
                            className="smooth-transition bg-white border-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full smooth-transition bg-blue-600 hover:bg-blue-700 dark:bg-primary/90 dark:text-white dark:hover:bg-primary"
                    onClick={getClothingRecommendation}
                    disabled={loading || (!weatherData && !city) || !gender}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            {t('loading')}
                        </>
                    ) : t('getRecommendation')}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default WeatherForm;