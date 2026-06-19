"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SkillsPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("hobby");
  const [skills, setSkills] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: skillsData } = await supabase.from("skills").select().eq("user_id", user.id);
    if (skillsData) setSkills(skillsData);
    const { data: tasksData } = await supabase.from("tasks").select().eq("user_id", user.id).eq("done", false);
    if (tasksData) setTasks(tasksData);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("skills").insert({ user_id: user.id, name, category });
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
    else { setTaskTitle(""); setSelectedSkill(""); fetchData(); }
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

  return (
    <main className="p-8 max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">⚔ Skills</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {skills.map((skill) => (
        <div key={skill.id} className="border p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{skill.name}</p>
              <p className="text-gray-500 text-sm">{skill.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Level {skill.level}</p>
              <p className="text-sm text-gray-500">{skill.xp} / {skill.level * 100} XP</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-3">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(skill.xp % 100)}%` }}></div>
          </div>
          <ul className="flex flex-col gap-2">
            {tasks.filter((t) => t.skill_id === skill.id).map((task) => (
              <li key={task.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{task.title}</span>
                <button
                  onClick={() => handleComplete(task)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Fullført +{task.xp_reward}XP
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-8 mb-3">Legg til skill</h2>
      <form onSubmit={handleAddSkill} className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="Navn på skill"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded text-black">
          <option value="hobby">Hobby</option>
          <option value="skole">Skole</option>
          <option value="trening">Trening</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Legg til skill</button>
      </form>

      <h2 className="text-xl font-bold mb-3">Legg til oppgave</h2>
      <form onSubmit={handleAddTask} className="flex flex-col gap-3">
        <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="border p-2 rounded text-black">
          <option value="">Velg skill</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Oppgave (f.eks. Lag middag)"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Legg til oppgave</button>
      </form>
    </main>
  );
}
