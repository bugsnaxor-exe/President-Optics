import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/app-layout';
import { CurrencyProvider } from '@/context/currency-context';
import { ThemeProvider } from 'next-themes';
import { BodyInjector } from '@/components/body-injector';
import { LanguageProvider } from '@/context/language-context';


export const metadata = {
  title: 'OctaCore',
  description: 'Professional optical billing and practice management software.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
            <BodyInjector>
                <LanguageProvider>
                    <CurrencyProvider>
                       <AppLayout>
                            {children}
                        </AppLayout>
                    </CurrencyProvider>
                </LanguageProvider>
                <Toaster />
            </BodyInjector>
        </ThemeProvider>
      </body>
    </html>
  );
}
