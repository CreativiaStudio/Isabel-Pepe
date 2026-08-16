import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ordine Confermato',
  description:
    'Grazie per il tuo acquisto su Isabel Pepe. Il tuo ordine è stato confermato con successo e stiamo preparando i tuoi gioielli con la massima cura.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-6 bg-[#FAFAFA]">
      <div className="bg-white p-12 md:p-20 shadow-sm max-w-2xl w-full text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-6 text-[#C0A09A]" />
        
        <h1 className="font-serif text-3xl md:text-4xl tracking-widest uppercase mb-4 text-[#1A1A1A]">
          Ordine Confermato
        </h1>
        
        <p className="font-sans text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Grazie per il tuo acquisto su Isabel Pepe. Abbiamo ricevuto il tuo ordine e lo stiamo già elaborando.
        </p>

        <div className="bg-gray-50 p-6 mb-10 text-left text-sm text-gray-700 space-y-3 font-sans">
          <p>
            <strong>Cosa succede ora?</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 opacity-80 text-xs">
            <li>Riceverai a breve un'email di riepilogo con i dettagli dell'ordine.</li>
            <li>Inizieremo subito a preparare il tuo gioiello con la massima cura.</li>
            <li>Non appena il pacco sarà affidato al corriere, ti invieremo un'altra email con il codice di tracciamento.</li>
          </ul>
        </div>

        <Link 
          href="/shop"
          className="inline-block bg-[#1A1A1A] hover:bg-[#C0A09A] text-white py-4 px-10 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Torna allo Shop
        </Link>
      </div>
    </div>
  );
}
