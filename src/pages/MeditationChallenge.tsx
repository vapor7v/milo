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
    let interval: NodeJS.Timeout | null = null;
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
    } else if (timeLeft === 0 && !isCompleted) {
      setIsCompleted(true);
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isCompleted]);

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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout background="gradient">
      <Container className="max-w-md mx-auto">
        <Card className="p-8 mt-10 mb-8 shadow-md border-0 rounded-2xl bg-white flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-2 text-primary">Meditation Challenge</h2>
          <p className="text-muted-foreground mb-6">Take 5 minutes to relax, breathe, and focus on your well-being.</p>
          
          <div className="w-full flex flex-col items-center mb-6">
            <Progress value={progress} className="mb-4 h-3" />
            <div className="text-4xl font-mono text-primary mb-2">{formatTime(timeLeft)}</div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle className="w-5 h-5" /> Session Complete!
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            {!sessionStarted ? (
              <WellnessButton onClick={startSession} size="lg">
                <Play className="w-5 h-5 mr-2" /> Start
              </WellnessButton>
            ) : !isCompleted ? (
              <>
                {isActive ? (
                  <WellnessButton onClick={pauseSession} className="bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300">
                    <Pause className="w-5 h-5 mr-2" /> Pause
                  </WellnessButton>
                ) : (
                  <WellnessButton onClick={startSession}>
                    <Play className="w-5 h-5 mr-2" /> Resume
                  </WellnessButton>
                )}
                <WellnessButton onClick={resetSession} variant="secondary">
                  <RotateCcw className="w-5 h-5 mr-2" /> Reset
                </WellnessButton>
              </>
            ) : (
                 <WellnessButton onClick={resetSession}>
                    <RotateCcw className="w-5 h-5 mr-2" /> Start Again
                  </WellnessButton>
            )}
          </div>
          
          <WellnessButton onClick={() => navigate('/dashboard')} variant="ghost" className="w-full mt-2">
            Back to Dashboard
          </WellnessButton>
        </Card>
      </Container>
    </Layout>
  );
}
