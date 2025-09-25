


import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Award, Star, TrendingUp, Gift, Download, Printer, Loader2, Gem, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { listCustomer as getPatients, editCustomer as updateCustomer } from '../lib/api';
import { Skeleton } from './ui/skeleton';
import Logo from './logo';


const tierStyles = {
    Bronze: {
      card: 'bg-gradient-to-br from-[#4b2f1c] via-[#5c3c26] to-[#4b2f1c]',
      text: 'text-amber-100',
      icon: Award,
      holographic: 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600',
    },
    Silver: {
      card: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-600',
      text: 'text-slate-100',
      icon: ShieldCheck,
      holographic: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500',
    },
    Gold: {
      card: 'bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-600',
      text: 'text-yellow-100',
      icon: Star,
      holographic: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
    },
    Platinum: {
      card: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black',
      text: 'text-indigo-100',
      icon: Gem,
      holographic: 'bg-gradient-to-br from-fuchsia-400 via-violet-500 to-sky-400',
    },
};


const rewards = [
    { points: 2000, description: 'Free Comprehensive Eye Exam' },
    { points: 1500, description: '50% off any pair of frames' },
    { points: 1000, description: '15% off total purchase' },
    { points: 500, description: '₹10 off contact lenses' },
];

const getLoyaltyTier = (points) => {
    if (points >= 3000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
};

function MembershipCard({ patient }) {
    const tier = patient.loyaltyTier || 'Bronze';
    const styles = tierStyles[tier];
    const Icon = styles.icon;

    return (
        <div 
            id={`loyalty-card-${patient.id}`} 
            className={cn(
                "rounded-xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]", 
                styles.card
            )}
        >
            {/* Subtle background pattern */}
            <div 
                className="absolute inset-0 opacity-[0.03]" 
                style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
            />
            
            <div className="relative z-10">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Icon className={cn("w-6 h-6", styles.text)} />
                        <p className="font-semibold tracking-wider uppercase text-sm">{patient.loyaltyTier} Member</p>
                    </div>
                    <div className="font-bold text-lg" style={{fontFamily: 'serif'}}>OctaCore</div>
                 </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-end justify-between">
                     <div>
                        <p className="font-mono tracking-widest text-lg opacity-90">{patient.name}</p>
                         <p className="text-2xl font-bold">{patient.loyaltyPoints || 0} Points</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className={cn("w-10 h-8 rounded-md", styles.holographic)} />
                        <p className="text-[8px] font-mono tracking-widest opacity-70">PREMIUM</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function LoyaltyManagement() {
    const { toast } = useToast();
    const [patientList, setPatientList] = React.useState([]);
    const [pointsToAdd, setPointsToAdd] = React.useState({});
    const [isPrinting, setIsPrinting] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const data = await getPatients();
            const patients = (data.customers || data).map(p => ({
                ...p,
                loyaltyTier: p.loyaltyTier || getLoyaltyTier(p.loyaltyPoints || 0)
            }));
            setPatientList(patients);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const handleAddPoints = async (patientId) => {
        const points = pointsToAdd[patientId];
        if (!points || points <= 0 || isNaN(points)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Points',
                description: 'Please enter a positive number of points to add.'
            });
            return;
        }

        const patientName = patientList.find(p => p.id === patientId)?.name;

        const newPoints = (patientList.find(p => p.id === patientId)?.loyaltyPoints || 0) + points;
        const newTier = getLoyaltyTier(newPoints);

        setPatientList(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, loyaltyPoints: newPoints, loyaltyTier: newTier };
            }
            return p;
        }));

        setPointsToAdd(prev => ({...prev, [patientId]: 0}));

        try {
            await updateCustomer(patientId, { loyaltyPoints: newPoints, loyaltyTier: newTier });
            toast({
                title: "Points Added",
                description: `Successfully added ${points} points to ${patientName}.`
            });
        } catch (error) {
            console.error('Error updating customer:', error);
            // Revert the state if update fails
            setPatientList(prev => prev.map(p => {
                if (p.id === patientId) {
                    const oldPoints = (p.loyaltyPoints || 0) - points;
                    return { ...p, loyaltyPoints: oldPoints, loyaltyTier: getLoyaltyTier(oldPoints) };
                }
                return p;
            }));
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Failed to save points. Please try again.'
            });
        }
    };
    
    const handlePrint = async (action, patient) => {
        const cardElement = document.getElementById(`loyalty-card-${patient.id}`);
        if (!cardElement) return;

        setIsPrinting(patient.id);
        toast({ title: 'Generating Card...', description: 'Please wait a moment.' });
        
        // Temporarily clone and style for accurate PDF generation
        const clone = cardElement.cloneNode(true);
        clone.style.width = '350px'; // A fixed width for consistent output
        clone.style.height = '220px';
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        document.body.appendChild(clone);
        
        try {
            const canvas = await html2canvas(clone, { 
                scale: 3, // Higher scale for better quality
                backgroundColor: null, // Use element's background
            });
            const imgData = canvas.toDataURL('image/png');

            // Create a PDF with dimensions similar to a credit card
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.60, 53.98]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

            if (action === 'download') {
                pdf.save(`loyalty-card-${patient.name.replace(' ','_')}.pdf`);
                toast({ title: 'PDF Downloaded', description: 'The loyalty card has been saved.' });
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
                toast({ title: 'Ready to Print', description: 'The loyalty card has been sent to the printer.' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            document.body.removeChild(clone);
            setIsPrinting(null);
        }
    };


    if (isLoading) {
        return (
             <div className="space-y-8">
                <CardHeader className="px-0">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <CardHeader className="px-0">
                <CardTitle>Patient Loyalty Program</CardTitle>
                <CardDescription>Manage patient loyalty points and view their status and available rewards.</CardDescription>
            </CardHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {patientList.map(patient => {
                     const patientPoints = patient.loyaltyPoints || 0;
                     const availableRewards = rewards.filter(r => patientPoints >= r.points);

                     return (
                        <Card key={patient.id} className="flex flex-col">
                            <CardHeader>
                                <MembershipCard patient={patient} />
                            </CardHeader>
                            <CardContent className="flex-grow space-y-6">
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Available Rewards</h4>
                                    {availableRewards.length > 0 ? (
                                         <ul className="space-y-2">
                                            {availableRewards.map(reward => (
                                                <li key={reward.points} className="flex items-center gap-3 text-sm p-2 rounded-md bg-secondary/30">
                                                    <Gift className="h-5 w-5 text-primary" />
                                                    <span><span className="font-bold">{reward.points.toLocaleString()} pts:</span> {reward.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">Not enough points for any rewards yet.</p>
                                    )}
                                </div>
                                 <div>
                                     <h4 className="font-semibold text-lg mb-2">Add Points</h4>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="e.g., 50" 
                                            value={pointsToAdd[patient.id] || ''}
                                            onChange={(e) => setPointsToAdd(prev => ({...prev, [patient.id]: parseInt(e.target.value, 10)}))}
                                        />
                                        <Button onClick={() => handleAddPoints(patient.id)}>Add</Button>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handlePrint('download', patient)} disabled={isPrinting === patient.id}>
                                    {isPrinting === patient.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handlePrint('print', patient)} disabled={isPrinting === patient.id}>
                                    {isPrinting === patient.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                                    Print
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

    
