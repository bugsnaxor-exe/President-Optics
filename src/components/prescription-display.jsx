



import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';


export function PrescriptionDisplay({ patientName, prescription }) {
    return (
        <div>
            <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">Prescription for {patientName}</h3>
                <p className="text-sm text-muted-foreground">
                    Below are the detailed optical prescription values.
                </p>
            </div>
            <div className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead className="text-center">Sphere (SPH)</TableHead>
                            <TableHead className="text-center">Cylinder (CYL)</TableHead>
                            <TableHead className="text-center">Axis</TableHead>
                            <TableHead className="text-center">Add</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold text-muted-foreground">Right (OD)</TableCell>
                            <TableCell className="text-center">{prescription.sphere.right.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{prescription.cylinder.right.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{prescription.axis.right}</TableCell>
                            <TableCell className="text-center">{prescription.add.right.toFixed(2)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold text-muted-foreground">Left (OS)</TableCell>
                             <TableCell className="text-center">{prescription.sphere.left.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{prescription.cylinder.left.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{prescription.axis.left}</TableCell>
                            <TableCell className="text-center">{prescription.add.left.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
