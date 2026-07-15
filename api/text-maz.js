module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return response.status(405).send("Use GET to open the text link.");
  }

  const phoneNumber = normalizePhoneNumber(process.env.MAZI_PHONE_NUMBER);

  if (!phoneNumber) {
    return response.status(500).send("Missing MAZI_PHONE_NUMBER.");
  }

  const requestedBody = getRequestedBody(request.query && request.query.body);
  const body = encodeURIComponent(requestedBody || "Can you sit with me for a bit?");
  response.statusCode = 302;
  response.setHeader("location", `sms:${phoneNumber}?body=${body}`);
  response.end();
};

function getRequestedBody(value) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== "string") {
    return "";
  }

  return candidate.replace(/[\r\n]+/g, " ").trim().slice(0, 220);
}

function normalizePhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== "string") {
    return "";
  }

  const trimmed = phoneNumber.trim();

  if (!/^\+?[0-9]{10,15}$/.test(trimmed)) {
    return "";
  }

  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}
