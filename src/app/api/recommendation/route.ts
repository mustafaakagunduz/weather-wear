// src/app/api/recommendation/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { success: false, error: 'OpenAI API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const { weatherData, gender, language } = await request.json();

        if (!weatherData || !gender) {
            return NextResponse.json(
                { success: false, error: language === 'en' ? 'Missing weather data or gender' : 'Hava durumu bilgisi veya cinsiyet eksik' },
                { status: 400 }
            );
        }

        // Dil seçimine göre prompt belirleme
        const promptLangMap: Record<string, string> = {
            tr: `Bugün ${weatherData.name} şehrinde hava ${weatherData.weather[0].description}, 
          sıcaklık ${weatherData.main.temp}°C, nem oranı %${weatherData.main.humidity} ve rüzgar hızı ${weatherData.wind.speed} m/s. 
          ${gender === 'male' ? 'Erkek' : 'Kadın'} olarak bugün nasıl giyinmeliyim? Lütfen detaylı ve pratik bir öneri ver.`,
            en: `Today in ${weatherData.name}, the weather is ${weatherData.weather[0].description}, 
          temperature is ${weatherData.main.temp}°C, humidity is ${weatherData.main.humidity}%, and wind speed is ${weatherData.wind.speed} m/s. 
          How should I dress as a ${gender === 'male' ? 'man' : 'woman'} today? Please provide a detailed and practical recommendation.`
        };

        const systemLangMap: Record<string, string> = {
            tr: 'Sen bir kişisel stilist ve hava durumu uzmanısın. Kullanıcıya hava durumuna ve cinsiyetine göre en uygun giyim önerilerini veriyorsun.',
            en: 'You are a personal stylist and weather expert. You provide the user with the most appropriate clothing recommendations based on the weather and their gender.'
        };

        const prompt = promptLangMap[language] || promptLangMap['tr'];
        const systemPrompt = systemLangMap[language] || systemLangMap['tr'];

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
        });

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