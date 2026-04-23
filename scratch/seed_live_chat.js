
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const liveChatSystem = [
  {
    category: "GREETINGS & CHAT FLOW 👋",
    templates: [
      {
        title: "Client Says Hi After Auto Greeting",
        responses: [
          { type: "Standard", text: "Hello again 🙂 What can we help you with today?" },
          { type: "High Empathy", text: "Hi 🙂 No worries — just let us know what’s going on and we’ll help you sort it out quickly." }
        ]
      },
      {
        title: "Client in a Hurry (Urgent Money)",
        triggers: ["Where is my withdrawal", "I deposited but nothing", "Why is it taking long", "Hurry"],
        goal: "Reassure + Show action already taken + Request key info",
        responses: [
          { type: "Standard", text: "Hello 🙂 Kindly share what issue you’re facing + include your phone number or transaction code so we can check immediately." },
          { type: "High Empathy", text: "We understand you need this resolved quickly 🙏 Your request has already been received and is currently being processed. Please share your phone number, amount, and time so we can check and update you right away." }
        ]
      },
      {
        title: "Frustrated / Aggressive Tone",
        triggers: ["Caps", "This is unfair", "Your system is bad"],
        goal: "De-escalate + show understanding + keep control",
        responses: [
          { type: "Standard", text: "We understand you may be frustrated. Let’s keep things respectful so we can assist you quickly. Please share the issue." },
          { type: "High Empathy", text: "We understand you’re upset and we truly want to help 🙏 Kindly keep the conversation respectful and tell us what happened so we can resolve it." }
        ]
      }
    ]
  },
  {
    category: "CLIENT PATIENCE / UNDER REVIEW ⏳",
    templates: [
      {
        title: "Case Submitted",
        responses: [
          { type: "Standard", text: "Your request has been received and logged ✅ It has been forwarded for review and is currently being processed. We’ll update you as soon as we have feedback." },
          { type: "High Empathy", text: "We’ve received your request and it’s already being worked on 🙏 We understand this is important, and we’ll update you as soon as there’s progress." },
          { type: "Deposits", text: "Your deposit request has been received and submitted for verification ✅ It’s currently under review." },
          { type: "Withdrawals", text: "Your withdrawal request has been received and is currently being processed 🔄 We’ll update you shortly." }
        ]
      },
      {
        title: "Ticket Still in Queue",
        responses: [
          { type: "Standard", text: "Your request is still in the processing queue and will be handled shortly. Thank you for your patience." },
          { type: "High Empathy", text: "We understand the wait 🙏 Your request is still in line and will be handled soon. We appreciate your patience." }
        ]
      },
      {
        title: "Roll Back (Balance Restore)",
        responses: [
          { type: "Standard", text: "The amount has now been returned to your account ✅ Please refresh and confirm your balance." },
          { type: "High Empathy", text: "Good news 🙂 The amount has been successfully returned to your account. Kindly refresh and confirm your balance." }
        ]
      },
      {
        title: "No Lost Amount (System OK)",
        responses: [
          { type: "Standard", text: "Your account has been reviewed and all transactions were processed correctly ✅ No funds were lost. Please check your account activity." },
          { type: "High Empathy", text: "We understand your concern 🙏 After review, all transactions were successful and no funds were lost. Please check your account, and let us know if anything still seems unclear." }
        ]
      }
    ]
  },
  {
    category: "SPORTS BET ⚽",
    templates: [
      {
        title: "Pending Betslip - Postponed",
        responses: [
          { type: "Standard", text: "The match was postponed ⏳ Bets are settled within 24 hours after the scheduled time. Your betslip will update automatically." },
          { type: "High Empathy", text: "We understand the wait 🙏 Postponed matches are settled within 24 hours after the scheduled time. Your bet will update automatically." }
        ]
      },
      {
        title: "Unpaid Winning Bet",
        responses: [
          { type: "Standard", text: "Please send → betslip screenshot + Bet ID (e.g. #678534) + your phone number so we can check." },
          { type: "High Empathy", text: "We understand your concern 🙂 Kindly send the betslip screenshot, Bet ID, and your phone number so we can assist quickly." }
        ]
      },
      {
        title: "Voided Bet (Late Placement)",
        responses: [
          { type: "Standard", text: "After review, your bet was placed after the match had already started ⏱️ As per our rules, bets must be placed before kickoff unless marked as live. The system flagged this as an irregular bet, so it was voided. This outcome is final." },
          { type: "High Empathy", text: "We understand this feels unfair 🙏 However, our system confirmed the bet was placed after kickoff. As per our rules, such bets are treated as irregular and voided. The decision has been reviewed and remains final." }
        ]
      }
    ]
  },
  {
    category: "CASINO GAMES 🎮",
    templates: [
      {
        title: "Lost Amount Report",
        responses: [
          { type: "Standard", text: "To check this, send → phone number + game played + exact amount lost + exact time of each round. Do not combine amounts." },
          { type: "High Empathy", text: "We understand this is worrying 🙏 Please send your phone number, game, exact amount lost, and time for each round separately so we can check accurately." }
        ]
      },
      {
        title: "Pending Cashout",
        responses: [
          { type: "Standard", text: "Please send → game screenshot + exact time + your phone number so we can review." },
          { type: "High Empathy", text: "We understand your concern 🙂 Kindly send the game screenshot, time, and your phone number so we can assist quickly." }
        ]
      }
    ]
  },
  {
    category: "ACCOUNT MANAGEMENT 👤",
    templates: [
      {
        title: "Account Closure",
        responses: [
          { type: "Standard", text: "To delete your account 👉 https://betfalme.ke/delete-account → Profile → DELETE Account → Select period → Continue → Type DELETE → Confirm." },
          { type: "High Empathy", text: "We’re sorry to see you go 🙏 Please follow this link https://betfalme.ke/delete-account and complete the steps. We’re here if you need help." }
        ]
      },
      {
        title: "Account Reactivation",
        responses: [
          { type: "Standard", text: "Your account is now active ✅ You can log in and continue playing." },
          { type: "High Empathy", text: "Great news 🙂 Your account is active again. You can now log in and continue playing." }
        ]
      },
      {
        title: "Referral Violation (Multiple Accounts)",
        responses: [
          { type: "Standard", text: "Your account was found to have multiple accounts under one identity to claim the KSh 10 bonus. Withdrawals are restricted. To restore access, the account must be reset, which clears all funds. Please confirm to proceed." },
          { type: "High Empathy", text: "We understand this may be disappointing 🙏 Our system detected multiple accounts under one identity for the KSh 10 bonus. Withdrawals are restricted. To restore access, a reset is required which clears funds. Please confirm if you’d like to proceed." }
        ]
      }
    ]
  },
  {
    category: "PROMOTIONS 🎁",
    templates: [
      {
        title: "Available Offers",
        responses: [
          { type: "Standard", text: "Current offers include → tax-free bets, 10% cashback, Aviator rains, KSh 10 referral bonus, 5% referral income, 20% sports cashback, and free bets." },
          { type: "High Empathy", text: "We’re glad you asked 🙂 You can enjoy tax-free bets, cashback, referral bonuses, Aviator rains and more. Keep checking for new offers." }
        ]
      },
      {
        title: "Referral Bonus Not Received",
        responses: [
          { type: "Standard", text: "Ensure your referral used your link and verified their account. Bonus is credited automatically once complete." },
          { type: "High Empathy", text: "We understand the concern 🙂 Please confirm your referral used your link and completed verification. The bonus is automatic once done." }
        ]
      }
    ]
  },
  {
    category: "WITHDRAWALS 💳",
    templates: [
      {
        title: "First Withdrawal Rule (KSh 250)",
        responses: [
          { type: "Standard", text: "KSh 250 applies only to first withdrawal using referral bonus without deposit. After that, minimum is KSh 50." },
          { type: "High Empathy", text: "We understand you want to withdraw 🙂 KSh 250 applies only for first withdrawal without deposit. After that, it’s KSh 50." }
        ]
      },
      {
        title: "Eligible to Withdraw",
        responses: [
          { type: "Standard", text: "Good news 🙂 You can now withdraw." },
          { type: "High Empathy", text: "Great news 🎉 Your account is ready for withdrawal. You can proceed anytime." }
        ]
      }
    ]
  },
  {
    category: "DEPOSITS – MPESA 📲",
    templates: [
      {
        title: "Failed Deposit",
        responses: [
          { type: "Standard", text: "Send full MPESA message or code (e.g. UA58134GTJ) as text 🧾 No screenshots or mini-statements." },
          { type: "High Empathy", text: "We understand this is frustrating 🙏 Kindly send the full MPESA message or code so we can assist quickly." }
        ]
      },
      {
        title: "Self Check Utility",
        responses: [
          { type: "Standard", text: "Go to account → footer → “Deposit Unsuccessful?” → enter MPESA code (e.g. SJ82KFNAX4)." },
          { type: "High Empathy", text: "You can easily check 🙂 Go to account → “Deposit Unsuccessful?” → enter your MPESA code." }
        ]
      }
    ]
  },
  {
    category: "CASHBACK 💰",
    templates: [
      {
        title: "Where is my cashback?",
        responses: [
          { type: "Standard", text: "Cashback is processed daily at 8:35 PM. If eligible, it will reflect automatically after that time." },
          { type: "High Empathy", text: "We understand 🙂 Cashback is credited at 8:35 PM. Please check after that time." }
        ]
      },
      {
        title: "Calculation Method",
        responses: [
          { type: "Standard", text: "Cashback = 10% of (Deposits - Withdrawals) from 8:35 PM to 8:35 PM." },
          { type: "High Empathy", text: "Just subtract withdrawals from deposits, then take 10%. That’s your cashback 🙂" }
        ]
      }
    ]
  },
  {
    category: "RESPONSIBLE GAMING 🎗️",
    templates: [
      {
        title: "General Guidance",
        responses: [
          { type: "Standard", text: "Please bet responsibly. You can request self-exclusion or account closure anytime." },
          { type: "High Empathy", text: "Your well-being matters 🙏 If betting feels stressful, please take a break or request self-exclusion. We’re here to help." }
        ]
      }
    ]
  },
  {
    category: "CLOSING ✅",
    templates: [
      {
        title: "Standard Goodbye",
        responses: [
          { type: "Standard", text: "Thank you for choosing Betfalme. If you need anything else, feel free to reach out." },
          { type: "High Empathy", text: "Thank you for your patience and for choosing Betfalme 🙏 We’re always here if you need help 🙂" }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('Seeding Enhanced Live Chat System to Supabase...');
  
  // Wipe existing data to prevent overlap with old tags
  await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('support_templates').insert(liveChatSystem);
  if (error) {
    console.error('Error seeding enhanced live chat system:', error);
  } else {
    console.log('Successfully seeded Enhanced Live Chat System!');
  }
}

seed();
