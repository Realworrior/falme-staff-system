
// ─────────────────────────────────────────────
// SWAHILI / KENYAN SLANG TRANSLATION MAP
// Maps Swahili & slang terms to English equivalents for matching
// ─────────────────────────────────────────────
const SWAHILI_MAP = {
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
    if (ratio > 0.3) return 'sw';
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
    const isImpatientSignal = (lower.length < 20 && (lower.includes('now') || lower.includes('fast') || lower.includes('hurry'))) || original.split(' ').length < 4;

    let angryScore = ANGRY_WORDS.filter(w => combined.includes(w)).length * 3
      + (isAllCaps ? 6 : capsRatio > 0.3 ? 2 : 0)
      + (exclamations > 3 ? 2 : 0);

    let urgentScore = URGENT_WORDS.filter(w => combined.includes(w)).length * 3
      + (isImpatientSignal ? 4 : 0)
      + (exclamations > 1 ? 1 : 0)
      + (questionMarks > 2 ? 1 : 0);

    const distressScore = DISTRESS_WORDS.filter(w => combined.includes(w)).length * 4
      + (combined.includes('lost everything') || combined.includes('crying') ? 5 : 0);

    const impatientScore = IMPATIENT_WORDS.filter(w => combined.includes(w)).length * 2
      + (isImpatientSignal ? 5 : 0)
      + (questionMarks > 1 ? 1 : 0);

    // Specific Intent Tags from AI AUTO-ROUTING
    const isRefundDemand = lower.includes('refund') || lower.includes('give me my money back');
    const isThreatening = lower.includes('report') || lower.includes('lawyer') || lower.includes('authority') || lower.includes('escalate');
    const isConfused = lower.includes('how do i') || lower.includes('don t understand') || lower.includes('sielewi');
    const isFraudPattern = lower.includes('multiple accounts') || lower.includes('bonus abuse');

    const scores = [
      ['angry', angryScore],
      ['urgent', urgentScore],
      ['distress', distressScore],
      ['impatient', impatientScore],
      ['neutral', 1],
    ];

    const [topEmotion, topScore] = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
    const level = topScore >= 6 ? 'high' : topScore >= 3 ? 'medium' : 'low';

    const emotionMeta = {
      angry: { label: 'Angry / Aggressive', emoji: '😤', color: '#ef4444' },
      urgent: { label: 'Urgent / Stressed', emoji: '⚡', color: '#f97316' },
      distress: { label: 'Distressed', emoji: '😢', color: '#8b5cf6' },
      impatient: { label: 'Impatient', emoji: '⏰', color: '#eab308' },
      neutral: { label: 'Neutral', emoji: '😐', color: '#6b7280' },
      rg_risk: { label: 'RG Risk', emoji: '⚠️', color: '#8b5cf6' },
    };

    let meta = { ...emotionMeta[topEmotion] };
    
    // Override label for specific routing
    if (isRefundDemand) { meta.label = 'Refund Demand'; meta.emoji = '💸'; }
    if (isThreatening) { meta.label = 'Threatening / Escalation'; meta.emoji = '⚖️'; }
    if (isConfused) { meta.label = 'Confused'; meta.emoji = '❓'; }
    if (isFraudPattern) { meta.label = 'Fraud Suspicion'; meta.emoji = '🕵️'; }

    return { type: topEmotion, level, ...meta };
  };

  const scoreItem = (item, tokens, emotion) => {
    let score = 0;
    const matchedKeywords = [];
    const itemKeywords = item.triggers || [];
    const itemTitle = item.title || '';
    const itemCategory = item.category || '';

    for (const token of tokens) {
      if (token.length < 2) continue;
      for (const kw of itemKeywords) {
        const kwLower = kw.toLowerCase();
        if (kwLower === token) {
          score += 10;
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        } else if (kwLower.includes(token) || token.includes(kwLower)) {
          score += token.length >= 4 ? 5 : 2;
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }
      if (itemTitle.toLowerCase().includes(token)) score += 4;
      if (itemCategory.toLowerCase().includes(token)) score += 2;
    }

    if (item.emotions?.includes(emotion.type)) {
      score += emotion.level === 'high' ? 5 : emotion.level === 'medium' ? 3 : 1;
    }

    const confidence = score >= 15 ? 'high' : score >= 7 ? 'medium' : 'low';
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
