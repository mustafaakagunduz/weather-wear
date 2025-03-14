"use client";

// components/clothing-recommendation.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/context/language-context';
import { Shirt } from "lucide-react";

interface ClothingRecommendationProps {
    recommendation: string;
}

const ClothingRecommendation = ({ recommendation }: ClothingRecommendationProps) => {
    const { t } = useLanguage();

    // Tavsiyeyi paragraflar halinde ayrıştır
    const recommendationParagraphs = recommendation.split('\n\n').filter(p => p.trim() !== '');

    return (
        <Card className="card-shadow border-t-4 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Shirt className="h-5 w-5 text-primary" />
                    {t('recommendationTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {recommendationParagraphs.length > 0 ? (
                    <div className="space-y-4">
                        {recommendationParagraphs.map((paragraph, index) => (
                            <p key={index} className="leading-relaxed text-blue-800 dark:text-gray-100">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className="whitespace-pre-line leading-relaxed text-blue-800 dark:text-gray-100">{recommendation}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ClothingRecommendation;