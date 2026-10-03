// Configuração única de fuso horário do bot.
const BRASILIA_TIME_ZONE = "America/Sao_Paulo";

function getBrasiliaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BRASILIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(parts
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, value]));
}

function getBrasiliaDateKey(date = new Date()) {
  const { year, month, day } = getBrasiliaDateParts(date);
  return `${year}-${month}-${day}`;
}

function formatBrasiliaTime(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRASILIA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatBrasiliaDate(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRASILIA_TIME_ZONE,
  }).format(date);
}

function formatBrasiliaDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRASILIA_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

module.exports = {
  BRASILIA_TIME_ZONE,
  getBrasiliaDateKey,
  formatBrasiliaTime,
  formatBrasiliaDate,
  formatBrasiliaDateTime,
};
