


import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CalendarIcon, PlusCircle, Trash2, Bell, Ban, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useCurrency } from '@/context/currency-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { getAdmins, getAdminPaymentNotices } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

const paymentNoticeSchema = z.object({
  adminEmail: z.string().email("Please select a valid admin."),
  amountDue: z.coerce.number().min(1, "Amount must be greater than 0."),
  dueDate: z.date({ required_error: "A due date is required." }),
  lockOnExpire: z.boolean().default(false),
});

export default function AdminPaymentManager() {
    const { toast } = useToast();
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [notices, setNotices] = React.useState([]);
    const [admins, setAdmins] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const form = useForm({
        resolver: zodResolver(paymentNoticeSchema),
        defaultValues: {
            adminEmail: '',
            amountDue: 0,
            dueDate: new Date(),
            lockOnExpire: false
        }
    });

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [adminData, noticeData] = await Promise.all([
                getAdmins(),
                getAdminPaymentNotices()
            ]);
            setAdmins(adminData);
            setNotices(noticeData);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    React.useEffect(() => {
        notices.forEach(notice => {
            registerValue(`notice_amount_${notice.adminEmail}`, notice.amountDue);
        });
    }, [notices, registerValue]);

    const onSubmit = (data) => {
        const newNotice = {
            ...data,
            dueDate: data.dueDate.toISOString(),
            status: 'pending'
        };

        setNotices(prev => {
            const existingIndex = prev.findIndex(n => n.adminEmail === data.adminEmail);
            if (existingIndex > -1) {
                const updatedNotices = [...prev];
                updatedNotices[existingIndex] = newNotice;
                return updatedNotices;
            }
            return [newNotice, ...prev];
        });

        toast({
            title: 'Payment Notice Set',
            description: `A notice for ${data.adminEmail} has been created/updated.`
        });
        form.reset();
    };

    const removeNotice = (email) => {
        setNotices(prev => prev.filter(n => n.adminEmail !== email));
        toast({
            variant: 'destructive',
            title: 'Notice Removed',
            description: `The payment notice for ${email} has been removed.`
        });
    }

    const unlockNotice = async (email) => {
        setNotices(prev => prev.filter(n => n.adminEmail !== email));
        toast({
            title: 'Admin Unlocked',
            description: `The payment notice for ${email} has been removed and the admin portal is now unlocked.`
        });

        // Refresh the notices to ensure we have the latest data
        try {
            const updatedNotices = await getAdminPaymentNotices();
            setNotices(updatedNotices);
        } catch (error) {
            console.error('Error refreshing notices:', error);
        }
    }

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Set Payment Notice</CardTitle>
                    <CardDescription>Create or update a payment reminder for an admin.</CardDescription>
                </CardHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                             <Label>Admin User</Label>
                             <Select onValueChange={(value) => form.setValue('adminEmail', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an admin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {admins.map(admin => (
                                        <SelectItem key={admin.email} value={admin.email}>{admin.name} ({admin.email})</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                             {form.formState.errors.adminEmail && <p className="text-sm text-destructive">{form.formState.errors.adminEmail.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="amountDue">Amount Due</Label>
                            <Input id="amountDue" type="number" {...form.register('amountDue')} placeholder="e.g., 500" />
                            {form.formState.errors.amountDue && <p className="text-sm text-destructive">{form.formState.errors.amountDue.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label>Due Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !form.watch('dueDate') && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.watch('dueDate') ? format(form.watch('dueDate'), "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('dueDate')} onSelect={(d) => d && form.setValue('dueDate', d)} initialFocus /></PopoverContent>
                            </Popover>
                             {form.formState.errors.dueDate && <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="lock-on-expire" onCheckedChange={(checked) => form.setValue('lockOnExpire', checked)} />
                            <Label htmlFor="lock-on-expire">Lock portal if payment is overdue</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit"><Bell className="mr-2 h-4 w-4" />Set Notice</Button>
                    </CardFooter>
                </form>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Active Notices</CardTitle>
                    <CardDescription>A list of all currently active payment reminders.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admin</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Lock</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No active notices.</TableCell>
                                </TableRow>
                            )}
                            {notices.map(notice => (
                                <TableRow key={notice.adminEmail}>
                                    <TableCell className="font-medium">{notice.adminEmail}</TableCell>
                                    <TableCell>{formatCurrency(convertedValues[`notice_amount_${notice.adminEmail}`] ?? notice.amountDue)}</TableCell>
                                    <TableCell>{format(parseISO(notice.dueDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{notice.lockOnExpire ? <Ban className="h-4 w-4 text-destructive" /> : '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => unlockNotice(notice.adminEmail)}
                                                title="Unlock Admin Portal"
                                            >
                                                <Unlock className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeNotice(notice.adminEmail)}
                                                title="Delete Notice"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
    );
}
