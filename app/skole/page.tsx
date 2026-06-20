"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

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
      <h1 className="text-3xl font-bold mb-6">📚 Skole</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {subjects.map((subject) => {
        const categories = items.filter((i) => i.type === "category" && i.parent_id === subject.id);
        return (
          <div key={subject.id} className="border p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-3">{subject.title}</h2>

            {categories.length === 0 && (
              <div className="flex gap-2 mb-3">
                <button onClick={() => handleAddCategory(subject.id, "Pensum")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">+ Pensum</button>
                <button onClick={() => handleAddCategory(subject.id, "Oppgaver")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">+ Oppgaver</button>
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

      <h2 className="text-xl font-bold mt-8 mb-3">Legg til fag</h2>
      <form onSubmit={handleAddSubject} className="flex gap-3">
        <input
          type="text"
          placeholder="Fagnavn (f.eks. Programmering)"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="border p-2 rounded text-black flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Legg til</button>
      </form>
    </main>
  );
}

function CategorySection({ category, items, onAddItem, onComplete, onSetNext }: any) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="font-bold text-left w-full p-2 rounded hover:bg-gray-100 flex justify-between items-center">
        <span>{category.title}</span>
        <span className="text-gray-400">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="ml-4 mt-2">
          <ul className="flex flex-col gap-2 mb-3">
            {items.map((item: any) => (
              <li key={item.id} className={`p-2 rounded flex justify-between items-center ${
                item.status === "completed" ? "bg-green-100 text-green-700" :
                item.status === "next" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-500"
              }`}>
                <span className={item.status === "completed" ? "line-through" : ""}>{item.title}</span>
                <div className="flex gap-1">
                  {item.status === "not_started" && (
                    <button onClick={() => onSetNext(item.id)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Neste</button>
                  )}
                  {item.status !== "completed" && (
                    <button onClick={() => onComplete(item)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Fullført</button>
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
              className="border p-1 rounded text-black text-sm flex-1"
            />
            <button type="submit" className="bg-gray-600 text-white px-2 py-1 rounded text-sm">+</button>
          </form>
        </div>
      )}
    </div>
  );
}