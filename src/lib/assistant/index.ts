// VeeShield AI Voice Assistant - "Hey Vee"
// Implements voice recognition, wake word detection, and AI-powered responses

export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: string;
  confidence: number;
  action: () => Promise<AssistantResponse>;
  timestamp: Date;
}

export interface AssistantResponse {
  text: string;
  action?: string;
  data?: Record<string, unknown>;
  followUp?: string;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  wakeWordDetected: boolean;
  transcript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
}

// Wake word detection patterns
const WAKE_WORD_PATTERNS = [
  'hey vee',
  'hey v',
  'hello vee',
  'vee',
  'veeshield'
];

// Intent recognition patterns
const INTENT_PATTERNS: Record<string, { patterns: RegExp[]; action: string }> = {
  scan: {
    patterns: [
      /scan\s+(my\s+)?(computer|pc|system|device)/i,
      /run\s+(a\s+)?scan/i,
      /start\s+(a\s+)?scan/i,
      /check\s+(for\s+)?(viruses|malware|threats)/i,
      /scan\s+(for\s+)?threats/i
    ],
    action: 'start_scan'
  },
  quickScan: {
    patterns: [
      /quick\s*scan/i,
      /fast\s+scan/i,
      /quick\s+check/i
    ],
    action: 'quick_scan'
  },
  fullScan: {
    patterns: [
      /full\s*scan/i,
      /deep\s+scan/i,
      /complete\s+scan/i,
      /thorough\s+scan/i
    ],
    action: 'full_scan'
  },
  clean: {
    patterns: [
      /clean\s+(my\s+)?(computer|pc|system)/i,
      /clean\s+(up\s+)?(my\s+)?(files|disk)/i,
      /free\s+up\s+space/i,
      /remove\s+(junk|temporary|temp)\s+files/i,
      /disk\s+cleanup/i
    ],
    action: 'start_clean'
  },
  status: {
    patterns: [
      /what('s|\s+is)\s+(the\s+)?(status|state)/i,
      /system\s+status/i,
      /protection\s+status/i,
      /how\s+(is\s+)?(my\s+)?(system|computer|pc)\s+doing/i,
      /am\s+i\s+(protected|safe)/i
    ],
    action: 'get_status'
  },
  threats: {
    patterns: [
      /any\s+(threats|viruses|malware)/i,
      /show\s+(me\s+)?(threats|detections)/i,
      /recent\s+(threats|detections)/i,
      /what\s+(threats|viruses)\s+(were\s+)?found/i
    ],
    action: 'show_threats'
  },
  history: {
    patterns: [
      /scan\s+history/i,
      /cleaning\s+history/i,
      /show\s+history/i,
      /recent\s+activity/i,
      /what\s+happened/i
    ],
    action: 'show_history'
  },
  quarantine: {
    patterns: [
      /quarantine/i,
      /isolated\s+files/i,
      /blocked\s+files/i,
      /threat\s+vault/i
    ],
    action: 'show_quarantine'
  },
  settings: {
    patterns: [
      /open\s+settings/i,
      /settings/i,
      /preferences/i,
      /configuration/i,
      /change\s+(my\s+)?settings/i
    ],
    action: 'open_settings'
  },
  schedule: {
    patterns: [
      /schedule\s+(a\s+)?scan/i,
      /automatic\s+scan/i,
      /set\s+up\s+(automatic|scheduled)\s+scan/i
    ],
    action: 'schedule_scan'
  },
  update: {
    patterns: [
      /update\s+(definitions|signatures|database)/i,
      /check\s+for\s+updates/i,
      /latest\s+(definitions|signatures)/i
    ],
    action: 'check_updates'
  },
  help: {
    patterns: [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /commands/i,
      /how\s+to\s+use/i
    ],
    action: 'show_help'
  },
  stop: {
    patterns: [
      /stop/i,
      /cancel/i,
      /abort/i,
      /never\s*mind/i,
      /forget\s+it/i
    ],
    action: 'stop_action'
  },
  greet: {
    patterns: [
      /hello/i,
      /hi\s+vee/i,
      /good\s+(morning|afternoon|evening)/i,
      /hey\s+there/i
    ],
    action: 'greet'
  },
  thanks: {
    patterns: [
      /thank(s| you)/i,
      /thanks\s+vee/i,
      /appreciate\s+it/i
    ],
    action: 'thanks'
  }
};

// Response templates
const RESPONSE_TEMPLATES: Record<string, string[]> = {
  greet: [
    "Hello! I'm Vee, your AI security assistant. How can I help protect your system today?",
    "Hi there! Vee at your service. What would you like me to do?",
    "Hey! Ready to keep your system safe. What can I help you with?"
  ],
  start_scan: [
    "Starting a quick scan of your system. I'll let you know when it's complete.",
    "Initiating system scan. This should only take a few moments.",
    "Running a security scan now. I'll report any findings shortly."
  ],
  quick_scan: [
    "Starting a quick scan of critical areas. This will take just a minute.",
    "Quick scan initiated. I'm checking the most common threat locations."
  ],
  full_scan: [
    "Starting a full system scan. This may take several minutes to complete.",
    "Initiating comprehensive system scan. I'll thoroughly check all files and folders.",
    "Full scan started. I'm examining your entire system for any threats."
  ],
  start_clean: [
    "I'll clean up unnecessary files to free up space. This won't affect your personal data.",
    "Starting system cleanup. I'll remove temporary files and optimize your disk space.",
    "Initiating disk cleanup. I'll safely remove junk files and free up storage."
  ],
  get_status_safe: [
    "Your system is fully protected. All security features are active and up to date.",
    "Everything looks good! Your system has active protection and no threats detected.",
    "Status: Protected. Real-time scanning is on, and your definitions are current."
  ],
  get_status_warning: [
    "I noticed some recommendations. Your system is protected, but there are a few items to review.",
    "Your system is mostly secure, but I have some suggestions to improve protection.",
    "Good news - you're protected! Though there are a few optimizations available."
  ],
  show_threats_none: [
    "Great news! No threats have been detected on your system.",
    "All clear! Your recent scans found no malicious software.",
    "Your system is clean - no threats were found in recent scans."
  ],
  show_threats_found: [
    "I found {count} threat(s) in recent scans. Would you like me to show you the details?",
    "There {verb} {count} detection(s) from your last scan. I can help you review and resolve them."
  ],
  show_history: [
    "Here's your recent activity. I can show you scan results, cleaning history, and more.",
    "Opening your activity history. You'll see all recent security events and actions."
  ],
  show_quarantine: [
    "Here's your quarantine vault. These are isolated files that were flagged as suspicious.",
    "Opening the threat vault. These files have been safely isolated from your system."
  ],
  open_settings: [
    "Opening settings. You can customize protection levels, schedules, and more.",
    "Taking you to settings. Feel free to adjust any security preferences."
  ],
  schedule_scan: [
    "I can help you set up automatic scans. Would you prefer daily, weekly, or custom scheduling?",
    "Let's set up a scan schedule. What frequency works best for you?"
  ],
  check_updates: [
    "Checking for security definition updates... I'll install any available updates.",
    "Looking for the latest threat definitions. Keeping your protection current."
  ],
  show_help: [
    "I can help you with: scanning for threats, cleaning up disk space, checking system status, managing quarantined files, scheduling scans, and updating definitions. Just ask!",
    "Here's what I can do: Run scans (quick or full), clean system files, check protection status, show threats, and manage settings. What would you like to do?"
  ],
  stop_action: [
    "No problem. Let me know if you need anything else.",
    "Cancelled. I'm here whenever you need me.",
    "Sure thing. Just say 'Hey Vee' when you're ready."
  ],
  thanks: [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Stay safe out there.",
    "Anytime! Your security is my priority."
  ],
  unknown: [
    "I'm not sure I understood that. Could you try rephrasing?",
    "I didn't quite catch that. Try saying 'help' to see what I can do.",
    "Hmm, I'm not sure about that one. Would you like me to show you available commands?"
  ],
  wake_detected: [
    "Yes? How can I help?",
    "I'm listening. What would you like me to do?",
    "Ready to assist. What do you need?"
  ]
};

// Get random response from template
function getRandomResponse(template: string | string[]): string {
  const responses = Array.isArray(template) ? template : [template];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Detect wake word in transcript
export function detectWakeWord(transcript: string): boolean {
  const lower = transcript.toLowerCase().trim();
  return WAKE_WORD_PATTERNS.some(pattern => 
    lower === pattern || lower.startsWith(pattern + ' ')
  );
}

// Extract command after wake word
export function extractCommand(transcript: string): string {
  const lower = transcript.toLowerCase().trim();
  
  for (const pattern of WAKE_WORD_PATTERNS) {
    if (lower.startsWith(pattern)) {
      return lower.slice(pattern.length).trim();
    }
  }
  
  return transcript;
}

// Recognize intent from transcript
export function recognizeIntent(transcript: string): { intent: string; confidence: number } {
  const command = extractCommand(transcript).toLowerCase();
  
  if (!command) {
    return { intent: 'wake_only', confidence: 1.0 };
  }
  
  for (const [intentName, config] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(command)) {
        // Calculate confidence based on match quality
        const matchLength = command.match(pattern)?.[0]?.length || 0;
        const confidence = Math.min(0.95, 0.7 + (matchLength / command.length) * 0.25);
        return { intent: config.action, confidence };
      }
    }
  }
  
  return { intent: 'unknown', confidence: 0.5 };
}

// Generate response for intent
export function generateResponse(intent: string, context?: Record<string, unknown>): AssistantResponse {
  switch (intent) {
    case 'wake_only':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.wake_detected),
        action: 'none'
      };
    
    case 'greet':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.greet),
        action: 'none'
      };
    
    case 'start_scan':
    case 'quick_scan':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.quick_scan),
        action: 'quick_scan',
        data: { scanType: 'quick' }
      };
    
    case 'full_scan':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.full_scan),
        action: 'full_scan',
        data: { scanType: 'full' }
      };
    
    case 'start_clean':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.start_clean),
        action: 'start_clean',
        data: { cleanType: 'standard' }
      };
    
    case 'get_status':
      const isSafe = Math.random() > 0.3;
      return {
        text: getRandomResponse(
          isSafe ? RESPONSE_TEMPLATES.get_status_safe : RESPONSE_TEMPLATES.get_status_warning
        ),
        action: 'show_status',
        data: { status: isSafe ? 'protected' : 'attention_needed' }
      };
    
    case 'show_threats':
      const threatCount = Math.floor(Math.random() * 5);
      const hasThreats = threatCount > 0;
      return {
        text: hasThreats
          ? getRandomResponse(RESPONSE_TEMPLATES.show_threats_found)
              .replace('{count}', String(threatCount))
              .replace('{verb}', threatCount === 1 ? 'is' : 'are')
          : getRandomResponse(RESPONSE_TEMPLATES.show_threats_none),
        action: 'show_threats',
        data: { threatCount, hasThreats }
      };
    
    case 'show_history':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.show_history),
        action: 'show_history'
      };
    
    case 'show_quarantine':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.show_quarantine),
        action: 'show_quarantine'
      };
    
    case 'open_settings':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.open_settings),
        action: 'open_settings'
      };
    
    case 'schedule_scan':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.schedule_scan),
        action: 'schedule_scan',
        followUp: 'Which schedule would you prefer?'
      };
    
    case 'check_updates':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.check_updates),
        action: 'check_updates'
      };
    
    case 'show_help':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.show_help),
        action: 'show_help'
      };
    
    case 'stop_action':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.stop_action),
        action: 'cancel'
      };
    
    case 'thanks':
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.thanks),
        action: 'none'
      };
    
    default:
      return {
        text: getRandomResponse(RESPONSE_TEMPLATES.unknown),
        action: 'none'
      };
  }
}

// Process voice command
export async function processVoiceCommand(
  transcript: string
): Promise<{ command: VoiceCommand; response: AssistantResponse }> {
  const { intent, confidence } = recognizeIntent(transcript);
  const response = generateResponse(intent);
  
  const command: VoiceCommand = {
    id: `cmd-${Date.now()}`,
    transcript,
    intent,
    confidence,
    action: async () => response,
    timestamp: new Date()
  };
  
  return { command, response };
}

// Simulate voice recognition (for demo purposes)
export function simulateVoiceRecognition(text: string): string {
  // Add some natural variation to simulate ASR imperfections
  return text.toLowerCase().trim();
}

// Export available commands for help
export function getAvailableCommands(): Array<{ category: string; commands: string[] }> {
  return [
    {
      category: 'Scanning',
      commands: [
        'Scan my computer',
        'Run a quick scan',
        'Start a full scan',
        'Check for viruses'
      ]
    },
    {
      category: 'Cleaning',
      commands: [
        'Clean my computer',
        'Free up space',
        'Remove temporary files',
        'Disk cleanup'
      ]
    },
    {
      category: 'Status',
      commands: [
        'What is the status',
        'Am I protected',
        'Any threats',
        'Show history'
      ]
    },
    {
      category: 'Management',
      commands: [
        'Open settings',
        'Schedule a scan',
        'Check for updates',
        'Show quarantine'
      ]
    }
  ];
}

const assistantModule = {
  detectWakeWord,
  extractCommand,
  recognizeIntent,
  generateResponse,
  processVoiceCommand,
  getAvailableCommands
};

export default assistantModule;
