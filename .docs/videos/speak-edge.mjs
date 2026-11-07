import { createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { pipeline } from "node:stream/promises";

const require = createRequire("C:/Users/AMD/AppData/Local/Temp/ffmpeg-static-pkg/package.json");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const outPath = process.argv[2];
const text = process.argv[3];
if (!outPath || !text) {
  console.error("usage: node speak-edge.mjs <out.mp3> <text>");
  process.exit(1);
}

const tts = new MsEdgeTTS({ connectionTimeoutMs: 20000, synthesisTimeoutMs: 120000 });
await tts.setMetadata("ru-RU-SvetlanaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
const { audioStream } = tts.toStream(text, { rate: 1.08, pitch: "+6Hz" });
await pipeline(audioStream, createWriteStream(outPath));
tts.close();
console.log("ok", outPath);
