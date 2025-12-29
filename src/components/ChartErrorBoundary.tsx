import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку для отладки
    console.error('Chart component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            'glass-card rounded-xl p-6 neon-border bg-destructive/10 border-destructive/30',
            this.props.className
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <h3 className="font-semibold text-destructive">Ошибка загрузки графика</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Не удалось отобразить интерактивный график. Продолжайте изучение урока.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-xs text-muted-foreground">
              <summary className="cursor-pointer mb-2">Детали ошибки (только в разработке)</summary>
              <pre className="bg-muted p-2 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

