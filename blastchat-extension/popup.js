// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplates = [];
let activeCategory = 'ALL';
let activeShortcut = null;
let activeTabId = null;
let isBlastChat = false;

const SHORTCUT_MAPPING = {
  'Account number': 'Account verification',
  'Failed deposit': 'Deposit',
  'Case submitted': 'Submitted',
  'Lost amount': 'casino',
  'Unpaid winning bet': 'BetId',
  'Pending betslip': 'BetId',
  'Account closure': 'Delete',
  'Cashback': 'cashback'
};

const SHORTCUT_KEYWORDS = Object.keys(SHORTCUT_MAPPING);

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
    const toneResponse = topMatch.responses.find(r => r.type === (suggestedTone === 'highEmpathy' ? 'High Empathy' : 'Standard')) || topMatch.responses[0];
    aiSuggestion = resolvePlaceholders(toneResponse.text);
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
    const cached = localStorage.getItem('blastchat_templates');
    if (cached) {
      try {
        const { allTemplates: cachedTemplates, categories } = JSON.parse(cached);
        allTemplates = cachedTemplates;
        renderUI(categories);
        updateStatus("Matrix Ready", "orange");
      } catch (e) {}
    }

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
      if (!cached) showError(`Sync Failed: ${err.message}`);
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
    
    allTemplates = flattened;
    const categories = [...new Set(data.map(d => d.category))].filter(Boolean);
    localStorage.setItem('blastchat_templates', JSON.stringify({ allTemplates, categories }));
    renderUI(categories);
    updateStatus("Matrix Synced", "orange");
  }

  function renderUI(categories) {
    renderShortcuts();
    renderCategoryDropdown(categories);
    filterTemplates();
  }

  function renderShortcuts() {
    const area = document.getElementById('shortcuts-row');
    if (!area) return;
    area.innerHTML = '';

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
    // Keep the "ALL" option
    categorySelect.innerHTML = '<option value="ALL">All Categories</option>';
    
    categories.sort().forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      // Clean up category name for dropdown
      option.textContent = cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').split(' — ')[0].trim();
      if (activeCategory === cat) option.selected = true;
      categorySelect.appendChild(option);
    });
  }

  function filterTemplates() {
    if (window.aiTimeout) clearTimeout(window.aiTimeout);
    const q = searchInput?.value.toLowerCase().trim() || '';
    let filtered = allTemplates;

    // Use Shortcut Mapping if active
    if (activeShortcut) {
      const queryStr = SHORTCUT_MAPPING[activeShortcut].toLowerCase();
      const keywords = queryStr.split(' ');
      
      filtered = filtered.filter(t => {
        return keywords.every(kw => 
          t.category.toLowerCase().includes(kw) || 
          t.title.toLowerCase().includes(kw) || 
          t.triggers.some(tr => tr.toLowerCase().includes(kw)) ||
          t.responses.some(r => r.text.toLowerCase().includes(kw))
        );
      });
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

    // AI fetch integration
    if (q && q.length > 5) {
      window.aiTimeout = setTimeout(async () => {
        try {
          updateStatus("AI Analyzing...", "orange");
          const response = await fetch('http://localhost:5000/api/agent-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queryText: q })
          });
          if (response.ok) {
            const aiData = await response.json();
            if (aiData) {
              renderAITemplate(aiData);
              updateStatus("AI Enhanced", "orange");
            } else {
              throw new Error("Empty AI response");
            }
          } else {
            throw new Error(`Server returned ${response.status}`);
          }
        } catch (e) {
          console.warn("Express backend search offline or failed, falling back to local NLP...", e);
          const localAiData = analyzeClientMessageLocal(q, allTemplates);
          renderAITemplate(localAiData);
          updateStatus("Local AI Active", "orange");
        }
      }, 500);
    }
  }

  function renderAITemplate(aiData) {
    if (!container) return;
    
    // Remove existing AI card if any
    const existingAi = container.querySelectorAll('.ai-card');
    existingAi.forEach(el => el.remove());

    const fragment = document.createDocumentFragment();

    // 1. Synthesized Response
    if (aiData.aiSuggestion) {
      const aiCard = document.createElement('div');
      aiCard.className = 'matrix-card ai-card';
      aiCard.style.border = '1px solid var(--orange)';
      aiCard.style.boxShadow = '0 0 15px rgba(255,102,0,0.1)';
      
      aiCard.innerHTML = `
        <div class="card-header"></div>
        <div class="card-meta">
          <div class="card-number" style="font-family: var(--mono); font-size: 10px; font-weight: 800; color: var(--orange); opacity: 0.6; letter-spacing: 0.05em;">⚡ GEMINI_SYNTHESIS</div>
          <div style="font-family: var(--mono); font-size: 8px; font-weight: 900; color: var(--orange); text-transform: uppercase; letter-spacing: 0.1em;">${aiData.emotion ? aiData.emotion.label : 'Cloud'}</div>
        </div>
        <div class="card-title" style="font-family: var(--mono); color: var(--orange);">✨ AI Synthesized Response</div>
        <div class="card-body">
          <div class="response-text" style="font-weight: 600;">${highlightText(aiData.aiSuggestion)}</div>
          <button class="copy-btn ai-copy-btn" style="background: rgba(255,102,0,0.1); border-color: var(--orange); color: var(--orange);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
            Inject AI Logic
          </button>
        </div>
      `;

      aiCard.querySelector('.ai-copy-btn').addEventListener('click', () => {
        injectText(aiData.aiSuggestion);
      });

      aiCard.querySelector('.response-text').addEventListener('click', () => {
        navigator.clipboard.writeText(aiData.aiSuggestion).then(() => {
          updateStatus("AI Copied to Clipboard", "orange");
          setTimeout(() => updateStatus("Ready", "orange"), 2000);
        });
      });
      
      fragment.appendChild(aiCard);
    }

    // 2. Alternative Matches
    if (aiData.matches && aiData.matches.length > 0) {
      aiData.matches.forEach((match, idx) => {
        const tone = aiData.suggestedTone;
        const resp = match.item?.responses?.find(r => r.type === (tone === 'highEmpathy' ? 'High Empathy' : 'Standard')) || match.item?.responses?.[0] || { text: '' };
        if (!resp.text) return;
        
        const matchCard = document.createElement('div');
        matchCard.className = 'matrix-card ai-card';
        matchCard.style.border = '1px dashed rgba(255,102,0,0.4)';
        
        matchCard.innerHTML = `
          <div class="card-header"></div>
          <div class="card-meta">
            <div class="card-number" style="font-family: var(--mono); font-size: 10px; font-weight: 800; color: var(--orange); opacity: 0.6; letter-spacing: 0.05em;">AI_ALT_${(idx + 1).toString().padStart(3, '0')}</div>
            <div style="font-family: var(--mono); font-size: 8px; font-weight: 900; color: var(--orange); text-transform: uppercase; letter-spacing: 0.1em;">Match: ${match.confidence || 'High'}</div>
          </div>
          <div class="card-title" style="font-family: var(--mono); color: rgba(255,102,0,0.8);">${match.item?.title || 'Alternative Option'}</div>
          <div class="card-body">
            <div class="response-text">${highlightText(resp.text)}</div>
            <button class="copy-btn ai-copy-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7"/>
              </svg>
              Inject Alternative
            </button>
          </div>
        `;

        matchCard.querySelector('.ai-copy-btn').addEventListener('click', () => {
          injectText(resp.text);
        });

        matchCard.querySelector('.response-text').addEventListener('click', () => {
          navigator.clipboard.writeText(resp.text).then(() => {
            updateStatus("AI Copied to Clipboard", "orange");
            setTimeout(() => updateStatus("Ready", "orange"), 2000);
          });
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

  function renderTemplates(templates) {
    if (!container) return;
    container.innerHTML = '';
    
    if (templates.length === 0) {
      container.innerHTML = '<div class="empty-state">No matching intelligence found</div>';
      return;
    }

    templates.forEach((t, idx) => {
      const card = document.createElement('div');
      card.className = 'matrix-card';
      
      const majorCat = t.category.split(' — ')[0].trim();
      const responseText = t.responses[0]?.text || "No intelligence found for this module.";

      card.innerHTML = `
        <div class="card-header"></div>
        <div class="card-meta">
          <div class="card-number" style="font-family: var(--mono); font-size: 10px; font-weight: 800; color: var(--orange); opacity: 0.6; letter-spacing: 0.05em;">INTEL_REF_${(idx + 1).toString().padStart(3, '0')}</div>
          <div style="font-family: var(--mono); font-size: 8px; font-weight: 900; color: var(--orange); text-transform: uppercase; letter-spacing: 0.1em;">${majorCat}</div>
        </div>
        <div class="card-title" style="font-family: var(--mono);">${t.title}</div>
        <div class="card-body">
          <div class="response-text">${highlightText(responseText)}</div>
          <button class="copy-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
            Inject Logic
          </button>
        </div>
      `;

      card.querySelector('.copy-btn').addEventListener('click', () => {
        injectText(responseText);
      });

      card.querySelector('.response-text').addEventListener('click', () => {
        navigator.clipboard.writeText(responseText).then(() => {
          updateStatus("Copied to Clipboard", "orange");
          setTimeout(() => updateStatus("Ready", "orange"), 2000);
        });
      });

      container.appendChild(card);
    });
  }

  function highlightText(text) {
    if (!text) return '';

    const categories = {
      danger: ['Referral Violation', 'Deleted Message', 'Lost', 'Rolled back'],
      success: ['Submitted', 'Cashback', 'Referral Bonus'],
      info: ['Deposit', 'Withdrawal', 'bet ID', 'Mpesa'],
      data: ['Phone number', 'Account Number', 'registered phone number']
    };

    const allKeywords = Object.values(categories).flat();
    const pattern = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|${allKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    return text.split(pattern).map(part => {
      if (!part) return '';
      
      const isPlaceholder = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
      if (isPlaceholder) return `<span class="var-highlight">${part}</span>`;

      const k = part.toLowerCase();
      if (categories.danger.some(v => v.toLowerCase() === k)) return `<span class="danger-highlight">${part}</span>`;
      if (categories.success.some(v => v.toLowerCase() === k)) return `<span class="success-highlight">${part}</span>`;
      if (categories.info.some(v => v.toLowerCase() === k)) return `<span class="info-highlight">${part}</span>`;
      if (categories.data.some(v => v.toLowerCase() === k)) return `<span class="data-highlight">${part}</span>`;

      return part;
    }).join('');
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
