


import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PrescriptionDisplay } from './prescription-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getPatients } from '@/lib/api';

import { Skeleton } from './ui/skeleton';

export function PrescriptionList() {
    const [patients, setPatients] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const data = await getPatients();
            setPatients(data.patients || []);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Prescriptions</CardTitle>
                <CardDescription>A list of all patients and their current optical prescriptions.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {patients.map(patient => (
                            <AccordionItem value={patient.id} key={patient.id}>
                                <AccordionTrigger>{patient.name}</AccordionTrigger>
                                <AccordionContent>
                                    <PrescriptionDisplay patientName={patient.name} prescription={patient.prescription} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
                {!isLoading && patients.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        No patients found in the system.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
