import { useEffect, useState, useCallback } from 'react';
import { getPublications } from '../api/publication.service';
import { getCategories, type Category } from '../api/category.service';
import type { Publication } from '../types';
import PublicationCard from '../components/PublicationCard';
import Button from '../components/Button';
import {
  PUBLICATION_CREATED_EVENT,
  useCreatePublication,
} from '../context/CreatePublicationContext';

export default function FeedPage() {
  const { openCreatePublication } = useCreatePublication();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    getCategories()
      .then(setAvailableCategories)
      .catch(() => {});
  }, []);

  const fetchPublications = useCallback(async (tagIds: number[] = [], pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublications(tagIds.length > 0 ? tagIds : undefined, pageNum, 10);
      if (pageNum === 1) {
        setPublications(data.items);
      } else {
        setPublications((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = data.items.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      setError('No se pudieron cargar las publicaciones.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPublications(selectedTagIds, 1);
  }, [selectedTagIds, fetchPublications]);

  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchPublications(selectedTagIds, 1);
    };
    window.addEventListener(PUBLICATION_CREATED_EVENT, handler);
    return () => window.removeEventListener(PUBLICATION_CREATED_EVENT, handler);
  }, [selectedTagIds, fetchPublications]);

  const handleLoadMore = () => {
    if (isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPublications(selectedTagIds, nextPage);
  };

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const clearFilters = () => setSelectedTagIds([]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-100">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Feed de Publicaciones
          </h1>
          <Button
            className="hidden md:inline-flex"
            onClick={openCreatePublication}
          >
            + Crear Publicación
          </Button>
        </div>

        {availableCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filtrar por:
            </span>
            {availableCategories.map((cat) => {
              const active = selectedTagIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleTag(cat.id)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            {selectedTagIds.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-slate-400 underline transition-colors hover:text-brand-600"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando publicaciones...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : publications.length === 0 ? (
          <p className="text-sm text-slate-500">
            {selectedTagIds.length > 0
              ? 'No hay publicaciones para las categorías seleccionadas.'
              : 'No hay publicaciones todavía.'}
          </p>
        ) : (
          publications.map((pub) => (
            <PublicationCard
              key={pub.id}
              pub={pub}
              onDelete={() => fetchPublications(selectedTagIds, 1)}
            />
          ))
        )}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Cargar más'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
