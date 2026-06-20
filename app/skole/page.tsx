"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SkolePage() {
  const [items, setItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("school_items").select().eq("user_id", user.id).order("id", { ascending: true });
    if (data) setItems(data);
    const { data: profileData } = await supabase.from("profiles").select().eq("id", user.id).single();
    if (profileData) setProfile(profileData);
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
    if (!title.trim()) return;
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

  async function handleAddSubItem(moduleId: number, title: string) {
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("school_items").insert({
      user_id: user.id,
      parent_id: moduleId,
      title,
      type: "subitem",
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

  async function handleSetFailed(itemId: number) {
    await supabase.from("school_items").update({ status: "failed" }).eq("id", itemId);
    fetchData();
  }

  async function handleRetry(itemId: number) {
    await supabase.from("school_items").update({ status: "not_started" }).eq("id", itemId);
    fetchData();
  }

  async function handleSetNext(itemId: number) {
    await supabase.from("school_items").update({ status: "next" }).eq("id", itemId);
    fetchData();
  }

  async function handleDeleteItem(itemId: number) {
    const children = items.filter((i) => i.parent_id === itemId);
    for (const child of children) {
      await supabase.from("school_items").delete().eq("id", child.id);
    }
    await supabase.from("school_items").delete().eq("id", itemId);
    fetchData();
  }

  async function handleCompleteSubject(subjectId: number) {
    await supabase.from("school_items").update({ status: "completed" }).eq("id", subjectId);
    fetchData();
  }

  async function handleDeleteSubject(subjectId: number) {
    const children = items.filter((i) => i.parent_id === subjectId);
    for (const child of children) {
      const grandchildren = items.filter((i) => i.parent_id === child.id);
      for (const gc of grandchildren) {
        const greatgc = items.filter((i) => i.parent_id === gc.id);
        for (const ggc of greatgc) {
          await supabase.from("school_items").delete().eq("id", ggc.id);
        }
        await supabase.from("school_items").delete().eq("id", gc.id);
      }
      await supabase.from("school_items").delete().eq("id", child.id);
    }
    await supabase.from("school_items").delete().eq("id", subjectId);
    fetchData();
  }

  const activeSubjects = items.filter((i) => i.type === "subject" && i.status !== "completed");
  const completedSubjects = items.filter((i) => i.type === "subject" && i.status === "completed");

  return (
    <main className="p-6">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--gold)]">📚 Skole</h1>
        {profile && (
          <div className="text-right">
            <p className="font-bold">Level {profile.level}</p>
            <div className="w-32 bg-[var(--background)] rounded-full h-3 border border-[var(--card-border)]">
              <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${profile.xp % 100}%` }}></div>
            </div>
            <p className="text-xs text-[var(--gray)] mt-1">{profile.xp} / {profile.level * 100} XP</p>
          </div>
        )}
      </div>
      {error && <p className="text-[var(--red)] mb-4">{error}</p>}

      <div className="flex gap-6">
        {/* Venstre side - fullførte emner */}
        <div className="w-52 flex-shrink-0 absolute left-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-lg">
            <h2 className="font-bold text-sm text-[var(--gold)] mb-3">Fullførte emner</h2>
            {completedSubjects.length === 0 && (
              <p className="text-[var(--gray)] text-xs">Ingen fullførte emner ennå.</p>
            )}
            <ul className="flex flex-col gap-2">
              {completedSubjects.map((subject) => (
                <li key={subject.id} className="bg-[var(--green)] p-2 rounded flex justify-between items-center group">
                  <span className="font-bold text-green-200 text-sm">{subject.title}</span>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:scale-110"
                    title="Slett emne"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Høyre side - aktive emner */}
        <div className="max-w-xl mx-auto flex-1">
          {activeSubjects.map((subject) => {
            const categories = items.filter((i) => i.type === "category" && i.parent_id === subject.id);
            return (
              <div key={subject.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-lg mb-4 relative group">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{subject.title}</h2>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCompleteSubject(subject.id)}
                      className="text-[var(--green-light)] text-xs border border-[var(--green)] px-2 py-1 rounded hover:bg-[var(--green)] hover:text-white"
                    >
                      Fullfør ✓
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-[var(--red)] text-xs hover:scale-110"
                      title="Slett emne"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {categories.length === 0 && (
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => handleAddCategory(subject.id, "Pensum")} className="bg-[var(--gold-dark)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--gold)]">+ Pensum</button>
                    <button onClick={() => handleAddCategory(subject.id, "Oppgaver")} className="bg-[var(--gold-dark)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--gold)]">+ Oppgaver</button>
                  </div>
                )}

                {categories.map((cat) => {
                  const catItems = items.filter((i) => i.type === "item" && i.parent_id === cat.id);
                  const subItems = items.filter((i) => i.type === "subitem");
                  return (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      items={catItems}
                      subItems={subItems}
                      allItems={items}
                      onAddItem={handleAddItem}
                      onComplete={handleComplete}
                      onSetFailed={handleSetFailed}
                      onRetry={handleRetry}
                      onSetNext={handleSetNext}
                      onAddSubItem={handleAddSubItem}
                      onDeleteItem={handleDeleteItem}
                      isPensum={cat.title === "Pensum"}
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
        </div>
      </div>
    </main>
  );
}

function CategorySection({ category, items, allItems, onAddItem, onComplete, onSetFailed, onRetry, onSetNext, onAddSubItem, onDeleteItem, isPensum }: any) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [newSubItem, setNewSubItem] = useState("");

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="font-bold text-left w-full p-2 rounded hover:bg-[var(--background)] flex justify-between items-center text-[var(--foreground)]">
        <span>{category.title}</span>
        <span className="text-[var(--gray)]">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="ml-4 mt-2">
          <ul className="flex flex-col gap-2 mb-3">
            {items.map((item: any) => {
              const subItems = isPensum ? allItems.filter((si: any) => si.type === "subitem" && si.parent_id === item.id) : [];
              return (
                <li key={item.id}>
                  <div className={`p-2 rounded flex justify-between items-center ${
                    item.status === "completed" ? "bg-[var(--green)] text-green-200" :
                    item.status === "next" ? "bg-yellow-700 text-yellow-200" :
                    item.status === "failed" ? "bg-red-900 text-red-300" :
                    "bg-[var(--background)] text-[var(--gray)]"
                  }`}>
                    <span
                      className={`${item.status === "completed" || item.status === "failed" ? "line-through" : ""} ${isPensum ? "cursor-pointer hover:text-[var(--gold)]" : ""}`}
                      onClick={() => isPensum && setOpenModule(openModule === item.id ? null : item.id)}
                    >
                      {item.title} {isPensum && (openModule === item.id ? "▼" : "▶")}
                    </span>
                    <div className="flex gap-1">
                      {item.status === "not_started" && (
                        <button onClick={() => onSetNext(item.id)} className="bg-[var(--yellow)] text-black px-2 py-1 rounded text-xs">Neste</button>
                      )}
                      {item.status === "not_started" && (
                        <button onClick={() => onSetFailed(item.id)} className="bg-[var(--red)] text-white px-2 py-1 rounded text-xs hover:opacity-80">Feilet</button>
                      )}
                      {item.status !== "completed" && item.status !== "failed" && (
                        <button onClick={() => onComplete(item)} className="bg-[var(--green)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--green-light)]">Fullført</button>
                      )}
                      {item.status === "failed" && (
                        <button onClick={() => onRetry(item.id)} className="bg-[var(--gold-dark)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--gold)]">Prøv igjen</button>
                      )}
                      <button onClick={() => onDeleteItem(item.id)} className="text-[var(--red)] text-xs hover:scale-110" title="Slett">🗑️</button>
                    </div>
                  </div>
                  {isPensum && openModule === item.id && (
                    <div className="ml-4 mt-2 mb-2">
                      <ul className="flex flex-col gap-1 mb-2">
                        {subItems.map((si: any) => (
                          <li key={si.id} className={`p-2 rounded flex justify-between items-center text-sm ${
                            si.status === "completed" ? "bg-[var(--green)] text-green-200" :
                            si.status === "next" ? "bg-yellow-700 text-yellow-200" :
                            si.status === "failed" ? "bg-red-900 text-red-300" :
                            "bg-[var(--background)] text-[var(--gray)]"
                          }`}>
                            <span className={si.status === "completed" || si.status === "failed" ? "line-through" : ""}>{si.title}</span>
                            <div className="flex gap-1">
                              {si.status === "not_started" && (
                                <button onClick={() => onSetNext(si.id)} className="bg-[var(--yellow)] text-black px-2 py-1 rounded text-xs">Neste</button>
                              )}
                              {si.status === "not_started" && (
                                <button onClick={() => onSetFailed(si.id)} className="bg-[var(--red)] text-white px-2 py-1 rounded text-xs hover:opacity-80">Feilet</button>
                              )}
                              {si.status !== "completed" && si.status !== "failed" && (
                                <button onClick={() => onComplete(si)} className="bg-[var(--green)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--green-light)]">Fullført</button>
                              )}
                              {si.status === "failed" && (
                                <button onClick={() => onRetry(si.id)} className="bg-[var(--gold-dark)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--gold)]">Prøv igjen</button>
                              )}
                              <button onClick={() => onDeleteItem(si.id)} className="text-[var(--red)] text-xs hover:scale-110" title="Slett">🗑️</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <form onSubmit={(e) => { e.preventDefault(); onAddSubItem(item.id, newSubItem); setNewSubItem(""); }} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ny oppgave"
                          value={newSubItem}
                          onChange={(e) => setNewSubItem(e.target.value)}
                          className="bg-[var(--card-bg)] border border-[var(--card-border)] p-1 rounded text-[var(--foreground)] text-xs flex-1"
                        />
                        <button type="submit" className="bg-[var(--gold-dark)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--gold)]">+</button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); onAddItem(category.id, newItem); setNewItem(""); }} className="flex gap-2">
            <input
              type="text"
              placeholder={isPensum ? "Ny modul" : "Ny oppgave"}
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
