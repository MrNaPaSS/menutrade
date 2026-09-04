import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCover } from '@/components/library/BookCover';
import { BookModal } from '@/components/library/BookModal';
import { libraryCategories, type Book } from '@/data/library';
import { bookDescriptions, DEFAULT_BOOK_DESCRIPTION } from '@/data/bookDescriptions';
import { cn } from '@/lib/utils';

const TOTAL_BOOKS = libraryCategories.reduce((sum, c) => sum + (c.books?.length ?? 0), 0);

const Library = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(libraryCategories[0].id);
  const [book, setBook] = useState<Book | null>(null);
  // Обложки, найденные по ISBN, когда своей картинки не оказалось
  const [covers, setCovers] = useState<Record<string, string>>({});

  const handleHomeClick = () => navigate('/home');
  const active = libraryCategories.find(c => c.id === activeId) ?? libraryCategories[0];

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm
                           focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight">Библиотека</h1>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>

          {/* Разделы полосой с прокруткой: их восемь, и в сетке по два
              названия обрезались до первого слова */}
          <div className="-mx-4 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 pb-1 w-max">
              {libraryCategories.map(category => {
                const isActive = category.id === activeId;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveId(category.id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap border transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      isActive
                        ? 'bg-primary/15 border-primary/35 text-primary font-medium'
                        : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:bg-white/[0.06]'
                    )}
                  >
                    {category.title}
                    <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-60">
                      {category.books?.length ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <main className="px-4 pt-3 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <p className="text-[11px] uppercase tracking-[0.1em] mb-3 px-1 text-muted-foreground">
              {TOTAL_BOOKS} книг · {active.title}
            </p>

            {/* Полка: обложки в три колонки. У книг они настоящие, и это
                единственный раздел, где картинка сама по себе содержимое -
                списком строк она пропадала размером с ноготь */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {(active.books ?? []).map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => setBook(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(index, 8) * 0.03,
                    duration: 0.24,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="text-left focus:outline-none focus-visible:ring-2
                             focus-visible:ring-primary/50 rounded-[10px]"
                >
                  <BookCover
                    book={item}
                    fallbackUrl={covers[item.id]}
                    onFound={(id, url) => setCovers(prev => ({ ...prev, [id]: url }))}
                  />
                  <p className="text-[12px] font-medium leading-tight mt-2 line-clamp-2 text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {item.author}
                  </p>
                </motion.button>
              ))}
            </div>

            {(active.books ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-10 text-sm">
                В этом разделе пока пусто
              </p>
            )}
          </div>
        </main>
      </div>

      <BookModal
        book={book}
        description={book ? bookDescriptions[book.id] ?? DEFAULT_BOOK_DESCRIPTION : undefined}
        covers={covers}
        onClose={() => setBook(null)}
      />
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Library;
