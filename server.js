import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client securely
// Defaults to your project credentials if custom ones are not set in the environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize OpenAI Client securely
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (openaiApiKey) {
  openai = new OpenAI({ apiKey: openaiApiKey });
  console.log("Secure OpenAI Integration: ACTIVE (gpt-4o-mini)");
} else {
  console.warn("WARNING: OPENAI_API_KEY is not defined in the environment.");
}

// Initialize Gemini Key Pool securely (with auto failover and rotation!)
const geminiApiKeys = [];

// 1. Load keys from environment if specified
if (process.env.GEMINI_API_KEYS) {
  geminiApiKeys.push(...process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
} else if (process.env.GEMINI_API_KEY) {
  geminiApiKeys.push(process.env.GEMINI_API_KEY);
}

// 2. Load user provided keys as default fallback rotation pool
const fallbackKeys = [
  'AIzaSyB1z5iNMUpVRdq6pZ1T7I8e2cEcwHL6A1A',
  'AIzaSyDxbjKGCx-YDtKqobHYnjUVkT-w0BUIVo8'
];
fallbackKeys.forEach(k => {
  if (!geminiApiKeys.includes(k)) {
    geminiApiKeys.push(k);
  }
});

const geminiPool = [];
geminiApiKeys.forEach((key, index) => {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    geminiPool.push({
      label: `Key ${index + 1}`,
      keyMasked: `${key.substring(0, 8)}...${key.substring(key.length - 4)}`,
      model: model,
      status: 'active',
      depletedAt: null,
      cooldownMs: 60000, // 1 min cooldown for quick testing, in prod use 300000 (5m)
      successCount: 0,
      failCount: 0,
      lastError: null
    });
  } catch (err) {
    console.error(`[Server] Error initializing Gemini key #${index + 1}:`, err.message);
  }
});

console.log(`[Server] Secure Gemini Key Pool: ACTIVE with ${geminiPool.length} keys.`);

let activeGeminiIndex = 0; // Tracks which key in the pool is currently active

if (!openai && geminiPool.length === 0) {
  console.warn("WARNING: Neither OpenAI nor Gemini keys are defined. AI searches will fall back to local rule-based NLP.");
}

// In-memory cache for database templates (30 seconds TTL)
let cachedTemplates = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000;

async function getTemplates() {
  const now = Date.now();
  if (cachedTemplates && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedTemplates;
  }

  console.log("[Server] Fetching fresh templates from Supabase...");
  const { data, error } = await supabase.from('support_templates').select('*');
  if (error) {
    console.error("Error retrieving templates from Supabase:", error);
    if (cachedTemplates) return cachedTemplates; // Stale fallback
    throw error;
  }

  cachedTemplates = data || [];
  lastCacheTime = now;
  return cachedTemplates;
}

// REST API endpoint for smart agent matching
app.post('/api/agent-search', async (req, res) => {
  try {
    const { queryText } = req.body;
    if (!queryText) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    if (!openai && geminiPool.length === 0) {
      return res.status(503).json({ error: 'AI clients are not configured on this server.' });
    }

    // A. Retrieve templates from Supabase
    const dbCategories = await getTemplates();

    // B. Format templates context strictly to save tokens
    const formattedTemplates = dbCategories.map(cat => ({
      category: cat.category,
      templates: cat.templates.map(tpl => ({
        title: tpl.title,
        triggers: tpl.triggers,
        responses: tpl.responses
      }))
    }));

    // C. Request completion from OpenAI
    const systemPrompt = `You are a high-performance customer support routing intelligence engine for Betfalme.
Analyze the customer's message (which can be in English, Swahili, or Kenyan slang/Sheng) and match it to our verified support templates.

Here is our active knowledge base of support templates in JSON format:
${JSON.stringify(formattedTemplates)}

Your goals:
1. Detect the customer's language ("en", "swahili", or "mixed").
2. Detect the customer's emotional state ("Frustrated", "Distressed (RG)", "Urgent", "Friendly", or "Neutral") and select its standard styling values:
   - "Frustrated": emoji "😤", color "#ef4444"
   - "Distressed (RG)": emoji "😢", color "#8b5cf6"
   - "Urgent": emoji "⚡", color "#f97316"
   - "Friendly": emoji "👋", color "#22c55e"
   - "Neutral": emoji "😐", color "#6b7280"
3. Identify the best response tone: "highEmpathy" for angry/distressed customers, and "standard" for others.
4. Match up to 3 relevant templates. For each matched template, specify its category, title, triggers, responses, and a similarity/confidence percentage (e.g. "95%").
5. Synthesize a dynamic, high-quality, copy-paste ready "aiSuggestion" for the agent:
   - If a template matches, use its standard or empathy response text as the foundation.
   - Extract relevant details from the user's message (such as registered phone numbers, specific game names like Aviator, exact bet IDs, times, or transaction amounts) and substitute them directly into the template's placeholder brackets (e.g. replacing "{phone number}", "{amount}", "{game name}", "{registered phone number}", "{time of each round}" with the actual customer details provided!).
   - Keep any placeholders that cannot be resolved in their bracket form so the agent knows they still need to input them.
   - If no templates match the user's query, write a highly helpful, professional fallback response asking for the missing context.
6. Provide "aiReasoning" explaining why this template and tone were selected.

You MUST respond with a strict, valid JSON object containing exactly the following structure (do NOT wrap it in markdown code blocks, return the raw JSON):
{
  "detectedLanguage": "en" | "swahili" | "mixed",
  "emotion": {
    "label": "Frustrated" | "Distressed (RG)" | "Urgent" | "Friendly" | "Neutral",
    "emoji": "😤" | "😢" | "⚡" | "👋" | "😐",
    "color": "#ef4444" | "#8b5cf6" | "#f97316" | "#22c55e" | "#6b7280"
  },
  "suggestedTone": "highEmpathy" | "standard",
  "matches": [
    {
      "confidence": "95%",
      "item": {
        "title": "...",
        "category": "...",
        "responses": [
          { "type": "Standard", "text": "..." },
          { "type": "High Empathy", "text": "..." }
        ]
      }
    }
  ],
  "aiSuggestion": "...",
  "aiReasoning": "..."
}`;

    let resultText = '';
    let success = false;

    if (geminiPool.length > 0) {
      // Cooldown recovery check
      const now = Date.now();
      geminiPool.forEach(poolKey => {
        if (poolKey.status === 'depleted' && poolKey.depletedAt && (now - poolKey.depletedAt > poolKey.cooldownMs)) {
          console.log(`[Server] Cooldown expired for ${poolKey.label}. Reactivating...`);
          poolKey.status = 'active';
          poolKey.depletedAt = null;
        }
      });

      // Loop up to the number of registered keys to perform transparent retries on failure
      for (let attempt = 0; attempt < geminiPool.length; attempt++) {
        const currentIndex = (activeGeminiIndex + attempt) % geminiPool.length;
        const currentModelObj = geminiPool[currentIndex];
        
        if (currentModelObj.status === 'depleted') continue; // Skip depleted keys
        
        try {
          console.log(`[Server] Routing query to Gemini ${currentModelObj.label} (${currentModelObj.keyMasked})...`);
          const prompt = `${systemPrompt}\n\n[Customer message/Agent Query]:\n${queryText}`;
          const response = await currentModelObj.model.generateContent(prompt);
          resultText = response.response.text();
          
          // Successful call
          activeGeminiIndex = currentIndex;
          currentModelObj.successCount++;
          success = true;
          break;
        } catch (err) {
          console.warn(`[Server] Gemini ${currentModelObj.label} failed:`, err.message);
          currentModelObj.failCount++;
          currentModelObj.lastError = err.message;
          
          // Mark as depleted on quota/rate limit/429
          if (err.status === 429 || err.message.includes('Quota') || err.message.includes('429') || err.message.includes('exhausted') || err.message.includes('rate')) {
            console.log(`[Server] ${currentModelObj.label} depleted or rate-limited. Activating transparent failover...`);
            currentModelObj.status = 'depleted';
            currentModelObj.depletedAt = Date.now();
          }
        }
      }
    }

    if (!success && openai) {
      try {
        console.log("[Server] Gemini Key Pool exhausted/failed. Falling back to OpenAI GPT-4o-mini...");
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `[Customer message/Agent Query]:\n${queryText}` }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        resultText = completion.choices[0].message.content || '{}';
        success = true;
      } catch (err) {
        console.error("[Server] OpenAI fallback failed:", err.message);
      }
    }

    if (!success) {
      return res.status(503).json({ error: 'All configured AI clients failed or are unconfigured.' });
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);

  } catch (error) {
    console.error('[Server] Search Pipeline Error:', error);
    res.status(500).json({ error: 'Internal server query failure', details: error.message });
  }
});

// REST API endpoint for fetching Gemini Key Pool status
app.get('/api/gemini-pool-status', (req, res) => {
  const now = Date.now();
  const poolStatus = geminiPool.map(poolKey => {
    let cooldownRemainingMs = 0;
    if (poolKey.status === 'depleted' && poolKey.depletedAt) {
      const remaining = poolKey.cooldownMs - (now - poolKey.depletedAt);
      cooldownRemainingMs = remaining > 0 ? remaining : 0;
      
      // Auto-recover immediately in response if applicable
      if (cooldownRemainingMs === 0) {
        poolKey.status = 'active';
        poolKey.depletedAt = null;
      }
    }
    
    return {
      label: poolKey.label,
      maskedKey: poolKey.keyMasked,
      status: poolKey.status,
      successCount: poolKey.successCount,
      failCount: poolKey.failCount,
      cooldownRemainingMs
    };
  });

  const activeLabel = geminiPool[activeGeminiIndex]?.label || "None";
  
  res.json({
    pool: poolStatus,
    activeKeyLabel: activeLabel
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Secure Falme AI Matcher running on port ${PORT}`);
});
