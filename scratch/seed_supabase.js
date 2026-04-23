
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedData = [
  {
    category: "Betting Rules",
    templates: [
      {
        title: "Settlement Delay",
        responses: [
          { type: "Standard", text: "We are currently awaiting official confirmation of the results for this event. Once confirmed, your bet will be settled immediately. Thank you for your patience." },
          { type: "Empathy", text: "I understand you're eager to see your winnings! Our team is verifying the final score with the official match providers to ensure 100% accuracy. It won't be much longer now." }
        ]
      },
      {
        title: "Void Bet Explanation",
        responses: [
          { type: "Standard", text: "Your bet was voided because the event was cancelled or postponed. The stake has been returned to your balance." },
          { type: "Empathy", text: "I'm sorry the match didn't go ahead as planned! Since the event was called off, we've refunded your stake in full to your account." }
        ]
      }
    ]
  },
  {
    category: "Payments",
    templates: [
      {
        title: "M-Pesa Delay",
        responses: [
          { type: "Standard", text: "M-Pesa withdrawals usually take up to 24 hours. Please check your transaction history or wait for the SMS confirmation." },
          { type: "Empathy", text: "I know how important it is to get your funds! M-Pesa is processing a high volume of requests right now, but your payout is in the queue and should arrive shortly." }
        ]
      },
      {
        title: "Deposit Not Reflecting",
        responses: [
          { type: "Standard", text: "If your deposit hasn't appeared, please provide the transaction code (e.g., M-Pesa Ref) so we can manually sync it." },
          { type: "Empathy", text: "Don't worry, your funds are safe! Sometimes the network takes a moment to sync. Just send me the transaction reference and I'll track it down for you right now." }
        ]
      }
    ]
  },
  {
    category: "Account Management",
    templates: [
      {
        title: "Password Reset",
        responses: [
          { type: "Standard", text: "Click on 'Forgot Password' on the login page to receive a reset link via SMS or Email." },
          { type: "Empathy", text: "Locked out? No problem! Just use the 'Forgot Password' link to get a fresh one sent to your phone instantly." }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('Seeding Supabase support_templates...');
  const { data, error } = await supabase.from('support_templates').insert(seedData);
  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully seeded support_templates!');
  }
}

seed();
