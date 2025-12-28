import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-white bg-opacity-80 backdrop-blur-sm">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="text-sm text-slate-600">
                  ProcureFlow
                </div>
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
