
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORY_ICONS = {
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

// Extracted and flattened from Knowledge Base AI Assistant/src/app/data/responses.ts
const rawData = [
  {
    category: 'GREETINGS & CHAT FLOW',
    title: 'Client Says Hi After Auto Greeting',
    triggers: ['hello', 'hi', 'hey', 'habari', 'hujambo', 'jambo', 'sema', 'nikusaidie', 'start', 'greeting'],
    responses: [
      { type: 'Standard', text: 'Hello again 🙂 What can we help you with today?' },
      { type: 'High Empathy', text: 'Hi 🙂 No worries — just let us know what’s going on and we’ll help you sort it out quickly.' }
    ]
  },
  {
    category: 'GREETINGS & CHAT FLOW',
    title: 'Client Is Vague ("Help", "Problem")',
    triggers: ['help', 'problem', 'issue', 'something wrong', 'naomba msaada', 'nisaidie', 'tatizo'],
    responses: [
      { type: 'Standard', text: "Hello! Please let us know the issue you're experiencing and include any relevant details such as your account number or transaction reference, if applicable." },
      { type: 'High Empathy', text: "Hi 🙂 Please explain the issue and include your number or transaction info so we can assist faster." }
    ]
  },
  {
    category: 'GREETINGS & CHAT FLOW',
    title: 'Client Is Immediately Urgent ("Where is my money")',
    triggers: ['where is my money', 'wapi pesa', 'money urgent', 'urgent', 'haraka'],
    responses: [
      { type: 'Standard', text: "Hello 🙂 Kindly share what issue you’re facing + include your phone number or transaction code so we can check immediately." },
      { type: 'High Empathy', text: "We understand you need this resolved quickly 🙏 Your request has already been received and is currently being processed. Please share your phone number, amount, and time so we can check and update you right away." }
    ]
  },
  {
    category: 'GREETINGS & CHAT FLOW',
    title: 'Insults / Aggression',
    triggers: ['rude', 'angry', 'abuse', 'stupid', 'fraud', 'scam', 'thieves', 'mbwa', 'ujinga'],
    responses: [
      { type: 'Standard', text: "We understand you may be frustrated. Let’s keep things respectful so we can assist you quickly. Please share the issue." },
      { type: 'High Empathy', text: "We understand you’re upset and we truly want to help 🙏 Kindly keep the conversation respectful and tell us what happened so we can resolve it." }
    ]
  },
  {
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    title: 'Case Submitted',
    responses: [
      { type: 'Standard', text: "Your request has been received and logged ✅ It has been forwarded for review and is currently being processed. We’ll update you as soon as we have feedback." },
      { type: 'High Empathy', text: "We’ve received your request and it’s already being worked on 🙏 We understand this is important, and we’ll update you as soon as there’s progress." },
      { type: 'Deposits', text: "Your deposit request has been received and submitted for verification ✅ It’s currently under review." },
      { type: 'Withdrawals', text: "Your withdrawal request has been received and is currently being processed 🔄 We’ll update you shortly." }
    ]
  },
  {
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    title: 'Ticket Still in Queue',
    responses: [
      { type: 'Standard', text: "Your request is still in the processing queue and will be handled shortly. Thank you for your patience." },
      { type: 'High Empathy', text: "We understand the wait 🙏 Your request is still in line and will be handled soon. We appreciate your patience." }
    ]
  },
  {
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    title: 'Roll Back / Funds Returned',
    responses: [
      { type: 'Standard', text: "The amount has now been returned to your account ✅ Please refresh and confirm your balance." },
      { type: 'High Empathy', text: "Good news 🙂 The amount has been successfully returned to your account. Kindly refresh and confirm your balance." }
    ]
  },
  {
    category: 'CLIENT PATIENCE / UNDER REVIEW',
    title: 'No Lost Amount (System OK)',
    responses: [
      { type: 'Standard', text: "Your account has been reviewed and all transactions were processed correctly ✅ No funds were lost. Please check your account activity." },
      { type: 'High Empathy', text: "We understand your concern 🙏 After review, all transactions were successful and no funds were lost. Please check your account, and let us know if anything still seems unclear." }
    ]
  },
  {
    category: 'HARD CASE SYSTEM',
    title: 'Refund Refusal (No Loophole)',
    triggers: ['refund', 'nirudishie', 'give back my money', 'not fair', 'unfair'],
    responses: [
      { type: 'Standard', text: "We understand your request. However, the transaction was processed in line with system records and platform rules, and we’re unable to reverse or refund it." },
      { type: 'High Empathy', text: "We understand this is not the outcome you were hoping for 🙏 After a full review, the decision remains final based on system records and platform rules. Unfortunately, we’re unable to process a refund in this case." }
    ]
  },
  {
    category: 'SPORTS BET',
    title: 'Pending Betslip - Postponed',
    responses: [
      { type: 'Standard', text: "The match was postponed ⏳ Bets are settled within 24 hours after the scheduled time. Your betslip will update automatically." },
      { type: 'High Empathy', text: "We understand the wait 🙏 Postponed matches are settled within 24 hours after the scheduled time. Your bet will update automatically." }
    ]
  },
  {
    category: 'SPORTS BET',
    title: 'Unpaid Winning Bet',
    responses: [
      { type: 'Standard', text: "Please send → betslip screenshot + Bet ID (e.g. #678534) + your phone number so we can check." },
      { type: 'High Empathy', text: "We understand your concern 🙂 Kindly send the betslip screenshot, Bet ID, and your phone number so we can assist quickly." }
    ]
  },
  {
    category: 'SPORTS BET',
    title: 'Voided Bet (Late Placement)',
    responses: [
      { type: 'Standard', text: "After review, your bet was placed after the match had already started ⏱️ As per our rules, bets must be placed before kickoff unless marked as live. The system flagged this as an irregular bet, so it was voided. This outcome is final." },
      { type: 'High Empathy', text: "We understand this feels unfair 🙏 However, our system confirmed the bet was placed after kickoff. As per our rules, such bets are treated as irregular and voided. The decision has been reviewed and remains final." }
    ]
  },
  {
    category: 'CASINO GAMES',
    title: 'Lost Amount Report',
    responses: [
      { type: 'Standard', text: "To check this, send → phone number + game played + exact amount lost + exact time of each round. Do not combine amounts." },
      { type: 'High Empathy', text: "We understand this is worrying 🙏 Please send your phone number, game, exact amount lost, and time for each round separately so we can check accurately." }
    ]
  },
  {
    category: 'ACCOUNT MANAGEMENT',
    title: 'Account Closure',
    responses: [
      { type: 'Standard', text: "To delete your account 👉 https://betfalme.ke/delete-account → Profile → DELETE Account → Select period → Continue → Type DELETE → Confirm." },
      { type: 'High Empathy', text: "We’re sorry to see you go 🙏 Please follow this link https://betfalme.ke/delete-account and complete the steps. We’re here if you need help." }
    ]
  },
  {
    category: 'WITHDRAWALS & TRANSACTIONS',
    title: 'First Withdrawal Rule (KSh 250)',
    responses: [
      { type: 'Standard', text: "KSh 250 applies only to first withdrawal using referral bonus without deposit. After that, minimum is KSh 50." },
      { type: 'High Empathy', text: "We understand you want to withdraw 🙂 KSh 250 applies only for first withdrawal without deposit. After that, it’s KSh 50." }
    ]
  },
  {
    category: 'DEPOSITS - MPESA',
    title: 'Failed Deposit',
    responses: [
      { type: 'Standard', text: "Send full MPESA message or code (e.g. UA58134GTJ) as text 🧾 No screenshots or mini-statements." },
      { type: 'High Empathy', text: "We understand this is frustrating 🙏 Kindly send the full MPESA message or code so we can assist quickly." }
    ]
  },
  {
    category: 'CASHBACK - 10%',
    title: 'Where is my cashback?',
    responses: [
      { type: 'Standard', text: "Cashback is processed daily at 8:35 PM. If eligible, it will reflect automatically after that time." },
      { type: 'High Empathy', text: "We understand 🙂 Cashback is credited at 8:35 PM. Please check after that time." }
    ]
  },
  {
    category: 'RESPONSIBLE GAMING',
    title: 'General Guidance',
    responses: [
      { type: 'Standard', text: "Please bet responsibly. You can request self-exclusion or account closure anytime." },
      { type: 'High Empathy', text: "Your well-being matters 🙏 If betting feels stressful, please take a break or request self-exclusion. We’re here to help." }
    ]
  }
];

async function seed() {
  console.log('Seeding Comprehensive Knowledge Base to Supabase...');
  
  // Wipe existing data
  await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Group by category for the Supabase structure
  const grouped = {};
  rawData.forEach(item => {
    const catName = `${CATEGORY_ICONS[item.category] || '📁'} ${item.category}`;
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push({
      title: item.title,
      triggers: item.triggers || [],
      responses: item.responses
    });
  });

  const finalData = Object.entries(grouped).map(([category, templates]) => ({
    category,
    templates
  }));

  const { error } = await supabase.from('support_templates').insert(finalData);
  if (error) {
    console.error('Error seeding knowledge base:', error);
  } else {
    console.log('Successfully seeded Comprehensive Knowledge Base!');
  }
}

seed();
