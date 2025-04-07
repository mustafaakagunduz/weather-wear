"use client";

// components/clothing-recommendation.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/context/language-context';
import { Shirt } from "lucide-react";
import { useMemo } from "react";

interface ClothingRecommendationProps {
    recommendation: string;
}

const ClothingRecommendation = ({ recommendation }: ClothingRecommendationProps) => {
    const { t } = useLanguage();

    // Markdown işleme fonksiyonu - basit markdown desteği için
    const processMarkdown = (text: string) => {
        // Bold metinleri işle: **metin** --> <strong>metin</strong>
        return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    };

    // Tavsiyeyi paragraflar halinde ayrıştır ve markdown işle
    const recommendationContent = useMemo(() => {
        const recommendationParagraphs = recommendation.split('\n\n').filter(p => p.trim() !== '');

        return recommendationParagraphs.map((paragraph, index) => {
            // Numaralı liste kontrolü (1., 2., 3. gibi)
            if (/^\d+\.\s/.test(paragraph)) {
                // Numaralı liste öğelerini ayrıştır
                const listItems = paragraph.split(/\d+\.\s/).filter(item => item.trim() !== '');

                return (
                    <ol key={index} className="list-decimal pl-5 space-y-2">
                        {listItems.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-blue-800 dark:text-gray-100"
                                dangerouslySetInnerHTML={{ __html: processMarkdown(item.trim()) }} />
                        ))}
                    </ol>
                );
            }
            // Tire ile başlayan madde listesi kontrolü
            else if (paragraph.includes('- ')) {
                const items = paragraph.split('- ').filter(item => item.trim() !== '');
                return (
                    <ul key={index} className="list-disc pl-5 space-y-2">
                        {items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-blue-800 dark:text-gray-100"
                                dangerouslySetInnerHTML={{ __html: processMarkdown(item.trim()) }} />
                        ))}
                    </ul>
                );
            }
            // Normal paragraf
            else {
                return (
                    <p key={index} className="leading-relaxed text-blue-800 dark:text-gray-100"
                       dangerouslySetInnerHTML={{ __html: processMarkdown(paragraph) }} />
                );
            }
        });
    }, [recommendation]);

    return (
        <Card className="card-shadow border-t-4 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Shirt className="h-5 w-5 text-primary" />
                    {t('recommendationTitle')}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                {recommendation.trim() !== '' ? (
                    <div className="space-y-4">
                        {recommendationContent}
                    </div>
                ) : (
                    <p className="text-blue-800 dark:text-gray-100">{t('noRecommendationYet')}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ClothingRecommendation;