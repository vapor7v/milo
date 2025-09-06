import React, { useState, useRef, useEffect } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mood?: 'supportive' | 'concerned' | 'encouraging';
}

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Milo, your AI companion. I'm here to listen and support you. How are you feeling today? 💙",
      sender: 'ai',
      timestamp: new Date(),
      mood: 'supportive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = "I hear you. Can you tell me more about what's on your mind?";
    let mood: 'supportive' | 'concerned' | 'encouraging' = 'supportive';

    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      response = "I'm sorry you're feeling this way. It's okay to feel sad sometimes. Would you like to try a quick breathing exercise together, or would you prefer to talk about what's making you feel down?";
      mood = 'concerned';
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      response = "Anxiety can be really overwhelming. Let's take this one step at a time. Have you tried any grounding techniques today? I can guide you through a simple 5-4-3-2-1 exercise if you'd like.";
      mood = 'supportive';
    } else if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('happy')) {
      response = "That's wonderful to hear! I'm so glad you're feeling good today. What's been helping you feel this way? It's great to celebrate these positive moments. 🌟";
      mood = 'encouraging';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = "I'm here to help in whatever way I can. If you're looking for professional support, I can help you find resources. For now, I'm here to listen and support you. What kind of help do you need?";
      mood = 'supportive';
    }

    // Crisis detection - simplified for demo
    if (lowerMessage.includes('hurt myself') || lowerMessage.includes('suicide') || lowerMessage.includes('end it all')) {
      response = "I'm very concerned about you right now. Please know that you matter and there are people who want to help. I strongly encourage you to reach out to a crisis hotline: 988 (Suicide & Crisis Lifeline). Would you like me to help you find immediate professional support?";
      mood = 'concerned';
    }

    return {
      id: Date.now().toString(),
      text: response,
      sender: 'ai',
      timestamp: new Date(),
      mood
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout background="gradient">
      <Container className="max-w-2xl h-screen flex flex-col">
        <header className="flex items-center gap-4 mb-6 py-4">
          <WellnessButton 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </WellnessButton>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-white">
              M
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-primary">Milo</h1>
            <p className="text-sm text-muted-foreground">Your AI Companion</p>
          </div>
        </header>

        <Card className="flex-1 w-full rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 h-full flex flex-col">
                <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="space-y-6">
                    {messages.map((message) => (
                        <div
                        key={message.id}
                        className={`flex gap-3 items-end ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                        >
                        {message.sender === 'ai' && (
                            <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-white text-sm">
                                M
                            </AvatarFallback>
                            </Avatar>
                        )}
                        
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : message.mood === 'concerned'
                                ? 'bg-red-100 text-red-900 rounded-bl-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                        >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                        
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-3 items-end">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-white text-sm">
                            M
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm rounded-bl-none">
                            <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                        </div>
                    )}
                    </div>
                    <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="mt-6 flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full px-4 py-2"
                        disabled={isTyping}
                    />
                    <WellnessButton
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        size="icon"
                        className="rounded-full"
                    >
                        <Send className="w-4 h-4" />
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
