"use client";

import { useState, Suspense } from "react";
import { Search, FileBox, Settings, LogOut, Plus, Menu, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 1. COMPONENTE SEPARADO SÓ PARA A BUSCA
function BarraDeBusca() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <input 
      type="text" 
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('q')?.toString() || ""}
      placeholder="Buscar SKU ou Produto..." 
      className="w-full pl-10 pr-3 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm md:text-base" 
    />
  );
}

// 2. O LAYOUT PRINCIPAL
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`absolute md:relative z-50 w-64 h-full bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg mr-3">+</div>
            <span className="text-white font-bold tracking-wider">ORTOPRATIKA</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => router.push("/")} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Buscar & Gerar</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <FileBox className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Catálogo Local</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Configurações</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 justify-between shadow-sm z-10">
          <div className="flex items-center flex-1 gap-3 md:gap-4">
            <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 max-w-2xl relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              
              {/* COMPONENTE DA BUSCA PROTEGIDO PELO SUSPENSE AQUI */}
              <Suspense fallback={<input type="text" placeholder="Carregando..." className="w-full pl-10 pr-3 py-2 bg-gray-100 border-transparent rounded-lg" />}>
                <BarraDeBusca />
              </Suspense>
              
            </div>
          </div>
          
          <div className="ml-3 md:ml-4 flex items-center">
            <button onClick={() => router.push("/produto/novo")} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm md:text-base whitespace-nowrap">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Novo Produto</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>

      </main>
    </div>
  );
}