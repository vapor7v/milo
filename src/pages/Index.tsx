import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Heart, Brain, MessageCircle, Shield, Sparkles, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  return (
    <Layout background="gradient">
      <Container className="max-w-4xl text-center">
        <div className="flex justify-end mt-4">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Signed in as {user.email}</span>
              <button
                onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        {/* Hero Section */}
        <section className="mb-14 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            Gen AI for Youth Mental Wellness
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
            Meet MindPal
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered companion for mental wellness. Get personalized support, build healthy habits, and never feel alone on your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <WellnessButton
              size="lg"
              onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
              className="text-lg px-8 shadow-md focus:ring-2 focus:ring-blue-400"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Your Journey
            </WellnessButton>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-14">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-0 shadow-md hover:shadow-xl transition-all rounded-2xl bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">AI Companion</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Chat with MindPal anytime you need support. Our AI understands youth mental health and provides empathetic, helpful responses.
              </p>
            </Card>
            <Card className="p-8 border-0 shadow-md hover:shadow-xl transition-all rounded-2xl bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-200 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Smart Wellness</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Evidence-based assessments and personalized interventions. Track your progress and build lasting mental wellness habits.
              </p>
            </Card>
            <Card className="p-8 border-0 shadow-md hover:shadow-xl transition-all rounded-2xl bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-300 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Crisis Support</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Advanced safety features detect when you need help and connect you with professional support when necessary.
              </p>
            </Card>
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-14">
          <h2 className="text-3xl font-extrabold mb-10 text-center tracking-tight text-gray-900">How MindPal Supports You</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-7 text-left">
              {["Complete Your Assessment","Get Your Personalized Plan","Build Healthy Habits","Connect When Needed"].map((title, idx) => (
                <div className="flex gap-4 items-start" key={title}>
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900">{title}</h4>
                    <p className="text-gray-500">
                      {[
                        "Quick, evidence-based screening to understand your current wellness level.",
                        "Receive tailored wellness activities and coping strategies for your needs.",
                        "Smart nudges and engaging challenges help you form lasting wellness habits.",
                        "Automatic escalation to professional help when your wellness needs extra support."
                      ][idx]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Card className="p-8 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="text-center">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">You're Not Alone</h3>
                <p className="text-gray-500 mb-6">
                  Join thousands of young people who are taking control of their mental wellness with MindPal.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">10k+</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-sm text-gray-500">Feel Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-gray-500">AI Support</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-10">
          <Card className="p-12 border-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-3xl font-extrabold mb-4 text-center">Ready to Start Your Wellness Journey?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto text-center text-white/90">
              Take the first step towards better mental health. MindPal is here to support you every step of the way.
            </p>
            <WellnessButton 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 text-lg px-8 focus:ring-2 focus:ring-white"
            >
              Get Started - It's Free
            </WellnessButton>
          </Card>
        </section>
      </Container>
    </Layout>
  );
};

export default Index;
