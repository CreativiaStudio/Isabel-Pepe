import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accedi al tuo Account',
  description:
    'Accedi alla tua area riservata Isabel Pepe per gestire comodamente i tuoi ordini, i tuoi dati personali e la lista desideri in totale sicurezza.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
