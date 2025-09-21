import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MinusCircle, Receipt } from 'lucide-react';
import { createCustomerWithInvoice, getProducts } from '@/lib/api';

const customerInvoiceSchema = z.object({
  // Customer Information
  customer: z.object({
    name: z.string().min(1, 'Customer name is required.'),
    email: z.string().email('Invalid email address.').optional().or(z.literal('')),
    phone: z.string().min(1, 'Phone number is required.'),
    address: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
    }).optional(),
  }),

  // Invoice Information
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer']).default('cash'),
  staffId: z.coerce.number().default(1),
  discount: z.coerce.number().min(0).default(0),

  // Invoice Items
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    productName: z.string().min(1, 'Product name is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  })).min(1, 'At least one item is required'),
});

export function CustomerInvoiceForm({ onInvoiceCreated }) {
  const { toast } = useToast();
  const [products, setProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(customerInvoiceSchema),
    defaultValues: {
      customer: {
        name: '',
        email: '',
        phone: '',
        address: { city: '', state: '' },
      },
      paymentMethod: 'cash',
      staffId: 1,
      discount: 0,
      items: [{
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
      }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const prods = await getProducts();
        setProducts(prods);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, []);

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.price);
    }
  };

  const calculateSubtotal = () => {
    const items = form.watch('items');
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = form.watch('discount') || 0;
    return Math.max(0, subtotal - discount);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const invoiceData = {
        customer: data.customer,
        items: data.items,
        paymentMethod: data.paymentMethod,
        staffId: data.staffId,
        paidAmount: 0, // Will be set to total for immediate payment
        discount: data.discount,
      };

      const result = await createCustomerWithInvoice(invoiceData);

      toast({
        title: 'Customer & Invoice Created',
        description: `Customer ${data.customer.name} and invoice created successfully.`
      });

      if (onInvoiceCreated) {
        onInvoiceCreated(result);
      }

      form.reset();
    } catch (error) {
      console.error('Error creating customer with invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create customer and invoice. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="max-h-[50vh]">
        <style dangerouslySetInnerHTML={{
          __html: `
            .invoice-form-scroll {
              scrollbar-width: thin;
              scrollbar-color: hsl(var(--primary) / 0.6) transparent;
            }
            .invoice-form-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .invoice-form-scroll::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 3px;
            }
            .invoice-form-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.4));
              border-radius: 3px;
              border: 1px solid hsl(var(--muted));
              transition: all 0.3s ease;
            }
            .invoice-form-scroll::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.6));
              transform: scaleX(1.2);
            }
            .invoice-form-scroll::-webkit-scrollbar-corner {
              background: transparent;
            }
          `
        }} />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-full overflow-y-auto invoice-form-scroll">
        {/* Customer Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl><Input placeholder="555-123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer.address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (Optional)</FormLabel>
                    <FormControl><Input placeholder="New York" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer.address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State (Optional)</FormLabel>
                    <FormControl><Input placeholder="NY" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          handleProductChange(index, value);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <div className="p-2 bg-muted rounded text-sm font-medium">
                      Subtotal: ${(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                productId: '',
                productName: '',
                quantity: 1,
                unitPrice: 0,
              })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${(form.watch('discount') || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Customer & Invoice'}
          </Button>
        </div>
      </form>
      </div>
    </Form>
  )
}