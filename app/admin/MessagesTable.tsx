'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Search,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Archive,
  Send,
  Sparkles,
  Trash2,
  ChevronRight,
  User,
  Globe,
  Monitor,
  Calendar,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Truck,
  RotateCcw,
  Gem,
  X,
} from 'lucide-react';
import type { SupportMessage, SupportMessageStatus } from '@/types/support';
import { updateMessageStatus, deleteMessage } from './actions_messages';

interface MessagesTableProps {
  messages: SupportMessage[];
}

export default function MessagesTable({ messages: initialMessages = [] }: MessagesTableProps) {
  const [messages, setMessages] = useState<SupportMessage[]>(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportMessageStatus>('all');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);

  // Composer State
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync when initialMessages update from server
  useEffect(() => {
    setMessages(initialMessages);
    if (selectedMessage) {
      const refreshed = initialMessages.find((m) => m.id === selectedMessage.id);
      if (refreshed) setSelectedMessage(refreshed);
    }
  }, [initialMessages]);

  // When a message is selected, initialize reply subject and text
  const handleOpenMessage = (msg: SupportMessage) => {
    setSelectedMessage(msg);
    setReplySubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setReplyText(msg.admin_reply || '');
    setToastMessage(null);
  };

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // KPIs
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;
  const closedCount = messages.filter((m) => m.status === 'closed').length;
  const responseRate = totalCount > 0 ? Math.round(((repliedCount + closedCount) / totalCount) * 100) : 0;

  // Filtered List
  const filteredMessages = messages.filter((msg) => {
    if (statusFilter !== 'all' && msg.status !== statusFilter) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = msg.customer_name?.toLowerCase().includes(term);
      const matchEmail = msg.customer_email?.toLowerCase().includes(term);
      const matchSubject = msg.subject?.toLowerCase().includes(term);
      const matchMessage = msg.message?.toLowerCase().includes(term);

      if (!matchName && !matchEmail && !matchSubject && !matchMessage) {
        return false;
      }
    }

    return true;
  });

  // Quick Reply Template Presets
  const applyQuickReplyTemplate = (type: 'sizing' | 'shipping' | 'return' | 'care') => {
    if (!selectedMessage) return;
    const name = selectedMessage.customer_name?.trim() || 'Gentile Cliente';

    let template = '';
    switch (type) {
      case 'sizing':
        template = `Gentile ${name},\n\nGrazie per il suo interesse per le creazioni Isabel Pepe.\n\nPer determinare la misura ideale dell'anello le consigliamo di misurare il diametro interno di un anello che indossa abitualmente:\n- Misura IT 12 = 16.5 mm\n- Misura IT 14 = 17.2 mm\n- Misura IT 16 = 17.8 mm\n- Misura IT 18 = 18.5 mm\n\nLe ricordiamo che offriamo il cambio taglia gratuito entro 14 giorni dalla consegna con ritiro a nostro carico tramite corriere espresso.\n\nRestiamo a sua completa disposizione,\nElena & Mario Pepe — Isabel Pepe Concierge`;
        break;
      case 'shipping':
        template = `Gentile ${name},\n\nLa ringraziamo per averci contattato.\n\nIl suo ordine è in fase di preparazione nei nostri laboratori e verrà affidato al corriere espresso con consegna garantita in 24/48 ore lavorative in cofanetto luxury sigillato.\n\nRiceverà una notifica email con il tracking code SDA / GLS non appena il pacco sarà scansionato per la spedizione.\n\nCordiali saluti,\nServizio Clienti Isabel Pepe`;
        break;
      case 'return':
        template = `Gentile ${name},\n\nLe confermiamo che la procedura di reso o cambio gioiello è semplice e completamente gratuita entro 14 giorni dalla consegna.\n\nLe invieremo a breve la lettera di vettura prepagata per il ritiro a domicilio con corriere espresso. Sarà sufficiente riporre il gioiello nel cofanetto originale corredato dal certificato di autenticità.\n\nUn cordiale saluto,\nIsabel Pepe Concierge`;
        break;
      case 'care':
        template = `Gentile ${name},\n\nGrazie per aver scelto l'alta gioielleria Isabel Pepe.\n\nPer preservare la purezza e la lucentezza dei suoi gioielli in argento 925 e placcatura oro 18K a spessore, le consigliamo di evitare il contatto diretto con profumi o saponi aggressivi e di lucidare delicatamente la superficie con il panno professionale incluso nel cofanetto.\n\nRestiamo a sua completa disposizione per ogni consiglio gemmologico,\nIsabel Pepe Atelier`;
        break;
    }

    setReplyText(template);
  };

  // Direct Reply Dispatch via API
  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      setToastMessage({ type: 'error', text: 'Inserisci un messaggio di risposta prima di inviare.' });
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: selectedMessage.id,
          reply_text: replyText.trim(),
          subject: replySubject.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: 'success', text: 'Risposta inviata al cliente con successo via email!' });
        
        // Optimistic State Update
        const updatedMsg: SupportMessage = {
          ...selectedMessage,
          status: 'replied',
          admin_reply: replyText.trim(),
          replied_at: data.replied_at || new Date().toISOString(),
          replied_by: 'Admin Concierge',
        };

        setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? updatedMsg : m)));
        setSelectedMessage(updatedMsg);
      } else {
        setToastMessage({ type: 'error', text: data.error || 'Errore durante l\'invio della risposta.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Errore di connessione al server.' });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Status Toggle
  const handleStatusChange = async (messageId: string, newStatus: SupportMessageStatus) => {
    setIsUpdatingStatus(messageId);
    try {
      const res = await updateMessageStatus(messageId, newStatus);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setToastMessage({ type: 'success', text: `Stato aggiornato a "${getStatusLabel(newStatus)}".` });
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Errore aggiornamento stato.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Errore di connessione.' });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Delete Action
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare definitivamente questo messaggio?')) {
      return;
    }

    setIsUpdatingStatus(messageId);
    try {
      const res = await deleteMessage(messageId);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
        setToastMessage({ type: 'success', text: 'Messaggio eliminato con successo.' });
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Errore eliminazione messaggio.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Errore di connessione.' });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: SupportMessageStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-[#8A5E58] border border-rose-200/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A5E58] animate-pulse" />
            Non Letto
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
            <Clock className="w-3 h-3 text-amber-600" />
            In Attesa
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Risposto
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-xs">
            <Archive className="w-3 h-3 text-gray-500" />
            Chiuso
          </span>
        );
    }
  };

  const getStatusLabel = (status: SupportMessageStatus) => {
    switch (status) {
      case 'unread':
        return 'Non Letto';
      case 'pending':
        return 'In Attesa';
      case 'replied':
        return 'Risposto';
      case 'closed':
        return 'Chiuso';
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-3 transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-[#1A1A1A] text-white border border-[#C0A09A]/40'
              : 'bg-red-900 text-white border border-red-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Sparkles className="w-4 h-4 text-[#C0A09A]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span className="text-[12px] tracking-wide font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareQuote className="w-5 h-5 text-[#8A5E58]" />
            <h1 className="font-serif text-2xl tracking-widest uppercase text-[#1A1A1A]">
              Concierge Inbox &amp; Assistenza
            </h1>
          </div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C0A09A]">
            Gestisci le richieste dei clienti e rispondi con email luxury in 1 click
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per cliente, email o oggetto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-[12px] focus:outline-none focus:border-[#C0A09A] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-xs">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-1">
            Totale Richieste
          </p>
          <p className="font-serif text-2xl text-[#1A1A1A] font-bold">{totalCount}</p>
        </div>

        <div className={`p-4 rounded-md border shadow-xs transition-colors ${
          unreadCount > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A5E58] font-bold">
              Non Letti
            </p>
            {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-[#8A5E58] animate-ping" />}
          </div>
          <p className="font-serif text-2xl text-[#8A5E58] font-bold mt-1">{unreadCount}</p>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-xs">
          <p className="text-[10px] uppercase tracking-[0.15em] text-amber-600 font-semibold mb-1">
            In Attesa
          </p>
          <p className="font-serif text-2xl text-amber-700 font-bold">{pendingCount}</p>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-xs">
          <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-600 font-semibold mb-1">
            Risposti
          </p>
          <p className="font-serif text-2xl text-emerald-700 font-bold">{repliedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-1">
            Tasso Risoluzione
          </p>
          <p className="font-serif text-2xl text-[#C0A09A] font-bold">{responseRate}%</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-md text-[11px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer shrink-0 ${
            statusFilter === 'all'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Tutti ({totalCount})
        </button>

        <button
          onClick={() => setStatusFilter('unread')}
          className={`px-4 py-2 rounded-md text-[11px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer shrink-0 ${
            statusFilter === 'unread'
              ? 'bg-[#8A5E58] text-white shadow-xs'
              : 'text-[#8A5E58] hover:bg-rose-50'
          }`}
        >
          Non Letti ({unreadCount})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-md text-[11px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer shrink-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          In Attesa ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('replied')}
          className={`px-4 py-2 rounded-md text-[11px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer shrink-0 ${
            statusFilter === 'replied'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Risposti ({repliedCount})
        </button>

        <button
          onClick={() => setStatusFilter('closed')}
          className={`px-4 py-2 rounded-md text-[11px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer shrink-0 ${
            statusFilter === 'closed'
              ? 'bg-gray-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Chiusi ({closedCount})
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-md shadow-xs overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquareQuote className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-serif text-lg text-gray-600 mb-1">Nessun messaggio trovato</p>
            <p className="text-[12px]">Nessuna richiesta corrisponde ai criteri di ricerca selezionati.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                  <th className="py-3.5 px-4">Stato</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Oggetto &amp; Anteprima</th>
                  <th className="py-3.5 px-4">Data Ricezione</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px]">
                {filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-[#FAF8F6] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#FAF4F2]' : ''
                      } ${msg.status === 'unread' ? 'bg-rose-50/20 font-medium' : ''}`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(msg.status)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{msg.customer_name}</div>
                        <div className="text-gray-400 text-[11px]">{msg.customer_email}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-medium text-gray-900 truncate">{msg.subject}</div>
                        <div className="text-gray-500 text-[11px] truncate line-clamp-1">
                          {msg.message}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white rounded text-[10px] uppercase tracking-[0.1em] font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Dettaglio</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {/* Quick Status Toggle */}
                          {msg.status === 'unread' && (
                            <button
                              disabled={isUpdatingStatus === msg.id}
                              onClick={() => handleStatusChange(msg.id, 'pending')}
                              title="Segna in attesa"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {msg.status !== 'closed' && (
                            <button
                              disabled={isUpdatingStatus === msg.id}
                              onClick={() => handleStatusChange(msg.id, 'closed')}
                              title="Chiudi ticket"
                              className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors cursor-pointer"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            disabled={isUpdatingStatus === msg.id}
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Elimina definitivamente"
                            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Luxury Detail Viewer & Direct Reply Modal / Drawer */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 bg-[#FAF8F6] sticky top-0 z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A5E58]">
                    Ticket #{selectedMessage.id.substring(0, 8).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <h2 className="font-serif text-xl text-[#1A1A1A] mt-1 font-semibold">
                  {selectedMessage.subject}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Customer Information Card */}
              <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A5E58] font-bold">
                  Informazioni Cliente &amp; Telemetria
                </p>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Nome</span>
                      <strong>{selectedMessage.customer_name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Email</span>
                      <a
                        href={`mailto:${selectedMessage.customer_email}`}
                        className="text-[#8A5E58] underline font-medium hover:text-[#C0A09A]"
                      >
                        {selectedMessage.customer_email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Data Ricezione</span>
                      <span>{formatDate(selectedMessage.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Indirizzo IP</span>
                      <span className="font-mono text-[11px]">{selectedMessage.ip_address || 'Non disponibile'}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata & User Agent */}
                {selectedMessage.user_agent && (
                  <div className="pt-2 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-500">
                    <Monitor className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">{selectedMessage.user_agent}</span>
                  </div>
                )}

                {selectedMessage.metadata && Object.keys(selectedMessage.metadata).length > 0 && (
                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded">
                    <p className="font-semibold text-gray-700 mb-1 text-[10px] uppercase tracking-wider">Metadati &amp; Fonti:</p>
                    <pre className="font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedMessage.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Original Customer Message Box */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A5E58] font-bold">
                  Messaggio del Cliente:
                </p>
                <div className="bg-[#FAF8F6] border-l-4 border-[#C0A09A] p-4 rounded-r-md text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Existing Admin Reply History (if replied) */}
              {selectedMessage.admin_reply && (
                <div className="space-y-2 bg-emerald-50/50 border border-emerald-200/80 rounded-md p-4">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-800 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Risposta Inviata dal Concierge</span>
                    </div>
                    <span>{formatDate(selectedMessage.replied_at)}</span>
                  </div>
                  <div className="text-[12px] leading-relaxed text-emerald-950 whitespace-pre-wrap pt-2">
                    {selectedMessage.admin_reply}
                  </div>
                  {selectedMessage.replied_by && (
                    <p className="text-[10px] text-emerald-700/80 italic pt-1">
                      Inviata da: {selectedMessage.replied_by}
                    </p>
                  )}
                </div>
              )}

              {/* One-Click Direct Reply Composer Section */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C0A09A]" />
                    <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">
                      Componi Risposta Luxury
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-semibold">
                    via Resend API
                  </span>
                </div>

                {/* 4 Luxury Quick-Reply Preset Buttons */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                    Modelli Rapidi Preimpostati:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickReplyTemplate('sizing')}
                      className="p-2.5 bg-gray-50 hover:bg-[#FAF4F2] hover:border-[#C0A09A] border border-gray-200 rounded text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-[#8A5E58] font-medium text-[11px]">
                        <Gem className="w-3.5 h-3.5" />
                        <span>1. Consiglio Misura / Taglia</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        Guida diametri anelli &amp; cambio taglia gratuito
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyQuickReplyTemplate('shipping')}
                      className="p-2.5 bg-gray-50 hover:bg-[#FAF4F2] hover:border-[#C0A09A] border border-gray-200 rounded text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-[#8A5E58] font-medium text-[11px]">
                        <Truck className="w-3.5 h-3.5" />
                        <span>2. Spedizione &amp; Tracking</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        Consegna 24/48h SDA/GLS &amp; cofanetto
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyQuickReplyTemplate('return')}
                      className="p-2.5 bg-gray-50 hover:bg-[#FAF4F2] hover:border-[#C0A09A] border border-gray-200 rounded text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-[#8A5E58] font-medium text-[11px]">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>3. Richiesta Reso / Cambio</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        Procedura reso 14 giorni &amp; lettera di vettura
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyQuickReplyTemplate('care')}
                      className="p-2.5 bg-gray-50 hover:bg-[#FAF4F2] hover:border-[#C0A09A] border border-gray-200 rounded text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-[#8A5E58] font-medium text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>4. Cura del Gioiello</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        Manutenzione argento 925, oro 18K &amp; panno
                      </p>
                    </button>
                  </div>
                </div>

                {/* Reply Subject */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
                    Oggetto Email Risposta
                  </label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] focus:outline-none focus:border-[#C0A09A]"
                  />
                </div>

                {/* Reply Textarea */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
                    Testo Risposta al Cliente
                  </label>
                  <textarea
                    rows={7}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Scrivi qui la risposta personalizzata da inviare alla casella del cliente..."
                    className="w-full p-3 bg-white border border-gray-200 rounded text-[12px] leading-relaxed focus:outline-none focus:border-[#C0A09A]"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  disabled={isSendingReply || !replyText.trim()}
                  onClick={handleSendReply}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-[#8A5E58] disabled:bg-gray-300 text-white rounded font-sans text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSendingReply ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Invio Risposta in corso...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C0A09A]" />
                      <span>Invia Risposta al Cliente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Actions & Ticket Management */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                  Gestione Stato Ticket:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'unread')}
                    disabled={selectedMessage.status === 'unread' || isUpdatingStatus === selectedMessage.id}
                    className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 rounded text-[11px] font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    Segna come Non Letto
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'pending')}
                    disabled={selectedMessage.status === 'pending' || isUpdatingStatus === selectedMessage.id}
                    className="px-3 py-1.5 border border-amber-200 bg-amber-50/50 hover:bg-amber-100 disabled:opacity-50 rounded text-[11px] font-medium text-amber-800 transition-colors cursor-pointer"
                  >
                    Segna come In Attesa
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'closed')}
                    disabled={selectedMessage.status === 'closed' || isUpdatingStatus === selectedMessage.id}
                    className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 rounded text-[11px] font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    Segna come Chiuso
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    disabled={isUpdatingStatus === selectedMessage.id}
                    className="px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium transition-colors cursor-pointer ml-auto flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Elimina Ticket</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
