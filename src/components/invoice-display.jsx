


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

    const items = invoice.items || [];
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
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
            // Temporarily set fixed dimensions for PDF generation
            const originalHeight = invoiceElement.style.height;
            const originalOverflow = invoiceElement.style.overflow;
            invoiceElement.style.height = 'auto';
            invoiceElement.style.overflow = 'visible';

            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true,
                height: invoiceElement.scrollHeight,
                width: invoiceElement.scrollWidth
            });

            // Restore original styles
            invoiceElement.style.height = originalHeight;
            invoiceElement.style.overflow = originalOverflow;

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if content exceeds one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

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
                        <div className="mt-4 text-center">
                            <h2 className="font-bold text-lg">President Optics</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                123 Visionary Ave, Optic City, 90210
                                <br />
                                contact@optivision.com | 555-123-4567
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-bold text-primary mb-2">INVOICE</h1>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="font-semibold">Invoice #:</span> {invoice.id}</p>
                            <p className="text-sm"><span className="font-semibold">Date:</span> {invoice.issueDate}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-3 text-sm uppercase tracking-wide">Bill To</h2>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{invoice.patientName}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <h2 className="font-semibold text-muted-foreground mb-3 text-sm uppercase tracking-wide">Invoice Details</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between md:justify-end gap-4">
                                <span className="font-medium text-muted-foreground">Issue Date:</span>
                                <span className="font-medium">{invoice.issueDate}</span>
                            </div>
                            <div className="flex justify-between md:justify-end gap-4">
                                <span className="font-medium text-muted-foreground">Due Date:</span>
                                <span className="font-medium">{invoice.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="font-semibold text-muted-foreground mb-4 text-sm uppercase tracking-wide">Items</h2>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2">
                                <TableHead className="font-semibold">Item Description</TableHead>
                                <TableHead className="text-center font-semibold">Quantity</TableHead>
                                <TableHead className="text-right font-semibold">Unit Price</TableHead>
                                <TableHead className="text-right font-semibold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <InvoiceItemRow item={item} index={index} key={`${item.productId}-${index}`} />
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm">
                        <h2 className="font-semibold text-muted-foreground mb-4 text-sm uppercase tracking-wide">Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground font-medium">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(displaySubtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground font-medium">Tax (8%):</span>
                                <span className="font-medium">{formatCurrency(displayTax)}</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center py-3 text-lg font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(displayTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2" id="advance-paid-container" data-value={formatCurrency(advancePaid)}>
                                <Label htmlFor="advance-paid" className="text-muted-foreground font-medium">Advance Paid:</Label>
                                <Input
                                    id="advance-paid"
                                    type="number"
                                    className="w-32 h-8 text-right"
                                    value={advancePaid > 0 ? advancePaid.toFixed(2) : ''}
                                    placeholder="0.00"
                                    onChange={handleAdvanceChange}
                                />
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center py-3 text-lg font-bold text-green-600">
                                <span>Amount Due:</span>
                                <span>{formatCurrency(amountDue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <div className="border-t pt-8">
                        <p className="text-sm text-muted-foreground mb-2">Thank you for your business!</p>
                        <p className="text-xs text-muted-foreground">Payment is due within 30 days. Please make payments via card, cash, or bank transfer.</p>
                        <p className="text-xs text-muted-foreground mt-4">For any questions regarding this invoice, please contact us at contact@optivision.com</p>
                    </div>
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
