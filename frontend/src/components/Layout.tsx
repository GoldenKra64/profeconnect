import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingOnboardingTips from './FloatingOnboardingTips';
import { CreatePublicationProvider, useCreatePublication } from '../context/CreatePublicationContext';

function FloatingCreateButton() {
  const { openCreatePublication } = useCreatePublication();

  return (
    <button
      type="button"
      onClick={openCreatePublication}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-xl md:hidden"
      aria-label="Crear publicación"
    >
      +
    </button>
  );
}

function LayoutContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>
      <FloatingOnboardingTips />
      <FloatingCreateButton />
    </div>
  );
}

export default function Layout() {
  return (
    <CreatePublicationProvider>
      <LayoutContent />
    </CreatePublicationProvider>
  );
}
