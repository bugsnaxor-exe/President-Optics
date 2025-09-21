


import * as React from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { getCookie } from '@/lib/cookies';



const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
    </div>
)

export function PatientDetailsDisplay({ patient }) {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = React.useState(false);
    const userRole = getCookie('userRole');
    
    const handlePrint = async (action) => {
        const patientDetailsElement = document.getElementById('patient-details-printable');
        if (!patientDetailsElement) return;

        setIsPrinting(true);
        toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
        
        patientDetailsElement.classList.add('print-styles');
        
        try {
            const canvas = await html2canvas(patientDetailsElement, { 
                scale: 2,
                backgroundColor: '#ffffff',
                windowHeight: patientDetailsElement.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            if (action === 'download') {
                pdf.save(`patient-${patient.id}.pdf`);
                toast({ title: 'PDF Downloaded', description: `Details for ${patient.name} have been saved.` });
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
                toast({ title: 'Ready to Print', description: 'Patient details have been sent to the printer.' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            patientDetailsElement.classList.remove('print-styles');
            setIsPrinting(false);
        }
    };


    return (
        <div>
            <div id="patient-details-printable" className="p-1">
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact & Insurance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailItem label="Email" value={patient.email} />
                            <Separator />
                            <DetailItem label="Phone" value={patient.phone} />
                             <Separator />
                            <DetailItem label="Location" value={`${patient.address.city}, ${patient.address.state}`} />
                            <Separator />
                            <DetailItem label="Insurance Provider" value={patient.insuranceProvider} />
                            <Separator />
                            <DetailItem label="Policy Number" value={patient.insurancePolicyNumber} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Practice Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailItem label="Last Visit" value={patient.lastVisit} />
                            <Separator />
                            <div className="flex justify-between items-center py-2">
                                <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                                <Badge variant="secondary">{patient.loyaltyTier || 'Bronze'}</Badge>
                            </div>
                            <Separator />
                            <DetailItem label="Loyalty Points" value={patient.loyaltyPoints || 0} />
                        </CardContent>
                    </Card>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Optical Prescription</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead></TableHead>
                                            <TableHead className="text-center">Sphere (SPH)</TableHead>
                                            <TableHead className="text-center">Cylinder (CYL)</TableHead>
                                            <TableHead className="text-center">Axis</TableHead>
                                            <TableHead className="text-center">Add</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-semibold text-muted-foreground">Right (OD)</TableCell>
                                            <TableCell className="text-center">{patient.prescription.sphere.right.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.cylinder.right.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.axis.right}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.add.right.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-semibold text-muted-foreground">Left (OS)</TableCell>
                                            <TableCell className="text-center">{patient.prescription.sphere.left.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.cylinder.left.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.axis.left}</TableCell>
                                            <TableCell className="text-center">{patient.prescription.add.left.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
             </div>
             {userRole !== 'patient' && (
                <div className="p-4 border-t mt-4 flex justify-start gap-2 bg-muted/40 print-hidden">
                    <Button variant="outline" onClick={() => handlePrint('download')} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                    <Button onClick={() => handlePrint('print')} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Print Details
                    </Button>
                </div>
             )}
        </div>
    );
}
