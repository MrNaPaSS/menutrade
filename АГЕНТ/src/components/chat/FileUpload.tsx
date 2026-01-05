import { useCallback, useState } from 'react';
import { X, Upload, Image as ImageIcon, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64, type FileData } from '@/services/aiService';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    files: FileData[];
    onFilesChange: (files: FileData[]) => void;
    maxSize?: number;
    maxFiles?: number;
    compact?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 5;

export function FileUpload({
    files,
    onFilesChange,
    maxSize = MAX_FILE_SIZE,
    maxFiles = MAX_FILES,
    compact = false,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): string | null => {
        if (file.size > maxSize) {
            return `Файл "${file.name}" слишком большой. Макс: ${(maxSize / 1024 / 1024).toFixed(0)} МБ`;
        }
        if (files.length >= maxFiles) {
            return `Максимум ${maxFiles} файлов`;
        }
        return null;
    };

    const processFile = async (file: File): Promise<FileData> => {
        const base64 = await fileToBase64(file);
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
            thumbnail: file.type.startsWith('image/') ? base64 : undefined,
        };
    };

    const handleFiles = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) return;

            setError(null);
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
                } catch {
                    errors.push(`Ошибка обработки файла "${file.name}"`);
                }
            }

            if (errors.length > 0) {
                setError(errors[0]);
            }

            if (newFiles.length > 0) {
                onFilesChange([...files, ...newFiles]);
            }
        },
        [files, onFilesChange, maxSize, maxFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFiles(e.target.files);
            e.target.value = '';
        },
        [handleFiles]
    );

    const removeFile = useCallback(
        (index: number) => {
            const newFiles = files.filter((_, i) => i !== index);
            onFilesChange(newFiles);
        },
        [files, onFilesChange]
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} Б`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
        return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
    };

    // Компактный режим (только для отображения миниатюр)
    if (compact) {
        return (
            <div className="space-y-2">
                <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload-compact"
                    onChange={handleFileInput}
                    accept="image/*"
                />

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
                                    <div className="glass-card rounded-lg p-1.5 border border-white/10 flex items-center gap-2 max-w-[150px]">
                                        {file.thumbnail ? (
                                            <img
                                                src={file.thumbnail}
                                                alt={file.name}
                                                className="w-10 h-10 object-cover rounded flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <File className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-medium truncate text-white/80">
                                                {file.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                        >
                                            <X className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{error}</div>
                )}
            </div>
        );
    }

    // Полный режим с drag & drop
    return (
        <div className="space-y-2">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-xl p-4 transition-colors text-center',
                    isDragging ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50',
                    error && 'border-red-500'
                )}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <div>
                        <p className="text-sm text-white/80">
                            Перетащите файлы или{' '}
                            <label className="text-primary cursor-pointer hover:underline">
                                выберите
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInput}
                                    accept="image/*"
                                />
                            </label>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Макс. {maxFiles} файлов, до {formatFileSize(maxSize)} каждый
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</div>
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
                                <div className="glass-card rounded-lg p-2 border border-white/10 flex items-center gap-2 min-w-[120px] max-w-[200px]">
                                    {file.thumbnail ? (
                                        <img
                                            src={file.thumbnail}
                                            alt={file.name}
                                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                                    >
                                        <X className="w-3 h-3 text-red-400" />
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
