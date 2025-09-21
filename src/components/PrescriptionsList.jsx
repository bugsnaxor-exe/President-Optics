import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { getPrescriptions } from "@/lib/api";

export default function PrescriptionsList() {
    const { data, loading, error } = useApi(() => getPrescriptions({ page: 1, limit: 10 }));
    const prescriptions = data?.prescriptions || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Prescriptions
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
                    <p className="text-red-500">Error loading prescriptions: {error}</p>
                ) : (
                    <div className="space-y-2">
                        {prescriptions.map((pr) => (
                            <div
                                key={pr.id}
                                className="p-3 border rounded-md hover:bg-accent/50 transition-colors"
                            >
                                <p className="font-medium">
                                    Patient: {pr.patient?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Right Eye: {pr.rightEye?.sph}/{pr.rightEye?.cyl} × {pr.rightEye?.axis}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Left Eye: {pr.leftEye?.sph}/{pr.leftEye?.cyl} × {pr.leftEye?.axis}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
