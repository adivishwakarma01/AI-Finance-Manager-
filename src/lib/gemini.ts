export async function askGemini(apiKey: string, question: string, context: any): Promise<string> {
  if (!apiKey) throw new Error('Missing Google API key');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { role: 'system', parts: [{ text: 'You are a helpful, practical financial advisor. Answer concisely and ethically.' }] },
    contents: [{ role: 'user', parts: [{ text: `Question: ${question}\n\nContext: ${JSON.stringify(context || {})}` }] }],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 512 }
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Gemini request failed');
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p?.text || '').join('\n').trim();
  return text || 'No answer available';
}
