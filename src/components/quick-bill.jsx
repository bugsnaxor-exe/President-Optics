
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Trash2, ScanLine, Search, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useCurrency } from '@/context/currency-context';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import BarcodeScanner from './barcode-scanner';
import { getProducts } from '@/lib/api';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

const quickBillItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.coerce.number().min(1, "Qty must be at least 1."),
  unitPrice: z.coerce.number(),
});

const quickBillSchema = z.object({
  items: z.array(quickBillItemSchema).min(1, "Please add at least one item to the bill."),
});

export default function QuickBill({ onBillGenerated }) {
    const { toast } = useToast();
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [barcode, setBarcode] = React.useState('');
    const [isScannerOpen, setScannerOpen] = React.useState(false);

    const form = useForm({
        resolver: zodResolver(quickBillSchema),
        defaultValues: {
            items: [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items"
    });

    React.useEffect(() => {
        getProducts().then(data => {
            setProducts(data);
            setIsLoading(false);
        });
    }, []);

    const watchItems = form.watch('items');

    const subtotal = React.useMemo(() => {
        return watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [watchItems]);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    React.useEffect(() => {
        registerValue('qb_subtotal', subtotal);
        registerValue('qb_tax', tax);
        registerValue('qb_total', total);
    }, [subtotal, tax, total, registerValue]);

    const displaySubtotal = convertedValues['qb_subtotal'] ?? subtotal;
    const displayTax = convertedValues['qb_tax'] ?? tax;
    const displayTotal = convertedValues['qb_total'] ?? total;

    const addProductToBill = (product) => {
        const existingItemIndex = fields.findIndex(item => item.productId === product.id);
        if (existingItemIndex > -1) {
            const currentItem = fields[existingItemIndex];
            update(existingItemIndex, { ...currentItem, quantity: currentItem.quantity + 1 });
            toast({ title: "Quantity Updated", description: `${product.name} quantity increased.` });
        } else {
            append({
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
            });
            toast({ title: "Product Added", description: `${product.name} added to the bill.` });
        }
    };

    const addProductByBarcode = (scannedBarcode) => {
        if (!scannedBarcode) return;
        const product = products.find(p => p.id === scannedBarcode);
        if (product) {
            addProductToBill(product);
            setBarcode(''); // Clear after adding
        } else {
            toast({ variant: 'destructive', title: "Product Not Found", description: `No product with barcode: ${scannedBarcode}` });
        }
    };
    
    const handleBarcodeScan = (scannedBarcode) => {
        setBarcode(scannedBarcode);
        setScannerOpen(false);
        addProductByBarcode(scannedBarcode);
    };

    const onSubmit = (data) => {
        const newInvoice = {
            id: `INV-${Date.now()}`,
            patientId: 'CUST-QUICKBILL',
            patientName: 'Walk-in Customer',
            issueDate: format(new Date(), 'yyyy-MM-dd'),
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            total: total,
            status: 'Paid',
            items: data.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            shopId: 'SHOP001', // Default shop
        };
        onBillGenerated(newInvoice);
        form.reset();
    };
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
             <Card className="border-none shadow-none bg-transparent">
                <CardContent className="grid gap-6 px-0">
                    <div className="grid gap-2">
                        <Label htmlFor="barcode-input">Scan Barcode or Search Product ID</Label>
                        <div className="flex gap-2">
                            <Input
                                id="barcode-input"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Scan or enter product ID to add to bill"
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProductByBarcode(barcode); }}}
                            />
                            <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" type="button" size="icon"><ScanLine className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <BarcodeScanner onScan={handleBarcodeScan} />
                                </DialogContent>
                            </Dialog>
                            <Button type="button" onClick={() => addProductByBarcode(barcode)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <Label className="text-lg font-medium">Current Bill</Label>
                        <div className="mt-4 rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="w-24 text-center">Qty</TableHead>
                                        <TableHead className="w-32 text-right">Price</TableHead>
                                        <TableHead className="w-32 text-right">Total</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                Scan a product to begin
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell className="font-medium">{field.productName}</TableCell>
                                                <TableCell>
                                                     <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => update(index, { ...field, quantity: Math.max(1, field.quantity - 1)})}
                                                            disabled={field.quantity <= 1}
                                                        >
                                                            <MinusCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            {...form.register(`items.${index}.quantity`)}
                                                            className="w-12 h-8 text-center"
                                                        />
                                                         <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => update(index, { ...field, quantity: field.quantity + 1})}
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{formatCurrency(convertedValues[`item_price_${field.id}`] ?? field.unitPrice)}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(convertedValues[`item_total_${field.id}`] ?? (field.unitPrice * field.quantity))}</TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {form.formState.errors.items && <p className="text-sm text-destructive mt-2">{form.formState.errors.items.message || form.formState.errors.items?.root?.message}</p>}
                    </div>

                     <div className="flex justify-end mt-4">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(displaySubtotal)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Tax (8%):</span>
                                <span className="font-medium">{formatCurrency(displayTax)}</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(displayTotal)}</span>
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="px-0">
                    <Button type="submit" size="lg">Generate & Print Bill</Button>
                </CardFooter>
            </Card>
        </form>
    )
}
