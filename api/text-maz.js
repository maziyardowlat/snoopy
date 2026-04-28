module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return response.status(405).send("Use GET to open the text link.");
  }

  const phoneNumber = normalizePhoneNumber(process.env.MAZI_PHONE_NUMBER);

  if (!phoneNumber) {
    return response.status(500).send("Missing MAZI_PHONE_NUMBER.");
  }

  const body = encodeURIComponent("Can you sit with me for a bit?");
  response.statusCode = 302;
  response.setHeader("location", `sms:${phoneNumber}?body=${body}`);
  response.end();
};

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
