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
import { Layout, Container } from "@/components/Layout";
import { WellnessButton } from "@/components/WellnessButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
      toast.error("Failed to fetch journal entries.");
    }
  }, [userId]);


  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
        toast.error("You must be logged in to save a journal entry.");
        return;
    }
    if (!entry.trim()) {
        toast.error("Journal entry cannot be empty.");
        return;
    }
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
      toast.success("Journal entry saved successfully!");
    } catch (error) {
        console.error("Error saving journal: ", error)
        toast.error("Failed to save journal entry.");
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "journal_entries", id));
      fetchJournals(); // Refresh the list
      toast.success("Journal entry deleted.");
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast.error("Failed to delete journal entry.");
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
      toast.success("Journal entry updated.");
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Failed to update journal entry.");
    }
  }

  if (!userId) {
    return (
        <Layout>
            <Container>
                <div className="text-center py-10">
                    <h1 className="text-xl font-semibold">Please log in to see your journal.</h1>
                </div>
            </Container>
        </Layout>
    );
  }

  return (
    <Layout>
        <Container className="max-w-3xl py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>New Journal Entry</CardTitle>
                    <CardDescription>Record your thoughts and feelings. It's a great way to reflect.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write your journal..." className="min-h-[150px]" />
                        <Input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood (e.g., anxious, calm)" />
                        <WellnessButton type="submit">Save Journal</WellnessButton>
                    </form>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            <div>
                <h3 className="text-2xl font-bold mb-4">Journal History</h3>
                <div className="space-y-6">
                    {history.map((h) => (
                    <Card key={h.id} className="p-4">
                        {editingId === h.id ? (
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <Textarea value={editingEntry} onChange={e => setEditingEntry(e.target.value)} className="min-h-[100px]" />
                            <Input value={editingMood} onChange={e => setEditingMood(e.target.value)} placeholder="Mood"/>
                            <div className="flex gap-2">
                                <WellnessButton type="submit">Save</WellnessButton>
                                <WellnessButton type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</WellnessButton>
                            </div>
                        </form>
                        ) : (
                        <div>
                            <p className="text-muted-foreground text-sm mb-2">{h.createdAt.toDate().toLocaleString()}</p>
                            <p className="mb-4">{h.entry}</p>
                            {h.mood && <p className="text-sm font-semibold text-primary">Mood: {h.mood}</p>}
                            <div className="flex gap-2 mt-4">
                                <WellnessButton size="sm" variant="outline" onClick={() => startEdit(h)}>Edit</WellnessButton>
                                <WellnessButton size="sm" variant="destructive" onClick={() => handleDelete(h.id!)}>Delete</WellnessButton>
                            </div>
                        </div>
                        )}
                    </Card>
                    ))}
                </div>
            </div>
        </Container>
    </Layout>
  );
}
