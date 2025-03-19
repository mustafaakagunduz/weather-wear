"use client";

// components/simple-city-autocomplete.tsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/context/language-context';
import { Loader2 } from "lucide-react";

interface City {
    name: string;
    country: string;
    fullName: string;
    population?: number;
    state?: string;
}

interface SimpleCityAutocompleteProps {
    setSelectedCity: (city: string) => void;
    placeholder?: string;
    preferredCountry?: string; // Öncelikli ülke kodu (örn: 'TR')
}

const SimpleCityAutocomplete = ({
                                    setSelectedCity,
                                    placeholder,
                                    preferredCountry = 'TR' // Varsayılan olarak Türkiye'yi öncelikli yap
                                }: SimpleCityAutocompleteProps) => {
    const [inputValue, setInputValue] = useState("");
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [citySelected, setCitySelected] = useState(false); // Şehir seçildi mi?
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { language } = useLanguage();

    // OpenWeatherMap API ile şehir arama
    const searchCities = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setCities([]);
            return;
        }

        if (citySelected) return; // Eğer şehir seçildiyse arama yapma

        setLoading(true);
        try {
            const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
                params: {
                    q: searchQuery,
                    limit: 10, // Daha fazla sonuç alalım ve sonra filtreyelim
                    appid: weatherApiKey
                }
            });

            // Şehirleri işle ve düzenle
            const processedCities = response.data.map((city: any) => ({
                name: city.name,
                country: city.country,
                fullName: city.state
                    ? `${city.name}, ${city.state}, ${city.country}`
                    : `${city.name}, ${city.country}`,
                population: city.population || 0,
                state: city.state || ''
            }));

            // Şehir-ülke çiftlerine göre benzersiz şehirleri bul
            // Öncelikli ülke koduna göre sırala, sonra nüfusa göre
            const uniqueCityMap = new Map<string, City>();

            // Önce her ülke için en popüler şehri ekle
            processedCities.forEach((city: City) => {
                const key = `${city.name}-${city.country}`;
                if (!uniqueCityMap.has(key) || city.population! > uniqueCityMap.get(key)!.population!) {
                    uniqueCityMap.set(key, city);
                }
            });

            // Map'ten dizi oluştur ve sırala
            let uniqueCities = Array.from(uniqueCityMap.values());

            // Önce öncelikli ülke (TR), sonra nüfusa göre sırala
            uniqueCities.sort((a, b) => {
                // Öncelikli ülke her zaman üstte
                if (a.country === preferredCountry && b.country !== preferredCountry) return -1;
                if (a.country !== preferredCountry && b.country === preferredCountry) return 1;

                // Aynı ülkedeyse, nüfusa göre sırala (büyükten küçüğe)
                return (b.population || 0) - (a.population || 0);
            });

            setCities(uniqueCities);
            setShowDropdown(uniqueCities.length > 0 && !citySelected);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setCities([]);
        } finally {
            setLoading(false);
        }
    };

    // Dışarı tıklandığında dropdown'ı kapatma
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Arama fonksiyonunun debounce edilmesi
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!citySelected) {
            debounceRef.current = setTimeout(() => {
                searchCities(inputValue);
            }, 300);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [inputValue, citySelected]);

    const handleSelect = (city: City) => {
        setInputValue(city.fullName);
        // Hava durumu API çağrısı için şehir,ülke formatında gönder
        setSelectedCity(`${city.name},${city.country}`);
        setShowDropdown(false);
        setCitySelected(true); // Şehir seçildiğini işaretle
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Kullanıcı inputu değiştiriyorsa, şehir seçimi iptal edilmiş demektir
        if (citySelected) {
            setCitySelected(false);
        }

        // Uzunluk kontrolü ve dropdown gösterimi
        if (newValue.length > 1 && !citySelected) {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    // Ülke kodunu bayrak emoji'sine çeviren yardımcı fonksiyon
    const getCountryFlag = (countryCode: string) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    // Eğer şehir seçilmediyse ve input değeri yeterince uzunsa dropdown'ı göster
                    if (!citySelected && inputValue.length > 1 && cities.length > 0) {
                        setShowDropdown(true);
                    }
                }}
                placeholder={placeholder || (language === 'tr' ? 'Şehir ara...' : 'Search city...')}
                className="w-full smooth-transition bg-white border-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />

            {showDropdown && !citySelected && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <ul className="max-h-60 overflow-auto py-1">
                            {cities.length === 0 ? (
                                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    {language === 'tr' ? 'Şehir bulunamadı.' : 'No city found.'}
                                </li>
                            ) : (
                                cities.map((city, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelect(city)}
                                        className={`px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex items-center justify-between ${
                                            city.country === preferredCountry ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                        }`}
                                    >
                    <span className="text-gray-900 dark:text-gray-100">
                      {city.name}
                        {city.state && <span className="text-gray-500 dark:text-gray-400">, {city.state}</span>}
                    </span>
                                        <span className="ml-2 text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="mr-1">{getCountryFlag(city.country)}</span>
                                            {city.country}
                    </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimpleCityAutocomplete;