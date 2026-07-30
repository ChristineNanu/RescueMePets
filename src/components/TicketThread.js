import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';

/**
 * TicketThread — chat-style message thread for a support ticket
 * Props:
 *   ticket      — the ticket object { id, animal_name, issue, status, resolution_note }
 *   senderId    — current user's user_id
 *   senderRole  — 'vet' | 'adopter'
 *   onClose     — close the thread panel
 */
export default function TicketThread({ ticket, senderId, senderRole, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const bottomRef               = useRef(null);

  const load = () => {
    fetch(`${API_BASE_URL}/tickets/${ticket.id}/messages`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (Array.isArray(d)) { setMessages(d); setLoaded(true); } })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    // Mark messages as read when thread opens
    fetch(`${API_BASE_URL}/tickets/${ticket.id}/messages/read?reader_role=${senderRole}`, {
      method: 'PATCH'
    }).catch(() => {});
    // Poll every 10s for new messages
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [ticket.id, senderRole]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await fetch(`${API_BASE_URL}/tickets/${ticket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, sender_role: senderRole, message: text.trim() }),
    }).catch(() => {});
    setText('');
    setSending(false);
    load();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isMine = (msg) => msg.sender_id === senderId;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col" style={{ height: '85vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-t-3xl px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">🐾 {ticket.animal_name}</p>
            <p className="text-teal-200 text-xs mt-0.5 truncate max-w-xs">{ticket.issue}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              ticket.status === 'resolved'    ? 'bg-green-100 text-green-700' :
              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
                text-white font-bold border-0 cursor-pointer transition-all text-sm">
              ✕
            </button>
          </div>
        </div>

        {/* Resolution note banner */}
        {ticket.resolution_note && (
          <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex-shrink-0">
            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-0.5">Resolved</p>
            <p className="text-gray-700 text-sm">{ticket.resolution_note}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {!loaded && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Loading messages...</p>
            </div>
          )}
          {loaded && messages.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm font-semibold">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation below</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine(msg)
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                {!isMine(msg) && (
                  <p className={`text-xs font-black mb-1 ${msg.sender_role === 'vet' ? 'text-teal-600' : 'text-coral-500'}`}>
                    {msg.sender_role === 'vet' ? '🏥' : '🐾'} {msg.sender_name}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <p className={`text-xs mt-1 ${isMine(msg) ? 'text-teal-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine(msg) && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {ticket.status !== 'resolved' ? (
          <div className="px-4 py-4 border-t border-gray-100 flex gap-3 items-end flex-shrink-0">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message... (Enter to send)"
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
            />
            <button onClick={send} disabled={!text.trim() || sending}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                border-0 cursor-pointer transition-all font-bold text-lg
                ${!text.trim() || sending
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200'}`}>
              {sending ? '⏳' : '➤'}
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 border-t border-gray-100 text-center text-sm text-gray-400 flex-shrink-0">
            This ticket has been resolved. No further messages can be sent.
          </div>
        )}
      </div>
    </div>
  );
}
