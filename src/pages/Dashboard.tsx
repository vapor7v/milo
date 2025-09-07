import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Check, BotMessageSquare, NotebookPen, UsersRound, Goal, ArrowRight } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/integrations/firebase/client';
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

// This would ideally be in a utils file
const getTodaysTasks = (riskLevel) => {
  const tasks = {
    1: [{ id: 1, title: 'Complete a 5-minute breathing exercise', completed: true }, { id: 2, title: 'Check in with your mood for the day', completed: false }],
    2: [{ id: 1, title: 'Try a 10-minute guided meditation', completed: true }, { id: 2, title: 'Write a short journal entry about your day', completed: false }],
    3: [{ id: 1, title: 'Practice a short mindfulness exercise', completed: false }, { id: 2, title: "Chat with Milo about what's on your mind", completed: false }],
    4: [{ id: 1, title: 'Review your personalized support options', completed: false }, { id: 2, title: 'Connect with a trusted friend or family member', completed: false }],
    5: [{ id: 1, title: 'Contact crisis support (988) immediately', completed: false }, { id: 2, title: 'Reach out to your designated emergency contact', completed: false }]
  };
  return tasks[riskLevel] || [];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const FeatureCard = ({ icon, title, description, onClick }) => (
  <Card 
    className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    onClick={onClick}
  >
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading, error } = useUserData();

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (loading) return;

    if (!user) {
        navigate('/auth');
    } else if (!userData && !error) {
        navigate('/onboarding');
    }
}, [user, userData, loading, error, navigate]);

  if (loading || !userData) {
    return <LoadingSpinner fullScreen />;
  }

  const riskLevel = userData.riskLevel || 2;
  const tasks = getTodaysTasks(riskLevel);
  const dailyProgress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <Layout>
        <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
            <Container className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary">Milo</h1>
                <WellnessButton onClick={async () => { await auth.signOut(); navigate('/'); }} variant="outline">Log Out</WellnessButton>
            </Container>
        </header>

      <Container className="py-24 animate-fade-in">
        <section className="mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">{getGreeting()}, {userData.name}!</h2>
          <p className="text-lg text-muted-foreground">Here's your wellness dashboard for today.</p>
        </section>

        {riskLevel >= 4 && (
          <Card className="mb-8 p-5 border-destructive bg-destructive/10 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex-shrink-0 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-destructive-foreground">Immediate Support Recommended</h3>
                <p className="text-muted-foreground text-sm mb-4">Based on your recent check-in, we strongly recommend seeking professional support.</p>
                <div className="flex flex-wrap gap-3">
                  <WellnessButton onClick={() => navigate('/referral')} variant="destructive" size="sm">Find Support</WellnessButton>
                   <AlertDialog>
                    <AlertDialogTrigger asChild><WellnessButton variant="outline" size="sm">SOS Simulation</WellnessButton></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>SOS Feature Simulation</AlertDialogTitle><AlertDialogDescription>In a real crisis, Milo would now send an SMS to your trusted contact with a request to check in on you. This is a simulation.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Understood</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Daily Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={dailyProgress} className="mb-2 h-3" />
              <p className="text-sm font-semibold text-muted-foreground">{Math.round(dailyProgress)}% complete</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Today's Action Plan</CardTitle>
              <CardDescription>Small steps toward a healthier you.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-muted/50 hover:bg-muted">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${task.completed ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                      {task.completed && <Check className="w-3 h-3 text-primary-foreground font-bold"/>}
                    </div>
                    <span className={`flex-1 font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                    {!task.completed && <ArrowRight className="w-4 h-4 text-muted-foreground"/>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<BotMessageSquare className="w-8 h-8" />}
            title="Chat with Milo"
            description="Your AI companion for daily reflections."
            onClick={() => navigate('/aichat')}
          />
          <FeatureCard
            icon={<NotebookPen className="w-8 h-8" />}
            title="Daily Journal"
            description="Record your thoughts, feelings, and progress."
            onClick={() => navigate('/journal')}
          />
          <FeatureCard
            icon={<UsersRound className="w-8 h-8" />}
            title="Referral Network"
            description="Find therapists and support groups near you."
            onClick={() => navigate('/referral')}
          />
          <FeatureCard
            icon={<Goal className="w-8 h-8" />}
            title="Wellness Plan"
            description="Track your goals and personalized strategies."
            onClick={() => navigate('/plan')}
          />
        </div>

      </Container>
    </Layout>
  );
}
