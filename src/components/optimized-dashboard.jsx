import React, { memo, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Receipt,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { getInvoices, getPatients, getAppointments } from '@/lib/api';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';

// Memoized stat card component for better performance
const StatCard = memo(({
  title,
  icon: Icon,
  value,
  description,
  isLoading,
  trend
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:bg-accent/50 transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

// Optimized dashboard component with proper memoization
export const OptimizedDashboard = memo(({ userRole }) => {
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Use custom hooks for data fetching
  const { data: invoices, loading: invoicesLoading } = useApi(getInvoices);
  const { data: patients, loading: patientsLoading } = useApi(getPatients);
  const { data: appointments, loading: appointmentsLoading } = useApi(getAppointments);

  // Memoized calculations to prevent unnecessary re-renders
  const dashboardStats = useMemo(() => {
    if (!invoices || !patients || !appointments) {
      return {
        totalRevenue: 0,
        outstandingInvoices: 0,
        activePatients: 0,
        upcomingAppointments: 0,
        revenueTrend: { value: 20.1, isPositive: true },
        overdueCount: 0
      };
    }

    const totalRevenue = invoices.reduce(
      (sum, inv) => inv.status === 'Paid' ? sum + inv.total : sum,
      0
    );

    const outstandingInvoices = invoices.reduce(
      (sum, inv) => (inv.status === 'Unpaid' || inv.status === 'Overdue') ? sum + inv.total : sum,
      0
    );

    const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

    const upcomingAppointments = appointments.filter(
      a => new Date(a.date) >= new Date()
    ).length;

    return {
      totalRevenue,
      outstandingInvoices,
      activePatients: patients.length,
      upcomingAppointments,
      revenueTrend: { value: 20.1, isPositive: true },
      overdueCount
    };
  }, [invoices, patients, appointments]);

  const isLoading = invoicesLoading || patientsLoading || appointmentsLoading;

  // Memoized stat cards to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: "Total Revenue",
      icon: DollarSign,
      value: formatCurrency(dashboardStats.totalRevenue),
      description: "+20.1% from last month",
      trend: dashboardStats.revenueTrend
    },
    {
      title: "Outstanding Invoices",
      icon: Receipt,
      value: formatCurrency(dashboardStats.outstandingInvoices),
      description: `${dashboardStats.overdueCount} invoices currently overdue`
    },
    {
      title: "Active Patients",
      icon: Users,
      value: dashboardStats.activePatients,
      description: "Total patients in system"
    },
    {
      title: "Upcoming Appointments",
      icon: Calendar,
      value: dashboardStats.upcomingAppointments,
      description: "Total appointments scheduled"
    }
  ], [dashboardStats, formatCurrency]);

  // Memoized recent activity
  const recentActivity = useMemo(() => {
    if (!invoices) return [];

    return invoices
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 5);
  }, [invoices]);

  const handleInvoiceClick = useCallback((invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  }, [navigate]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            icon={stat.icon}
            value={stat.value}
            description={stat.description}
            isLoading={isLoading}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleInvoiceClick(invoice.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Invoice #{invoice.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                    <Badge
                      variant={
                        invoice.status === 'Paid' ? 'default' :
                        invoice.status === 'Overdue' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/invoices/new')}
            >
              <Receipt className="h-6 w-6" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/patients/new')}
            >
              <Users className="h-6 w-6" />
              Add Patient
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/appointments/new')}
            >
              <Calendar className="h-6 w-6" />
              Schedule Appointment
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <Activity className="h-6 w-6" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';