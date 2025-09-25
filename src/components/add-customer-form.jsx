import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
});

export function AddCustomerForm({ onAddCustomer, initialData = null }) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      address: {
        city: initialData.address?.city || '',
        state: initialData.address?.state || ''
      },
    } : {
      name: '',
      email: '',
      phone: '',
      address: { city: '', state: '' },
    }
  });

  const onSubmit = (data) => {
    const customerData = {
      ...data,
      address: {
        city: data.address?.city || 'Unknown',
        state: data.address?.state || ''
      }
    };
    onAddCustomer(customerData);
    if (!isEditing) {
      toast({
        title: 'Customer Added',
        description: `${data.name} has been added to the system.`
      });
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="address.city" render={({ field }) => (
            <FormItem>
              <FormLabel>City (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., New York" {...field} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="address.state" render={({ field }) => (
            <FormItem>
              <FormLabel>State (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., NY" {...field} /></FormControl>
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">
            {isEditing ? (
              <>
                <Edit className="mr-2 h-4 w-4" /> Update Customer
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}