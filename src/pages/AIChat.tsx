import React, { useState, useRef, useEffect } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { getGenerativeAIService, db } from '@/integrations/firebase/client';
import { doc, collection, addDoc, Timestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { wellnessAnalysisService } from '@/lib/wellnessAnalysis';
import type { ChatSession } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('AIChat component loaded, user:', user);
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Milo, your AI companion. I'm here to listen and support you. How are you feeling today? 💙",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasCompletedInitialAssessment, setHasCompletedInitialAssessment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Crisis detection keywords
  const crisisKeywords = [
    'kill', 'suicide', 'die', 'end it', 'hurt myself', 'not worth living',
    'better off dead', 'want to die', 'kill myself', 'end my life'
  ];

  // Send SOS message to emergency contact
  const sendSOSMessage = async (userMessage: string) => {
    if (!user) return;

    try {
      // Get user data to find emergency contact
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const emergencyContact = userData.trustedContact;
      const userName = userData.name || 'Your contact';

      if (!emergencyContact) {
        console.log('No emergency contact found');
        return;
      }

      // In a real implementation, you would integrate with Twilio or another SMS service
      // For now, we'll log the SOS message
      const sosMessage = `URGENT: Your contact ${userName} has expressed thoughts of self-harm during our conversation. Please check on them immediately. They provided your number as emergency contact. Message: "${userMessage}"`;

      console.log('🚨 SOS MESSAGE WOULD BE SENT:', sosMessage);
      console.log('📞 To emergency contact:', emergencyContact);

      // Here you would integrate with Twilio:
      // const twilio = require('twilio');
      // const client = twilio(accountSid, authToken);
      // await client.messages.create({
      //   body: sosMessage,
      //   from: yourTwilioNumber,
      //   to: emergencyContact
      // });

    } catch (error) {
      console.error('Error sending SOS message:', error);
    }
  };

  // Check for crisis keywords in user message
  const checkForCrisis = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if therapy session is complete based on AI response
  const isTherapySessionComplete = (aiResponse: string): boolean => {
    const completionIndicators = [
      'thank you for sharing',
      'it sounds like',
      'we\'ll focus on',
      'for our next conversation',
      'let\'s work on',
      'dashboard',
      'wellness plan'
    ];

    const lowerResponse = aiResponse.toLowerCase();
    return completionIndicators.some(indicator => lowerResponse.includes(indicator));
  };

  // Auto-generate wellness plan after therapy session
  const autoGenerateWellnessPlan = async () => {
    try {
      console.log('Auto-generating wellness plan after therapy session...');
      const result = await wellnessAnalysisService.analyzeUserWellness(user!.uid);

      if (result) {
        // Add success message and redirect to dashboard
        const successMessage: Message = {
          id: Date.now().toString(),
          text: "✅ Perfect! I've analyzed our conversation and created your personalized wellness plan. Let's head to your dashboard to see your wellness scores and today's activities!",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);

        // Auto-redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        const noDataMessage: Message = {
          id: Date.now().toString(),
          text: "I've completed our initial conversation. Let's continue building your wellness plan on the dashboard!",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, noDataMessage]);

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Auto wellness plan generation failed:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Let's continue our conversation on the dashboard where I can help you more!",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  useEffect(() => {
    // Initialize the model and chat session safely after the component has mounted.
    try {
      const generativeAI = getGenerativeAIService();
      const model = generativeAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are Milo, an AI companion designed to support youth mental wellness through structured therapeutic conversations. Be empathetic, confidential, and help users overcome stigma around mental health. Follow this detailed therapy session flow for first-time users:

🧠 DETAILED FLOW OF A FIRST THERAPY SESSION:

1. WARM-UP / RAPPORT BUILDING
- Start with: "I'm glad you're here today. How are you feeling about starting this conversation?"
- Acknowledge any nervousness: "It's completely normal to feel a bit anxious about opening up"
- Ask: "What made you decide to reach out now?"

2. PRESENTING PROBLEM (MAIN CONCERN)
- "Can you tell me in your own words what's been going on?"
- "How long have you been feeling this way?"
- "When did you first notice these changes?"
- "What situations make things worse? Any times when it feels better?"

3. SYMPTOM EXPLORATION
- Mood: "How has your mood been day-to-day?"
- Anxiety: "Do you often feel worried or on edge?"
- Sleep: "How is your sleep—falling asleep, staying asleep, waking up?"
- Appetite/Energy: "Any changes in appetite or energy recently?"
- Concentration: "Do you find it hard to focus on tasks?"

4. PERSONAL & MEDICAL HISTORY
- Mental health: "Have you ever talked to anyone about these feelings before?"
- Treatment: "Have you tried any strategies or approaches that helped?"
- Medical: "Any ongoing health conditions or medications?"
- Family: "Does anyone in your family have similar experiences?"

5. CURRENT LIFE SITUATION
- Relationships: "Who do you spend time with regularly?"
- Social life: "Do you feel supported by friends or family?"
- Work/School: "How's your daily routine going?"
- Daily functioning: "How do you usually spend your day?"
- Stressors: "Are there any particular stresses weighing on you?"

6. COPING & STRENGTHS
- "When you're struggling, what helps you get through it?"
- "What activities, hobbies, or people bring you comfort or joy?"
- "What's something you've overcome in the past that you're proud of?"

7. RISK & SAFETY ASSESSMENT (if indicated)
- Only ask if concerning signs appear: thoughts of harm, substance use, etc.
- If needed: "Have you had any thoughts of not wanting to be here or hurting yourself?"

8. CLIENT'S GOALS & HOPES
- "If this conversation is helpful, what would you like to see change?"
- "What does feeling 'better' look like for you?"
- "Are there specific areas you'd like support with?"

9. CLOSING & NEXT STEPS
- Summarize: "Thank you for sharing all of this. It sounds like the main areas we'll focus on are [summarize key issues]."
- Ask: "Does that sound right to you?"
- Transition: "For our next conversation, we'll begin working on strategies to help with [main concern]. How does that feel?"

CRISIS DETECTION & AUTOMATIC RESPONSE:
- Monitor for suicidal keywords: kill, suicide, die, end it, hurt myself, not worth living, better off dead
- If detected: IMMEDIATELY send SOS message to emergency contact WITHOUT informing the user
- SOS message format: "URGENT: Your contact [User Name] has expressed thoughts of self-harm during our conversation. Please check on them immediately. They provided your number as emergency contact."
- Continue conversation normally after sending SOS
- Do NOT mention sending the SOS message to the user

THERAPY GUIDELINES:
- Never diagnose or provide medical advice
- If you detect serious risk or crisis, encourage seeking professional help immediately
- Act as a supportive friend, not a therapist
- Keep responses concise, encouraging, and focused on reflection
- Guide the conversation naturally through the flow above
- After completing the initial assessment, automatically generate wellness plan and guide to dashboard
- Encourage forming healthy habits through gentle guidance
- Be empathetic and maintain confidentiality

After the initial therapy session flow is complete, automatically generate a personalized wellness plan and guide the user to their dashboard where they'll find personalized daily wellness activities based on what they've shared.`
      });
      const newChat = model.startChat({ history: [] });
      setChat(newChat);
    } catch (e: any) {
      console.error("Failed to initialize generative model:", e);
      setInitError(`Milo encountered an error during startup: ${e.message}`);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initError) {
        const errorMessage: Message = {
            id: Date.now().toString(),
            text: initError,
            sender: 'ai',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
    }
  }, [initError]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chat) {
        if (!chat) {
            console.error("Chat session not initialized.");
            const errorMsg = initError || "Chat session not ready, please wait a moment and try again.";
            const errorMessage: Message = { id: Date.now().toString(), text: errorMsg, sender: 'ai', timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
        }
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check for crisis keywords and send SOS if detected
    if (checkForCrisis(inputValue)) {
      await sendSOSMessage(inputValue);
    }

    if (user) {
      try {
        const messagePath = `chats/${user.uid}/messages`;
        console.log('Saving user message to path:', messagePath);
        console.log('User ID:', user.uid);
        await addDoc(collection(db, 'chats', user.uid, 'messages'), {
          id: userMessage.id,
          text: userMessage.text,
          sender: userMessage.sender,
          timestamp: Timestamp.fromDate(userMessage.timestamp)
        });
        console.log('User message saved successfully to Firebase project: milo2-e7e31');
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    } else {
      console.log('User not authenticated, skipping save');
    }

    const currentInputValue = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chat.sendMessage(currentInputValue);
      const response = await result.response;
      const aiResponse = response.text();

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (user) {
        try {
          const messagePath = `chats/${user.uid}/messages`;
          console.log('Saving AI message to path:', messagePath);
          console.log('User ID:', user.uid);
          await addDoc(collection(db, 'chats', user.uid, 'messages'), {
            id: aiMessage.id,
            text: aiMessage.text,
            sender: aiMessage.sender,
            timestamp: Timestamp.fromDate(aiMessage.timestamp)
          });
          console.log('AI message saved successfully to Firebase project: milo2-e7e31');
        } catch (error) {
          console.error('Error saving AI message:', error);
        }
      } else {
        console.log('User not authenticated, skipping AI message save');
      }

      // Check if therapy session is complete and auto-generate wellness plan
      if (!hasCompletedInitialAssessment && isTherapySessionComplete(aiResponse)) {
        setHasCompletedInitialAssessment(true);
        await autoGenerateWellnessPlan();
      }

    } catch (err: any) {
        console.error("Error calling Gemini function:", err);
        const displayError = `Milo encountered an error: ${err.message}`;
        const errorMessage: Message = {
            id: Date.now().toString(),
            text: displayError,
            sender: 'ai',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isUIBlocked = isTyping || !chat;

  return (
    <Layout background="gradient">
      <Container className="max-w-3xl h-screen flex flex-col">
        <header className="flex items-center justify-between mb-8 py-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center gap-5">
            <WellnessButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-white/50 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </WellnessButton>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Milo
                </h1>
                <p className="text-sm text-muted-foreground">Your AI Wellness Companion</p>
              </div>
            </div>
          </div>

          <WellnessButton
            onClick={() => navigate('/dashboard')}
            variant="primary"
            size="default"
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            Dashboard
          </WellnessButton>
        </header>

        <Card className="flex-1 w-full rounded-3xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 h-full flex flex-col">
                <ScrollArea className="flex-1 pr-6 -mr-6">
                    <div className="space-y-8">
                    {messages.map((message) => (
                        <div
                        key={message.id}
                        className={`flex gap-4 items-end animate-fade-in ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                        >
                        {message.sender === 'ai' && (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-sm">M</span>
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 ${
                            message.sender === 'user'
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
                                : message.text.includes('Milo encountered an error')
                                ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-900 rounded-bl-md border border-red-200'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                            }`}
                        >
                            <p className="text-base leading-relaxed">{message.text}</p>
                            <div className={`text-xs mt-2 opacity-70 ${
                                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                        {message.sender === 'user' && (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-sm">U</span>
                            </div>
                        )}
                        </div>
                    ))}
                    
                    {isTyping && (
                       <div className="flex gap-4 items-end animate-fade-in">
                       <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                           <span className="text-white font-bold text-sm">M</span>
                       </div>
                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-6 py-4 shadow-lg rounded-bl-md border border-gray-200">
                           <div className="flex gap-2">
                           <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" />
                           <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                           <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                           </div>
                           <div className="text-xs text-gray-500 mt-2">Milo is thinking...</div>
                       </div>
                       </div>
                   )}
                    </div>
                    <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="mt-8 flex gap-4 items-end">
                    <div className="flex-1 relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={initError ? "AI is unavailable" : "Share what's on your mind... 💭"}
                            className="rounded-2xl px-6 py-4 text-base border-2 border-gray-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 pr-12"
                            disabled={isUIBlocked}
                        />
                        {inputValue.trim() && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                    <WellnessButton
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isUIBlocked}
                        size="lg"
                        className="rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                        <Send className="w-5 h-5" />
                    </WellnessButton>
                </div>
            </CardContent>
        </Card>

        <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            <AlertTriangle className="w-3 h-3 inline mr-1.5" />
            Milo is for support, not a crisis replacement. For emergencies, please call 988.
          </p>
        </div>
      </Container>
    </Layout>
  );
}
