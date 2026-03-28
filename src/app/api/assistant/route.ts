import { NextRequest, NextResponse } from 'next/server';
import {
  detectWakeWord,
  recognizeIntent,
  generateResponse,
  processVoiceCommand,
  getAvailableCommands,
  type AssistantResponse
} from '@/lib/assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, context } = body;

    switch (action) {
      case 'process_voice': {
        if (!transcript) {
          return NextResponse.json(
            { error: 'Missing transcript' },
            { status: 400 }
          );
        }

        const { command, response } = await processVoiceCommand(transcript);
        
        return NextResponse.json({
          success: true,
          command: {
            id: command.id,
            transcript: command.transcript,
            intent: command.intent,
            confidence: command.confidence,
            timestamp: command.timestamp
          },
          response,
          wakeWordDetected: detectWakeWord(transcript)
        });
      }

      case 'detect_wake_word': {
        if (!transcript) {
          return NextResponse.json(
            { error: 'Missing transcript' },
            { status: 400 }
          );
        }

        const detected = detectWakeWord(transcript);
        
        return NextResponse.json({
          success: true,
          detected,
          transcript
        });
      }

      case 'recognize_intent': {
        if (!transcript) {
          return NextResponse.json(
            { error: 'Missing transcript' },
            { status: 400 }
          );
        }

        const { intent, confidence } = recognizeIntent(transcript);
        const response = generateResponse(intent, context);
        
        return NextResponse.json({
          success: true,
          intent,
          confidence,
          response
        });
      }

      case 'generate_response': {
        const { intent } = body;
        
        if (!intent) {
          return NextResponse.json(
            { error: 'Missing intent' },
            { status: 400 }
          );
        }

        const response = generateResponse(intent, context);
        
        return NextResponse.json({
          success: true,
          response
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const commands = getAvailableCommands();
    
    return NextResponse.json({
      success: true,
      wakeWords: ['hey vee', 'hey v', 'hello vee', 'vee', 'veeshield'],
      availableCommands: commands,
      capabilities: {
        voiceRecognition: true,
        wakeWordDetection: true,
        intentRecognition: true,
        supportedIntents: [
          'scan', 'quick_scan', 'full_scan',
          'clean', 'get_status', 'show_threats',
          'show_history', 'show_quarantine',
          'open_settings', 'schedule_scan',
          'check_updates', 'show_help',
          'stop', 'greet', 'thanks'
        ]
      }
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
