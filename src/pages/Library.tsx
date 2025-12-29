import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { libraryCategories } from '@/data/library';
import { Book } from '@/data/library';


const Library = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const [activeTab, setActiveTab] = useState(libraryCategories[0].id);
  const [bookCovers, setBookCovers] = useState<Record<string, string>>({});

  // Функция для получения обложки через Google Books API
  const fetchBookCover = async (bookId: string, title: string, author: string) => {
    if (bookCovers[bookId]) return;
    
    try {
      // Пробуем несколько вариантов запроса для лучшего результата
      const queries = [
        `intitle:"${title}" inauthor:"${author}"`,
        `"${title}" "${author}"`,
        `${title} ${author}`
      ];
      
      for (const queryStr of queries) {
        const query = encodeURIComponent(queryStr);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await response.json();
        
        if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
          const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail
            .replace('zoom=1', 'zoom=2')
            .replace('http://', 'https://');
          setBookCovers(prev => ({ ...prev, [bookId]: coverUrl }));
          return; // Нашли обложку, выходим
        }
      }
    } catch (error) {
      console.error('Error fetching book cover:', error);
    }
  };

  // Загружаем обложки для ВСЕХ книг без изображений через Google Books API
  useEffect(() => {
    libraryCategories.forEach(category => {
      category.books.forEach((book, index) => {
        // Загружаем обложку только если её нет в данных
        if (!book.coverImage) {
          setTimeout(() => {
            // Сначала пробуем через ISBN, если есть
            if (book.isbn) {
              fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}&maxResults=1`)
                .then(res => res.json())
                .then(data => {
                  if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
                    const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail
                      .replace('zoom=1', 'zoom=2')
                      .replace('http://', 'https://');
                    setBookCovers(prev => ({ ...prev, [book.id]: coverUrl }));
                  } else {
                    // Если через ISBN не нашли, пробуем через название и автора
                    fetchBookCover(book.id, book.title, book.author);
                  }
                })
                .catch(() => fetchBookCover(book.id, book.title, book.author));
            } else {
              // Если нет ISBN, ищем через название и автора
              fetchBookCover(book.id, book.title, book.author);
            }
          }, index * 200); // Задержка 200мс между запросами
        }
      });
    });
  }, []);

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleReadOnline = (bookTitle: string, author: string) => {
    const searchQuery = encodeURIComponent(`${bookTitle} ${author}`);
    window.open(`https://www.google.com/search?q=${searchQuery}+read+online+free`, '_blank');
  };

  const getBookDescription = (book: Book): string => {
    // Краткие описания для популярных книг
    const descriptions: Record<string, string> = {
      '1': 'Классика психологии трейдинга. Учит торговать без страха и жадности, фокусируясь на процессе, а не на результате.',
      '2': 'Фундаментальная работа о дисциплине в торговле. Как контролировать эмоции и следовать правилам.',
      '3': 'Практическое руководство по самокоучингу. Ежедневные упражнения для улучшения торговых результатов.',
      '4': 'Как развить профессиональные навыки трейдера. Методы повышения производительности.',
      '5': 'Психологические аспекты торговли. Как справиться со стрессом и эмоциями.',
      '6': 'Полное руководство по трейдингу от доктора Элдера. Стратегии, психология, управление капиталом.',
      '7': 'Реальные примеры входов и выходов из сделок. Учимся на опыте профессионалов.',
      '8': 'Современный подход к психологии трейдинга. Новейшие методы и техники.',
      '9': 'Психология рынка через призму аукционного рынка. Глубокое понимание поведения цены.',
      '10': 'Как правильно исполнять сделки. Разница между хорошей стратегией и хорошим исполнением.',
      '11': 'Парадоксальный подход: лучший проигравший выигрывает. Как принимать убытки правильно.',
      '12': 'Ментальное преимущество в торговле. Техники концентрации и фокуса.',
      '13': 'Интервью с легендарными трейдерами. Секреты успеха профессионалов.',
      '14': 'Продолжение серии Market Wizards. Новые истории успешных трейдеров.',
      '15': 'Истории трейдеров фондового рынка. Как они достигли успеха.',
      '16': 'Неизвестные мастера рынка. Скрытые истории успеха.',
      '17': 'Автобиографический роман о Джесси Ливерморе. Классика литературы о трейдинге.',
      '18': 'Как создать торговую систему под свой стиль. Персонализация стратегий.',
      '19': 'Как стать супер-трейдером. Путь от новичка к профессионалу.',
      '20': 'Одна хорошая сделка за раз. Философия качественной торговли.',
      '21': 'Полное руководство по техническому анализу. От основ до продвинутых техник.',
      '22': 'Дневная и свинг-торговля на валютном рынке. Стратегии для разных таймфреймов.',
      '23': 'Форекс для начинающих. Простое объяснение сложных концепций.',
      '24': 'Скальпинг на основе прайс экшн. Торговля на коротких таймфреймах.',
      '25': 'Как обойти дилера. Понимание механизмов рынка.',
      '26': 'Как зарабатывать на жизнь торговлей. Практические советы.',
      '27': 'Форекс для новичков. Пошаговое руководство.',
      '28': 'Руководство по бинарным опционам. Основы и стратегии.',
      '29': 'Разоблачение бинарных опционов. Правда о рынке.',
      '30': 'Торговля бинарными опционами. Профессиональный подход.',
      '31': 'Стратегии для бинарных опционов. Проверенные методы.',
      '32': 'Психология торговли бинарными опционами. Контроль эмоций.',
      '33': 'Математика управления деньгами. Формулы и расчёты.',
      '34': 'Формулы управления портфелем. Технические аспекты.',
      '35': 'Управление рисками в финансовых институтах. Профессиональный подход.',
      '36': 'Размер позиции. Как правильно рассчитывать ставки.',
      '37': 'Японские свечи. Классическая техника анализа.',
      '38': 'Торговля на основе прайс экшн. Чтение движения цены.',
      '39': 'Чтение графиков свеча за свечой. Детальный анализ.',
      '40': 'Энциклопедия графических паттернов. Все известные фигуры.',
      '41': 'Два режима мышления. Как мозг принимает решения.',
      '42': 'Поведенческая экономика. Почему люди действуют иррационально.',
      '43': 'Игры, в которые играют люди. Психология взаимодействия.',
      '44': 'Психология влияния. Как убеждать и защищаться от манипуляций.',
      '45': 'Атомные привычки. Как изменить жизнь маленькими шагами.',
      '46': 'Сила привычки. Почему мы делаем то, что делаем.',
      '47': 'Размышления Марка Аврелия. Философия стоицизма.',
      '48': 'Письма стоика. Мудрость Сенеки.',
      '49': 'Искусство войны. Стратегия и тактика.',
      '50': 'Антихрупкость. Как извлекать выгоду из хаоса.',
      '51': 'Одураченные случайностью. Роль удачи в успехе.',
    };
    return descriptions[book.id] || 'Классическая книга по трейдингу, которая поможет улучшить ваши навыки и понимание рынка.';
  };

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Библиотека</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Книги по трейдингу, психологии и управлению капиталом
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 glass-card neon-border mb-4 sm:mb-6 overflow-x-auto">
                {libraryCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="text-xs px-2 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary whitespace-nowrap"
                  >
                    {category.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {libraryCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="space-y-4">
                    {category.books && category.books.length > 0 ? category.books.map((book, bookIndex) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: bookIndex * 0.05 }}
                      >
                        <div className="glass-card rounded-xl p-3 sm:p-4 neon-border active:scale-[0.98] hover:scale-[1.01] transition-transform touch-manipulation">
                          <div className="flex gap-2 sm:gap-3 md:gap-4">
                            {/* Обложка книги */}
                            <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center overflow-hidden relative">
                              {(book.coverImage || bookCovers[book.id]) ? (
                                <img 
                                  src={book.coverImage || bookCovers[book.id]} 
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.book-fallback-icon') as HTMLElement;
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                    // Пытаемся загрузить через API если обложка не загрузилась
                                    if (!bookCovers[book.id] && book.isbn) {
                                      fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}&maxResults=1`)
                                        .then(res => res.json())
                                        .then(data => {
                                          if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
                                            const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail
                                              .replace('zoom=1', 'zoom=2')
                                              .replace('http://', 'https://');
                                            setBookCovers(prev => ({ ...prev, [book.id]: coverUrl }));
                                          }
                                        })
                                        .catch(() => {});
                                    }
                                  }}
                                />
                              ) : null}
                              <BookOpen className={`w-10 h-10 text-primary/50 book-fallback-icon ${(book.coverImage || bookCovers[book.id]) ? 'hidden' : ''}`} />
                            </div>

                            {/* Информация о книге */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-sm sm:text-base mb-1">
                                {book.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                                {book.author}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                                {getBookDescription(book)}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs sm:text-sm h-8 sm:h-9"
                                onClick={() => handleReadOnline(book.title, book.author)}
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Читать онлайн
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                        Книги не найдены
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                🐸 Built with 💚 for Академия здравого трейдера
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Library;

