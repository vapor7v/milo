import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Users, Zap, Activity, RefreshCw } from 'lucide-react';
import { useWellness } from '@/hooks/useWellness';

interface WellnessCardProps {
  compact?: boolean;
}

export const WellnessCard: React.FC<WellnessCardProps> = ({ compact = false }) => {
  const { wellnessPlan, loading, error, analyzeWellness, getTodaysActivities, scores } = useWellness();

  const handleAnalyze = async () => {
    await analyzeWellness();
  };

  const todaysActivities = getTodaysActivities();

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="text-sm">{error}</p>
            <Button
              onClick={handleAnalyze}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wellnessPlan) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Wellness Journey
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Discover Your Wellness Profile</h3>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
              Get AI-powered insights and personalized wellness activities based on your conversations and mood patterns
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                  Analyzing Your Journey...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-3" />
                  Generate Wellness Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Today's Wellness
            </span>
            <Badge variant="secondary">
              Score: {scores?.overallWellnessScore}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaysActivities.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Today's Activities:</h4>
              <ul className="space-y-1">
                {todaysActivities.slice(0, 3).map((activity, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activities planned for today</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Your Wellness Profile
            </span>
          </span>
          <Button
            onClick={handleAnalyze}
            variant="outline"
            size="sm"
            disabled={loading}
            className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Wellness Scores */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3 p-4 bg-white/70 rounded-xl shadow-sm border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Mood</span>
            </div>
            <Progress value={(scores?.moodScore || 0) * 10} className="h-3 bg-white/50 rounded-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{scores?.moodScore || 0}/10</span>
              <div className={`w-2 h-2 rounded-full ${
                (scores?.moodScore || 0) >= 7 ? 'bg-green-400' :
                (scores?.moodScore || 0) >= 4 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-white/70 rounded-xl shadow-sm border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Anxiety</span>
            </div>
            <Progress value={(scores?.anxietyScore || 0) * 10} className="h-3 bg-white/50 rounded-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{scores?.anxietyScore || 0}/10</span>
              <div className={`w-2 h-2 rounded-full ${
                (scores?.anxietyScore || 0) <= 3 ? 'bg-green-400' :
                (scores?.anxietyScore || 0) <= 6 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-white/70 rounded-xl shadow-sm border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Social</span>
            </div>
            <Progress value={(scores?.socialEngagementScore || 0) * 10} className="h-3 bg-white/50 rounded-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{scores?.socialEngagementScore || 0}/10</span>
              <div className={`w-2 h-2 rounded-full ${
                (scores?.socialEngagementScore || 0) >= 7 ? 'bg-green-400' :
                (scores?.socialEngagementScore || 0) >= 4 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-white/70 rounded-xl shadow-sm border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Stress</span>
            </div>
            <Progress value={(scores?.stressScore || 0) * 10} className="h-3 bg-white/50 rounded-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{scores?.stressScore || 0}/10</span>
              <div className={`w-2 h-2 rounded-full ${
                (scores?.stressScore || 0) <= 3 ? 'bg-green-400' :
                (scores?.stressScore || 0) <= 6 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="text-center p-8 bg-gradient-to-br from-white/80 to-white/60 rounded-2xl shadow-lg border border-white/50">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-white">{scores?.overallWellnessScore || 0}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">★</span>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-1">Overall Wellness Score</div>
          <div className="text-sm text-gray-600">out of 10</div>
          <div className="mt-3 flex justify-center">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              (scores?.overallWellnessScore || 0) >= 7 ? 'bg-green-100 text-green-700' :
              (scores?.overallWellnessScore || 0) >= 4 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(scores?.overallWellnessScore || 0) >= 7 ? 'Excellent' :
               (scores?.overallWellnessScore || 0) >= 4 ? 'Good Progress' : 'Needs Attention'}
            </div>
          </div>
        </div>

        {/* Today's Activities */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Today's Wellness Activities
          </h3>
          {todaysActivities.length > 0 ? (
            <div className="space-y-2">
              {todaysActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activities planned for today</p>
          )}
        </div>

        {/* Recommendations */}
        {wellnessPlan.recommendations && wellnessPlan.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Personal Recommendations</h3>
            <div className="space-y-2">
              {wellnessPlan.recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};