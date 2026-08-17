const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const BOARD_KEY = "waliya:shared-board:v1";
const LOCAL_BOARD_FILE = path.join(process.cwd(), ".data", "shared-board.json");
const COLUMNS = new Set(["radar", "help", "reminder", "done"]);
const OWNERS = new Set(["Waliya", "Maz"]);

module.exports = async function handler(request, response) {
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) {
    response.setHeader("allow", "GET, POST, PATCH, DELETE");
    return response.status(405).json({ error: "Unsupported board action." });
  }

  try {
    const items = await readBoard();
    if (request.method === "GET") return response.status(200).json({ items });

    const body = await readJson(request);
    let nextItems = items;

    if (request.method === "POST") {
      const title = cleanText(body.title, 180);
      if (!title) return response.status(400).json({ error: "Give the card a short title." });
      const now = new Date().toISOString();
      nextItems = [{
        id: crypto.randomUUID(),
        title,
        owner: OWNERS.has(body.owner) ? body.owner : "Waliya",
        column: COLUMNS.has(body.column) ? body.column : "radar",
        createdAt: now,
        updatedAt: now
      }, ...items];
    }

    if (request.method === "PATCH") {
      const id = getId(request);
      if (!items.some((item) => item.id === id)) return response.status(404).json({ error: "That card is no longer on the board." });
      nextItems = items.map((item) => {
        if (item.id !== id) return item;
        const title = body.title === undefined ? item.title : cleanText(body.title, 180);
        const column = body.column === undefined ? item.column : body.column;
        if (!title) throw new Error("A card cannot be empty.");
        if (!COLUMNS.has(column)) throw new Error("That board column does not exist.");
        return { ...item, title, column, updatedAt: new Date().toISOString() };
      });
    }

    if (request.method === "DELETE") {
      const id = getId(request);
      nextItems = items.filter((item) => item.id !== id);
      if (nextItems.length === items.length) return response.status(404).json({ error: "That card is no longer on the board." });
    }

    await writeBoard(nextItems);
    return response.status(200).json({ items: nextItems });
  } catch (error) {
    return response.status(500).json({ error: error.message || "The shared board could not be updated." });
  }
};

async function readBoard() {
  if (hasRedis()) {
    const result = await redisCommand(["GET", BOARD_KEY]);
    if (!result) return [];
    return normalizeBoard(JSON.parse(result));
  }

  if (process.env.VERCEL) throw new Error("Shared storage is not connected. Add KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.");

  try {
    return normalizeBoard(JSON.parse(await fs.readFile(LOCAL_BOARD_FILE, "utf8")));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeBoard(items) {
  if (hasRedis()) {
    await redisCommand(["SET", BOARD_KEY, JSON.stringify(items)]);
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_BOARD_FILE), { recursive: true });
  await fs.writeFile(LOCAL_BOARD_FILE, JSON.stringify(items, null, 2));
}

async function redisCommand(command) {
  const response = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(command)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || "Shared storage is unavailable.");
  return data.result;
}

function hasRedis() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function normalizeBoard(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === "string" && typeof item.title === "string" && COLUMNS.has(item.column)).slice(0, 250);
}

function getId(request) {
  return cleanText(request.query && (Array.isArray(request.query.id) ? request.query.id[0] : request.query.id), 80);
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
