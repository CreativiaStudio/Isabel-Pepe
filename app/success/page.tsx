import type { Metadata } from 'next';
import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

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
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F6]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0A09A]"></div>
      </div>
    }>
      <SuccessClient />
    </Suspense>
  );
}
