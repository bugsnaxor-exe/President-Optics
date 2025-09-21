


import { useTheme } from '@/components/ThemeProvider';
import { useEffect } from 'react';

export function BodyInjector({ children }) {
    const { theme } = useTheme();

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(theme || 'dark');
        document.body.classList.add('font-body');
        document.body.classList.add('antialiased');
    }, [theme]);
    
    return <>{children}</>;
}
