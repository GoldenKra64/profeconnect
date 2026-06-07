import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import CreatePublicationModal from '../components/CreatePublicationModal';

export const PUBLICATION_CREATED_EVENT = 'profeconnect:publication-created';

interface CreatePublicationContextValue {
  openCreatePublication: () => void;
}

const CreatePublicationContext =
  createContext<CreatePublicationContextValue | null>(null);

export function CreatePublicationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCreatePublication = useCallback(() => setOpen(true), []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent(PUBLICATION_CREATED_EVENT));
  }, []);

  return (
    <CreatePublicationContext.Provider value={{ openCreatePublication }}>
      {children}
      <CreatePublicationModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </CreatePublicationContext.Provider>
  );
}

export function useCreatePublication() {
  const ctx = useContext(CreatePublicationContext);
  if (!ctx) {
    throw new Error(
      'useCreatePublication debe usarse dentro de CreatePublicationProvider'
    );
  }
  return ctx;
}
