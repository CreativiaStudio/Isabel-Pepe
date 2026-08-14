'use client'

import React, { useState } from 'react';
import { addProduct } from './actions';
import { UploadCloud, Plus, Loader2, Images } from 'lucide-react';

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [galleryCount, setGalleryCount] = useState(0);
  const [category, setCategory] = useState('Collane');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const result = await addProduct(formData);
    
    if (result.error) {
      setMessage(`❌ Errore: ${result.error}`);
    } else {
      setMessage('✅ Prodotto aggiunto con successo a Supabase e Stripe!');
      (e.target as HTMLFormElement).reset();
      setGalleryCount(0);
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-medium mb-6 border-b pb-4">Aggiungi Nuovo</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md text-sm ${message.includes('Errore') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nome Gioiello</label>
            <input type="text" name="name" required className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm" placeholder="Es. Collana Old Money" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Prezzo (€)</label>
              <input type="number" step="0.01" name="price" required className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm" placeholder="145.00" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" name="stock" defaultValue="10" required className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm bg-white">
              <option value="Collane">Collane</option>
              <option value="Bracciali">Bracciali</option>
              <option value="Orecchini">Orecchini</option>
              <option value="Anelli">Anelli</option>
              <option value="Set">Set Lusso</option>
            </select>
          </div>

          {category === 'Anelli' && (
            <div className="bg-[#FAF8F7] p-3 rounded-md border border-[#E8E0DE]">
              <label className="block text-xs font-medium text-gray-700 mb-2">Misure</label>
              <div className="flex flex-wrap gap-2">
                {[10, 12, 14, 16, 18, 20].map((size) => (
                  <label key={size} className="flex items-center gap-1 bg-white px-2 py-1 rounded border cursor-pointer hover:border-[#C0A09A]">
                    <input type="checkbox" name="sizes" value={size.toString()} className="accent-[#C0A09A] w-3 h-3" />
                    <span className="text-xs">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Placcatura</label>
            <select name="plating" className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm bg-white">
              <option value="Nessuna">Nessuna</option>
              <option value="Oro 18K 1 micron + e-coating">Oro 18K 1 micron + e-coating</option>
              <option value="Rodio + 1 micron">Rodio + 1 micron</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pietre</label>
            <select name="gemstone" className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm bg-white">
              <option value="Nessuna">Nessuna</option>
              <option value="Moissanite con certificato GRA">Moissanite con certificato GRA</option>
              <option value="Perle di acqua dolce">Perle di acqua dolce</option>
              <option value="Zirconi">Zirconi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Foto Primaria (Sfondo Neutro)</label>
            <input type="file" name="imagePrimary" accept="image/*" required className="text-xs text-gray-500 w-full border p-1 rounded" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Foto Hover (Indossata)</label>
            <input type="file" name="imageSecondary" accept="image/*" className="text-xs text-gray-500 w-full border p-1 rounded" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#1A1A1A] hover:bg-[#C0A09A] text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-4 text-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          {loading ? 'Salvataggio...' : 'Salva Prodotto'}
        </button>
      </form>
    </div>
  );
}
