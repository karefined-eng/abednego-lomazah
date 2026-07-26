// api/whatsapp-webhook.js
// Vercel Serverless Function for WhatsApp Channel Ingestion & AI Categorization

const SYSTEM_PROMPT = `You are an AI assistant parsing public WhatsApp channel updates for a University student advocacy platform.
Your task is to take an incoming raw WhatsApp post and extract structured fields conforming strictly to the requested JSON schema.

Field Rules:
1. "category": Must be one of ["ADVOCACY", "HOW-TO GUIDE", "INITIATIVE", "DATE TO BE ANNOUNCED"].
2. "status": Analyze message sentiment/progress and classify as one of ["RESOLVED", "IN PROGRESS", "ONGOING"].
3. "title": Generate a short, punchy, professional title (under 60 characters).
4. "summary": Create a concise 1–2 sentence description summarizing the announcement or guide.
5. "date": Extract any specific event/deadline date mentioned in text. If none, return empty string "".
6. "links": Extract all valid HTTP/HTTPS URLs (Zoom, Teams, Forms, Maps, etc.) into an array of strings.

Output ONLY valid JSON matching the schema. Do not include markdown codeblocks or conversational text.`;

const JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    category: { 
      type: "string", 
      enum: ["ADVOCACY", "HOW-TO GUIDE", "INITIATIVE", "DATE TO BE ANNOUNCED"] 
    },
    status: { 
      type: "string", 
      enum: ["RESOLVED", "IN PROGRESS", "ONGOING"] 
    },
    summary: { type: "string" },
    date: { type: "string" },
    links: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["title", "category", "status", "summary", "date", "links"]
};

export default async function handler(req, res) {
  // 1. Verify Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Secret Verification (optional header check)
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const authHeader = req.headers['x-webhook-secret'] || req.headers['authorization'];
    if (authHeader !== secret && authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized webhook request' });
    }
  }

  try {
    const payload = req.body || {};

    // Adapt payload parsing across common gateways (WAHA, Green API, Ultramsg, Evolution API)
    const rawText = payload?.body || payload?.message?.text || payload?.text || payload?.caption;
    const messageId = payload?.id || payload?.message?.id || `wa_${Date.now()}`;
    const mediaUrl = payload?.mediaUrl || payload?.message?.mediaUrl || payload?.url;

    if (!rawText && !mediaUrl) {
      return res.status(200).json({ message: 'Ignored: No text or media found in payload' });
    }

    // 3. AI Categorization via Gemini API (or OpenAI fallback)
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    let parsedData = {
      title: "WhatsApp Update",
      category: "ADVOCACY",
      status: "ONGOING",
      summary: rawText || "New update shared on WhatsApp channel.",
      date: "",
      links: []
    };

    if (apiKey && rawText) {
      try {
        if (process.env.GEMINI_API_KEY) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nMessage Content:\n${rawText}` }] }
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  responseSchema: JSON_SCHEMA
                }
              })
            }
          );
          const geminiJson = await geminiRes.json();
          const candidateText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            parsedData = JSON.parse(candidateText);
          }
        } else if (process.env.OPENAI_API_KEY) {
          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: rawText }
              ],
              response_format: { type: 'json_object' }
            })
          });
          const openaiJson = await openaiRes.json();
          const content = openaiJson?.choices?.[0]?.message?.content;
          if (content) {
            parsedData = JSON.parse(content);
          }
        }
      } catch (aiErr) {
        console.error('AI Categorization warning:', aiErr);
      }
    }

    // 4. Handle Media Upload to GitHub CDN (if image attached)
    let cdnImageUrl = null;
    if (mediaUrl && process.env.GITHUB_PAT && process.env.GITHUB_REPO) {
      try {
        const imageRes = await fetch(mediaUrl);
        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const fileName = `updates/wa_${Date.now()}.jpg`;

          const ghRes = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/assets/${fileName}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
              },
              body: JSON.stringify({
                message: `auto: upload channel update media ${fileName}`,
                content: base64
              })
            }
          );

          if (ghRes.ok) {
            cdnImageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/main/assets/${fileName}`;
          }
        }
      } catch (ghErr) {
        console.error('GitHub CDN upload warning:', ghErr);
      }
    }

    // 5. Assemble final clean update item
    const record = {
      id: messageId,
      title: parsedData.title,
      category: parsedData.category,
      status: parsedData.status,
      summary: parsedData.summary,
      date: parsedData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      links: parsedData.links || [],
      imageUrl: cdnImageUrl,
      rawText: rawText,
      timestamp: new Date().toISOString()
    };

    console.log('Processed Channel Update Record:', record);

    return res.status(200).json({
      success: true,
      message: 'Channel message ingested and categorized successfully',
      data: record
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
