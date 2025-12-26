import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { PurchaseOrderList } from "@/components/PurchaseOrderList";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Purchase Orders</h1>
          <p className="text-sm text-slate-600 mt-2">Create and manage your purchase orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Create New PO</h2>
            </div>
            <PurchaseOrderForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Recent Orders</h2>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <PurchaseOrderList />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
