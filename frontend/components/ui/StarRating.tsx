"use client";
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    value: number;
    onChange: (rating: number) => void;
    readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);

    const handleClick = (rating: number) => {
        if (!readonly) {
            onChange(rating);
        }
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverValue || value) >= star;
                return (
                    <Star
                        key={star}
                        className={`h-8 w-8 transition-all cursor-pointer ${isFilled
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-400 hover:text-yellow-300'
                            } ${readonly ? 'cursor-default' : ''}`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readonly && setHoverValue(star)}
                        onMouseLeave={() => !readonly && setHoverValue(0)}
                    />
                );
            })}
        </div>
    );
}
