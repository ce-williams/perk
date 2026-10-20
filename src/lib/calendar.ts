import { shiftDays } from "./rules";
const escape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
// Fold UTF-8 lines at <=75 octets per RFC 5545; continuation includes leading space.
function fold(line: string) {
  const parts: string[] = [];
  let chunk = "",
    size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > 75) {
      parts.push(chunk);
      chunk = " ";
      size = 1;
    }
    chunk += ch;
    size += n;
  }
  parts.push(chunk);
  return parts.join("\r\n");
}
export function calendarFile(
  events: { id: string; title: string; date: string }[],
  leadDays: number,
  alarms: boolean,
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PERK//Demo benefit reminders//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@perk.demo`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART;VALUE=DATE:${e.date.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${shiftDays(e.date, 1).replaceAll("-", "")}`,
      `SUMMARY:${escape("DEMO: " + e.title)}`,
      "DESCRIPTION:Fictional benefit deadline. Verify real issuer terms independently.",
    );
    if (alarms)
      lines.push(
        "BEGIN:VALARM",
        `TRIGGER:-P${leadDays}D`,
        "ACTION:DISPLAY",
        "DESCRIPTION:Review your fictional PERK benefit",
        "END:VALARM",
      );
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
