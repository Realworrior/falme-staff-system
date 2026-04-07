import React from 'react';

const HIGHLIGHTS = [
  { keyword: /\bBetfront\b/gi, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-sm shadow-blue-500/5' },
  { keyword: /\bQuickie\b/gi, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { keyword: /\b(Withdrawal|Deposit)\b/gi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { keyword: /\b(Urgent|Critical)\b/gi, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { keyword: /\bPending\b/gi, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { keyword: /\bResolved\b/gi, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { keyword: /\bSlot [12]\b/gi, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { keyword: /\b(Stake|Odds|Wager|Bet)\b/gi, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { keyword: /\b(Multiplier|Cashout|Aviator)\b/gi, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-black' },
  { keyword: /\b(Win|Jackpot|Bonus)\b/gi, color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30 font-black' },
  { keyword: /\b(Loss|Draw)\b/gi, color: 'text-gray-400 bg-white/5 border-white/10' },
  { keyword: /\bClient\b/gi, color: 'text-white font-black underline decoration-red-500/50' },
];

const KeywordHighlighter = ({ text }) => {
  if (!text) return null;

  // Split text into parts and wrap keywords
  // Using a single functional pass to handle multiple possible overlapping keywords
  // (though \b mostly prevents overlap issues for whole words)
  let parts = [{ text, isKeyword: false }];

  HIGHLIGHTS.forEach(({ keyword, color }) => {
    let nextParts = [];
    parts.forEach((part) => {
      if (part.isKeyword) {
        nextParts.push(part);
        return;
      }

      const splitParts = part.text.split(keyword);
      // We need to find the matches to preserve their original casing
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
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-tight border mx-0.5 align-middle ${p.color}`}
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
