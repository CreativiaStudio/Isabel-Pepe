'use client';

import { useState, useEffect, useRef } from 'react';
import { getMediaLibrary } from './actions';
import { X, Search, Image as ImageIcon, RotateCcw, Download, Upload, Loader2, Check } from 'lucide-react';

interface MediaFile {
  key: string;
  url: string;
  size: number;
  lastModified?: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialSearch?: string;
}

async function compressImageClient(file: File): Promise<File> {
  if (file.size < 1024 * 1024 || !file.type.startsWith('image/')) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, initialSearch = '' }: Props) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch(initialSearch);
      loadMedia();
    }
  }, [isOpen, initialSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/media', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          setMedia(data.files as MediaFile[]);
          setLoading(false);
          return;
        }
      }
      const files = await getMediaLibrary();
      setMedia(files as MediaFile[]);
    } catch (err) {
      console.error("Error loading media:", err);
      try {
        const files = await getMediaLibrary();
        setMedia(files as MediaFile[]);
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleModalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedFile = await compressImageClient(file);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'products');
      formData.append('customName', `isabel-pepe-media-${Date.now()}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Errore durante il caricamento');
      }

      // Reload media library and automatically select the newly uploaded image
      await loadMedia();
      onSelect(data.url);
      onClose();
    } catch (err: any) {
      console.error("Modal upload error:", err);
      alert(`Errore caricamento: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  const filteredMedia = media.filter(m => {
    const isImage = /\.(webp|jpg|jpeg|png|gif|svg|avif)$/i.test(m.key);
    if (!isImage) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    const normalizedName = m.name.toLowerCase().replace(/[-_]+/g, ' ');
    const normalizedKey = m.key.toLowerCase().replace(/[-_]+/g, ' ');
    const rawName = m.name.toLowerCase();
    const rawKey = m.key.toLowerCase();

    return tokens.every(token => 
      rawName.includes(token) || 
      rawKey.includes(token) || 
      normalizedName.includes(token) || 
      normalizedKey.includes(token)
    );
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-[#FAF8F7] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F5EBE9] text-[#C0A09A] rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif tracking-wide text-gray-900">Libreria Media Cloudflare R2</h2>
              <p className="text-xs text-gray-500 font-sans">Clicca su una foto per associarla allo slot selezionato</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleModalUpload} 
              className="hidden" 
            />
            <button 
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white text-xs px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Caricamento...' : 'Carica Nuova Foto'}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 rounded-full transition-colors"
              title="Chiudi (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-white shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca per nome gioiello o SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#C0A09A] focus:ring-2 focus:ring-[#C0A09A]/20 transition-all"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Cancella ricerca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-gray-500">
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')} 
                className="flex items-center gap-1 text-[#C0A09A] hover:underline font-medium"
              >
                <RotateCcw size={12} /> Mostra tutti i file
              </button>
            )}
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
              {filteredMedia.length} file trovati in R2
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="w-8 h-8 border-4 border-[#C0A09A] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-sans">Connessione e lettura da Cloudflare R2...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <ImageIcon className="w-16 h-16 mb-4 opacity-40 text-gray-300" />
              <p className="text-base font-medium text-gray-700 mb-1">
                {search ? `Nessun file trovato per "${search}"` : 'Nessuna immagine trovata su R2'}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {search ? 'Prova a cancellare i filtri per vedere tutti gli asset.' : 'Carica la tua prima foto premendo il tasto "Carica Nuova Foto" in alto.'}
              </p>
              {search && (
                <button 
                  type="button"
                  onClick={() => setSearch('')}
                  className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  Resetta Ricerca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((file) => {
                const isVideo = file.name.endsWith('.mp4') || file.name.endsWith('.webm');
                const safeUrl = encodeURI(file.url);
                return (
                  <div 
                    key={file.key} 
                    onClick={() => {
                      onSelect(file.url);
                      onClose();
                    }}
                    className="group relative aspect-square rounded-xl border border-gray-200 bg-white overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#C0A09A] transition-all hover:shadow-md"
                  >
                    {/* Tasto Download in alto a destra */}
                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, file.url, file.name)}
                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-[#C0A09A] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md z-20 hover:scale-110"
                      title="Scarica file sul PC"
                    >
                      <Download size={14} />
                    </button>

                    {isVideo ? (
                      <video src={safeUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={safeUrl} 
                        alt={file.name} 
                        loading="lazy" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    )}
                    
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-end gap-2">
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate" title={file.name}>{file.name}</p>
                          <p className="text-white/70 text-[10px] mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDownload(e, file.url, file.name)}
                          className="text-white/90 hover:text-white flex items-center gap-1 text-[10px] bg-white/20 hover:bg-[#C0A09A] px-2 py-1 rounded transition shrink-0"
                          title="Scarica sul PC"
                        >
                          <Download size={10} /> Scarica
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
