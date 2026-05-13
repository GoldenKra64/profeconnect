import { useState } from 'react';
import type { Publication } from '../types';

interface PublicationCardProps {
  pub: Publication;
}

export default function PublicationCard({ pub }: PublicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{pub.title}</h2>
        <span className="text-slate-400">
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-2">
        Por {pub.author.firstName} {pub.author.lastName} el{' '}
        {new Date(pub.createdAt).toLocaleDateString()}
      </p>

      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-slate-100 text-slate-700"
          dangerouslySetInnerHTML={{ __html: pub.content }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
