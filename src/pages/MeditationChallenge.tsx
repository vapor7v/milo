import React, { useState, useEffect } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

export default function MeditationChallenge() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const totalTime = 300;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCompleted(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startSession = () => {
    setSessionStarted(true);
    setIsActive(true);
  };
  const pauseSession = () => setIsActive(false);
  const resetSession = () => {
    setIsActive(false);
    setTimeLeft(300);
    setIsCompleted(false);
    setSessionStarted(false);
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout background="gradient">
      <Container className="max-w-md mx-auto">
        <Card className="p-8 mt-10 mb-8 shadow-md border-0 rounded-2xl bg-white flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-center text-blue-700">Meditation Challenge</h2>
          <p className="text-gray-500 mb-6 text-center">Take 5 minutes to relax, breathe, and focus on your well-being.</p>
          <div className="w-full flex flex-col items-center mb-6">
            <Progress value={progress} className="mb-4 bg-blue-100 h-3 rounded-full" />
            <div className="text-4xl font-mono text-blue-600 mb-2">{formatTime(timeLeft)}</div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle className="w-5 h-5" /> Session Complete!
              </div>
            )}
          </div>
          <div className="flex gap-4 mb-4">
            {!sessionStarted && (
              <WellnessButton onClick={startSession} className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
                <Play className="w-5 h-5 mr-2" /> Start
              </WellnessButton>
            )}
            {sessionStarted && !isCompleted && (
              <>
                {isActive ? (
                  <WellnessButton onClick={pauseSession} className="bg-yellow-400 text-white hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300">
                    <Pause className="w-5 h-5 mr-2" /> Pause
                  </WellnessButton>
                ) : (
                  <WellnessButton onClick={startSession} className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
                    <Play className="w-5 h-5 mr-2" /> Resume
                  </WellnessButton>
                )}
                <WellnessButton onClick={resetSession} className="bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300">
                  <RotateCcw className="w-5 h-5 mr-2" /> Reset
                </WellnessButton>
              </>
            )}
          </div>
          <WellnessButton onClick={() => navigate('/dashboard')} variant="outline" className="w-full mt-2 border-blue-400 text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300">
            Back to Dashboard
          </WellnessButton>
        </Card>
      </Container>
    </Layout>
  );
}