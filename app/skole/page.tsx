"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SkolePage() {
  const [items, setItems] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("school_items").select().eq("user_id", user.id);
    if (data) setItems(data);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("school_items").insert({
      user_id: user.id,
      title: subjectName,
      type: "subject",
    });
    if (error) setError(error.message);
    else { setSubjectName(""); fetchData(); }
  }

  async function handleAddCategory(subjectId: number, categoryName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("school_items").insert({
      user_id: user.id,
      parent_id: subjectId,
      title: categoryName,
      type: "category",
    });
    fetchData();
  }

  async function handleAddItem(categoryId: number, title: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("school_items").insert({
      user_id: user.id,
      parent_id: categoryId,
      title,
      type: "item",
    });
    fetchData();
  }

  async function handleComplete(item: any) {
    await supabase.from("school_items").update({ status: "completed" }).eq("id", item.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select().eq("id", user.id).single();
    if (profile) {
      const newXp = profile.xp + item.xp_reward;
      const newLevel = Math.floor(newXp / 100) + 1;
      await supabase.from("profiles").update({ xp: newXp, level: newLevel }).eq("id", user.id);
    }
    fetchData();
  }

  async function handleSetNext(itemId: number) {
    await supabase.from("school_items").update({ status: "next" }).eq("id", itemId);
    fetchData();
  }

  const subjects = items.filter((i) => i.type === "subject");

  return (
    <main className="p-8 max-w-lg mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-6 text-[var(--gold)]">📚 Skole</h1>
      {error && <p className="text-[var(--red)] mb-4">{error}</p>}

      {subjects.map((subject) => {
        const categories = items.filter((i) => i.type === "category" && i.parent_id === subject.id);
        return (
          <div key={subject.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-3 text-[var(--foreground)]">{subject.title}</h2>

            {categories.length === 0 && (
              <div className="flex gap-2 mb-3">
                <button onClick={() => handleAddCategory(subject.id, "Pensum")} className="bg-[var(--gold-dark)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--gold)]">+ Pensum</button>
                <button onClick={() => handleAddCategory(subject.id, "Oppgaver")} className="bg-[var(--gold-dark)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--gold)]">+ Oppgaver</button>
              </div>
            )}

            {categories.map((cat) => {
              const catItems = items.filter((i) => i.type === "item" && i.parent_id === cat.id);
              return (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  items={catItems}
                  onAddItem={handleAddItem}
                  onComplete={handleComplete}
                  onSetNext={handleSetNext}
                />
              );
            })}
          </div>
        );
      })}

      <h2 className="text-xl font-bold mt-8 mb-3 text-[var(--gold)]">Legg til fag</h2>
      <form onSubmit={handleAddSubject} className="flex gap-3">
        <input
          type="text"
          placeholder="Fagnavn (f.eks. Programmering)"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="bg-[var(--card-bg)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)] flex-1"
        />
        <button type="submit" className="bg-[var(--gold-dark)] text-white px-4 py-2 rounded hover:bg-[var(--gold)]">Legg til</button>
      </form>
    </main>
  );
}

function CategorySection({ category, items, onAddItem, onComplete, onSetNext }: any) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="font-bold text-left w-full p-2 rounded hover:bg-[var(--background)] flex justify-between items-center text-[var(--foreground)]">
        <span>{category.title}</span>
        <span className="text-[var(--gray)]">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="ml-4 mt-2">
          <ul className="flex flex-col gap-2 mb-3">
            {items.map((item: any) => (
              <li key={item.id} className={`p-2 rounded flex justify-between items-center ${
                item.status === "completed" ? "bg-[var(--green)] text-green-200" :
                item.status === "next" ? "bg-yellow-700 text-yellow-200" :
                "bg-[var(--background)] text-[var(--gray)]"
              }`}>
                <span className={item.status === "completed" ? "line-through" : ""}>{item.title}</span>
                <div className="flex gap-1">
                  {item.status === "not_started" && (
                    <button onClick={() => onSetNext(item.id)} className="bg-[var(--yellow)] text-black px-2 py-1 rounded text-xs">Neste</button>
                  )}
                  {item.status !== "completed" && (
                    <button onClick={() => onComplete(item)} className="bg-[var(--green)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--green-light)]">Fullført</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); onAddItem(category.id, newItem); setNewItem(""); }} className="flex gap-2">
            <input
              type="text"
              placeholder="Ny modul/oppgave"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] p-1 rounded text-[var(--foreground)] text-sm flex-1"
            />
            <button type="submit" className="bg-[var(--gold-dark)] text-white px-2 py-1 rounded text-sm hover:bg-[var(--gold)]">+</button>
          </form>
        </div>
      )}
    </div>
  );
}
