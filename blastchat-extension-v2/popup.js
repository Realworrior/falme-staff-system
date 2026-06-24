// top-level imports - self-contained browser-safe selectResponse function
function selectResponse(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return '';
  }
  try {
    const stats = JSON.parse(localStorage.getItem('blastchat_response_stats') || '{}');
    responses.forEach((r, idx) => {
      const key = `r_${r.text.substring(0, 30)}`;
      if (!stats[key]) stats[key] = 0;
    });
    const minUsage = Math.min(...responses.map(r => stats[`r_${r.text.substring(0, 30)}`] || 0));
    const candidates = responses.filter(r => (stats[`r_${r.text.substring(0, 30)}`] || 0) === minUsage);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const chosenKey = `r_${chosen.text.substring(0, 30)}`;
    stats[chosenKey] = (stats[chosenKey] || 0) + 1;
    localStorage.setItem('blastchat_response_stats', JSON.stringify(stats));
    return chosen.text;
  } catch (e) {
    return responses[0]?.text || '';
  }
}

const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplates = [];
let activeCategory = 'ALL';
let activeShortcut = null;
let activeTabId = null;
let isBlastChat = false;

// Maps each shortcut label to the EXACT template titles it should display
const SHORTCUT_MAPPING = {
  'failed deposit':  ['Failed Deposit — M-PESA Code Required'],
  'airtel/bank':     ['Airtel or Bank Deposit — Not Supported'],
  'account number':  ['Account Verification Request'],
  'case submitted':  ['Case Submitted to Technical Team'],
  'lost amount':     ['Lost Amount Report — Aviator, Jet X, Crash Games', 'Pending Cashout — Crash / Aviator'],
  'Not lost':        ['No Lost Amount — All Transactions Correct'],
  'violation':       ['Referral Violation — Multiple Accounts Detected'],
  'reset':           ['Suspicious Reset Request — Technical Limitation', 'Account Reset Confirmation'],
  'Betslip':         ['Unpaid Winning Bet', 'Cash Out Not Processed', 'Bet Not Accepted / Rejected', 'Pending Betslip — Postponed Game'],
  'Account closure': ['Account Closure / Self-Exclusion'],
  'cashback':        ['How to Calculate Cashback', 'Will I Get Cashback Today', 'Daily Cashback Reset Window', 'Where Is My Cashback', 'Cashback Not Received — Conditions Not Met']
};

const SHORTCUT_KEYWORDS = Object.keys(SHORTCUT_MAPPING);

const LOCAL_TEMPLATES = [];



// NLP dictionaries and local match engine
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
  'pesa zote': ['all money', 'all funds', 'lost everything']
};

const ANGRY_WORDS = ['stupid', 'useless', 'terrible', 'fraud', 'scam', 'thieves', 'steal', 'stealing', 'incompetent', 'worst', 'pathetic', 'ridiculous', 'idiot', 'cheat', 'liar', 'robbers'];
const URGENT_WORDS = ['urgent', 'immediately', 'asap', 'right now', 'right away', 'quickly', 'emergency', 'hurry'];
const DISTRESS_WORDS = ['lost everything', 'all my money', 'desperate', 'stressed', 'addicted', 'suicide', 'cant afford', 'depressed'];

function analyzeClientMessageLocal(input, templatesData) {
  const lower = input.toLowerCase().trim();
  if (!lower) {
    return {
      detectedLanguage: 'en',
      emotion: { label: 'Neutral', emoji: '😐', color: '#6b7280' },
      suggestedTone: 'standard',
      matches: [],
      aiSuggestion: 'How can I help you today?',
      aiReasoning: 'Empty query.'
    };
  }

  // 1. Language Detection
  const swahiliWords = Object.keys(SWAHILI_MAP);
  let swahiliCount = 0;
  for (const word of swahiliWords) {
    if (lower.includes(word)) swahiliCount++;
  }
  const lang = swahiliCount > 0 ? 'mixed' : 'en';

  // Translation mapping
  let translated = lower;
  const entries = Object.entries(SWAHILI_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [sw, enArr] of entries) {
    if (translated.includes(sw)) {
      translated = translated.replace(new RegExp(sw, 'gi'), enArr.join(' '));
    }
  }
  const combinedText = lower + ' ' + translated;

  // 2. Emotion Detection
  const isGreeting = GREETINGS.some(g => lower === g || lower.startsWith(g + ' ') || lower.includes(' ' + g + ' '));
  const isClosing = CLOSINGS.some(c => lower === c || lower.startsWith(c + ' ') || lower.includes(' ' + c + ' '));
  const complexGreetings = ['how are you', 'how is it', 'how are things', 'how do you do'];
  const isComplexGreeting = complexGreetings.some(cg => lower.includes(cg));

  let emotion = { label: 'Neutral', emoji: '😐', color: '#6b7280' };
  let emotionType = 'neutral';

  if (DISTRESS_WORDS.some(w => combinedText.includes(w))) {
    emotion = { label: 'Distressed (RG)', emoji: '😢', color: '#8b5cf6' };
    emotionType = 'distress';
  } else if (ANGRY_WORDS.some(w => combinedText.includes(w))) {
    emotion = { label: 'Frustrated', emoji: '😤', color: '#ef4444' };
    emotionType = 'angry';
  } else if (URGENT_WORDS.some(w => combinedText.includes(w))) {
    emotion = { label: 'Urgent', emoji: '⚡', color: '#f97316' };
    emotionType = 'urgent';
  } else if (isGreeting || isComplexGreeting) {
    emotion = { label: 'Friendly', emoji: '👋', color: '#22c55e' };
    emotionType = 'greeting';
  }

  const suggestedTone = (emotionType === 'angry' || emotionType === 'distress') ? 'highEmpathy' : 'standard';

  // 3. Match templates
  let tokens = combinedText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  if (tokens.length > 1) {
    tokens = tokens.filter(t => !STOP_WORDS.has(t) && t.length >= 2);
  }
  if (tokens.length === 0) {
    tokens = combinedText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  }

  const isDepositIssue = lower.includes('deposit') && (lower.includes('not reflecting') || lower.includes('failed') || lower.includes('pending') || lower.includes('reflecting') || lower.includes('m-pesa') || lower.includes('mpesa'));
  const isAccountIssue = lower.includes('withdraw') || lower.includes('password') || lower.includes('reset') || lower.includes('login') || lower.includes('access') || lower.includes('delete') || lower.includes('close') || lower.includes('deactivate');
  const isCashbackIssue = lower.includes('cashback');

  const scoreItem = (t, queryTokens) => {
    let score = 0;
    const title = t.title.toLowerCase();
    const category = t.category.toLowerCase();
    const triggers = (t.triggers || []).map(tr => tr.toLowerCase());
    const responseTexts = (t.responses || []).map(r => r.text.toLowerCase());

    for (const token of queryTokens) {
      if (triggers.includes(token)) {
        score += 25;
      } else if (triggers.some(tr => tr.includes(token))) {
        score += 12;
      }
      if (title.includes(token)) {
        score += 15;
      }
      if (category.includes(token)) {
        score += 5;
      }
      if (responseTexts.some(txt => txt.includes(token))) {
        score += 2;
      }
    }

    // Scenario Boosting
    if (isDepositIssue && (title.includes('deposit') || triggers.includes('deposit'))) score += 30;
    if (isAccountIssue && (title.includes('withdraw') || title.includes('password') || title.includes('reset') || title.includes('exclusion') || title.includes('deletion') || title.includes('closure'))) score += 30;
    if (isCashbackIssue && title.includes('cashback')) score += 30;

    // Language Priority: Boost English over Swahili slightly to ensure English comes first
    const isSwahiliTemplate = title.includes('swahili') || title.includes('slang') || triggers.includes('sheng');
    if (!isSwahiliTemplate) score += 5;

    // Penalize unrelated matches for greetings
    if ((isGreeting || isComplexGreeting) && queryTokens.length <= 1) {
      if (!triggers.includes('greeting') && !title.includes('greeting')) {
        score = 0;
      }
    }

    return score;
  };

  const scored = templatesData
    .map(t => ({ item: t, score: scoreItem(t, tokens) }))
    .filter(r => r.score >= 15)
    .sort((a, b) => b.score - a.score);

  const matches = scored.slice(0, 3).map(m => ({
    confidence: m.score >= 50 ? '98%' : (m.score >= 30 ? '85%' : '65%'),
    item: m.item
  }));

  // 4. Regex Extraction for Placeholders
  let extractedPhone = '';
  let extractedAmount = '';
  let extractedGame = 'Aviator';
  let extractedBetId = '';
  let extractedTime = '';

  const phoneRegex = /(?:\+?254|0)([71]\d{8})\b/;
  const phoneMatch = lower.match(phoneRegex);
  if (phoneMatch) {
    extractedPhone = '0' + phoneMatch[1];
  }

  const amountRegex = /\b(?:ksh|shs|sh|kes|amount|of|deposited|lost|withdrew)\b\s*#?\s*(\d+(?:\.\d+)?)\b/i;
  const amountMatch = lower.match(amountRegex);
  if (amountMatch) {
    extractedAmount = amountMatch[1];
  } else {
    const anyNumRegex = /\b(\d{3,5})\b/g;
    let m;
    while ((m = anyNumRegex.exec(lower)) !== null) {
      if (!phoneMatch || !phoneMatch[0].includes(m[1])) {
        extractedAmount = m[1];
        break;
      }
    }
  }

  if (lower.includes('aviator')) extractedGame = 'Aviator';
  else if (lower.includes('mines')) extractedGame = 'Mines';
  else if (lower.includes('slots') || lower.includes('slot')) extractedGame = 'Slots';
  else if (lower.includes('casino')) extractedGame = 'Casino';

  const betIdRegex = /\b(?:bet\s*id|slip|ticket|id|betid)\b\s*#?\s*([a-z0-9-]{6,15})/i;
  const betIdMatch = lower.match(betIdRegex);
  if (betIdMatch) {
    extractedBetId = betIdMatch[1];
  } else {
    const alphaNumRegex = /\b([a-z0-9-]{6,12})\b/gi;
    let m;
    while ((m = alphaNumRegex.exec(lower)) !== null) {
      if (/[a-z]/i.test(m[1]) && /\d/.test(m[1])) {
        extractedBetId = m[1];
        break;
      }
    }
  }

  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i;
  const timeMatch = lower.match(timeRegex);
  if (timeMatch) {
    extractedTime = timeMatch[1];
  } else {
    const now = new Date();
    extractedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  const resolvePlaceholders = (text) => {
    if (!text) return '';
    let res = text;
    
    if (extractedPhone) {
      res = res.replace(/\{phone number\}/gi, extractedPhone);
      res = res.replace(/\{registered phone number\}/gi, extractedPhone);
    }
    if (extractedAmount) {
      res = res.replace(/\{amount\}/gi, 'Ksh ' + extractedAmount);
    }
    if (extractedGame) {
      res = res.replace(/\{game name\}/gi, extractedGame);
    }
    if (extractedBetId) {
      res = res.replace(/\{bet id\}/gi, extractedBetId);
    }
    if (extractedTime) {
      res = res.replace(/\{time of each round\}/gi, extractedTime);
      res = res.replace(/\{time\}/gi, extractedTime);
    }

    return res;
  };

  // 5. Synthesize AI Suggestion
  let aiSuggestion = '';
  let aiReasoning = '';

  const professionalGreeting = "Hello! 👋 Thank you for reaching out to us. How can we assist you with your Betfalme account today?";
  const professionalClosing = "You're very welcome! 🙏 We're glad we could help. Have a wonderful day, and feel free to reach out if you have any other questions.";

  if (isDepositIssue) {
    const depositTpl = matches.find(m => m.item.title.toLowerCase().includes('deposit'))?.item;
    const baseResponse = depositTpl ? depositTpl.responses[0].text : "We're sorry to hear your deposit hasn't reflected yet. Please share your MPESA message or transaction code so we can verify and update your balance immediately.";
    aiSuggestion = resolvePlaceholders(baseResponse);
    if (!lower.includes('transaction') && !lower.includes('mpesa')) {
      aiSuggestion += "\n\nPlease share your MPESA message or transaction code for manual verification.";
    }
    aiReasoning = "Local NLP matching: Detected deposit issue. Formulating response with MPESA transaction query.";
  } else if (isAccountIssue) {
    const accountTpl = matches.find(m => m.item.title.toLowerCase().includes('deletion'))?.item || matches[0]?.item;
    if (accountTpl && (accountTpl.title.toLowerCase().includes('deletion') || accountTpl.title.toLowerCase().includes('closure'))) {
      const baseResponse = accountTpl.responses[0].text;
      aiSuggestion = `[OPTION 1: ADVISORY]\n${resolvePlaceholders(baseResponse)}\n\n[PRO-TIP]\nAfter activating self-exclusion, please ensure there is no activity on the account for the next 72 hours to ensure the system synchronization is finalized.`;
      aiReasoning = "Local NLP matching: Detected Account Closure/Deletion. Providing self-exclusion instructions.";
    } else {
      const baseResponse = accountTpl ? accountTpl.responses[0].text : "We'd be happy to help you with that. Could you please share your registered phone number so we can check your account status?";
      aiSuggestion = resolvePlaceholders(baseResponse);
      if (!extractedPhone && !lower.includes('phone') && !lower.includes('number')) {
        aiSuggestion += "\n\nCould you also please share your registered phone number so we can look into this for you?";
      }
      aiReasoning = "Local NLP matching: Detected account/access issue. Prompting for registered phone number.";
    }
  } else if (isCashbackIssue) {
    const cashbackTpl = matches.find(m => m.item.title.toLowerCase().includes('cashback'))?.item;
    const baseResponse = cashbackTpl ? cashbackTpl.responses[0].text : "Could you please share your registered phone number? We'll check your cashback status and get back to you immediately.";
    aiSuggestion = resolvePlaceholders(baseResponse);
    if (!extractedPhone) {
      aiSuggestion += "\n\nPlease share your registered phone number so we can check your cashback eligibility and status.";
    }
    aiReasoning = "Local NLP matching: Detected cashback inquiry. Prompting for registered phone number.";
  } else if (isComplexGreeting || (isGreeting && tokens.length === 0)) {
    aiSuggestion = professionalGreeting;
    aiReasoning = "Local NLP matching: Detected friendly greeting. Providing standard greeting template.";
  } else if (isClosing && tokens.length === 0) {
    aiSuggestion = professionalClosing;
    aiReasoning = "Local NLP matching: Detected thank you or closing words. Providing standard closing template.";
  } else if (matches.length > 0) {
    const topMatch = matches[0].item;
    const selected = selectResponse(topMatch.responses);
    aiSuggestion = resolvePlaceholders(selected);
    aiReasoning = `Local NLP matching: Found high relevance match "${topMatch.title}". Resolving placeholders.`;
  } else {
    if (tokens.length > 0) {
      aiSuggestion = `We understand you're inquiring about ${tokens.join(' and ')}. To help us provide the most accurate assistance, could you please share a bit more detail or your registered phone number? We'll look into this for you immediately!`;
      aiReasoning = "Local NLP matching: Identified tokens but no standard match. Gathering context.";
    } else {
      aiSuggestion = "Thank you for reaching out! 👋 To assist you better, could you please share more details about your request or your registered phone number? We're here to help!";
      aiReasoning = "Local NLP matching: Very low informational density. Gathering context.";
    }
  }

  return {
    detectedLanguage: lang,
    emotion,
    suggestedTone,
    matches,
    aiSuggestion,
    aiReasoning
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  
  updateStatus("Initializing Neural Sync...", "orange");

  // 1. Check Tab Connection
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      updateStatus("Matrix Linked: Live", "orange");
      chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
        if (response && response.text && searchInput) {
          searchInput.value = response.text;
          filterTemplates();
        }
      });
    } else {
      updateStatus("Waiting for Data...", "orange");
    }
  });

  // 2. Load Templates
  fetchTemplates();

  // 3. Setup Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeShortcut = null;
      document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
      filterTemplates();
    });
  }

  // 4. Setup Category Dropdown
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      activeShortcut = null;
      document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
      filterTemplates();
    });
  }

  async function fetchTemplates() {
    // Remove cached fallback – always fetch fresh data from Supabase
    // (the cache will be refreshed after successful fetch)
    // Previously: const cached = localStorage.getItem('blastchat_templates');
    // if (cached) { ... return; }


    try {
      const url = `${SUPABASE_URL}/rest/v1/support_templates?select=*`;
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      processData(data);
    } catch (err) {
      console.error("Fetch error", err);
      showError(`Sync Failed: ${err.message}`);
      
      // Fallback: load local templates always
      const cached = localStorage.getItem('blastchat_templates');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Merge local templates into cached ones if not already present
          const cachedIds = new Set(parsed.allTemplates.map(t => t.id));
          const uniqueLocals = LOCAL_TEMPLATES.filter(t => !cachedIds.has(t.id));
          allTemplates = [...parsed.allTemplates, ...uniqueLocals];
          const categories = [...new Set(allTemplates.map(t => t.category))].filter(Boolean);
          renderUI(categories);
        } catch (e) {
          allTemplates = LOCAL_TEMPLATES;
          const categories = [...new Set(allTemplates.map(t => t.category))].filter(Boolean);
          renderUI(categories);
        }
      } else {
        allTemplates = LOCAL_TEMPLATES;
        const categories = [...new Set(allTemplates.map(t => t.category))].filter(Boolean);
        renderUI(categories);
      }
    }
  }

  function processData(data) {
    if (!data || !Array.isArray(data)) return;
    const flattened = [];
    data.forEach(catRow => {
      if (catRow.templates) {
        catRow.templates.forEach(t => {
          flattened.push({
            id: `${catRow.id}-${t.title}`,
            category: catRow.category || "General",
            title: t.title,
            responses: t.responses || [],
            triggers: t.triggers || []
          });
        });
      }
    });
    
    // Merge local templates — deduplicate by title+category so Supabase originals win
    const flattenedKeys = new Set(flattened.map(t => `${t.category}||${t.title}`));
    const uniqueLocals = LOCAL_TEMPLATES.filter(
      t => !flattenedKeys.has(`${t.category}||${t.title}`)
    );
    allTemplates = [...flattened, ...uniqueLocals];
    
    const categories = [...new Set(allTemplates.map(t => t.category))].filter(Boolean);
    localStorage.setItem('blastchat_templates', JSON.stringify({ allTemplates, categories }));
    renderUI(categories);
    updateStatus("Matrix Synced", "orange");
  }

  function renderUI(categories) {
    renderShortcuts();
    renderCategoryDropdown(categories);
    // Immediately populate the card list with all templates (no blank on open)
    filterTemplates();

    function renderShortcuts() {
      const area = document.getElementById('shortcuts-row');
      if (!area) return;
      area.textContent = '';

      SHORTCUT_KEYWORDS.forEach(label => {
        const tag = document.createElement('div');
        tag.className = `shortcut-tag ${activeShortcut === label ? 'active' : ''}`;
        tag.textContent = label;
        tag.onclick = () => {
          if (activeShortcut === label) {
            activeShortcut = null;
            tag.classList.remove('active');
          } else {
            document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
            activeShortcut = label;
            tag.classList.add('active');
            // Clear active category and search input for shortcut priority
            activeCategory = 'ALL';
            if (categorySelect) categorySelect.value = 'ALL';
            if (searchInput) searchInput.value = '';
          }
          filterTemplates();
        };
        area.appendChild(tag);
      });
    }

    function renderCategoryDropdown(categories) {
      if (!categorySelect) return;
      categorySelect.textContent = '';

      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = 'All Categories';
      categorySelect.appendChild(allOpt);

      // Use full category names exactly as fetched from Supabase (matches SEC_ID 1–12)
      const uniqueCats = [...new Set(categories)].sort();

      uniqueCats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (activeCategory === cat) option.selected = true;
        categorySelect.appendChild(option);
      });
    }
  }

  function filterTemplates() {
    if (window.aiTimeout) clearTimeout(window.aiTimeout);
    const q = searchInput?.value.toLowerCase().trim() || '';
    let filtered = allTemplates;

    // Use Shortcut Mapping if active — show ONLY the exact mapped templates
    if (activeShortcut) {
      const titles = new Set(SHORTCUT_MAPPING[activeShortcut] || []);
      filtered = filtered.filter(t => titles.has(t.title));
    } else if (activeCategory !== 'ALL') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    if (q) {
      let tokens = q.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 1) {
        tokens = tokens.filter(t => !STOP_WORDS.has(t) && t.length >= 2);
      }
      if (tokens.length === 0) {
        tokens = q.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
      }

      const scoreItem = (t, queryTokens) => {
        let score = 0;
        const title = t.title.toLowerCase();
        const category = t.category.toLowerCase();
        const triggers = (t.triggers || []).map(tr => tr.toLowerCase());
        const responseTexts = (t.responses || []).map(r => r.text.toLowerCase());

        for (const token of queryTokens) {
          if (triggers.includes(token)) {
            score += 25;
          } else if (triggers.some(tr => tr.includes(token))) {
            score += 12;
          }
          if (title.includes(token)) {
            score += 15;
          }
          if (category.includes(token)) {
            score += 5;
          }
          if (responseTexts.some(txt => txt.includes(token))) {
            score += 2;
          }
        }
        return score;
      };

      const scored = filtered.map(t => ({
        template: t,
        score: scoreItem(t, tokens)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

      filtered = scored.map(item => item.template);
    }

    renderTemplates(filtered);

    // If no templates matched, immediately show local AI suggestion
    if (filtered.length === 0 && q) {
      const localAiData = analyzeClientMessageLocal(q, allTemplates);
      renderAITemplate(localAiData);
      updateStatus("Local AI Active", "orange");
    }
  }

  function appendHighlightedText(container, text) {
    if (!text) return;

    const categories = {
      danger: ['Referral Violation', 'Deleted Message', 'Lost', 'Rolled back'],
      success: ['Submitted', 'Cashback', 'Referral Bonus'],
      info: ['Deposit', 'Withdrawal', 'bet ID', 'Mpesa'],
      data: ['Phone number', 'Account Number', 'registered phone number']
    };

    const allKeywords = Object.values(categories).flat();
    const pattern = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|${allKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    const parts = text.split(pattern);
    parts.forEach(part => {
      if (!part) return;
      
      const isPlaceholder = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
      if (isPlaceholder) {
        const span = document.createElement('span');
        span.className = 'var-highlight';
        span.textContent = part;
        container.appendChild(span);
        return;
      }

      const k = part.toLowerCase();
      let matchedClass = '';
      if (categories.danger.some(v => v.toLowerCase() === k)) matchedClass = 'danger-highlight';
      else if (categories.success.some(v => v.toLowerCase() === k)) matchedClass = 'success-highlight';
      else if (categories.info.some(v => v.toLowerCase() === k)) matchedClass = 'info-highlight';
      else if (categories.data.some(v => v.toLowerCase() === k)) matchedClass = 'data-highlight';

      if (matchedClass) {
        const span = document.createElement('span');
        span.className = matchedClass;
        span.textContent = part;
        container.appendChild(span);
      } else {
        container.appendChild(document.createTextNode(part));
      }
    });
  }

  function createCardElement({
    className = '',
    style = {},
    cardNumber = '',
    cardMetaText = '',
    cardTitle = '',
    cardTitleStyle = {},
    responseText = '',
    responseTextStyle = {},
    buttonText = '',
    buttonStyle = {},
    buttonClass = 'copy-btn',
    onButtonClick = null,
    onResponseClick = null
  }) {
    const card = document.createElement('div');
    card.className = `matrix-card ${className}`.trim();
    for (const [k, v] of Object.entries(style)) {
      card.style[k] = v;
    }

    const headerRow = document.createElement('div');
    headerRow.className = 'card-header-row';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    titleDiv.textContent = cardTitle;
    for (const [k, v] of Object.entries(cardTitleStyle)) {
      titleDiv.style[k] = v;
    }

    const metaPill = document.createElement('div');
    metaPill.className = 'card-meta-pill';
    metaPill.textContent = cardMetaText || cardNumber;

    headerRow.appendChild(titleDiv);
    headerRow.appendChild(metaPill);
    card.appendChild(headerRow);

    const respDiv = document.createElement('div');
    respDiv.className = 'response-text';
    for (const [k, v] of Object.entries(responseTextStyle)) {
      respDiv.style[k] = v;
    }
    appendHighlightedText(respDiv, responseText);
    card.appendChild(respDiv);

    const btn = document.createElement('button');
    btn.className = buttonClass;
    for (const [k, v] of Object.entries(buttonStyle)) {
      btn.style[k] = v;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '9');
    rect.setAttribute('y', '9');
    rect.setAttribute('width', '13');
    rect.setAttribute('height', '13');
    rect.setAttribute('rx', '2');
    rect.setAttribute('ry', '2');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
    
    svg.appendChild(rect);
    svg.appendChild(path);

    btn.appendChild(svg);
    btn.appendChild(document.createTextNode(' ' + buttonText));
    
    if (onButtonClick) {
      btn.addEventListener('click', onButtonClick);
    }
    if (onResponseClick) {
      respDiv.addEventListener('click', onResponseClick);
    }

    body.appendChild(btn);
    card.appendChild(body);

    return card;
  }

  function renderAITemplate(aiData) {
    if (!container) return;
    
    // Remove any existing AI cards and empty state messages
    const oldElements = container.querySelectorAll('.ai-card, .empty-state');
    oldElements.forEach(el => el.remove());

    const fragment = document.createDocumentFragment();

    // 1. Synthesized Response
    if (aiData.aiSuggestion) {
      const aiCard = createCardElement({
        className: 'ai-card synthesized',
        style: {
          border: '1px solid var(--orange)',
          boxShadow: '0 0 15px rgba(255,102,0,0.1)'
        },
        cardNumber: '⚡ GEMINI_SYNTHESIS',
        cardMetaText: aiData.emotion ? aiData.emotion.label : 'Cloud',
        cardTitle: '✨ AI Synthesized Response',
        cardTitleStyle: {
          color: 'var(--orange)'
        },
        responseText: aiData.aiSuggestion,
        responseTextStyle: {
          fontWeight: '600'
        },
        buttonText: 'Inject AI Logic',
        buttonStyle: {
          background: 'rgba(255,102,0,0.1)',
          borderColor: 'var(--orange)',
          color: 'var(--orange)'
        },
        buttonClass: 'copy-btn ai-copy-btn',
        onButtonClick: () => injectText(aiData.aiSuggestion),
        onResponseClick: () => {
          navigator.clipboard.writeText(aiData.aiSuggestion).then(() => {
            updateStatus("AI Copied to Clipboard", "orange");
            setTimeout(() => updateStatus("Ready", "orange"), 2000);
          });
        }
      });
      fragment.appendChild(aiCard);
    }

    // 2. Alternative Matches
    if (aiData.matches && aiData.matches.length > 0) {
      aiData.matches.forEach((match, idx) => {
        const tone = aiData.suggestedTone;
        const candidates = match.item?.responses?.filter(r => r.type === (tone === 'highEmpathy' ? 'High Empathy' : 'Standard')) || [];
        const selectedText = selectResponse(candidates);
        const resp = selectedText ? { text: selectedText } : (match.item?.responses?.[0] || { text: '' });
        if (!resp.text) return;
        
        const matchCard = createCardElement({
          className: 'ai-card alternative',
          style: {
            border: '1px dashed rgba(255,102,0,0.4)'
          },
          cardNumber: `AI_ALT_${(idx + 1).toString().padStart(3, '0')}`,
          cardMetaText: `Match: ${match.confidence || 'High'}`,
          cardTitle: match.item?.title || 'Alternative Option',
          cardTitleStyle: {
            color: 'rgba(255,102,0,0.8)'
          },
          responseText: resp.text,
          buttonText: 'Inject Alternative',
          buttonClass: 'copy-btn ai-copy-btn',
          onButtonClick: () => injectText(resp.text),
          onResponseClick: () => {
            navigator.clipboard.writeText(resp.text).then(() => {
              updateStatus("AI Copied to Clipboard", "orange");
              setTimeout(() => updateStatus("Ready", "orange"), 2000);
            });
          }
        });
        fragment.appendChild(matchCard);
      });
    }

    // Prepend to container
    if (container.firstChild) {
      container.insertBefore(fragment, container.firstChild);
    } else {
      container.appendChild(fragment);
    }
  }

  // ─── Single card with clickable variant tabs ───────────────────────────────
  function buildSwitcherCard(t, idx) {
    const responses = Array.isArray(t.responses) && t.responses.length > 0
      ? t.responses
      : [{ text: 'No intelligence found for this module.', type: 'Standard' }];

    const card = document.createElement('div');
    card.className = 'matrix-card';

    // Meta row
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const numDiv = document.createElement('div');
    numDiv.className = 'card-number';
    numDiv.style.cssText = 'font-family:var(--mono);font-size:10px;font-weight:800;color:var(--orange);opacity:0.6;letter-spacing:0.05em;';
    numDiv.textContent = `INTEL_REF_${(idx + 1).toString().padStart(3, '0')}`;
    meta.appendChild(numDiv);
    const catDiv = document.createElement('div');
    catDiv.style.cssText = 'font-family:var(--mono);font-size:8px;font-weight:900;color:var(--orange);text-transform:uppercase;letter-spacing:0.1em;';
    catDiv.textContent = t.category;
    meta.appendChild(catDiv);
    card.appendChild(meta);

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    titleDiv.style.fontFamily = 'var(--mono)';
    titleDiv.textContent = t.title;
    card.appendChild(titleDiv);

    // Variant tab row (shown only when there are multiple responses)
    const tabs = [];
    if (responses.length > 1) {
      const tabsRow = document.createElement('div');
      tabsRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.04);';

      const varLabel = document.createElement('span');
      varLabel.style.cssText = 'font-family:var(--mono);font-size:9px;font-weight:900;color:rgba(255,102,0,0.4);text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0;';
      varLabel.textContent = 'Variant:';
      tabsRow.appendChild(varLabel);

      responses.forEach((r, rIdx) => {
        const tab = document.createElement('button');
        tab.textContent = r.type || `${rIdx + 1}`;
        tab.style.cssText = 'padding:2px 8px;border-radius:3px;border:1px solid;font-family:var(--mono);font-size:9px;font-weight:900;cursor:pointer;transition:all 0.15s;white-space:nowrap;';
        tabs.push(tab);
        tabsRow.appendChild(tab);
      });
      card.appendChild(tabsRow);
    }

    // Body — single response displayed at a time
    const body = document.createElement('div');
    body.className = 'card-body';

    const respDiv = document.createElement('div');
    respDiv.className = 'response-text';
    body.appendChild(respDiv);

    // Inject button
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.style.marginTop = '8px';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14'); svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '3');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M5 12h14m-7-7 7 7-7 7');
    svg.appendChild(arrowPath);
    btn.appendChild(svg);
    const btnLabel = document.createTextNode(' Inject');
    btn.appendChild(btnLabel);
    body.appendChild(btn);
    card.appendChild(body);

    // ── Switch variant: update text + button + tab styles ──
    function setVariant(i) {
      const resp = responses[i];
      respDiv.textContent = '';
      appendHighlightedText(respDiv, resp.text);

      btn.onclick = () => injectText(resp.text);
      respDiv.onclick = () => {
        navigator.clipboard.writeText(resp.text).then(() => {
          updateStatus('Copied to Clipboard', 'orange');
          setTimeout(() => updateStatus('Ready', 'orange'), 2000);
        });
      };

      tabs.forEach((tab, tIdx) => {
        const active = tIdx === i;
        tab.style.borderColor  = active ? 'var(--orange)' : 'rgba(255,255,255,0.1)';
        tab.style.background   = active ? 'rgba(255,102,0,0.12)' : 'transparent';
        tab.style.color        = active ? 'var(--orange)' : 'rgba(255,255,255,0.3)';
      });
    }

    tabs.forEach((tab, tIdx) => { tab.onclick = () => setVariant(tIdx); });
    setVariant(0); // default: first variant active

    return card;
  }

  // ─── Render templates list ─────────────────────────────────────────────────
  function renderTemplates(templates) {
    if (!container) return;
    container.textContent = '';

    if (templates.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = 'No matching intelligence found';
      container.appendChild(emptyDiv);
      return;
    }

    // Deduplicate by title+category at render time (belt-and-suspenders)
    const seen = new Set();
    const unique = templates.filter(t => {
      const key = `${t.category}||${t.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (activeShortcut) {
      // ── Shortcut view: flat list, one switcher-card per template ──
      unique.forEach((t, idx) => container.appendChild(buildSwitcherCard(t, idx)));
    } else {
      // ── Default / search / category view: group by category ──
      const groups = new Map();
      unique.forEach(t => {
        if (!groups.has(t.category)) groups.set(t.category, []);
        groups.get(t.category).push(t);
      });

      let globalIdx = 0;
      groups.forEach((items, cat) => {
        // Category section header
        const header = document.createElement('div');
        header.style.cssText = [
          'display:flex;align-items:center;gap:10px;',
          'padding:8px 0 6px;margin:14px 0 8px;',
          'border-bottom:1px solid rgba(255,102,0,0.25);',
          'font-family:var(--mono);font-size:9px;font-weight:900;',
          'color:var(--orange);text-transform:uppercase;letter-spacing:0.12em;',
          'grid-column:1 / -1;' // Force header to span all columns
        ].join('');

        const dot = document.createElement('span');
        dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:var(--orange);display:inline-block;flex-shrink:0;';
        header.appendChild(dot);
        header.appendChild(document.createTextNode(cat));

        const count = document.createElement('span');
        count.style.cssText = 'margin-left:auto;font-size:8px;opacity:0.5;';
        count.textContent = `COUNT: ${items.length}`;
        header.appendChild(count);

        container.appendChild(header);
        items.forEach(t => container.appendChild(buildSwitcherCard(t, globalIdx++)));
      });
    }
  }

  function updateStatus(text, colorVar) {
    const el = document.getElementById('status-text');
    if (el) {
      el.textContent = text;
      el.style.color = `var(--${colorVar})`;
    }
  }

  function showError(msg) {
    const el = document.getElementById('error-toast');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
  }

  function injectText(text) {
    if (!isBlastChat) {
      showError("Please open BlastChat first!");
      return;
    }
    updateStatus("Injecting...", "orange");
    
    chrome.tabs.sendMessage(activeTabId, { action: "injectText", text }, (res) => {
      if (chrome.runtime.lastError) {
        // Attempt repair
        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          files: ['content.js']
        }).then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTabId, { action: "injectText", text }, (res2) => {
              if (res2?.success) {
                updateStatus("Injected", "orange");
                setTimeout(() => window.close(), 500);
              }
            });
          }, 200);
        });
      } else if (res?.success) {
        updateStatus("Success", "orange");
        setTimeout(() => window.close(), 100);
      } else {
        showError("Focus Chat Input!");
        updateStatus("Ready", "orange");
      }
    });
  }
});
