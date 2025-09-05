import React, { useState, useEffect } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, Shield, Phone } from 'lucide-react';
import { createUser, getAuthUserId } from '../lib/database';
import { supabase } from '../lib/supabaseClient';

// ...existing code...
export default function Onboarding() {
  // Wellness assessment questions
  const wellnessQuestions = [
    {
      key: 'phq9Score',
      question: 'How often have you felt down or hopeless recently?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 5, label: 'Several days' },
        { value: 10, label: 'More than half the days' },
        { value: 15, label: 'Nearly every day' },
      ],
    },
    {
      key: 'gad7Score',
      question: 'How often do you feel anxious or worried?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 5, label: 'Several days' },
        { value: 10, label: 'More than half the days' },
        { value: 15, label: 'Nearly every day' },
      ],
    },
    // Add more questions here as needed
  ];
  const [wellnessStep, setWellnessStep] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // On mount, check onboarding_complete for current user
  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const id = authData?.user?.id;
      if (id) {
        const { data: userRow } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', id)
          .maybeSingle();
        if (userRow && (userRow as any).onboarding_complete) {
          navigate('/dashboard');
          return;
        }
      }
      setLoading(false);
    };
    checkOnboarding();
  }, [navigate]);
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    workingHours: '',
    freeTimeFrom: '',
    freeTimeTo: '',
    emergencyContact: '',
    emergencyName: '',
    phq9Score: 0,
    gad7Score: 0,
    ucla3Score: 0,
    safetyRisk: false
  });
  const [nameError, setNameError] = useState('');
  const [workingHoursError, setWorkingHoursError] = useState('');
  const [freeTimeError, setFreeTimeError] = useState('');
  const [emergencyNameError, setEmergencyNameError] = useState('');
  const [emergencyContactError, setEmergencyContactError] = useState('');
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calculate risk level based on scores
      const riskLevel = calculateRiskLevel();
      // Get current user from supabase auth
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email || null;
      const id = authData?.user?.id;
      if (id) {
        await supabase.from('users').upsert([
          {
            id,
            name: formData.name,
            email,
            role: formData.role,
            free_time: formData.freeTimeFrom + '-' + formData.freeTimeTo,
            onboarding_complete: true
          }
        ], { onConflict: 'id' });
      }
      navigate('/dashboard', { state: { riskLevel, formData } });
    }
  };

  const calculateRiskLevel = () => {
    const { phq9Score, gad7Score, safetyRisk } = formData;
    if (safetyRisk) return 5;
    if (phq9Score >= 20 || gad7Score >= 15) return 4;
    if (phq9Score >= 15 || gad7Score >= 10) return 3;
    if (phq9Score >= 5 || gad7Score >= 5) return 2;
    return 1;
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition-all ${
              idx + 1 <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // create user row (will try to use auth ID if present)
    const user = await createUser({ name: formData.name, role: formData.role, free_time: formData.freeTimeFrom + '-' + formData.freeTimeTo });
    if (user?.id) {
      setCreatedUserId(user.id);
      // store locally for quick access in other pages
      localStorage.setItem('app_user_id', user.id);
      console.log('User row created:', user);
    }
  }

  async function saveUserData(name: string, role: string, freeTime: string) {
    const { data, error, status } = await supabase
      .from('users')
      .insert([{ name, role, free_time: freeTime }])
      .select();

    console.log('Insert status:', status);
    if (error) {
      console.error('Error saving user:', error);
    } else {
      console.log('Saved user:', data);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveUserData(formData.name, formData.role, formData.freeTimeFrom + '-' + formData.freeTimeTo);
  }

  return (
    <Layout background="gradient">
      <Container>
        <StepIndicator />
        
        {step === 1 && (
          <Card className="p-8 shadow-soft border-0">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Welcome to MindPal</h1>
              <p className="text-muted-foreground">Let's get to know you better so we can provide personalized support</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow letters and spaces
                    if (/^[a-zA-Z ]*$/.test(value)) {
                      setFormData({ ...formData, name: value });
                      setNameError('');
                    } else {
                      setNameError('Name must contain only letters and spaces');
                    }
                  }}
                  placeholder="Enter your name"
                  className="mt-2"
                />
                {nameError && (
                  <span className="text-destructive text-sm">{nameError}</span>
                )}
              </div>
              
              <div>
                <Label>Are you a...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({...formData, role: value})}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional">Working Professional</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <WellnessButton 
              onClick={handleNext}
              disabled={!formData.name || !formData.role}
              className="w-full mt-8"
            >
              Continue
            </WellnessButton>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8 shadow-soft border-0">
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your Schedule</h2>
              <p className="text-muted-foreground">Help us understand your daily routine</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="workingHours">How many hours do you work/study daily?</Label>
                <Input
                  id="workingHours"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.workingHours}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (Number(value) >= 1 && Number(value) <= 12)) {
                      setFormData({ ...formData, workingHours: value });
                      setWorkingHoursError('');
                    } else {
                      setWorkingHoursError('Working hours must be between 1 and 12');
                    }
                  }}
                  placeholder="e.g., 8"
                  className="mt-2"
                />
                {workingHoursError && (
                  <span className="text-destructive text-sm">{workingHoursError}</span>
                )}
              </div>
              <div>
                <Label>When are your typical free time slots?</Label>
                <div className="flex gap-4 mt-2">
                  <div>
                    <Label htmlFor="freeTimeFrom">From</Label>
                    <Input
                      id="freeTimeFrom"
                      type="time"
                      value={formData.freeTimeFrom}
                      onChange={(e) => {
                        setFormData({ ...formData, freeTimeFrom: e.target.value });
                        setFreeTimeError('');
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeTimeTo">To</Label>
                    <Input
                      id="freeTimeTo"
                      type="time"
                      value={formData.freeTimeTo}
                      onChange={(e) => {
                        setFormData({ ...formData, freeTimeTo: e.target.value });
                        setFreeTimeError('');
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
                {freeTimeError && (
                  <span className="text-destructive text-sm">{freeTimeError}</span>
                )}
              </div>
            </div>
            
            <WellnessButton 
              onClick={async () => {
                // Validate that from < to
                if (formData.freeTimeFrom && formData.freeTimeTo && formData.freeTimeFrom >= formData.freeTimeTo) {
                  setFreeTimeError('Start time must be before end time');
                  return;
                }
                setFreeTimeError('');
                // Save user data to Supabase
                await saveUserData(formData.name, formData.role, formData.freeTimeFrom + '-' + formData.freeTimeTo);
                // Then go to next step
                setStep(step + 1);
              }}
              disabled={
                !formData.workingHours ||
                !formData.freeTimeFrom ||
                !formData.freeTimeTo
              }
              className="w-full mt-8"
            >
              Continue
            </WellnessButton>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8 shadow-soft border-0">
            <div className="text-center mb-8">
              <Phone className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Emergency Contact</h2>
              <p className="text-muted-foreground">Someone we can reach if you need urgent support</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="emergencyName">Contact person's name</Label>
                <Input
                  id="emergencyName"
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z ]*$/.test(value)) {
                      setFormData({ ...formData, emergencyName: value });
                      setEmergencyNameError('');
                    } else {
                      setEmergencyNameError('Name must contain only letters and spaces');
                    }
                  }}
                  placeholder="Family member or close friend"
                  className="mt-2"
                />
                {emergencyNameError && (
                  <span className="text-destructive text-sm">{emergencyNameError}</span>
                )}
              </div>
              <div>
                <Label htmlFor="emergencyContact">Their phone number</Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.emergencyContact}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setFormData({ ...formData, emergencyContact: value });
                      setEmergencyContactError('');
                    } else {
                      setEmergencyContactError('Phone number must contain only numbers');
                    }
                  }}
                  placeholder="Phone number"
                  className="mt-2"
                />
                {emergencyContactError && (
                  <span className="text-destructive text-sm">{emergencyContactError}</span>
                )}
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-2" />
                  This contact will only be reached in emergency situations or if we detect you may need urgent support.
                </p>
              </div>
            </div>
            
            <WellnessButton 
              onClick={handleNext}
              disabled={!formData.emergencyName || !formData.emergencyContact}
              className="w-full mt-8"
            >
              Continue
            </WellnessButton>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-8 shadow-soft border-0">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Wellness Assessment</h2>
              <p className="text-muted-foreground">Quick questions to understand how you're feeling</p>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-safe p-6 rounded-xl">
                <h3 className="font-semibold mb-4">{wellnessQuestions[wellnessStep].question}</h3>
                <RadioGroup
                  value={formData[wellnessQuestions[wellnessStep].key]?.toString() || ''}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      [wellnessQuestions[wellnessStep].key]: parseInt(value),
                    });
                  }}
                >
                  {wellnessQuestions[wellnessStep].options.map((opt) => (
                    <div className="flex items-center space-x-2" key={opt.value}>
                      <RadioGroupItem value={opt.value.toString()} id={wellnessQuestions[wellnessStep].key + opt.value} />
                      <Label htmlFor={wellnessQuestions[wellnessStep].key + opt.value}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              {wellnessStep > 0 && (
                <WellnessButton onClick={() => setWellnessStep(wellnessStep - 1)}>
                  Previous
                </WellnessButton>
              )}
              {wellnessStep < wellnessQuestions.length - 1 ? (
                <WellnessButton
                  onClick={() => setWellnessStep(wellnessStep + 1)}
                  disabled={formData[wellnessQuestions[wellnessStep].key] === undefined || formData[wellnessQuestions[wellnessStep].key] === ''}
                >
                  Next
                </WellnessButton>
              ) : (
                <WellnessButton
                  onClick={handleNext}
                  disabled={formData[wellnessQuestions[wellnessStep].key] === undefined || formData[wellnessQuestions[wellnessStep].key] === ''}
                >
                  Complete Assessment
                </WellnessButton>
              )}
            </div>
          </Card>
        )}
      </Container>
    </Layout>
  );
}