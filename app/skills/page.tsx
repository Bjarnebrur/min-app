"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SkillsPage() {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [openHistory, setOpenHistory] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: skillsData } = await supabase.from("skills").select().eq("user_id", user.id).order("id", { ascending: true });
    if (skillsData) setSkills(skillsData);
    const { data: tasksData } = await supabase.from("tasks").select().eq("user_id", user.id).eq("done", false);
    if (tasksData) setTasks(tasksData);
    const { data: completedData } = await supabase.from("tasks").select().eq("user_id", user.id).eq("done", true).order("completed_at", { ascending: false });
    if (completedData) setCompletedTasks(completedData);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("skills").insert({ user_id: user.id, name });
    if (error) setError(error.message);
    else { setName(""); fetchData(); }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      skill_id: parseInt(selectedSkill),
      title: taskTitle,
      xp_reward: 10,
    });
    if (error) setError(error.message);
    else { setTaskTitle(""); fetchData(); }
  }

  async function handleComplete(task: any) {
    await supabase.from("tasks").update({ done: true, completed_at: new Date().toISOString() }).eq("id", task.id);

    const skill = skills.find((s) => s.id === task.skill_id);
    if (skill) {
      const newXp = skill.xp + task.xp_reward;
      const newLevel = Math.floor(newXp / 100) + 1;
      await supabase.from("skills").update({ xp: newXp, level: newLevel }).eq("id", skill.id);
    }

    fetchData();
  }

  async function handleDeleteSkill(skillId: number) {
    await supabase.from("tasks").delete().eq("skill_id", skillId);
    await supabase.from("skills").delete().eq("id", skillId);
    fetchData();
  }

  return (
    <main className="h-screen flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link href="/" className="text-[var(--gold)] hover:underline text-sm">← Tilbake</Link>
          <h1 className="text-2xl font-bold text-[var(--gold)]">⚔ Skills</h1>
        </div>
      </div>
      {error && <p className="text-[var(--red)] mb-2">{error}</p>}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Venstre side - plass til avatar senere */}

        {/* Midten - skills-liste med scroll */}
        <div className="flex-1 overflow-y-auto pr-2">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-lg mb-3 relative group">
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="absolute top-2 right-2 text-[var(--red)] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 text-sm"
                title="Slett skill"
              >
                🗑️
              </button>
              <div className="flex justify-between items-center pr-6">
                <p className="font-bold text-[var(--foreground)]">{skill.name}</p>
                <div className="text-right">
                  <p className="font-bold text-[var(--gold)] text-sm">Level {skill.level}</p>
                  <p className="text-xs text-[var(--gray)]">{skill.xp} / {skill.level * 100} XP</p>
                </div>
              </div>
              <div className="w-full bg-[var(--background)] rounded-full h-2 mt-1 mb-2 border border-[var(--card-border)]">
                <div className="bg-[var(--xp-bar)] h-2 rounded-full" style={{ width: `${(skill.xp % 100)}%` }}></div>
              </div>
              <ul className="flex flex-col gap-1">
                {(() => {
                  const skillTasks = tasks.filter((t) => t.skill_id === skill.id);
                  const isExpanded = expandedTasks === skill.id;
                  const visible = isExpanded ? skillTasks : skillTasks.slice(0, 2);
                  return (
                    <>
                      {visible.map((task) => (
                        <li key={task.id} className="flex justify-between items-center bg-[var(--background)] p-2 rounded text-sm">
                          <span>{task.title}</span>
                          <button
                            onClick={() => handleComplete(task)}
                            className="bg-[var(--green)] text-white px-2 py-1 rounded text-xs hover:bg-[var(--green-light)]"
                          >
                            Fullført +{task.xp_reward}XP
                          </button>
                        </li>
                      ))}
                      {skillTasks.length > 2 && (
                        <button
                          onClick={() => setExpandedTasks(isExpanded ? null : skill.id)}
                          className="text-[var(--gold)] text-xs mt-1 hover:underline"
                        >
                          {isExpanded ? "Vis færre" : `Vis alle (${skillTasks.length})`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </ul>
              <button
                onClick={() => setOpenHistory(openHistory === skill.id ? null : skill.id)}
                className="text-[var(--gray)] text-xs mt-2 hover:text-[var(--gold)]"
              >
                📜 Historikk {openHistory === skill.id ? "▼" : "▶"}
              </button>
              {openHistory === skill.id && (
                <div className="mt-2 border-t border-[var(--card-border)] pt-2">
                  {completedTasks.filter((t) => t.skill_id === skill.id).length === 0 && (
                    <p className="text-[var(--gray)] text-xs">Ingen fullførte oppgaver ennå.</p>
                  )}
                  <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {completedTasks.filter((t) => t.skill_id === skill.id).map((task) => (
                      <li key={task.id} className="flex justify-between items-center bg-[var(--background)] p-2 rounded text-xs">
                        <span className="text-[var(--gray)] line-through">{task.title}</span>
                        <span className="text-[var(--green-light)]">+{task.xp_reward}XP</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Høyre side - skjemaer side om side */}
        <div className="w-56 flex flex-col gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-lg">
            <h2 className="font-bold text-sm text-[var(--gold)] mb-2">Legg til skill</h2>
            <form onSubmit={handleAddSkill} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Navn på skill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[var(--background)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)] text-sm"
              />
              <button type="submit" className="bg-[var(--gold-dark)] text-white p-2 rounded text-sm hover:bg-[var(--gold)]">Legg til</button>
            </form>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-lg">
            <h2 className="font-bold text-sm text-[var(--gold)] mb-2">Legg til oppgave</h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-2">
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="bg-[var(--background)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)] text-sm">
                <option value="">Velg skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Oppgave"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="bg-[var(--background)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)] text-sm"
              />
              <button type="submit" className="bg-[var(--green)] text-white p-2 rounded text-sm hover:bg-[var(--green-light)]">Legg til</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
