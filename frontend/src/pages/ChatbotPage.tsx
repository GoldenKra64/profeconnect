import { useState, useRef, useEffect } from 'react';
import { getChatbotSocket, disconnectChatbot, sendChatStream, type ChatMessage } from '../api/socket';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy el asistente educativo. Puedo ayudarte con pedagogía o, si activas la opción de abajo, consultar las publicaciones del foro.',
    },
  ]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [useForumTools, setUseForumTools] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getChatbotSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectChatbot();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const history = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      if (useForumTools) {
        const reply = await sendChatStream(history, (token) => {
          if (!token) return;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                role: 'assistant',
                content: (last.content || '') + token,
              };
            } else {
              updated.push({ role: 'assistant', content: token });
            }
            return updated;
          });
        }, true);

        if (reply) {
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1] = { role: 'assistant', content: reply };
            } else {
              updated.push({ role: 'assistant', content: reply });
            }
            return updated;
          });
        }
      } else {
        let reply = '';
        await sendChatStream(history, (token) => {
          reply += token;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1] = { role: 'assistant', content: reply };
            } else {
              updated.push({ role: 'assistant', content: reply });
            }
            return updated;
          });
        }, false);
      }
      setStreaming(false);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error ? `Error: ${err.message}` : 'Error al conectar con el chatbot',
        },
      ]);
      setStreaming(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Chatbot Educativo</h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={useForumTools}
          onChange={(e) => setUseForumTools(e.target.checked)}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Consultar publicaciones del foro (requiere sesión iniciada)
      </label>

      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            useForumTools
              ? 'Pregunta sobre las publicaciones del foro...'
              : 'Escribe tu mensaje...'
          }
          disabled={streaming}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {streaming ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
