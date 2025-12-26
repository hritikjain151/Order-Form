import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { PurchaseOrderList } from "@/components/PurchaseOrderList";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Package } from "lucide-react";

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
            <Link href="/items">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700">
                <Package className="w-4 h-4" />
                Manage Items
              </button>
            </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
             <div className="mb-4 flex items-center justify-between">
               <h2 className="text-lg font-bold text-slate-900 font-display">Create Purchase Order</h2>
             </div>
             <PurchaseOrderForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-display">All POs</h2>
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
