import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const require = createRequire("C:/Users/AMD/AppData/Local/Temp/ffmpeg-static-pkg/package.json");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const outDir = "D:/Cursor/Prient-flow/.docs/videos/audio";

const clips = [
  {
    file: "00-intro.mp3",
    text: "Добро пожаловать в Prient-flow. Это операционка 3D-печатной мастерской: заказы, склад, принтеры и цена в одном месте. Сейчас коротко покажу, что куда и как добавлять.",
  },
  {
    file: "01-dashboard.mp3",
    text: "Главная — дашборд цеха. Здесь видно, сколько заказов в работе, что уже оплачено, какие материалы заканчиваются и какие принтеры печатают прямо сейчас. Это сводка на утро, а не таблица.",
  },
  {
    file: "02-orders.mp3",
    text: "Заказы — канбан цеха. Колонки слева направо: черновик, просчёт, согласован, печать, постобработка, покраска, готов, выдан. Карточку можно перетащить в другую колонку, когда статус реально сменился. Кнопка «Новый заказ» справа вверху: выберите клиента, добавьте позиции — деталь, количество, FDM или SLA — и цену. Без клиента заказ не создать.",
  },
  {
    file: "03-clients.mp3",
    text: "Клиенты — база мастерской. Добавьте имя, телефон и Telegram. Telegram потом нужен боту, чтобы клиент сам видел статус. Сначала заведите клиента, потом оформляйте заказ.",
  },
  {
    file: "04-inventory.mp3",
    text: "Склад — филамент, смола, краска, грунт. Красная строка и бейдж «Мало» значат: остаток ниже порога, пора заказать катушку. Кнопка «Добавить материал»: тип, название, количество и порог. «Остаток» — списание или пополнение без правки карточки.",
  },
  {
    file: "05-printers.mp3",
    text: "Принтеры — парк станка. Видно, кто печатает, кто свободен, кто на паузе, кто в ошибке. Живые команды паузы и стопа появятся позже. Сейчас это карта загрузки цеха.",
  },
  {
    file: "06-calculator.mp3",
    text: "Калькулятор — цена не с потолка. Себестоимость считается из материала, электричества, амортизации принтера и ручного труда, затем маржа мастерской. Сюда позже придёт клиент с моделью STL. Кнопка «На главную» возвращает в цех.",
  },
  {
    file: "07-settings.mp3",
    text: "Настройки — тарифы цеха: валюта, цена киловатт-часа, час работы мастера и маржа. От них зависит калькулятор. Если экран пустой — «Заполнить демо-цех» подставит живой пример. Всё. Открывайте заказы и ведите очередь.",
  },
  {
    file: "ad-voice.mp3",
    text: "Prient-flow. Операционка 3D-цеха: заказы, себестоимость, склад и принтеры в одном контуре. Считайте цену, не теряйте катушку, выдавайте вовремя.",
  },
];

await mkdir(outDir, { recursive: true });
const tts = new MsEdgeTTS({ connectionTimeoutMs: 20000, synthesisTimeoutMs: 180000 });
await tts.setMetadata("ru-RU-SvetlanaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

for (const clip of clips) {
  const outPath = path.join(outDir, clip.file);
  const { audioStream } = tts.toStream(clip.text, { rate: 1.08, pitch: "+6Hz" });
  await pipeline(audioStream, createWriteStream(outPath));
  console.log("ok", clip.file);
}

tts.close();
