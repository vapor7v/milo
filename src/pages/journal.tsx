import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../integrations/firebase/client";
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Define the shape of a journal entry, equivalent to the old JournalRow
export interface JournalRow {
  id?: string;
  entry: string;
  mood?: string;
  createdAt: Timestamp;
  userId: string;
}

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [history, setHistory] = useState<JournalRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState("");
  const [editingMood, setEditingMood] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchJournals = useCallback(async () => {
    if (!userId) return;
    try {
      const q = query(collection(db, "journal_entries"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const rows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalRow));
      // Sort by creation date, newest first
      rows.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setHistory(rows);
    } catch (error) {
      console.error("Error fetching journals: ", error);
    }
  }, [userId]);


  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return alert("You must be logged in to save a journal entry.");
    try {
      await addDoc(collection(db, "journal_entries"), {
        userId,
        entry,
        mood,
        createdAt: Timestamp.now(),
      });
      setEntry("");
      setMood("");
      fetchJournals(); // Refresh the list
    } catch (error) {
        console.error("Error saving journal: ", error)
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "journal_entries", id));
      fetchJournals(); // Refresh the list
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }

  function startEdit(journal: JournalRow) {
    setEditingId(journal.id!);
    setEditingEntry(journal.entry);
    setEditingMood(journal.mood || "");
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !userId) return;
    try {
      await updateDoc(doc(db, "journal_entries", editingId), {
        entry: editingEntry,
        mood: editingMood
      });
      setEditingId(null);
      setEditingEntry("");
      setEditingMood("");
      fetchJournals(); // Refresh the list
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }

  if (!userId) {
    return <div>Please log in to see your journal.</div>;
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
                <button onClick={() => handleDelete(h.id!)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
