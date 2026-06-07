import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PUBLICATION_CREATED_EVENT,
  useCreatePublication,
} from '../context/CreatePublicationContext';
import { RoleBadge, UserStatusBadge } from '../components/Badge';
import Button from '../components/Button';
import PublicationCard from '../components/PublicationCard';
import { getPublications } from '../api/publication.service';
import type { Publication } from '../types';

function ProfileAvatar({
  firstName,
  lastName,
  photoUrl,
}: {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className="h-24 w-24 rounded-full object-cover ring-4 ring-red-100 lg:h-28 lg:w-28"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white ring-4 ring-red-100 lg:h-28 lg:w-28">
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { openCreatePublication } = useCreatePublication();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const fetchPublications = async () => {
    setLoadingFeed(true);
    try {
      const data = await getPublications(undefined, 1, 10);
      setPublications(data.items);
    } catch (err) {
      console.error('Error fetching publications:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPublications();
    }
  }, [user]);

  useEffect(() => {
    const handler = () => fetchPublications();
    window.addEventListener(PUBLICATION_CREATED_EVENT, handler);
    return () => window.removeEventListener(PUBLICATION_CREATED_EVENT, handler);
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Hola, {user.firstName}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Tu comunidad pedagógica
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/chatbot"
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
          >
            <span aria-hidden>💬</span>
            Ir al Chatbot
          </Link>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            Ver todas las publicaciones
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* 1. Feed — columna izquierda */}
        <section className="order-1 lg:col-span-7">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-red-100">
            <div className="flex items-center justify-between gap-4 border-b border-red-50 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Publicaciones recientes
                </h2>
                <p className="text-sm text-slate-600">
                  Lo más nuevo de tus colegas docentes
                </p>
              </div>
              <Button
                size="sm"
                className="hidden md:inline-flex"
                onClick={openCreatePublication}
              >
                + Crear Publicación
              </Button>
            </div>

            <div className="space-y-3 p-6">
              {loadingFeed ? (
                <p className="text-sm text-slate-500">Cargando publicaciones...</p>
              ) : publications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/50 px-6 py-10 text-center">
                  <p className="text-sm text-slate-600">
                    Aún no hay publicaciones. ¡Sé el primero en compartir!
                  </p>
                  <Button className="mt-4" onClick={openCreatePublication}>
                    + Crear Publicación
                  </Button>
                </div>
              ) : (
                publications.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    pub={pub}
                    onDelete={fetchPublications}
                  />
                ))
              )}
            </div>

            {publications.length > 0 && (
              <div className="border-t border-red-50 px-6 py-4">
                <Link
                  to="/feed"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Ver todas las publicaciones →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 2. Perfil — bloque central */}
        <section className="order-2 lg:col-span-3">
          <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-red-100 lg:sticky lg:top-24">
            <ProfileAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              photoUrl={profile?.profile?.photoUrl}
            />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </h2>
            {profile?.profile?.area && (
              <p className="mt-1 text-sm text-slate-600">
                {profile.profile.area}
              </p>
            )}
            {profile?.profile?.description && (
              <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                {profile.profile.description}
              </p>
            )}
            <Link
              to="/perfil"
              className="mt-4 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Editar perfil →
            </Link>
          </div>
        </section>

        {/* 3. Detalles — bloque derecho */}
        <section className="order-3 lg:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-100">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Rol
              </p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-100">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Estado
              </p>
              <div className="mt-2">
                <UserStatusBadge status={user.status} />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-100">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Correo
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">
                {user.institutionalEmail}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
