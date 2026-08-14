const sessions = new Map();
const HEARTBEAT_TTL = 30 * 1000;

function pruneExpired() {
  const now = Date.now();

  for (const [sessionId, updatedAt] of sessions.entries()) {
    if (now - updatedAt > HEARTBEAT_TTL) {
      sessions.delete(sessionId);
    }
  }
}

module.exports = (req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let body = {};

  try {
    if (req.body && typeof req.body === "string") {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }
  } catch {
    body = {};
  }

  pruneExpired();

  const { event = "heartbeat", sessionId } = body;

  if (!sessionId) {
    res.writeHead(400, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing sessionId", live: sessions.size }));
    return;
  }

  if (event === "leave") {
    sessions.delete(sessionId);
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ live: sessions.size }));
    return;
  }

  sessions.set(sessionId, Date.now());

  res.writeHead(200, { ...headers, "Content-Type": "application/json" });
  res.end(JSON.stringify({ live: sessions.size }));
};
