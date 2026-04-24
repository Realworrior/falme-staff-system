import React from 'react';

// Using non-capturing groups (?:) to avoid the Javascript String.split() bug
// where captured tokens are incorrectly pushed back into the array string, causing duplicates.
const HIGHLIGHTS = [
  // Emotional Temperatures: Cool (ID & Personal Data) - Blue/Indigo
  { keyword: /\b(?:Bet id|User ID|Username)\b/gi, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 font-black ring-1 ring-blue-500/10' },
  { keyword: /\b(?:Phone number|Account number)\b/gi, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 font-black ring-1 ring-indigo-500/10' },
  
  // Emotional Temperatures: Hot (Danger/Alerts) - Red/Rose
  { keyword: /\b(?:Amount lost|Loss|Failed|Rejected)\b/gi, color: 'text-red-500 bg-red-500/10 border-red-500/20 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]' },
  { keyword: /\b(?:Delete|Deactivation)\b/gi, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 font-black' },
  { keyword: /\b(?:Urgent|Critical|Immediate)\b/gi, color: 'text-rose-400 bg-rose-600/20 border-rose-500/30 uppercase tracking-[0.2em]' },
  
  // Emotional Temperatures: Success (Financial/Money In) - Green/Emerald/Teal
  { keyword: /\b(?:Withdrawal|Withdraw|Cashout)\b/gi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-black' },
  { keyword: /\b(?:Deposit|Deposited|Top-up)\b/gi, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 font-black shadow-[0_0_10px_rgba(20,184,166,0.1)]' },
  { keyword: /\b(?:Resolved|Successful|Confirmed)\b/gi, color: 'text-green-500 bg-green-500/10 border-green-500/20 font-black' },
  
  // Emotional Temperatures: Warm (Value & Growth) - Amber/Orange/Purple
  { keyword: /\b(?:Cashback|Promo|Offer)\b/gi, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-black' },
  { keyword: /\b(?:Referral|Refer|Invite)\b/gi, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 font-black ring-1 ring-purple-500/20' },
  { keyword: /\b(?:Bonus|Reward|Jackpot)\b/gi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-black' },

  // Emotional Temperatures: Cautious (Limits & Rules) - Yellow/Orange
  { keyword: /\b(?:Limit|Threshold|Maximum|Minimum)\b/gi, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 font-black tracking-wide underline decoration-yellow-500/30' },
  { keyword: /\b(?:Pending|Awaiting)\b/gi, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },

  // System & Entities
  { keyword: /\b(?:Betfront|Betmfalme|Falme)\b/gi, color: 'text-white bg-red-600/20 border-red-500/30 font-black' },
  { keyword: /\b(?:Stake|Odds|Wager|Bet)\b/gi, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { keyword: /\b(?:Multiplier|Aviator)\b/gi, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 font-black' },
];

const KeywordHighlighter = ({ text }) => {
  if (!text) return null;

  let parts = [{ text, isKeyword: false }];

  HIGHLIGHTS.forEach(({ keyword, color }) => {
    let nextParts = [];
    parts.forEach((part) => {
      if (part.isKeyword) {
        nextParts.push(part);
        return;
      }

      // JavaScript String.split() handles non-capturing groups flawlessly
      const splitParts = part.text.split(keyword);
      const matches = part.text.match(keyword);

      splitParts.forEach((snippet, i) => {
        if (snippet !== '') {
          nextParts.push({ text: snippet, isKeyword: false });
        }
        if (matches && matches[i]) {
          nextParts.push({ text: matches[i], isKeyword: true, color });
        }
      });
    });
    parts = nextParts;
  });

  return (
    <span className="leading-relaxed">
      {parts.map((p, i) => (
        p.isKeyword ? (
          <span 
            key={i} 
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase tracking-tight border mx-0.5 align-middle ${p.color}`}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      ))}
    </span>
  );
};

export default KeywordHighlighter;
