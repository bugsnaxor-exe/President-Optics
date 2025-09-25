import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Edit, Trash2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { listCustomer, editCustomer, deleteCustomer } from "@/lib/api";
import { AddCustomerForm } from "./add-customer-form";
import { useToast } from "@/hooks/use-toast";

export default function CustomersList({ refreshTrigger }) {
  const { data: customers, loading, error, refetch } = useApi(listCustomer);
  const [editingCustomer, setEditingCustomer] = React.useState(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  console.log('CustomersList data:', { customers, loading, error });

  const handleEditCustomer = async (customerData) => {
    try {
      await editCustomer(editingCustomer.id, customerData);
      toast({
        title: 'Customer Updated',
        description: `${customerData.name} has been updated successfully.`
      });
      setIsEditOpen(false);
      setEditingCustomer(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update customer. Please try again.'
      });
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    try {
      await deleteCustomer(customerId);
      toast({
        title: 'Customer Deleted',
        description: `${customerName} has been deleted successfully.`
      });
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete customer. Please try again.'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Error loading customers: {error}</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customers?.customers?.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.phone} • {customer.email || 'No email'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {customer.address?.city || 'Unknown location'}
                  </p>
                  <Dialog open={isEditOpen && editingCustomer?.id === customer.id} onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) setEditingCustomer(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                        setEditingCustomer(customer);
                        setIsEditOpen(true);
                      }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>
                          Update the customer details below.
                        </DialogDescription>
                      </DialogHeader>
                      <AddCustomerForm
                        onAddCustomer={handleEditCustomer}
                        initialData={{
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone.toString(),
                          address: {
                            city: customer.address?.city || '',
                            state: customer.address?.state || ''
                          }
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {customer.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground">No customers found</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
