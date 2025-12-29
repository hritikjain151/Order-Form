import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  userId: string;
  name: string;
}

interface UserLog {
  id: number;
  userId: number;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function UserLogDetailsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const queryParams = new URLSearchParams();
  if (selectedUserId && selectedUserId !== "all") {
    queryParams.set("userId", selectedUserId);
  }
  if (startDate) {
    queryParams.set("startDate", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    queryParams.set("endDate", endOfDay.toISOString());
  }

  const queryString = queryParams.toString();
  const logsQueryKey = queryString 
    ? `/api/user-logs?${queryString}` 
    : "/api/user-logs";

  const { data: logs = [], isLoading: logsLoading, refetch } = useQuery<UserLog[]>({
    queryKey: ["/api/user-logs", selectedUserId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const res = await fetch(logsQueryKey, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.name} (${user.userId})` : `User #${userId}`;
  };

  const clearFilters = () => {
    setSelectedUserId("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "outline" => {
    switch (action) {
      case "login":
        return "default";
      case "page_visit":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">User Log Details</h1>
            <p className="text-muted-foreground">View user activity logs with date filtering</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2 min-w-[200px]">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-user">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.userId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                      data-testid="button-start-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      data-testid="button-end-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="gap-2"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Activity Logs ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading || logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found for the selected filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>{getUserName(log.userId)}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.ipAddress || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
