


import * as React from 'react';

import Logo from '@/components/logo';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Download, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function OrderSlipDisplay({ orderSlip }) {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = React.useState(false);

    const handlePrint = async (action) => {
        const orderSlipElement = document.getElementById('order-slip');
        if (!orderSlipElement) return;

        setIsPrinting(true);
        toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
        
        orderSlipElement.classList.add('print-styles');
        
        try {
            const canvas = await html2canvas(orderSlipElement, {
                 scale: 2,
                 backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a5');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            if (action === 'download') {
                pdf.save(`order-slip-${orderSlip.id}.pdf`);
                toast({ title: 'PDF Downloaded', description: 'The order slip has been saved.' });
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
                toast({ title: 'Ready to Print', description: 'The order slip has been sent to the printer.' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            orderSlipElement.classList.remove('print-styles');
            setIsPrinting(false);
        }
    };

    const renderPrescriptionRow = (eye, label) => {
        const data = orderSlip.prescription[eye];
        return (
            <TableRow>
                <TableCell className="font-semibold">{label}</TableCell>
                <TableCell className="text-center">{data.sph?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-center">{data.cyl?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-center">{data.axis || '-'}</TableCell>
                <TableCell className="text-center">{data.add?.toFixed(2) || '-'}</TableCell>
            </TableRow>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div id="order-slip" className="flex-grow overflow-auto p-6 bg-card">
                 <header className="flex justify-between items-start mb-6">
                    <div>
                        <Logo />
                        <p className="text-muted-foreground text-xs mt-1">
                            123 Visionary Ave, Optic City, 90210
                        </p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-primary">LAB ORDER SLIP</h1>
                        <p className="text-muted-foreground text-xs font-mono">{orderSlip.id}</p>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="space-y-1">
                        <p><span className="font-semibold">Patient:</span> {orderSlip.customerName}</p>
                        <p><span className="font-semibold">Phone:</span> {orderSlip.customerPhone}</p>
                    </div>
                    <div className="space-y-1 text-right">
                         <p><span className="font-semibold">Order Date:</span> {format(new Date(orderSlip.orderDate), 'PPP')}</p>
                    </div>
                </div>

                <Separator className="my-4" />

                <h2 className="font-bold text-lg mb-2">Prescription Details</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Eye</TableHead>
                            <TableHead className="text-center">SPH</TableHead>
                            <TableHead className="text-center">CYL</TableHead>
                            <TableHead className="text-center">Axis</TableHead>
                            <TableHead className="text-center">Add</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderPrescriptionRow('rightEye', 'Right (OD)')}
                        {renderPrescriptionRow('leftEye', 'Left (OS)')}
                    </TableBody>
                </Table>

                 <Separator className="my-4" />

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h2 className="font-bold text-lg mb-2">Frame Details</h2>
                        <div className="text-sm p-3 border rounded-md bg-muted/30">
                            <p><span className="font-semibold">Brand:</span> {orderSlip.frame?.brand || 'N/A'}</p>
                            <p><span className="font-semibold">Model:</span> {orderSlip.frame?.name}</p>
                            <p><span className="font-semibold">ID:</span> {orderSlip.frame?.id}</p>
                        </div>
                    </div>
                    <div>
                         <h2 className="font-bold text-lg mb-2">Lens & Service Details</h2>
                         <ul className="text-sm p-3 border rounded-md bg-muted/30 list-disc list-inside">
                             {orderSlip.lenses.map(lens => (
                                 <li key={lens.id}>{lens.name}</li>
                             ))}
                             {orderSlip.lenses.length === 0 && <li className="list-none">No special lenses or services.</li>}
                         </ul>
                    </div>
                 </div>

                 <div className="mt-8 text-center text-xs text-muted-foreground">
                    <p>-- FOR LAB USE ONLY --</p>
                 </div>
            </div>
            <div className="p-4 border-t flex justify-start gap-2 bg-muted/40 print-hidden">
                <Button variant="outline" onClick={() => handlePrint('download')} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                </Button>
                 <Button onClick={() => handlePrint('print')} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                    Print Order
                </Button>
            </div>
        </div>
    )
}
