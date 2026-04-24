export type EmotionType = 'angry' | 'urgent' | 'distress' | 'impatient' | 'neutral' | 'rg_risk';

export interface ResponseVariant {
  main: string;
  alts?: string[];
}

export interface ResponseItem {
  id: string;
  category: string;
  categoryShort: string;
  title: string;
  keywords: string[];
  emotions: EmotionType[];
  standard: ResponseVariant;
  highEmpathy?: ResponseVariant;
}

export const CATEGORIES = [
  'GREETINGS & CHAT FLOW',
  'CLIENT PATIENCE / UNDER REVIEW',
  'HARD CASE SYSTEM',
  'SPORTS BET',
  'CASINO GAMES',
  'ACCOUNT MANAGEMENT',
  'PROMOTIONS & REFERRALS',
  'WITHDRAWALS & TRANSACTIONS',
  'DEPOSITS - MPESA',
  'CASHBACK - 10%',
  'RESPONSIBLE GAMING',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'GREETINGS & CHAT FLOW': '👋',
  'CLIENT PATIENCE / UNDER REVIEW': '⏳',
  'HARD CASE SYSTEM': '🔒',
  'SPORTS BET': '⚽',
  'CASINO GAMES': '🎮',
  'ACCOUNT MANAGEMENT': '👤',
  'PROMOTIONS & REFERRALS': '🎁',
  'WITHDRAWALS & TRANSACTIONS': '💸',
  'DEPOSITS - MPESA': '📲',
  'CASHBACK - 10%': '💰',
  'RESPONSIBLE GAMING': '💚',
};

export const responsesData: ResponseItem[] = [
  // ─────────────────────────────────────────────────────────
  // GREETINGS & CHAT FLOW
  // ─────────────────────────────────────────────────────────
  {
    id: 'greet-hi',
    category: 'GREETINGS & CHAT FLOW',
    categoryShort: 'Greetings',
    title: 'Client Says Hi After Auto Greeting',
    keywords: ['hello', 'hi', 'hey', 'habari', 'hujambo', 'jambo', 'sema', 'nikusaidie', 'start', 'greeting'],
    emotions: ['neutral'],
    standard: {
      main: 'Hello again 🙂 How can we assist you today?',
      alts: [
        "Hello 🙂 You're now connected with support → please let us know what issue you're facing.",
        "Hi 🙂 We're ready to assist → what seems to be the problem today?",
        'Hello 🙂 Please go ahead and share your issue and we'll help you resolve it.',
        "Hi again 🙂 Tell us what you need help with and we'll take it from here.",
      ],
    },
    highEmpathy: {
      main: "Hi there 🙂 Please tell us how we can help and we'll sort it out for you.",
      alts: [
        "Hi 🙂 You're in the right place → just share the issue and we'll work through it together.",
        "Hello 🙂 Don't worry, we'll get this sorted → tell us what happened.",
        "Hi 🙂 We understand things can go wrong → let's fix this together.",
        "Hello 🙂 We're here with you → just explain the issue and we'll assist immediately.",
      ],
    },
  },
  {
    id: 'greet-vague',
    category: 'GREETINGS & CHAT FLOW',
    categoryShort: 'Greetings',
    title: 'Client Is Vague ("Help", "Problem")',
    keywords: ['help', 'problem', 'issue', 'something wrong', 'naomba msaada', 'nisaidie', 'tatizo', 'kuna tatizo', 'saidia'],
    emotions: ['neutral', 'impatient'],
    standard: {
      main: 'Hello! Please let us know the issue you\'re experiencing and include any relevant details such as your account number or transaction reference, if applicable.',
      alts: [
        'Hello 🙂 Kindly share your phone number, amount, and time so we can assist quickly.',
        'Hi 🙂 Please provide full details so we can locate your account and help without delay.',
        'Hello 🙂 Let us know what happened and include key details so we can resolve this faster.',
        'Hi 🙂 Please explain the issue and include your number or transaction info.',
      ],
    },
  },
  {
    id: 'greet-urgent',
    category: 'GREETINGS & CHAT FLOW',
    categoryShort: 'Greetings',
    title: 'Client Is Immediately Urgent ("Where is my money")',
    keywords: ['where is my money', 'where is my', 'wapi pesa', 'pesa yangu iko wapi', 'money urgent', 'urgent', 'haraka', 'sasa', 'mara moja'],
    emotions: ['urgent', 'impatient'],
    standard: {
      main: "We understand this is urgent 🙏 Your request has already been received and is currently being processed → please share your phone number, amount, and time so we can check immediately.",
      alts: [
        "We understand the urgency 🙏 Your transaction is already in progress → kindly send your number, amount, and time so we can prioritize this.",
        "We've received your request and it's under processing 🔄 Please share your details so we can update you right away.",
        "Your request is already being handled → kindly provide your number, amount, and time so we can assist faster.",
      ],
    },
  },
  {
    id: 'greet-insults',
    category: 'GREETINGS & CHAT FLOW',
    categoryShort: 'Greetings',
    title: 'Insults / Aggression',
    keywords: ['insult', 'rude', 'angry', 'abuse', 'stupid', 'useless', 'fraud', 'scam', 'thieves', 'mbwa', 'ujinga', 'mnaniiba', 'waizi', 'worst', 'terrible', 'pathetic'],
    emotions: ['angry'],
    standard: {
      main: 'We understand you may be frustrated. Please note that respectful communication helps us assist you better. Kindly explain the issue you are experiencing and we will do our best to help.',
      alts: [
        "We understand you're upset → kindly keep the conversation respectful so we can assist you effectively.",
        "We're here to help → please explain your issue clearly so we can resolve it.",
        "We understand frustration happens → let's focus on fixing the issue together.",
        "We're ready to assist → please communicate respectfully so we can help faster.",
      ],
    },
    highEmpathy: {
      main: 'We understand you may be upset and we truly want to help resolve your issue. We kindly ask that the conversation remains respectful so we can assist you effectively. Please let us know the problem you are facing.',
      alts: [
        "We hear you 🙏 Let's work through this together → please share your issue.",
        "We understand this is frustrating 🙏 We're here to help → just tell us what happened.",
        "We want to resolve this for you 🙏 Kindly share your issue and we'll assist.",
        "We're here to support you 🙏 Let's keep things respectful and get this fixed.",
      ],
    },
  },
  {
    id: 'greet-closing',
    category: 'GREETINGS & CHAT FLOW',
    categoryShort: 'Greetings',
    title: 'Closing Statement',
    keywords: ['close', 'resolved', 'done', 'fixed', 'thank you', 'asante', 'goodbye', 'closing', 'all set'],
    emotions: ['neutral'],
    standard: {
      main: "Thank you for choosing Betfalme. We're glad your issue has been resolved. If you need any further assistance, feel free to reach out anytime. You're always welcome.",
      alts: [
        "Thank you for choosing Betfalme 🙂 Your issue has been resolved → feel free to reach out anytime.",
        "All set 🙂 We're glad this is sorted → let us know if you need anything else.",
        "Your account is now in order 🙂 You can continue normally → we're here if needed.",
        "Thanks for reaching out 🙂 Everything is resolved → feel free to contact us anytime.",
      ],
    },
    highEmpathy: {
      main: "Thank you for your patience and for choosing Betfalme 🙏 We're happy the issue has been resolved. If you need anything else, please don't hesitate to contact us. You're always welcome back.",
      alts: [
        "We appreciate your patience 🙏 Glad we could resolve this → we're always here for you.",
        "Thank you for working with us 🙏 Everything is now sorted → reach out anytime.",
        "We're happy this is resolved 🙂 You're always welcome back.",
        "Thanks for your patience 🙏 We're here anytime you need support.",
      ],
    },
  },

  // ─────────────────────────────────────────────────────────
  // CLIENT PATIENCE / UNDER REVIEW
  // ─────────────────────────────────────────────────────────
  {
    id: 'review-submitted',
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    categoryShort: 'Under Review',
    title: 'Case Submitted to Technical Team',
    keywords: ['submitted', 'escalated', 'technical team', 'review', 'under review', 'processing', 'check', 'waiting', 'inangojwa'],
    emotions: ['impatient', 'urgent', 'neutral'],
    standard: {
      main: 'Your issue has been submitted to our Technical Team for review. We will update you once we receive feedback. Thank you for your patience.',
      alts: [
        'Your request has been received and is now under technical review 🔄 We\'ll update you once completed.',
        'Your issue has been escalated and is currently being processed → we\'ll update you soon.',
        'Your request is already in progress with our Technical Team → we\'ll notify you once done.',
        "We've forwarded your case for review → feedback will be shared once available.",
      ],
    },
    highEmpathy: {
      main: 'We understand waiting can be stressful. Your issue is under review and we will update you as soon as possible. Thank you for your patience 🙏',
      alts: [
        "We understand the wait 🙏 Your case is being actively handled → we'll update you shortly.",
        "We know this is important 🙏 Your issue is already under review.",
        "We appreciate your patience 🙏 The team is working on your request.",
        "We understand delays can be frustrating 🙏 Your request is being processed.",
      ],
    },
  },
  {
    id: 'review-queue',
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    categoryShort: 'Under Review',
    title: 'Ticket Still in Queue',
    keywords: ['queue', 'ticket', 'still waiting', 'not yet', 'bado', 'when will', 'mpaka lini', 'how long'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Your ticket is still in the queue and has not yet been attended to. We appreciate your patience.',
      alts: [
        "Your case is in the queue → it will be attended to shortly.",
        "We're still processing your request → we appreciate your patience.",
      ],
    },
    highEmpathy: {
      main: 'Your ticket is still waiting to be reviewed. We truly appreciate your patience 🙏',
      alts: [
        "We understand the wait 🙏 Your ticket will be reviewed shortly.",
        "We truly value your patience 🙏 Your case is next in line.",
      ],
    },
  },
  {
    id: 'review-rollback',
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    categoryShort: 'Under Review',
    title: 'Roll Back / Funds Returned',
    keywords: ['rollback', 'roll back', 'returned', 'credited back', 'restored', 'refunded', 'funds back', 'pesa imerudishwa'],
    emotions: ['neutral', 'urgent'],
    standard: {
      main: 'The amount has now been rolled back to your account. Please refresh your account and confirm that your balance has updated.',
      alts: [
        'The funds have been returned → please refresh and confirm your balance.',
        'Your account has been updated → kindly check your balance.',
        'The amount has been credited back → refresh and confirm.',
        'Funds are now restored → please check your account.',
      ],
    },
    highEmpathy: {
      main: 'Good news 🎉 The amount has been successfully rolled back to your account. Kindly refresh your account and confirm that your balance has updated. Let us know if everything reflects correctly.',
      alts: [
        "Great news 🙂 Your funds are back → please refresh and confirm.",
        "Good news 🙂 Issue resolved → kindly check your balance.",
        "We're glad to confirm 🙂 funds have been returned → please verify.",
        "All sorted 🙂 Please refresh and confirm everything reflects.",
      ],
    },
  },
  {
    id: 'review-noloss',
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    categoryShort: 'Under Review',
    title: 'No Lost Amount (After Review)',
    keywords: ['no loss', 'no funds lost', 'transactions correct', 'verified', 'confirmed', 'nothing missing', 'all correct', 'hakuna pesa iliyopotea'],
    emotions: ['neutral', 'angry', 'urgent'],
    standard: {
      main: 'After reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please take a moment to check your account activity.',
    },
    highEmpathy: {
      main: 'We understand your concern and appreciate your patience 🙏 After carefully reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please check your account activity, and if you still notice anything unusual, let us know so we can assist further.',
    },
  },

  // ─────────────────────────────────────────────────────────
  // HARD CASE SYSTEM
  // ─────────────────────────────────────────────────────────
  {
    id: 'hard-refund',
    category: 'HARD CASE SYSTEM',
    categoryShort: 'Hard Case',
    title: 'Refund Refusal (No Loophole)',
    keywords: ['refund', 'give me back', 'nirudishie', 'nimepoteza pesa', 'give back my money', 'return my money', 'demand refund', 'not fair', 'unfair', 'cheat'],
    emotions: ['angry', 'urgent'],
    standard: {
      main: 'We understand your request. However, based on verified system records and transaction logs, the process was completed correctly and cannot be reversed.',
      alts: [
        'After full review, the transaction was processed successfully in line with platform rules. Refunds are not applicable.',
        'We understand your concern. However, all activity was recorded correctly and the outcome remains final.',
        'The review has been completed using system logs and timestamps. Based on this, the decision cannot be changed.',
      ],
    },
    highEmpathy: {
      main: 'We fully understand how frustrating this situation must feel 🙏 However, after a thorough review of your account using verified system records and transaction logs, we can confirm the process was completed correctly and cannot be reversed.',
      alts: [
        'We hear your concern and take it seriously 🙏 After complete review, the transaction aligns with platform rules. We regret that a refund is not applicable in this case.',
      ],
    },
  },
  {
    id: 'hard-loop',
    category: 'HARD CASE SYSTEM',
    categoryShort: 'Hard Case',
    title: 'Persistent Argument / Loop Breaker',
    keywords: ['not accepting', 'still not happy', 'escalate', 'not satisfied', 'keep arguing', 'want manager', 'speak to supervisor', 'this is wrong', 'i disagree'],
    emotions: ['angry', 'impatient'],
    standard: {
      main: "We've shared the findings based on system data. If you have new details, we can review again.",
      alts: [
        'At this stage, the outcome remains final based on verified records.',
        "We understand your position. However, the decision is based on system logs and cannot be changed.",
        'All available data has been reviewed. The result remains unchanged.',
      ],
    },
  },

  // ─────────────────────────────────────────────────────────
  // SPORTS BET
  // ─────────────────────────────────────────────────────────
  {
    id: 'sports-postponed',
    category: 'SPORTS BET',
    categoryShort: 'Sports Bet',
    title: 'Pending Betslip – Postponed Game',
    keywords: ['postponed', 'pending bet', 'betslip pending', 'match postponed', 'game postponed', 'bet not settled', 'mechi imeahirishwa', 'bet inasubiri'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Postponed games are settled within 24 hours after the scheduled match time. Your betslip will update automatically.',
      alts: [
        "Your betslip is pending due to a postponed match → it will be settled within 24 hours.",
        "Postponed match settlements are processed automatically within 24 hours of the original match time.",
      ],
    },
    highEmpathy: {
      main: 'We understand the wait can be frustrating. Postponed games are processed within 24 hours after the scheduled match time.',
      alts: [
        "We know waiting is difficult 🙏 Your bet will settle automatically once the match is rescheduled and resolved.",
      ],
    },
  },
  {
    id: 'sports-unpaid',
    category: 'SPORTS BET',
    categoryShort: 'Sports Bet',
    title: 'Unpaid Winning Bet',
    keywords: ['won', 'winning', 'not paid', 'unpaid', 'win not credited', 'bet won', 'nimeshinda', 'pesa haikuja', 'winning bet', 'bet id'],
    emotions: ['urgent', 'impatient', 'angry'],
    standard: {
      main: 'Please share a screenshot of the betslip, the Bet ID (for example #678534), and your registered phone number so we can assist.',
      alts: [
        "Kindly provide your Bet ID, betslip screenshot, and phone number so we can investigate immediately.",
        "Please send your Bet ID, betslip image, and registered phone number for a quick check.",
      ],
    },
    highEmpathy: {
      main: 'We understand your concern. Kindly send the betslip screenshot, Bet ID, and your registered phone number so we can check quickly.',
      alts: [
        "We understand this is concerning 🙏 Please share your Bet ID and betslip screenshot so we can look into this right away.",
      ],
    },
  },
  {
    id: 'sports-voided',
    category: 'SPORTS BET',
    categoryShort: 'Sports Bet',
    title: 'Voided Bets',
    keywords: ['voided', 'void', 'cancelled bet', 'bet cancelled', 'bet removed', 'why cancelled', 'kwa nini bet imefutwa', 'bet imevoidwa'],
    emotions: ['angry', 'impatient', 'neutral'],
    standard: {
      main: "Dear Client, Following a detailed investigation conducted by our Technical and Risk Management teams, the review of the flagged bet slip has now been completed. Our analysis confirmed that the bet was placed after the respective match had already started. According to our betting rules and terms and conditions, all wagers must be placed before the official start time of the event unless the market is specifically offered as live (in-play) betting. Since the event had already commenced at the time the bet was accepted, the bet slip has been identified as irregular. As a result, the wager has been voided in accordance with our platform's policies and the applicable betting rules. This decision has been made based on the findings of our technical review and is considered final.",
    },
  },

  // ─────────────────────────────────────────────────────────
  // CASINO GAMES
  // ─────────────────────────────────────────────────────────
  {
    id: 'casino-lost',
    category: 'CASINO GAMES',
    categoryShort: 'Casino',
    title: 'Lost Amount Report (Aviator, Jet X, Crash Games)',
    keywords: ['aviator', 'jet x', 'crash', 'lost amount', 'nimepoteza', 'game lost', 'pesa imeisha', 'round', 'round lost', 'crash game', 'mchezo', 'casino lost'],
    emotions: ['urgent', 'distress', 'angry'],
    standard: {
      main: '🎮 Please provide your phone number, game played, the exact amount lost, and the exact time of each round. Do not combine amounts. Each round must be shared separately.',
      alts: [
        "Kindly share your phone number, game name, amount lost per round, and exact time for each round separately.",
        "Please provide: your registered phone number, game played, amount per round (not combined), and exact time of each round.",
      ],
    },
    highEmpathy: {
      main: 'We understand how concerning this is. Kindly share your phone number, the exact amount lost, and the exact time for each round separately. Please do not sum the amounts so we can check accurately.',
      alts: [
        "We're sorry to hear this happened 🙏 Please share your number, game, amount per round, and exact time for each round so we can review carefully.",
      ],
    },
  },
  {
    id: 'casino-cashout',
    category: 'CASINO GAMES',
    categoryShort: 'Casino',
    title: 'Pending Casino Cashout',
    keywords: ['pending cashout', 'cashout pending', 'game cashout', 'not cashed out', 'game screenshot', 'round pending', 'cashout failed'],
    emotions: ['urgent', 'impatient'],
    standard: {
      main: 'Please share a screenshot of the specific game showing the bet, the exact time of the round, and your registered phone number.',
    },
    highEmpathy: {
      main: 'We understand this can be worrying. Kindly send the game screenshot, include the exact time of the round and your phone number so we can assist quickly.',
    },
  },

  // ─────────────────────────────────────────────────────────
  // ACCOUNT MANAGEMENT
  // ─────────────────────────────────────────────────────────
  {
    id: 'acct-closure',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Account Closure / Delete Account',
    keywords: ['delete account', 'close account', 'deactivate', 'remove account', 'futa akaunti', 'self exclusion', 'exclude'],
    emotions: ['neutral', 'distress'],
    standard: {
      main: "To delete your account, visit https://betfalme.ke/delete-account\nGo to your account → locate Profile → Click DELETE Account → Select Period of Exclusion → Continue To Delete Account → Type DELETE to confirm (without spaces before or after) → Then confirm account deletion.",
    },
    highEmpathy: {
      main: "We're sorry to see you go. To delete your account, please visit https://betfalme.ke/delete-account and follow the steps provided. If you need help during the process, we are here to assist 💚",
    },
  },
  {
    id: 'acct-reactivation',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Account Reactivation',
    keywords: ['reactivate', 'reactivation', 'unlock account', 'account locked', 'account disabled', 'activate account', 'account suspended', 'washa akaunti', 'open account'],
    emotions: ['urgent', 'neutral'],
    standard: {
      main: 'Good news 🎉 Your account has been successfully reactivated. You can now log in and continue playing.',
    },
    highEmpathy: {
      main: "Great news 🎉 Your account is now active again. You can log in and continue playing. If you need any assistance, we're here to help.",
    },
  },
  {
    id: 'acct-verification',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Account Verification Request',
    keywords: ['verify', 'verification', 'phone number', 'confirm account', 'account check', 'thibitisha akaunti', 'number verification'],
    emotions: ['neutral'],
    standard: {
      main: 'Kindly share your registered phone number so we can verify your account and assist you.',
    },
    highEmpathy: {
      main: "We're happy to help 😊 Please share your registered phone number so we can verify your account and assist faster.",
    },
  },
  {
    id: 'acct-referral-violation',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Referral Violation / Multiple Accounts',
    keywords: ['multiple accounts', 'duplicate account', 'referral abuse', 'account violation', 'withdrawal restricted', 'restriction', 'akaunti nyingi', 'ban'],
    emotions: ['angry', 'impatient'],
    standard: {
      main: 'Following a review of your account activity, we have found that our referral terms were violated due to the creation of multiple accounts under the same identity to obtain the KSh 10 referral bonus. Based on internal checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, the account will need to be reset, which will clear all current funds. Kindly confirm if you agree to proceed with the account reset.',
    },
    highEmpathy: {
      main: 'We understand this may be disappointing. After reviewing your account activity, our system detected a violation of the referral terms due to multiple accounts being created under the same identity to claim the KSh 10 bonus. Based on checks including device verification, connection history, referral behavior, and location data, withdrawals have been restricted. To restore withdrawal access, the account will need to be reset, which clears the current funds. Please confirm if you would like us to proceed with the reset.',
    },
  },
  {
    id: 'acct-reset-done',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Account Reset Successful',
    keywords: ['account reset', 'reset done', 'reset successful', 'account cleared', 'fresh start'],
    emotions: ['neutral'],
    standard: {
      main: 'Your account has been successfully reset. You can now log in and continue using your account. Please ensure all future activity follows our referral and platform policies.',
    },
    highEmpathy: {
      main: "Your account has now been successfully reset ✅ You can log in and continue using your account. Please ensure future activity follows our referral and platform rules to avoid any further restrictions. If you need help, we're here to assist.",
    },
  },
  {
    id: 'acct-suspicious-reset',
    category: 'ACCOUNT MANAGEMENT',
    categoryShort: 'Account',
    title: 'Suspicious Account Reset Request',
    keywords: ['suspicious reset', 'technical limitation', 'reset unavailable', 'create new account'],
    emotions: ['neutral'],
    standard: {
      main: 'We are currently experiencing a technical limitation affecting the account reset option. As an alternative, you may create a new account. Please ensure all future activity follows our platform policies and referral rules.',
    },
    highEmpathy: {
      main: "We understand the inconvenience this may cause. At the moment, the account reset option is temporarily unavailable due to a technical limitation. You may create a new account instead, and we kindly ask that all future activity follows our platform and referral policies 🙏",
    },
  },

  // ─────────────────────────────────────────────────────────
  // PROMOTIONS & REFERRALS
  // ─────────────────────────────────────────────────────────
  {
    id: 'promo-offers',
    category: 'PROMOTIONS & REFERRALS',
    categoryShort: 'Promos',
    title: 'Available Offers & Promotions',
    keywords: ['promotions', 'offers', 'bonuses', 'promos', 'deals', 'benefits', 'ofa gani', 'bonasi', 'offers available', 'what offers'],
    emotions: ['neutral'],
    standard: {
      main: 'At Betfalme, we currently offer several promotions including tax-free bets, 10% daily cashback on losses, unlimited rains on Aviator, a KSh 10 referral bonus, 5% referral income, 20% cashback on sports bets, and a free bet when you refer an eligible user.',
    },
    highEmpathy: {
      main: "Thank you for your interest in our offers 😊 Betfalme currently provides tax-free bets, 10% daily cashback on losses, unlimited rains on Aviator, a KSh 10 referral bonus, 5% referral income, 20% cashback on sports bets, and a free bet when you refer an eligible user. Keep an eye on the platform for new promotions as well.",
    },
  },
  {
    id: 'promo-expired',
    category: 'PROMOTIONS & REFERRALS',
    categoryShort: 'Promos',
    title: 'Deposit Bonus Expired',
    keywords: ['bonus expired', 'offer expired', 'bonus ended', 'promo over', 'deposit bonus', 'bonus gone', 'bonasi imekwisha', 'offer imekwisha'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'The deposit bonus was a limited-time offer and has already ended after being fully claimed. Please watch out for upcoming promotions.',
    },
    highEmpathy: {
      main: "We understand this may be disappointing. The bonus was time-based and has already been fully claimed. Please stay tuned for the next offer 🎁",
    },
  },
  {
    id: 'promo-referral-missing',
    category: 'PROMOTIONS & REFERRALS',
    categoryShort: 'Promos',
    title: 'Referral Bonus Not Received',
    keywords: ['referral bonus', 'refer bonus', 'referral not credited', 'referred friend', 'link used', 'ksh 10 bonus', 'bonus ya referral', 'niliwasiliana mtu'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Please confirm your referral used your unique link and completed account verification. Once verified, the bonus is credited automatically as per our policy.',
    },
    highEmpathy: {
      main: 'We understand this can be frustrating. Kindly confirm your referral used your link and completed verification. The bonus is credited automatically once conditions are met.',
    },
  },

  // ─────────────────────────────────────────────────────────
  // WITHDRAWALS & TRANSACTIONS
  // ─────────────────────────────────────────────────────────
  {
    id: 'wd-below250',
    category: 'WITHDRAWALS & TRANSACTIONS',
    categoryShort: 'Withdrawals',
    title: 'First Withdrawal – Balance Below KSh 250',
    keywords: ['below 250', 'ksh 250', 'minimum 250', 'first withdrawal', 'cannot withdraw', 'withdrawal limit', 'kutoa', 'mara ya kwanza kutoa', 'pesa kidogo'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Your account balance is currently below the bonus withdrawable limit of KSh 250. To withdraw any bonus funds, please ensure your total balance is at least KSh 250 as per our withdrawal policy.',
    },
  },
  {
    id: 'wd-referral-rule',
    category: 'WITHDRAWALS & TRANSACTIONS',
    categoryShort: 'Withdrawals',
    title: 'First Withdrawal – Referral Bonus Rule Explanation',
    keywords: ['250 minimum', 'first withdrawal rule', 'referral minimum', 'bonus withdrawal', 'why 250', 'ksh 250 rule'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'The KSh 250 minimum withdrawal applies only to first-time withdrawals made using referral bonus without a deposit. After your first withdrawal, the minimum withdrawal amount becomes KSh 50.',
    },
    highEmpathy: {
      main: "We understand you'd like to withdraw. Please note KSh 250 only applies to your first withdrawal using referral bonus without deposit. After that, the minimum becomes KSh 50.",
    },
  },
  {
    id: 'wd-below50',
    category: 'WITHDRAWALS & TRANSACTIONS',
    categoryShort: 'Withdrawals',
    title: 'Balance Below KSh 50',
    keywords: ['below 50', 'ksh 50', 'minimum 50', 'low balance', 'cannot withdraw', 'balance too low', 'withdrawal minimum', 'pesa kidogo sana'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Your balance is below the minimum withdrawal limit of KSh 50. Please ensure your balance reaches KSh 50 to proceed.',
    },
    highEmpathy: {
      main: 'We understand the urgency. Withdrawals require a minimum balance of KSh 50. Once your balance reaches this amount, you can withdraw.',
    },
  },
  {
    id: 'wd-pending',
    category: 'WITHDRAWALS & TRANSACTIONS',
    categoryShort: 'Withdrawals',
    title: 'Pending Withdrawal',
    keywords: ['pending withdrawal', 'withdrawal not received', 'withdrawal stuck', 'withdrawal failed', 'where is withdrawal', 'kutoa hakuja', 'withdrawal imekwama', 'pesa haikuja mpesa', 'withdrawal delayed'],
    emotions: ['urgent', 'impatient', 'angry'],
    standard: {
      main: 'Please share your registered phone number, the pending amount, and the exact time you made the withdrawal request so we can review.',
      alts: [
        "Kindly provide your phone number, withdrawal amount, and exact request time for a quick review.",
      ],
    },
    highEmpathy: {
      main: "We understand the concern. Kindly send your phone number, the pending amount, and the exact time of the request so we can assist quickly.",
      alts: [
        "We hear your frustration 🙏 Please share your number, the amount, and exact time of your withdrawal request so we can prioritize this.",
      ],
    },
  },
  {
    id: 'wd-eligible',
    category: 'WITHDRAWALS & TRANSACTIONS',
    categoryShort: 'Withdrawals',
    title: 'Client Eligible to Withdraw',
    keywords: ['eligible withdraw', 'can now withdraw', 'withdrawal approved', 'eligible', 'approved', 'unaweza kutoa sasa'],
    emotions: ['neutral'],
    standard: {
      main: 'Good news 🎉 Your account is now eligible for withdrawal. You may proceed.',
    },
    highEmpathy: {
      main: 'Great news 🎉 You can now withdraw from your account. Please proceed at your convenience.',
    },
  },

  // ─────────────────────────────────────────────────────────
  // DEPOSITS - MPESA
  // ─────────────────────────────────────────────────────────
  {
    id: 'dep-failed',
    category: 'DEPOSITS - MPESA',
    categoryShort: 'Deposits',
    title: 'Failed / Missing Deposit',
    keywords: ['failed deposit', 'deposit failed', 'deposit not credited', 'deposit not reflected', 'niliweka pesa haikuja', 'mpesa ilitumwa', 'deposit missing', 'transaction code', 'mpesa code', 'deposit issue'],
    emotions: ['urgent', 'impatient', 'angry'],
    standard: {
      main: "If your deposit was unsuccessful, please share the full M-PESA transaction message as text or send the 10-character transaction code from the SMS.\nExample: UA58134GTJ Confirmed. KSh 10,000.00 sent to FALMEBET LIMITED for account 07XXXXXXXX.\nMini-statement codes are not accepted for verification. Please do not send a screenshot - share the message as text.",
    },
    highEmpathy: {
      main: "We understand this can be frustrating. Kindly send the full M-PESA confirmation message as text or the 10-character transaction code from the SMS so we can assist quickly. Mini-statements are not accepted, and screenshots are not required 😊",
    },
  },
  {
    id: 'dep-self-check',
    category: 'DEPOSITS - MPESA',
    categoryShort: 'Deposits',
    title: 'Alternative Self-Check Option',
    keywords: ['verify myself', 'check deposit myself', 'deposit unsuccessful', 'self check', 'footer', 'mpesa sms'],
    emotions: ['neutral'],
    standard: {
      main: "You can also verify your code by going to your account → scroll to the footer → click \"Deposit Unsuccessful?\" → then find the 10-character transaction code at the start of your M-PESA SMS.\nExample: SJ82KFNAX4",
    },
    highEmpathy: {
      main: "To make it easier, you can go to your account → scroll to the footer → click \"Deposit Unsuccessful?\" and enter the 10-character code from your M-PESA SMS 😊\nExample: SJ82KFNAX4",
    },
  },
  {
    id: 'dep-deleted-sms',
    category: 'DEPOSITS - MPESA',
    categoryShort: 'Deposits',
    title: 'Deleted M-PESA Message',
    keywords: ['deleted message', 'lost sms', 'no sms', 'message deleted', 'safaricom statement', 'retrieve code', 'ujumbe umefutwa', 'sms imefutwa'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Please retrieve the transaction code from the MPESA app or contact Safaricom Customer Care and request a full MPESA statement. Mini-statements are not accepted.',
    },
  },
  {
    id: 'dep-airtel',
    category: 'DEPOSITS - MPESA',
    categoryShort: 'Deposits',
    title: 'Airtel or Bank Deposit Not Supported',
    keywords: ['airtel', 'airtel money', 'bank deposit', 'equity', 'kcb', 'not mpesa', 'bank transfer', 'airtel deposit failed', 'only mpesa'],
    emotions: ['neutral'],
    standard: {
      main: 'Betfalme currently supports MPESA only. Please contact your service provider to request a reversal, then deposit using MPESA.',
    },
    highEmpathy: {
      main: 'We understand the inconvenience. At the moment we only support MPESA deposits. Kindly request a reversal and deposit again using MPESA.',
    },
  },
  {
    id: 'dep-network',
    category: 'DEPOSITS - MPESA',
    categoryShort: 'Deposits',
    title: 'Network Delay Notice (Safaricom)',
    keywords: ['safaricom delay', 'network issue', 'mpesa delay', 'safaricom problem', 'network down', 'mpesa not working', 'tatizo safaricom', 'mtandao mbaya'],
    emotions: ['urgent', 'impatient'],
    standard: {
      main: "Dear Customer, we are aware of delays affecting some M-Pesa deposits and withdrawals due to a temporary Safaricom network issue. This is not a Betfalme system problem. Your funds are safe and will reflect automatically once the network is fully restored. Thank you for your patience.",
    },
    highEmpathy: {
      main: "We understand delays can be frustrating. The issue is from the Safaricom network and not Betfalme. Your funds are safe and will reflect automatically once service is restored. We appreciate your patience 🙏",
    },
  },

  // ─────────────────────────────────────────────────────────
  // CASHBACK - 10%
  // ─────────────────────────────────────────────────────────
  {
    id: 'cb-where',
    category: 'CASHBACK - 10%',
    categoryShort: 'Cashback',
    title: 'Where Is My Cashback',
    keywords: ['where is cashback', 'cashback not received', 'cashback missing', 'cashback sijapata', 'daily cashback', '8:35', 'cashback yako wapi', 'cashback haijafika'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Cashback is automatically calculated and credited for eligible customers who record a net loss during the cashback period. Cashback is processed daily at 8:35 PM. If it has not reflected yet, please wait until after 8:35 PM.',
    },
    highEmpathy: {
      main: 'We understand the concern 😊 Cashback is processed daily at 8:35 PM. If eligible, it will reflect automatically after that time.',
    },
  },
  {
    id: 'cb-not-received',
    category: 'CASHBACK - 10%',
    categoryShort: 'Cashback',
    title: 'Not Received Cashback (Eligibility)',
    keywords: ['not eligible cashback', 'no cashback', 'cashback not given', 'cashback rules', 'why no cashback', 'kwa nini sina cashback', 'cashback eligibility'],
    emotions: ['impatient', 'neutral'],
    standard: {
      main: 'Cashback is credited only if you made deposits and your total withdrawals are less than your total deposits during the cashback period, resulting in a net loss. If withdrawals are equal to or higher than deposits, no cashback is generated.',
    },
    highEmpathy: {
      main: 'Cashback is given only when deposits are higher than withdrawals within the cashback period. If there is no net loss, cashback will not be generated.',
    },
  },
  {
    id: 'cb-calculate',
    category: 'CASHBACK - 10%',
    categoryShort: 'Cashback',
    title: 'How to Calculate Cashback',
    keywords: ['how cashback calculated', 'calculate cashback', 'cashback formula', '10 percent', 'cashback how', 'jinsi ya kuhesabu cashback'],
    emotions: ['neutral'],
    standard: {
      main: 'Cashback is 10% of the difference between total deposits and total withdrawals made from yesterday 8:35 PM to today 8:35 PM. For example, if you deposited KSh 1,000 and withdrew KSh 600, the difference is KSh 400. You will receive KSh 40 as cashback if it results in a loss.',
    },
    highEmpathy: {
      main: 'To calculate, subtract withdrawals from deposits between 8:35 PM yesterday and 8:35 PM today. If there is a loss, 10% of that amount is credited at 8:35 PM.',
    },
  },
  {
    id: 'cb-today',
    category: 'CASHBACK - 10%',
    categoryShort: 'Cashback',
    title: 'Will I Get Cashback Today',
    keywords: ['cashback today', 'get cashback', 'receive cashback today', 'will i get cashback', 'cashback leo', 'leo cashback'],
    emotions: ['neutral'],
    standard: {
      main: 'You will receive cashback today at 8:35 PM if you made deposits between yesterday 9:00 PM and today 8:35 PM, withdrawals are less than deposits, and your account shows a net loss.',
    },
    highEmpathy: {
      main: 'If you meet the conditions and recorded a net loss, cashback will reflect automatically at 8:35 PM 😊',
    },
  },

  // ─────────────────────────────────────────────────────────
  // RESPONSIBLE GAMING
  // ─────────────────────────────────────────────────────────
  {
    id: 'rg-distress',
    category: 'RESPONSIBLE GAMING',
    categoryShort: 'Resp. Gaming',
    title: 'Client in Distress / Heavy Loss',
    keywords: ['lost everything', 'all my money', 'stressed', 'desperate', 'nimepoteza kila kitu', 'nimekwama', 'pesa zote', 'cant stop', 'addicted', 'problem gambling', 'help me stop'],
    emotions: ['distress', 'rg_risk'],
    standard: {
      main: "We understand this may feel overwhelming 🙏 It may help to take a break and return later.",
      alts: [
        "We recommend pausing play and continuing only when comfortable.",
        "Betting should be done within your limits → please take care.",
        "We're here to support you 🙏 You may consider self-exclusion if needed.",
      ],
    },
    highEmpathy: {
      main: "Your well-being matters to us 💚 If betting feels stressful, please consider taking a break or activating self-exclusion. We are here to support you.",
      alts: [
        "We care about you 💚 Please consider taking a break if this feels overwhelming.",
        "We understand 🙏 Your mental health comes first → please reach out if you need support.",
      ],
    },
  },
  {
    id: 'rg-chasing',
    category: 'RESPONSIBLE GAMING',
    categoryShort: 'Resp. Gaming',
    title: 'Client Chasing Losses',
    keywords: ['chasing losses', 'trying to recover', 'keep betting', 'cant stop betting', 'want to win back', 'keep losing', 'recovering losses', 'nirudishie hasara'],
    emotions: ['distress', 'rg_risk', 'urgent'],
    standard: {
      main: 'We strongly advise against trying to recover losses through further betting.',
      alts: [
        "It's important to avoid chasing losses and play responsibly.",
        "We recommend stopping and reviewing before continuing.",
        "Please only continue if you are comfortable and within your limits.",
      ],
    },
    highEmpathy: {
      main: 'Betting should always be done responsibly and within your financial limits. If you need a break, you may request self-exclusion or account closure at any time.',
      alts: [
        "We genuinely care about your well-being 💚 Chasing losses rarely helps → we strongly recommend pausing and coming back when you're ready.",
      ],
    },
  },
];
