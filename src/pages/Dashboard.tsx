import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { RiskLevel, RiskLevelType } from '@/components/RiskLevel';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Brain, BookOpen, Calendar, Users } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [riskLevel, setRiskLevel] = useState<RiskLevelType>(1);
  const [userData, setUserData] = useState<any>({});
  const [dailyProgress, setDailyProgress] = useState(65);

  useEffect(() => {
    if (location.state) {
      setRiskLevel(location.state.riskLevel);
      setUserData(location.state.formData);
    }
  }, [location.state]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodaysTasks = () => [
    { id: 1, title: '5-minute breathing exercise', completed: true },
    { id: 2, title: 'Mood check-in', completed: true },
    { id: 3, title: 'Chat with MindPal', completed: false },
    { id: 4, title: 'Evening reflection', completed: false },
  ];

  return (
    <Layout background="gradient">
      <Container className="max-w-3xl">
        <div className="flex justify-end mt-4">
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
          >
            Log Out
          </button>
        </div>
        {/* Hierarchy: Welcome & Progress */}
        <section className="mb-10 flex flex-col items-center text-center gap-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm mb-1">
            {getWelcomeMessage()}, {userData.name || 'Friend'}! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Let's make today a good day for your mental wellness.
          </p>
        </section>

        {/* Progressive Disclosure: Risk Level */}
        <Card className="mb-8 p-6 flex flex-col md:flex-row items-center gap-6 border-0 shadow-md rounded-2xl bg-white">
          <RiskLevel level={riskLevel} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold mb-1 text-gray-900">Your Current Wellness Level</h2>
            <p className="text-gray-500 mb-2">
              Based on your recent assessment, here's your current risk level.
            </p>
            <Badge variant="outline" className="text-base px-4 py-1 border-blue-400 text-blue-700 bg-blue-50">
              Level {riskLevel}
            </Badge>
          </div>
        </Card>

        {/* Consistency & Contrast: Daily Progress */}
        <Card className="mb-8 p-6 border-0 shadow-md rounded-2xl bg-white">
          <h3 className="text-lg font-bold mb-3 text-gray-900">Today's Progress</h3>
          <Progress value={dailyProgress} className="mb-2 bg-blue-100" />
          <p className="text-gray-500 mb-2">{dailyProgress}% completed</p>
        </Card>

        {/* Proximity: Today's Tasks */}
        <Card className="mb-8 p-6 border-0 shadow-md rounded-2xl bg-white">
          <h3 className="text-lg font-bold mb-3 text-gray-900">Today's Tasks</h3>
          <ul className="space-y-3">
            {getTodaysTasks().map((task) => (
              <li key={task.id} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{task.title}</span>
                {task.completed && <span className="ml-2 text-green-500">✔</span>}
              </li>
            ))}
          </ul>
        </Card>

        {/* Alignment & Consistency: Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <WellnessButton onClick={() => navigate('/aichat')} className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
            <MessageCircle className="w-5 h-5 mr-2" /> Chat
          </WellnessButton>
          <WellnessButton onClick={() => navigate('/meditation-challenge')} className="w-full bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
            <Brain className="w-5 h-5 mr-2" /> Meditate
          </WellnessButton>
          <WellnessButton variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-300">
            <BookOpen className="w-5 h-5 mr-2" /> Journal
          </WellnessButton>
          <WellnessButton variant="outline" className="w-full border-orange-400 text-orange-700 hover:bg-orange-50 focus:ring-2 focus:ring-orange-300">
            <Calendar className="w-5 h-5 mr-2" /> Plan
          </WellnessButton>
        </div>

        {/* Community Section */}
        <Card className="p-6 border-0 shadow-md rounded-2xl bg-white mb-8">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <h4 className="font-bold text-gray-900">Join the MindPal Community</h4>
              <p className="text-gray-500 text-sm">Connect with others, share your journey, and find support.</p>
            </div>
          </div>
        </Card>

        {/* Accessibility: Emergency Notice for High Risk */}
        {riskLevel >= 4 && (
          <Card className="p-6 mt-8 shadow-lg border-0 bg-gradient-to-r from-orange-400 to-red-400">
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-white" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">You're Not Alone</h3>
                <p className="text-white/90 text-sm mb-4">
                  It looks like you might benefit from professional support. We're here to help you find it.
                </p>
                <WellnessButton variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  Find Professional Help
                </WellnessButton>
              </div>
            </div>
          </Card>
        )}
      </Container>
    </Layout>
  );
}