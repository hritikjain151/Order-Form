import { useState, useEffect, useCallback } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import Home from "@/pages/Home";
import ItemsPage from "@/pages/Items";
import ItemDetailsPage from "@/pages/ItemDetails";
import ProcessOrdersPage from "@/pages/ProcessOrders";
import EditPurchaseOrderPage from "@/pages/EditPurchaseOrder";
import DetailedOrderStatusPage from "@/pages/DetailedOrderStatus";
import LoginPage from "@/pages/Login";
import UsersPage from "@/pages/Users";
import DashboardPage from "@/pages/Dashboard";
import UserLogDetailsPage from "@/pages/UserLogDetails";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/purchase-orders" component={Home} />
      <Route path="/items" component={ItemsPage} />
      <Route path="/item-details" component={ItemDetailsPage} />
      <Route path="/process-orders" component={ProcessOrdersPage} />
      <Route path="/detailed-order-status" component={DetailedOrderStatusPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/user-log-details" component={UserLogDetailsPage} />
      <Route path="/edit-po/:id" component={EditPurchaseOrderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
}

function AuthenticatedApp({ userId, onLogout }: { userId: string | null; onLogout: () => void }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-white bg-opacity-80 backdrop-blur-sm">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              {userId && (
                <span className="text-sm text-slate-600">
                  {userId}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2"
                data-testid="button-logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <LogOut className="w-3 h-3" />
                )}
                Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status", { credentials: "include" });
      const data = await response.json();
      if (data.isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });
      }
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        userId: data.userId,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        userId: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={checkAuth} />;
  }

  return (
    <AuthenticatedApp
      userId={authState.userId}
      onLogout={() => setAuthState({ isAuthenticated: false, userId: null, isLoading: false })}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
