import React, { useState, useEffect } from "react";
import { saveJournal, getJournals } from "../lib/database";
import { supabase } from "../lib/supabaseClient";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState("");
  const [editingMood, setEditingMood] = useState("");
  const userId = localStorage.getItem("app_user_id");

  useEffect(() => {
    if (userId) {
      (async () => {
        const rows = await getJournals(userId);
        setHistory(rows);
      })();
    }
  }, [userId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return alert("Create a user first (Onboarding).");
    const res = await saveJournal(userId, entry, mood);
    setEntry("");
    setMood("");
    const rows = await getJournals(userId);
    setHistory(rows);
  }

  async function handleDelete(id: string) {
    await supabase.from("journal_entries").delete().eq("id", id);
    const rows = await getJournals(userId!);
    setHistory(rows);
  }

  function startEdit(journal: any) {
    setEditingId(journal.id);
    setEditingEntry(journal.entry);
    setEditingMood(journal.mood || "");
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await supabase.from("journal_entries").update({ entry: editingEntry, mood: editingMood }).eq("id", editingId);
    setEditingId(null);
    setEditingEntry("");
    setEditingMood("");
    const rows = await getJournals(userId!);
    setHistory(rows);
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write your journal..."></textarea>
        <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood (e.g., anxious, calm)" />
        <button type="submit">Save Journal</button>
      </form>
      <h3>Journal History</h3>
      <ul>
        {history.map((h) => (
          <li key={h.id}>
            {editingId === h.id ? (
              <form onSubmit={handleEditSave} style={{ display: 'inline' }}>
                <textarea value={editingEntry} onChange={e => setEditingEntry(e.target.value)} />
                <input value={editingMood} onChange={e => setEditingMood(e.target.value)} />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {h.entry} {h.mood && <>({h.mood})</>}
                <button onClick={() => startEdit(h)}>Edit</button>
                <button onClick={() => handleDelete(h.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
