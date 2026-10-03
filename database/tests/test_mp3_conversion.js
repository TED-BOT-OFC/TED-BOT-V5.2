const assert = require('assert');
const fs = require('fs/promises');
const baileys = require('@systemzero/baileys');

(async () => {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  assert(inputPath && outputPath, 'Informe entrada e saída.');
  assert.strictEqual(typeof baileys.transcodeAudioToOpus, 'function');

  const input = await fs.readFile(inputPath);
  const temporaryPath = await baileys.transcodeAudioToOpus(input);
  try {
    const converted = await fs.readFile(temporaryPath);
    assert(converted.length > 0, 'A conversão gerou um arquivo vazio.');
    await fs.writeFile(outputPath, converted);
    console.log(`conversão concluída: ${converted.length} bytes`);
  } finally {
    await fs.unlink(temporaryPath).catch(() => {});
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
