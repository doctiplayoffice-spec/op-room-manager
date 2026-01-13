export const MOROCCO_TZ = "Africa/Casablanca";

// Renvoie {year, month, day, hour, minute, second} de l'heure au Maroc
export function getMoroccoParts(date = new Date()) {
    const dtf = new Intl.DateTimeFormat("en-GB", {
        timeZone: MOROCCO_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = dtf.formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type)?.value;

    return {
        year: Number(get("year")),
        month: Number(get("month")),
        day: Number(get("day")),
        hour: Number(get("hour")),
        minute: Number(get("minute")),
        second: Number(get("second")),
    };
}

export function moroccoMinutesSinceMidnight() {
    const p = getMoroccoParts();
    return p.hour * 60 + p.minute;
}

export function formatMoroccoDateTime(date = new Date()) {
    const p = getMoroccoParts(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(p.day)}/${pad(p.month)}/${p.year} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
}

export function formatMoroccoTime(date = new Date()) {
    const p = getMoroccoParts(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(p.hour)}:${pad(p.minute)}`;
}
