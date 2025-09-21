


import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CalendarIcon, PlusCircle, Trash2, ScanLine, Search, Upload, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useCurrency } from '@/context/currency-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import BarcodeScanner from './barcode-scanner';
import { ScrollArea } from './ui/scroll-area';
import { getProduct } from '@/lib/api';
import { Skeleton } from './ui/skeleton';
import PrescriptionScannerCamera from './prescription-scanner-camera';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const prescriptionDetailSchema = z.object({
    right: z.coerce.number().default(0),
    left: z.coerce.number().default(0),
});

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  productName: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unitPrice: z.coerce.number(), // This will be the base USD price
});

const invoiceFormSchema = z.object({
  // Customer Details
  patientName: z.string().min(1, "Customer name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  address: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
  }).optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),

  // Prescription Details
  prescription: z.object({
    sphere: prescriptionDetailSchema,
    cylinder: prescriptionDetailSchema,
    axis: prescriptionDetailSchema,
    add: prescriptionDetailSchema,
  }),

  // Invoice Details
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required."),
  total: z.number(), // This will be the base USD total
});



const InvoiceItemRow = ({ field, index, remove, control, register, formatCurrency, convertedValues, registerValue }) => {
    const unitPriceId = `form_item_unit_price_${field.id}`;
    const totalId = `form_item_total_${field.id}`;

    React.useEffect(() => {
        registerValue(unitPriceId, field.unitPrice);
        registerValue(totalId, field.unitPrice * field.quantity);
    }, [registerValue, unitPriceId, totalId, field.unitPrice, field.quantity]);

    const displayUnitPrice = convertedValues[unitPriceId] ?? field.unitPrice;
    const displayTotal = convertedValues[totalId] ?? (field.unitPrice * field.quantity);

    return (
        <TableRow>
            <TableCell className="font-medium">{field.productName}</TableCell>
            <TableCell>
                <Input
                    type="number"
                    {...register(`items.${index}.quantity`)}
                    className="text-center"
                />
            </TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(displayUnitPrice)}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(displayTotal)}</TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    )
}


export function InvoiceForm({ onCreate }) {
    const { toast } = useToast();
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [barcode, setBarcode] = React.useState('');
    const [isScannerOpen, setScannerOpen] = React.useState(false);
    const [productSearch, setProductSearch] = React.useState('');
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isScanning, setIsScanning] = React.useState(false);
    const [isCameraScannerOpen, setCameraScannerOpen] = React.useState(false);
    const fileInputRef = React.useRef(null);
    const [customers, setCustomers] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const prods = await getProduct();
            setProducts(prods);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const form = useForm({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            // Patient Details
            patientName: '',
            email: '',
            phone: '',
            address: { city: '', state: '' },
            insuranceProvider: '',
            insurancePolicyNumber: '',

            // Prescription Details
            prescription: {
                sphere: { right: 0, left: 0 },
                cylinder: { right: 0, left: 0 },
                axis: { right: 0, left: 0 },
                add: { right: 0, left: 0 },
            },

            // Invoice Details
            issueDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: [],
            total: 0,
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const watchItems = form.watch('items');

    const subtotal = React.useMemo(() => {
        return watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [watchItems]);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    React.useEffect(() => {
        form.setValue('total', total);
        registerValue('form_subtotal', subtotal);
        registerValue('form_tax', tax);
        registerValue('form_total', total);
    }, [total, subtotal, tax, form, registerValue]);

    const displaySubtotal = convertedValues['form_subtotal'] ?? subtotal;
    const displayTax = convertedValues['form_tax'] ?? tax;
    const displayTotal = convertedValues['form_total'] ?? total;


    const addProductToInvoice = (productToAdd) => {
        const existingItemIndex = fields.findIndex(item => item.productId === productToAdd.id);

        if (existingItemIndex > -1) {
            const currentItem = fields[existingItemIndex];
            update(existingItemIndex, {
                ...currentItem,
                quantity: currentItem.quantity + 1,
            });
            toast({ title: "Quantity Updated", description: `${productToAdd.name} quantity increased.`});
        } else {
            append({
                productId: productToAdd.id,
                productName: productToAdd.name,
                quantity: 1,
                unitPrice: productToAdd.price,
            });
            toast({ title: "Product Added", description: `${productToAdd.name} added to invoice.`});
        }
    }

    const handleBarcodeScan = (scannedBarcode) => {
        setBarcode(scannedBarcode);
        setScannerOpen(false);
        toast({ title: "Barcode Scanned", description: `Product ID: ${scannedBarcode}`});
        addProductByBarcode(scannedBarcode);
    };

    const addProductByBarcode = (targetBarcode) => {
        if (!targetBarcode) return;

        const product = products.find(p => p.id === targetBarcode);

        if (!product) {
            toast({ variant: 'destructive', title: "Product Not Found", description: `No product found with barcode: ${targetBarcode}`});
            return;
        }

        addProductToInvoice(product);
        setBarcode(''); // Clear input after adding
    };

    const filteredProducts = React.useMemo(() => {
        if (!productSearch) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.brand?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [productSearch, products]);

    const processPrescriptionScan = async () => {
        setIsScanning(true);
        toast({ title: 'AI Scanner activated...', description: 'Analyzing prescription. Please wait.' });

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsScanning(false);

        // Mocked successful result
        const mockResult = {
            patientName: 'John Doe (Scanned)',
            prescription: {
                sphere: { right: -2.5, left: -2.75 },
                cylinder: { right: -0.75, left: -0.5 },
                axis: { right: 90, left: 85 },
                add: { right: 1.25, left: 1.25 },
            }
        };

        toast({ title: 'Scan Successful!', description: 'Customer and prescription details have been populated.' });

        form.setValue('patientName', mockResult.patientName || '');
        form.setValue('prescription', mockResult.prescription);
    }

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await processPrescriptionScan();
    };

    const handleCameraCapture = async (dataUri) => {
        setCameraScannerOpen(false);
        await processPrescriptionScan();
    }

    const renderPrescriptionInputs = (eye, eyeLabel) => (
        <div className="space-y-2">
              <FormLabel className="text-center block text-muted-foreground">{eyeLabel}</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                  <FormField control={form.control} name={`prescription.sphere.${eye}`} render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="SPH" type="number" step="0.25" {...field} /></FormControl></FormItem>
                  )} />
                   <FormField control={form.control} name={`prescription.cylinder.${eye}`} render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="CYL" type="number" step="0.25" {...field} /></FormControl></FormItem>
                  )} />
                   <FormField control={form.control} name={`prescription.axis.${eye}`} render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="Axis" type="number" {...field} /></FormControl></FormItem>
                  )} />
                   <FormField control={form.control} name={`prescription.add.${eye}`} render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="Add" type="number" step="0.25" {...field} /></FormControl></FormItem>
                  )} />
              </div>
        </div>
    );


    const onSubmit = (data) => {
        console.log('Form submission started with data:', data);

        // Ensure we have at least one item
        if (!data.items || data.items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Items Required',
                description: 'Please add at least one item to the invoice.',
            });
            return;
        }

        // Create patient data
        const patientData = {
            name: data.patientName,
            email: data.email,
            phone: data.phone,
            address: {
                city: data.address?.city || 'Unknown',
                state: data.address?.state || ''
            },
            insuranceProvider: data.insuranceProvider || '',
            insurancePolicyNumber: data.insurancePolicyNumber || '',
            prescription: data.prescription,
            lastVisit: new Date().toISOString().split('T')[0],
            loyaltyPoints: 0,
            loyaltyTier: 'Bronze',
            shopId: 'SHOP001'
        };

        // Create invoice data
        const invoiceData = {
            patientId: `PAT-${Date.now()}`, // Generate patient ID
            patientName: data.patientName,
            issueDate: data.issueDate.toISOString(),
            dueDate: data.dueDate.toISOString(),
            items: data.items,
            total: data.total,
            shopId: 'SHOP001',
            status: 'Unpaid'
        };

        console.log('Creating patient with data:', patientData);
        console.log('Creating invoice with data:', invoiceData);

        try {
            // Here you would typically call APIs to create both patient and invoice
            // For now, we'll simulate the creation
            onCreate({ patient: patientData, invoice: invoiceData });

            toast({
                title: 'Invoice & Customer Created',
                description: `Invoice for ${data.patientName} has been successfully created.`,
            });

            // Reset form
            form.reset({
                patientName: '',
                email: '',
                phone: '',
                address: { city: '', state: '' },
                insuranceProvider: '',
                insurancePolicyNumber: '',
                prescription: {
                    sphere: { right: 0, left: 0 },
                    cylinder: { right: 0, left: 0 },
                    axis: { right: 0, left: 0 },
                    add: { right: 0, left: 0 },
                },
                issueDate: new Date(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                items: [],
                total: 0,
            });
        } catch (error) {
            console.error('Error creating invoice and patient:', error);
            toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: 'An error occurred while creating the invoice and customer. Please try again.',
            });
        }
    };

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96 mt-2" />
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                        <CardTitle>Create New Invoice</CardTitle>
                        <CardDescription>Fill out the form to generate a new invoice for a customer.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 px-0 overflow-hidden">

                        {/* Prescription Scanning Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="w-full">
                                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Scan Prescription from File
                            </Button>
                              <Dialog open={isCameraScannerOpen} onOpenChange={setCameraScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" disabled={isScanning} className="w-full">
                                        {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                                        Scan with Camera
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Scan Prescription</DialogTitle>
                                        <DialogDescription>Position the prescription within the frame and capture.</DialogDescription>
                                    </DialogHeader>
                                    <PrescriptionScannerCamera onCapture={handleCameraCapture} />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Separator />

                        <h3 className="text-lg font-medium text-center">Customer Details</h3>

                        {/* Customer Basic Information */}
                        <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                              <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><Input placeholder="555-123-4567" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="address.city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="e.g., Optic City" {...field} /></FormControl>
                                </FormItem>
                            )} />
                              <FormField control={form.control} name="address.state" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl><Input placeholder="e.g., CA" {...field} /></FormControl>
                                </FormItem>
                            )} />
                          </div>

                           <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Insurance Provider (Optional)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                </FormItem>
                            )} />
                              <FormField control={form.control} name="insurancePolicyNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Policy Number (Optional)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                </FormItem>
                            )} />
                          </div>

                        <Separator />

                        <h3 className="text-lg font-medium text-center">Customer Prescription Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderPrescriptionInputs('right', 'Right Eye (OD)')}
                            {renderPrescriptionInputs('left', 'Left Eye (OS)')}
                        </div>

                        <Separator />

                        <h3 className="text-lg font-medium text-center">Invoice Details</h3>

                        {/* Invoice Date Information */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Issue Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("justify-start text-left font-normal", !form.watch('issueDate') && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('issueDate') ? format(form.watch('issueDate'), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('issueDate')} onSelect={(d) => d && form.setValue('issueDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <Label>Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("justify-start text-left font-normal", !form.watch('dueDate') && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('dueDate') ? format(form.watch('dueDate'), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('dueDate')} onSelect={(d) => d && form.setValue('dueDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <Separator />

                        <h3 className="text-lg font-medium text-center">Invoice Items</h3>
    
                            {/* Invoice Items Section */}
                            <div>
                                <div className="grid sm:grid-cols-3 gap-2 my-4">
                                     <div className="sm:col-span-2 grid gap-2">
                                        <Label htmlFor="barcode-input">Add by Barcode</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="barcode-input"
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                placeholder="Scan or enter product barcode"
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
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="opacity-0 hidden sm:block">Add</Label>
                                        <Button type="button" className="w-full" onClick={() => addProductByBarcode(barcode)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                                        </Button>
                                    </div>
                                </div>
    
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="w-[100px]">Quantity</TableHead>
                                            <TableHead className="w-[150px] text-right">Unit Price</TableHead>
                                            <TableHead className="w-[150px] text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No items added yet.</TableCell></TableRow>}
                                        {fields.map((field, index) => (
                                             <InvoiceItemRow
                                                key={field.id}
                                                field={field}
                                                index={index}
                                                remove={remove}
                                                control={form.control}
                                                register={form.register}
                                                formatCurrency={formatCurrency}
                                                convertedValues={convertedValues}
                                                registerValue={registerValue}
                                             />
                                        ))}
                                    </TableBody>
                                 </Table>
                                 {form.formState.errors.items && <p className="text-sm text-destructive mt-2">{form.formState.errors.items.message || form.formState.errors.items?.root?.message}</p>}
                            </div>
    
                            <Separator />
    
                            <h3 className="text-lg font-medium text-center">Available Products</h3>
    
                            {/* Available Products Section */}
                            <div>
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
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="w-[80px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProducts.map(product => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>{product.brand || 'N/A'}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(convertedValues[`prod_price_${product.id}`] ?? product.price)}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" type="button" onClick={() => addProductToInvoice(product)}>Add</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
    
                            {/* Invoice Totals */}
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
                            <Button type="submit" disabled={isScanning}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Invoice & Customer
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        );

}
