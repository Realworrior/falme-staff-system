// ─────────────────────────────────────────────
// NLP TOKENS & DICTIONARIES
// ─────────────────────────────────────────────

const STOP_WORDS = new Set([
  'how', 'are', 'you', 'is', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 
  'else', 'when', 'at', 'from', 'by', 'for', 'with', 'about', 'against', 'between', 
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'in', 'on', 
  'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'i', 'me', 'my', 'mine',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
]);

const GREETINGS = [
  'hi', 'hello', 'hey', 'niaje', 'mambo', 'sasa', 'habari', 'hujambo', 'wassup', 'yo',
  'how are you', 'how is it', 'how are things', 'how do you do', 'good morning', 
  'good afternoon', 'good evening', 'poa', 'vipi', 'sup', 'morning', 'evening'
];

const CLOSINGS = [
  'bye', 'goodbye', 'thanks', 'asante', 'thank you', 'be blessed', 'have a nice day',
  'see you', 'later', 'done', 'that is all', 'shukran', 'okay', 'ok', 'sawa'
];

// ─────────────────────────────────────────────
// SWAHILI / KENYAN SLANG TRANSLATION MAP
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
  'sasa': ['now', 'hello', 'hi'],
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
// EMOTION DETECTION WORDS
// ─────────────────────────────────────────────
const ANGRY_WORDS = ['stupid', 'useless', 'terrible', 'fraud', 'scam', 'thieves', 'steal', 'stealing', 'incompetent', 'worst', 'pathetic', 'ridiculous', 'idiot', 'cheat', 'liar', 'robbers'];
const URGENT_WORDS = ['urgent', 'immediately', 'asap', 'right now', 'right away', 'quickly', 'emergency', 'hurry'];
const DISTRESS_WORDS = ['lost everything', 'all my money', 'desperate', 'stressed', 'addicted', 'suicide', 'cant afford', 'depressed'];

// ─────────────────────────────────────────────
// MAIN AI ENGINE
// ─────────────────────────────────────────────

export function analyzeClientMessage(input, templatesData) {
  const lower = input.toLowerCase().trim();
  
  if (!lower) {
    return { 
      inputText: input, 
      normalizedText: '', 
      detectedLanguage: 'en', 
      emotion: { label: 'Neutral', emoji: '😐', color: '#6b7280' }, 
      matches: [], 
      suggestedTone: 'standard',
      aiSuggestion: "How can I help you today?",
      aiReasoning: "Empty input detected."
    };
  }

  // 1. Language & Translation
  const detectLanguage = (text) => {
    const swahiliWords = Object.keys(SWAHILI_MAP);
    let swahiliCount = 0;
    for (const word of swahiliWords) if (text.includes(word)) swahiliCount++;
    return swahiliCount > 0 ? 'mixed' : 'en';
  };

  const translate = (text) => {
    let result = text;
    const entries = Object.entries(SWAHILI_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [sw, enArr] of entries) {
      if (result.includes(sw)) result = result.replace(new RegExp(sw, 'gi'), enArr.join(' '));
    }
    return result;
  };

  const lang = detectLanguage(lower);
  const translated = translate(lower);
  const combinedText = lower + ' ' + translated;

  // 2. Intent Analysis (Greetings / Closings / Specific Phrases)
  const isGreeting = GREETINGS.some(g => lower === g || lower.startsWith(g + ' ') || lower.includes(' ' + g + ' '));
  const isClosing = CLOSINGS.some(c => lower === c || lower.startsWith(c + ' ') || lower.includes(' ' + c + ' '));
  
  // Specific complex greeting check (e.g., "how are you")
  const complexGreetings = ['how are you', 'how is it', 'how are things', 'how do you do'];
  const isComplexGreeting = complexGreetings.some(cg => lower.includes(cg));

  // 3. Emotion Analysis
  const detectEmotion = (text) => {
    if (DISTRESS_WORDS.some(w => text.includes(w))) return { type: 'distress', label: 'Distressed (RG)', emoji: '😢', color: '#8b5cf6' };
    if (ANGRY_WORDS.some(w => text.includes(w))) return { type: 'angry', label: 'Frustrated', emoji: '😤', color: '#ef4444' };
    if (URGENT_WORDS.some(w => text.includes(w))) return { type: 'urgent', label: 'Urgent', emoji: '⚡', color: '#f97316' };
    if (isGreeting || isComplexGreeting) return { type: 'greeting', label: 'Friendly', emoji: '👋', color: '#22c55e' };
    return { type: 'neutral', label: 'Neutral', emoji: '😐', color: '#6b7280' };
  };

  const emotion = detectEmotion(combinedText);

  // 4. Advanced Template Matching (NLP-driven)
  const getTokens = (text) => {
    return text.replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
  };

  const tokens = getTokens(combinedText);
  
  // Specific Scenario Detection
  const isDepositIssue = lower.includes('deposit') && (lower.includes('not reflecting') || lower.includes('failed') || lower.includes('pending') || lower.includes('reflecting'));
  const isAccountIssue = lower.includes('withdraw') || lower.includes('password') || lower.includes('reset') || lower.includes('login') || lower.includes('access') || lower.includes('delete') || lower.includes('close') || lower.includes('deactivate');
  const isCashbackIssue = lower.includes('cashback');

  const scoreItem = (item, queryTokens) => {
    let score = 0;
    const itemTriggers = (item.triggers || []).map(t => t.toLowerCase());
    const itemTitle = (item.title || '').toLowerCase();
    
    // Exact match boost
    if (queryTokens.length > 0) {
      for (const token of queryTokens) {
        if (itemTriggers.includes(token)) score += 25;
        else if (itemTriggers.some(t => t.includes(token))) score += 12;
        if (itemTitle.includes(token)) score += 10;
      }
    }
    
    // Scenario Boosting
    if (isDepositIssue && (itemTitle.includes('deposit') || itemTriggers.includes('deposit'))) score += 30;
    if (isAccountIssue && (itemTitle.includes('withdraw') || itemTitle.includes('password') || itemTitle.includes('reset'))) score += 30;
    if (isCashbackIssue && itemTitle.includes('cashback')) score += 30;

    // Language Priority: Boost English over Swahili slightly to ensure English comes first
    const isSwahiliTemplate = itemTitle.includes('swahili') || itemTitle.includes('slang') || itemTriggers.includes('sheng');
    if (!isSwahiliTemplate) score += 5; // Slight priority for English

    // Penalize unrelated matches for greetings
    if ((isGreeting || isComplexGreeting) && queryTokens.length <= 1) {
      if (!itemTriggers.includes('greeting') && !itemTitle.includes('greeting')) {
        score = 0;
      }
    }

    return score;
  };

  const flatTemplates = [];
  templatesData.forEach(cat => {
    cat.templates.forEach(tpl => {
      flatTemplates.push({ ...tpl, category: cat.category });
    });
  });

  const scored = flatTemplates
    .map(item => ({ item, score: scoreItem(item, tokens) }))
    .filter(r => r.score >= 20) 
    .sort((a, b) => b.score - a.score);

  const matches = scored.slice(0, 4);

  // 5. Contextual AI Suggestion (Copy-Paste Ready for Staff)
  let aiSuggestion = '';
  let aiReasoning = '';

  const professionalGreeting = "Hello! 👋 Thank you for reaching out to us. How can we assist you with your Betfalme account today?";
  const professionalClosing = "You're very welcome! 🙏 We're glad we could help. Have a wonderful day, and feel free to reach out if you have any other questions.";

  if (isDepositIssue) {
    const depositTpl = matches.find(m => m.item.title.toLowerCase().includes('deposit'))?.item;
    aiSuggestion = depositTpl 
      ? `${depositTpl.responses[0].text}\n\nPlease share your MPESA message or transaction code for manual verification.` 
      : "We're sorry to hear your deposit hasn't reflected yet. Please share your MPESA message or transaction code so we can verify and update your balance immediately.";
    aiReasoning = "Detected deposit issue. Prioritizing Mpesa message/code request as per protocol.";
  } else if (isAccountIssue) {
    const accountTpl = matches.find(m => m.item.title.toLowerCase().includes('deletion'))?.item || matches[0]?.item;
    
    if (accountTpl && accountTpl.title.toLowerCase().includes('deletion')) {
      // Special bundle for Deletion
      const v = accountTpl.responses;
      aiSuggestion = `[OPTION 1: STANDARD]\n${v[0].text}\n\n[OPTION 2: HIGH EMPATHY]\n${v[1].text}\n\n[OPTION 3: SECURITY ALERT]\n${v[2].text}\n\nREQUIRED: Please share your registered phone number so we can process the 72-hour manual block immediately.`;
      aiReasoning = "Security-sensitive: Account Deletion detected. Providing all 3 variations (Standard, Empathy, Alert) to allow agent choice based on client mood.";
    } else {
      aiSuggestion = accountTpl 
        ? `${accountTpl.responses[0].text}\n\nCould you also please share your registered phone number so we can look into this for you?` 
        : "We'd be happy to help you with that. Could you please share your registered phone number so we can check your account status?";
      aiReasoning = "Detected account/withdrawal issue. Prioritizing registered phone number request.";
    }
  } else if (isCashbackIssue) {
    const cashbackTpl = matches.find(m => m.item.title.toLowerCase().includes('cashback'))?.item;
    aiSuggestion = cashbackTpl 
      ? `${cashbackTpl.responses[0].text}\n\nPlease share your registered phone number so we can check your cashback eligibility and status.` 
      : "Could you please share your registered phone number? We'll check your cashback status and get back to you immediately.";
    aiReasoning = "Detected cashback inquiry. Prioritizing phone number request and cashback templates.";
  } else if (isComplexGreeting || (isGreeting && tokens.length === 0)) {
    aiSuggestion = professionalGreeting;
    aiReasoning = "Detected a friendly greeting. Providing a professional opening response for the agent to use.";
  } else if (isClosing && tokens.length === 0) {
    aiSuggestion = professionalClosing;
    aiReasoning = "Detected a closing or gratitude phrase. Providing a polite wrap-up response.";
  } else if (matches.length > 0) {
    const topMatch = matches[0].item;
    aiSuggestion = topMatch.responses[0].text;
    aiReasoning = `High-confidence match (Score: ${matches[0].score}) for "${topMatch.title}". Providing the standard response directly.`;
  } else {
    if (tokens.length > 0) {
      aiSuggestion = `We understand you're inquiring about ${tokens.join(' and ')}. To help us provide the most accurate assistance, could you please share a bit more detail or your registered phone number? We'll look into this for you immediately!`;
      aiReasoning = "Identified keywords but no perfect template match. Providing a helpful, conversational probe.";
    } else {
      aiSuggestion = "Thank you for reaching out! 👋 To assist you better, could you please share more details about your request or your registered phone number? We're here to help!";
      aiReasoning = "Low information density in query. Requesting more context from the customer.";
    }
  }

  return {
    inputText: input,
    normalizedText: translated,
    detectedLanguage: lang,
    emotion,
    suggestedTone: emotion.type === 'angry' || emotion.type === 'distress' ? 'highEmpathy' : 'standard',
    matches,
    aiSuggestion,
    aiReasoning,
    detectedTopics: Array.from(new Set(matches.map(m => m.item.category.split(' ').pop())))
  };
}
