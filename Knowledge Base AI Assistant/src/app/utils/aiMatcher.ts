import { responsesData, ResponseItem, EmotionType } from '../data/responses';

// ─────────────────────────────────────────────
// SWAHILI / KENYAN SLANG TRANSLATION MAP
// Maps Swahili & slang terms to English equivalents for matching
// ─────────────────────────────────────────────
const SWAHILI_MAP: Record<string, string[]> = {
  'pesa': ['money', 'funds', 'amount', 'balance'],
  'pesa yangu': ['my money', 'my funds'],
  'fedha': ['money', 'funds'],
  'hela': ['money', 'cash'],
  'nirudishie': ['return', 'refund', 'give back', 'rollback'],
  'nirudisha': ['return', 'refund'],
  'wapi pesa': ['where is my money', 'where is withdrawal'],
  'pesa iko wapi': ['where is my money'],
  'sijapata': ['not received', 'not credited', 'missing'],
  'bado sijapata': ['still not received', 'pending'],
  'imekwama': ['stuck', 'pending', 'not processed', 'delayed'],
  'imeshikwa': ['stuck', 'held', 'restricted'],
  'nimepoteza': ['lost', 'missing'],
  'nimepoteza kila kitu': ['lost everything', 'distress'],
  'yalipotea': ['disappeared', 'missing', 'lost'],
  'mchezo': ['game', 'casino', 'crash', 'aviator'],
  'kucheza': ['play', 'bet', 'gaming', 'game'],
  'akaunti': ['account'],
  'akaunti yangu': ['my account'],
  'akanti': ['account'],
  'naweka': ['deposit', 'deposited', 'sent'],
  'niliweka': ['deposited', 'sent mpesa'],
  'natoa': ['withdraw', 'withdrawal'],
  'kutoa': ['withdraw', 'withdrawal'],
  'nimekwama': ['stuck', 'pending', 'not processed'],
  'bonus yangu': ['my bonus', 'referral bonus'],
  'bonasi': ['bonus', 'cashback', 'promotion'],
  'wameniiba': ['stealing', 'fraud', 'scam', 'thieves'],
  'mnaniiba': ['stealing', 'fraud', 'scam', 'thieves'],
  'waizi': ['thieves', 'fraud', 'steal'],
  'mbwa': ['insult', 'angry', 'aggression'],
  'ujinga': ['stupid', 'insult', 'angry'],
  'mnanicheza': ['tricking', 'fraud', 'scam'],
  'mbona': ['why', 'reason', 'explain'],
  'kwa nini': ['why', 'reason', 'explain'],
  'haraka': ['urgent', 'immediately', 'quickly'],
  'sasa': ['now', 'immediately', 'urgent'],
  'mara moja': ['immediately', 'right now', 'urgent'],
  'tafadhali': ['please', 'kindly'],
  'tafadhali nisaidie': ['please help', 'help me'],
  'nisaidie': ['help me', 'please help'],
  'naomba msaada': ['please help', 'need help', 'help me'],
  'saidia': ['help', 'assist'],
  'nimesahau': ['forgot', 'lost access'],
  'password yangu': ['my password', 'login', 'forgot password'],
  'bado': ['still', 'yet', 'pending'],
  'imefutwa': ['cancelled', 'voided', 'deleted'],
  'mechi imeahirishwa': ['match postponed', 'postponed game'],
  'nimeshinda': ['i won', 'winning', 'won bet'],
  'habari': ['hello', 'hi', 'greeting'],
  'hujambo': ['hello', 'hi', 'greeting'],
  'jambo': ['hello', 'hi', 'greeting'],
  'sema': ['hello', 'speak', 'tell me'],
  'tatizo': ['problem', 'issue', 'error'],
  'kuna tatizo': ['there is a problem', 'issue'],
  'pesa haikuja': ['money not received', 'payment not received'],
  'pesa haikuja mpesa': ['withdrawal not received', 'mpesa failed'],
  'ilitumwa': ['was sent', 'deposited', 'transferred'],
  'imetumwa': ['was sent', 'deposited', 'transferred'],
  'inachukua muda': ['taking too long', 'delayed', 'pending'],
  'safaricom tatizo': ['safaricom issue', 'network problem'],
  'mtandao mbaya': ['network issue', 'connection problem', 'safaricom delay'],
  'asante': ['thank you', 'thanks', 'closing'],
  'ingia': ['login', 'sign in'],
  'washa': ['activate', 'reactivate', 'enable'],
  'leo': ['today', 'cashback today'],
  'cashback leo': ['cashback today', 'will i get cashback'],
  'futa akaunti': ['delete account', 'close account'],
  'kiasi': ['amount'],
  'nimepoteza mchezo': ['lost game', 'casino lost'],
  'round': ['round', 'game round'],
  'mara ya kwanza': ['first time', 'first withdrawal'],
  'hasara': ['loss', 'lost money', 'chasing losses'],
  'nirudishie hasara': ['recover losses', 'chasing losses'],
  'pesa zote': ['all money', 'all funds', 'lost everything'],
  'pesa kidogo': ['low balance', 'below minimum'],
};

// ─────────────────────────────────────────────
// EMOTION DETECTION
// ─────────────────────────────────────────────
const ANGRY_WORDS = [
  'stupid', 'useless', 'terrible', 'fraud', 'scam', 'thieves', 'steal', 'stealing',
  'incompetent', 'worst', 'pathetic', 'ridiculous', 'unbelievable', 'rubbish', 'nonsense',
  'idiot', 'fool', 'cheating', 'cheat', 'liar', 'liars', 'robbers',
  'mbwa', 'ujinga', 'mnaniiba', 'waizi', 'wameniiba', 'mnanicheza',
];

const URGENT_WORDS = [
  'urgent', 'immediately', 'asap', 'right now', 'right away', 'where is my',
  "where's my", 'quickly', 'fast', 'emergency', 'hurry',
  'haraka', 'sasa', 'mara moja', 'wapi pesa', 'where is my money',
];

const DISTRESS_WORDS = [
  'lost everything', 'all my money', 'desperate', 'stressed', "can't stop",
  'addicted', 'problem', 'please help me', 'i need help urgently',
  'nimepoteza kila kitu', 'nimekwama', 'pesa zote', 'tafadhali nisaidie',
  'depressed', 'suicide', 'cant afford', "can't afford",
];

const IMPATIENT_WORDS = [
  'still', 'yet', 'already', 'how long', 'when will', 'waiting',
  'always', 'every time', 'again', 'bado', 'mpaka lini',
  'inachukua muda',
];

export interface DetectedEmotion {
  type: EmotionType;
  level: 'low' | 'medium' | 'high';
  label: string;
  emoji: string;
  color: string;
}

export interface MatchResult {
  item: ResponseItem;
  score: number;
  matchedKeywords: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  inputText: string;
  normalizedText: string;
  detectedLanguage: 'en' | 'sw' | 'mixed';
  emotion: DetectedEmotion;
  detectedTopics: string[];
  suggestedTone: 'standard' | 'highEmpathy';
  matches: MatchResult[];
  aiSuggestion?: string;
  aiReasoning?: string;
}

function detectLanguage(text: string): 'en' | 'sw' | 'mixed' {
  const lower = text.toLowerCase();
  const swahiliWords = Object.keys(SWAHILI_MAP);
  let swahiliCount = 0;
  for (const word of swahiliWords) {
    if (lower.includes(word)) swahiliCount++;
  }
  if (swahiliCount === 0) return 'en';
  // Count English words
  const engWords = lower.split(/\s+/).filter(w => w.length > 3);
  const ratio = swahiliCount / Math.max(engWords.length, 1);
  if (ratio > 0.3) return 'sw';
  return 'mixed';
}

function translateSwahili(text: string): string {
  let result = text.toLowerCase();
  // Sort by length desc so longer phrases match first
  const entries = Object.entries(SWAHILI_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [sw, enArr] of entries) {
    if (result.includes(sw)) {
      result = result.replace(new RegExp(sw, 'gi'), enArr.join(' '));
    }
  }
  return result;
}

function detectEmotion(original: string, translated: string): DetectedEmotion {
  const lower = original.toLowerCase();
  const combined = lower + ' ' + translated;

  // Caps ratio
  const letters = original.replace(/[^a-zA-Z]/g, '');
  const capsRatio = letters.length > 0 ? (original.replace(/[^A-Z]/g, '').length / letters.length) : 0;

  // Count signals
  const exclamations = (original.match(/!/g) || []).length;
  const questionMarks = (original.match(/\?/g) || []).length;

  const angryScore = ANGRY_WORDS.filter(w => combined.includes(w)).length * 3
    + (capsRatio > 0.5 ? 4 : capsRatio > 0.3 ? 2 : 0)
    + (exclamations > 3 ? 2 : 0);

  const urgentScore = URGENT_WORDS.filter(w => combined.includes(w)).length * 3
    + (exclamations > 1 ? 1 : 0)
    + (questionMarks > 2 ? 1 : 0);

  const distressScore = DISTRESS_WORDS.filter(w => combined.includes(w)).length * 4;

  const impatientScore = IMPATIENT_WORDS.filter(w => combined.includes(w)).length * 2
    + (questionMarks > 1 ? 1 : 0);

  const scores: [EmotionType, number][] = [
    ['angry', angryScore],
    ['urgent', urgentScore],
    ['distress', distressScore],
    ['impatient', impatientScore],
    ['neutral', 1],
  ];

  const [topEmotion, topScore] = scores.reduce((a, b) => (b[1] > a[1] ? b : a));

  const level: 'low' | 'medium' | 'high' =
    topScore >= 6 ? 'high' : topScore >= 3 ? 'medium' : 'low';

  const emotionMeta: Record<EmotionType, { label: string; emoji: string; color: string }> = {
    angry: { label: 'Angry / Aggressive', emoji: '😤', color: '#ef4444' },
    urgent: { label: 'Urgent / Stressed', emoji: '⚡', color: '#f97316' },
    distress: { label: 'Distressed', emoji: '😢', color: '#8b5cf6' },
    impatient: { label: 'Impatient', emoji: '⏰', color: '#eab308' },
    neutral: { label: 'Neutral', emoji: '😐', color: '#6b7280' },
    rg_risk: { label: 'RG Risk', emoji: '⚠️', color: '#8b5cf6' },
  };

  return { type: topEmotion, level, ...emotionMeta[topEmotion] };
}

function scoreItem(item: ResponseItem, tokens: string[], emotion: DetectedEmotion): MatchResult {
  let score = 0;
  const matchedKeywords: string[] = [];

  for (const token of tokens) {
    if (token.length < 2) continue;
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === token) {
        score += 10;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      } else if (kwLower.includes(token) || token.includes(kwLower)) {
        score += token.length >= 4 ? 5 : 2;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }
    // Check title
    if (item.title.toLowerCase().includes(token)) {
      score += 4;
    }
    // Check category
    if (item.category.toLowerCase().includes(token)) {
      score += 2;
    }
  }

  // Emotion bonus
  if (item.emotions.includes(emotion.type)) {
    score += emotion.level === 'high' ? 5 : emotion.level === 'medium' ? 3 : 1;
  }

  const confidence: MatchResult['confidence'] =
    score >= 15 ? 'high' : score >= 7 ? 'medium' : 'low';

  return { item, score, matchedKeywords, confidence };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

function generateAISuggestion(emotion: DetectedEmotion, topics: string[], language: 'en' | 'sw' | 'mixed'): string {
  const greetingSw = language === 'sw' || language === 'mixed' ? 'Karibu 🙂 ' : '';

  if (emotion.type === 'distress') {
    return `${greetingSw}We sincerely understand how difficult this situation feels 🙏 Please know that we are here to help you through this. Could you kindly share the details of your issue including your phone number and what happened, so we can look into it right away and provide the support you need?`;
  }
  if (emotion.type === 'angry') {
    return `${greetingSw}We hear you and we understand your frustration 🙏 We want to resolve this as quickly as possible. Kindly share the specific details of your issue — including your phone number and any relevant information — so our team can address this immediately.`;
  }
  if (emotion.type === 'urgent') {
    return `${greetingSw}We understand this is urgent and we're on it 🔄 Please share your phone number, the amount involved, and the exact time of the transaction so we can prioritize your case right away.`;
  }
  if (emotion.type === 'impatient') {
    return `${greetingSw}We appreciate your patience and we want to resolve this without further delay. Could you please share your phone number and the details of your issue so we can check the status immediately?`;
  }
  return `${greetingSw}Thank you for reaching out. To assist you efficiently, could you please share your registered phone number and a brief description of the issue you're experiencing? We'll look into it right away.`;
}

export function analyzeClientMessage(input: string): AnalysisResult {
  if (!input.trim()) {
    return {
      inputText: input,
      normalizedText: '',
      detectedLanguage: 'en',
      emotion: { type: 'neutral', level: 'low', label: 'Neutral', emoji: '😐', color: '#6b7280' },
      detectedTopics: [],
      suggestedTone: 'standard',
      matches: [],
    };
  }

  const lang = detectLanguage(input);
  const translated = lang !== 'en' ? translateSwahili(input) : input;
  const combined = input.toLowerCase() + ' ' + translated.toLowerCase();
  const emotion = detectEmotion(input, translated);
  const tokens = tokenize(combined);

  // Extract topics from matches
  const detectedTopics: string[] = [];

  // Score all items
  const scored = responsesData
    .map(item => scoreItem(item, tokens, emotion))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Get unique top matches (limit to top 5, deduplicate categories)
  const topMatches = scored.slice(0, 8);
  const seenCategories = new Set<string>();
  const finalMatches: MatchResult[] = [];
  for (const match of topMatches) {
    if (finalMatches.length >= 4) break;
    if (!seenCategories.has(match.item.category) || match.confidence === 'high') {
      finalMatches.push(match);
      seenCategories.add(match.item.category);
      if (match.item.category && !detectedTopics.includes(match.item.categoryShort)) {
        detectedTopics.push(match.item.categoryShort);
      }
    }
  }

  // Decide tone
  const suggestedTone: 'standard' | 'highEmpathy' =
    emotion.type === 'angry' || emotion.type === 'distress' || emotion.level === 'high'
      ? 'highEmpathy'
      : 'standard';

  // Generate AI suggestion if no good matches
  let aiSuggestion: string | undefined;
  let aiReasoning: string | undefined;
  if (finalMatches.length === 0 || finalMatches[0].confidence === 'low') {
    aiSuggestion = generateAISuggestion(emotion, detectedTopics, lang);
    aiReasoning =
      lang !== 'en'
        ? `Message detected as ${lang === 'sw' ? 'Swahili' : 'mixed Swahili/English'}. No exact template found in knowledge base — generating contextual response based on detected emotion: ${emotion.label}.`
        : `No exact template match found. Generating contextual response based on detected emotion: ${emotion.label}.`;
  }

  return {
    inputText: input,
    normalizedText: translated,
    detectedLanguage: lang,
    emotion,
    detectedTopics,
    suggestedTone,
    matches: finalMatches,
    aiSuggestion,
    aiReasoning,
  };
}
