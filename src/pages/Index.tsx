import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card } from '@/components/ui/card';
import { Sparkles, Users } from 'lucide-react';

const Feature = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
      {number}
    </div>
    <div>
      <h3 className="font-bold text-lg text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function Index() {
  const navigate = useNavigate();

  return (
    <Layout>
        <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
            <Container className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-secondary">Milo</h1>
                <WellnessButton variant="ghost" onClick={() => navigate('/auth')}>Log In</WellnessButton>
            </Container>
        </header>

      {/* Hero Section */}
      <Container className="text-center py-20 lg:py-32 mt-16">
        <div className="inline-flex items-center gap-2 bg-notice/20 text-notice-foreground px-4 py-2 rounded-full font-semibold text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Gen AI for Youth Mental Wellness</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 text-secondary">Meet Milo</h1>
        <p className="max-w-2xl mx-auto text-lg lg:text-xl text-muted-foreground mb-8">
          Your personal AI companion for navigating the ups and downs of mental wellness. Safe, supportive, and always here for you.
        </p>
        <WellnessButton size="xl" className="px-8 py-7 text-lg" onClick={() => navigate('/auth')}>Start Your Journey - It's Free</WellnessButton>
      </Container>

      {/* Features & Social Proof Section */}
      <Container className="py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Feature number={1} title="Complete Your Assessment" description="Quick, evidence-based screening to understand your current wellness level." />
            <Feature number={2} title="Get Your Personalized Plan" description="Receive tailored wellness activities and coping strategies for your needs." />
            <Feature number={3} title="Build Healthy Habits" description="Smart nudges and engaging challenges help you form lasting wellness habits." />
            <Feature number={4} title="Connect When Needed" description="Automatic escalation to professional help when your wellness needs extra support." />
          </div>
          <Card className="bg-secondary/10 border-0 rounded-2xl p-8 lg:p-10 text-center shadow-lg">
            <div className="inline-block bg-secondary/20 p-4 rounded-full mb-5">
                <Users className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">You're Not Alone</h3>
            <p className="text-muted-foreground mb-6">Join thousands of young people who are taking control of their mental wellness with Milo.</p>
            <div className="flex justify-around">
              <div>
                <p className="text-4xl font-bold text-foreground">10k+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Feel Supported</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">AI Support</p>
              </div>
            </div>
          </Card>
        </div>
      </Container>

      {/* Final CTA Section */}
      <Container className="py-16 lg:py-24">
          <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-10 lg:p-16 text-center shadow-xl">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">Ready to Start Your Wellness Journey?</h2>
              <p className="max-w-xl mx-auto text-lg text-primary-foreground/80 mb-8">Take the first step towards better mental health. Milo is here to support you every step of the way.</p>
              <WellnessButton size="xl" variant="light" className="px-8 py-7 text-lg" onClick={() => navigate('/auth')}>Get Started - It's Free</WellnessButton>
          </div>
      </Container>
    </Layout>
  );
}
