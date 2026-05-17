import { useState, useEffect } from 'react';
import Modal from './Modal';
import Field from './Field';
import Button from './Button';
import { updatePublication } from '../api/publication.service';
import { useToast } from './Toast';
import type { Publication } from '../types';

interface EditPublicationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  publication: Publication;
}

export default function EditPublicationModal({
  open,
  onClose,
  onSuccess,
  publication,
}: EditPublicationModalProps) {
  const [title, setTitle] = useState(publication.title);
  const [content, setContent] = useState(publication.content);
  // Transform tags from array of objects/strings to comma-separated string
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(publication.isAnonymous);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (open) {
      setTitle(publication.title);
      setContent(publication.content);
      setIsAnonymous(publication.isAnonymous);
      
      const tagsString = publication.tags 
        ? publication.tags.map((t: any) => t.name || t).join(', ')
        : '';
      setTags(tagsString);
    }
  }, [open, publication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      error('El título y el contenido son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('isAnonymous', isAnonymous ? 'true' : 'false');
      
      // Tags
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
      tagsArray.forEach(tag => {
        formData.append('tags', tag);
      });

      await updatePublication(publication.id, formData);
      success('Publicación actualizada correctamente.');
      onSuccess();
      onClose();
    } catch (err) {
      error('Error al actualizar la publicación.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Publicación"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Título"
          placeholder="Escribe un título descriptivo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
        <Field
          as="textarea"
          label="Descripción de la publicación"
          placeholder="Escribe aquí el contenido de tu publicación..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
        />
        <Field
          label="Etiquetas"
          placeholder="Ej: tecnología, educación, campus (separadas por comas)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={loading}
        />
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            disabled={loading}
          />
          <span className="text-sm text-slate-700">Publicar como anónimo</span>
        </label>
      </form>
    </Modal>
  );
}
