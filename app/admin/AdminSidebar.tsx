import React from 'react';
import { Package, LayoutDashboard, ShoppingCart, Truck, Settings, LogOut, Users, ShoppingBag, Bot } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jarvis', label: 'Jarvis AI', icon: Bot },
    { id: 'orders', label: 'Ordini', icon: ShoppingCart },
    { id: 'crm', label: 'Clienti (CRM)', icon: Users },
    { id: 'carts', label: 'Carrelli Abbandonati', icon: ShoppingBag },
    { id: 'products', label: 'Prodotti', icon: Package },
    { id: 'shipping', label: 'Spedizioni', icon: Truck },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shrink-0">
      <div className="p-8 border-b border-gray-100">
        <h2 className="font-serif text-2xl tracking-widest uppercase text-[#1A1A1A]">Isabel Pepe</h2>
        <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C0A09A] mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left font-sans text-[11px] uppercase tracking-[0.1em] ${
                isActive 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left font-sans text-[11px] uppercase tracking-[0.1em] text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="w-4 h-4" />
          Impostazioni
        </button>
        <button 
          onClick={() => window.location.href = '/account'}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left font-sans text-[11px] uppercase tracking-[0.1em] text-red-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          Esci Admin
        </button>
      </div>
    </div>
  );
}
