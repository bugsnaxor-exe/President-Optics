


import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LogOut,
    PanelLeft,
    Music,
} from 'lucide-react';
import Logo from '@/components/logo';
import { ScrollArea } from './ui/scroll-area';
import { getCookie } from '@/lib/cookies';
import { CurrencySwitcher } from './currency-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { MusicPlayer } from './music-player';
import { ErrorBoundary } from './error-boundary';
import { LanguageSwitcher } from './language-switcher';
import { useLanguage } from '@/context/language-context';

export function AppLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const [userRole, setUserRole] = React.useState();
    const { t } = useLanguage();

    React.useEffect(() => {
        setUserRole(getCookie('userRole'));
    }, [pathname]);

    const handleLogout = () => {
        document.cookie = "currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "patientId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/');
    };

    if (pathname === '/') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="fixed top-0 flex h-16 w-full items-center gap-2 border-b bg-background/10 px-3 backdrop-blur-xl md:px-6 md:gap-4 z-50">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Logo />
                </nav>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="sm:hidden">
                            <PanelLeft className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs p-0">
                        <div className="flex h-16 items-center border-b px-6">
                            <Logo />
                        </div>
                        <ScrollArea className="h-[calc(100vh-120px)]">
                            <nav className="grid gap-6 text-lg font-medium p-4">

                            </nav>
                        </ScrollArea>
                        <div className="absolute bottom-0 w-full border-t p-4">
                            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                <LogOut className="mr-2 h-5 w-5" />
                                {t('logout')}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex items-center gap-2">
                        <LanguageSwitcher />
                        {userRole !== 'doctor' && userRole !== 'patient' && <CurrencySwitcher />}
                        <ThemeSwitcher />
                        {userRole === 'admin' && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Music className="h-[1.2rem] w-[1.2rem]" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-96 max-h-96 overflow-y-auto overflow-x-hidden" align="end">
                                    <ErrorBoundary fallback={<div className="p-4 text-center text-sm text-muted-foreground">Music player error</div>}>
                                        <MusicPlayer />
                                    </ErrorBoundary>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <Button variant="ghost" className="hidden md:flex" onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        {t('logout')}
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-8 p-4 pt-36 md:gap-8 md:p-10 lg:p-6 md:pt-44">
                {children}
            </main>
        </div>
    );
}
