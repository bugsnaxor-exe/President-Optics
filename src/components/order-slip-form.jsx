


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
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Search, Trash2, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';

const prescriptionDetailSchema = z.object({
    sph: z.coerce.number().optional(),
    cyl: z.coerce.number().optional(),
    axis: z.coerce.number().optional(),
    add: z.coerce.number().optional(),
});

const orderSlipSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required.'),
  customerPhone: z.string().min(1, 'Customer phone is required.'),
  prescription: z.object({
      rightEye: prescriptionDetailSchema,
      leftEye: prescriptionDetailSchema,
  }),
  frame: z.any().nullable(),
  lenses: z.array(z.any()),
});



export function OrderSlipForm({ products, onCreate }) {
    const { toast } = useToast();
    const [productSearch, setProductSearch] = React.useState('');

    const form = useForm({
        resolver: zodResolver(orderSlipSchema),
        defaultValues: {
            customerName: '',
            customerPhone: '',
            prescription: {
                rightEye: { sph: 0, cyl: 0, axis: 0, add: 0},
                leftEye: { sph: 0, cyl: 0, axis: 0, add: 0},
            },
            frame: null,
            lenses: [],
        }
    });

    const watchFrame = form.watch('frame');
    const watchLenses = form.watch('lenses');

    const handleAddProduct = (product) => {
        if (product.type === 'Eyewear') {
            if (watchFrame?.id === product.id) {
                 form.setValue('frame', null);
                 toast({ variant: 'destructive', title: 'Frame Removed'});
            } else {
                 form.setValue('frame', product);
                 toast({ title: 'Frame Selected', description: product.name});
            }
        } else {
            const currentLenses = form.getValues('lenses');
            const existingLensIndex = currentLenses.findIndex(l => l.id === product.id);
            if (existingLensIndex > -1) {
                form.setValue('lenses', currentLenses.filter(l => l.id !== product.id));
                toast({ variant: 'destructive', title: 'Lens/Service Removed'});
            } else {
                 form.setValue('lenses', [...currentLenses, product]);
                 toast({ title: 'Lens/Service Added', description: product.name});
            }
        }
    }

    const onSubmit = (data) => {
        if (!data.frame) {
            toast({ variant: 'destructive', title: 'Frame Required', description: 'Please select a frame to create an order slip.'});
            return;
        }
        
        const orderSlip = {
            id: `ORD-${Date.now()}`,
            orderDate: new Date().toISOString(),
            ...data
        }

        onCreate(orderSlip);
        toast({
            title: 'Order Slip Created',
            description: `Order for ${data.customerName} has been saved.`,
        });
        form.reset();
    };

    const renderPrescriptionInputs = (eye) => (
        <div className="grid grid-cols-4 gap-2">
            <Input {...form.register(`${eye}.sph`)} placeholder="SPH" type="number" step="0.25" className="text-center" />
            <Input {...form.register(`${eye}.cyl`)} placeholder="CYL" type="number" step="0.25" className="text-center" />
            <Input {...form.register(`${eye}.axis`)} placeholder="Axis" type="number" className="text-center" />
            <Input {...form.register(`${eye}.add`)} placeholder="Add" type="number" step="0.25" className="text-center" />
        </div>
    );
    
    const filteredProducts = React.useMemo(() => {
        if (!productSearch) return products;
        return products.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.brand?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [productSearch, products]);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle>Create New Order Slip</CardTitle>
                    <CardDescription>Fill in patient and prescription details to create an order slip.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 px-0">
                   <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" {...form.register('customerName')} />
                            {form.formState.errors.customerName && <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="customerPhone">Customer Phone</Label>
                            <Input id="customerPhone" {...form.register('customerPhone')} />
                             {form.formState.errors.customerPhone && <p className="text-sm text-destructive">{form.formState.errors.customerPhone.message}</p>}
                        </div>
                   </div>

                    <Separator />

                    <div>
                        <Label className="text-lg font-medium mb-2 block">Prescription Details</Label>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                           <div className="space-y-2">
                                <Label className="text-center block">Right Eye (OD)</Label>
                                {renderPrescriptionInputs('prescription.rightEye')}
                           </div>
                           <Separator orientation="vertical" className="h-16" />
                           <div className="space-y-2">
                                <Label className="text-center block">Left Eye (OS)</Label>
                                {renderPrescriptionInputs('prescription.leftEye')}
                           </div>
                        </div>
                    </div>

                     <Separator />

                      <div>
                        <Label className="text-lg font-medium">Selected Items</Label>
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                           <Card>
                                <CardHeader className="p-3">
                                    <CardTitle className="text-base">Frame</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                    {watchFrame ? (
                                        <div className="flex justify-between items-center">
                                            <p>{watchFrame.name}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => form.setValue('frame', null)}>
                                                <XCircle className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No frame selected.</p>
                                    )}
                                </CardContent>
                           </Card>
                            <Card>
                                <CardHeader className="p-3">
                                    <CardTitle className="text-base">Lenses & Services</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-2">
                                    {watchLenses.length > 0 ? (
                                        watchLenses.map(lens => (
                                            <div key={lens.id} className="flex justify-between items-center">
                                                <p>{lens.name}</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddProduct(lens)}>
                                                     <XCircle className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No lenses or services added.</p>
                                    )}
                                </CardContent>
                           </Card>
                        </div>
                      </div>

                     <Separator />

                      <div>
                        <Label className="text-lg font-medium">Available Products</Label>
                         <div className="relative my-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search for products or brands..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <ScrollArea className="h-64 rounded-md border">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.brand || 'N/A'}</TableCell>
                                            <TableCell><Badge variant="outline">{product.type}</Badge></TableCell>
                                            <TableCell>
                                                <Button size="sm" type="button" onClick={() => handleAddProduct(product)}>
                                                    { (product.type === 'Eyewear' && watchFrame?.id === product.id) || (watchLenses.some(l => l.id === product.id)) ? 'Remove' : 'Add'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter className="px-0">
                    <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />Create Order Slip</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
