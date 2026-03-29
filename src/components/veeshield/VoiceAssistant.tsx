'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, X, Loader2,
  Shield, Bug, Trash2, Settings, HelpCircle, Globe
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
      text: "Hello! I'm Vee, your AI security assistant. Say 'Hey Vee' or tap the microphone to begin. I can scan for threats, clean your system, manage VPN connections, and more.",
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
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

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please enable microphone permissions.');
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processVoiceInput = useCallback(async (text: string) => {
    setIsProcessing(true);

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
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: data.response.text,
          timestamp: new Date(),
          action: data.response.action
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (data.response.action && data.response.action !== 'none') {
          setTimeout(() => {
            onCommand(data.response.action, data.response.data);
          }, 1000);
        }

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
    { icon: Globe, label: 'Connect VPN', command: 'Hey Vee, connect VPN' },
    { icon: Trash2, label: 'Clean Files', command: 'Hey Vee, clean my computer' },
    { icon: Shield, label: 'Status', command: 'Hey Vee, what is the status' },
    { icon: Settings, label: 'Settings', command: 'Hey Vee, open settings' },
    { icon: HelpCircle, label: 'Help', command: 'Hey Vee, help' },
  ];

  return (
    <Card className="fixed bottom-4 right-4 w-[380px] max-h-[520px] bg-[hsl(var(--bg-elevated))/0.97] border-[hsl(var(--border-card)/0.5)] backdrop-blur-xl shadow-[var(--shadow-flyout)] z-50 rounded-[var(--radius-lg)] overflow-hidden">
      <CardContent className="p-0">
        {/* Header — Win11 style */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[hsl(var(--bg-mica))/0.5]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isListening ? 'bg-red-500/20' : 'bg-hsl(var(--accent)/0.15)'
              }`}>
                <Volume2 className={`w-4 h-4 ${isListening ? 'text-red-400' : 'text-hsl(var(--accent))'}`} />
              </div>
              {isListening && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[hsl(var(--bg-solid))]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Vee Assistant</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                {isListening ? 'Listening...' : 'Say "Hey Vee" to start'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:bg-white/[0.06] hover:text-[hsl(var(--text-primary))] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-60 px-4 py-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fluent-in`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 ${
                    message.type === 'user'
                      ? 'bg-hsl(var(--accent)/0.15) text-hsl(var(--accent)) rounded-xl rounded-br-sm'
                      : 'bg-[hsl(var(--bg-subtle)/0.5)] text-[hsl(var(--text-secondary))] rounded-xl rounded-bl-sm'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed">{message.text}</p>
                  {message.action && message.action !== 'none' && (
                    <div className="mt-1.5">
                      <Badge className="bg-white/[0.06] text-[hsl(var(--text-tertiary))] text-[10px] px-1.5 py-0 border-none">
                        {message.action}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start animate-fluent-in">
                <div className="bg-[hsl(var(--bg-subtle)/0.5)] px-4 py-3 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-hsl(var(--accent)) animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-hsl(var(--accent)) animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-hsl(var(--accent)) animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Transcript */}
        {transcript && (
          <div className="px-5 py-2.5 bg-[hsl(var(--bg-mica))/0.5] border-t border-[hsl(var(--border-subtle)/0.4)]">
            <p className="text-xs text-[hsl(var(--text-tertiary))] italic">"{transcript}"</p>
          </div>
        )}

        {/* Quick Commands */}
        <div className="p-3 border-t border-[hsl(var(--border-subtle)/0.3)] bg-[hsl(var(--bg-mica))/0.3]">
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => processVoiceInput(cmd.command)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-subtle)/0.3)] border border-[hsl(var(--border-subtle)/0.3)] text-[11px] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-subtle)/0.6)] hover:text-[hsl(var(--text-primary))] transition-colors whitespace-nowrap flex-shrink-0"
              >
                <cmd.icon className="w-3 h-3" />
                {cmd.label}
              </button>
            ))}
          </div>

          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              isListening
                ? 'bg-red-500/90 hover:bg-red-500 text-white'
                : 'bg-hsl(var(--accent)) hover:bg-hsl(var(--accent-hover)) text-white'
            }`}
          >
            {isListening ? (
              <span className="flex items-center justify-center gap-2">
                <MicOff className="w-4 h-4" />
                Stop Listening
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Mic className="w-4 h-4" />
                Start Listening
              </span>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoiceAssistant;
