
// ─────────────────────────────────────────────
// SWAHILI / KENYAN SLANG TRANSLATION MAP
// Maps Swahili & slang terms to English equivalents for matching
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// SWAHILI / KENYAN SLANG TRANSLATION MAP
// Maps Swahili & slang terms to English equivalents for matching
// ─────────────────────────────────────────────
const SWAHILI_MAP = {
  'doo': ['money', 'funds'],
  'mula': ['money', 'funds'],
  'pesa': ['money', 'funds', 'amount', 'balance'],
  'pesa yangu': ['my money', 'my funds'],
  'fedha': ['money', 'funds'],
  'hela': ['money', 'cash'],
  'nimeosha': ['lost everything', 'rg_distress'],
  'nimechomeka': ['lost everything', 'rg_distress'],
  'nisaidie kuwacha': ['self exclusion', 'rg_distress'],
  'nataka kuacha': ['delete account', 'self exclusion'],
  'bet ilikataa': ['bet was rejected', 'bet not accepted'],
  'withdrawal haijaingia': ['withdrawal not received', 'urgent money'],
  'deposit haikuingia': ['deposit failed', 'urgent money'],
  'nirudishie': ['refund me', 'give my money back', 'return'],
  'rudisha doo': ['give me a refund', 'refund demand'],
  'wezi': ['thieves', 'scammers', 'abusive'],
  'matapeli': ['thieves', 'scammers', 'abusive'],
  'saa hii': ['right now', 'fast', 'immediately', 'impatient'],
  'haraka': ['fast', 'immediately', 'impatient'],
  'sasa': ['now', 'hello', 'hi'], // Can be greeting or impatient based on context
  'sielewi': ['i don\'t understand', 'confused'],
  'niko na shida': ['i have a problem', 'issue'],
  'niaje': ['hi', 'hello', 'greeting'],
  'mambo': ['hi', 'hello', 'greeting'],
  'cashout haikufanya kazi': ['cash out didn\'t work', 'cashout failed'],
  'bet ilifutwa': ['bet was voided', 'cancelled bet'],
  'referral yangu': ['my referral', 'referral bonus'],
  'cashback yangu': ['my cashback', 'where is my cashback'],
  'hawezi kuingia': ['can\'t access', 'login issue'],
  'offers gani': ['what offers', 'promotions'],
  'nitaripoti': ['i\'ll report you', 'lawyer', 'authority', 'threatening'],
  'wameniiba': ['stealing', 'fraud', 'scam', 'thieves'],
  'mnaniiba': ['stealing', 'fraud', 'scam', 'thieves'],
  'waizi': ['thieves', 'fraud', 'steal'],
  'mbwa': ['insult', 'angry', 'aggression'],
  'ujinga': ['stupid', 'insult', 'angry'],
  'mnanicheza': ['tricking', 'fraud', 'scam'],
  'mbona': ['why', 'reason', 'explain'],
  'kwa nini': ['why', 'reason', 'explain'],
  'tafadhali': ['please', 'kindly'],
  'nisaidie': ['help me', 'please help'],
  'saidia': ['help', 'assist'],
  'nimesahau': ['forgot', 'lost access'],
  'password yangu': ['my password', 'login', 'forgot password'],
  'bado': ['still', 'yet', 'pending'],
  'habari': ['hello', 'hi', 'greeting'],
  'tatizo': ['problem', 'issue', 'error'],
  'pesa haikuja': ['money not received', 'payment not received'],
  'safaricom tatizo': ['safaricom issue', 'network problem'],
  'asante': ['thank you', 'thanks', 'closing'],
  'leo': ['today', 'cashback today'],
  'kiasi': ['amount'],
  'hasara': ['loss', 'lost money', 'chasing losses'],
  'pesa zote': ['all money', 'all funds', 'lost everything'],
};

// ─────────────────────────────────────────────
// EMOTION DETECTION
// ─────────────────────────────────────────────
const ANGRY_WORDS = [
  'stupid', 'useless', 'terrible', 'fraud', 'scam', 'thieves', 'steal', 'stealing',
  'incompetent', 'worst', 'pathetic', 'ridiculous', 'unbelievable', 'rubbish', 'nonsense',
  'idiot', 'fool', 'cheating', 'cheat', 'liar', 'liars', 'robbers',
  'mbwa', 'ujinga', 'mnaniiba', 'waizi', 'wameniiba', 'mnanicheza', 'matapeli', 'wezi'
];

const URGENT_WORDS = [
  'urgent', 'immediately', 'asap', 'right now', 'right away', 'where is my',
  "where's my", 'quickly', 'emergency', 'hurry',
];

const DISTRESS_WORDS = [
  'lost everything', 'all my money', 'desperate', 'stressed', "can't stop",
  'addicted', 'problem', 'please help me', 'i need help urgently',
  'nimepoteza kila kitu', 'nimekwama', 'pesa zote', 'tafadhali nisaidie',
  'depressed', 'suicide', 'cant afford', "can't afford", 'nimeosha', 'nimechomeka', 'nisaidie kuwacha'
];

const IMPATIENT_WORDS = [
  'still', 'yet', 'already', 'how long', 'when will', 'waiting',
  'always', 'every time', 'again', 'bado', 'mpaka lini',
  'inachukua muda', 'now', 'fast', 'saa hii', 'haraka'
];

const THREATENING_WORDS = [
  'report', 'lawyer', 'authority', 'nitaripoti', 'police', 'sue'
];

const CONFUSED_WORDS = [
  'how', 'explain', 'sielewi', 'i don\'t understand', 'confused', 'why'
];

export function analyzeClientMessage(input, templatesData) {
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

  const detectLanguage = (text) => {
    const lower = text.toLowerCase();
    const swahiliWords = Object.keys(SWAHILI_MAP);
    let swahiliCount = 0;
    for (const word of swahiliWords) {
      if (lower.includes(word)) swahiliCount++;
    }
    if (swahiliCount === 0) return 'en';
    const engWords = lower.split(/\s+/).filter(w => w.length > 3);
    const ratio = swahiliCount / Math.max(engWords.length, 1);
    if (ratio > 0.3) return 'sw/mixed';
    return 'mixed';
  };

  const translateSwahili = (text) => {
    let result = text.toLowerCase();
    const entries = Object.entries(SWAHILI_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [sw, enArr] of entries) {
      if (result.includes(sw)) {
        result = result.replace(new RegExp(sw, 'gi'), enArr.join(' '));
      }
    }
    return result;
  };

  const detectEmotion = (original, translated) => {
    const lower = original.toLowerCase();
    const combined = lower + ' ' + translated.toLowerCase();
    const letters = original.replace(/[^a-zA-Z]/g, '');
    const capsRatio = letters.length > 0 ? (original.replace(/[^A-Z]/g, '').length / letters.length) : 0;
    const exclamations = (original.match(/!/g) || []).length;
    const questionMarks = (original.match(/\?/g) || []).length;

    // Signal: ALL CAPS throughout message -> ANGRY
    const isAllCaps = capsRatio > 0.8 && letters.length > 5;
    
    // Signal: Short repeated messages / "now" / "fast" -> IMPATIENT
    const isImpatientSignal = (lower.length < 20 && (lower.includes('now') || lower.includes('fast') || lower.includes('hurry') || lower.includes('saa hii') || lower.includes('haraka'))) || original.split(' ').length <= 4;

    let angryScore = ANGRY_WORDS.filter(w => combined.includes(w)).length * 3
      + (isAllCaps ? 6 : capsRatio > 0.3 ? 2 : 0)
      + (exclamations > 2 ? 3 : 0);

    let urgentScore = URGENT_WORDS.filter(w => combined.includes(w)).length * 3
      + (isImpatientSignal ? 4 : 0)
      + (exclamations > 1 ? 1 : 0)
      + (questionMarks > 2 ? 1 : 0);

    const distressScore = DISTRESS_WORDS.filter(w => combined.includes(w)).length * 4
      + (combined.includes('lost everything') || combined.includes('crying') || combined.includes('nimeosha') ? 5 : 0);

    const impatientScore = IMPATIENT_WORDS.filter(w => combined.includes(w)).length * 2
      + (isImpatientSignal ? 5 : 0)
      + (questionMarks > 1 ? 1 : 0);

    const threateningScore = THREATENING_WORDS.filter(w => combined.includes(w)).length * 4;
    const confusedScore = CONFUSED_WORDS.filter(w => combined.includes(w)).length * 2 + (questionMarks >= 2 ? 2 : 0);

    // Specific Intent Tags from AI AUTO-ROUTING
    const isRefundDemand = lower.includes('refund') || lower.includes('give me my money back') || lower.includes('nirudishie');
    const isThreatening = threateningScore > 0;
    const isConfused = confusedScore > 2 || lower.includes('how do i') || lower.includes('sielewi');
    const isFraudPattern = lower.includes('multiple accounts') || lower.includes('bonus abuse');

    // Priority Ladder: RG_DISTRESS > ANGRY > THREATENING > IMPATIENT > CONFUSED > NEUTRAL
    let finalType = 'neutral';
    let maxScore = 0;
    
    if (distressScore >= 4) { finalType = 'distress'; maxScore = distressScore; }
    else if (angryScore >= 5) { finalType = 'angry'; maxScore = angryScore; }
    else if (threateningScore >= 4) { finalType = 'threatening'; maxScore = threateningScore; }
    else if (impatientScore >= 4) { finalType = 'impatient'; maxScore = impatientScore; }
    else if (urgentScore >= 4) { finalType = 'urgent'; maxScore = urgentScore; }
    else if (confusedScore >= 3) { finalType = 'confused'; maxScore = confusedScore; }
    else {
        // Fallback to highest score if it didn't trigger priority threshold
        const scores = [
            ['angry', angryScore],
            ['urgent', urgentScore],
            ['distress', distressScore],
            ['impatient', impatientScore],
            ['threatening', threateningScore],
            ['confused', confusedScore],
            ['neutral', 1],
        ];
        const top = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
        finalType = top[0];
        maxScore = top[1];
    }

    const level = maxScore >= 6 ? 'high' : maxScore >= 3 ? 'medium' : 'low';

    const emotionMeta = {
      angry: { label: 'Angry / Aggressive', emoji: '😤', color: '#ef4444' },
      urgent: { label: 'Urgent / Stressed', emoji: '⚡', color: '#f97316' },
      distress: { label: 'Distressed (RG Risk)', emoji: '😢', color: '#8b5cf6' },
      impatient: { label: 'Impatient', emoji: '⏰', color: '#eab308' },
      neutral: { label: 'Neutral', emoji: '😐', color: '#6b7280' },
      threatening: { label: 'Threatening / Escalation', emoji: '⚖️', color: '#ef4444' },
      confused: { label: 'Confused', emoji: '❓', color: '#3b82f6' }
    };

    let meta = { ...emotionMeta[finalType] };
    
    // Override label for specific routing
    if (isRefundDemand && finalType === 'neutral') { meta.label = 'Refund Demand'; meta.emoji = '💸'; }
    if (isFraudPattern) { meta.label = 'Fraud Suspicion'; meta.emoji = '🕵️'; }

    return { type: finalType, level, ...meta };
  };

  const scoreItem = (item, tokens, emotion) => {
    let score = 0;
    const matchedKeywords = [];
    const itemKeywords = item.triggers || [];
    const itemTitle = (item.title || '').toLowerCase();
    const itemCategory = (item.category || '').toLowerCase();

    const GENERIC_WORDS = ['account', 'bet', 'management', 'system', 'issue', 'please', 'kindly', 'assist', 'help'];

    for (const token of tokens) {
      if (token.length < 3) continue;
      
      // 1. Check direct triggers (Highest weight)
      for (const kw of itemKeywords) {
        const kwLower = kw.toLowerCase();
        if (kwLower === token) {
          score += 15; // Increased from 10
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        } else if (kwLower.includes(token) || token.includes(kwLower)) {
          score += token.length >= 5 ? 8 : 3; // Increased from 5/2
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }

      // 2. Check Title & Category (Lower weight, skip generics)
      if (!GENERIC_WORDS.includes(token)) {
        if (itemTitle.includes(token)) score += 5;
        if (itemCategory.includes(token)) score += 3;
      }
    }

    if (item.emotions?.includes(emotion.type)) {
      score += emotion.level === 'high' ? 5 : emotion.level === 'medium' ? 3 : 1;
    }

    const confidence = score >= 20 ? 'high' : score >= 10 ? 'medium' : 'low';
    return { item, score, matchedKeywords, confidence };
  };

  const generateAISuggestion = (emotion, language) => {
    const greetingSw = language === 'sw' || language === 'mixed' ? 'Karibu 🙂 ' : '';
    if (emotion.type === 'distress') return `${greetingSw}We sincerely understand how difficult this situation feels 🙏 Please know that we are here to help you through this. Could you kindly share the details of your issue so we can look into it right away?`;
    if (emotion.type === 'angry') return `${greetingSw}We hear you and we understand your frustration 🙏 We want to resolve this as quickly as possible. Kindly share the specific details of your issue so our team can address this immediately.`;
    if (emotion.type === 'urgent') return `${greetingSw}We understand this is urgent and we're on it 🔄 Please share your phone number, the amount involved, and the exact time of the transaction so we can prioritize your case.`;
    return `${greetingSw}Thank you for reaching out. To assist you efficiently, could you please share your registered phone number and a brief description of the issue? We'll look into it right away.`;
  };

  const lang = detectLanguage(input);
  const translated = lang !== 'en' ? translateSwahili(input) : input;
  const combined = input.toLowerCase() + ' ' + translated.toLowerCase();
  const emotion = detectEmotion(input, translated);
  const tokens = combined.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2);

  const flatTemplates = [];
  templatesData.forEach(cat => {
    cat.templates.forEach(tpl => {
      flatTemplates.push({ ...tpl, category: cat.category, categoryShort: cat.category.split(' ').pop() });
    });
  });

  const scored = flatTemplates
    .map(item => scoreItem(item, tokens, emotion))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const finalMatches = scored.slice(0, 4);
  const detectedTopics = Array.from(new Set(finalMatches.map(m => m.item.categoryShort)));
  const suggestedTone = emotion.type === 'angry' || emotion.type === 'distress' || emotion.level === 'high' ? 'highEmpathy' : 'standard';

  let aiSuggestion, aiReasoning;
  if (finalMatches.length === 0 || finalMatches[0].confidence === 'low') {
    aiSuggestion = generateAISuggestion(emotion, lang);
    aiReasoning = `No exact template match found. Generating contextual response based on detected emotion: ${emotion.label}.`;
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
