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
    <div className="flex flex-col gap-3 h-full">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-sm text-amber-900">📝 Notater</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-amber-800 text-xs hover:underline"
        >
          {showForm ? "Avbryt" : "+ Nytt notat"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            placeholder="Tittel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-amber-50/60 border border-amber-800/40 p-1.5 rounded text-amber-900 text-sm placeholder:text-amber-700/50"
          />
          <textarea
            placeholder="Innhold (valgfritt)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="bg-amber-50/60 border border-amber-800/40 p-1.5 rounded text-amber-900 text-sm resize-none placeholder:text-amber-700/50"
          />
          <button type="submit" className="bg-amber-800 text-amber-50 p-1.5 rounded text-sm hover:bg-amber-900">Lagre</button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {notes.length === 0 && !showForm && (
          <p className="text-amber-800/60 text-xs">Ingen notater ennå.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-amber-50/50 border border-amber-800/30 rounded group">
            <button
              onClick={() => setOpenNote(openNote === note.id ? null : note.id)}
              className="w-full text-left p-2 flex justify-between items-center"
            >
              <span className="text-sm font-bold text-amber-900">{note.title}</span>
              <span className="text-amber-700 text-xs">{openNote === note.id ? "▼" : "▶"}</span>
            </button>
            {openNote === note.id && (
              <div className="px-2 pb-2 border-t border-amber-800/30 relative">
                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-1 right-1 text-red-700 text-xs opacity-0 group-hover:opacity-100 hover:scale-110"
                >
                  🗑️
                </button>
                {note.content && <p className="text-amber-800 text-xs mt-2 whitespace-pre-wrap pr-5">{note.content}</p>}
                {!note.content && <p className="text-amber-700/60 text-xs mt-2 italic">Ingen innhold</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
