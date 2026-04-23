
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const taggingSystem = [
  {
    category: "🔴 URGENT MONEY",
    templates: [
      {
        title: "Where's my money / Hurry",
        triggers: ["Where is my withdrawal", "I deposited but nothing", "Why is it taking long"],
        goal: "Reassure + Show action already taken + Request key info",
        responses: [
          { type: "Send", text: "We understand you need this resolved quickly 🙏 Your request has already been received and is currently being processed. Please share your phone number, amount, and time so we can check and update you right away." }
        ]
      }
    ]
  },
  {
    category: "🟠 FRUSTRATED / ANGRY",
    templates: [
      {
        title: "Aggressive Tone",
        triggers: ["Caps / aggressive tone", "This is unfair", "Your system is bad"],
        goal: "De-escalate + show understanding + keep control",
        responses: [
          { type: "Send", text: "We understand why this feels frustrating 🙏 Let’s work through it together. Please share the details and we’ll check this for you right away." }
        ]
      }
    ]
  },
  {
    category: "🔴 ABUSIVE / INSULTING",
    templates: [
      {
        title: "Boundaries & Calm",
        triggers: ["Insults", "threats", "toxic language"],
        goal: "Set boundary + remain calm",
        responses: [
          { type: "1st Warning", text: "We understand you may be upset, and we want to help. Kindly keep the conversation respectful so we can assist you effectively." },
          { type: "Final", text: "We’re here to assist, but we cannot continue if the language remains abusive. Please let us know your issue respectfully." }
        ]
      }
    ]
  },
  {
    category: "🟡 IMPATIENT",
    templates: [
      {
        title: "Repeated Follow-ups",
        triggers: ["Any update???", "You’re slow"],
        goal: "Reassure + confirm queue + reduce pressure",
        responses: [
          { type: "Send", text: "We understand the wait 🙏 Your request is already in progress and in the queue. It will be handled shortly and we’ll update you as soon as it’s done." }
        ]
      }
    ]
  },
  {
    category: "🔵 CONFUSED USER",
    templates: [
      {
        title: "Simplification",
        triggers: ["I don’t understand", "Explain again"],
        goal: "Simplify + guide step-by-step",
        responses: [
          { type: "Send", text: "No problem 🙂 Let’s make it simple → [insert simple explanation]. If anything is unclear, tell us and we’ll guide you step by step." }
        ]
      }
    ]
  },
  {
    category: "🟣 CASHBACK CONFUSION",
    templates: [
      {
        title: "Calculation Explanation",
        triggers: ["Where is my cashback", "I didn’t receive cashback"],
        goal: "Educate + reduce repeat questions",
        responses: [
          { type: "Send", text: "Cashback is calculated daily at 8:35 PM 💰 It’s 10% of (deposits − withdrawals) between yesterday 8:35 PM and today 8:35 PM. If withdrawals are equal or higher, no cashback is generated." }
        ]
      }
    ]
  },
  {
    category: "🟢 NORMAL / CALM USER",
    templates: [
      {
        title: "Fast Resolution",
        triggers: ["Polite tone", "Clear question"],
        goal: "Fast resolution",
        responses: [
          { type: "Send", text: "Sure 🙂 Please share the details (phone number / amount / time), and we’ll check this for you immediately." }
        ]
      }
    ]
  },
  {
    category: "🔴 FRAUD RISK",
    templates: [
      {
        title: "Suspicious Patterns",
        triggers: ["Referral abuse", "Multiple accounts", "Suspicious patterns"],
        goal: "Assert control + avoid argument",
        responses: [
          { type: "Send", text: "Your account activity has been reviewed based on system checks including device and usage patterns. Based on this, restrictions have been applied in line with our policies." }
        ]
      }
    ]
  },
  {
    category: "⚫ DENIAL",
    templates: [
      {
        title: "Authority Reinforcement",
        triggers: ["I didn’t do that", "System is wrong"],
        goal: "Reinforce authority (logs > opinion)",
        responses: [
          { type: "Send", text: "We understand your concern 🙏 However, the outcome is based on verified system data including activity logs and timestamps, which guide our final decision." }
        ]
      }
    ]
  },
  {
    category: "🟤 REFUND DEMAND",
    templates: [
      {
        title: "Firm Compliance",
        triggers: ["Refund my money", "Return my deposit"],
        goal: "Firm + compliant + no loophole",
        responses: [
          { type: "Send", text: "We understand your request 🙏 However, the transaction was processed in line with system records and platform rules, and we’re unable to reverse or refund it." }
        ]
      }
    ]
  },
  {
    category: "🟡 LOSS DISTRESS",
    templates: [
      {
        title: "Responsible Gaming",
        triggers: ["I’ve lost too much", "I’m stressed"],
        goal: "Protect user + compliance",
        responses: [
          { type: "Send", text: "We’re sorry you’re feeling this way 🙏 It may help to take a break. We can also assist you in setting limits or self-exclusion if needed." }
        ]
      }
    ]
  },
  {
    category: "🟢 READY TO CONTINUE",
    templates: [
      {
        title: "Retention Opportunity",
        triggers: ["Issue resolved", "Neutral mood"],
        goal: "Smooth continuation",
        responses: [
          { type: "Send", text: "All set 🙂 You can now continue playing. Let us know if you need anything else." }
        ]
      }
    ]
  },
  {
    category: "🟠 BONUS SEEKER",
    templates: [
      {
        title: "Inform & Retain",
        triggers: ["Any bonus?", "Give me offer"],
        goal: "Inform + retain",
        responses: [
          { type: "Send", text: "You can enjoy current offers like cashback, referral bonuses, and Aviator rains 🎁 Keep checking for new promotions as well." }
        ]
      }
    ]
  },
  {
    category: "🔵 SILENT USER",
    templates: [
      {
        title: "Re-engage",
        triggers: ["Stops replying"],
        goal: "Re-engage",
        responses: [
          { type: "Send", text: "Just checking in 🙂 Let us know if you still need help — we’re here for you." }
        ]
      }
    ]
  },
  {
    category: "🛡️ ADDICTION COMPLIANCE",
    templates: [
      {
        title: "Loss Distress / Stressed",
        triggers: ["I've lost too much", "I'm stressed"],
        responses: [
          { type: "Standard", text: "We understand this can be difficult. We recommend taking a break and reviewing your activity. You can also request self-exclusion or limits on your account at any time." },
          { type: "High Empathy", text: "We’re really sorry you’re feeling this way 🙏 Losses can be overwhelming. It may help to take a break for now. If you’d like, we can assist you in setting limits or activating self-exclusion to help you stay in control." }
        ]
      },
      {
        title: "Chasing Losses",
        triggers: ["I want to recover my money"],
        responses: [
          { type: "Standard", text: "We strongly advise against trying to recover losses through further betting. Please only play within your limits and consider taking a break." },
          { type: "High Empathy", text: "We understand the urge to recover losses 🙏 but chasing losses can lead to more risk. It’s best to pause and only continue when you feel fully in control." }
        ]
      },
      {
        title: "Self-Exclusion Request",
        responses: [
          { type: "Standard", text: "We can help you activate self-exclusion. Please confirm the period (1 week, 1 month, 3 months, or permanent)." },
          { type: "High Empathy", text: "We’re here to support you 🙏 Please let us know the self-exclusion period you prefer, and we’ll assist you immediately." }
        ]
      }
    ]
  },
  {
    category: "⚖️ HARD CASES",
    templates: [
      {
        title: "Angry / Blaming Platform",
        responses: [
          { type: "Standard", text: "We understand why this feels frustrating. We’ve reviewed your case and the outcome is based on system records and platform rules. We’re happy to walk you through the details so everything is clear." },
          { type: "High Empathy", text: "We understand this situation is upsetting 🙏 We’ve carefully reviewed your case and the outcome is based on verified system records. Let’s go through it together so you can clearly see what happened." }
        ]
      },
      {
        title: "Threatening Escalation",
        triggers: ["Chargeback", "Police", "Regulator"],
        responses: [
          { type: "Standard", text: "We understand your concerns. Please note your case has been fully reviewed in line with our terms and system records. You’re free to escalate through the appropriate channels, and we will provide all required records if requested." },
          { type: "High Empathy", text: "We understand your concerns and respect your right to escalate 🙏 Please note your case has been reviewed based on system logs and our platform policies. We will fully cooperate with any formal review if required." }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('Seeding AI Tagging System to Supabase...');
  
  // Wipe existing data
  await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('support_templates').insert(taggingSystem);
  if (error) {
    console.error('Error seeding AI tagging system:', error);
  } else {
    console.log('Successfully seeded AI Tagging System!');
  }
}

seed();
