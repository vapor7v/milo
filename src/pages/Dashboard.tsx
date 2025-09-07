import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Check, BotMessageSquare, NotebookPen, UsersRound, Goal, Activity, Play, Save, MessageCircle, X } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useWellness } from '@/hooks/useWellness';
import { useTasks } from '@/hooks/useTasks';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/integrations/firebase/client';
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// This would ideally be in a utils file
interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  mandatory?: boolean;
}

const getTodaysTasks = (riskLevel: number): Task[] => {
  const today = new Date().toISOString().split('T')[0];

  // Mandatory daily tasks that must be completed
  const mandatoryTasks: Task[] = [
    {
      id: 'mandatory_meditation',
      title: '🧘 Complete 5-minute guided meditation (MANDATORY)',
      completed: false,
      date: today,
      mandatory: true
    },
    {
      id: 'mandatory_journal',
      title: '📝 Write daily journal entry (MANDATORY)',
      completed: false,
      date: today,
      mandatory: true
    }
  ];

  // Additional tasks based on risk level
  const additionalTasks: Record<number, Task[]> = {
    1: [
      { id: '1', title: 'Complete a 5-minute breathing exercise', completed: true, date: today },
      { id: '2', title: 'Check in with your mood for the day', completed: false, date: today }
    ],
    2: [
      { id: '1', title: 'Try a 10-minute guided meditation', completed: true, date: today },
      { id: '2', title: 'Write a short journal entry about your day', completed: false, date: today }
    ],
    3: [
      { id: '1', title: 'Practice a short mindfulness exercise', completed: false, date: today },
      { id: '2', title: "Chat with Milo about what's on your mind", completed: false, date: today }
    ],
    4: [
      { id: '1', title: 'Review your personalized support options', completed: false, date: today },
      { id: '2', title: 'Connect with a trusted friend or family member', completed: false, date: today }
    ],
    5: [
      { id: '1', title: 'Contact crisis support (988) immediately', completed: false, date: today },
      { id: '2', title: 'Reach out to your designated emergency contact', completed: false, date: today }
    ]
  };

  const riskBasedTasks = additionalTasks[riskLevel] || [];
  return [...mandatoryTasks, ...riskBasedTasks];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};



export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading, error } = useUserData();
  const { getTodaysActivities, scores, error: wellnessError } = useWellness();
  const { tasks: taskProgress, toggleTaskCompletion, updateTasksFromWellnessPlan, getCompletionPercentage, error: tasksError } = useTasks();

  // Quick journal entry state
  const [quickJournalEntry, setQuickJournalEntry] = useState("");
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // Chat popup state - now always open
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: `Good ${getGreeting().toLowerCase()}, ${userData?.name || 'friend'}! 🌟 I'm here to support your wellness journey. How are you feeling today? I'd love to hear about your day and help you stay on track with your mental wellness goals.`,
      sender: 'milo'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Meditation challenge state
  const [isMeditationOpen, setIsMeditationOpen] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
  const todaysWellnessActivities = useMemo(() => {
    return wellnessError || !userData ? [] : getTodaysActivities();
  }, [wellnessError, userData, getTodaysActivities]);

  // Get base tasks - ensure mandatory tasks are always included
  let baseTasks: Task[];
  if (!tasksError && taskProgress.length > 0) {
    // Use tasks from database but ensure mandatory tasks are included
    const mandatoryTasks = getTodaysTasks(riskLevel).filter(task => task.mandatory);
    const existingMandatoryTasks = taskProgress.filter(task =>
      mandatoryTasks.some(mt => mt.id === task.id)
    );

    // Merge database tasks with mandatory tasks (database takes precedence for completion status)
    const mergedTasks = [
      ...taskProgress,
      ...mandatoryTasks.filter(mt =>
        !taskProgress.some(t => t.id === mt.id)
      )
    ];

    baseTasks = mergedTasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      date: task.date || new Date().toISOString().split('T')[0]
    }));
  } else if (todaysWellnessActivities.length > 0) {
    baseTasks = todaysWellnessActivities.map((activity, index) => ({
      id: `wellness_${index}`,
      title: activity,
      completed: false,
      date: new Date().toISOString().split('T')[0] // Add date field
    }));
  } else {
    baseTasks = getTodaysTasks(riskLevel);
  }

  // Merge with mandatory task information
  const tasks = baseTasks.map(task => {
    const mandatoryTasks = getTodaysTasks(riskLevel).filter(t => t.mandatory);
    const mandatoryTask = mandatoryTasks.find(mt => mt.id === task.id);
    return mandatoryTask ? { ...task, mandatory: true } : { ...task, mandatory: false };
  });

  // Calculate combined progress including wellness scores
  const calculateCombinedProgress = () => {
    if (tasksError) return 0;

    const taskProgress = getCompletionPercentage();
    let wellnessProgress = 0;

    if (scores) {
      // Calculate wellness progress based on scores
      const moodProgress = Math.min(scores.moodScore / 10, 1) * 25; // 25% weight
      const anxietyProgress = Math.max(0, (10 - scores.anxietyScore) / 10) * 25; // 25% weight
      const stressProgress = Math.max(0, (10 - scores.stressScore) / 10) * 25; // 25% weight
      const overallProgress = scores.overallWellnessScore / 10 * 25; // 25% weight

      wellnessProgress = moodProgress + anxietyProgress + stressProgress + overallProgress;
    }

    // Combine task progress (50%) and wellness progress (50%)
    return Math.min((taskProgress * 0.5) + (wellnessProgress * 0.5), 100);
  };

  const dailyProgress = calculateCombinedProgress();

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

  // Function to save quick journal entry and mark mandatory task as completed
  const saveQuickJournalEntry = async () => {
    if (!user || !quickJournalEntry.trim()) {
      toast.error("Please write something in your journal entry.");
      return;
    }

    try {
      setIsSavingJournal(true);

      // Save journal entry to Firestore
      await addDoc(collection(db, "journal_entries"), {
        userId: user.uid,
        entry: quickJournalEntry,
        mood: "neutral", // Will be analyzed by AI when viewed
        createdAt: Timestamp.now(),
      });

      // Ensure mandatory journal task exists and mark as completed
      const today = new Date().toISOString().split('T')[0];
      const mandatoryJournalTask = {
        id: 'mandatory_journal',
        title: '📝 Write daily journal entry (MANDATORY)',
        completed: true,
        date: today,
        completedAt: Timestamp.now()
      };

      // Check if task already exists in taskProgress
      const existingTask = taskProgress.find(task => task.id === 'mandatory_journal');
      if (existingTask) {
        // Update existing task
        await toggleTaskCompletion('mandatory_journal');
      } else {
        // Create new task with completed status
        const updatedTasks = [...taskProgress, mandatoryJournalTask];
        // Save to database
        const taskRef = doc(db, 'task_progress', user.uid, 'daily', today);
        const dailyTasks = {
          date: today,
          tasks: updatedTasks,
          userId: user.uid,
          lastUpdated: Timestamp.now()
        };
        await setDoc(taskRef, dailyTasks);
      }

      setQuickJournalEntry("");
      toast.success("Journal entry saved and mandatory task completed! 📝✅");

    } catch (error) {
      console.error("Error saving quick journal entry:", error);
      toast.error("Failed to save journal entry. Please try again.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  // Handle chat message sending
  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      text: currentMessage,
      sender: 'user'
    };

    setChatMessages(prev => [...prev, userMessage]);
    const userInput = currentMessage.toLowerCase();
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response with varied responses based on user input
    setTimeout(() => {
      let responseText = "";

      // Analyze user input for different response types
      if (userInput.includes('sad') || userInput.includes('depressed') || userInput.includes('down') || userInput.includes('bad')) {
        responseText = "I'm really sorry you're feeling this way. It's completely valid to have tough days. Would you like to talk about what's bringing you down, or would you prefer to try a gentle breathing exercise to help lift your mood?";
      } else if (userInput.includes('anxious') || userInput.includes('worried') || userInput.includes('stress') || userInput.includes('nervous')) {
        responseText = "Anxiety can be really challenging. Remember that you're not alone in this. Would you like me to guide you through a calming breathing exercise, or would you prefer to share what's causing you stress?";
      } else if (userInput.includes('happy') || userInput.includes('good') || userInput.includes('great') || userInput.includes('excited')) {
        responseText = "That's wonderful to hear! It's great that you're feeling positive. Would you like to celebrate this good feeling with a quick mindfulness exercise, or would you like to talk about what made your day better?";
      } else if (userInput.includes('tired') || userInput.includes('exhausted') || userInput.includes('sleep')) {
        responseText = "Feeling tired is completely understandable. Rest is so important for our mental health. Would you like me to guide you through a relaxing breathing exercise to help you unwind, or would you prefer to talk about what's been draining your energy?";
      } else if (userInput.includes('meditation') || userInput.includes('breathe') || userInput.includes('breathing')) {
        responseText = "That's a great idea! Meditation and breathing exercises are powerful tools for mental wellness. Would you like me to start a 5-minute breathing challenge right now, or would you prefer some guidance on breathing techniques?";
      } else if (userInput.includes('journal') || userInput.includes('write') || userInput.includes('entry')) {
        responseText = "Journaling is such a valuable practice for mental health! It helps us process our thoughts and emotions. Would you like me to help you get started with today's journal entry, or would you like to review your past entries for insights?";
      } else if (userInput.includes('help') || userInput.includes('support') || userInput.includes('need')) {
        responseText = "I'm here to support you in any way I can. Whether you need someone to listen, guidance with wellness activities, or just want to chat about your day, I'm here. What would be most helpful for you right now?";
      } else if (userInput.includes('thank') || userInput.includes('thanks')) {
        responseText = "You're so welcome! It's my pleasure to be here for you. Remember, taking care of your mental health is one of the most important things you can do. Is there anything else you'd like to talk about or any wellness activity you'd like to try?";
      } else if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey')) {
        responseText = "Hello! It's great to hear from you. How are you feeling today? I'm here to listen and support you with your mental wellness journey.";
      } else {
        // Default varied responses
        const defaultResponses = [
          "I hear you. Remember that it's okay to feel this way. Would you like to try a quick breathing exercise together, or would you prefer to talk more about what's on your mind?",
          "Thank you for sharing that with me. Your feelings are completely valid. Would you like to explore some mindfulness techniques, or would you prefer to continue talking about what's going on?",
          "I appreciate you opening up about this. Mental health is so important, and it's brave of you to address it. Would you like me to guide you through a relaxation exercise, or would you prefer to discuss coping strategies?",
          "That sounds important to you. I'm here to listen without judgment. Would you like to try a grounding exercise to help you feel more present, or would you prefer to keep talking about your experience?",
          "Your mental health matters, and it's great that you're taking steps to care for it. Would you like to try a quick meditation session, or would you prefer to explore what support options might work best for you?"
        ];
        responseText = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }

      const miloResponse = {
        id: chatMessages.length + 2,
        text: responseText,
        sender: 'milo'
      };
      setChatMessages(prev => [...prev, miloResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Meditation challenge functions
  const startMeditation = () => {
    setIsMeditationOpen(true);
    setIsPlaying(true);
    setIsCompleted(false);
  };

  // Handle meditation dialog close
  const handleMeditationDialogChange = (open: boolean) => {
    setIsMeditationOpen(open);
    // Reset meditation state when dialog is closed
    if (!open) {
      setMeditationTime(300); // Reset to 5 minutes
      setIsPlaying(false);
      setIsCompleted(false);
    }
  };

  const completeMeditation = async () => {
    setIsCompleted(true);
    setIsPlaying(false);

    // Ensure mandatory meditation task exists and mark as completed
    const today = new Date().toISOString().split('T')[0];
    const mandatoryMeditationTask = {
      id: 'mandatory_meditation',
      title: '🧘 Complete 5-minute guided meditation (MANDATORY)',
      completed: true,
      date: today,
      completedAt: Timestamp.now()
    };

    // Check if task already exists in taskProgress
    const existingTask = taskProgress.find(task => task.id === 'mandatory_meditation');
    if (existingTask) {
      // Update existing task
      await toggleTaskCompletion('mandatory_meditation');
    } else {
      // Create new task with completed status
      const updatedTasks = [...taskProgress, mandatoryMeditationTask];
      // Save to database
      const taskRef = doc(db, 'task_progress', user!.uid, 'daily', today);
      const dailyTasks = {
        date: today,
        tasks: updatedTasks,
        userId: user!.uid,
        lastUpdated: Timestamp.now()
      };
      await setDoc(taskRef, dailyTasks);
    }

    toast.success("🎉 Meditation challenge completed! You've taken an important step for your mental wellness.");
  };

  // Meditation timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && meditationTime > 0) {
      interval = setInterval(() => {
        setMeditationTime(prev => {
          if (prev <= 1) {
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, meditationTime]);


  if (shouldShowLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Layout>
        <header className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-none dark:from-slate-900/90 dark:to-transparent z-10 border-b border-white/30 dark:border-slate-700/60">
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

      <Container className="py-8 md:py-16 animate-fade-in">
        {/* Primary Hero Section - Compact */}
        <section className="mb-8 text-center">
          <div className="inline-block p-1 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl mb-4 shadow-lg">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-6 py-2 shadow-sm border border-white/30 dark:border-slate-700/60">
              <span className="text-sm font-semibold text-primary dark:text-primary tracking-wide">✨ {getGreeting()}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground/80 dark:from-slate-100 dark:via-primary dark:to-slate-300 bg-clip-text text-transparent mb-3 leading-tight">
            {userData.name}!
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Your personalized wellness journey awaits.
          </p>
        </section>

        {/* Main Dashboard Layout - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-200px)]">
          {/* Left Column - Milo Chat (Desktop) / Top (Mobile) */}
          <div className="lg:col-span-4 order-1 flex flex-col">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-0 shadow-xl rounded-2xl overflow-hidden flex-1 flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <BotMessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="dark:text-slate-100">Chat with Milo</span>
                </CardTitle>
                <CardDescription className="text-sm dark:text-slate-300">
                  Your AI wellness companion is here to listen and support
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Chat Messages */}
                <div className="h-80 overflow-y-auto space-y-3 p-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          message.sender === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2 p-4 border-t border-purple-200 dark:border-purple-700">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Share how you're feeling..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1 text-sm"
                  />
                  <WellnessButton
                    onClick={sendChatMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    size="sm"
                    className="px-4"
                  >
                    Send
                  </WellnessButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Meditation & Journal */}
          <div className="lg:col-span-5 order-2 flex flex-col space-y-4">
            {/* Guided Meditation Section */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-0 shadow-xl rounded-2xl overflow-hidden flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <BotMessageSquare className="w-3 h-3 text-white" />
                  </div>
                  <span className="dark:text-slate-100">Guided Meditation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center space-y-3">
                  <h3 className="text-base font-semibold text-purple-700 dark:text-purple-300">
                    🌸 5-Minute Breathing Challenge
                  </h3>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs leading-relaxed">
                    Mindful breathing to reduce stress and find calm.
                  </p>
                  <WellnessButton
                    onClick={startMeditation}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-xs w-full"
                    size="sm"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start Challenge
                  </WellnessButton>
                </div>
              </CardContent>
            </Card>

            {/* Quick Journal Entry Section */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-0 shadow-xl rounded-2xl overflow-hidden flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <NotebookPen className="w-3 h-3 text-white" />
                    </div>
                    <span className="dark:text-slate-100">Daily Journal</span>
                  </CardTitle>
                  <WellnessButton
                    onClick={() => navigate('/journal')}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2"
                  >
                    📚 View All Entries
                  </WellnessButton>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Textarea
                    value={quickJournalEntry}
                    onChange={(e) => setQuickJournalEntry(e.target.value)}
                    placeholder="How are you feeling today?"
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                      💭 AI mood analysis • 📚 View All Entries
                    </div>
                    <WellnessButton
                      onClick={saveQuickJournalEntry}
                      disabled={!quickJournalEntry.trim() || isSavingJournal}
                      size="sm"
                      className="text-xs px-3"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {isSavingJournal ? "Saving..." : "Save"}
                    </WellnessButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Action Plan */}
          <div className="lg:col-span-3 order-3 flex flex-col space-y-4">
            {/* Daily Progress Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-0 shadow-xl rounded-2xl overflow-hidden flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Goal className="w-3 h-3 text-white" />
                  </div>
                  <span className="dark:text-slate-100">Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative">
                  <Progress value={dailyProgress} className="mb-2 h-3 bg-white/50 dark:bg-slate-700/50 rounded-full" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20"></div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{Math.round(dailyProgress)}%</p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">wellness score</p>
                </div>

                {/* Mandatory Tasks Indicator */}
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">📝 Daily Journal</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tasks.some(t => t.id === 'mandatory_journal' && t.completed)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tasks.some(t => t.id === 'mandatory_journal' && t.completed) ? '✓ Done' : 'Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">🧘 Meditation</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tasks.some(t => t.id === 'mandatory_meditation' && t.completed)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tasks.some(t => t.id === 'mandatory_meditation' && t.completed) ? '✓ Done' : 'Required'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Action Plan */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-0 shadow-xl rounded-2xl overflow-hidden flex-[2]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="dark:text-slate-100">Today's Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer group text-sm ${
                        task.completed
                          ? 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700'
                          : task.mandatory
                          ? 'bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-700'
                          : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/50 dark:border-slate-700/50'
                      }`}
                      onClick={() => !tasksError && toggleTaskCompletion(task.id)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          task.completed
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 dark:border-slate-600 group-hover:border-green-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white font-bold"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium transition-all duration-300 text-xs leading-tight ${
                          task.completed
                            ? 'line-through text-green-700 dark:text-green-400'
                            : task.mandatory
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-800 dark:text-slate-200 group-hover:text-green-700 dark:group-hover:text-green-400'
                        }`}>
                          {task.id === 'mandatory_meditation' ? '🧘 Complete 5-minute meditation' :
                           task.id === 'mandatory_journal' ? '📝 Write daily journal entry' :
                           task.title}
                        </span>
                        {task.mandatory && !task.completed && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                            ⚠️ REQUIRED
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meditation Challenge Popup */}
        <Dialog open={isMeditationOpen} onOpenChange={handleMeditationDialogChange}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BotMessageSquare className="w-6 h-6 text-purple-600" />
                5-Minute Breathing Challenge
              </DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-6 py-4">
              {/* Timer Display */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      {Math.floor(meditationTime / 60)}:{(meditationTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {isCompleted ? 'Completed!' : isPlaying ? 'Breathe deeply...' : 'Paused'}
                    </div>
                  </div>
                </div>

                {/* Breathing Animation */}
                {isPlaying && !isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border-4 border-purple-300 dark:border-purple-600 rounded-full animate-ping opacity-20"></div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  🌸 Breathing Instructions
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  {isCompleted
                    ? "🎉 Congratulations! You've completed your breathing meditation. Take a moment to notice how you feel."
                    : "Inhale slowly for 4 counts, hold for 4, exhale for 4. Focus on your breath and let go of any tension."
                  }
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {!isCompleted ? (
                  <div className="text-center">
                    <div className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                      🌸 Focus on your breath and let go of any tension
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                      Challenge in progress - complete the full 5 minutes
                    </div>
                  </div>
                ) : (
                  <WellnessButton
                    onClick={() => {
                      setIsMeditationOpen(false);
                      setMeditationTime(300);
                      setIsPlaying(false);
                      setIsCompleted(false);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Check className="w-4 h-4" />
                    Complete Challenge
                  </WellnessButton>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Emergency Support Section (if needed) */}
        {showReferral && (
          <Card className="mt-6 p-4 border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-25 shadow-xl rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg mb-2">Professional Support Recommended</h3>
                <p className="text-red-700 text-sm mb-4 leading-relaxed">
                  Based on your wellness assessment, we recommend connecting with a mental health professional.
                </p>
                <div className="flex flex-wrap gap-3">
                  <WellnessButton
                    onClick={() => navigate('/referral')}
                    variant="critical"
                    size="sm"
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Find Professional Help
                  </WellnessButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <WellnessButton
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Emergency Resources
                      </WellnessButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">Emergency Support Resources</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed">
                          If you're in crisis: 🆘 Call 988 (US) or your local emergency number
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

      </Container>
    </Layout>
  );
}

