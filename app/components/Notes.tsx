"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  async function fetchNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("notes").select().eq("user_id", user.id).order("id", { ascending: false });
    if (data) setNotes(data);
  }

  useEffect(() => { fetchNotes(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notes").insert({ user_id: user.id, title, content });
    setTitle("");
    setContent("");
    setShowForm(false);
    fetchNotes();
  }

  async function handleDelete(noteId: number) {
    await supabase.from("notes").delete().eq("id", noteId);
    fetchNotes();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
      {/* Header — statisk, scroller ikke */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <h2 className="font-bold text-base text-stone-900">📝 Notater</h2>
        <button onClick={() => setShowForm(!showForm)} className="text-stone-700 text-sm font-semibold hover:text-stone-900">
          {showForm ? "Avbryt" : "+ Nytt notat"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Tittel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-amber-50/70 border border-stone-600/40 p-2 rounded text-stone-900 text-sm placeholder:text-stone-500"
          />
          <textarea
            placeholder="Innhold (valgfritt)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="bg-amber-50/70 border border-stone-600/40 p-2 rounded text-stone-900 text-sm resize-none placeholder:text-stone-500"
          />
          <button type="submit" className="bg-stone-800 text-amber-50 p-1.5 rounded text-sm font-semibold hover:bg-stone-900">Lagre</button>
        </form>
      )}

      {/* Notat-liste — denne scroller */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {notes.length === 0 && !showForm && (
          <p className="text-stone-600 text-sm italic">Ingen notater ennå.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-amber-100 border border-stone-500/50 rounded group" style={{ flexShrink: 0 }}>
            <button
              onClick={() => setOpenNote(openNote === note.id ? null : note.id)}
              className="w-full text-left p-2 flex justify-between items-center"
            >
              <span className="text-sm font-bold text-stone-900">{note.title}</span>
              <span className="text-stone-600 text-sm">{openNote === note.id ? "▼" : "▶"}</span>
            </button>
            {openNote === note.id && (
              <div className="px-2 pb-2 border-t border-stone-600/30 relative">
                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-1 right-1 text-red-800 text-sm opacity-0 group-hover:opacity-100 hover:scale-110"
                >
                  🗑️
                </button>
                {note.content && <p className="text-stone-800 text-sm mt-2 break-words pr-5">{note.content}</p>}
                {!note.content && <p className="text-stone-500 text-sm mt-2 italic">Ingen innhold</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
