'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  X, 
  Heart,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useWishlistStore } from '@/store/wishlist';

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

interface Order {
  id: string;
  stripe_session_id?: string;
  customer_email: string;
  customer_name: string;
  amount_total: number;
  status: string;
  shipping_address?: any;
  items: OrderItem[];
  created_at: string;
  tracking_code?: string | null;
  shipped_at?: string | null;
}

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

interface AccountClientProps {
  user: {
    id: string;
    email?: string;
  };
  initialProfile: Profile | null;
  initialOrders: Order[];
}

export default function AccountClient({ user, initialProfile, initialOrders }: AccountClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [orders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  
  // Wishlist dal client store
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();

  // Modal Modifica Dati
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isAdmin = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com', 'mariopepe9@hotmail.it'].includes(user.email || '');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setSaveSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      } else {
        setSaveError(data.error || 'Impossibile salvare i dati.');
      }
    } catch (err: any) {
      setSaveError('Errore di connessione.');
    } finally {
      setSaving(false);
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return 'Indirizzo non specificato';
    if (typeof addr === 'string') return addr;
    const parts = [
      addr.line1,
      addr.line2,
      addr.postal_code,
      addr.city,
      addr.state,
      addr.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Indirizzo in attesa di conferma';
  };

  const getStatusBadge = (status: string, trackingCode?: string | null) => {
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} />
          Consegnato
        </span>
      );
    }
    if (status === 'shipped' || trackingCode) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Truck size={13} className="animate-pulse" />
          Spedito con Corriere
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <Clock size={13} />
        In Preparazione in Atelier
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER AREA RISERVATA */}
        <div className="bg-white border border-[#EADFD9] p-6 sm:p-10 shadow-sm rounded-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#FAF4F2] border border-[#C0A09A] flex items-center justify-center text-[#8A5E58] font-serif text-2xl font-bold">
                {profile?.first_name ? profile.first_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wide">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Il Mio Atelier'}
                  </h1>
                  <span className="bg-[#FAF3F0] text-[#8A5E58] border border-[#C0A09A]/50 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-medium">
                    Cliente Privilegiato
                  </span>
                </div>
                <p className="font-sans text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <Mail size={13} className="text-[#C0A09A]" />
                  {user.email}
                  {profile?.phone && (
                    <>
                      <span>•</span>
                      <Phone size={13} className="text-[#C0A09A]" />
                      <span>{profile.phone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest bg-[#1A1A1A] hover:bg-[#8A5E58] text-white px-5 py-2.5 transition-colors rounded-sm shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>Pannello Admin</span>
                </Link>
              )}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest border border-[#C0A09A] text-[#8A5E58] hover:bg-[#FAF3F0] px-4 py-2.5 transition-colors rounded-sm"
              >
                <Edit3 size={13} />
                <span>Modifica Dati</span>
              </button>
              <LogoutButton />
            </div>
          </div>

          {/* TAB DI NAVIGAZIONE INTERNA */}
          <div className="flex gap-8 border-t border-gray-100 mt-8 pt-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`font-sans text-xs uppercase tracking-widest pb-2 transition-colors relative font-medium flex items-center gap-2 ${
                activeTab === 'orders' ? 'text-[#8A5E58]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <ShoppingBag size={14} />
              <span>I Miei Ordini ({orders.length})</span>
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C0A09A]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`font-sans text-xs uppercase tracking-widest pb-2 transition-colors relative font-medium flex items-center gap-2 ${
                activeTab === 'profile' ? 'text-[#8A5E58]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <User size={14} />
              <span>Dati Personali & Spedizione</span>
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C0A09A]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`font-sans text-xs uppercase tracking-widest pb-2 transition-colors relative font-medium flex items-center gap-2 ${
                activeTab === 'wishlist' ? 'text-[#8A5E58]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Heart size={14} />
              <span>I Miei Preferiti ({wishlistItems.length})</span>
              {activeTab === 'wishlist' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C0A09A]"></span>
              )}
            </button>
          </div>
        </div>

        {/* CONTENUTO TAB 1: I MIEI ORDINI */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white border border-[#EADFD9] p-12 text-center rounded-sm">
                <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[#C0A09A] mb-4" />
                <h3 className="font-serif text-xl uppercase tracking-widest text-gray-900 mb-2">
                  Nessun ordine effettuato
                </h3>
                <p className="font-sans text-xs text-gray-500 max-w-md mx-auto mb-6">
                  Non hai ancora completato acquisti su Isabel Pepe. Esplora le nostre collezioni di gioielli in Argento 925 e pietre di luce.
                </p>
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-medium transition-colors rounded-sm"
                >
                  <span>Scopri le Collezioni</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#EADFD9] rounded-sm shadow-sm overflow-hidden">
                  
                  {/* Header Scheda Ordine */}
                  <div className="bg-[#FAF7F5] border-b border-[#EADFD9] p-5 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-base text-gray-900 tracking-wide">
                          Ordine #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status, order.tracking_code)}
                      </div>
                      <p className="font-sans text-xs text-gray-500">
                        Effettuato il {new Date(order.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-sans uppercase tracking-widest text-gray-400 block">Totale Ordine</span>
                      <span className="font-serif text-2xl font-semibold text-gray-900">
                        €{order.amount_total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Visiva di Avanzamento */}
                  <div className="p-6 sm:px-8 border-b border-gray-100 bg-[#FCFBF9]">
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center justify-between relative">
                        {/* Linea di connessione */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 z-0"></div>
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#C0A09A] transition-all duration-700 z-0"
                          style={{
                            width: order.status === 'delivered' ? '100%' : order.status === 'shipped' || order.tracking_code ? '66%' : '33%'
                          }}
                        ></div>

                        {/* Step 1: Confermato */}
                        <div className="relative z-10 flex flex-col items-center bg-[#FCFBF9] px-2">
                          <div className="w-8 h-8 rounded-full bg-[#8A5E58] text-white flex items-center justify-center text-xs shadow-sm">
                            ✓
                          </div>
                          <span className="text-[10px] font-sans uppercase tracking-wider text-gray-800 font-semibold mt-1">Confermato</span>
                        </div>

                        {/* Step 2: In Preparazione */}
                        <div className="relative z-10 flex flex-col items-center bg-[#FCFBF9] px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${
                            order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' 
                              ? 'bg-[#C0A09A] text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Package size={14} />
                          </div>
                          <span className="text-[10px] font-sans uppercase tracking-wider text-gray-800 font-semibold mt-1">In Atelier</span>
                        </div>

                        {/* Step 3: Spedito */}
                        <div className="relative z-10 flex flex-col items-center bg-[#FCFBF9] px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${
                            order.status === 'shipped' || order.status === 'delivered' || order.tracking_code
                              ? 'bg-[#8A5E58] text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Truck size={14} />
                          </div>
                          <span className="text-[10px] font-sans uppercase tracking-wider text-gray-800 font-semibold mt-1">Spedito</span>
                        </div>

                        {/* Step 4: Consegnato */}
                        <div className="relative z-10 flex flex-col items-center bg-[#FCFBF9] px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${
                            order.status === 'delivered' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="text-[10px] font-sans uppercase tracking-wider text-gray-800 font-semibold mt-1">Consegnato</span>
                        </div>
                      </div>
                    </div>

                    {/* Dettagli Tracking se disponibile */}
                    {order.tracking_code && (
                      <div className="mt-5 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-sm flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-blue-900">
                          <Truck size={16} className="text-blue-600" />
                          <span>Codice Tracciamento Corriere: <strong>{order.tracking_code}</strong></span>
                        </div>
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent('tracking ' + order.tracking_code)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold uppercase tracking-wider text-[10px] underline"
                        >
                          <span>Traccia Pacco</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Lista Prodotti Acquistati */}
                  <div className="p-6 sm:px-8 space-y-4">
                    <h4 className="font-sans text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                      Articoli Inclusi
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-[#FAF7F5] border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Sparkles size={20} className="text-[#C0A09A]" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-serif text-sm text-gray-900 font-medium">
                                  {item.name}
                                </h5>
                                <p className="font-sans text-xs text-gray-500">
                                  Quantità: <span className="font-semibold text-gray-800">{item.quantity}</span>
                                </p>
                              </div>
                            </div>
                            <span className="font-serif text-base text-gray-900">
                              €{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic py-2">Dettagli articoli salvati</p>
                      )}
                    </div>
                  </div>

                  {/* Footer Scheda Ordine con Indirizzo */}
                  <div className="bg-[#FAF7F5] p-4 sm:px-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-600 gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#C0A09A] flex-shrink-0" />
                      <span>Destinazione: <strong>{formatAddress(order.shipping_address)}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        href="/assistenza-clienti" 
                        className="text-[#8A5E58] hover:underline uppercase tracking-widest text-[10px] font-medium"
                      >
                        Richiedi Assistenza
                      </Link>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENUTO TAB 2: DATI PERSONALI & SPEDIZIONE */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Box Dati Personali */}
            <div className="bg-white border border-[#EADFD9] p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-serif text-lg tracking-wide uppercase text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-[#C0A09A]" />
                  Informazioni Personali
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#8A5E58] hover:underline uppercase tracking-widest font-medium"
                >
                  Modifica
                </button>
              </div>

              <div className="space-y-4 font-sans text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-0.5">Nome e Cognome</span>
                  <span className="font-medium text-gray-900 text-base">
                    {profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Non specificato'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-0.5">Email Ufficiale</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-0.5">Recapito Telefonico</span>
                  <span className="font-medium text-gray-900">{profile?.phone || 'Nessun telefono registrato'}</span>
                </div>
              </div>
            </div>

            {/* Box Indirizzo di Spedizione Predefinito */}
            <div className="bg-white border border-[#EADFD9] p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-serif text-lg tracking-wide uppercase text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-[#C0A09A]" />
                  Indirizzo di Consegna
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#8A5E58] hover:underline uppercase tracking-widest font-medium"
                >
                  Modifica
                </button>
              </div>

              <div className="space-y-4 font-sans text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-0.5">Indirizzo Predefinito</span>
                  {profile?.address ? (
                    <p className="font-medium text-gray-900 leading-relaxed">
                      {profile.address}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Nessun indirizzo predefinito salvato. Clicca su Modifica per aggiungerne uno.
                    </p>
                  )}
                </div>

                <div className="p-4 bg-[#FAF7F5] border border-[#EADFD9] rounded-sm text-xs text-gray-600 space-y-1">
                  <span className="font-semibold text-gray-900 block">✨ Vantaggio Cliente</span>
                  <p>Salvare il tuo indirizzo predefinito accelera tutti i tuoi acquisti futuri senza dover riscrivere i dati di spedizione.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CONTENUTO TAB 3: WISHLIST / PREFERITI */}
        {activeTab === 'wishlist' && (
          <div className="bg-white border border-[#EADFD9] p-8 rounded-sm shadow-sm">
            <h3 className="font-serif text-xl tracking-wide uppercase text-gray-900 mb-6 flex items-center gap-2">
              <Heart size={20} className="text-[#C0A09A]" />
              I Tuoi Gioielli Preferiti
            </h3>

            {wishlistItems.length === 0 ? (
              <div className="py-12 text-center">
                <Heart size={44} strokeWidth={1} className="mx-auto text-gray-300 mb-3" />
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mb-6">
                  Non hai ancora aggiunto gioielli alla tua lista desideri.
                </p>
                <Link 
                  href="/shop" 
                  className="inline-block bg-[#1A1A1A] hover:bg-[#8A5E58] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-medium transition-colors rounded-sm"
                >
                  Esplora il Catalogo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-sm overflow-hidden group hover:border-[#C0A09A] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="aspect-square bg-[#FAF7F5] overflow-hidden relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                          title="Rimuovi dai preferiti"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-serif text-sm text-gray-900 font-medium mb-1">{item.name}</h4>
                        <p className="font-serif text-base text-[#8A5E58] font-bold">€{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <Link 
                        href={`/prodotto/${item.slug || ''}`}
                        className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white text-center py-2.5 rounded-sm text-[11px] uppercase tracking-widest font-medium block transition-colors"
                      >
                        Visualizza Gioiello
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL MODIFICA PROFILO & INDIRIZZO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#EADFD9] w-full max-w-lg rounded-sm shadow-2xl p-6 sm:p-8 relative">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-xl tracking-wide uppercase text-gray-900 mb-2">
              Modifica Dati Personali
            </h3>
            <p className="font-sans text-xs text-gray-500 mb-6">
              Aggiorna le tue informazioni per velocizzare le spedizioni e ricevere assistenza personalizzata.
            </p>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Dati aggiornati con successo!</span>
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="Mario" 
                    className="w-full border border-gray-200 rounded-sm p-2.5 text-sm outline-none focus:border-[#C0A09A] bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cognome</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Pepe" 
                    className="w-full border border-gray-200 rounded-sm p-2.5 text-sm outline-none focus:border-[#C0A09A] bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Telefono (per corriere espresso)</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+39 366 1234567" 
                  className="w-full border border-gray-200 rounded-sm p-2.5 text-sm outline-none focus:border-[#C0A09A] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Indirizzo di Spedizione Completo</label>
                <textarea 
                  rows={3}
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Via Roma 10, 84016 Pagani (SA)" 
                  className="w-full border border-gray-200 rounded-sm p-2.5 text-sm outline-none focus:border-[#C0A09A] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest font-sans border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-sm"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs uppercase tracking-widest font-sans bg-[#1A1A1A] hover:bg-[#8A5E58] text-white font-medium rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
