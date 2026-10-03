const assert = require('assert');
const fs = require('fs');
const baileys = require('@systemzero/baileys');

(async () => {
  const audioPath = process.argv[2];
  assert(audioPath, 'Informe o caminho de um áudio de teste.');
  const audio = fs.readFileSync(audioPath);
  assert(audio.length > 0, 'O áudio de teste está vazio.');
  assert.strictEqual(typeof baileys.getAudioWaveform, 'function');

  const waveform = await baileys.getAudioWaveform(audio);
  assert(waveform?.length >= 32, 'A waveform não foi gerada.');
  assert(waveform.some(value => value > 5), 'A waveform não contém amplitude útil.');

  if (typeof baileys.getAudioDuration === 'function') {
    const seconds = await baileys.getAudioDuration(audio);
    assert(seconds > 0, 'A duração não foi calculada.');
    console.log(`waveform: ${waveform.length} amostras; duração: ${seconds.toFixed(2)}s`);
  } else {
    console.log(`waveform: ${waveform.length} amostras; duração não disponível nesta versão`);
  }

  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
