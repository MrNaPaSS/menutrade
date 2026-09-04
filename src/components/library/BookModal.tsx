import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModalWindow, MODAL_CAPTION } from '@/components/ui/modal-window';
import { BookCover } from '@/components/library/BookCover';
import type { Book } from '@/data/library';

interface BookModalProps {
    book: Book | null;
    description?: string;
    covers: Record<string, string>;
    onClose: () => void;
}

function openSearch(book: Book): void {
    const query = encodeURIComponent(`${book.title} ${book.author}`);
    const url = `https://www.google.com/search?q=${query}+read+online+free`;
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

/**
 * Карточка книги.
 *
 * Тем же окном, что и остальные разделы. Обложка крупная: в списке она
 * размером с ноготь, а здесь по ней и узнают книгу.
 */
export function BookModal({ book, description, covers, onClose }: BookModalProps) {
    return (
        <ModalWindow open={!!book} onClose={onClose} title={book?.title ?? ''} subtitle={book?.author}>
            {book && (
                <>
                    <div className="flex justify-center pt-1">
                        <BookCover
                            book={book}
                            fallbackUrl={covers[book.id]}
                            className="w-[150px]"
                        />
                    </div>

                    {description && (
                        <p className="text-[13.5px] leading-relaxed text-center px-1"
                            style={{ color: MODAL_CAPTION }}>
                            {description}
                        </p>
                    )}

                    <Button
                        className="w-full justify-between min-h-[46px]"
                        onClick={() => openSearch(book)}
                    >
                        <span className="font-semibold">Найти и читать</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Button>

                    <p className="text-[11.5px] text-center" style={{ color: MODAL_CAPTION }}>
                        Откроется поиск по названию и автору - библиотека не хранит
                        сами книги, только подборку
                    </p>
                </>
            )}
        </ModalWindow>
    );
}
