import { NextResponse } from "next/server";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Hava durumu veri doğrulama fonksiyonu
function validateWeatherData(data: any): boolean {
    // Gerekli alanların varlığını kontrol et
    if (!data || typeof data !== 'object') return false;
    if (!data.name || typeof data.name !== 'string') return false;
    if (!data.weather || !Array.isArray(data.weather) || data.weather.length === 0) return false;
    if (!data.weather[0].description || typeof data.weather[0].description !== 'string') return false;
    if (!data.main || typeof data.main !== 'object') return false;
    if (typeof data.main.temp !== 'number') return false;
    if (typeof data.main.humidity !== 'number') return false;
    if (!data.wind || typeof data.wind !== 'object') return false;
    if (typeof data.wind.speed !== 'number') return false;

    // String alanları temizle (XSS ve prompt injection'ı önlemek için)
    data.name = sanitizeInput(data.name);
    data.weather[0].description = sanitizeInput(data.weather[0].description);

    return true;
}

// String girdileri temizleme fonksiyonu
function sanitizeInput(input: string): string {
    // Prompt injection'a karşı koruma:
    // 1. Uzunluğu sınırla
    // 2. Yalnızca beklenen karakterlere izin ver
    // 3. Potansiyel tehlikeli karakterleri kaldır
    if (input.length > 100) {
        input = input.substring(0, 100);
    }

    // Sadece alfanümerik karakterler, boşluk ve bazı noktalama işaretlerine izin ver
    return input.replace(/[^\p{L}\p{N}\s.,'-]/gu, '');
}

export async function POST(request: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { success: false, error: 'OpenAI API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const { weatherData, gender, language } = await request.json();

        if (!weatherData || !gender || !validateWeatherData(weatherData)) {
            return NextResponse.json(
                { success: false, error: language === 'en' ? 'Invalid or missing weather data or gender' : 'Geçersiz veya eksik hava durumu bilgisi veya cinsiyet' },
                { status: 400 }
            );
        }

        // Cinsiyet girdisini doğrula
        if (gender !== 'male' && gender !== 'female') {
            return NextResponse.json(
                { success: false, error: language === 'en' ? 'Invalid gender value' : 'Geçersiz cinsiyet değeri' },
                { status: 400 }
            );
        }

        // Dil seçimini doğrula
        if (language !== 'tr' && language !== 'en') {
            return NextResponse.json(
                { success: false, error: 'Invalid language selection' },
                { status: 400 }
            );
        }

        // Dil seçimine göre prompt belirleme - Template literal yerine elle oluşturulan string (daha güvenli)
        const promptLangMap: Record<string, (city: string, desc: string, temp: number, humidity: number, wind: number, gen: string) => string> = {
            tr: (city, desc, temp, humidity, wind, gen) =>
                `Bugün ${city} şehrinde hava ${desc}, sıcaklık ${temp}°C, nem oranı %${humidity} ve rüzgar hızı ${wind} m/s. ${gen === 'male' ? 'Erkek' : 'Kadın'} olarak bugün nasıl giyinmeliyim? Lütfen detaylı ve pratik bir öneri ver.`,
            en: (city, desc, temp, humidity, wind, gen) =>
                `Today in ${city}, the weather is ${desc}, temperature is ${temp}°C, humidity is ${humidity}%, and wind speed is ${wind} m/s. How should I dress as a ${gen === 'male' ? 'man' : 'woman'} today? Please provide a detailed and practical recommendation.`
        };

        const systemLangMap: Record<string, string> = {
            tr: 'Sen bir kişisel stilist ve hava durumu uzmanısın. Kullanıcıya hava durumuna ve cinsiyetine göre en uygun giyim önerilerini veriyorsun. Sadece giyim önerisi ver, başka konulardan bahsetme.',
            en: 'You are a personal stylist and weather expert. You provide the user with the most appropriate clothing recommendations based on the weather and their gender. Provide only clothing recommendations, do not discuss other topics.'
        };

        // Güvenli prompt oluşturma
        const promptFn = promptLangMap[language];
        const prompt = promptFn(
            weatherData.name,
            weatherData.weather[0].description,
            weatherData.main.temp,
            weatherData.main.humidity,
            weatherData.wind.speed,
            gender
        );

        const systemPrompt = systemLangMap[language];

        // OpenAI API'sine gönderilecek mesaja sınırlama ekle
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini",
            // İlgili parametreler eklenebilir
            max_tokens: 500, // Yanıt uzunluğunu sınırla
            temperature: 0.7, // Daha tutarlı yanıtlar için
        });

        // Yanıtı işle ve döndür
        return NextResponse.json({
            success: true,
            recommendation: completion.choices[0]?.message?.content || ''
        });

    } catch (error: any) {
        console.error('API Error:', error);

        // Dil seçimine göre hata mesajı belirleme
        const errorMessage = (language: string = 'tr') => {
            return language === 'en'
                ? 'An error occurred while getting clothing recommendations.'
                : 'Giyim önerisi alınırken bir hata oluştu.';
        };

        return NextResponse.json(
            {
                success: false,
                error: error.message || errorMessage()
            },
            { status: 500 }
        );
    }
}