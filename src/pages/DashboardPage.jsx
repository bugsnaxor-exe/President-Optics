import PatientsList from "@/components/PatientsList";
import CustomersList from "@/components/CustomersList";
import PrescriptionsList from "@/components/PrescriptionsList";

function DashboardPage() {
  return (
    <div className="space-y-8">
      <PatientsList />
      <CustomersList />
      <PrescriptionsList />
    </div>
  );
}

export default DashboardPage;
