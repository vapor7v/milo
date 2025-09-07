import React, { useState } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Meh, Frown, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

const moods = [
  { icon: <Frown className="w-8 h-8" />, label: 'Sad' },
  { icon: <Meh className="w-8 h-8" />, label: 'Neutral' },
  { icon: <Smile className="w-8 h-8" />, label: 'Happy' },
];

const JournalEntry = ({ entry }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>{entry.date}</span>
        <div className="flex items-center gap-2">
          {moods[entry.mood]?.icon}
          <span className="text-sm font-normal">{moods[entry.mood]?.label}</span>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{entry.text}</p>
    </CardContent>
  </Card>
);

export default function JournalPage() {
  const { user, loading } = useAuth();
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState(1);
  const [pastEntries, setPastEntries] = useState([
    { date: '2023-10-26', mood: 2, text: 'Today was a good day. I felt productive and happy.' },
    { date: '2023-10-25', mood: 0, text: 'Felt a bit down today. Not sure why.' },
  ]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleSaveEntry = () => {
    if (entry.trim() === '') return;
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      text: entry,
    };
    setPastEntries([newEntry, ...pastEntries]);
    setEntry('');
    setSelectedMood(1);
  };

  return (
    <Layout>
      <Container className="py-12 animate-fade-in">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">My Journal</h1>
          <p className="text-muted-foreground">A space for your private thoughts and reflections.</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
              <div className="flex justify-center gap-4 p-4 bg-muted rounded-lg">
                {moods.map((mood, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedMood(index)} 
                    className={`p-4 rounded-full transition-all duration-200 ${selectedMood === index ? 'bg-primary text-primary-foreground scale-110' : 'hover:bg-muted-foreground/20'}`}>
                    {mood.icon}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Write about your day, your thoughts, or anything on your mind..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              rows={6}
              className="mb-4"
            />
            <WellnessButton onClick={handleSaveEntry} disabled={!entry.trim()}>
              <Save className="w-4 h-4 mr-2" /> Save Entry
            </WellnessButton>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Past Entries</h2>
          <div className="space-y-4">
            {pastEntries.map((entry, index) => (
              <JournalEntry key={index} entry={entry} />
            ))}
          </div>
        </div>
      </Container>
    </Layout>
  );
}
