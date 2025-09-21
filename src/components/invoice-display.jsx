


import * as React from 'react';

import Logo from '@/components/logo';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Download, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/currency-context';
import { Input } from './ui/input';
import { Label } from './ui/label';

const InvoiceItemRow = ({ item, index }) => {
    const { registerValue, convertedValues, formatCurrency } = useCurrency();
    const unitPriceId = `inv_item_unit_${index}`;
    const totalId = `inv_item_total_${index}`;
    const total = item.quantity * item.unitPrice;

    React.useEffect(() => {
        registerValue(unitPriceId, item.unitPrice);
        registerValue(totalId, total);
    }, [registerValue, unitPriceId, totalId, item.unitPrice, total]);

    const displayUnitPrice = convertedValues[unitPriceId] ?? item.unitPrice;
    const displayTotal = convertedValues[totalId] ?? total;

    return (
         <TableRow>
            <TableCell className="font-medium">{item.productName}</TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-right">{formatCurrency(displayUnitPrice)}</TableCell>
            <TableCell className="text-right">{formatCurrency(displayTotal)}</TableCell>
        </TableRow>
    )
}


export function InvoiceDisplay({ invoice }) {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [advancePaid, setAdvancePaid] = React.useState(0);
    const { formatCurrency, registerValue, convertedValues } = useCurrency();

    const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const subtotalId = `inv_sub_${invoice.id}`;
    const taxId = `inv_tax_${invoice.id}`;
    const totalId = `inv_tot_${invoice.id}`;
    
    // Advance paid is in INR
    const advancePaidInBase = advancePaid;

    React.useEffect(() => {
        registerValue(subtotalId, subtotal);
        registerValue(taxId, tax);
        registerValue(totalId, total);
    }, [registerValue, subtotal, tax, total, subtotalId, taxId, totalId]);

    const displaySubtotal = convertedValues[subtotalId] ?? subtotal;
    const displayTax = convertedValues[taxId] ?? tax;
    const displayTotal = convertedValues[totalId] ?? total;
    
    const amountDue = displayTotal - advancePaid;

    const handleAdvanceChange = (e) => {
        const valueInCurrentCurrency = parseFloat(e.target.value) || 0;
        setAdvancePaid(valueInCurrentCurrency);
    }


    const handlePrint = async (action) => {
        const invoiceElement = document.getElementById('invoice');
        if (!invoiceElement) return;

        setIsPrinting(true);
        toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
        
        // Add print-specific styles for PDF generation
        invoiceElement.classList.add('print-styles');
        
        try {
            const canvas = await html2canvas(invoiceElement, { 
                scale: 2,
                backgroundColor: '#ffffff',
                windowHeight: invoiceElement.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a5');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            if (action === 'download') {
                pdf.save(`invoice-${invoice.id}.pdf`);
                toast({ title: 'PDF Downloaded', description: 'The invoice has been saved.' });
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
                toast({ title: 'Ready to Print', description: 'The invoice has been sent to the printer.' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            // Remove print-specific styles after generation
            invoiceElement.classList.remove('print-styles');
            setIsPrinting(false);
        }
    };


    return (
        <div className="flex flex-col min-h-[60vh] max-h-[80vh]">
            <div id="invoice" className="flex-grow overflow-auto p-4 md:p-8 bg-card">
                 <header className="flex justify-between items-start mb-8">
                    <div className="flex flex-col items-center">
                        <Logo />
                        <p className="text-muted-foreground text-sm mt-2 text-center">
                            123 Visionary Ave, Optic City, 90210
                            <br />
                            contact@optivision.com | 555-123-4567
                        </p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-bold text-primary">INVOICE</h1>
                        <p className="text-muted-foreground font-mono">{invoice.id}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-2">BILL TO</h2>
                        <p className="font-bold text-lg">{invoice.patientName}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="grid grid-cols-2 gap-2">
                           <span className="font-semibold text-muted-foreground">Issue Date:</span>
                           <span>{invoice.issueDate}</span>
                           <span className="font-semibold text-muted-foreground">Due Date:</span>
                           <span>{invoice.dueDate}</span>
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Description</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item, index) => (
                           <InvoiceItemRow item={item} index={index} key={`${item.productId}-${index}`} />
                        ))}
                    </TableBody>
                </Table>

                 <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(displaySubtotal)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (8%):</span>
                            <span className="font-medium">{formatCurrency(displayTax)}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between text-xl font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(displayTotal)}</span>
                        </div>
                         <div className="flex justify-between items-center" id="advance-paid-container" data-value={formatCurrency(advancePaid)}>
                            <Label htmlFor="advance-paid" className="text-muted-foreground">Advance Paid:</Label>
                             <Input 
                                id="advance-paid" 
                                type="number" 
                                className="w-32 h-8 text-right"
                                value={advancePaid > 0 ? advancePaid.toFixed(2) : ''}
                                placeholder="0.00"
                                onChange={handleAdvanceChange}
                            />
                        </div>
                        <Separator />
                        <div className="flex justify-between text-xl font-bold text-green-400">
                            <span>Amount Due:</span>
                            <span>{formatCurrency(amountDue)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center text-sm text-muted-foreground">
                    <p>Thank you for your business! Please pay by the due date.</p>
                    <p>Payment can be made via card, cash, or bank transfer.</p>
                </div>
            </div>
            <div className="p-4 border-t flex justify-start gap-2 bg-muted/40 print-hidden">
                <Button variant="outline" onClick={() => handlePrint('download')} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                </Button>
                 <Button onClick={() => handlePrint('print')} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                    Print Invoice
                </Button>
            </div>
        </div>
    )
}
