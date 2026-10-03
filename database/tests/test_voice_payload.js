const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');
const baileys = require('@systemzero/baileys');

(async () => {
  const inputPath = process.argv[2];
  assert(inputPath, 'Informe o caminho do MP3.');

  const source = await fs.readFile(inputPath);
  const temporaryPath = await baileys.transcodeAudioToOpus(source);
  try {
    const voiceBuffer = await fs.readFile(temporaryPath);
    const waveform = await baileys.getAudioWaveform(voiceBuffer);
    const seconds = Math.max(1, Math.round(await baileys.getAudioDuration(voiceBuffer)));
    let uploadedBuffer = null;

    const generated = await baileys.generateWAMessage(
      '120363429096081036@newsletter',
      {
        audio: { url: temporaryPath },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        waveform,
        seconds,
      },
      {
        userJid: '5511999999999:1@s.whatsapp.net',
        upload: async filePath => {
          uploadedBuffer = await fs.readFile(filePath);
          return {
            mediaUrl: 'https://example.invalid/media.ogg',
            directPath: '/media.ogg',
          };
        },
      }
    );

    const audioMessage = generated?.message?.audioMessage;
    assert(audioMessage, 'A mensagem de áudio não foi gerada.');
    assert.strictEqual(audioMessage.ptt, true);
    assert.strictEqual(audioMessage.mimetype, 'audio/ogg; codecs=opus');
    assert(audioMessage.waveform?.length >= 32, 'A waveform não foi incluída.');
    assert(audioMessage.seconds > 0, 'A duração não foi incluída.');
    assert(uploadedBuffer?.subarray(0, 4).toString() === 'OggS', 'O upload não contém Ogg/Opus.');
    console.log(`payload de voz aprovado: ${path.basename(inputPath)} -> Ogg/Opus, ${audioMessage.seconds}s`);
  } finally {
    await fs.unlink(temporaryPath).catch(() => {});
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
