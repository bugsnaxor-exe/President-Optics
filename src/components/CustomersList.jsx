import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { getCustomers } from "@/lib/api";

export default function CustomersList() {
  const { data: customers, loading, error } = useApi(getCustomers);

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
          <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground">
                  {customer.address?.city || 'Unknown location'}
                </p>
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
