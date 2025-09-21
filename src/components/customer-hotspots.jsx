import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { MapPin, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { getCustomerHotspots } from '@/lib/api';

export function CustomerHotspots() {
  const { data: hotspots, loading, error } = useApi(getCustomerHotspots);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Customer Hotspots
          </CardTitle>
          <CardDescription>Geographic distribution of your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading customer hotspots: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalCustomers = hotspots?.reduce((sum, hotspot) => sum + hotspot.customerCount, 0) || 0;
  const topHotspot = hotspots?.[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customer Areas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotspots?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Across all areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Area</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topHotspot?.address || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {topHotspot ? `${topHotspot.customerCount} customers` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Customer Distribution by Area
          </CardTitle>
          <CardDescription>
            Areas with the highest customer concentration. Use this data to optimize store locations and marketing efforts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotspots && hotspots.length > 0 ? (
              hotspots.map((hotspot, index) => {
                const percentage = totalCustomers > 0 ? (hotspot.customerCount / totalCustomers) * 100 : 0;
                const isTopArea = index === 0;

                return (
                  <div key={hotspot.address} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{hotspot.address}</h3>
                          {isTopArea && (
                            <Badge variant="default" className="text-xs">
                              Top Area
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hotspot.customerCount} customers • {percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Progress bar */}
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {hotspot.customerCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          customers
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Customer Data</h3>
                <p className="text-muted-foreground">
                  Start adding customers with location data to see hotspot analysis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      {hotspots && hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
            <CardDescription>Strategic recommendations based on customer distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">📈 Growth Opportunities</h4>
                <ul className="text-sm space-y-1">
                  <li>• Consider expanding services in {topHotspot?.address}</li>
                  <li>• Target marketing campaigns to high-density areas</li>
                  <li>• Evaluate opening satellite locations</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🎯 Strategic Actions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Focus customer service resources on busy areas</li>
                  <li>• Optimize inventory for local demand patterns</li>
                  <li>• Develop area-specific loyalty programs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}