'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, X, Loader2, 
  Shield, Bug, Trash2, Settings, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onCommand: (action: string, data?: Record<string, unknown>) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  action?: string;
}

export function VoiceAssistant({ onCommand, onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      text: "Hi! I'm Vee, your AI security assistant. Say 'Hey Vee' or click the microphone to start.",
      timestamp: new Date()
    }
  ]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          setTranscript(interimTranscript || finalTranscript);

          if (finalTranscript) {
            processVoiceInput(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please enable microphone permissions.');
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            // Restart if still supposed to be listening
            try {
              recognitionRef.current?.start();
            } catch {
              setIsListening(false);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isListening]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processVoiceInput = useCallback(async (text: string) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { processVoice } = await import('@/lib/services/assistant-service');
      const data = await processVoice(text);

      if (data.success) {
        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: data.response.text,
          timestamp: new Date(),
          action: data.response.action
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Execute action if not 'none'
        if (data.response.action && data.response.action !== 'none') {
          setTimeout(() => {
            onCommand(data.response.action, data.response.data);
          }, 1000);
        }

        // Text-to-speech for response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.response.text);
          utterance.rate = 1;
          utterance.pitch = 1;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [onCommand]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        toast.error('Failed to start speech recognition');
      }
    }
  }, [isListening]);

  const quickCommands = [
    { icon: Bug, label: 'Scan System', command: 'Hey Vee, scan my computer' },
    { icon: Trash2, label: 'Clean Files', command: 'Hey Vee, clean my computer' },
    { icon: Shield, label: 'Check Status', command: 'Hey Vee, what is the status' },
    { icon: HelpCircle, label: 'Get Help', command: 'Hey Vee, help' },
  ];

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[500px] bg-slate-900/95 border-slate-700/50 backdrop-blur-sm shadow-2xl z-50">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Volume2 className={`h-6 w-6 ${isListening ? 'text-emerald-400' : 'text-slate-400'}`} />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">Vee Assistant</h3>
              <p className="text-xs text-slate-400">
                {isListening ? 'Listening...' : 'Say "Hey Vee" to start'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-64 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.action && message.action !== 'none' && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Action: {message.action}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-700/50 text-slate-300 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Transcript */}
        {transcript && (
          <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 italic">"{transcript}"</p>
          </div>
        )}

        {/* Quick Commands */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => processVoiceInput(cmd.command)}
                className="flex-shrink-0 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
              >
                <cmd.icon className="h-3 w-3 mr-1" />
                {cmd.label}
              </Button>
            ))}
          </div>

          {/* Mic Button */}
          <Button
            onClick={toggleListening}
            className={`w-full ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            } text-white`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoiceAssistant;
