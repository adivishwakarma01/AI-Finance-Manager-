/*
  Simple server-side AI Advisor endpoint (ESM)
  - Uses Google Gemini (Generative Language API) when GOOGLE_API_KEY is set
  - Graceful fallback locally when key is missing
  - Endpoints:
    - POST /api/insights -> { insights: Array<{type, message}> }
    - POST /api/advice   -> { answer: string }
*/

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ai-advisor', provider: process.env.GOOGLE_API_KEY ? 'gemini' : 'fallback' });
});

function generateFallbackInsights(summary) {
  const insights = [];
  const income = Number(summary?.totals?.income ?? summary?.totalIncome ?? 0);
  const expenses = Number(summary?.totals?.expenses ?? summary?.totalExpenses ?? 0);
  const savings = Math.max(0, income - expenses);
  const balance = Number(summary?.totals?.balance ?? summary?.balance ?? income - expenses);
  const savingsRate = Number(summary?.totals?.savingsRate ?? summary?.savingsRate ?? (income > 0 ? (savings / income) * 100 : 0));
  const topCategories = Array.isArray(summary?.topCategories) ? summary.topCategories : [];

  // 1) Expense vs income health
  if (expenses > income) {
    insights.push({ type: 'warning', message: `Your expenses ($${Math.round(expenses).toLocaleString()}) exceed income ($${Math.round(income).toLocaleString()}). Cap discretionary spend and set weekly limits to restore balance.` });
  } else if (savingsRate >= 15) {
    insights.push({ type: 'success', message: `Strong savings rate (~${Math.round(savingsRate)}%). Keep it up! Consider allocating part of your surplus ($${Math.round(savings).toLocaleString()}/mo) toward an emergency fund or diversified investments.` });
  } else if (savingsRate > 0) {
    insights.push({ type: 'tip', message: `You’re saving ~${Math.round(savingsRate)}% ($${Math.round(savings).toLocaleString()}/mo). Try increasing it by 5–10% with an automated transfer right after payday.` });
  } else {
    insights.push({ type: 'warning', message: 'No savings detected this period. Start with a small automated transfer after payday to build momentum.' });
  }

  // 2) Top category concentration
  const top = topCategories[0];
  if (top && (top.amount || top.value)) {
    const amt = Number(top.amount ?? top.value ?? 0);
    const cat = String(top.category ?? top.name ?? 'Top Category');
    const share = expenses > 0 ? Math.round((amt / expenses) * 100) : 0;
    if (share >= 30) {
      insights.push({ type: 'warning', message: `${cat} is ${share}% of your expenses ($${Math.round(amt).toLocaleString()}). Set a monthly cap and seek cheaper alternatives to reduce ${cat} costs.` });
    } else {
      insights.push({ type: 'tip', message: `Highest spending category: ${cat} ($${Math.round(amt).toLocaleString()}, ~${share}% of expenses). Track ${cat} weekly and set a soft cap to prevent creep.` });
    }
  }

  // 3) Diversify across categories
  const second = topCategories[1];
  if (second && (second.amount || second.value)) {
    const amt2 = Number(second.amount ?? second.value ?? 0);
    const cat2 = String(second.category ?? second.name ?? 'Second Category');
    insights.push({ type: 'tip', message: `Consider trimming ${cat2} by 10–20% (target ~$${Math.round(amt2 * 0.85).toLocaleString()}). Small cuts across top categories compound into bigger monthly savings.` });
  }

  // 4) Subscriptions hygiene
  insights.push({ type: 'tip', message: 'Review subscriptions quarterly to avoid silent cost creep and reclaim monthly cash flow.' });

  return insights.slice(0, 5);
}

async function callGeminiForInsights(summary, API_KEY) {
  const systemPrompt = 'You are a helpful, practical financial advisor. Provide actionable, ethical, and beginner-friendly advice to optimize spending, increase savings, and plan investments. Keep responses concise and specific to the provided data. Do not provide tax or legal advice.';
  const userPrompt = `Here is my financial summary JSON. Analyze it and return 3-5 concise insights as a JSON array of objects with keys: type (warning|success|tip), message (string).\n\nJSON:\n${JSON.stringify(summary)}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p?.text || '').join('\n').trim();

  let parsed = [];
  try {
    parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) parsed = [];
  } catch {
    parsed = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(msg => ({ type: 'tip', message: msg }));
  }

  return parsed
    .map(item => ({
      type: item.type === 'warning' || item.type === 'success' ? item.type : 'tip',
      message: String(item.message || '').slice(0, 500)
    }))
    .filter(i => i.message)
    .slice(0, 5);
}

app.post('/api/insights', async (req, res) => {
  try {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const { summary } = req.body || {};
    if (!summary) {
      return res.status(400).json({ error: 'Missing summary in request body.' });
    }

    if (!API_KEY) {
      const insights = generateFallbackInsights(summary);
      return res.json({ insights, provider: 'fallback' });
    }

    const insights = await callGeminiForInsights(summary, API_KEY);
    return res.json({ insights, provider: 'gemini' });
  } catch (err) {
    console.error('Advisor /api/insights error:', err);
    // Final safety fallback
    const insights = generateFallbackInsights(req.body?.summary || {});
    return res.json({ insights, provider: 'fallback' });
  }
});

async function callGeminiForAdvice(question, context, API_KEY) {
  const systemPrompt = 'You are a helpful, practical financial advisor. Answer user questions concisely in simple language. Use only ethical guidance and avoid legal/tax advice.';
  const userPrompt = `Question: ${question}\n\nContext (optional JSON): ${JSON.stringify(context || {})}\n\nReturn a concise answer (plain text).`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 512 }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }
  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p?.text || '').join('\n').trim();
  return text || 'Sorry, I could not generate an answer at this time.';
}

function fallbackAdvice(question, context) {
  const base = 'Here’s a practical approach:';
  const summary = context?.summary || context || {};
  const income = Number(summary?.totalIncome ?? 0);
  const expenses = Number(summary?.totalExpenses ?? 0);
  const savings = Math.max(0, income - expenses);
  const savingsRate = Number(summary?.savingsRate ?? 0);
  const cats = Array.isArray(summary?.topCategories) ? summary.topCategories : [];
  const top = cats[0];

  const includes = (s) => new RegExp(s, 'i').test(String(question || ''));

  if (includes('save') || includes('savings')) {
    const extra = savingsRate > 0 ? ` You’re saving ~${Math.round(savingsRate)}% ($${Math.round(savings).toLocaleString()}/mo). Increase it by 5–10% via automated transfers after payday.` : ' Start with a small automated transfer after payday to build momentum.';
    return `${base} Track top categories weekly, cap discretionary spend, and set a monthly savings goal.${extra}`;
  }
  if (includes('budget')) {
    const catHint = top ? ` Focus on capping ${String(top.name || top.category)} which appears to be a top spend.` : '';
    return `${base} Use a 50/30/20 rule (needs/wants/savings) as a baseline, then adjust based on actual expenses.${catHint}`;
  }
  if (includes('invest')) {
    return `${base} Build an emergency fund first, then consider low-cost index funds or diversified portfolios aligned to your risk tolerance.`;
  }

  // Category-specific advice if asked about a category by name
  for (const c of cats) {
    const name = String(c.name || c.category || '').trim();
    if (name && includes(name)) {
      const amt = Number(c.amount ?? c.value ?? 0);
      const share = expenses > 0 ? Math.round((amt / expenses) * 100) : 0;
      const target = Math.max(0, Math.round(amt * 0.8));
      return `${base} You’re spending ~$${Math.round(amt).toLocaleString()} on ${name} (~${share}% of expenses). Cap ${name} at ~$${target.toLocaleString()} and seek cheaper alternatives or set a weekly limit.`;
    }
  }

  const genericCat = top ? ` Your highest category seems to be ${String(top.name || top.category)}—set a monthly cap and seek cheaper alternatives.` : '';
  const transfer = savings > 0 ? ` Consider automating a ~$${Math.round(Math.min(100, Math.max(25, savings * 0.2))).toLocaleString()} transfer after payday.` : '';
  return `${base} List recurring expenses, cap discretionary categories, and review subscriptions quarterly to reduce silent cost creep.${genericCat}${transfer}`;
}

app.post('/api/advice', async (req, res) => {
  try {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const { question, context } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: 'Missing question in request body.' });
    }
    if (!API_KEY) {
      return res.json({ answer: fallbackAdvice(question, context), provider: 'fallback' });
    }
    const answer = await callGeminiForAdvice(question, context, API_KEY);
    return res.json({ answer, provider: 'gemini' });
  } catch (err) {
    console.error('Advisor /api/advice error:', err);
    return res.json({ answer: fallbackAdvice(req.body?.question || '', req.body?.context), provider: 'fallback' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Advisor server running on http://localhost:${PORT}`);
});