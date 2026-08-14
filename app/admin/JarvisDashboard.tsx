'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, TrendingUp, Users, ShoppingCart, Sparkles, Loader2,
  Megaphone, Heart, Package, ArrowUpRight, Zap, Target, RefreshCw,
  Mic, MicOff, Send, CheckCircle, Volume2, VolumeX, Play
} from 'lucide-react';

interface JarvisProps {
  stats: {
    totalViews: number;
    activeCarts: number;
    todaySales: number;
  };
}

interface JarvisTip {
  category: 'marketing' | 'crm' | 'operations';
  title: string;
  description: string;
  impact: number;
  kpi: string;
  action_label?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  action?: string | null;
  actionDone?: string | null;
  timestamp: Date;
}

const categoryConfig = {
  marketing: {
    icon: Megaphone,
    label: 'MARKETING',
    gradient: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    glow: 'shadow-violet-200/60',
    bar: 'bg-gradient-to-r from-violet-400 to-fuchsia-500',
  },
  crm: {
    icon: Heart,
    label: 'RELAZIONE CLIENTI',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    glow: 'shadow-rose-200/60',
    bar: 'bg-gradient-to-r from-rose-400 to-pink-500',
  },
  operations: {
    icon: Package,
    label: 'OPERAZIONI',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    glow: 'shadow-amber-200/60',
    bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
};

function TipCard({ tip, index, onApprove, onDiscuss }: { tip: JarvisTip; index: number; onApprove: (tip: JarvisTip) => void; onDiscuss: (tip: JarvisTip) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const [approved, setApproved] = useState(false);
  const config = categoryConfig[tip.category] || categoryConfig.marketing;
  const Icon = config.icon;

  useEffect(() => {
    const t1 = setTimeout(() => setIsVisible(true), index * 250);
    const t2 = setTimeout(() => setBarWidth(tip.impact), index * 250 + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [index, tip.impact]);

  const handleApprove = () => {
    setApproved(true);
    onApprove(tip);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white transition-all duration-700 ease-out
        ${config.border} ${isVisible ? 'opacity-100 translate-y-0 shadow-lg ' + config.glow : 'opacity-0 translate-y-8'}
        hover:shadow-xl hover:-translate-y-0.5`}
    >
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${config.badge} mb-1`}>
                {config.label}
              </span>
              <h3 className="font-serif text-[14px] text-gray-900 leading-snug tracking-wide">{tip.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0 ml-2">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-[9px] font-bold tracking-wider whitespace-nowrap">{tip.kpi}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed mb-4 pl-[52px]">{tip.description}</p>

        <div className="pl-[52px] mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-medium">Impatto stimato</span>
            <span className="text-xs font-bold text-gray-700">{tip.impact}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${config.bar} transition-all duration-1000 ease-out`} style={{ width: `${barWidth}%` }} />
          </div>
        </div>

        {/* Action buttons */}
        {tip.action_label && (
          <div className="pl-[52px]">
            {approved ? (
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Azione inviata a Jarvis!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDiscuss(tip)}
                  className={`flex-1 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all hover:shadow-sm active:scale-95`}
                >
                  💬 Discuti
                </button>
                <button
                  onClick={handleApprove}
                  className={`flex-1 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 transition-all hover:shadow-md active:scale-95`}
                >
                  ✓ {tip.action_label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JarvisDashboard({ stats }: JarvisProps) {
  const [tips, setTips] = useState<JarvisTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [tipsError, setTipsError] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);
  const [lastModelUsed, setLastModelUsed] = useState('claude-haiku-4-5-20251001');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ElevenLabs Text-to-speech
  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(true);
    
    try {
      const res = await fetch('/api/jarvis/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) throw new Error('TTS Failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = () => setIsSpeaking(false);
      
      audio.play();
    } catch (err) {
      console.error('Audio play error:', err);
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  // Speech-to-text
  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Il tuo browser non supporta il riconoscimento vocale. Usa Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Fetch strategic tips
  const fetchTips = async () => {
    setIsLoadingTips(true);
    setTipsError(false);
    setTips([]);
    try {
      const res = await fetch('/api/jarvis', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.structured && Array.isArray(data.tips)) {
        setTips(data.tips);
      } else if (data.tips?.length > 0) {
        const fallback = data.tips.map((t: string, i: number) => ({
          category: ['marketing', 'crm', 'operations'][i % 3] as JarvisTip['category'],
          title: t.substring(0, 45),
          description: t,
          impact: 70 + i * 10,
          kpi: 'Analisi IA',
          action_label: 'Esegui',
        }));
        setTips(fallback);
      }
    } catch {
      setTipsError(true);
    } finally {
      setIsLoadingTips(false);
    }
  };



  useEffect(() => { fetchTips(); }, [isPremium]);

  // Handle tip approval → send to Action Engine API
  const handleApprove = async (tip: JarvisTip) => {
    try {
      if ((tip as any).id) {
        const res = await fetch('/api/jarvis/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: (tip as any).id })
        });
        if (!res.ok) throw new Error();
      }
      const approvalMsg = `ok falla — ${tip.action_label}: ${tip.title}`;
      sendMessage(approvalMsg);
      // Rimuovi la tip dalla lista dopo averla eseguita
      setTimeout(() => setTips(prev => prev.filter(t => t !== tip)), 2000);
    } catch (e) {
      alert("Errore durante l'esecuzione del task.");
    }
  };

  const handleDiscuss = (tip: JarvisTip) => {
    setInput(`Riguardo la proposta "${tip.title}": vorrei modificarla. `);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Send chat message
  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isChatLoading) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
          isPremium
        }),
      });
      const data = await res.json();
      
      if (data.modelUsed) {
        setLastModelUsed(data.modelUsed);
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply || 'Errore nella risposta.',
        action: data.action || null,
        actionDone: data.actionDone || null,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, assistantMsg]);
      speak(data.reply || '');
    } catch {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'Si è verificato un errore di connessione.',
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A] flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-[#C0A09A]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            JARVIS AI
          </h1>
          <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">
            Consulente IA proattivo &middot; Powered by Claude 4.5 Haiku
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-[#C4A484] focus:ring-[#C4A484]" 
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">Account Premium</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input 
              type="checkbox" 
              className="rounded text-emerald-500 focus:ring-emerald-500" 
              checked={autoPilot}
              onChange={(e) => setAutoPilot(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">🚀 Pilota Automatico</span>
          </label>
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-full">
            <div className={`w-2 h-2 rounded-full ${lastModelUsed === 'claude-fable-5' ? 'bg-purple-500' : lastModelUsed === 'claude-sonnet-5' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-xs font-semibold text-indigo-700">
              {lastModelUsed === 'claude-fable-5' ? 'Manager (Fable 5)' : lastModelUsed === 'claude-sonnet-5' ? 'Quadrista (Sonnet 5)' : 'Operaio (Haiku 4.5)'}
            </span>
          </div>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)} title={voiceEnabled ? 'Disattiva voce' : 'Attiva voce'}
            className={`p-2 rounded-full border transition-colors ${voiceEnabled ? 'bg-[#C0A09A]/10 border-[#C0A09A]/40 text-[#C0A09A]' : 'border-gray-200 text-gray-400'}`}>
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={fetchTips} disabled={isLoadingTips} title="Rigenera analisi"
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingTips ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, color: 'blue', label: 'Pagine Viste', value: stats.totalViews.toLocaleString('it-IT') },
          { icon: ShoppingCart, color: 'orange', label: 'Carrelli Sospesi', value: String(stats.activeCarts) },
          { icon: Users, color: 'emerald', label: 'Vendite Oggi', value: `€${stats.todaySales.toFixed(2)}` },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`bg-${color}-50 p-3 rounded-xl text-${color}-500`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-serif text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Cards */}
      <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#C0A09A]" />
            <div>
              <h2 className="font-serif text-white text-sm tracking-widest uppercase">Analisi Strategica</h2>
              <p className="text-[10px] text-gray-500 tracking-wider mt-0.5">Approva un'azione per eseguirla</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-purple-400' : 'bg-emerald-400'} animate-pulse`} />
            <span className={`text-[9px] ${isPremium ? 'text-purple-400' : 'text-emerald-400'} font-mono uppercase tracking-widest`}>
              {isPremium ? 'Team Strategico (Fable 5 + Sonnet)' : 'Claude 4.5 Haiku'}
            </span>
          </div>
        </div>

        <div className="p-5">
          {isLoadingTips && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="relative">
                <div className="w-14 h-14 border-2 border-[#C0A09A]/20 rounded-full" />
                <div className="absolute inset-0 w-14 h-14 border-2 border-t-[#C0A09A] rounded-full animate-spin" />
                <Bot className="absolute inset-0 m-auto w-5 h-5 text-[#C0A09A]" />
              </div>
              <p className="text-white/50 text-sm font-mono tracking-wider">Interrogazione neurale...</p>
            </div>
          )}
          {tipsError && !isLoadingTips && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Target className="w-8 h-8 text-red-400" />
              <p className="text-white/40 text-sm">Connessione ai server neurali non riuscita</p>
              <button onClick={fetchTips} className="text-[10px] uppercase tracking-widest text-[#C0A09A] border border-[#C0A09A]/30 px-4 py-2 rounded-full hover:bg-[#C0A09A]/10 transition-colors">
                Riprova
              </button>
            </div>
          )}
          {!isLoadingTips && !tipsError && tips.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {tips.map((tip, i) => (
                <TipCard key={i} tip={tip} index={i} onApprove={handleApprove} onDiscuss={handleDiscuss} />
              ))}
            </div>
          )}
          {!isLoadingTips && !tipsError && tips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
              <p className="text-white/40 text-sm">Nessun task in coda. Il sistema è ottimizzato.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#C0A09A]" />
            <span className="font-serif tracking-widest text-sm uppercase text-[#C0A09A]">Parla con Jarvis</span>
          </div>
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="flex items-center gap-1.5 text-[9px] text-amber-400 border border-amber-400/30 px-2 py-1 rounded-full hover:bg-amber-400/10 transition-colors">
                <Volume2 className="w-3 h-3 animate-pulse" /> Stop voce
              </button>
            )}
            <span className="text-[9px] text-gray-500 tracking-wider">
              {voiceEnabled ? '🔊 Voce attiva' : '🔇 Voce off'}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-72 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#C4A484]/20 to-transparent rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-[#C4A484]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-medium mb-1">Sono Jarvis, il tuo assistente.</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {isPremium 
                    ? "Account Premium attivo. Gestirò le richieste semplici io, e passerò le analisi o decisioni importanti ai miei superiori Sonnet 5 e Fable 5."
                    : "Account Standard. Le mie risposte sono vincolate al business. Riceverai un report automatico ogni mattina e una strategia settimanale."}
                </p>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button onClick={async () => {
                  const res = await fetch(`/api/cron/daily-report?autoPilot=${autoPilot}`);
                  const data = await res.json();
                  setChatHistory(prev => [...prev, { role: 'assistant', content: `**[SYSTEM - DAILY REPORT SONNET 5]**\n${data.report}\n\nTask auto-creata. ${autoPilot ? 'Già Eseguita.' : 'In attesa di approvazione nella Dashboard.'}`, timestamp: new Date() }]);
                  fetchTips();
                }} className="px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition">
                  Simula Daily Cron (Sonnet 5)
                </button>
                <button onClick={async () => {
                  const res = await fetch(`/api/cron/weekly-strategy?autoPilot=${autoPilot}`);
                  const data = await res.json();
                  setChatHistory(prev => [...prev, { role: 'assistant', content: `**[SYSTEM - WEEKLY STRATEGY FABLE 5]**\n${data.report}\n\nTask auto-creata. ${autoPilot ? 'Già Eseguita.' : 'In attesa di approvazione nella Dashboard.'}`, timestamp: new Date() }]);
                  fetchTips();
                }} className="px-4 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition">
                  Simula Weekly Cron (Fable 5)
                </button>
              </div>
            </div>
          ) : (chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1A1A1A] text-white px-4 py-3'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm px-4 py-3'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.action && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                    <Play className="w-3 h-3 text-[#C0A09A] flex-shrink-0" />
                    <span className="text-[10px] text-[#C0A09A] uppercase tracking-wider font-medium">
                      Azione pronta: {msg.action}
                    </span>
                  </div>
                )}
                {msg.actionDone && (
                  <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">
                      Eseguito: {msg.actionDone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C0A09A]" />
                <span className="text-xs text-gray-500">Jarvis sta elaborando...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
          <button
            type="button"
            onClick={toggleListening}
            disabled={isChatLoading}
            className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
              isListening
                ? 'bg-red-50 border-red-300 text-red-500 animate-pulse'
                : 'border-gray-200 text-gray-400 hover:border-[#C0A09A] hover:text-[#C0A09A]'
            } disabled:opacity-40`}
            title={isListening ? 'Ferma registrazione' : 'Parla con Jarvis'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isChatLoading || isListening}
            placeholder={isListening ? '🔴 Sto ascoltando...' : 'Scrivi o parla con Jarvis...'}
            className="flex-1 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:border-[#C0A09A] outline-none transition-colors disabled:opacity-50 bg-gray-50"
          />
          <button
            type="submit"
            disabled={isChatLoading || !input.trim()}
            className="p-3 rounded-xl bg-[#C0A09A] hover:bg-[#a88a84] disabled:opacity-40 text-white transition-all flex-shrink-0 hover:shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
