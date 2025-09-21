
'use client';

import * as React from 'react';
import {
  Activity,
  DollarSign,
  Receipt,
  Users,
  FileText,
  BookUser,
  Star,
  ClipboardList,
  LifeBuoy,
  Zap,
  Package,
  Boxes,
  LineChart,
  LayoutDashboard,
  Briefcase,
  Calendar,
  PlusCircle,
  AlertTriangle,
  Timer,
  LogOut,
  Printer,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPin,
  HelpCircle,
  Phone,
  Book,
  ExternalLink,
  Wallet,
  PackageSearch,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import AuditReport from '@/components/audit-report';
import { Badge } from '@/components/ui/badge';
import { getCookie } from '@/lib/cookies';
import { useCurrency } from '@/context/currency-context';
import { CorrespondenceAssistant } from '@/components/correspondence-assistant';
import { InvoiceDisplay } from '@/components/invoice-display';
import { LoyaltyManagement } from '@/components/loyalty-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AddProductForm } from '@/components/add-product-form';
import { AddCustomerForm } from '@/components/add-customer-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomerInvoiceForm } from '@/components/customer-invoice-form';
import { CustomerHotspots } from '@/components/customer-hotspots';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { AppointmentScheduler } from '@/components/appointment-scheduler';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EyewearCatalog } from '@/components/eyewear-catalog';
import BrandLogos from '@/components/brand-logos';
import BestSellerCard from '@/components/best-seller-card';
import { PrescriptionList } from '@/components/prescription-list';
import { PrescriptionDisplay } from '@/components/prescription-display';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { InvoiceReport } from '@/components/invoice-report';
import InventoryStatus from '@/components/inventory-status';
import StockManagement from '@/components/stock-management';
import { useNavigate } from 'react-router-dom';
import { getPatients, getProducts, getInvoices, getAppointments, getPurchaseOrders, getShops, getDoctors, getAdminPaymentNotices, getStaff, getAdmins, createPatient, createProduct } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import BestSellerByPriceRange from '@/components/best-seller-by-price-range';
import { InvoiceForm } from '@/components/invoice-form';

// Reusable Stat Card Component
const StatCard = ({ title, icon: Icon, value, description, isLoading }) => {
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardContent className="p-0">
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-40" />
                    </CardContent>
                </CardHeader>
            </Card>
        )
    }
    
    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardContent className="p-0">
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
            </CardHeader>
        </Card>
    );
}

function LogoutButton({ fullWidth = false }) {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleLogout = () => {
        document.cookie = "currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "patientId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/');
    };

    return (
        <Button variant="destructive" onClick={handleLogout} className={fullWidth ? 'w-full bg-red-700 hover:bg-red-800' : ''}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
        </Button>
    )
}


// Section Components
function AdminDashboard() {
  const { formatCurrency, registerValue, convertedValues } = useCurrency();
  const [invoices, setInvoices] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [paymentNotices, setPaymentNotices] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        const [inv, pat, app, notice, st, doc] = await Promise.all([
            getInvoices(),
            getPatients(),
            getAppointments(),
            getAdminPaymentNotices(),
            getStaff(),
            getDoctors(),
        ]);
        setInvoices(inv);
        setPatients(pat);
        setAppointments(app);
        setPaymentNotices(notice);
        setStaff(st);
        setDoctors(doc);
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'Paid' ? sum + inv.total : sum, 0);
  const outstandingInvoicesValue = invoices.reduce((sum, inv) => (inv.status === 'Unpaid' || inv.status === 'Overdue') ? sum + inv.total : sum, 0);
  
  const totalRevenueId = 'totalRevenue_admin';
  const outstandingInvoicesId = 'outstandingInvoices_admin';
  
  const allStaff = [...staff, ...doctors];

  const [paymentNotice, setPaymentNotice] = React.useState(null);
  const [lockout, setLockout] = React.useState(false);
  const [daysLeft, setDaysLeft] = React.useState(0);

  React.useEffect(() => {
    registerValue(totalRevenueId, totalRevenue);
    registerValue(outstandingInvoicesId, outstandingInvoicesValue);
  }, [registerValue, totalRevenue, outstandingInvoicesValue, totalRevenueId, outstandingInvoicesId, invoices]);

  React.useEffect(() => {
    const adminEmail = getCookie('currentUser');
    const notice = paymentNotices.find(n => n.adminEmail === adminEmail && n.status === 'pending');
    
    if (notice) {
        setPaymentNotice(notice);
        const dueDate = parseISO(notice.dueDate);
        const today = new Date();
        const remaining = differenceInDays(dueDate, today);
        setDaysLeft(Math.max(0, remaining));

        if(remaining < 0 && notice.lockOnExpire) {
            setLockout(true);
        }
    }
  }, [paymentNotices]);

  const displayTotalRevenue = convertedValues[totalRevenueId] ?? totalRevenue;
  const displayOutstandingInvoices = convertedValues[outstandingInvoicesId] ?? outstandingInvoicesValue;
  const paymentNoticeAmount = paymentNotice ? (convertedValues[`admin_payment_${paymentNotice.adminEmail}`] ?? paymentNotice.amountDue) : 0;
  const paymentNoticeId = paymentNotice ? `admin_payment_${paymentNotice.adminEmail}` : '';

   React.useEffect(() => {
    if (paymentNotice) {
      registerValue(paymentNoticeId, paymentNotice.amountDue);
    }
  }, [registerValue, paymentNotice, paymentNoticeId]);


  const AdminLockoutScreen = () => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive bg-destructive/10 text-destructive-foreground">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Portal Access Locked</CardTitle>
                        <CardDescription className="text-destructive-foreground/80">Your access has been restricted due to an overdue payment.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                 <div className="text-4xl font-bold">{formatCurrency(paymentNoticeAmount)}</div>
                <p className="font-semibold">Outstanding Amount Due</p>
                <p className="text-sm">
                    Please contact the business owner to settle the payment and restore access.
                </p>
            </CardContent>
             <CardFooter className="flex justify-center p-4">
                <LogoutButton fullWidth />
            </CardFooter>
        </Card>
    </div>
  );

  const PaymentWarning = () => (
     <Card className="border-yellow-500 bg-yellow-500/10 mb-8">
        <CardHeader>
             <div className="flex items-center gap-4">
                <Timer className="h-8 w-8 text-yellow-500" />
                <div>
                    <CardTitle className="text-yellow-200">Payment Due Reminder</CardTitle>
                    <CardDescription className="text-yellow-200/80">A payment is due on your account.</CardDescription>
                </div>
            </div>
        </CardHeader>
         <CardContent className="flex items-center justify-center gap-8 text-center">
            <div>
                <div className="text-4xl font-bold text-yellow-400">{formatCurrency(paymentNoticeAmount)}</div>
                <p className="font-semibold">Amount Due</p>
            </div>
            <div>
                 <div className="text-4xl font-bold text-yellow-400">{daysLeft}</div>
                <p className="font-semibold">Days Remaining</p>
            </div>
        </CardContent>
    </Card>
  );

  if (lockout) {
      return <AdminLockoutScreen />;
  }
  
  return (
    <div className="space-y-8">
      {paymentNotice && <PaymentWarning />}

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
         <StatCard 
            title="Total Revenue"
            icon={DollarSign}
            value={formatCurrency(displayTotalRevenue)}
            description="+20.1% from last month"
            isLoading={isLoading}
          />
           <StatCard 
            title="Outstanding Invoices"
            icon={Receipt}
            value={formatCurrency(displayOutstandingInvoices)}
            description={`${invoices.filter(inv => inv.status === 'Overdue').length} invoices currently overdue`}
            isLoading={isLoading}
          />
          <StatCard 
            title="Active Patients"
            icon={Users}
            value={`${patients.length}`}
            description="Total customers in system"
            isLoading={isLoading}
          />
           <StatCard 
            title="Upcoming Appointments"
            icon={Calendar}
            value={`${appointments.filter(a => new Date(a.date) >= new Date()).length}`}
            description="Total appointments scheduled"
            isLoading={isLoading}
          />
      </div>
       <div className="grid gap-8 md:grid-cols-2">
        <AuditReport />
        <InvoiceReport />
      </div>
      <BestSellerByPriceRange />
       <Card>
          <CardHeader>
            <CardTitle>Staff & Doctor Logins</CardTitle>
            <CardDescription>Recent login activity of all team members.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-48 w-full" />
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Name</TableHead>
                                <TableHead className="min-w-[100px]">Role</TableHead>
                                <TableHead className="min-w-[150px]">Last Login</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allStaff.map(user => (
                                <TableRow key={user.email}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email.includes('doctor') ? 'Doctor' : 'Staff'}</TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

function OwnerDashboard() {
  const { formatCurrency, registerValue, convertedValues } = useCurrency();
  const [invoices, setInvoices] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [admins, setAdmins] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        const [inv, doc, adm] = await Promise.all([
            getInvoices(),
            getDoctors(),
            getAdmins(),
        ]);
        setInvoices(inv);
        setDoctors(doc);
        setAdmins(adm);
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'Paid' ? sum + inv.total : sum, 0);
  const outstandingInvoicesValue = invoices.reduce((sum, inv) => (inv.status === 'Unpaid' || inv.status === 'Overdue') ? sum + inv.total : sum, 0);
  const totalRevenueId = 'totalRevenue_owner';
  const outstandingInvoicesId = 'outstandingInvoices_owner';

  React.useEffect(() => {
    registerValue(totalRevenueId, totalRevenue);
    registerValue(outstandingInvoicesId, outstandingInvoicesValue);
  }, [registerValue, totalRevenue, outstandingInvoicesValue, totalRevenueId, outstandingInvoicesId, invoices]);

  const displayTotalRevenue = convertedValues[totalRevenueId] ?? totalRevenue;
  const displayOutstandingInvoices = convertedValues[outstandingInvoicesId] ?? outstandingInvoicesValue;

  return (
    <div className="space-y-8">
       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue"
          icon={DollarSign}
          value={formatCurrency(displayTotalRevenue)}
          description="+20.1% from last month"
          isLoading={isLoading}
        />
        <StatCard 
          title="Outstanding Invoices"
          icon={Receipt}
          value={formatCurrency(displayOutstandingInvoices)}
          description={`${invoices.filter(inv => inv.status === 'Overdue').length} invoices currently overdue`}
          isLoading={isLoading}
        />
        <StatCard 
          title="Recent Activity"
          icon={Activity}
          value="+573"
          description="+201 since last hour"
          isLoading={isLoading}
        />
         <StatCard 
          title="Total Staff"
          icon={Users}
          value={`${doctors.length + 1}`}
          description="Staff & Doctors on payroll"
          isLoading={isLoading}
        />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <BestSellerCard year={new Date().getFullYear()} />
        <Card>
            <CardHeader>
                <CardTitle>Accounting Integration</CardTitle>
                <CardDescription>View detailed financial reports and manage accounting in Tally.</CardDescription>
            </CardHeader>
            <CardContent>
                <a href="https://tallysolutions.com/" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" /> Go to Tally
                    </Button>
                </a>
            </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Admin Login Details</CardTitle>
            <CardDescription>Recent login activity of all admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-24 w-full" />
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Name</TableHead>
                                <TableHead className="min-w-[100px]">Role</TableHead>
                                <TableHead className="min-w-[150px]">Last Login</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map(user => (
                                <TableRow key={user.email}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>Admin</TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      <BrandLogos />
    </div>
  )
}

function StaffDashboard() {
  const [lastLogin, setLastLogin] = React.useState(null);
  const { formatCurrency, registerValue, convertedValues } = useCurrency();
  const [recentInvoices, setRecentInvoices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        const inv = await getInvoices();
        setRecentInvoices(inv.slice(0,5));
        setIsLoading(false);
    }
    fetchData();
    // This should only run on the client to avoid hydration mismatch
    setLastLogin(new Date().toLocaleString());
  }, []);

  React.useEffect(() => {
    recentInvoices.forEach(invoice => {
        registerValue(`staff_invoice_${invoice.id}`, invoice.total);
    });
  }, [registerValue, recentInvoices]);

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Your Login Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center p-3 rounded-lg border bg-secondary/30">
                    <p className="font-medium">Last Login</p>
                    <p className="font-semibold">{lastLogin || 'Loading...'}</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>A quick look at the most recent invoices created.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <Skeleton className="h-48 w-full" />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[120px]">ID</TableHead>
                                    <TableHead className="min-w-[150px]">Patient</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-[120px]">Due Date</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="min-w-[120px] text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-mono">{invoice.id}</TableCell>
                                        <TableCell>{invoice.patientName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{invoice.dueDate}</TableCell>
                                        <TableCell><Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Overdue' ? 'destructive' : 'secondary'}>{invoice.status}</Badge></TableCell>
                                        <TableCell className="text-right">{formatCurrency(convertedValues[`staff_invoice_${invoice.id}`] ?? invoice.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
        <BrandLogos />
    </div>
  )
}

function DoctorDashboard() {
     const [patients, setPatients] = React.useState([]);
     const [isAddPatientOpen, setAddPatientOpen] = React.useState(false);
     const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const pat = await getPatients();
            setPatients(pat.patients || pat);
            setIsLoading(false);
        }
        fetchData();
    }, []);

     const handleAddPatient = async (newPatientData) => {
         try {
             // Call the API to create the patient on the server
             const createdPatient = await createPatient(newPatientData);
             console.log('Patient created:', createdPatient);
 
             // Add the created patient to the local state
             setPatients(prev => [createdPatient, ...prev]);
             setAddPatientOpen(false);
 
             toast({
                 title: 'Patient Added',
                 description: `${createdPatient.name} has been added to the system.`
             });
         } catch (error) {
             console.error('Error creating patient:', error);
             toast({
                 variant: 'destructive',
                 title: 'Error',
                 description: 'Failed to add patient. Please try again.'
             });
         }
     }

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Welcome, Doctor</CardTitle>
                        <CardDescription>Here's an overview of your customers.</CardDescription>
                    </div>
                     <Dialog open={isAddPatientOpen} onOpenChange={setAddPatientOpen}>
                         <DialogTrigger asChild>
                             <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                               <DialogHeader>
                                  <DialogTitle>Add New Customer</DialogTitle>
                                  <DialogDescription>
                                      Fill in the details below to add a new customer to the system.
                                  </DialogDescription>
                              </DialogHeader>
                              <AddCustomerForm onAddCustomer={handleAddCustomer} />
                          </DialogContent>
                     </Dialog>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Name</TableHead>
                                    <TableHead className="hidden md:table-cell min-w-[120px]">Phone</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-[120px]">Last Visit</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {patients.slice(0,5).map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">{patient.phone}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{patient.lastVisit}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function CustomerDashboard() {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [overdueInvoices, setOverdueInvoices] = React.useState([]);
    const [lockout, setLockout] = React.useState(false);
    const [daysLeft, setDaysLeft] = React.useState(0);
    const gracePeriod = 30; // 30-day grace period after due date
    const [patient, setPatient] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchPatientData() {
            setIsLoading(true);
            const patientId = getCookie('patientId');
            if (patientId) {
                const [allPatients, allInvoices] = await Promise.all([getPatients(), getInvoices()]);
                const patientsArray = allPatients.patients || allPatients;
                const currentPatient = patientsArray.find(p => p.id === patientId);

                if(currentPatient) {
                    setPatient(currentPatient);
                    const patientInvoices = allInvoices.filter(inv => inv.patientId === currentPatient.id);
                    const overdue = patientInvoices.filter(inv => inv.status === 'Overdue');
                    setOverdueInvoices(overdue);

                    if (overdue.length > 0) {
                        const oldestDueDate = overdue.map(inv => parseISO(inv.dueDate)).sort((a,b) => a.getTime() - b.getTime())[0];
                        const lockoutDate = addDays(oldestDueDate, gracePeriod);
                        const today = new Date();

                        const remainingDays = differenceInDays(lockoutDate, today);
                        setDaysLeft(Math.max(0, remainingDays));

                        if (remainingDays < 0) {
                            setLockout(true);
                        }
                    }
                }
            }
            setIsLoading(false);
        }
        fetchPatientData();
    }, []);

    const totalOverdueAmount = overdueInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const overdueId = 'patient_overdue_total';

    React.useEffect(() => {
        if(overdueInvoices.length > 0) {
            registerValue(overdueId, totalOverdueAmount)
        }
    }, [registerValue, overdueInvoices, totalOverdueAmount]);

    const displayOverdueAmount = convertedValues[overdueId] ?? totalOverdueAmount;

    const OverdueNotice = () => (
        <Card className="border-destructive bg-destructive/10 text-destructive-foreground">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Account Access Restricted</CardTitle>
                        <CardDescription className="text-destructive-foreground/80">Your account features have been temporarily disabled due to overdue payments.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                 <div className="text-4xl font-bold">{formatCurrency(displayOverdueAmount)}</div>
                <p className="font-semibold">Total Amount Due</p>
                <p className="text-sm">
                    Please contact our office at <span className="font-bold">555-123-4567</span> or visit us to clear your outstanding balance and restore full access to your account.
                </p>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
                 <LogoutButton fullWidth />
            </CardFooter>
        </Card>
    );

    const CountdownWarning = () => (
        <Card className="border-yellow-500 bg-yellow-500/10 mb-8">
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <Timer className="h-8 w-8 text-yellow-500" />
                    <div>
                        <CardTitle className="text-yellow-200">Payment Reminder</CardTitle>
                        <CardDescription className="text-yellow-200/80">You have an outstanding balance on your account.</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent className="flex items-center justify-center gap-8 text-center">
                <div>
                    <div className="text-4xl font-bold text-yellow-400">{formatCurrency(displayOverdueAmount)}</div>
                    <p className="font-semibold">Total Amount Due</p>
                </div>
                <div>
                     <div className="text-4xl font-bold text-yellow-400">{daysLeft}</div>
                    <p className="font-semibold">Days to Settle</p>
                </div>
            </CardContent>
        </Card>
    );
    
    if (lockout) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <OverdueNotice />
                </div>
            </div>
        )
    }
    
    if (isLoading) {
        return (
             <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!patient) {
        return <p>Could not load patient data.</p>;
    }

    return (
        <div>
            {overdueInvoices.length > 0 && <CountdownWarning />}
            <PatientDetailsDisplay patient={patient} />
        </div>
    )
}


function InvoiceManagementSection() {
      const [view, setView] = React.useState('list');
      const [selectedInvoice, setSelectedInvoice] = React.useState(null);
      const [editingInvoice, setEditingInvoice] = React.useState(null);

     const handleCreateInvoice = (newInvoiceData) => {
         const newInvoice = {
             id: `INV-${Date.now()}`,
             patientId: `PAT-XYZ`, // temp
             status: 'Unpaid',
             ...newInvoiceData
         }
         setSelectedInvoice(newInvoice);
         setView('list'); // Switch to showing the new invoice
     }

     const handleEditInvoice = (invoice) => {
         setEditingInvoice(invoice);
         setView('edit');
     }

     const handleInvoiceUpdated = () => {
         setEditingInvoice(null);
         setView('list');
         // Optionally refresh the invoice list
     }

     if (selectedInvoice) {
         return (
             <div>
                  <Button onClick={() => setSelectedInvoice(null)} variant="outline" className="mb-4">
                     &larr; Back to Invoices
                  </Button>
                  <InvoiceDisplay invoice={selectedInvoice} />
             </div>
         )
     }

     return (
         <Card>
             <CardHeader className="flex-row items-center justify-between">
                 <div>
                     <CardTitle>Invoice Management</CardTitle>
                     <CardDescription>Review past invoices or create a new one.</CardDescription>
                 </div>
                 {view === 'list' && (
                     <Button onClick={() => setView('create')}>
                         <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
                     </Button>
                 )}
                 {view === 'create' && (
                     <Button onClick={() => setView('list')} variant="outline">
                         &larr; Back to List
                     </Button>
                 )}
                 {view === 'edit' && (
                     <Button onClick={() => { setView('list'); setEditingInvoice(null); }} variant="outline">
                         &larr; Back to List
                     </Button>
                 )}
             </CardHeader>
             <CardContent>
                 {view === 'list' && (
                     <InvoiceList onSelectInvoice={setSelectedInvoice} onEditInvoice={handleEditInvoice} />
                 )}
                 {view === 'create' && (
                     <InvoiceForm onCreate={handleCreateInvoice} />
                 )}
                 {view === 'edit' && editingInvoice && (
                     <CustomerInvoiceForm
                         initialData={editingInvoice}
                         onInvoiceUpdated={handleInvoiceUpdated}
                     />
                 )}
             </CardContent>
         </Card>
     );
 }

function InvoiceList({ onSelectInvoice, onEditInvoice }) {
     const [invoices, setInvoices] = React.useState([]);
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const inv = await getInvoices();
            setInvoices(inv);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    React.useEffect(() => {
        invoices.forEach(invoice => {
            registerValue(`inv_manage_${invoice.id}`, invoice.total);
        });
    }, [registerValue, invoices]);

    return (
          <>
             {isLoading ? (
                 <Skeleton className="h-64 w-full" />
             ) : (
                 <div className="overflow-x-auto">
                     <Table className="min-w-full">
                         <TableHeader>
                             <TableRow>
                                 <TableHead className="min-w-[120px]">ID</TableHead>
                                 <TableHead className="min-w-[150px]">Patient</TableHead>
                                 <TableHead className="hidden sm:table-cell min-w-[120px]">Due Date</TableHead>
                                 <TableHead className="min-w-[100px]">Status</TableHead>
                                 <TableHead className="min-w-[120px] text-right">Total</TableHead>
                                 <TableHead className="min-w-[80px]"></TableHead>
                                 <TableHead className="hidden md:table-cell min-w-[80px]"></TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                             {invoices.map(invoice => (
                                 <TableRow key={invoice.id}>
                                     <TableCell className="font-mono">{invoice.id}</TableCell>
                                     <TableCell>{invoice.patientName}</TableCell>
                                     <TableCell className="hidden sm:table-cell">{invoice.dueDate}</TableCell>
                                     <TableCell><Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Overdue' ? 'destructive' : 'secondary'}>{invoice.status}</Badge></TableCell>
                                     <TableCell className="text-right">{formatCurrency(convertedValues[`inv_manage_${invoice.id}`] ?? invoice.total)}</TableCell>
                                     <TableCell className="text-right">
                                         <Button variant="ghost" size="sm" onClick={() => onSelectInvoice(invoice)}>View</Button>
                                     </TableCell>
                                     <TableCell className="hidden md:table-cell text-right">
                                         <Button variant="ghost" size="sm" onClick={() => onEditInvoice && onEditInvoice(invoice)}>Edit</Button>
                                     </TableCell>
                                 </TableRow>
                             ))}
                         </TableBody>
                     </Table>
                 </div>
             )}
         </>
     )
}

const FeatureCard = ({ title, description, children, isLoading }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="w-full h-64" /> : children}
        </CardContent>
    </Card>
);




function ReportsSection() {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [csvData, setCsvData] = React.useState([]);
    const [csvHeaders, setCsvHeaders] = React.useState([]);
    const csvLinkRef = React.useRef(null);
    const [activeTab, setActiveTab] = React.useState('sales');
    const [dateFilterType, setDateFilterType] = React.useState('all');
    const [startDate, setStartDate] = React.useState(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = React.useState(() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return lastDay.toISOString().split('T')[0];
    });

    const dateRange = React.useMemo(() => {
        if (dateFilterType === 'all') return null;
        const now = new Date();
        let start, end;
        if (dateFilterType === 'thisYear') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (dateFilterType === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (dateFilterType === 'lastMonth') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        } else if (dateFilterType === 'thisWeek') {
            const day = now.getDay();
            start = new Date(now);
            start.setDate(now.getDate() - day);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (dateFilterType === 'lastWeek') {
            const day = now.getDay();
            start = new Date(now);
            start.setDate(now.getDate() - day - 7);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        }
        return start && end ? { start, end } : null;
    }, [dateFilterType]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        setIsPrinting(true);
        toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

        reportElement.classList.add('print-styles');

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                windowHeight: reportElement.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`product_performance_report.pdf`);
            toast({ title: 'PDF Downloaded', description: 'The report has been saved.' });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        } finally {
            reportElement.classList.remove('print-styles');
            setIsPrinting(false);
        }
    };
    
    const prepareCsvData = async (reportType) => {
        let data = [];
        let headers = [];

        const initialInvoices = await getInvoices();
        const initialProducts = await getProducts();
        const allPurchaseOrders = await getPurchaseOrders();
        const initialPatients = await getPatients();

        let filteredInvoices = initialInvoices;
        if (dateRange) {
            filteredInvoices = initialInvoices.filter(inv => {
                const invDate = parseISO(inv.issueDate);
                return invDate >= dateRange.start && invDate <= dateRange.end;
            });
        }

        let filteredPurchaseOrders = allPurchaseOrders;
        if (dateRange) {
            filteredPurchaseOrders = allPurchaseOrders.filter(po => {
                const poDate = parseISO(po.orderDate);
                return poDate >= dateRange.start && poDate <= dateRange.end;
            });
        }

        if (reportType === 'sales') {
            headers = [
                { label: 'Product Name', key: 'productName' },
                { label: 'Brand', key: 'brand' },
                { label: 'Quantity Sold', key: 'quantity' },
                { label: 'Total Value', key: 'totalValue' },
            ];
            const salesMap = new Map();
            filteredInvoices.forEach(invoice => {
                if (invoice.status === 'Paid') {
                    invoice.items.forEach(item => {
                        const productDetails = initialProducts.find(p => p.id === item.productId);
                        if (!productDetails || productDetails.type === 'Service') return;

                        const existing = salesMap.get(item.productId);
                        if (existing) {
                            existing.quantity += item.quantity;
                            existing.totalValue += item.quantity * item.unitPrice;
                        } else {
                            salesMap.set(item.productId, {
                                productName: item.productName,
                                brand: productDetails.brand || 'N/A',
                                quantity: item.quantity,
                                totalValue: item.quantity * item.unitPrice,
                            });
                        }
                    });
                }
            });
            data = Array.from(salesMap.values());
        } else if (reportType === 'purchases') {
            headers = [
                { label: 'Product Name', key: 'productName' },
                { label: 'Brand', key: 'brand' },
                { label: 'Quantity Purchased', key: 'quantity' },
                { label: 'Total Cost', key: 'totalValue' },
            ];
              const purchaseMap = new Map();
              filteredPurchaseOrders.forEach(po => {
                po.items.forEach(item => {
                    const existing = purchaseMap.get(item.productId);
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.totalValue += item.quantity * item.unitPrice;
                    } else {
                        purchaseMap.set(item.productId, {
                            productName: item.productName,
                            brand: item.brand || 'N/A',
                            quantity: item.quantity,
                            totalValue: item.quantity * item.unitPrice,
                        });
                    }
                })
            });
            data = Array.from(purchaseMap.values());
        } else if (reportType === 'stock') {
              headers = [
                { label: 'Product Name', key: 'name' },
                { label: 'Brand', key: 'brand' },
                { label: 'Type', key: 'type' },
                { label: 'Stock', key: 'stock' },
                { label: 'Price', key: 'price' },
                { label: 'Stock Value', key: 'stockValue' },
                { label: 'Created At', key: 'createdAt' },
            ];
            let filteredProducts = initialProducts.filter(p => p.type !== 'Service');
            if (dateRange) {
                filteredProducts = filteredProducts.filter(p => {
                    if (!p.createdAt) return false;
                    const createdDate = parseISO(p.createdAt);
                    return createdDate >= dateRange.start && createdDate <= dateRange.end;
                });
            }
            data = filteredProducts.map(p => ({
                ...p,
                stockValue: p.stock * p.price
            }));

        setCsvHeaders(headers);
        setCsvData(data);
    };

    const handleExportCsv = () => {
        prepareCsvData(activeTab).then(() => {
            setTimeout(() => {
                csvLinkRef.current?.link.click();
                toast({ title: 'CSV Exported', description: 'The report data has been downloaded.' });
            }, 100);
        });
    };

    return (
        <Card id="report-content">
             <Tabs defaultValue="sales" onValueChange={setActiveTab}>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Detailed Reports</CardTitle>
                        <CardDescription>
                         In-depth analysis of overall sales, stock, and client data.
                        </CardDescription>
                        <div className="mt-4 space-y-2">
                            <Label>Date Filter</Label>
                            <Select value={dateFilterType} onValueChange={setDateFilterType}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="thisYear">This Year</SelectItem>
                                    <SelectItem value="thisMonth">This Month</SelectItem>
                                    <SelectItem value="lastMonth">Last Month</SelectItem>
                                    <SelectItem value="thisWeek">This Week</SelectItem>
                                    <SelectItem value="lastWeek">Last Week</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <TabsList className="mt-4">
                             <TabsTrigger value="sales">Products Sold</TabsTrigger>
                             <TabsTrigger value="purchases">Products Purchased</TabsTrigger>
                             <TabsTrigger value="stock">Products in Stock</TabsTrigger>
                         </TabsList>
                    </div>
                     <div className="flex items-center gap-2 print-hidden">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isPrinting}>
                            {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                             PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportCsv}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.open('https://tallysolutions.com/', '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" /> Tally
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.open('https://www.microsoft.com/en-us/microsoft-365/excel', '_blank')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                        </Button>
                        <CSVLink
                            data={csvData}
                            headers={csvHeaders}
                            filename={`${activeTab}_report.csv`}
                            className="hidden"
                            ref={csvLinkRef}
                            target="_blank"
                         />
                    </div>
                </CardHeader>
                <CardContent>
                    <TabsContent value="sales">
                      <AuditReport detailed={true} dateRange={dateRange} />
                    </TabsContent>
                    <TabsContent value="purchases">
                        <AuditReport detailed={true} dateRange={dateRange} />
                    </TabsContent>
                    <TabsContent value="stock">
                       <AuditReport detailed={true} dateRange={dateRange} />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}


export default function UnifiedDashboard() {
    const [patient, setPatient] = React.useState(null);
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { t } = useLanguage();
    const { toast } = useToast();

    React.useEffect(() => {
      async function fetchData() {
          setIsLoading(true);
          const patientId = getCookie('patientId');
          if (patientId) {
              const allPatients = await getPatients();
              setPatient(allPatients.patients?.find(p => p.id === patientId) || null);
          }
          const prods = await getProducts();
          setProducts(prods);
          setIsLoading(false);
      }
      fetchData();

    }, []);

   const handleAddProduct = async (productData) => {
       try {
           // Price is already in INR (default currency)
           const newProduct = await createProduct(productData);
           console.log('Product created:', newProduct);

           // Add the created product to the local state
           setProducts(prev => [newProduct, ...prev]);

           toast({
               title: 'Product Added',
               description: `${productData.name} has been added to the inventory.`
           });
       } catch (error) {
           console.error('Error creating product:', error);
           toast({
               variant: 'destructive',
               title: 'Error',
               description: 'Failed to add product. Please try again.'
           });
       }
   };

  const renderDashboard = () => {
    // Unified dashboard showing all key metrics
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [invoices, setInvoices] = React.useState([]);
    const [patients, setPatients] = React.useState([]);
    const [appointments, setAppointments] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      async function fetchData() {
        setIsLoading(true);
        const [inv, pat, app, prod] = await Promise.all([
          getInvoices(),
          getPatients(),
          getAppointments(),
          getProducts(),
        ]);
        setInvoices(inv);
        setPatients(pat.patients || pat);
        setAppointments(app);
        setProducts(prod);
        setIsLoading(false);
      }
      fetchData();
    }, []);

    const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'Paid' ? sum + inv.total : sum, 0);
    const outstandingInvoicesValue = invoices.reduce((sum, inv) => (inv.status === 'Unpaid' || inv.status === 'Overdue') ? sum + inv.total : sum, 0);
    const totalRevenueId = 'totalRevenue_unified';
    const outstandingInvoicesId = 'outstandingInvoices_unified';

    React.useEffect(() => {
      registerValue(totalRevenueId, totalRevenue);
      registerValue(outstandingInvoicesId, outstandingInvoicesValue);
    }, [registerValue, totalRevenue, outstandingInvoicesValue, totalRevenueId, outstandingInvoicesId, invoices]);

    const displayTotalRevenue = convertedValues[totalRevenueId] ?? totalRevenue;
    const displayOutstandingInvoices = convertedValues[outstandingInvoicesId] ?? outstandingInvoicesValue;

    const [isAddCustomerOpen, setAddCustomerOpen] = React.useState(false);

    const handleAddCustomer = async (newCustomerData) => {
      try {
        const createdCustomer = await createPatient(newCustomerData);
        console.log('Customer created:', createdCustomer);
        setPatients(prev => [createdCustomer, ...prev]);
        setAddCustomerOpen(false);
        toast({
          title: 'Customer Added',
          description: `${createdCustomer.name} has been added to the system.`
        });
      } catch (error) {
        console.error('Error creating customer:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add customer. Please try again.'
        });
      }
    };

    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            icon={DollarSign}
            value={formatCurrency(displayTotalRevenue)}
            description="+20.1% from last month"
            isLoading={isLoading}
          />
          <StatCard
            title="Outstanding Invoices"
            icon={Receipt}
            value={formatCurrency(displayOutstandingInvoices)}
            description={`${invoices.filter(inv => inv.status === 'Overdue').length} invoices currently overdue`}
            isLoading={isLoading}
          />
          <StatCard
            title="Active Customers"
            icon={Users}
            value={`${patients.length}`}
            description="Total customers in system"
            isLoading={isLoading}
          />
          <StatCard
            title="Upcoming Appointments"
            icon={Calendar}
            value={`${appointments.filter(a => new Date(a.date) >= new Date()).length}`}
            description="Total appointments scheduled"
            isLoading={isLoading}
          />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <BestSellerCard year={new Date().getFullYear()} />
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button className="justify-start" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Invoice
              </Button>
              <Dialog open={isAddCustomerOpen} onOpenChange={setAddCustomerOpen}>
                <DialogTrigger asChild>
                  <Button className="justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to add a new customer to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <AddCustomerForm onAddCustomer={handleAddCustomer} />
                </DialogContent>
              </Dialog>
              <Button className="justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const getGreeting = () => {
      return "Welcome to OptaCore";
  }

  return (
    <div className="flex w-full flex-col gap-8">
        <div className="mt-16">
              <h1 className="text-5xl font-bold" style={{fontFamily: 'serif'}}>{t('dashboard_title')}</h1>
            <p className="text-muted-foreground mt-2">{t('dashboard_subtitle')} <span className="font-semibold text-primary">All Features</span> {t('dashboard_role')}.</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-auto">
                <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />{t('tab_dashboard')}</TabsTrigger>
                <TabsTrigger value="invoices"><Receipt className="w-4 h-4 mr-2" />{t('tab_invoices')}</TabsTrigger>
                <TabsTrigger value="reports"><LineChart className="w-4 h-4 mr-2" />{t('tab_reports')}</TabsTrigger>
                <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />{t('tab_products')}</TabsTrigger>
                <TabsTrigger value="appointments"><BookUser className="w-4 h-4 mr-2" />{t('tab_appointments')}</TabsTrigger>
                <TabsTrigger value="loyalty"><Star className="w-4 h-4 mr-2" />{t('tab_loyalty')}</TabsTrigger>
                <TabsTrigger value="inventoryStatus"><PackageSearch className="w-4 h-4 mr-2" />{t('tab_inventoryStatus')}</TabsTrigger>
                <TabsTrigger value="stockManagement"><Boxes className="w-4 h-4 mr-2" />{t('tab_stockManagement')}</TabsTrigger>
                <TabsTrigger value="support"><LifeBuoy className="w-4 h-4 mr-2" />{t('tab_support')}</TabsTrigger>
                <TabsTrigger value="inventory"><Boxes className="w-4 h-4 mr-2" />{t('tab_inventory')}</TabsTrigger>
                <TabsTrigger value="correspondence"><Zap className="w-4 h-4 mr-2" />{t('tab_aiAssistant')}</TabsTrigger>
                <TabsTrigger value="prescriptions"><FileText className="w-4 h-4 mr-2" />{t('tab_prescriptions')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
                <FeatureCard title={t('feature_dashboard_title')} description={t('feature_dashboard_desc')}>
                    {renderDashboard()}
                </FeatureCard>
            </TabsContent>
            


                <TabsContent value="invoices">
                    <FeatureCard title={t('feature_invoiceManagement_title')} description={t('feature_invoiceManagement_desc')}>
                        <InvoiceManagementSection />
                    </FeatureCard>
                </TabsContent>

                    <TabsContent value="appointments">
                        <FeatureCard title={t('feature_appointmentBooking_title')} description={t('feature_appointmentBooking_desc')}>
                            <AppointmentScheduler />
                        </FeatureCard>
                    </TabsContent>
                    <TabsContent value="loyalty">
                        <FeatureCard title={t('feature_loyaltyProgram_title')} description={t('feature_loyaltyProgram_desc')}>
                           <LoyaltyManagement />
                        </FeatureCard>
                    </TabsContent>

                    <TabsContent value="inventoryStatus">
                        <FeatureCard title="Inventory Status" description="View current stock levels for all products." isLoading={isLoading}>
                            <InventoryStatus products={products} />
                        </FeatureCard>
                    </TabsContent>
                     <TabsContent value="stockManagement">
                        <FeatureCard title="Stock Management" description="Update stock levels for products." isLoading={isLoading}>
                            <StockManagement products={products} />
                        </FeatureCard>
                    </TabsContent>

                    <TabsContent value="products">
                        <FeatureCard title={t('feature_eyewearCatalog_title')} description={t('feature_eyewearCatalog_desc')}>
                             <EyewearCatalog />
                        </FeatureCard>
                    </TabsContent>
                    <TabsContent value="reports">
                        <ReportsSection />
                    </TabsContent>

                 <TabsContent value="inventory">
                     <FeatureCard title={t('feature_inventoryControl_title')} description={t('feature_inventoryControl_desc')} isLoading={isLoading}>
                        <div className="grid gap-8 lg:grid-cols-3">
                           <div className="lg:col-span-2">
                                <InventoryStatus products={products} />
                           </div>
                           <div>
                                <AddProductForm onAddProduct={handleAddProduct}/>
                           </div>
                        </div>
                    </FeatureCard>
                </TabsContent>

                    <TabsContent value="correspondence">
                         <FeatureCard title={t('feature_aiAssistant_title')} description={t('feature_aiAssistant_desc')}>
                            <CorrespondenceAssistant />
                        </FeatureCard>
                    </TabsContent>

                <TabsContent value="support">
                    <FeatureCard title="Support Guides" description="Access help guides and documentation.">
                        <div className="space-y-6">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>How do I create a new invoice?</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Navigate to the "Invoices" tab, click "Create Invoice," fill in the patient and item details, and then click the "Create Invoice" button at the bottom. The system will calculate totals automatically.
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-2">
                                     <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>How do I schedule an appointment?</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Go to the "Appointments" tab. Use the calendar to select a day, then fill out the "Book Appointment" form with the patient's name, doctor, date, and time. Click "Book Appointment" to confirm.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                     <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>How do I add loyalty points to a patient's account?</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Go to the "Loyalty" tab, find the patient's membership card, enter the number of points in the "Add Points" input field, and click the "Add" button. The points will be updated in real-time.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                     <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>What if I can't find a product with the barcode scanner?</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        If the barcode scanner doesn't find a product, you can manually type the barcode number into the input field when creating an invoice or order slip. Alternatively, you can use the "Available Products" search bar to find and add products by name or brand.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="flex-row gap-4 items-center">
                                        <Phone className="w-8 h-8 text-primary" />
                                        <div>
                                            <CardTitle>Contact Support</CardTitle>
                                            <CardDescription>Get help with technical or billing issues.</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p><strong>Technical:</strong> 555-0199 (Mon-Fri, 9am-5pm)</p>
                                        <p><strong>Billing:</strong> 555-0198 (Mon-Fri, 9am-5pm)</p>
                                    </CardContent>
                                </Card>
                                <Card className="flex flex-col justify-between">
                                     <CardHeader className="flex-row gap-4 items-center">
                                        <Book className="w-8 h-8 text-primary" />
                                        <div>
                                            <CardTitle>Documentation</CardTitle>
                                            <CardDescription>Read in-depth guides.</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                       <Button className="w-full">Go to Portal</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </FeatureCard>
                </TabsContent>

                <TabsContent value="prescriptions">
                    <FeatureCard title={t('feature_managePrescriptions_title')} description={t('feature_managePrescriptions_desc')}>
                        <PrescriptionList />
                    </FeatureCard>
                </TabsContent>
        </Tabs>
    </div>
  );
}
