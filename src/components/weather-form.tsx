"use client";

// components/weather-form.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, User } from "lucide-react";
import { useLanguage } from '@/context/language-context';
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SimpleCityAutocomplete from './simple-city-autocomplete';

interface WeatherFormProps {
    setWeatherData: React.Dispatch<React.SetStateAction<any>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setErrorKey: React.Dispatch<React.SetStateAction<string | null>>;
    setRecommendation: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    weatherData: any;
    errorKey: string | null;
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
    const [locationRequested, setLocationRequested] = useState<boolean>(false);

    const requestLocationPermission = async () => {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });

                if (result.state === 'granted') {
                    getLocationData();
                } else if (result.state === 'prompt') {
                    setLocationRequested(true);
                    getLocationData();
                } else {
                    setErrorKey('locationError');
                    setLoading(false);
                    setUseManualLocation(true);
                }
            } else {
                getLocationData();
            }
        } catch (error) {
            console.error('Permission check error:', error);
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
    };

    useEffect(() => {
        if (!useManualLocation && !locationRequested) {
            requestLocationPermission();
        }
    }, [useManualLocation, locationRequested]);

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

    const fetchWeatherDataByCity = async (cityQuery = city) => {
        if (!cityQuery.trim()) {
            setErrorKey('emptyCityError');
            return;
        }

        try {
            setLoading(true);
            const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${weatherApiKey}&units=metric&lang=${language}`;

            const response = await axios.get(url);
            setWeatherData(response.data);
            setLoading(false);
            setErrorKey(null);
        } catch (error) {
            setErrorKey('weatherError');
            setLoading(false);
        }
    };

    // Şehir seçildiğinde otomatik olarak hava durumu verilerini çekmek için
    useEffect(() => {
        if (city && city.trim() !== '') {
            fetchWeatherDataByCity();
        }
    }, [city]);

    const getClothingRecommendation = async () => {
        if (!weatherData || !gender) {
            setErrorKey('validationError');
            return;
        }

        try {
            setLoading(true);
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
        <Card className="w-full h-full flex flex-col overflow-hidden card-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('formTitle')}
                </CardTitle>

                <CardDescription className="text-blue-600/80 dark:text-gray-300 text-center mt-2">
                    {t('formDescription')}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col space-y-3 p-4">
                <Separator className="my-2" />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-center text-blue-700 dark:text-gray-200 flex items-center justify-center gap-1">
                        <User className="h-4 w-4 text-primary"/>
                        {t('genderLabel')}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className={`cursor-pointer p-3 rounded-lg border text-center transition-all ${
                                gender === 'male'
                                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'bg-white border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setGender('male')}
                        >
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-blue-700 dark:text-gray-100">
                                    {t('male')}
                                </span>
                            </div>
                        </div>

                        <div
                            className={`cursor-pointer p-3 rounded-lg border text-center transition-all ${
                                gender === 'female'
                                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'bg-white border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setGender('female')}
                        >
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-blue-700 dark:text-gray-100">
                                    {t('female')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {(errorKey === 'locationError' || errorKey === 'browserLocationError') && (
                    <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex justify-center">
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
                    <div className="space-y-2">
                        <label htmlFor="city"
                               className="text-sm font-medium flex items-center gap-1 text-blue-700 dark:text-gray-200">
                            <MapPin className="h-4 w-4 text-primary"/>
                            {t('cityLabel')}
                        </label>
                        <SimpleCityAutocomplete
                            setSelectedCity={setCity}
                            placeholder={t('cityPlaceholder')}
                        />
                    </div>
                )}

                {errorKey && errorKey !== 'locationError' && errorKey !== 'browserLocationError' && (
                    <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex justify-center">
                        <AlertDescription className="text-red-800 dark:text-red-300 text-center w-full">{t(errorKey)}</AlertDescription>
                    </Alert>
                )}

                <div className="flex-grow"></div>
            </CardContent>

            <CardFooter className="p-4 pt-2">
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