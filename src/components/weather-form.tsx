"use client";

// components/weather-form.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, User, Search } from "lucide-react";
import { useLanguage } from '@/context/language-context';
import { Separator } from "@/components/ui/separator";
import { FormEvent } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WeatherFormProps {
    setWeatherData: React.Dispatch<React.SetStateAction<any>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setErrorKey: React.Dispatch<React.SetStateAction<string | null>>;
    setRecommendation: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    weatherData: any;
    errorKey: string | null; // Hata anahtarını props olarak alıyoruz
}

const WeatherForm = ({
                         setWeatherData,
                         setLoading,
                         setErrorKey,
                         setRecommendation,
                         loading,
                         weatherData,
                         errorKey
                     }: WeatherFormProps) => {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [gender, setGender] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [useManualLocation, setUseManualLocation] = useState<boolean>(false);
    const { language, t } = useLanguage();

    // Konum paylaşım izni kontrolü ve konum bilgisi alma
    const [locationRequested, setLocationRequested] = useState<boolean>(false);

    const requestLocationPermission = async () => {
        try {
            // Konum izin durumunu kontrol et
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });

                if (result.state === 'granted') {
                    // İzin zaten var, konum bilgisini al
                    getLocationData();
                } else if (result.state === 'prompt') {
                    // Kullanıcıya izin sor
                    setLocationRequested(true);
                    getLocationData();
                } else {
                    // İzin reddedilmiş
                    setErrorKey('locationError');
                    setLoading(false);
                    setUseManualLocation(true);
                }
            } else {
                // Permissions API desteklenmiyor, doğrudan konum isteği yap
                getLocationData();
            }
        } catch (error) {
            console.error('Permission check error:', error);
            // Hata durumunda doğrudan konum isteği yap
            getLocationData();
        }
    };

    const getLocationData = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                    setLocationRequested(true);
                    setLoading(false);
                },
                (error) => {
                    // Kullanıcı izin vermedi veya bir hata oluştu
                    setErrorKey('locationError');
                    setLoading(false);
                    setUseManualLocation(true);
                }
            );
        } else {
            // Tarayıcı geolocation desteklemiyor
            setErrorKey('browserLocationError');
            setLoading(false);
            setUseManualLocation(true);
        }
    };

    // Sayfa yüklendiğinde konum izni isteme
    useEffect(() => {
        if (!useManualLocation && !locationRequested) {
            requestLocationPermission();
        }
    }, [useManualLocation, locationRequested]);

    // Tarayıcı konumu ile hava durumu verilerini al
    useEffect(() => {
        const fetchWeatherDataByLocation = async () => {
            if (location && !useManualLocation) {
                try {
                    setLoading(true);
                    const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric&lang=${language}`;

                    const response = await axios.get(url);
                    setWeatherData(response.data);
                    setLoading(false);
                } catch (error) {
                    setErrorKey('weatherError');
                    setLoading(false);
                }
            }
        };

        fetchWeatherDataByLocation();
    }, [location, useManualLocation, setWeatherData, setLoading, setErrorKey, language]);

    // Şehir adıyla hava durumu verilerini al (form submit edildiğinde)
    const fetchWeatherDataByCity = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!city.trim()) {
            setErrorKey('emptyCityError');
            return;
        }

        try {
            setLoading(true);
            const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric&lang=${language}`;

            const response = await axios.get(url);
            setWeatherData(response.data);
            setLoading(false);

            // Hava durumu verisi başarıyla alındığında hata durumunu sıfırla
            setErrorKey(null);
        } catch (error) {
            setErrorKey('weatherError');
            setLoading(false);
        }
    };

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
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('formTitle')}
                </CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-gray-300">{t('formDescription')}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">

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
                                <span className="mt-2 text-blue-700 dark:text-gray-100">
                                    {t('female')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Konum hata mesajı - İstenen yerde gösteriyoruz */}
                {(errorKey === 'locationError' || errorKey === 'browserLocationError') && (
                    <Alert variant="destructive" className="mb-2 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex justify-center">
                        <AlertDescription className="text-red-800 dark:text-red-300 text-center w-full">{t(errorKey)}</AlertDescription>
                    </Alert>
                )}

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
                    <form onSubmit={fetchWeatherDataByCity} className="space-y-4 smooth-transition">
                        <div className="space-y-2">
                            <label htmlFor="city"
                                   className="text-sm font-medium flex items-center gap-1 text-blue-700 dark:text-gray-200">
                                <MapPin className="h-4 w-4 text-primary"/>
                                {t('cityLabel')}
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="city"
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder={t('cityPlaceholder')}
                                    className="smooth-transition bg-white border-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !city.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-primary/90 dark:text-white dark:hover:bg-primary"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            {language === 'tr' ? 'Şehir Bul' : 'Find City'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Diğer hata mesajları burada gösteriliyor */}
                {errorKey && errorKey !== 'locationError' && errorKey !== 'browserLocationError' && (
                    <Alert variant="destructive" className="mt-4 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex justify-center">
                        <AlertDescription className="text-red-800 dark:text-red-300 text-center w-full">{t(errorKey)}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full smooth-transition bg-blue-600 hover:bg-blue-700 dark:bg-primary/90 dark:text-white dark:hover:bg-primary"
                    onClick={getClothingRecommendation}
                    disabled={loading || !weatherData || !gender}
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