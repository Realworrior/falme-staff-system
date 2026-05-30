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

// Maps each shortcut label to the EXACT local template IDs it should display
const SHORTCUT_MAPPING = {
  'failed deposit':  ['local-failed-deposit'],
  'airtel/bank':     ['local-airtel-bank'],
  'account number':  ['local-account-number'],
  'case submitted':  ['local-case-submitted'],
  'lost amount':     ['local-lost-amount-1', 'local-lost-amount-2'],
  'Not lost':        ['local-no-lost-amount'],
  'violation':       ['local-violation'],
  'reset':           ['local-reset-1', 'local-reset-2'],
  'Betslip':         ['local-betslip-1', 'local-betslip-2', 'local-betslip-3', 'local-betslip-4'],
  'Account closure': ['local-closure-1', 'local-closure-2', 'local-closure-3'],
  'cashback':        ['local-cashback-1', 'local-cashback-2', 'local-cashback-3', 'local-cashback-4', 'local-cashback-5']
};

const SHORTCUT_KEYWORDS = Object.keys(SHORTCUT_MAPPING);

const LOCAL_TEMPLATES = [
  {
    "id": "local-failed-deposit",
    "category": "💰 DEPOSITS — M-PESA",
    "title": "Failed Deposit — M-PESA Code Required",
    "responses": [
      {
        "text": "If your deposit was unsuccessful, please share the full M-PESA transaction message as text or send the 10-character transaction code from the SMS. Example: UA58134GTJ · Mini-statement codes are not accepted. Please do not send a screenshot — share the message as text.",
        "type": "Standard"
      },
      {
        "text": "We understand this can be frustrating 🙏 Kindly send the full M-PESA confirmation message as text or the 10-character transaction code from the SMS so we can assist quickly. Mini-statements are not accepted and screenshots are not required.",
        "type": "High Empathy"
      },
      {
        "text": "Share M-PESA code (e.g. UA58134GTJ) or full SMS text. Screenshots not needed. Mini-statement codes not accepted.",
        "type": "Alt Fast"
      }
    ],
    "triggers": [
      "failed deposit",
      "mpesa code",
      "transaction message",
      "10-character",
      "UA58134GTJ",
      "code",
      "deposited",
      "reflect",
      "reflecting",
      "not showing",
      "not reflected",
      "my money",
      "funds",
      "kindly assist",
      "assist",
      "money"
    ]
  },
  {
    "id": "local-airtel-bank",
    "category": "💰 DEPOSITS — M-PESA",
    "title": "Airtel or Bank Deposit — Not Supported",
    "responses": [
      {
        "text": "Betfalme currently supports M-PESA only. Please contact your service provider to request a reversal, then deposit using M-PESA.",
        "type": "Standard"
      },
      {
        "text": "We understand the inconvenience 🙏 At the moment we only support M-PESA deposits. Kindly request a reversal from your provider and deposit again using M-PESA.",
        "type": "High Empathy"
      },
      {
        "text": "After the reversal is processed, you can deposit via M-PESA. Or share a Safaricom number for transfer if needed. We'll assist once confirmed.",
        "type": "Alt Solution"
      }
    ],
    "triggers": [
      "airtel",
      "bank deposit",
      "not supported",
      "reversal"
    ]
  },
  {
    "id": "local-account-number",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Account Verification Request",
    "responses": [
      {
        "text": "Kindly share your registered phone number so we can verify your account and assist you.",
        "type": "Standard"
      },
      {
        "text": "We're happy to help 🙂 Please share your registered phone number so we can verify your account and assist faster.",
        "type": "High Empathy"
      },
      {
        "text": "To verify your account, kindly share your registered phone number and confirm the name used at registration. This helps us locate and assist you quickly.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "verify",
      "verification",
      "registered phone",
      "confirm name"
    ]
  },
  {
    "id": "local-case-submitted",
    "category": "⏳ CLIENT PATIENCE / UNDER REVIEW",
    "title": "Case Submitted to Technical Team",
    "responses": [
      {
        "text": "Your issue has been submitted to our Technical Team for review. We will update you once we receive feedback. Thank you for your patience.",
        "type": "Standard"
      },
      {
        "text": "Your request has been received and is now under technical review 🔄 We'll update you once completed.",
        "type": "Alt 1"
      },
      {
        "text": "Your issue has been escalated and is currently being processed. We'll update you soon.",
        "type": "Alt 2"
      },
      {
        "text": "Your request is already in progress with our Technical Team. We'll notify you once done.",
        "type": "Alt 3"
      },
      {
        "text": "We've forwarded your case for review. Feedback will be shared once available.",
        "type": "Alt 4"
      },
      {
        "text": "We understand waiting can be stressful. Your issue is under review and we will update you as soon as possible. Thank you for your patience 🙏",
        "type": "High Empathy 1"
      },
      {
        "text": "We understand the wait 🙏 Your case is being actively handled. We'll update you shortly.",
        "type": "High Empathy 2"
      },
      {
        "text": "We know this is important 🙏 Your issue is already under review.",
        "type": "High Empathy 3"
      },
      {
        "text": "We appreciate your patience 🙏 The team is working on your request.",
        "type": "High Empathy 4"
      }
    ],
    "triggers": [
      "review",
      "check",
      "technical",
      "wait",
      "pending",
      "status",
      "feedback"
    ]
  },
  {
    "id": "local-lost-amount-1",
    "category": "🎰 CASINO GAMES",
    "title": "Lost Amount Report — Aviator, Jet X, Crash Games",
    "responses": [
      {
        "text": "Please provide your phone number, game played, the exact amount lost, and the exact time of each round. Do not combine amounts. Each round must be shared separately.",
        "type": "Standard"
      },
      {
        "text": "We understand how concerning this is 🙏 Kindly share your phone number, the exact amount lost, and the exact time for each round separately. Please do not sum the amounts so we can check accurately.",
        "type": "High Empathy"
      },
      {
        "text": "To trace your rounds accurately 🔍 please send: phone number ✦ game name ✦ exact amount per round ✦ exact time per round. Please list each round one by one.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "lost amount",
      "lost money",
      "aviator lost",
      "crash lost",
      "round",
      "separately"
    ]
  },
  {
    "id": "local-lost-amount-2",
    "category": "🎰 CASINO GAMES",
    "title": "Pending Cashout — Crash / Aviator",
    "responses": [
      {
        "text": "Please share a screenshot of the specific game showing the bet, the exact time of the round, and your registered phone number.",
        "type": "Standard"
      },
      {
        "text": "We understand this can be worrying 🙏 Kindly send the game screenshot, include the exact time of the round and your phone number so we can assist quickly.",
        "type": "High Empathy"
      },
      {
        "text": "To check your pending cashout, please send a screenshot of the round, your registered number, and the exact time the round occurred.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "pending cashout",
      "aviator cashout",
      "crash cashout",
      "screenshot",
      "worrying"
    ]
  },
  {
    "id": "local-no-lost-amount",
    "category": "⏳ CLIENT PATIENCE / UNDER REVIEW",
    "title": "No Lost Amount — All Transactions Correct",
    "responses": [
      {
        "text": "After reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please take a moment to check your account activity.",
        "type": "Standard"
      },
      {
        "text": "We understand your concern and appreciate your patience 🙏 After carefully reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please check your account activity. If you still notice anything unusual, let us know so we can assist further.",
        "type": "High Empathy"
      },
      {
        "text": "We've completed a full review 🔍 All transactions on your account show as correct and no funds are missing. If you still have concerns, kindly share the specific time and amount so we can double-check.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "no loss",
      "missing",
      "correct",
      "review",
      "activity"
    ]
  },
  {
    "id": "local-violation",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Referral Violation — Multiple Accounts Detected",
    "responses": [
      {
        "text": "Following a review of your account activity, we have found that our referral terms were violated due to the creation of multiple accounts under the same identity to obtain the KSh 10 referral bonus. Based on internal checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, the account will need to be reset, which will clear all current funds. Kindly confirm if you agree to proceed with the account reset.",
        "type": "Standard"
      },
      {
        "text": "We understand this may be disappointing 🙏 After reviewing your account activity, our system detected a violation of the referral terms due to multiple accounts being created under the same identity to claim the KSh 10 bonus. Based on checks including device verification, connection history, referral behaviour, and location data, withdrawals have been restricted. To restore access, the account will need to be reset, which clears the current funds. Please confirm if you would like us to proceed with the reset.",
        "type": "High Empathy"
      },
      {
        "text": "As previously advised, withdrawals remain restricted due to a confirmed referral policy violation. To restore access, an account reset is required. Please confirm your decision so we can proceed accordingly.",
        "type": "Final Notice"
      }
    ],
    "triggers": [
      "multiple accounts",
      "referral violation",
      "bonus abuse",
      "restriction",
      "reset",
      "identity"
    ]
  },
  {
    "id": "local-reset-1",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Suspicious Reset Request — Technical Limitation",
    "responses": [
      {
        "text": "We are currently experiencing a technical limitation affecting the account reset option. As an alternative, you may create a new account. Please ensure all future activity follows our platform policies and referral rules.",
        "type": "Standard"
      },
      {
        "text": "We understand the inconvenience this may cause 🙏 At the moment, the account reset option is temporarily unavailable due to a technical limitation. You may create a new account instead, and we kindly ask that all future activity follows our platform and referral policies.",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "reset unavailable",
      "technical limitation",
      "cannot reset",
      "new account",
      "limitation"
    ]
  },
  {
    "id": "local-reset-2",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Account Reset Confirmation",
    "responses": [
      {
        "text": "Your account has been successfully reset. You can now log in and continue using your account. Please ensure all future activity follows our referral and platform policies.",
        "type": "Standard"
      },
      {
        "text": "Your account has now been successfully reset 🙂 You can log in and continue using your account. Please ensure future activity follows our referral and platform rules to avoid any further restrictions. If you need help, we're here to assist.",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "reset complete",
      "account reset",
      "successful reset",
      "restored"
    ]
  },
  {
    "id": "local-betslip-1",
    "category": "⚽ SPORTS BETTING",
    "title": "Unpaid Winning Bet",
    "responses": [
      {
        "text": "Please share a screenshot of the betslip, the Bet ID (for example #678534), and your registered phone number so we can assist.",
        "type": "Standard"
      },
      {
        "text": "We understand your concern 🙏 Kindly send the betslip screenshot, Bet ID, and your registered phone number so we can check quickly.",
        "type": "High Empathy"
      },
      {
        "text": "We'll look into this right away 🔍 Please send your Bet ID (e.g. #678534), betslip screenshot, and registered number.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "winning bet",
      "not paid",
      "unpaid",
      "won",
      "won bet",
      "bet id"
    ]
  },
  {
    "id": "local-betslip-2",
    "category": "⚽ SPORTS BETTING",
    "title": "Cash Out Not Processed",
    "responses": [
      {
        "text": "Please share the Bet ID, the exact time you attempted the cash out, and your registered phone number so we can investigate.",
        "type": "Standard"
      },
      {
        "text": "We understand this is frustrating 🙏 Cash out requests are time-sensitive. Kindly send the Bet ID, exact time, and your phone number so we can review what happened.",
        "type": "High Empathy"
      },
      {
        "text": "Please note that cash out may be unavailable during live odds fluctuations or high traffic. If your cash out failed, share your Bet ID and time so we can check.",
        "type": "System Note"
      }
    ],
    "triggers": [
      "cash out",
      "cashout failed",
      "not processed",
      "attempted",
      "fluctuations"
    ]
  },
  {
    "id": "local-betslip-3",
    "category": "⚽ SPORTS BETTING",
    "title": "Bet Not Accepted / Rejected",
    "responses": [
      {
        "text": "Please share a screenshot of the error message and your registered phone number so we can check why the bet was not accepted.",
        "type": "Standard"
      },
      {
        "text": "We're sorry that happened 🙏 Bets can be declined due to odds changes, stake limits, or market closure. Kindly share the error screenshot and your number so we can assist.",
        "type": "High Empathy"
      },
      {
        "text": "Bets may be declined because the market closed before submission · odds shifted during loading · or the stake exceeds the allowed limit for that market. If the issue persists, share a screenshot and we'll investigate.",
        "type": "Common Reasons"
      }
    ],
    "triggers": [
      "rejected",
      "not accepted",
      "error message",
      "declined",
      "limit"
    ]
  },
  {
    "id": "local-betslip-4",
    "category": "⚽ SPORTS BETTING",
    "title": "Pending Betslip — Postponed Game",
    "responses": [
      {
        "text": "Postponed games are settled within 24 hours after the scheduled match time. Your betslip will update automatically.",
        "type": "Standard"
      },
      {
        "text": "We understand the wait can be frustrating 🙏 Postponed games are processed within 24 hours after the scheduled match time. Your betslip will update on its own. No action needed.",
        "type": "High Empathy"
      },
      {
        "text": "No need to worry 🙂 Postponed match betslips settle automatically within 24 hours of the original match time.",
        "type": "Alt"
      }
    ],
    "triggers": [
      "postponed",
      "cancelled match",
      "not played",
      "match time",
      "settled",
      "betslip"
    ]
  },
  {
    "id": "local-closure-1",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Account Closure / Self-Exclusion",
    "responses": [
      {
        "text": "To delete your account, please visit betfalme.ke/delete-account ✦ Once there: go to Profile ✦ click DELETE Account ✦ select Period of Exclusion ✦ click Continue To Delete Account ✦ type DELETE to confirm (no spaces) ✦ then confirm deletion. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "Standard"
      },
      {
        "text": "We're sorry to see you go 🙏 To delete your account, please visit betfalme.ke/delete-account ✦ Follow the steps: Profile ✦ DELETE Account ✦ select your exclusion period ✦ Continue ✦ type DELETE to confirm ✦ then confirm. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "permanently close",
      "delete my account",
      "close account",
      "closure steps",
      "deactivate"
    ]
  },
  {
    "id": "local-closure-2",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Account Closure / Self-Exclusion",
    "responses": [
      {
        "text": "To delete your account, please visit betfalme.ke/delete-account ✦ Once there: go to Profile ✦ click DELETE Account ✦ select Period of Exclusion ✦ click Continue To Delete Account ✦ type DELETE to confirm (no spaces) ✦ then confirm deletion. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "Standard"
      },
      {
        "text": "We're sorry to see you go 🙏 To delete your account, please visit betfalme.ke/delete-account ✦ Follow the steps: Profile ✦ DELETE Account ✦ select your exclusion period ✦ Continue ✦ type DELETE to confirm ✦ then confirm. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "permanently close",
      "delete my account",
      "close account",
      "closure steps",
      "deactivate"
    ]
  },
  {
    "id": "local-closure-3",
    "category": "👤 ACCOUNT MANAGEMENT",
    "title": "Account Closure / Self-Exclusion",
    "responses": [
      {
        "text": "To delete your account, please visit betfalme.ke/delete-account ✦ Once there: go to Profile ✦ click DELETE Account ✦ select Period of Exclusion ✦ click Continue To Delete Account ✦ type DELETE to confirm (no spaces) ✦ then confirm deletion. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "Standard"
      },
      {
        "text": "We're sorry to see you go 🙏 To delete your account, please visit betfalme.ke/delete-account ✦ Follow the steps: Profile ✦ DELETE Account ✦ select your exclusion period ✦ Continue ✦ type DELETE to confirm ✦ then confirm. After confirming deletion, it's recommended to avoid depositing or requesting OTP for at least 48 hours. Otherwise, the process will be undone",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "permanently close",
      "delete my account",
      "close account",
      "closure steps",
      "deactivate"
    ]
  },
  {
    "id": "local-cashback-1",
    "category": "🔄 CASHBACK — 10%",
    "title": "How to Calculate Cashback",
    "responses": [
      {
        "text": "Cashback is 10% of the difference between total deposits and total withdrawals made from yesterday 8:35 PM to today 8:35 PM. For example: Deposit KSh 1,000 ✦ Withdraw KSh 600 ✦ Loss = KSh 400 ✦ Cashback = KSh 40.",
        "type": "Standard"
      },
      {
        "text": "To calculate 🙂 subtract withdrawals from deposits between 8:35 PM yesterday and 8:35 PM today. If there is a loss, 10% of that amount is credited at 8:35 PM.",
        "type": "High Empathy"
      },
      {
        "text": "Formula: Deposits minus Withdrawals = Net loss. 10% of net loss = Cashback. Example: 1000 minus 600 = 400. 400 × 10% = KSh 40 cashback 🙂",
        "type": "Simple Formula"
      }
    ],
    "triggers": [
      "how to calculate",
      "formula",
      "subtract",
      "example"
    ]
  },
  {
    "id": "local-cashback-2",
    "category": "🔄 CASHBACK — 10%",
    "title": "Will I Get Cashback Today",
    "responses": [
      {
        "text": "You will receive cashback today at 8:35 PM if: deposits were made between yesterday 9:00 PM and today 8:35 PM ✦ withdrawals are less than deposits ✦ your account shows a net loss.",
        "type": "Standard"
      },
      {
        "text": "If you meet the conditions and recorded a net loss 🙂 cashback will reflect automatically at 8:35 PM. No action needed!",
        "type": "High Empathy"
      },
      {
        "text": "Check at 8:35 PM. If deposits are greater than withdrawals, cashback is guaranteed. If not, none will be issued.",
        "type": "Alt Fast"
      }
    ],
    "triggers": [
      "get cashback today",
      "guaranteed",
      "conditions"
    ]
  },
  {
    "id": "local-cashback-3",
    "category": "🔄 CASHBACK — 10%",
    "title": "Daily Cashback Reset Window",
    "responses": [
      {
        "text": "Our daily cashback calculation includes a 10-minute system reset window between 8:30 PM and 8:40 PM. Please note that any deposits made within this specific window are not captured in the current 24-hour cycle to prevent synchronization errors during the daily reset.",
        "type": "Standard"
      },
      {
        "text": "I'd like to clarify our cashback timing for you! Our system performs a daily reset between 8:30 PM and 8:40 PM. Because of this, any deposits made in those 10 minutes aren't always counted in the immediate 24-hour cycle as the system refreshes. We appreciate your patience while we ensure everything is processed accurately!",
        "type": "High Empathy"
      }
    ],
    "triggers": [
      "cashback",
      "not counted",
      "time",
      "reset",
      "calculation",
      "window",
      "8:30",
      "8.30"
    ]
  },
  {
    "id": "local-cashback-4",
    "category": "🔄 CASHBACK — 10%",
    "title": "Where Is My Cashback",
    "responses": [
      {
        "text": "Cashback is automatically calculated and credited for eligible customers who record a net loss during the cashback period. Cashback is processed daily at 8:35 PM. If it has not reflected yet, please wait until after 8:35 PM.",
        "type": "Standard"
      },
      {
        "text": "We understand the concern 🙏 Cashback is processed daily at 8:35 PM. If eligible, it will reflect automatically after that time.",
        "type": "High Empathy"
      },
      {
        "text": "Cashback is not instant. It is calculated and credited once daily at 8:35 PM. If you're eligible, it will appear automatically. No manual request is needed.",
        "type": "Alt Angry"
      }
    ],
    "triggers": [
      "where is cashback",
      "cashback not received",
      "8:35 PM",
      "calculate"
    ]
  },
  {
    "id": "local-cashback-5",
    "category": "🔄 CASHBACK — 10%",
    "title": "Cashback Not Received — Conditions Not Met",
    "responses": [
      {
        "text": "Cashback is credited only if you made deposits and your total withdrawals are less than your total deposits during the cashback period, resulting in a net loss. If withdrawals are equal to or higher than deposits, no cashback is generated.",
        "type": "Standard"
      },
      {
        "text": "Cashback is given only when deposits are higher than withdrawals within the cashback period 🙂 If there is no net loss, cashback will not be generated. This is calculated automatically by the system.",
        "type": "High Empathy"
      },
      {
        "text": "System calculates automatically. If deposits do not exceed withdrawals, no cashback is issued. No net loss = no cashback.",
        "type": "Alt Firm"
      }
    ],
    "triggers": [
      "no cashback",
      "not met",
      "net loss",
      "withdrawals deposits"
    ]
  }
];



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
    
    // Always merge local templates to guarantee they are present
    const flattenedIds = new Set(flattened.map(t => t.id));
    const uniqueLocals = LOCAL_TEMPLATES.filter(t => !flattenedIds.has(t.id));
    allTemplates = [...flattened, ...uniqueLocals];
    
    const categories = [...new Set(allTemplates.map(t => t.category))].filter(Boolean);
    localStorage.setItem('blastchat_templates', JSON.stringify({ allTemplates, categories }));
    renderUI(categories);
    updateStatus("Matrix Synced", "orange");
  }

  function renderUI(categories) {
    renderShortcuts();
    renderCategoryDropdown(categories);
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
      const ids = new Set(SHORTCUT_MAPPING[activeShortcut] || []);
      filtered = filtered.filter(t => ids.has(t.id));
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
    } else {
      // AI fetch integration
      if (q && q.length > 0) {
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

    const header = document.createElement('div');
    header.className = 'card-header';
    card.appendChild(header);

    const meta = document.createElement('div');
    meta.className = 'card-meta';

    const numDiv = document.createElement('div');
    numDiv.className = 'card-number';
    numDiv.style.fontFamily = 'var(--mono)';
    numDiv.style.fontSize = '10px';
    numDiv.style.fontWeight = '800';
    numDiv.style.color = 'var(--orange)';
    numDiv.style.opacity = '0.6';
    numDiv.style.letterSpacing = '0.05em';
    numDiv.textContent = cardNumber;
    meta.appendChild(numDiv);

    const metaTextDiv = document.createElement('div');
    metaTextDiv.style.fontFamily = 'var(--mono)';
    metaTextDiv.style.fontSize = '8px';
    metaTextDiv.style.fontWeight = '900';
    metaTextDiv.style.color = 'var(--orange)';
    metaTextDiv.style.textTransform = 'uppercase';
    metaTextDiv.style.letterSpacing = '0.1em';
    metaTextDiv.textContent = cardMetaText;
    meta.appendChild(metaTextDiv);

    card.appendChild(meta);

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    titleDiv.style.fontFamily = 'var(--mono)';
    for (const [k, v] of Object.entries(cardTitleStyle)) {
      titleDiv.style[k] = v;
    }
    titleDiv.textContent = cardTitle;
    card.appendChild(titleDiv);

    const body = document.createElement('div');
    body.className = 'card-body';

    const respDiv = document.createElement('div');
    respDiv.className = 'response-text';
    for (const [k, v] of Object.entries(responseTextStyle)) {
      respDiv.style[k] = v;
    }
    appendHighlightedText(respDiv, responseText);
    body.appendChild(respDiv);

    const btn = document.createElement('button');
    btn.className = buttonClass;
    for (const [k, v] of Object.entries(buttonStyle)) {
      btn.style[k] = v;
    }

    // Create SVG icon safely
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 12h14m-7-7 7 7-7 7');
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

    templates.forEach((t, idx) => {
      const responses = Array.isArray(t.responses) && t.responses.length > 0
        ? t.responses
        : [{ text: 'No intelligence found for this module.', type: 'Standard' }];

      // ── Outer card wrapper ──
      const card = document.createElement('div');
      card.className = 'matrix-card';

      // Card number + category meta
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

      // ── One body block per response variant ──
      responses.forEach((resp, rIdx) => {
        const variantWrap = document.createElement('div');
        variantWrap.className = 'card-body';
        variantWrap.style.cssText = rIdx > 0
          ? 'border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;margin-top:4px;'
          : '';

        // Variant label (e.g. "Standard", "High Empathy")
        const typeLabel = document.createElement('div');
        typeLabel.style.cssText = 'font-family:var(--mono);font-size:9px;font-weight:900;color:rgba(255,102,0,0.6);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;';
        typeLabel.textContent = `[${resp.type || 'Variant ' + (rIdx + 1)}]`;
        variantWrap.appendChild(typeLabel);

        // Response text
        const respDiv = document.createElement('div');
        respDiv.className = 'response-text';
        appendHighlightedText(respDiv, resp.text);
        variantWrap.appendChild(respDiv);

        // Inject button
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.style.marginTop = '8px';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14'); svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '3');
        svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M5 12h14m-7-7 7 7-7 7');
        svg.appendChild(path);
        btn.appendChild(svg);
        btn.appendChild(document.createTextNode(' Inject'));

        const textToInject = resp.text;
        btn.addEventListener('click', () => injectText(textToInject));
        respDiv.addEventListener('click', () => {
          navigator.clipboard.writeText(textToInject).then(() => {
            updateStatus('Copied to Clipboard', 'orange');
            setTimeout(() => updateStatus('Ready', 'orange'), 2000);
          });
        });

        variantWrap.appendChild(btn);
        card.appendChild(variantWrap);
      });

      container.appendChild(card);
    });
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
