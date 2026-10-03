const assert = require('assert');
const {
  BRASILIA_TIME_ZONE,
  getBrasiliaDateKey,
  formatBrasiliaTime,
  formatBrasiliaDateTime,
} = require('../../database/sistema/timezone');

assert.strictEqual(BRASILIA_TIME_ZONE, 'America/Sao_Paulo');

// 2026-09-21 01:30 UTC ainda é 21:30 do dia anterior em Brasília.
const beforeMidnight = new Date('2026-09-21T01:30:00.000Z');
assert.strictEqual(getBrasiliaDateKey(beforeMidnight), '2026-09-20');
assert.strictEqual(formatBrasiliaTime(beforeMidnight), '22:30:00');

const afterMidnight = new Date('2026-09-21T03:30:00.000Z');
assert.strictEqual(getBrasiliaDateKey(afterMidnight), '2026-09-21');
assert.match(formatBrasiliaDateTime(afterMidnight), /21\/09\/2026/);
assert.match(formatBrasiliaDateTime(afterMidnight), /00:30:00/);

console.log('Timezone Brasília: OK');
