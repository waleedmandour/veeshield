// VeeShield Assistant Service - Client-side service layer for voice assistant operations
// Replaces API route calls with direct lib function calls for static export (Electron) compatibility

import {
  detectWakeWord,
  recognizeIntent,
  generateResponse,
  processVoiceCommand,
  getAvailableCommands,
  type AssistantResponse,
} from '@/lib/assistant';

/**
 * Process a voice command transcript
 * Returns the same shape as the /api/assistant POST with action 'process_voice'
 */
export async function processVoice(transcript: string) {
  const { command, response } = await processVoiceCommand(transcript);

  return {
    success: true as const,
    command: {
      id: command.id,
      transcript: command.transcript,
      intent: command.intent,
      confidence: command.confidence,
      timestamp: command.timestamp,
    },
    response,
    wakeWordDetected: detectWakeWord(transcript),
  };
}

/**
 * Detect wake word in transcript
 * Returns the same shape as the /api/assistant POST with action 'detect_wake_word'
 */
export function detectWakeWordService(transcript: string) {
  return {
    success: true as const,
    detected: detectWakeWord(transcript),
    transcript,
  };
}

/**
 * Recognize intent and generate response
 * Returns the same shape as the /api/assistant POST with action 'recognize_intent'
 */
export function recognizeIntentService(
  transcript: string,
  context?: Record<string, unknown>
) {
  const { intent, confidence } = recognizeIntent(transcript);
  const response = generateResponse(intent, context);

  return {
    success: true as const,
    intent,
    confidence,
    response,
  };
}

/**
 * Get available commands for the assistant
 * Returns the same shape as the /api/assistant GET
 */
export function getAvailableCommandsService() {
  const commands = getAvailableCommands();

  return {
    success: true as const,
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
        'stop', 'greet', 'thanks',
      ],
    },
  };
}

export type { AssistantResponse };
