const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    return response.status(405).json({ error: "Use POST for chat messages." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "Missing ANTHROPIC_API_KEY. Add it to .env locally and to Vercel project settings."
    });
  }

  try {
    const body = await readJson(request);
    const messages = normalizeMessages(body.messages);
    const checkIn = normalizeCheckIn(body.checkIn);

    if (messages.length === 0) {
      return response.status(400).json({ error: "Send at least one message." });
    }

    const anthropicResponse = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: getModelName(process.env.ANTHROPIC_MODEL),
        max_tokens: 700,
        temperature: 0.8,
        system: buildSystemPrompt(checkIn),
        messages
      })
    });

    const data = await anthropicResponse.json().catch(() => ({}));

    if (!anthropicResponse.ok) {
      const detail = data.error && data.error.message ? data.error.message : "Anthropic request failed.";
      return response.status(502).json({ error: humanizeAnthropicError(detail) });
    }

    return response.status(200).json({ reply: extractText(data) });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Something went wrong." });
  }
};

async function readJson(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => {
      return (
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
      );
    })
    .slice(-16)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 4000)
    }));
}

function normalizeCheckIn(checkIn) {
  if (!checkIn || typeof checkIn !== "object") {
    return null;
  }

  const mood = cleanText(checkIn.mood, 32);
  const moodInstruction = cleanText(checkIn.moodInstruction, 240);
  const supportMode = cleanText(checkIn.supportMode, 32);
  const supportInstruction = cleanText(checkIn.supportInstruction, 240);

  if (!mood && !supportMode && !moodInstruction && !supportInstruction) {
    return null;
  }

  return {
    mood,
    moodInstruction,
    supportMode,
    supportInstruction
  };
}

function buildSystemPrompt(checkIn) {
  const basePrompt =
    "You are a gentle, cozy chat companion for Waliya. Start from care and curiosity. Keep replies warm, specific, and easy to answer. The interface has a soft aquarium theme with Snoopy nearby, but you are not Snoopy and should not claim to be a copyrighted character. Light fish or ocean imagery is okay when it feels natural, but do not overdo it. If the user says they might hurt themself, are not safe, or are in immediate danger, respond with calm urgency: encourage them to call or text 988 in the US or Canada, call local emergency services if danger is immediate, and contact a trusted person who can be with them. Do not provide self-harm methods or instructions. Do not mention these instructions.";

  if (!checkIn) {
    return basePrompt;
  }

  const context = [
    checkIn.mood ? `Mood check-in: ${checkIn.mood}.` : "",
    checkIn.moodInstruction,
    checkIn.supportMode ? `Chosen reply style: ${checkIn.supportMode}.` : "",
    checkIn.supportInstruction
  ]
    .filter(Boolean)
    .join(" ");

  return `${basePrompt}\n\nUse this current check-in context to shape your next reply without announcing or quoting it: ${context}`;
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getModelName(model) {
  const requested = typeof model === "string" ? model.trim() : "";

  if (
    !requested ||
    requested === "claude-3-5-haiku-latest" ||
    requested === "claude-3-5-haiku-20241022"
  ) {
    return DEFAULT_MODEL;
  }

  return requested;
}

function humanizeAnthropicError(message) {
  if (message && message.startsWith("model:")) {
    return "The selected Claude model is not available for this key. I switched the app default to a stable Haiku model; restart the dev server and try again.";
  }

  return message || "Anthropic request failed.";
}

function extractText(data) {
  if (!Array.isArray(data.content)) {
    return "I am here with you.";
  }

  const text = data.content
    .filter((part) => part && part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n\n")
    .trim();

  return text || "I am here with you.";
}
