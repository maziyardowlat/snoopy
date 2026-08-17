module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return response.status(405).send("Use GET to create a calendar event.");
  }

  const title = cleanText(getQuery(request, "title"), 180);
  const description = cleanText(getQuery(request, "description"), 1200);
  const date = getQuery(request, "date");

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    return response.status(400).send("This card needs a title and valid date.");
  }

  const start = date.replaceAll("-", "");
  const nextDay = new Date(`${date}T12:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const end = nextDay.toISOString().slice(0, 10).replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const uid = `${start}-${Buffer.from(title).toString("base64url").slice(0, 18)}@waliya-board`;
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Waliya Shared Board//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeCalendar(title)}`,
    `DESCRIPTION:${escapeCalendar(description || "From the Waliya shared board")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");

  response.setHeader("content-type", "text/calendar; charset=utf-8");
  response.setHeader("content-disposition", 'attachment; filename="waliya-board-task.ics"');
  return response.status(200).send(calendar);
};

function getQuery(request, key) {
  const value = request.query && request.query[key];
  return Array.isArray(value) ? value[0] : value;
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength) : "";
}

function escapeCalendar(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
