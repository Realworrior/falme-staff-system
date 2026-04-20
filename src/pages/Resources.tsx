import { useState } from "react";
import { SmartAssistant } from "../components/SmartAssistant";
import { useGlobalData } from "../context/FirebaseDataContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppSection = "guide" | "manual";
type Sport = "soccer" | "basketball" | "tennis" | "combos";
type ManualSection =
  | "crash"
  | "virtual"
  | "casino"
  | "odds"
  | "promotions"
  | "support"
  | "compliance";
type Complexity = "beginner" | "intermediate" | "advanced";

interface MarketOption {
  name: string;
  description: string;
}
interface Rule {
  text: string;
}
interface Market {
  id: string;
  name: string;
  summary: string;
  complexity: Complexity;
  options?: MarketOption[];
  rules?: Rule[];
  example?: string;
  variations?: string[];
}
interface Category {
  id: string;
  label: string;
  tagline: string;
  icon: string;
  colorKey: string;
  markets: Market[];
}
interface SportData {
  label: string;
  icon: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  categories: Category[];
}

// ─── Crash Game ───────────────────────────────────────────────────────────────
interface CrashGame {
  name: string;
  theme: string;
  themeIcon: string;
  mechanic: string;
  historyHow: string;
}
// ─── Virtual Game ─────────────────────────────────────────────────────────────
interface VirtualGame {
  name: string;
  category: string;
  howToPlay: string;
}

// ─── Color map ────────────────────────────────────────────────────────────────
const colorMap: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  lime: {
    bg: "bg-lime-500/10",
    border: "border-lime-500/30",
    text: "text-lime-400",
    dot: "bg-lime-400",
  },
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-400",
    dot: "bg-teal-400",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  slate: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    text: "text-pink-400",
    dot: "bg-pink-400",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-400",
  },
  sky: {
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-400",
    dot: "bg-sky-400",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET GUIDE DATA
// ═══════════════════════════════════════════════════════════════════════════════
const sportsData: Record<Sport, SportData> = {
  soccer: {
    label: "Soccer",
    icon: "⚽",
    accent: "#22c55e",
    accentLight: "rgba(34,197,94,0.15)",
    accentBorder: "rgba(34,197,94,0.4)",
    categories: [
      {
        id: "outcome",
        label: "Who Takes the Points?",
        tagline:
          "Match result markets — the purest form of prediction.",
        icon: "🏆",
        colorKey: "green",
        markets: [
          {
            id: "1x2",
            name: "1X2 — Match Result",
            summary:
              "The most fundamental market in soccer. Predict the final outcome after 90 minutes of play including stoppage time.",
            complexity: "beginner",
            options: [
              {
                name: "1 — Home Win",
                description:
                  "The home team (first-listed) wins the match.",
              },
              {
                name: "X — Draw",
                description:
                  "The match ends level: 0-0, 1-1, 2-2, etc.",
              },
              {
                name: "2 — Away Win",
                description:
                  "The away team (second-listed) wins the match.",
              },
            ],
            rules: [
              {
                text: "Settled at the end of 90 min + stoppage time. Extra time and penalties do NOT count.",
              },
              {
                text: "Neutral venues: the first-listed team is always '1', the second is always '2'.",
              },
            ],
          },
          {
            id: "double-chance",
            name: "Double Chance",
            summary:
              "Cover two of the three possible 1X2 outcomes with a single bet — reduced risk, lower odds.",
            complexity: "beginner",
            options: [
              {
                name: "1X — Home or Draw",
                description:
                  "Loses only if the away team wins outright.",
              },
              {
                name: "X2 — Draw or Away",
                description:
                  "Loses only if the home team wins outright.",
              },
              {
                name: "12 — Home or Away",
                description:
                  "Loses only if the match ends in a draw.",
              },
            ],
          },
          {
            id: "dnb",
            name: "Draw No Bet (DNB)",
            summary:
              "Back a team to win with a safety net — your stake is refunded if the match is drawn.",
            complexity: "beginner",
            options: [
              {
                name: "Team Wins",
                description: "Your selection wins → bet wins.",
              },
              {
                name: "Draw",
                description:
                  "Match ends level → stake is fully refunded (bet voided).",
              },
              {
                name: "Team Loses",
                description:
                  "Your selection loses → bet loses.",
              },
            ],
          },
        ],
      },
      {
        id: "goals",
        label: "How Many & Who Scores?",
        tagline: "Total goals, exact scores, and goal bands.",
        icon: "🎯",
        colorKey: "emerald",
        markets: [
          {
            id: "over-under",
            name: "Over / Under — Total Goals",
            summary:
              "Wager on the combined number of goals scored by both teams across the full 90 minutes.",
            complexity: "beginner",
            options: [
              {
                name: "Over 0.5",
                description:
                  "At least 1 goal scored. Loses only on 0-0.",
              },
              {
                name: "Over 1.5",
                description:
                  "2 or more goals scored. Loses on 0-0 or 1-0 / 0-1.",
              },
              {
                name: "Over 2.5 ★ Most popular",
                description:
                  "Wins with 3+ goals (e.g., 2-1, 3-0, 2-2).",
              },
              {
                name: "Under 2.5",
                description:
                  "Wins with 0, 1, or 2 total goals.",
              },
            ],
            rules: [
              {
                text: "Settled after 90 min + stoppage time. Extra time is excluded.",
              },
              { text: "Own goals count toward the total." },
            ],
          },
          {
            id: "btts",
            name: "Both Teams To Score (BTTS)",
            summary:
              "A simple Yes/No wager — will both teams find the net at least once?",
            complexity: "beginner",
            options: [
              {
                name: "BTTS — Yes",
                description:
                  "Both teams score at least one goal (e.g., 1-1, 2-1, 1-3).",
              },
              {
                name: "BTTS — No",
                description:
                  "At least one team fails to score (e.g., 0-0, 1-0, 0-2).",
              },
            ],
            variations: [
              "BTTS in Both Halves — both teams must score in the first half AND the second half.",
              "BTTS + Over/Under — combined market requiring both teams to score AND total goals to clear/miss a line.",
            ],
          },
          {
            id: "correct-score",
            name: "Correct Score",
            summary:
              "Predict the exact final scoreline. Difficulty is rewarded with notably high odds.",
            complexity: "advanced",
            options: [
              {
                name: "Standard Scores",
                description:
                  "0-0, 1-0, 0-1, 1-1, 2-1, 1-2, 2-0, 0-2, and so on.",
              },
              {
                name: "Any Other Home Win",
                description:
                  "Covers rare home-win scores not explicitly listed (e.g., 5-1).",
              },
              {
                name: "Any Other Draw",
                description:
                  "Covers unlisted drawn scorelines (e.g., 4-4).",
              },
              {
                name: "Any Other Away Win",
                description: "Covers unlisted away-win scores.",
              },
            ],
            variations: [
              "Multi-Scores — select multiple scorelines in one bet (e.g., 1-0, 2-0, or 3-0). More coverage, lower odds.",
            ],
          },
          {
            id: "goal-intervals",
            name: "Goal Intervals & Bands",
            summary:
              "Wager on total goals falling within a defined range, or predict who scores first.",
            complexity: "intermediate",
            options: [
              {
                name: "0–1 Goals",
                description: "Match ends 0-0, 1-0, or 0-1.",
              },
              {
                name: "2–3 Goals",
                description: "Total goals in the 2–3 range.",
              },
              {
                name: "4–6 Goals",
                description:
                  "High-scoring: 4, 5, or 6 total goals.",
              },
              {
                name: "7+ Goals",
                description:
                  "Seven or more goals — a rare thriller.",
              },
            ],
            variations: [
              "First Team to Score — Home, Away, or None (0-0 result only).",
            ],
          },
        ],
      },
      {
        id: "handicap",
        label: "Evening the Odds",
        tagline: "Virtual advantages that reshape the contest.",
        icon: "⚖️",
        colorKey: "cyan",
        markets: [
          {
            id: "european-handicap",
            name: "European Handicap (3-Way)",
            summary:
              "Betfalme's primary handicap format. A virtual goal advantage or deficit is applied before kick-off, creating three possible outcomes.",
            complexity: "intermediate",
            example:
              "Sassuolo vs. Como — Handicap 0:1 (Como starts +1):\n• Handicap 1 (Sassuolo –1): Sassuolo must win by 2+ goals.\n• Handicap X (Draw –1): Sassuolo wins by exactly 1 goal (e.g., 1-0, 2-1).\n• Handicap 2 (Como +1): Como wins the match OR it ends in a draw.",
          },
          {
            id: "asian-handicap",
            name: "Asian Handicap (2-Way)",
            summary:
              "Eliminates the draw by using half-numbers. Cleaner two-way markets with no dead results.",
            complexity: "intermediate",
            options: [
              {
                name: "–0.5",
                description:
                  "Equivalent to a straight win for the team.",
              },
              {
                name: "+0.5",
                description:
                  "Equivalent to Double Chance (Win or Draw).",
              },
              {
                name: "–1.5",
                description:
                  "Team must win by 2 or more goals to pay out.",
              },
              {
                name: "+1.5",
                description:
                  "Wins if the team wins, draws, OR loses by exactly 1 goal.",
              },
            ],
          },
        ],
      },
      {
        id: "halftime",
        label: "By the Clock",
        tagline: "First 45 minutes — a match within the match.",
        icon: "⏱️",
        colorKey: "blue",
        markets: [
          {
            id: "ht-result",
            name: "Half-Time Result (1X2)",
            summary:
              "Settled at the referee's half-time whistle. Only the first 45 minutes plus stoppage time counts.",
            complexity: "intermediate",
            options: [
              {
                name: "1",
                description: "Home team leading at the break.",
              },
              {
                name: "X",
                description:
                  "Level at half-time (0-0, 1-1, etc.).",
              },
              {
                name: "2",
                description: "Away team leading at the break.",
              },
            ],
          },
          {
            id: "ht-ou",
            name: "Half-Time Over / Under",
            summary:
              "Total goals in the first half only — markets are typically tighter than full-match lines.",
            complexity: "intermediate",
            options: [
              {
                name: "Over/Under 0.5",
                description:
                  "At least 1 goal before the break (or fewer).",
              },
              {
                name: "Over/Under 1.5",
                description:
                  "At least 2 goals in the first half (or fewer).",
              },
            ],
          },
        ],
      },
      {
        id: "player",
        label: "Individual Brilliance",
        tagline: "Back a specific player to deliver.",
        icon: "⭐",
        colorKey: "yellow",
        markets: [
          {
            id: "anytime-goalscorer",
            name: "Anytime Goalscorer",
            summary:
              "Your selected player must score at least one goal at any point during the match.",
            complexity: "intermediate",
            rules: [
              {
                text: "Own goals do NOT count toward the anytime goalscorer market.",
              },
              {
                text: "Non-starters: bet stays active if the player comes on as a substitute. Voided if the player does not play at all.",
              },
            ],
          },
          {
            id: "first-goalscorer",
            name: "First Goalscorer",
            summary:
              "Your selected player must score the very first goal of the match — not just any goal.",
            complexity: "advanced",
            rules: [
              {
                text: "Own goals are ignored for this market — the bet remains active for the next goal scored by an outfield player.",
              },
            ],
          },
        ],
      },
      {
        id: "specials",
        label: "Beyond the Score",
        tagline: "Cards, corners, and shots on goal.",
        icon: "🃏",
        colorKey: "red",
        markets: [
          {
            id: "cards",
            name: "Card & Booking Markets",
            summary:
              "Wager on the total disciplinary cards or booking points accumulated during the 90 minutes.",
            complexity: "intermediate",
            options: [
              {
                name: "Over/Under 3.5 or 4.5 Cards",
                description:
                  "Yellow = 1 card · Red = 2 cards · Double yellow = 3 cards total.",
              },
              {
                name: "Booking Points",
                description:
                  "Yellow = 10 pts · Red = 25 pts · Double yellow = 35 pts.",
              },
            ],
            rules: [
              {
                text: "Cards shown to managers, coaches, or bench players do NOT count.",
              },
              {
                text: "Cards issued after the final whistle do NOT count.",
              },
            ],
          },
          {
            id: "corners",
            name: "Corner Markets",
            summary:
              "Bet on the total corner kicks awarded and taken during the match.",
            complexity: "intermediate",
            options: [
              {
                name: "Total Corners Over/Under",
                description:
                  "Common lines: 8.5, 9.5, or 10.5 corners per match.",
              },
              {
                name: "Corner Handicap",
                description:
                  "A virtual corner advantage or disadvantage applied to one team.",
              },
            ],
            rules: [
              {
                text: "A corner must be TAKEN to count. A corner awarded at the final whistle that is not taken does NOT count.",
              },
            ],
          },
          {
            id: "shots",
            name: "Shot Markets",
            summary:
              "Markets based on official statistics from the league or tournament organizers.",
            complexity: "advanced",
            options: [
              {
                name: "Total Shots Over/Under",
                description:
                  "All shots combined — on target, off target, and blocked.",
              },
              {
                name: "Shots on Target Over/Under",
                description:
                  "Only shots that would have entered the goal if not for a save or last-defender block.",
              },
            ],
            rules: [
              {
                text: "Shots that hit the post or crossbar and stay out are NOT counted as shots on target.",
              },
            ],
          },
        ],
      },
    ],
  },

  basketball: {
    label: "Basketball",
    icon: "🏀",
    accent: "#f97316",
    accentLight: "rgba(249,115,22,0.15)",
    accentBorder: "rgba(249,115,22,0.4)",
    categories: [
      {
        id: "outcome",
        label: "Who Takes the W?",
        tagline: "Pick a winner — with or without overtime.",
        icon: "🏆",
        colorKey: "orange",
        markets: [
          {
            id: "moneyline",
            name: "Money Line (Winner)",
            summary:
              "The simplest basketball market: pick which team wins the game outright.",
            complexity: "beginner",
            options: [
              {
                name: "Including Overtime",
                description:
                  "Most common format. If tied after Q4, the winner after overtime decides the bet.",
              },
              {
                name: "Excluding Overtime — 3-Way",
                description:
                  "Includes a Draw option. If tied at end of Q4, the Draw bet wins — even if one team wins in OT.",
              },
            ],
          },
        ],
      },
      {
        id: "spread",
        label: "Level the Court",
        tagline: "Point spreads that close the talent gap.",
        icon: "⚖️",
        colorKey: "amber",
        markets: [
          {
            id: "point-spread",
            name: "Point Spread (Handicap)",
            summary:
              "A virtual points advantage or disadvantage is assigned to level the field between a heavy favorite and an underdog.",
            complexity: "intermediate",
            example:
              "Phoenix Super LPG (–10.5) vs. Blackwater Bossing (+10.5):\n• Phoenix –10.5: Phoenix must win by 11 or more points.\n• Blackwater +10.5: Wins if Blackwater wins outright OR loses by 10 or fewer points.",
          },
        ],
      },
      {
        id: "totals",
        label: "The Scoreboard",
        tagline: "Will it be a shootout or a grind?",
        icon: "🔢",
        colorKey: "yellow",
        markets: [
          {
            id: "total-points",
            name: "Total Points (Over / Under)",
            summary:
              "Bet on whether the combined final score of both teams goes above or below a set number.",
            complexity: "beginner",
            example:
              "Over/Under 200.5 Points:\n• Over 200.5 — Wins if the combined score is 201 or more.\n• Under 200.5 — Wins if the combined score is 200 or fewer.",
          },
        ],
      },
      {
        id: "segments",
        label: "Quarter by Quarter",
        tagline: "Every segment is its own battleground.",
        icon: "⏱️",
        colorKey: "blue",
        markets: [
          {
            id: "quarter-betting",
            name: "Quarter Betting — Q1, Q2, Q3, Q4",
            summary:
              "Each of the four quarters carries its own isolated set of markets, settled at the buzzer.",
            complexity: "intermediate",
            options: [
              {
                name: "Quarter Winner",
                description:
                  "Which team scores more points in that specific quarter.",
              },
              {
                name: "Quarter Point Spread",
                description:
                  "A handicap applied to the scoring of a single quarter.",
              },
              {
                name: "Quarter Total Points",
                description:
                  "Over/Under for total points in that quarter alone.",
              },
            ],
          },
          {
            id: "half-betting",
            name: "Half Betting — 1st & 2nd Half",
            summary:
              "Markets that roll up the first two or last two quarters into a single bet.",
            complexity: "intermediate",
            options: [
              {
                name: "1st Half Money Line",
                description:
                  "Which team leads at the end of the 2nd quarter.",
              },
              {
                name: "1st Half Point Spread",
                description:
                  "Handicap across the combined first two quarters.",
              },
              {
                name: "1st Half Total Points",
                description:
                  "Over/Under for total points in Q1 + Q2.",
              },
            ],
          },
        ],
      },
      {
        id: "player",
        label: "Star Power",
        tagline: "Individual stat lines and milestone bets.",
        icon: "⭐",
        colorKey: "purple",
        markets: [
          {
            id: "player-points",
            name: "Player Points Over / Under",
            summary:
              "Bet on whether a selected player will score above or below a set points threshold in the game.",
            complexity: "intermediate",
            example:
              "LeBron James Over 25.5 Points\n→ Wins if he scores 26 or more points.",
          },
          {
            id: "player-rebounds-assists",
            name: "Player Rebounds / Assists",
            summary:
              "Same Over/Under concept applied to rebounds or assists — use official box-score statistics.",
            complexity: "intermediate",
          },
          {
            id: "double-triple",
            name: "Double-Double / Triple-Double",
            summary:
              "Will a player reach 10+ in multiple statistical categories? One of basketball's most iconic milestones.",
            complexity: "advanced",
            options: [
              {
                name: "Double-Double",
                description:
                  "Records 10 or more in any 2 of: Points, Rebounds, Assists, Steals, Blocks.",
              },
              {
                name: "Triple-Double",
                description:
                  "Records 10 or more in any 3 of the five categories above.",
              },
            ],
          },
        ],
      },
      {
        id: "rules",
        label: "The Rulebook",
        tagline:
          "What every agent must know before settling bets.",
        icon: "📋",
        colorKey: "slate",
        markets: [
          {
            id: "basketball-rules",
            name: "Key Settlement Rules for Basketball",
            summary:
              "Critical rules that govern how basketball markets on Betfalme are settled.",
            complexity: "beginner",
            rules: [
              {
                text: "Overtime — Most Match Result and Total Points markets include overtime unless explicitly stated otherwise.",
              },
              {
                text: "Postponed Games — If a game is not played within 24–48 hours of the scheduled time (varies by league), bets are typically voided.",
              },
              {
                text: "Abandoned Games — Bets are usually voided unless the market outcome was already determined (e.g., 1st Half markets if the game is abandoned in Q3).",
              },
            ],
          },
        ],
      },
    ],
  },

  tennis: {
    label: "Tennis",
    icon: "🎾",
    accent: "#eab308",
    accentLight: "rgba(234,179,8,0.15)",
    accentBorder: "rgba(234,179,8,0.4)",
    categories: [
      {
        id: "match",
        label: "Who Walks Off Victorious?",
        tagline: "Match-level markets — no draws, ever.",
        icon: "🏆",
        colorKey: "yellow",
        markets: [
          {
            id: "match-winner",
            name: "Match Winner — 2-Way",
            summary:
              "Bet on which player wins the match. Tennis always produces a winner — no draw option exists.",
            complexity: "beginner",
            options: [
              {
                name: "Player 1 (Home/First-listed)",
                description:
                  "The first player shown in the fixture listing.",
              },
              {
                name: "Player 2 (Away/Second-listed)",
                description:
                  "The second player shown in the fixture listing.",
              },
            ],
            rules: [
              {
                text: "Retirements: If at least one set is completed, the player advancing is declared the winner. If no set is complete, bets are typically voided.",
              },
            ],
          },
          {
            id: "set-betting",
            name: "Set Betting — Correct Score in Sets",
            summary:
              "Predict the final match score in sets — a harder call than a simple winner bet.",
            complexity: "intermediate",
            options: [
              {
                name: "Best of 3 Sets",
                description:
                  "Possible outcomes: 2-0, 2-1, 0-2, 1-2.",
              },
              {
                name: "Best of 5 Sets (Grand Slams)",
                description:
                  "Outcomes include: 3-0, 3-1, 3-2, 0-3, 1-3, 2-3.",
              },
            ],
          },
          {
            id: "set-handicap",
            name: "Set Handicap",
            summary:
              "A handicap applied to the number of sets won — forces a player to dominate to cover.",
            complexity: "intermediate",
            example:
              "Player 2 (–1.5 Sets) in a best-of-3:\n• Wins only if Player 2 wins the match 2-0.\n• Loses if Player 2 wins 2-1 or loses the match.",
          },
        ],
      },
      {
        id: "games",
        label: "Zooming into Games",
        tagline: "Total game counts across the full match.",
        icon: "🔢",
        colorKey: "lime",
        markets: [
          {
            id: "total-games",
            name: "Total Games — Over / Under",
            summary:
              "Wager on the total number of games played across all sets in the entire match.",
            complexity: "intermediate",
            example:
              "Over/Under 22.5 Games:\n• 6-4, 6-3 = 19 total games → Under 22.5 wins.\n• 7-6, 6-4 = 23 total games → Over 22.5 wins.",
          },
          {
            id: "game-handicap",
            name: "Game Handicap",
            summary:
              "A handicap applied to the total games won by each player across the whole match — can flip a loser into a winner.",
            complexity: "advanced",
            example:
              "Player 1 (+4.5 Games), match: Player 1 loses 6-4, 6-4\n→ Player 1 wins 8 games; Player 2 wins 12.\n→ With +4.5: Player 1's handicap total = 12.5 > 12\n→ BET WINS despite the match loss.",
          },
        ],
      },
      {
        id: "set-specific",
        label: "Inside a Single Set",
        tagline: "Drill into the opening set and beyond.",
        icon: "🎯",
        colorKey: "teal",
        markets: [
          {
            id: "set-winner",
            name: "1st Set Winner",
            summary:
              "Which player claims the opening set? A straightforward two-way market within the match.",
            complexity: "beginner",
          },
          {
            id: "set-total-games",
            name: "1st Set Total Games",
            summary:
              "Over/Under for the number of games played in the first set only — excludes all subsequent sets.",
            complexity: "intermediate",
            options: [
              {
                name: "Common Lines",
                description:
                  "Over/Under 8.5, 9.5, or 10.5 games in the 1st set. A 7-5 set = 12 games (Over 8.5 wins).",
              },
            ],
          },
          {
            id: "set-correct-score",
            name: "1st Set Correct Score",
            summary:
              "Predict the exact score of the first set (e.g., 6-0, 6-4, 7-6). High risk, high reward.",
            complexity: "advanced",
          },
        ],
      },
      {
        id: "rules",
        label: "Tennis Rulebook",
        tagline:
          "Rain delays, retirements, and tie-breaks explained.",
        icon: "📋",
        colorKey: "slate",
        markets: [
          {
            id: "tennis-rules",
            name: "Key Settlement Rules for Tennis",
            summary:
              "Essential rules every agent needs when handling tennis markets on Betfalme.",
            complexity: "beginner",
            rules: [
              {
                text: "Match Tie-Break — In some tournaments a 10-point tie-break replaces the 3rd set. It counts as ONE set and ONE game for all betting purposes.",
              },
              {
                text: "Change of Surface — If a match is moved from outdoor to indoor court (or vice versa), bets remain active.",
              },
              {
                text: "Delays — Rain delays are common in tennis. Bets stay active as long as the match is eventually completed within the tournament's scheduled timeframe.",
              },
            ],
          },
        ],
      },
    ],
  },

  combos: {
    label: "Logic & Combos",
    icon: "🔗",
    accent: "#a855f7",
    accentLight: "rgba(168,85,247,0.15)",
    accentBorder: "rgba(168,85,247,0.4)",
    categories: [
      {
        id: "and",
        label: "AND — Every Condition Must Be Met",
        tagline:
          "All conditions must hold simultaneously. One failure = full loss.",
        icon: "✅",
        colorKey: "purple",
        markets: [
          {
            id: "result-and-btts",
            name: "Match Result AND Both Teams To Score",
            summary:
              "Combines the 1X2 outcome with whether both teams score. Both conditions must be satisfied.",
            complexity: "intermediate",
            options: [
              {
                name: "Home and Yes",
                description:
                  "Home wins AND both teams score → e.g., 2-1, 3-1, 3-2.",
              },
              {
                name: "Home and No",
                description:
                  "Home wins AND only the home team scores → e.g., 1-0, 2-0, 3-0.",
              },
              {
                name: "Draw and Yes",
                description:
                  "Match drawn AND both teams score → e.g., 1-1, 2-2, 3-3.",
              },
              {
                name: "Draw and No",
                description:
                  "Match drawn AND no goals scored → 0-0 only.",
              },
              {
                name: "Away and Yes",
                description:
                  "Away wins AND both teams score → e.g., 1-2, 2-3.",
              },
              {
                name: "Away and No",
                description:
                  "Away wins AND only the away team scores → e.g., 0-1, 0-2.",
              },
            ],
          },
          {
            id: "result-and-ou",
            name: "Match Result AND Total Goals Over / Under",
            summary:
              "Combines the final result with a goal-count threshold. Both conditions are independently required.",
            complexity: "intermediate",
            example:
              "Home and Over 2.5:\n• Condition 1: Home team wins.\n• Condition 2: Total goals ≥ 3.\n• Wins: 2-1, 3-0, 3-1\n• Loses: 2-0 (home wins but only 2 goals) OR 2-2 (3+ goals but it's a draw).",
          },
          {
            id: "ht-and-btts",
            name: "Half-Time Result AND Both Teams To Score",
            summary:
              "The same logic as the full-match version, but assessed exclusively at the half-time whistle.",
            complexity: "advanced",
            example:
              "Selection: Draw and Yes (HT)\n• Condition 1: Match must be level at half-time.\n• Condition 2: Both teams must have scored at least once by the break.\n• Winning HT scores: 1-1, 2-2.",
          },
        ],
      },
      {
        id: "or",
        label: "OR — One Condition Is Enough",
        tagline:
          "Bet wins if at least one specified outcome occurs.",
        icon: "🔀",
        colorKey: "blue",
        markets: [
          {
            id: "double-chance-or",
            name: "Double Chance — The Pure OR Market",
            summary:
              "Double Chance is logically an OR between two 1X2 outcomes — easier to win, lower odds.",
            complexity: "beginner",
            options: [
              {
                name: "1X — Home OR Draw",
                description:
                  "Wins if the home team wins OR the match is drawn.",
              },
              {
                name: "X2 — Draw OR Away",
                description:
                  "Wins if the match is drawn OR the away team wins.",
              },
              {
                name: "12 — Home OR Away",
                description:
                  "Wins on any decisive result. Only a draw loses.",
              },
            ],
          },
          {
            id: "dc-and-btts",
            name: "Double Chance AND BTTS",
            summary:
              "A hybrid: an OR condition (Double Chance) combined with an AND condition (BTTS). Two operators in one market.",
            complexity: "advanced",
            example:
              "Home or Draw AND BTTS Yes:\n• Condition 1 (OR): Home wins OR it's a draw.\n• Condition 2 (AND): Both teams score.\n• Wins: 1-1, 2-1, 2-2, 3-1, 3-2\n• Loses: 1-0 (home wins but only one team scores)\n• Loses: 1-2 (both score but away wins — Cond 1 fails).",
          },
          {
            id: "multiscores",
            name: "Multi-Scores — OR of Exact Scorelines",
            summary:
              "Select multiple correct scores in a single bet. A logical OR across two or more precise outcomes.",
            complexity: "advanced",
            example:
              "Selection: 1-0, 2-0, or 3-0\n→ Wins if the final score is 1-0 OR 2-0 OR 3-0.\n→ More coverage than a single correct score, but lower odds.",
          },
        ],
      },
      {
        id: "no-nor",
        label: "NO / NOR — Betting on Absence",
        tagline: "Win when specific events do NOT happen.",
        icon: "🚫",
        colorKey: "red",
        markets: [
          {
            id: "btts-no",
            name: "BTTS — NO",
            summary:
              "Wins if at most one team scores. The logical negation of BTTS-Yes.",
            complexity: "beginner",
            options: [
              {
                name: "Winning Scores",
                description:
                  "0-0, 1-0, 0-1, 2-0, 0-2 — any score where one side is kept off the board.",
              },
              {
                name: "Losing Scores",
                description:
                  "1-1, 2-1, 1-2, 2-2 — any score where both teams register at least one goal.",
              },
            ],
          },
          {
            id: "clean-sheet",
            name: "Clean Sheet — Home / Away",
            summary:
              "Equivalent to 'the opposing team scores ZERO goals.' Straightforward but powerful.",
            complexity: "intermediate",
            options: [
              {
                name: "Home Clean Sheet — Yes",
                description:
                  "Away team scores NO goals. Home team does not concede.",
              },
              {
                name: "Home Clean Sheet — No",
                description:
                  "Away team scores at least 1 goal. Home team concedes.",
              },
            ],
          },
          {
            id: "neither-team",
            name: "Neither Team to Score (NOR)",
            summary:
              "A joint negation — Home scores NO goals AND Away scores NO goals. The only winning result is 0-0.",
            complexity: "intermediate",
            rules: [
              { text: "Only winning score: 0-0." },
              {
                text: "Typically found as the 'None' option inside 'First Team to Score' markets.",
              },
            ],
          },
          {
            id: "no-draw-btts",
            name: "No Draw BTTS — NO",
            summary:
              "A complex negation: the match will NOT end in a scoring draw. Scoring draws (1-1, 2-2) are the ONLY losing outcomes.",
            complexity: "advanced",
            options: [
              {
                name: "Losing Scenarios",
                description:
                  "1-1, 2-2, 3-3 — any drawn match where both teams scored.",
              },
              {
                name: "Winning Scenarios",
                description:
                  "Any decisive result (1-0, 0-1, 2-1) OR a goalless 0-0 draw.",
              },
            ],
          },
        ],
      },
      {
        id: "summary",
        label: "Operator Cheat Sheet",
        tagline:
          "The logical reference every agent needs on hand.",
        icon: "📊",
        colorKey: "indigo",
        markets: [
          {
            id: "logic-table",
            name: "Logical Operator Quick Reference",
            summary:
              "Four operators govern every combo market on Betfalme. Know them, settle correctly.",
            complexity: "beginner",
            options: [
              {
                name: "AND — Conjunction",
                description:
                  "ALL listed conditions must be true for the bet to win.",
              },
              {
                name: "OR — Disjunction",
                description:
                  "AT LEAST ONE listed condition must be true for the bet to win.",
              },
              {
                name: "NO / NOT — Negation",
                description:
                  "The specified event must NOT happen for the bet to win.",
              },
              {
                name: "NOR — Joint Negation",
                description:
                  "NEITHER event A NOR event B must happen for the bet to win.",
              },
            ],
          },
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT MANUAL DATA
// ═══════════════════════════════════════════════════════════════════════════════

const crashGames: CrashGame[] = [
  {
    name: "Aviator",
    theme: "Aviation",
    themeIcon: "✈️",
    mechanic:
      "Bet on the plane; cash out before it flies away.",
    historyHow: 'Click the "History" icon (top right).',
  },
  {
    name: "JetX",
    theme: "Space",
    themeIcon: "🚀",
    mechanic: "Bet on the jet; cash out before it explodes.",
    historyHow: 'Use the "Stats" tab on the left.',
  },
  {
    name: "Crash 1917",
    theme: "Vintage",
    themeIcon: "🛩️",
    mechanic: "Classic flight; cash out before the crash.",
    historyHow: "History bar at the top.",
  },
  {
    name: "Crash Royale",
    theme: "Luxury",
    themeIcon: "👑",
    mechanic: "Royal theme; cash out before the end.",
    historyHow: '"Recent Rounds" at the bottom.',
  },
  {
    name: "Avionix",
    theme: "Futurist",
    themeIcon: "🛸",
    mechanic: "Futuristic jet; cash out before explosion.",
    historyHow: '"Clock" icon in the menu.',
  },
  {
    name: "Aviatrix",
    theme: "NFT",
    themeIcon: "🎨",
    mechanic: "Upgrade planes; cash out before crash.",
    historyHow: '"My Bets" tab in-game.',
  },
  {
    name: "FootballX",
    theme: "Sports",
    themeIcon: "⚽",
    mechanic: "Juggling ball; cash out before it drops.",
    historyHow: "Ball icons at the top.",
  },
  {
    name: "Bazooka",
    theme: "Military",
    themeIcon: "💥",
    mechanic: "Missile launch; cash out before detonation.",
    historyHow: '"Log" section in settings.',
  },
  {
    name: "Crash Witch",
    theme: "Fantasy",
    themeIcon: "🧙",
    mechanic: "Witch on broom; cash out before she falls.",
    historyHow: "Scrollable list on the side.",
  },
  {
    name: "Balloon",
    theme: "Carnival",
    themeIcon: "🎈",
    mechanic: "Inflate balloon; cash out before it pops.",
    historyHow: '"Stats" menu in-game.',
  },
  {
    name: "Dragon Flare",
    theme: "Mythical",
    themeIcon: "🐉",
    mechanic: "Dragon flight; cash out before it vanishes.",
    historyHow: '"Dragon Log" in-game.',
  },
  {
    name: "Crash 3DX",
    theme: "3D",
    themeIcon: "🎮",
    mechanic: "3D visuals; cash out before the crash.",
    historyHow: "3D overlay sidebar.",
  },
  {
    name: "Hotcrash",
    theme: "Fire",
    themeIcon: "🔥",
    mechanic: "Heat-themed; cash out before the crash.",
    historyHow: '"Recent" tab in-game.',
  },
  {
    name: "Limbo",
    theme: "Minimal",
    themeIcon: "📉",
    mechanic:
      "Predict if next number > your target multiplier.",
    historyHow: "List of previous numbers shown.",
  },
  {
    name: "Crash Ghostly",
    theme: "Spooky",
    themeIcon: "👻",
    mechanic: "Ghostly ascent; cash out before it vanishes.",
    historyHow: '"Spirit Log" section.',
  },
  {
    name: "Tower",
    theme: "Building",
    themeIcon: "🏗️",
    mechanic: "Climb tower; cash out before collapse.",
    historyHow: '"Floor History" tab.',
  },
  {
    name: "HelicopterX",
    theme: "Aviation",
    themeIcon: "🚁",
    mechanic: "Chopper flight; cash out before crash.",
    historyHow: "History bar at the top.",
  },
];

const virtualSports: VirtualGame[] = [
  {
    name: "Ligi Kuu",
    category: "Soccer",
    howToPlay:
      "Bet on simulated Kenyan league matches. Markets: 1X2, O/U, GG.",
  },
  {
    name: "Virtual World Cup",
    category: "Soccer",
    howToPlay:
      "Tournament simulation. Bet on group stages and knockouts.",
  },
  {
    name: "Virtual Turbo League",
    category: "Soccer",
    howToPlay: "Fast-paced matches every 2 minutes.",
  },
  {
    name: "Virtual Champions League",
    category: "Soccer",
    howToPlay: "Elite club competition simulation.",
  },
  {
    name: "Basketball",
    category: "Sports",
    howToPlay: "Bet on winner, total points, and handicaps.",
  },
  {
    name: "Tennis",
    category: "Sports",
    howToPlay:
      "Bet on set winner, game score, and total games.",
  },
];

const virtualRacing: VirtualGame[] = [
  {
    name: "Marble Racing",
    category: "Racing",
    howToPlay: "Bet on the winning marble.",
  },
  {
    name: "Drag Racing",
    category: "Racing",
    howToPlay: "Bet on the winning car or top 2 finishers.",
  },
  {
    name: "Cycle Racing",
    category: "Racing",
    howToPlay: "Velodrome cycling; bet on winner or podium.",
  },
  {
    name: "Greyhound Racing",
    category: "Racing",
    howToPlay:
      "Virtual dog racing; bet on winner, forecast, or tricast.",
  },
  {
    name: "Horse Racing",
    category: "Racing",
    howToPlay:
      "Virtual horse racing; various track conditions.",
  },
  {
    name: "Instant Racing",
    category: "Racing",
    howToPlay:
      "On-demand races that start when the user is ready.",
  },
];

interface ManualSectionMeta {
  label: string;
  icon: string;
  tagline: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
}
const manualSections: Record<ManualSection, ManualSectionMeta> =
  {
    crash: {
      label: "Crash Games",
      icon: "🚀",
      tagline:
        "65+ multiplier games — mechanics & history lookup",
      accent: "#ef4444",
      accentLight: "rgba(239,68,68,0.15)",
      accentBorder: "rgba(239,68,68,0.4)",
    },
    virtual: {
      label: "Virtual Worlds",
      icon: "🌐",
      tagline: "24/7 RNG-powered sports & racing simulations",
      accent: "#06b6d4",
      accentLight: "rgba(6,182,212,0.15)",
      accentBorder: "rgba(6,182,212,0.4)",
    },
    casino: {
      label: "Casino & Slots",
      icon: "🎰",
      tagline: "Slots, live tables, and game history access",
      accent: "#f59e0b",
      accentLight: "rgba(245,158,11,0.15)",
      accentBorder: "rgba(245,158,11,0.4)",
    },
    odds: {
      label: "Odds & Markets",
      icon: "📊",
      tagline: "Decimal odds explained with KES examples",
      accent: "#22c55e",
      accentLight: "rgba(34,197,94,0.15)",
      accentBorder: "rgba(34,197,94,0.4)",
    },
    promotions: {
      label: "Rewards & Perks",
      icon: "💎",
      tagline:
        "Bonuses, cashback, VIP tiers, and referral program",
      accent: "#a855f7",
      accentLight: "rgba(168,85,247,0.15)",
      accentBorder: "rgba(168,85,247,0.4)",
    },
    support: {
      label: "Agent Toolkit",
      icon: "🛠️",
      tagline:
        "Troubleshooting, escalation matrix & key procedures",
      accent: "#3b82f6",
      accentLight: "rgba(59,130,246,0.15)",
      accentBorder: "rgba(59,130,246,0.4)",
    },
    compliance: {
      label: "Compliance",
      icon: "⚖️",
      tagline:
        "Responsible gaming, age verification & licensing",
      accent: "#10b981",
      accentLight: "rgba(16,185,129,0.15)",
      accentBorder: "rgba(16,185,129,0.4)",
    },
  };

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET GUIDE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityBadge({ level }: { level: Complexity }) {
  const cfg = {
    beginner: {
      label: "Beginner",
      cls: "bg-green-500/20 text-green-400 border-green-500/40",
    },
    intermediate: {
      label: "Intermediate",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    },
    advanced: {
      label: "Advanced",
      cls: "bg-red-500/20 text-red-400 border-red-500/40",
    },
  }[level];
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function MarketCard({
  market,
  accent,
}: {
  market: Market;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const hasExtra =
    (market.options?.length ?? 0) > 0 ||
    !!market.example ||
    (market.rules?.length ?? 0) > 0 ||
    (market.variations?.length ?? 0) > 0;
  return (
    <div
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden flex flex-col"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
    >
      <div
        className="h-[2px] w-full"
        style={{ background: accent }}
      />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="text-white leading-snug flex-1"
            style={{ fontSize: "0.92rem" }}
          >
            {market.name}
          </h4>
          <ComplexityBadge level={market.complexity} />
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          {market.summary}
        </p>
        {hasExtra && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs flex items-center gap-1.5 mt-auto self-start rounded-lg px-3 py-1.5 border transition-all"
            style={{
              color: accent,
              borderColor: `${accent}55`,
              background: `${accent}10`,
            }}
          >
            <span>
              {open ? "Hide details" : "Show details"}
            </span>
            <svg
              className="w-3 h-3 transition-transform"
              style={{
                transform: open
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
        {open && hasExtra && (
          <div className="flex flex-col gap-3 pt-1 border-t border-white/[0.06]">
            {market.options && market.options.length > 0 && (
              <div className="flex flex-col gap-2">
                {market.options.map((opt, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-start"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0"
                      style={{ background: accent }}
                    />
                    <div>
                      <span className="text-white text-sm">
                        {opt.name}
                      </span>
                      <span className="text-white/50 text-sm">
                        {" "}
                        — {opt.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {market.example && (
              <div
                className="rounded-lg p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap"
                style={{
                  background: `${accent}12`,
                  border: `1px solid ${accent}30`,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {market.example}
              </div>
            )}
            {market.rules && market.rules.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {market.rules.map((rule, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-start text-sm text-yellow-300/80"
                  >
                    <span className="shrink-0 mt-0.5">⚠</span>
                    <span>{rule.text}</span>
                  </div>
                ))}
              </div>
            )}
            {market.variations &&
              market.variations.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Variations
                  </p>
                  {market.variations.map((v, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-sm text-white/55"
                    >
                      <span className="shrink-0">→</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  accent,
}: {
  category: Category;
  accent: string;
}) {
  const colors = colorMap[category.colorKey] ?? colorMap.slate;
  return (
    <section className="mb-14">
      <div
        className={`flex items-center gap-4 mb-6 rounded-2xl px-5 py-4 border ${colors.bg} ${colors.border}`}
      >
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h2
            className={`${colors.text}`}
            style={{ fontSize: "1.1rem" }}
          >
            {category.label}
          </h2>
          <p className="text-white/45 text-sm">
            {category.tagline}
          </p>
        </div>
        <div
          className={`ml-auto text-xs px-3 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}
        >
          {category.markets.length}{" "}
          {category.markets.length === 1 ? "market" : "markets"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {category.markets.map((m) => (
          <MarketCard key={m.id} market={m} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function SportTab({
  sport,
  data,
  active,
  onClick,
}: {
  sport: Sport;
  data: SportData;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm transition-all whitespace-nowrap"
      style={{
        background: active
          ? data.accentLight
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? data.accentBorder : "rgba(255,255,255,0.08)"}`,
        color: active ? data.accent : "rgba(255,255,255,0.55)",
        boxShadow: active
          ? `0 0 20px ${data.accentLight}`
          : "none",
      }}
    >
      <span className="text-xl">{data.icon}</span>
      <span>{data.label}</span>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: active
            ? `${data.accent}30`
            : "rgba(255,255,255,0.07)",
          color: active
            ? data.accent
            : "rgba(255,255,255,0.35)",
        }}
      >
        {data.categories.length}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT MANUAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ManualTab({
  id,
  meta,
  active,
  onClick,
}: {
  id: ManualSection;
  meta: ManualSectionMeta;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap"
      style={{
        background: active
          ? meta.accentLight
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? meta.accentBorder : "rgba(255,255,255,0.08)"}`,
        color: active ? meta.accent : "rgba(255,255,255,0.55)",
      }}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </button>
  );
}

// ── Crash Games View ──────────────────────────────────────────────────────────
function CrashGamesView({ accent }: { accent: string }) {
  const [selected, setSelected] = useState<CrashGame | null>(
    null,
  );

  return (
    <div>
      {/* Mechanics Banner */}
      <div
        className="rounded-2xl p-5 mb-8 border border-red-500/20"
        style={{ background: "rgba(239,68,68,0.07)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚡</span>
          <h3
            className="text-white"
            style={{ fontSize: "1rem" }}
          >
            How All Crash Games Work
          </h3>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          A multiplier starts at{" "}
          <span className="text-red-400">1.00×</span> and climbs
          continuously. Players must click{" "}
          <span className="text-white/80">"Cash Out"</span>{" "}
          before the game crashes. Cash out in time → win your
          stake × multiplier. Wait too long → lose your stake.
          Each round is independently determined.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            ["Place Bet", "Set stake before round starts", "1"],
            [
              "Watch Multiplier Climb",
              "1.00× → 2.00× → 10.00× ...",
              "2",
            ],
            [
              "Cash Out in Time",
              "Before the crash point!",
              "3",
            ],
          ].map(([title, sub, n]) => (
            <div
              key={n}
              className="rounded-xl p-3 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="text-red-400 text-xs mb-1">
                Step {n}
              </div>
              <div className="text-white text-sm">{title}</div>
              <div className="text-white/40 text-xs mt-1">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Lookup */}
      <div
        className="rounded-2xl p-5 mb-8 border border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <h3
          className="text-white mb-4 flex items-center gap-2"
          style={{ fontSize: "1rem" }}
        >
          <span>📋</span> History Checking Procedures —
          Universal Steps
        </h3>
        {[
          [
            "In-Game History",
            "Most crash games display the last 10–20 round multipliers directly on the main screen.",
          ],
          [
            "Detailed Logs",
            'Click the "History" or "Stats" icon for a timestamped list of all rounds, including crash point and the user\'s specific action.',
          ],
          [
            "Platform History",
            'If a user disputes a result, check "My Bets" on the main Betfalme site — records Bet ID, Stake, and Settlement Status.',
          ],
        ].map(([step, desc], i) => (
          <div key={i} className="flex gap-4 mb-4 last:mb-0">
            <div
              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm"
              style={{ background: accent, color: "#000" }}
            >
              {i + 1}
            </div>
            <div>
              <div className="text-white text-sm">{step}</div>
              <div className="text-white/50 text-sm mt-0.5">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Grid */}
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-white/70 text-sm uppercase tracking-wider">
          Game Directory
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full border border-red-500/30 text-red-400"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          {crashGames.length} Games
        </span>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="ml-auto text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ✕ Clear selection
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {crashGames.map((g) => (
          <button
            key={g.name}
            onClick={() =>
              setSelected(selected?.name === g.name ? null : g)
            }
            className="text-left rounded-xl p-4 border transition-all"
            style={{
              background:
                selected?.name === g.name
                  ? `${accent}18`
                  : "rgba(255,255,255,0.03)",
              borderColor:
                selected?.name === g.name
                  ? `${accent}60`
                  : "rgba(255,255,255,0.07)",
              boxShadow:
                selected?.name === g.name
                  ? `0 0 20px ${accent}20`
                  : "none",
            }}
          >
            <div className="text-2xl mb-2">{g.themeIcon}</div>
            <div className="text-white text-sm">{g.name}</div>
            <div className="text-white/40 text-xs mt-0.5">
              {g.theme}
            </div>
          </button>
        ))}
      </div>

      {/* Selected game detail */}
      {selected && (
        <div
          className="mt-4 rounded-2xl p-5 border"
          style={{
            background: `${accent}10`,
            borderColor: `${accent}40`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">
              {selected.themeIcon}
            </span>
            <div>
              <div className="text-white">{selected.name}</div>
              <div className="text-white/40 text-sm">
                {selected.theme} Theme
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4 border border-white/[0.06]"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                How to Play
              </div>
              <div className="text-white/80 text-sm">
                {selected.mechanic}
              </div>
            </div>
            <div
              className="rounded-xl p-4 border border-white/[0.06]"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                Checking History
              </div>
              <div className="text-white/80 text-sm">
                {selected.historyHow}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Virtual Games View ────────────────────────────────────────────────────────
function VirtualGamesView({ accent }: { accent: string }) {
  const [tab, setTab] = useState<"sports" | "racing">("sports");
  const games =
    tab === "sports" ? virtualSports : virtualRacing;
  const categoryIcons: Record<string, string> = {
    Soccer: "⚽",
    Sports: "🏅",
    Racing: "🏁",
  };

  return (
    <div>
      {/* RNG Banner */}
      <div
        className="rounded-2xl p-5 mb-8 border border-cyan-500/20"
        style={{ background: "rgba(6,182,212,0.07)" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🔐</span>
          <div>
            <h3
              className="text-cyan-400 mb-1"
              style={{ fontSize: "0.95rem" }}
            >
              RNG Certification & Fairness
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              All virtual games on Betfalme.ke are powered by a
              certified{" "}
              <span className="text-white/80">
                Random Number Generator (RNG)
              </span>
              . Every match, race, or event is completely
              unbiased and statistically independent of all
              previous results. Agents can confirm this to users
              with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tab */}
      <div className="flex gap-3 mb-6">
        {(["sports", "racing"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2.5 rounded-xl text-sm border transition-all"
            style={{
              background:
                tab === t
                  ? `${accent}15`
                  : "rgba(255,255,255,0.04)",
              borderColor:
                tab === t
                  ? `${accent}50`
                  : "rgba(255,255,255,0.08)",
              color:
                tab === t ? accent : "rgba(255,255,255,0.5)",
            }}
          >
            {t === "sports"
              ? "🏅 Virtual Sports"
              : "🏁 Virtual Racing"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {games.map((g) => (
          <div
            key={g.name}
            className="rounded-xl p-4 border border-white/[0.07] flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {categoryIcons[g.category] ?? "🎮"}
              </span>
              <div>
                <div className="text-white text-sm">
                  {g.name}
                </div>
                <div className="text-white/35 text-xs">
                  {g.category}
                </div>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed border-t border-white/[0.06] pt-3">
              {g.howToPlay}
            </p>
          </div>
        ))}
      </div>

      {/* History procedures */}
      <div
        className="mt-8 rounded-2xl p-5 border border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <h3
          className="text-white mb-4 flex items-center gap-2"
          style={{ fontSize: "1rem" }}
        >
          <span>📋</span> Checking Virtual Bet History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-4 border border-cyan-500/20"
            style={{ background: "rgba(6,182,212,0.06)" }}
          >
            <div className="text-cyan-400 text-sm mb-2">
              Results Tab
            </div>
            <div className="text-white/60 text-sm">
              Every virtual game has a "Results" or "History"
              tab showing the outcomes of the last 50 events.
            </div>
          </div>
          <div
            className="rounded-xl p-4 border border-cyan-500/20"
            style={{ background: "rgba(6,182,212,0.06)" }}
          >
            <div className="text-cyan-400 text-sm mb-2">
              My Bets → Settled
            </div>
            <div className="text-white/60 text-sm">
              Users can see their specific virtual bets in the
              "My Bets" → "Settled" section of their account.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Casino & Slots View ───────────────────────────────────────────────────────
function CasinoView({ accent }: { accent: string }) {
  const popularSlots = [
    "Honey Money",
    "Sweet Bonanza",
    "Gates of Olympus",
    "The Dog House",
  ];
  const liveGames = [
    "Roulette",
    "Blackjack",
    "Baccarat",
    "Poker",
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Slots */}
      <div>
        <div
          className="flex items-center gap-3 mb-5 rounded-2xl px-5 py-4 border border-yellow-500/20"
          style={{ background: "rgba(245,158,11,0.07)" }}
        >
          <span className="text-3xl">🎰</span>
          <div>
            <h3
              className="text-yellow-400"
              style={{ fontSize: "1rem" }}
            >
              Slots — Mechanics & RTP
            </h3>
            <p className="text-white/45 text-sm">
              Return to Player typically ranges from 94% to 98%
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4 border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="text-white/40 text-xs uppercase tracking-wider mb-3">
              How to Play
            </div>
            <p className="text-white/65 text-sm">
              Set the coin value or bet level, then click{" "}
              <span className="text-white/90">"Spin."</span>{" "}
              Matching symbols on paylines trigger wins. Each
              game's rules differ — check the paytable.
            </p>
          </div>
          <div
            className="rounded-xl p-4 border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Popular Slots
            </div>
            <div className="flex flex-col gap-2">
              {popularSlots.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 text-sm text-white/75"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accent }}
                  />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-xl p-4 border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Bonus Rounds
            </div>
            <p className="text-white/65 text-sm">
              Many slots feature{" "}
              <span className="text-white/90">Free Spins</span>{" "}
              or{" "}
              <span className="text-white/90">"Pick Me"</span>{" "}
              bonuses triggered by Scatter symbols landing on
              the reels simultaneously.
            </p>
          </div>
        </div>
      </div>

      {/* Live Casino */}
      <div>
        <div
          className="flex items-center gap-3 mb-5 rounded-2xl px-5 py-4 border border-yellow-500/20"
          style={{ background: "rgba(245,158,11,0.07)" }}
        >
          <span className="text-3xl">🎬</span>
          <div>
            <h3
              className="text-yellow-400"
              style={{ fontSize: "1rem" }}
            >
              Live Casino — Real Dealers, Real Time
            </h3>
            <p className="text-white/45 text-sm">
              Streamed from professional studios — results via
              physical action, not RNG
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {liveGames.map((g) => (
            <div
              key={g}
              className="rounded-xl p-4 border border-white/[0.07] text-center"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="text-2xl mb-2">
                {
                  {
                    Roulette: "🎡",
                    Blackjack: "🃏",
                    Baccarat: "🂡",
                    Poker: "♠️",
                  }[g]
                }
              </div>
              <div className="text-white text-sm">{g}</div>
              <div className="text-white/35 text-xs mt-1">
                Live Dealer
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-white/40 text-sm px-1">
          Users can chat with the dealer and other players in
          real time. Results are physical — no RNG involved.
        </p>
      </div>

      {/* Table Games + Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5 border border-white/[0.07]"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎲</span>
            <span
              className="text-white"
              style={{ fontSize: "0.95rem" }}
            >
              Table Games (RNG)
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Digital versions of classic casino games. RNG-based
            and faster-paced than live casino. Same core rules —
            Blackjack, Roulette, Baccarat — but without the
            dealer stream.
          </p>
        </div>
        <div
          className="rounded-xl p-5 border border-yellow-500/20"
          style={{ background: "rgba(245,158,11,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📂</span>
            <span
              className="text-yellow-400"
              style={{ fontSize: "0.95rem" }}
            >
              Accessing Game Logs
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Within any casino game, click the{" "}
            <span className="text-white/80">Menu (≡)</span> or{" "}
            <span className="text-white/80">Settings (⚙)</span>{" "}
            icon and select{" "}
            <span className="text-yellow-400">
              "Game History."
            </span>{" "}
            This provides a complete breakdown of every spin or
            hand played with timestamps.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Odds & Markets View ───────────────────────────────────────────────────────
function OddsView({ accent }: { accent: string }) {
  const [stake, setStake] = useState(100);
  const [odds, setOdds] = useState(2.5);
  const totalReturn = (stake * odds).toFixed(2);
  const profit = (stake * odds - stake).toFixed(2);

  return (
    <div className="flex flex-col gap-8">
      {/* Calculator */}
      <div
        className="rounded-2xl p-6 border border-green-500/25"
        style={{ background: "rgba(34,197,94,0.07)" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🧮</span>
          <h3
            className="text-green-400"
            style={{ fontSize: "1rem" }}
          >
            Live Decimal Odds Calculator
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
              Stake (KSH)
            </label>
            <input
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none border border-white/10 bg-white/5 focus:border-green-500/50"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
              Odds (Decimal)
            </label>
            <input
              type="number"
              min={1}
              step={0.1}
              value={odds}
              onChange={(e) => setOdds(Number(e.target.value))}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none border border-white/10 bg-white/5 focus:border-green-500/50"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="rounded-xl p-4 border border-white/[0.06]"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Total Return
            </div>
            <div className="text-green-400 text-xl">
              KSH {Number(totalReturn).toLocaleString()}
            </div>
          </div>
          <div
            className="rounded-xl p-4 border border-white/[0.06]"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Profit
            </div>
            <div className="text-green-400 text-xl">
              KSH {Number(profit).toLocaleString()}
            </div>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-3">
          Formula: Stake × Odds = Total Return · Profit = Total
          Return − Stake
        </p>
      </div>

      {/* Market Directory */}
      <div>
        <h3 className="text-white/70 text-sm uppercase tracking-wider mb-4">
          Market Quick-Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              code: "1X2",
              name: "Match Result",
              desc: "Home Win (1), Draw (X), Away Win (2).",
            },
            {
              code: "O/U",
              name: "Over / Under",
              desc: "Total goals above or below a line (e.g., 2.5).",
            },
            {
              code: "GG/NG",
              name: "Both Teams to Score",
              desc: "GG = both teams score; NG = at least one team does not.",
            },
            {
              code: "DC",
              name: "Double Chance",
              desc: "Covering two outcomes (1X, X2, 12).",
            },
          ].map((m) => (
            <div
              key={m.code}
              className="flex gap-4 rounded-xl p-4 border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm self-start"
                style={{
                  background: `${accent}20`,
                  color: accent,
                  border: `1px solid ${accent}40`,
                }}
              >
                {m.code}
              </div>
              <div>
                <div className="text-white text-sm">
                  {m.name}
                </div>
                <div className="text-white/50 text-sm mt-0.5">
                  {m.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Promotions View ───────────────────────────────────────────────────────────
function PromotionsView({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Bonus */}
      <div className="rounded-2xl overflow-hidden border border-purple-500/25">
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ background: "rgba(168,85,247,0.2)" }}
        >
          <span className="text-2xl">🎁</span>
          <div>
            <h3
              className="text-purple-300"
              style={{ fontSize: "1rem" }}
            >
              Welcome Bonus — 100% First Deposit
            </h3>
            <p className="text-white/40 text-sm">
              Up to KES 10,000
            </p>
          </div>
        </div>
        <div
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ background: "rgba(168,85,247,0.05)" }}
        >
          <div
            className="rounded-xl p-4 border border-white/[0.06]"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div className="text-purple-400 text-xs uppercase tracking-wider mb-2">
              How It Works
            </div>
            <p className="text-white/65 text-sm">
              Deposit KES 1,000 → receive KES 1,000 bonus → play
              with KES 2,000 total.
            </p>
          </div>
          <div
            className="rounded-xl p-4 border border-white/[0.06]"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div className="text-yellow-400 text-xs uppercase tracking-wider mb-2">
              ⚠ Wagering Requirements
            </div>
            <p className="text-white/65 text-sm">
              Bonus must be wagered a specified number of times
              (e.g., 5×) on odds of{" "}
              <span className="text-white/90">
                1.50 or higher
              </span>{" "}
              before withdrawal is permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Cashback */}
      <div>
        <h3 className="text-white/70 text-sm uppercase tracking-wider mb-4">
          Cashback Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-5 border border-purple-500/20"
            style={{ background: "rgba(168,85,247,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔄</span>
              <span
                className="text-purple-300"
                style={{ fontSize: "0.95rem" }}
              >
                10% Daily Cashback
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Automatically credited based on net losses in{" "}
              <span className="text-white/80">
                Crash and Casino games
              </span>
              . Calculated daily and applied to your account the
              following morning.
            </p>
          </div>
          <div
            className="rounded-2xl p-5 border border-purple-500/20"
            style={{ background: "rgba(168,85,247,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📅</span>
              <span
                className="text-purple-300"
                style={{ fontSize: "0.95rem" }}
              >
                25% Weekly Sportsbook Cashback
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Credited every{" "}
              <span className="text-white/80">Monday</span>{" "}
              based on the previous week's sports betting
              activity. Applied to net losses across all
              sportsbook markets.
            </p>
          </div>
        </div>
      </div>

      {/* VIP & Referral */}
      <div>
        <h3 className="text-white/70 text-sm uppercase tracking-wider mb-4">
          VIP & Referral Program
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-5 border border-purple-500/20"
            style={{ background: "rgba(168,85,247,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔗</span>
              <span
                className="text-purple-300"
                style={{ fontSize: "0.95rem" }}
              >
                Refer & Earn
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              Users receive a unique referral link. They earn a
              commission based on their referred users'
              activity.
            </p>
            <div
              className="rounded-xl p-3 border border-purple-500/25 text-center"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <div className="text-purple-400 text-xs uppercase tracking-wider">
                Maximum Commission
              </div>
              <div className="text-white text-xl mt-1">
                KSH 350,000
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl p-5 border border-purple-500/20"
            style={{ background: "rgba(168,85,247,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">👑</span>
              <span
                className="text-purple-300"
                style={{ fontSize: "0.95rem" }}
              >
                VIP Tiers
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              High-volume players receive dedicated account
              managers, priority support, and enhanced cashback
              rates.
            </p>
            <div
              className="rounded-xl p-3 border border-purple-500/25 text-center"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <div className="text-purple-400 text-xs uppercase tracking-wider">
                VIP Max Cashback
              </div>
              <div className="text-white text-xl mt-1">
                Up to 70%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Support View ──────────────────────────────────────────────────────────────
function SupportView({ accent }: { accent: string }) {
  const issues = [
    {
      issue: "Game Frozen",
      icon: "❄️",
      response:
        "Advise the user to refresh the page or clear their browser cache.",
      important:
        "The bet result is already recorded on the server — the game state will restore.",
    },
    {
      issue: "Deposit Not Reflecting",
      icon: "💳",
      response: "Ask for the M-PESA transaction code.",
      important:
        "Verify with the finance team that Paybill 562424 received the funds before any manual adjustment.",
    },
  ];

  const escalation = [
    {
      level: 1,
      title: "Level 1 — Agent",
      color: "#22c55e",
      items: [
        "General queries",
        "How-to-play guidance",
        "Basic troubleshooting",
      ],
    },
    {
      level: 2,
      title: "Level 2 — Supervisor",
      color: "#f59e0b",
      items: [
        "Bonus disputes",
        "Withdrawal delays",
        "Account verification issues",
      ],
    },
    {
      level: 3,
      title: "Level 3 — Technical / Compliance",
      color: "#ef4444",
      items: [
        "Suspected bugs",
        "Platform downtime",
        "Fraud investigations",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Common Issues */}
      <div>
        <div
          className="flex items-center gap-3 mb-5 rounded-2xl px-5 py-4 border border-blue-500/20"
          style={{ background: "rgba(59,130,246,0.07)" }}
        >
          <span className="text-3xl">🔧</span>
          <div>
            <h3
              className="text-blue-400"
              style={{ fontSize: "1rem" }}
            >
              Common Technical Issues
            </h3>
            <p className="text-white/45 text-sm">
              First-response scripts for the most frequent user
              queries
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((i) => (
            <div
              key={i.issue}
              className="rounded-xl p-5 border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{i.icon}</span>
                <div
                  className="text-white"
                  style={{ fontSize: "0.92rem" }}
                >
                  "{i.issue}"
                </div>
              </div>
              <p className="text-white/65 text-sm mb-3">
                {i.response}
              </p>
              <div
                className="rounded-lg p-3 border border-yellow-500/25"
                style={{ background: "rgba(245,158,11,0.08)" }}
              >
                <div className="text-yellow-400 text-xs uppercase tracking-wider mb-1">
                  Important
                </div>
                <p className="text-white/65 text-sm">
                  {i.important}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Matrix */}
      <div>
        <div
          className="flex items-center gap-3 mb-5 rounded-2xl px-5 py-4 border border-blue-500/20"
          style={{ background: "rgba(59,130,246,0.07)" }}
        >
          <span className="text-3xl">📶</span>
          <div>
            <h3
              className="text-blue-400"
              style={{ fontSize: "1rem" }}
            >
              Escalation Matrix
            </h3>
            <p className="text-white/45 text-sm">
              Always start at Level 1 before escalating upward
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {escalation.map((e, idx) => (
            <div
              key={e.level}
              className="flex gap-4 items-start"
            >
              {/* Connector */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                  style={{ background: e.color, color: "#000" }}
                >
                  {e.level}
                </div>
                {idx < escalation.length - 1 && (
                  <div
                    className="w-0.5 h-6 mt-1"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
              <div
                className="flex-1 rounded-xl p-4 border border-white/[0.07] mb-0"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderLeftColor: e.color,
                  borderLeftWidth: "2px",
                }}
              >
                <div className="text-white text-sm mb-2">
                  {e.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {e.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-white/55"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Compliance View ───────────────────────────────────────────────────────────
function ComplianceView({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-6">
      {/* License banner */}
      <div
        className="rounded-2xl p-5 border border-emerald-500/25 flex items-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
        }}
      >
        <span className="text-4xl">🏛️</span>
        <div>
          <div className="text-emerald-400 text-xs uppercase tracking-wider mb-1">
            Official Licensing
          </div>
          <h3
            className="text-white"
            style={{ fontSize: "1.1rem" }}
          >
            Betfalme.ke is licensed by the BCLB
          </h3>
          <p className="text-white/50 text-sm mt-0.5">
            License Number:{" "}
            <span className="text-white/80 font-mono">
              BK-0001132
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 border border-emerald-500/20"
          style={{ background: "rgba(16,185,129,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔞</span>
          </div>
          <h4
            className="text-emerald-400 mb-2"
            style={{ fontSize: "0.95rem" }}
          >
            Age Verification — Strictly 18+
          </h4>
          <p className="text-white/60 text-sm leading-relaxed">
            Any user suspected of being a minor must have their
            account{" "}
            <span className="text-red-400">
              suspended immediately
            </span>
            . Do not wait for confirmation before acting. Flag
            to Level 2 supervisor immediately.
          </p>
        </div>
        <div
          className="rounded-2xl p-5 border border-emerald-500/20"
          style={{ background: "rgba(16,185,129,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚧</span>
          </div>
          <h4
            className="text-emerald-400 mb-2"
            style={{ fontSize: "0.95rem" }}
          >
            Self-Exclusion Options
          </h4>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            Users can voluntarily request to be blocked from the
            platform. Always process these requests promptly
            without question.
          </p>
          <div className="flex flex-col gap-2">
            {["24 Hours", "1 Week", "Permanently"].map(
              (dur) => (
                <div
                  key={dur}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accent }}
                  />
                  <span className="text-white/70">{dur}</span>
                </div>
              ),
            )}
          </div>
        </div>
        <div
          className="rounded-2xl p-5 border border-emerald-500/20"
          style={{ background: "rgba(16,185,129,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📜</span>
          </div>
          <h4
            className="text-emerald-400 mb-2"
            style={{ fontSize: "0.95rem" }}
          >
            Agent Responsibilities
          </h4>
          <div className="flex flex-col gap-2">
            {[
              "Never encourage excessive betting",
              "Always explain wagering requirements clearly",
              "Escalate any fraud suspicions to Level 3 immediately",
              "Maintain confidentiality of all user data",
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-2 text-sm text-white/60"
              >
                <span className="text-emerald-400 shrink-0">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Agent Manual Shell ────────────────────────────────────────────────────────
function AgentManualView() {
  const [active, setActive] = useState<ManualSection>("crash");
  const meta = manualSections[active];

  return (
    <div>
      {/* Manual nav */}
      <div
        className="sticky top-[57px] z-40 backdrop-blur-xl"
        style={{
          background: "rgba(8,13,26,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
          {(
            Object.entries(manualSections) as [
              ManualSection,
              ManualSectionMeta,
            ][]
          ).map(([key, m]) => (
            <ManualTab
              key={key}
              id={key}
              meta={m}
              active={active === key}
              onClick={() => setActive(key)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-20">

        {/* Section header */}
        <div
          className="flex items-center gap-4 mb-8 rounded-2xl px-6 py-5 border"
          style={{
            background: meta.accentLight,
            borderColor: meta.accentBorder,
          }}
        >
          <span className="text-4xl">{meta.icon}</span>
          <div>
            <h2
              className="text-white"
              style={{ fontSize: "1.3rem" }}
            >
              {meta.label}
            </h2>
            <p className="text-white/50 text-sm mt-0.5">
              {meta.tagline}
            </p>
          </div>
          <div
            className="ml-auto px-3 py-1 rounded-full text-xs border"
            style={{
              background: meta.accentLight,
              borderColor: meta.accentBorder,
              color: meta.accent,
            }}
          >
            Agent Manual v2.0
          </div>
        </div>

        {active === "crash" && (
          <CrashGamesView accent={meta.accent} />
        )}
        {active === "virtual" && (
          <VirtualGamesView accent={meta.accent} />
        )}
        {active === "casino" && (
          <CasinoView accent={meta.accent} />
        )}
        {active === "odds" && <OddsView accent={meta.accent} />}
        {active === "promotions" && (
          <PromotionsView accent={meta.accent} />
        )}
        {active === "support" && (
          <SupportView accent={meta.accent} />
        )}
        {active === "compliance" && (
          <ComplianceView accent={meta.accent} />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET GUIDE SHELL
// ═══════════════════════════════════════════════════════════════════════════════
function MarketGuideView() {
  const [activeSport, setActiveSport] =
    useState<Sport>("soccer");
  const sport = sportsData[activeSport];
  const totalMarkets = sport.categories.reduce(
    (acc, cat) => acc + cat.markets.length,
    0,
  );

  return (
    <div>
      {/* Sport Nav */}
      <div
        className="sticky top-[57px] z-40 backdrop-blur-xl"
        style={{
          background: "rgba(8,13,26,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-3 overflow-x-auto">
          {(
            Object.entries(sportsData) as [Sport, SportData][]
          ).map(([key, data]) => (
            <SportTab
              key={key}
              sport={key}
              data={data}
              active={activeSport === key}
              onClick={() => setActiveSport(key)}
            />
          ))}
          <div className="ml-auto flex items-center gap-4 pl-4 border-l border-white/[0.06] shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400" />{" "}
              Beginner
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />{" "}
              Intermediate
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />{" "}
              Advanced
            </div>
          </div>
        </div>
      </div>

      {/* Sport hero strip */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2 flex items-center gap-3">

        <div className="text-3xl">{sport.icon}</div>
        <div>
          <div
            className="text-white"
            style={{ fontSize: "1rem", color: sport.accent }}
          >
            {sport.label} Markets
          </div>
          <div className="text-white/35 text-sm">
            {sport.categories.length} categories ·{" "}
            {totalMarkets} markets
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-20">

        {sport.categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            accent={sport.accent}
          />
        ))}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-white/30 text-sm">
            Betfalme.ke Sportsbook Market Guide · Soccer Parts
            1–3 · Basketball Part 4 · Tennis Part 5 · Logical
            &amp; Combo Markets
          </p>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function Resources() {
  const [section, setSection] = useState<AppSection>("guide");
  const { templates } = useGlobalData();

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#080d1a" }}
    >
      {/* ── Top Nav ── */}
      <div
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(8,13,26,0.96)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[57px] flex items-center justify-center gap-2 md:gap-6">




          {/* Section switcher */}
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {(
              [
                {
                  id: "guide",
                  label: "Market Guide",
                  icon: "📖",
                },
                {
                  id: "manual",
                  label: "Agent Manual",
                  icon: "🛡️",
                },
              ] as {
                id: AppSection;
                label: string;
                icon: string;
              }[]
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background:
                    section === s.id
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  color:
                    section === s.id
                      ? "#fff"
                      : "rgba(255,255,255,0.45)",
                  border:
                    section === s.id
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "1px solid transparent",
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>


        </div>
      </div>


      {/* ── Views ── */}
      {section === "guide" && <MarketGuideView />}
      {section === "manual" && <AgentManualView />}
      
      {/* Global AI Assistant */}
      <SmartAssistant templates={templates} />
    </div>
  );
}