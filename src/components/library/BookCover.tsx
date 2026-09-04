import { memo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book } from '@/data/library';

interface BookCoverProps {
    book: Book;
    /** Запасная обложка, найденная по ISBN */
    fallbackUrl?: string;
    /** Сообщить наверх найденный по ISBN адрес */
    onFound?: (id: string, url: string) => void;
    className?: string;
}

/**
 * Обложка книги.
 *
 * Пропорция 2:3 - книжная, при ней корешки в сетке стоят ровным рядом,
 * как на полке. Пока обложка грузится, на месте стоит подложка того же
 * размера: без неё сетка дёргается, когда картинки приходят вразнобой.
 *
 * Не нашлась - ищем по ISBN у Google Books, и только потом показываем
 * значок. Обложка здесь главное содержимое, а не украшение.
 */
export const BookCover = memo(function BookCover({
    book,
    fallbackUrl,
    onFound,
    className,
}: BookCoverProps) {
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const src = book.coverImage || fallbackUrl;

    const lookUpByIsbn = () => {
        if (fallbackUrl || !book.isbn || !onFound) return;
        fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}&maxResults=1`)
            .then(res => res.json())
            .then(data => {
                const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
                if (thumb) {
                    onFound(book.id, thumb.replace('zoom=1', 'zoom=2').replace('http://', 'https://'));
                }
            })
            .catch(() => {
                /* нет сети - останется значок, это не повод шуметь */
            });
    };

    return (
        <div
            className={cn(
                'relative aspect-[2/3] rounded-[10px] overflow-hidden flex-shrink-0',
                'border border-white/[0.08]',
                className
            )}
            style={{
                background: 'linear-gradient(160deg, hsl(142 20% 14%), hsl(140 26% 8%))',
                boxShadow: '0 8px 20px -12px hsl(0 0% 0% / 0.9)',
            }}
        >
            {src && !failed && (
                <img
                    src={src}
                    alt={book.title}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => { setFailed(true); lookUpByIsbn(); }}
                    className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        loaded ? 'opacity-100' : 'opacity-0'
                    )}
                />
            )}

            {(!src || failed) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-primary/35" />
                </div>
            )}

            {/* Блик по верхней кромке: он и делает картинку обложкой,
                а не просто изображением в рамке */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-white/15 pointer-events-none"
            />
        </div>
    );
});
