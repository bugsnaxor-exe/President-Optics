


import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

import { useCurrency } from '@/context/currency-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getInvoices } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

const InvoiceStatusTable = ({ title, invoices, formatCurrency, convertedValues, registerValue, isLoading }) => {
    
    React.useEffect(() => {
        invoices.forEach(invoice => {
            registerValue(`report_inv_${invoice.id}`, invoice.total);
        });
    }, [registerValue, invoices]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <h3 className="font-semibold">{title}</h3>
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (invoices.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map(invoice => (
                             <TableRow key={invoice.id}>
                                <TableCell>{invoice.patientName}</TableCell>
                                <TableCell>{invoice.dueDate}</TableCell>
                                <TableCell className="text-right">{formatCurrency(convertedValues[`report_inv_${invoice.id}`] ?? invoice.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export function InvoiceReport() {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [invoices, setInvoices] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const inv = await getInvoices();
            setInvoices(inv);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid');
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').slice(0, 5); // Show last 5 paid

    const handlePrint = async (action) => {
        const reportElement = document.getElementById('invoice-report-printable');
        if (!reportElement) return;

        setIsPrinting(true);
        toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

        reportElement.classList.add('print-styles');

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                windowHeight: reportElement.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            if (action === 'download') {
                pdf.save(`invoice_status_report.pdf`);
                toast({ title: 'PDF Downloaded', description: 'The report has been saved.' });
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
                toast({ title: 'Ready to Print', description: 'The report has been sent to the printer.' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            reportElement.classList.remove('print-styles');
            setIsPrinting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Invoice Status Report</CardTitle>
                    <CardDescription>An overview of all invoice statuses.</CardDescription>
                </div>
                <div className="flex items-center gap-2 print-hidden">
                    <Button variant="outline" size="sm" onClick={() => handlePrint('download')} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint('print')} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent id="invoice-report-printable" className="space-y-6">
                <InvoiceStatusTable
                    title="Overdue Invoices"
                    invoices={overdueInvoices}
                    formatCurrency={formatCurrency}
                    convertedValues={convertedValues}
                    registerValue={registerValue}
                    isLoading={isLoading}
                />
                 <InvoiceStatusTable
                    title="Unpaid Invoices (Not Yet Due)"
                    invoices={unpaidInvoices}
                    formatCurrency={formatCurrency}
                    convertedValues={convertedValues}
                    registerValue={registerValue}
                    isLoading={isLoading}
                />
                 <InvoiceStatusTable
                    title="Recently Paid Invoices"
                    invoices={paidInvoices}
                    formatCurrency={formatCurrency}
                    convertedValues={convertedValues}
                    registerValue={registerValue}
                    isLoading={isLoading}
                />
                 {!isLoading && (overdueInvoices.length + unpaidInvoices.length + paidInvoices.length) === 0 && (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md">
                        No invoice data to display.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
