import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Check, BotMessageSquare, NotebookPen, UsersRound, Goal, ArrowRight, Activity } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useWellness } from '@/hooks/useWellness';
import { useTasks } from '@/hooks/useTasks';
import { ThemeToggle } from '@/components/ThemeToggle';
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
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const getTodaysTasks = (riskLevel: number): Task[] => {
  const tasks: Record<number, Task[]> = {
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const FeatureCard = ({ icon, title, description, onClick }: FeatureCardProps) => (
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
  const { wellnessPlan, getTodaysActivities, scores, error: wellnessError } = useWellness();
  const { tasks: taskProgress, toggleTaskCompletion, updateTasksFromWellnessPlan, getCompletionPercentage, error: tasksError } = useTasks();

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (loading) return;

    if (!user) {
        navigate('/auth');
    } else if (!userData && !error) {
        navigate('/onboarding');
    }
  }, [user, userData, loading, error, navigate]);

  // Move all conditional logic after hooks are called
  const shouldShowLoading = loading || !userData;
  const riskLevel = userData?.riskLevel || 2;
  const todaysWellnessActivities = wellnessError || !userData ? [] : getTodaysActivities();

  // Use task progress if available, otherwise use wellness activities or risk-based tasks
  const tasks = !tasksError && taskProgress.length > 0
    ? taskProgress.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed
      }))
    : todaysWellnessActivities.length > 0
    ? todaysWellnessActivities.map((activity, index) => ({
        id: `wellness_${index}`,
        title: activity,
        completed: false
      }))
    : getTodaysTasks(riskLevel);

  const dailyProgress = tasksError ? 0 : getCompletionPercentage();

  // Determine if referral should be shown based on thresholds
  const shouldShowReferral = () => {
    // Always show for high risk levels
    if (riskLevel >= 4) return true;

    // Show based on wellness scores if available
    if (scores) {
      // Show referral if any score indicates concerning levels
      const concerningLevels =
        scores.moodScore < 3 ||           // Very low mood
        scores.anxietyScore > 7 ||        // High anxiety
        scores.stressScore > 7 ||         // High stress
        scores.overallWellnessScore < 3;  // Very low overall wellness

      if (concerningLevels) return true;
    }

    return false;
  };

  const showReferral = shouldShowReferral();

  // Sync wellness plan tasks with task progress system
  useEffect(() => {
    if (todaysWellnessActivities.length > 0 && taskProgress.length === 0 && !tasksError && userData) {
      updateTasksFromWellnessPlan(todaysWellnessActivities);
    }
  }, [todaysWellnessActivities, taskProgress.length, updateTasksFromWellnessPlan, tasksError, userData]);

  // Sync wellness plan tasks with task progress system
  useEffect(() => {
    if (todaysWellnessActivities.length > 0 && taskProgress.length === 0 && !tasksError && userData) {
      updateTasksFromWellnessPlan(todaysWellnessActivities);
    }
  }, [todaysWellnessActivities, taskProgress.length, updateTasksFromWellnessPlan, tasksError, userData]);

  if (shouldShowLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Layout>
        <header className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm dark:from-slate-900/80 dark:to-transparent z-10 border-b border-white/20 dark:border-slate-700/50">
            <Container className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Milo</h1>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">Your Wellness Companion</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <WellnessButton
                        onClick={async () => { await auth.signOut(); navigate('/'); }}
                        variant="outline"
                        className="shadow-md hover:shadow-lg transition-all duration-300 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Log Out
                    </WellnessButton>
                </div>
            </Container>
        </header>

      <Container className="py-32 animate-fade-in">
        {/* Primary Hero Section - Highest Hierarchy */}
        <section className="mb-20 text-center">
          <div className="inline-block p-1 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl mb-8 shadow-lg">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl px-8 py-3 shadow-sm border border-white/20 dark:border-slate-700/50">
              <span className="text-base font-semibold text-primary dark:text-primary/90 tracking-wide">✨ {getGreeting()}</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground/80 dark:from-slate-100 dark:via-primary dark:to-slate-300 bg-clip-text text-transparent mb-6 leading-tight">
            {userData.name}!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Your personalized wellness journey awaits. Here's your dashboard for today.
          </p>
        </section>

        {/* Secondary Section - Progress Overview */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground dark:text-slate-100 mb-2">Your Wellness Overview</h2>
            <p className="text-muted-foreground dark:text-slate-400">Track your progress and stay on your wellness path</p>
          </div>
        </section>

        {showReferral && (
          <Card className="mb-10 p-6 border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-25 shadow-xl rounded-2xl">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-xl mb-2">Professional Support Recommended</h3>
                <p className="text-red-700 text-base mb-6 leading-relaxed">
                  Based on your wellness assessment, we recommend connecting with a mental health professional for additional support.
                </p>
                <div className="flex flex-wrap gap-4">
                  <WellnessButton
                    onClick={() => navigate('/referral')}
                    variant="critical"
                    size="default"
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Find Professional Help
                  </WellnessButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <WellnessButton
                        variant="outline"
                        size="default"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Emergency Resources
                      </WellnessButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">Emergency Support Resources</AlertDialogTitle>
                        <AlertDialogDescription className="text-base leading-relaxed">
                          If you're in crisis or having thoughts of self-harm, please reach out immediately:
                          <br /><br />
                          🆘 <strong>988 Suicide & Crisis Lifeline</strong><br />
                          📞 Call or text 988 (available 24/7)<br />
                          🌐 988lifeline.org
                          <br /><br />
                          🚑 <strong>Emergency Services</strong><br />
                          📞 Call 911 (US) or your local emergency number
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 rounded-xl">
                          I Need Help Now
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Goal className="w-4 h-4 text-white" />
                </div>
                <span className="dark:text-slate-100">Daily Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Progress value={dailyProgress} className="mb-3 h-4 bg-white/50 dark:bg-slate-700/50 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20"></div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{Math.round(dailyProgress)}%</p>
                <p className="text-sm text-muted-foreground dark:text-slate-400">tasks completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="dark:text-slate-100">Today's Action Plan</span>
              </CardTitle>
              <CardDescription className="text-base dark:text-slate-300">
                {todaysWellnessActivities.length > 0
                  ? "✨ AI-personalized activities based on your recent conversations and mood"
                  : "🌱 Small, meaningful steps toward better mental wellness"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer group ${
                      task.completed
                        ? 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 shadow-sm'
                        : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-white/50 dark:border-slate-700/50'
                    }`}
                    onClick={() => !tasksError && toggleTaskCompletion(String(task.id))}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        task.completed
                          ? 'border-green-500 bg-green-500 shadow-lg'
                          : 'border-gray-300 dark:border-slate-600 group-hover:border-green-400 group-hover:shadow-md'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white font-bold"/>}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium transition-all duration-300 ${
                        task.completed
                          ? 'line-through text-green-700 dark:text-green-400'
                          : 'text-gray-800 dark:text-slate-200 group-hover:text-green-700 dark:group-hover:text-green-400'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      task.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 group-hover:text-green-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tertiary Section - Feature Cards - Lowest Hierarchy */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-4">Explore Your Wellness Tools</h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
              Discover features designed to support your mental wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" role="navigation" aria-label="Wellness tools navigation">
            <div
              className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 focus-within:scale-105 focus-within:-translate-y-3"
              onClick={() => navigate('/aichat')}
              role="button"
              tabIndex={0}
              aria-label="Chat with Milo - Your AI companion for daily reflections"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/aichat')}
            >
              <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl focus-within:shadow-2xl transition-all duration-500 relative">
                {/* Priority indicator for primary action */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>

                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg" aria-hidden="true">
                    <BotMessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-slate-100 mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Chat with Milo
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-slate-200 transition-colors duration-300 text-sm">
                    Your AI companion for daily reflections and therapeutic conversations.
                  </p>
                  <div className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-600 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                </CardContent>
              </Card>
            </div>

          <div
            className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-3 hover:scale-105"
            onClick={() => navigate('/journal')}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg">
                  <NotebookPen className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                  Daily Journal
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  Record your thoughts, feelings, and track your mental wellness journey.
                </p>
                <div className="mt-4 w-full bg-gradient-to-r from-blue-500 to-cyan-600 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          </div>

          {showReferral && (
            <div
              className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-3 hover:scale-105"
              onClick={() => navigate('/referral')}
            >
              <Card className="h-full bg-gradient-to-br from-red-50 to-orange-50 border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg">
                    <UsersRound className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-red-700 transition-colors duration-300">
                    Professional Help
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    Connect with licensed therapists and mental health professionals.
                  </p>
                  <div className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-600 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-3 hover:scale-105">
            <Card className="h-full bg-gradient-to-br from-green-50 to-teal-50 border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-700 transition-colors duration-300">
                  Wellness Hub
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  Explore guided meditations, breathing exercises, and wellness resources.
                </p>
                <div className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-600 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </Container>
    </Layout>
  );
}

