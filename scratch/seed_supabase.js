
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedData = [
  {
    category: "Sports Betting",
    templates: [
      {
        title: "1X2 Market Explained",
        responses: [
          { type: "Standard", text: "1 represents Home Win, X represents a Draw, and 2 represents an Away Win. This is the most common market in football betting." },
          { type: "Expert", text: "When betting 1X2, you are predicting the final match result after 90 minutes. 1=Home, X=Draw, 2=Away. It excludes extra time and penalties unless specified." }
        ]
      },
      {
        title: "Over/Under 2.5",
        responses: [
          { type: "Standard", text: "Over 2.5 means 3 or more goals are scored. Under 2.5 means 2 or fewer goals are scored in the match." }
        ]
      }
    ]
  },
  {
    category: "Withdrawals",
    templates: [
      {
        title: "Withdrawal Status: Pending",
        responses: [
          { type: "Standard", text: "Your withdrawal is currently being processed. It can take up to 24 hours for the funds to reflect in your M-Pesa account." },
          { type: "Empathy", text: "I understand you're waiting for your winnings! Our finance team is currently processing a batch of requests. You should receive your SMS confirmation shortly." }
        ]
      }
    ]
  },
  {
    category: "Deposits",
    templates: [
      {
        title: "Manual Deposit Sync",
        responses: [
          { type: "Standard", text: "Please provide your M-Pesa transaction code so we can manually sync your deposit to your account." }
        ]
      }
    ]
  },
  {
    category: "Promotions",
    templates: [
      {
        title: "Welcome Bonus Terms",
        responses: [
          { type: "Standard", text: "The Welcome Bonus requires a minimum deposit of 100 KES and must be wagered 3 times on odds of 2.0 or higher." }
        ]
      }
    ]
  },
  {
    category: "Account Management",
    templates: [
      {
        title: "Password Recovery",
        responses: [
          { type: "Standard", text: "You can recover your password by clicking 'Forgot Password' and entering your registered phone number." }
        ]
      }
    ]
  },
  {
    category: "Casino & Games",
    templates: [
      {
        title: "Aviator History Check",
        responses: [
          { type: "Standard", text: "To see your Aviator history, click the 'History' icon (the clock) at the top right corner of the game screen." }
        ]
      }
    ]
  },
  {
    category: "Responsible Gaming",
    templates: [
      {
        title: "Self-Exclusion Policy",
        responses: [
          { type: "Standard", text: "If you'd like to take a break, we offer self-exclusion for 24 hours, 7 days, or 30 days. Please confirm your choice." }
        ]
      }
    ]
  },
  {
    category: "Technical Support",
    templates: [
      {
        title: "App Crashing Fix",
        responses: [
          { type: "Standard", text: "Please try clearing your browser cache or updating the app to the latest version. If the issue persists, let us know your device model." }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('Restoring Original Categories to Supabase...');
  
  // Wipe existing data first to ensure no duplicates
  const { error: deleteError } = await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('Error clearing old data:', deleteError);
    return;
  }

  const { data, error } = await supabase.from('support_templates').insert(seedData);
  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully restored original categories!');
  }
}

seed();
