import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/language-context';

function SubmitButton({ pending }) {
    const { t } = useLanguage();
    return (
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('signIn')}
        </Button>
    )
}

export default function LoginPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [email, setEmail] = React.useState('admin@example.com');
    const [password, setPassword] = React.useState('password');
    const [pending, setPending] = React.useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setPending(true);

        // Basic validation
        if (!email || !password) {
            toast({
                variant: 'destructive',
                title: t('loginFailed'),
                description: t('loginFailedDescription'),
            });
            setPending(false);
            return;
        }

        // For demo purposes, associate patient login with a specific patient ID
        if (email.startsWith('patient')) {
            document.cookie = `patientId=PAT002; max-age=86400; path=/`;
        }

        // Simulate async action
        setTimeout(() => {
            document.cookie = `currentUser=${email}; max-age=86400; path=/`;

            toast({
                title: t('loginSuccess'),
                description: t('welcomeBack'),
            });

            navigate('/dashboard');
        }, 1000);
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
           <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl w-full">
               <div className="text-white hidden md:block">
                    <h1 className="text-6xl font-bold text-yellow-400" style={{fontFamily: 'serif'}}>OctaCore</h1>
                    <p className="text-4xl mt-2 text-white" style={{fontFamily: 'serif'}}>{t('loginPage_tagline')}</p>
               </div>

                <Card className="w-full max-w-sm mx-auto shadow-2xl rounded-2xl">
                    <CardHeader className="p-0">
                        <img
                            src="https://picsum.photos/600/400"
                            alt="A professional optical shop with eyeglasses on display"
                            className="rounded-t-2xl object-cover w-full h-64"
                            data-ai-hint="optical shop"
                        />
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="p-6 grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('emailAddress')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    required
                                    className="bg-gray-100 border-gray-200 text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2 relative">
                                <Label htmlFor="password">{t('enterPassword')}</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    className="bg-gray-100 border-gray-200 text-black"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted-foreground">
                                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                            <SubmitButton pending={pending} />
                        </CardFooter>
                    </form>
                </Card>
           </div>
        </div>
    );
}
