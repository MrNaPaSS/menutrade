import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Скроллим вверх при изменении роута
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    
    // Также скроллим основной контейнер, если есть
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
    
    // Скроллим body, если нужно
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return null;
}


