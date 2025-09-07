import React, { useState, useRef, useEffect } from 'react';
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { getGenerativeAIService } from '@/integrations/firebase/client';
import { getGenerativeModel, ChatSession } from 'firebase/ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the model and chat session safely after the component has mounted.
    try {
      const generativeAI = getGenerativeAIService();
      const model = getGenerativeModel(generativeAI, {
        model: 'gemini-1.5-flash-preview-0514',
        systemInstruction: {
          parts: [{ text: "You are Milo, a friendly and supportive wellness companion. Your goal is to help users reflect, feel understood, and offer gentle guidance. Do not provide medical advice. Keep your responses concise and encouraging." }]
        },
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
            <AvatarFallback className="bg-primary text-white">M</AvatarFallback>
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
                            <AvatarFallback className="bg-primary text-white text-sm">M</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : message.text.includes('Milo encountered an error')
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
                            <AvatarFallback className="bg-primary text-white text-sm">M</AvatarFallback>
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
                        placeholder={initError ? "AI is unavailable" : "Type a message..."}
                        className="flex-1 rounded-full px-4 py-2"
                        disabled={isUIBlocked}
                    />
                    <WellnessButton
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isUIBlocked}
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
