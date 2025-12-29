import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Package, Weight, Loader2, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  oldestPendingDate: string | null;
  pendingItemsCount: number;
  monthlyDispatchedWeight: Array<{ month: string; weight: number }>;
}

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMM yyyy");
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  description,
  testId,
}: {
  title: string;
  value: string | number;
  icon: typeof Calendar;
  description?: string;
  testId: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={testId}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const oldestDate = stats?.oldestPendingDate
    ? format(new Date(stats.oldestPendingDate), "dd MMM yyyy")
    : "No pending orders";

  const chartData = (stats?.monthlyDispatchedWeight || []).map((item) => ({
    ...item,
    label: formatMonthLabel(item.month),
  }));

  const totalWeight = chartData.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="h-full bg-slate-50 dark:bg-background overflow-y-auto pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight font-display">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-muted-foreground mt-2">
            Overview of your purchase orders and materials
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Oldest Pending PO Date"
              value={oldestDate}
              icon={Calendar}
              description="Oldest order with pending items"
              testId="text-oldest-pending-date"
            />
            <DashboardCard
              title="Items Pending"
              value={stats?.pendingItemsCount ?? 0}
              icon={Package}
              description="Total items not yet dispatched"
              testId="text-pending-items-count"
            />
            <DashboardCard
              title="Total Dispatched Weight"
              value={`${totalWeight.toFixed(2)} kg`}
              icon={Weight}
              description="All time dispatched material weight"
              testId="text-total-weight"
            />
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base font-medium">
                  Monthly Dispatched Weight (kg)
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" data-testid="chart-monthly-weight">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar
                        dataKey="weight"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {chartData.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No dispatched items yet</p>
                  <p className="text-sm mt-1">Chart will appear once items are dispatched</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
