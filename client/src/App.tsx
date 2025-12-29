import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut, Package } from "lucide-react";
import Home from "@/pages/Home";
import ItemsPage from "@/pages/Items";
import ItemDetailsPage from "@/pages/ItemDetails";
import ProcessOrdersPage from "@/pages/ProcessOrders";
import EditPurchaseOrderPage from "@/pages/EditPurchaseOrder";
import DetailedOrderStatusPage from "@/pages/DetailedOrderStatus";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/items" component={ItemsPage} />
      <Route path="/item-details" component={ItemDetailsPage} />
      <Route path="/process-orders" component={ProcessOrdersPage} />
      <Route path="/detailed-order-status" component={DetailedOrderStatusPage} />
      <Route path="/edit-po/:id" component={EditPurchaseOrderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">ProcureFlow</h1>
          <p className="text-slate-600 mb-8">
            Purchase Order Management System for tracking procurement workflows and process stages.
          </p>
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Continue
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-6">
          Sign in with your Replit account to access the system
        </p>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, logout, isLoggingOut } = useAuth();

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
              {user && (
                <span className="text-sm text-slate-600">
                  {user.firstName || user.email || "User"}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => logout()}
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
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
