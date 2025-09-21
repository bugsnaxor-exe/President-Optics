


import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Upload, Loader2, Camera, CalendarIcon, ScanLine, Search, Trash2 } from 'lucide-react';

import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import PrescriptionScannerCamera from './prescription-scanner-camera';
import { getProduct } from '@/lib/api';
import { useCurrency } from '@/context/currency-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const prescriptionDetailSchema = z.object({
    right: z.coerce.number().default(0),
    left: z.coerce.number().default(0),
});

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
  }).optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  prescription: z.object({
    sphere: prescriptionDetailSchema,
    cylinder: prescriptionDetailSchema,
    axis: prescriptionDetailSchema,
    add: prescriptionDetailSchema,
  }),
  // Invoice fields
  createInvoice: z.boolean().default(false),
  invoiceItems: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number(),
  })).optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
});

export function AddCustomerForm({ onAddCustomer }) {
    const { toast } = useToast();
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [isScanning, setIsScanning] = React.useState(false);
    const [isCameraScannerOpen, setCameraScannerOpen] = React.useState(false);
    const [products, setProducts] = React.useState([]);
    const [productSearch, setProductSearch] = React.useState('');
    const [barcode, setBarcode] = React.useState('');
    const [isScannerOpen, setScannerOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const fileInputRef = React.useRef(null);

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
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
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
            createInvoice: false,
            invoiceItems: [],
            issueDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "invoiceItems"
    });

    const watchItems = form.watch('invoiceItems');
    const watchCreateInvoice = form.watch('createInvoice');

    const subtotal = React.useMemo(() => {
        return watchItems?.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) || 0;
    }, [watchItems]);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    React.useEffect(() => {
        if (watchCreateInvoice) {
            registerValue('customer_form_subtotal', subtotal);
            registerValue('customer_form_tax', tax);
            registerValue('customer_form_total', total);
        }
    }, [total, subtotal, tax, watchCreateInvoice, registerValue]);

    const displaySubtotal = convertedValues['customer_form_subtotal'] ?? subtotal;
    const displayTax = convertedValues['customer_form_tax'] ?? tax;
    const displayTotal = convertedValues['customer_form_total'] ?? total;
    
    const processPrescriptionScan = async () => {
        setIsScanning(true);
        toast({ title: 'AI Scanner activated...', description: 'Analyzing prescription. Please wait.' });

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsScanning(false);
        
        // Mocked successful result
        const mockResult = {
            customerName: 'John Doe (Scanned)',
            prescription: {
                sphere: { right: -2.5, left: -2.75 },
                cylinder: { right: -0.75, left: -0.5 },
                axis: { right: 90, left: 85 },
                add: { right: 1.25, left: 1.25 },
            }
        };

        toast({ title: 'Scan Successful!', description: 'Customer and prescription details have been populated.' });

        form.setValue('name', mockResult.customerName || '');
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

    const onSubmit = (data) => {
        const customerData = {
            name: data.name,
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

        let result = { customer: customerData };

        if (data.createInvoice && data.invoiceItems && data.invoiceItems.length > 0) {
            const invoiceData = {
                patientId: `CUS-${Date.now()}`,
                patientName: data.name,
                issueDate: data.issueDate?.toISOString() || new Date().toISOString(),
                dueDate: data.dueDate?.toISOString() || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                items: data.invoiceItems,
                total: total,
                shopId: 'SHOP001',
                status: 'Unpaid'
            };
            result.invoice = invoiceData;
        }

        onAddCustomer(result);
        toast({
            title: data.createInvoice ? 'Customer & Invoice Created' : 'Customer Added',
            description: data.createInvoice
                ? `${data.name} has been added and an invoice has been created.`
                : `${data.name} has been added to the system.`
        });
        form.reset();
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

    const filteredProducts = React.useMemo(() => {
        if (!productSearch) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.brand?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [productSearch, products]);

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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="w-full">
                        {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Scan from File
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
                
                <h3 className="text-lg font-medium text-center">Or Enter Details Manually</h3>

                 <FormField
                     control={form.control}
                     name="name"
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

                 <h3 className="text-lg font-medium text-center">Prescription Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderPrescriptionInputs('right', 'Right Eye (OD)')}
                    {renderPrescriptionInputs('left', 'Left Eye (OS)')}
                 </div>

                 <Separator />

                 <div className="space-y-4">
                     <FormField
                         control={form.control}
                         name="createInvoice"
                         render={({ field }) => (
                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                 <FormControl>
                                     <Checkbox
                                         checked={field.value}
                                         onCheckedChange={field.onChange}
                                     />
                                 </FormControl>
                                 <div className="space-y-1 leading-none">
                                     <FormLabel>Create Invoice for this Customer</FormLabel>
                                     <p className="text-sm text-muted-foreground">
                                         Generate an invoice with products for this customer
                                     </p>
                                 </div>
                             </FormItem>
                         )}
                     />

                     {watchCreateInvoice && (
                         <div className="space-y-4">
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
                                             <TableRow key={field.id}>
                                                <TableCell className="font-medium">{field.productName}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        {...form.register(`invoiceItems.${index}.quantity`)}
                                                        className="text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(convertedValues[`customer_prod_price_${field.productId}`] ?? field.unitPrice)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(convertedValues[`customer_item_total_${field.id}`] ?? (field.quantity * field.unitPrice))}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {form.formState.errors.invoiceItems && <p className="text-sm text-destructive mt-2">{form.formState.errors.invoiceItems.message || form.formState.errors.invoiceItems?.root?.message}</p>}
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
                                                    <TableCell className="text-right">{formatCurrency(convertedValues[`customer_prod_price_${product.id}`] ?? product.price)}</TableCell>
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
                         </div>
                     )}
                 </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isScanning}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {watchCreateInvoice ? 'Create Customer & Invoice' : 'Add Customer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
