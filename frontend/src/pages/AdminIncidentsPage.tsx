import { useEffect, useMemo, useState } from 'react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { extractErrorMessage } from '../api/client';
import { getPendingIncidents, resolveIncident } from '../api/incident.service';
import type { SecurityIncident } from '../types';

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

export default function AdminIncidentsPage() {
  const toast = useToast();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPendingIncidents()
      .then((data) => {
        if (cancelled) return;
        setIncidents(data);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          extractErrorMessage(error, 'No se pudieron cargar los incidentes')
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filteredIncidents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return incidents;
    return incidents.filter((i) => {
      return (
        i.fileName.toLowerCase().includes(term) ||
        i.user?.institutionalEmail.toLowerCase().includes(term) ||
        i.user?.firstName.toLowerCase().includes(term) ||
        i.user?.lastName.toLowerCase().includes(term)
      );
    });
  }, [incidents, search]);

  async function handleResolve(incident: SecurityIncident) {
    setResolvingId(incident.id);
    try {
      await resolveIncident(incident.id);
      setIncidents((prev) => prev.filter((i) => i.id !== incident.id));
      toast.success('Incidente marcado como resuelto');
    } catch (error) {
      toast.error(
        extractErrorMessage(error, 'No se pudo resolver el incidente')
      );
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Incidentes de Seguridad
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} pendiente{incidents.length !== 1 ? 's' : ''} de revisión.
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar por archivo o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-72"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner label="Cargando incidentes..." />
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No hay incidentes de seguridad pendientes. ¡Todo en orden!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Usuario (Culpable)</th>
                  <th className="px-4 py-3">Archivo</th>
                  <th className="px-4 py-3">Tipo Intentado</th>
                  <th className="px-4 py-3">Tipo Detectado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatDate(incident.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {incident.user ? (
                        <>
                          <div className="font-medium text-slate-900">
                            {incident.user.firstName} {incident.user.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {incident.user.institutionalEmail}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">Usuario Desconocido</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-red-600">
                      {incident.fileName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {incident.attemptedMime}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-red-600">
                      {incident.detectedMime}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleResolve(incident)}
                        disabled={resolvingId === incident.id}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
                      >
                        {resolvingId === incident.id ? 'Marcando...' : 'Marcar Resuelto'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
