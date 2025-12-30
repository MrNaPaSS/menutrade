import { useCallback, useState, useEffect } from 'react';
import { X, Upload, File, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64 } from '@/services/openRouterService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { canUploadPhoto, getRemainingPhotos, getLimitErrorMessage, isAdmin, getTodayPhotoCount } from '@/utils/uploadLimits';

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64
  thumbnail?: string;
}

interface FileUploadProps {
  files: FileData[];
  onFilesChange: (files: FileData[]) => void;
  maxSize?: number; // в байтах
  maxFiles?: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 МБ
const MAX_FILES = 5;

export function FileUpload({
  files,
  onFilesChange,
  maxSize = MAX_FILE_SIZE,
  maxFiles = MAX_FILES
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingPhotos, setRemainingPhotos] = useState(getRemainingPhotos());
  const [isAdminUser, setIsAdminUser] = useState(isAdmin());

  // Обновляем информацию о лимитах при монтировании и изменении файлов
  useEffect(() => {
    setRemainingPhotos(getRemainingPhotos());
    setIsAdminUser(isAdmin());
  }, [files]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Файл "${file.name}" слишком большой. Максимальный размер: ${(maxSize / 1024 / 1024).toFixed(0)} МБ`;
    }
    if (files.length >= maxFiles) {
      return `Максимум ${maxFiles} файлов`;
    }
    return null;
  };

  const processFile = async (file: File): Promise<FileData> => {
    const base64 = await fileToBase64(file);
    let thumbnail: string | undefined;

    // Создаем миниатюру для изображений
    if (file.type.startsWith('image/')) {
      thumbnail = base64;
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      thumbnail
    };
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setError(null);

    // Предварительная проверка лимита на фото для обычных пользователей
    if (!isAdminUser) {
      const imageFilesInList = Array.from(fileList).filter(f => f.type.startsWith('image/'));
      if (imageFilesInList.length > 0) {
        const todayPhotoCount = getTodayPhotoCount();
        const totalImagesAfter = todayPhotoCount + imageFilesInList.length;
        const MAX_PHOTOS = 3;

        if (totalImagesAfter > MAX_PHOTOS) {
          setError(`Достигнут дневной лимит загрузки фото (${MAX_PHOTOS} фото в день). Уже загружено: ${todayPhotoCount}. Попробуйте завтра.`);
          return;
        }
      }
    }

    const newFiles: FileData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);

      if (validationError) {
        errors.push(validationError);
        continue;
      }

      try {
        const processedFile = await processFile(file);
        newFiles.push(processedFile);
      } catch (err) {
        errors.push(`Ошибка обработки файла "${file.name}"`);
      }
    }

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange, maxSize, maxFiles, isAdminUser]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Сброс input
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-2 sm:p-3 md:p-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50",
          error && "border-destructive"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-foreground px-2">
              Перетащите файлы сюда или{' '}
              <label className="text-primary cursor-pointer hover:underline">
                выберите файл
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept="*/*"
                />
              </label>
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 px-2">
              Максимум {maxFiles} файлов, до {formatFileSize(maxSize)} каждый
              {!isAdminUser && (
                <span className="block mt-0.5">
                  Фото: {remainingPhotos > 0 ? `${remainingPhotos} из 3 осталось` : 'лимит исчерпан'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="glass-card rounded-lg p-1.5 sm:p-2 border border-border/30 flex items-center gap-1.5 sm:gap-2 min-w-[100px] sm:min-w-[120px] max-w-[180px] sm:max-w-[200px]">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 hover:bg-destructive/20 rounded touch-manipulation flex-shrink-0"
                  >
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

