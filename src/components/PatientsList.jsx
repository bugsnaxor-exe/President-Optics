import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { getPatients } from "@/lib/api";

export default function PatientsList() {
    const { data: patients, loading, error } = useApi(getPatients);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patients
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
                    <p className="text-red-500">Error loading patients: {error}</p>
                ) : (
                    <div className="space-y-2">
                        {patients.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {p.phone} • {p.email}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last visit: {p.lastVisit || "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
