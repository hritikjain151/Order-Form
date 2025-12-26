import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { PurchaseOrderList } from "@/components/PurchaseOrderList";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">PO</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">ProcureFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-right">
              <p className="font-semibold text-slate-900">Welcome back</p>
              <p className="text-slate-500 text-xs">Admin Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               {/* Placeholder avatar */}
               <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
             <div className="mb-6 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 font-display">Create Request</h2>
             </div>
             <PurchaseOrderForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 font-display">Recent Orders</h2>
              <span className="text-sm text-slate-500 font-medium cursor-pointer hover:text-primary transition-colors">View All</span>
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
      </main>
    </div>
  );
}
