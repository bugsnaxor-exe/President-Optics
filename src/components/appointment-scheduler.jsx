


import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { addDays, format, isSameDay, parseISO, isAfter } from 'date-fns';

import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { getAppointments } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

const appointmentSchema = z.object({
    patientName: z.string().min(1, "Please enter a customer name."),
    date: z.date({ required_error: "Please select a date."}),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
});

export function AppointmentScheduler() {
    const { toast } = useToast();
    const [appointments, setAppointments] = React.useState([]);
    const [date, setDate] = React.useState(new Date());
    const [isLoading, setIsLoading] = React.useState(true);

    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patientName: '',
            date: new Date(),
            time: '10:00',
        }
    });

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const app = await getAppointments();
            setAppointments(app);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const selectedDayAppointments = appointments.filter(a => date && isSameDay(parseISO(a.date), date));

    const upcomingAppointments = appointments
        .filter(a => isAfter(parseISO(a.date), new Date()) || format(parseISO(a.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
        .sort((a, b) => parseISO(a.date) - parseISO(b.date))
        .slice(0, 10); // Show next 10 appointments
    
    const onSubmit = (data) => {
        const newAppointment = {
            id: `APP-${Date.now()}`,
            patientId: `PAT-${Date.now()}`, // temp id
            patientName: data.patientName,
            doctorName: 'General Staff', // default doctor
            date: format(data.date, 'yyyy-MM-dd'),
            time: data.time,
            status: 'Scheduled',
            shopId: 'SHOP001' // default shop
        }

        setAppointments(prev => [...prev, newAppointment]);
        toast({ title: "Appointment Scheduled", description: `Booked for ${data.patientName}.`});
        form.reset();
    }

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 grid gap-8">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div>
                    <Skeleton className="h-[450px] w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 grid gap-8">
                 <div>
                    <h3 className="text-lg font-medium mb-4">Appointment Calendar</h3>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        components={{
                            DayContent: (props) => {
                                const hasAppointment = appointments.some(a => isSameDay(parseISO(a.date), props.date));
                                return (
                                    <div className="relative">
                                        <p>{format(props.date, 'd')}</p>
                                        {hasAppointment && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />}
                                    </div>
                                )
                            }
                        }}
                    />
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Appointments for {date ? format(date, 'PPP') : '...'}</CardTitle>
                        <CardDescription>A list of all scheduled appointments for the selected day.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {selectedDayAppointments.length > 0 ? (
                            <ul className="space-y-3">
                                {selectedDayAppointments.map((app) => (
                                    <li key={app.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                       <div>
                                            <p className="font-semibold">{app.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{app.time} with {app.doctorName}</p>
                                       </div>
                                        <Badge>{app.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No appointments scheduled for this day.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Appointments Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <CardDescription>Next scheduled appointments for customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingAppointments.length > 0 ? (
                            <ul className="space-y-4">
                                {upcomingAppointments.map((app, i) => (
                                    <li key={i} className="flex items-center justify-between p-4 rounded-md bg-muted/50">
                                        <div>
                                            <p className="font-semibold">{app.patientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(app.date), 'PPP')} at {app.time}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Doctor: {app.doctorName}</p>
                                        </div>
                                        <Badge>{app.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No upcoming appointments scheduled.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Book Appointment</CardTitle>
                        <CardDescription>Fill out the form to book a new appointment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                               <FormField
                                    control={form.control}
                                    name="patientName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Patient Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter customer's name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                         <Button
                                                            variant={"outline"}
                                                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                 <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time (HH:MM)</FormLabel>
                                            <FormControl><Input placeholder="14:30" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full !mt-6"><PlusCircle className="mr-2 h-4 w-4" /> Book Appointment</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
