const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toIsoDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

export function dateLabel(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

export function timeToMinutes(value = "") {
  const [hour, minute] = String(value || "").split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

export function minutesToTime(minutes = 0) {
  const safe = Math.max(0, Number(minutes) || 0);
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
}

export function workingRowForDate(meta = {}, isoDate = "") {
  if (!isoDate) return null;
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const dayName = DAY_NAMES[date.getDay()];
  const rows = Array.isArray(meta.availability) ? meta.availability : [];
  return rows.find((row) => row.day === dayName && row.enabled) || null;
}

export function getUpcomingBookableDates(meta = {}, count = 7, horizonDays = 21) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = 0; offset <= horizonDays && dates.length < count; offset += 1) {
    const date = addDays(today, offset);
    const iso = toIsoDate(date);
    if (workingRowForDate(meta, iso)) dates.push({ value: iso, label: dateLabel(iso) });
  }
  return dates;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function availableTimesForDate(meta = {}, isoDate = "", bookings = []) {
  const row = workingRowForDate(meta, isoDate);
  if (!row) return [];
  const duration = Math.max(15, Number(meta.duration_minutes || 60));
  const buffer = Math.max(0, Number(meta.buffer_minutes || 0));
  const start = timeToMinutes(row.start || "09:00");
  const end = timeToMinutes(row.end || "17:00");
  if (start === null || end === null || end <= start) return [];

  const bookedRanges = (bookings || [])
    .filter((booking) => booking.booking_date === isoDate && booking.status !== "cancelled")
    .map((booking) => {
      const startMinutes = timeToMinutes(booking.booking_time || "");
      if (startMinutes === null) return null;
      const bookingDuration = Math.max(15, Number(booking.duration_minutes || duration));
      return { start: startMinutes, end: startMinutes + bookingDuration + buffer };
    })
    .filter(Boolean);

  const slots = [];
  for (let minutes = start; minutes + duration <= end; minutes += duration + buffer) {
    const slotEnd = minutes + duration;
    const taken = bookedRanges.some((range) => overlaps(minutes, slotEnd, range.start, range.end));
    if (!taken) slots.push(minutesToTime(minutes));
  }
  return slots;
}
