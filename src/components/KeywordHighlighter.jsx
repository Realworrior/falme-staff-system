import React from 'react';

// Using non-capturing groups (?:) to avoid the Javascript String.split() bug
// where captured tokens are incorrectly pushed back into the array string, causing duplicates.
const HIGHLIGHTS = [
  // Emotional Temperatures: Cool (Info/ID)
  { keyword: /\b(?:Bet id)\b/gi, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 font-black' },
  { keyword: /\b(?:Phone number)\b/gi, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 font-black' },
  
  // Emotional Temperatures: Hot (Danger/Loss)
  { keyword: /\b(?:Amount lost)\b/gi, color: 'text-red-500 bg-red-500/10 border-red-500/20 font-black shadow-[0_0_8px_rgba(239,68,68,0.2)]' },
  { keyword: /\b(?:Delete)\b/gi, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 font-black' },
  
  // Emotional Temperatures: Success (Green/Emerald)
  { keyword: /\b(?:Withdrawal|Withdraw)\b/gi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-black' },
  { keyword: /\b(?:deposit)\b/gi, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 font-black' },
  { keyword: /\b(?:resolved)\b/gi, color: 'text-green-500 bg-green-500/10 border-green-500/20 font-black shadow-[0_0_8px_rgba(34,197,94,0.2)]' },
  
  // Emotional Temperatures: Warm (Value/Money)
  { keyword: /\b(?:Cashback)\b/gi, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-black' },

  // Supplementary (safely wrapped with ?:)
  { keyword: /\b(?:Betfront)\b/gi, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-sm shadow-blue-500/5' },
  { keyword: /\b(?:Betmfalme)\b/gi, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { keyword: /\b(?:Urgent|Critical)\b/gi, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 uppercase tracking-widest text-[8px]' },
  { keyword: /\b(?:Pending)\b/gi, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { keyword: /\b(?:Slot [12])\b/gi, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  
  { keyword: /\b(?:Stake|Odds|Wager|Bet)\b/gi, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { keyword: /\b(?:Multiplier|Cashout|Aviator)\b/gi, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-black' },
  { keyword: /\b(?:Win|Jackpot|Bonus)\b/gi, color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30 font-black' },
  { keyword: /\b(?:Client)\b/gi, color: 'text-white font-black underline decoration-red-500/50' },
  { keyword: /\b(?:Loss|Draw)\b/gi, color: 'text-gray-400 bg-white/5 border-white/10' },
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
