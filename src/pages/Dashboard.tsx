import React, { useState, useEffect } from 'react';
import { auth, db } from '@/integrations/firebase/client'; // Corrected import
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Check, BotMessageSquare, NotebookPen, UsersRound, Goal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getTodaysTasks = (riskLevel) => {
  const tasks = {
    1: [{ id: 1, title: '5-minute breathing exercise', completed: true }, { id: 2, title: 'Mood check-in', completed: false }],
    2: [{ id: 1, title: '10-minute guided meditation', completed: true }, { id: 2, title: 'Journal about your day', completed: false }],
    3: [{ id: 1, title: 'Practice mindfulness', completed: false }, { id: 2, title: 'Chat with Milo', completed: false }],
    4: [{ id: 1, title: 'Review professional support options', completed: false }, { id: 2, title: 'Talk to a trusted friend', completed: false }],
    5: [{ id: 1, title: 'Contact crisis support (988)', completed: false }, { id: 2, title: 'Reach out to your emergency contact', completed: false }]
  };
  return tasks[riskLevel] || [];
};

const NeumorphicCard = ({ icon, title, description, onClick, className }) => (
  <div 
    className={`bg-background rounded-2xl shadow-neumorphic p-6 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    onClick={onClick}
  >
    <div className="w-24 h-24 rounded-full shadow-neumorphic-inset flex items-center justify-center mb-5 animate-icon-float">
      {icon}
    </div>
    <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-snug">{description}</p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const riskLevel = data.riskLevel || 2; // Default risk level
            setUserData({
              name: data.name || 'User',
              riskLevel: riskLevel,
            });
            setTasks(getTodaysTasks(riskLevel));
          } else {
            // If user doc doesn't exist, they might not have finished onboarding
            navigate('/onboarding');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Maybe navigate to an error page or show a message
          navigate('/'); // For now, just go back to home
        }
      } else {
        // User is signed out
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen font-bold text-xl">Loading your wellness space...</div>;
  }
  
  if (!userData) {
    // This can happen briefly between loading and navigation
    return <div className="flex items-center justify-center h-screen font-bold text-xl">Redirecting...</div>;
  }


  const dailyProgress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <Layout className="bg-gradient-to-br from-primary/10 via-background to-accent/20">
      <Container className="max-w-5xl py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-extrabold text-secondary">Milo</h1>
          <WellnessButton onClick={async () => { await auth.signOut(); navigate('/'); }} variant="ghost">Log Out</WellnessButton>
        </header>

        <section className="mb-16 text-center">
          <h2 className="text-5xl font-black tracking-tight text-foreground mb-3">{getWelcomeMessage()}, {userData.name}!</h2>
          <p className="text-xl text-muted-foreground">Ready to brighten your day?</p>
        </section>

        {userData.riskLevel >= 4 && (
          <Card className="mb-12 p-5 border-destructive/30 bg-destructive/10 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex-shrink-0 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-destructive-foreground">Immediate Support Recommended</h3>
                <p className="text-muted-foreground text-sm mb-4">Based on your recent check-in, we strongly recommend seeking professional support.</p>
                <div className="flex flex-wrap gap-3">
                  <WellnessButton onClick={() => navigate('/referral')} variant="secondary" size="sm">Find a Therapist</WellnessButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><WellnessButton variant="outline" size="sm">SOS Simulation</WellnessButton></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>SOS Feature Simulation</AlertDialogTitle><AlertDialogDescription>In a real crisis, Milo would now send an SMS to your trusted contact with a request to check in on you. This is a simulation.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Understood</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="md:col-span-1 bg-background/80 shadow-neumorphic-sm border-0 bg-grid-pattern">
            <CardHeader><CardTitle>Daily Progress</CardTitle></CardHeader>
            <CardContent>
              <Progress value={dailyProgress} className="mb-2 h-3 [&>*]:bg-gradient-to-r [&>*]:from-secondary [&>*]:to-primary" />
              <p className="text-sm font-semibold text-muted-foreground">{Math.round(dailyProgress)}% of tasks complete.</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 bg-background/80 shadow-neumorphic-sm border-0 bg-grid-pattern">
            <CardHeader><CardTitle>Today's Action Plan</CardTitle><CardDescription>A few small steps for a brighter day.</CardDescription></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-neumorphic-sm-inset ${task.completed ? 'bg-wellness-safe/20' : 'bg-muted'}`}>
                      {task.completed && <Check className="w-4 h-4 text-wellness-safe font-bold"/>}
                    </div>
                    <span className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <NeumorphicCard
            icon={<BotMessageSquare className="w-12 h-12 text-secondary" />}
            title="Chat with Milo"
            description="Your AI companion for daily reflections."
            onClick={() => navigate('/aichat')}
            className=""
          />
          <NeumorphicCard
            icon={<NotebookPen className="w-12 h-12 text-primary" />}
            title="Daily Journal"
            description="Record your thoughts, feelings, and progress."
            onClick={() => navigate('/journal')}
            className=""
          />
          <NeumorphicCard
            icon={<UsersRound className="w-12 h-12 text-accent-foreground" />}
            title="Referral Network"
            description="Find therapists and support groups near you."
            onClick={() => navigate('/referral')}
            className=""
          />
          <NeumorphicCard
            icon={<Goal className="w-12 h-12 text-wellness-concerned" />}
            title="Wellness Plan"
            description="Track your goals and personalized strategies."
            onClick={() => navigate('/plan')}
            className=""
          />
        </div>

      </Container>
    </Layout>
  );
}
