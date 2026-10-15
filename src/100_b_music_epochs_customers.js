//#part 100_b_music_epochs_customers.js
// ---- Музика: 8-бітні мелодії як масиви нот ----
// Токен «нота:довжина» — довжина в 16-х частках (16 = один такт). «.:N» — пауза.
// Ноти: C4, F#5, Bb3. Канал wave:'noise' — ударні: k бас-барабан, s малий барабан, h тарілка.
// pattern — масив тактів; усі канали треба робити однакової довжини.
function arpBar(a, b, c) { return [a, b, c, b, a, b, c, b, a, b, c, b, a, b, c, b].map(n => n + ':1').join(' '); }
const DRUMS_CALM = '.:4 h:2 .:2 .:4 h:2 .:2';
const DRUMS_BOUNCE = 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2';
const MUSIC = {
  // спокійна — для крамнички й магазинчика
  calm: { bpm: 92, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'E5:4 G5:2 E5:2 C5:4 E5:4', 'C5:4 E5:2 A4:2 A4:8', 'A4:4 C5:2 F5:2 E5:4 C5:4', 'D5:4 B4:4 G4:8',
      'E5:4 G5:2 E5:2 C6:4 G5:4', 'E5:4 C5:2 A4:2 E5:8', 'F5:4 E5:2 D5:2 C5:4 A4:4', 'G4:2 B4:2 D5:4 G5:8'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'C3:4 G3:4 C3:4 G3:4', 'A2:4 E3:4 A2:4 E3:4', 'F2:4 C3:4 F2:4 C3:4', 'G2:4 D3:4 G2:4 D3:4',
      'C3:4 G3:4 C3:4 G3:4', 'A2:4 E3:4 A2:4 E3:4', 'F2:4 C3:4 F2:4 C3:4', 'G2:4 D3:4 G2:4 D3:4'] },
    { wave: 'noise', vol: 0.35, pattern: [DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM] }
  ] },
  // бадьоріша — для мінімаркету й супермаркету
  market: { bpm: 126, channels: [
    { wave: 'square', vol: 0.09, pattern: [
      'D5:2 G5:2 D5:2 B4:2 G4:2 B4:2 D5:2 G5:2', 'E5:2 G5:2 E5:2 B4:2 E4:2 G4:2 B4:2 E5:2',
      'C5:2 E5:2 G5:2 E5:2 C5:2 E5:2 G5:2 C6:2', 'D5:2 F#5:2 A5:2 F#5:2 D5:2 A4:2 D5:4',
      'G5:4 F#5:2 E5:2 D5:4 B4:4', 'E5:4 G5:4 B5:4 G5:4', 'C6:4 B5:2 A5:2 G5:4 E5:4', 'D5:2 E5:2 F#5:2 G5:2 A5:4 D5:4'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'G2:2 D3:2 G2:2 D3:2 G2:2 D3:2 G2:2 D3:2', 'E2:2 B2:2 E2:2 B2:2 E2:2 B2:2 E2:2 B2:2',
      'C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2', 'D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 D3:2 A3:2',
      'G2:2 D3:2 G2:2 D3:2 G2:2 D3:2 G2:2 D3:2', 'E2:2 B2:2 E2:2 B2:2 E2:2 B2:2 E2:2 B2:2',
      'C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2', 'D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 D3:2 A3:2'] },
    { wave: 'noise', vol: 0.4, pattern: [DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE] }
  ] },
  // урочиста — для універмагу й торгового центру
  mall: { bpm: 108, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'A4:4 D5:4 F#5:4 A5:4', 'E5:4 A5:4 C#6:4 A5:4', 'D5:4 F#5:4 B5:4 F#5:4', 'B4:4 D5:4 G5:4 B5:4',
      'D6:6 C#6:2 A5:4 F#5:4', 'E5:2 F#5:2 G#5:2 A5:2 C#6:8', 'B5:4 A5:4 G5:4 F#5:4', 'E5:4 F#5:4 A5:8'] },
    { wave: 'square', vol: 0.035, pattern: [
      arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('B3', 'D4', 'F#4'), arpBar('G3', 'B3', 'D4'),
      arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('G3', 'B3', 'D4'), arpBar('A3', 'C#4', 'E4')] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'D2:4 D3:4 D2:4 D3:4', 'A2:4 A3:4 A2:4 A3:4', 'B2:4 B3:4 B2:4 B3:4', 'G2:4 G3:4 G2:4 G3:4',
      'D2:4 D3:4 D2:4 D3:4', 'A2:4 A3:4 A2:4 A3:4', 'G2:4 G3:4 G2:4 G3:4', 'A2:4 A3:4 A2:4 A3:4'] },
    { wave: 'noise', vol: 0.38, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2') }
  ] },
  // святкова — Новий рік (мелодія «Jingle Bells», вільна від авторських прав)
  newyear: { bpm: 132, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'E5:4 E5:4 E5:8', 'E5:4 E5:4 E5:8', 'E5:4 G5:4 C5:6 D5:2', 'E5:16',
      'F5:4 F5:4 F5:6 F5:2', 'F5:4 E5:4 E5:4 E5:2 E5:2', 'E5:4 D5:4 D5:4 E5:4', 'D5:8 G5:8'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4',
      'F2:4 C3:4 F2:4 C3:4', 'C3:4 G3:4 C3:4 G3:4', 'G2:4 D3:4 G2:4 D3:4', 'G2:4 D3:4 G2:4 D3:4'] },
    { wave: 'noise', vol: 0.3, pattern: Array(8).fill('.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2') }
  ] },
  // моторошна — Хелловін
  halloween: { bpm: 104, channels: [
    { wave: 'square', vol: 0.09, pattern: [
      'A4:4 C5:4 E5:4 C5:4', 'A4:4 C5:4 E5:4 D#5:4', 'D5:4 F5:4 A5:4 F5:4', 'E5:8 G#4:4 B4:4',
      'A4:4 C5:4 E5:4 A5:4', 'G5:4 E5:4 C5:4 A4:4', 'F5:4 D5:4 B4:4 G#4:4', 'A4:12 .:4'] },
    { wave: 'triangle', vol: 0.24, pattern: [
      'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2', 'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2',
      'D3:2 .:2 D3:2 .:2 A3:2 .:2 D3:2 .:2', 'E2:2 .:2 E2:2 .:2 B2:2 .:2 E2:2 .:2',
      'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2', 'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2',
      'D3:2 .:2 D3:2 .:2 A3:2 .:2 D3:2 .:2', 'E2:2 .:2 E2:2 .:2 B2:2 .:2 E2:2 .:2'] },
    { wave: 'noise', vol: 0.35, pattern: Array(8).fill('k:4 .:4 s:4 .:4') }
  ] }
};
// Ще два стилі музики (вибирається в налаштуваннях звуку): «Пригодницька» — бадьорий чіптюн, «Спокійна» — м'яка 8-бітна лоу-фай
const DRUMS_CHIP = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2';
MUSIC.chipA = { bpm: 138, channels: [
  { wave: 'square', vol: 0.09, pattern: [
    'E5:2 G5:2 C6:2 G5:2 E5:2 G5:2 C6:4', 'D5:2 G5:2 B5:2 G5:2 D5:2 G5:2 B5:4', 'C5:2 E5:2 A5:2 E5:2 C5:2 E5:2 A5:4', 'A4:2 C5:2 F5:2 C5:2 A4:2 C5:2 F5:4',
    'G5:4 E5:2 G5:2 C6:4 G5:4', 'B5:4 G5:2 B5:2 D6:4 B5:4', 'A5:4 F5:2 A5:2 C6:4 A5:4', 'B5:2 A5:2 G5:2 F5:2 G5:8'] },
  { wave: 'square', vol: 0.032, pattern: [
    arpBar('C4', 'E4', 'G4'), arpBar('B3', 'D4', 'G4'), arpBar('A3', 'C4', 'E4'), arpBar('A3', 'C4', 'F4'),
    arpBar('C4', 'E4', 'G4'), arpBar('B3', 'D4', 'G4'), arpBar('A3', 'C4', 'F4'), arpBar('B3', 'D4', 'G4')] },
  { wave: 'triangle', vol: 0.22, pattern: [
    'C3:2 C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 C3:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2', 'A2:2 A2:2 E3:2 A2:2 C3:2 A2:2 E3:2 A2:2', 'F2:2 F2:2 C3:2 F2:2 A2:2 F2:2 C3:2 F2:2',
    'C3:2 C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 C3:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2', 'F2:2 F2:2 C3:2 F2:2 A2:2 F2:2 C3:2 F2:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2'] },
  { wave: 'noise', vol: 0.36, pattern: Array(8).fill(DRUMS_CHIP) }
] };
MUSIC.chipB = { bpm: 150, channels: [
  { wave: 'square', vol: 0.09, pattern: [
    'D5:1 F#5:1 A5:2 D6:4 A5:2 F#5:2 A5:4', 'C#5:1 E5:1 A5:2 C#6:4 A5:2 E5:2 A5:4', 'B4:1 D5:1 F#5:2 B5:4 F#5:2 D5:2 F#5:4', 'B4:1 D5:1 G5:2 B5:4 G5:2 D5:2 G5:4',
    'A5:2 F#5:2 D5:2 F#5:2 A5:4 D6:4', 'E6:2 C#6:2 A5:2 C#6:2 E6:4 A5:4', 'D6:2 B5:2 G5:2 B5:2 D6:4 G5:4', 'C#6:2 B5:2 A5:2 G#5:2 A5:8'] },
  { wave: 'square', vol: 0.032, pattern: [
    arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('B3', 'D4', 'F#4'), arpBar('G3', 'B3', 'D4'),
    arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('G3', 'B3', 'D4'), arpBar('A3', 'C#4', 'E4')] },
  { wave: 'triangle', vol: 0.22, pattern: [
    'D2:2 D3:2 D2:2 D3:2 A2:2 A3:2 A2:2 D3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2', 'B2:2 B3:2 B2:2 B3:2 F#3:2 F#3:2 B2:2 B3:2', 'G2:2 G3:2 G2:2 G3:2 D3:2 D3:2 G2:2 G3:2',
    'D2:2 D3:2 D2:2 D3:2 A2:2 A3:2 A2:2 D3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2', 'G2:2 G3:2 G2:2 G3:2 D3:2 D3:2 G2:2 G3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2'] },
  { wave: 'noise', vol: 0.38, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 h:2 s:2 k:2') }
] };
const DRUMS_CHILL = 'k:4 h:2 .:2 s:4 h:2 .:2';
MUSIC.chillA = { bpm: 78, channels: [
  { wave: 'triangle', vol: 0.17, pattern: [
    'E5:6 C5:2 A4:8', 'A4:4 C5:4 F5:8', 'E5:6 G5:2 E5:8', 'D5:4 B4:4 G4:8',
    'E5:4 A5:4 G5:4 E5:4', 'F5:6 E5:2 C5:8', 'D5:4 F5:4 A5:4 C6:4', 'B5:6 G#5:2 E5:8'] },
  { wave: 'square', vol: 0.04, pattern: [
    'A3:4 C4:4 E4:4 G4:4', 'F3:4 A3:4 C4:4 E4:4', 'C4:4 E4:4 G4:4 B4:4', 'G3:4 B3:4 D4:4 B3:4',
    'A3:4 C4:4 E4:4 G4:4', 'F3:4 A3:4 C4:4 E4:4', 'D3:4 F3:4 A3:4 C4:4', 'E3:4 G#3:4 B3:4 D4:4'] },
  { wave: 'triangle', vol: 0.2, pattern: [
    'A2:8 E3:8', 'F2:8 C3:8', 'C3:8 G2:8', 'G2:8 D3:8', 'A2:8 E3:8', 'F2:8 C3:8', 'D3:8 A2:8', 'E2:8 B2:8'] },
  { wave: 'noise', vol: 0.26, pattern: Array(8).fill(DRUMS_CHILL) }
] };
MUSIC.chillB = { bpm: 92, channels: [
  { wave: 'triangle', vol: 0.17, pattern: [
    'A5:4 F5:4 D5:4 F5:4', 'D5:4 F5:4 A5:4 D6:4', 'C6:4 A5:4 F5:4 A5:4', 'G5:4 E5:4 C5:4 E5:4',
    'D5:2 F5:2 A5:4 D6:4 A5:4', 'Bb5:2 A5:2 F5:4 D5:4 F5:4', 'G5:4 Bb5:4 D6:4 Bb5:4', 'C#6:6 E6:2 A5:8'] },
  { wave: 'square', vol: 0.04, pattern: [
    'D3:4 F3:4 A3:4 C4:4', 'Bb2:4 D3:4 F3:4 A3:4', 'F3:4 A3:4 C4:4 A3:4', 'C3:4 E3:4 G3:4 E3:4',
    'D3:4 F3:4 A3:4 C4:4', 'Bb2:4 D3:4 F3:4 A3:4', 'G2:4 Bb2:4 D3:4 F3:4', 'A2:4 C#3:4 E3:4 G3:4'] },
  { wave: 'triangle', vol: 0.2, pattern: [
    'D2:6 D3:2 A2:8', 'Bb1:6 Bb2:2 F2:8', 'F2:6 F3:2 C3:8', 'C2:6 C3:2 G2:8', 'D2:6 D3:2 A2:8', 'Bb1:6 Bb2:2 F2:8', 'G2:6 G3:2 D3:8', 'A1:6 A2:2 E2:8'] },
  { wave: 'noise', vol: 0.28, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 .:2 s:2 h:2') }
] };
// Стилі музики: які мелодії грають на яких рівнях магазину (свята мають власну — поле music у HOLIDAYS)
const MUSIC_STYLES = [
  { id: 'classic', levels: ['calm', 'calm', 'market', 'market', 'mall', 'mall'] },
  { id: 'chip',    levels: ['chipA', 'chipA', 'chipA', 'chipB', 'chipB', 'chipB'] },
  { id: 'chill',   levels: ['chillA', 'chillA', 'chillA', 'chillB', 'chillB', 'chillB'] }
];
// Характер музики в кожній епосі (індекс — як в EPOCHS): bpm — множник темпу, shift — на скільки пів-тонів вище, lead/bass/arp — тембри, drums — малюнок ударних (null — без них).
// Відродження (0) звучить без змін — як оригінал.
const EPOCH_MUSIC = [
  null,
  { bpm: 0.94, shift: 2,  lead: 'triangle', bass: 'triangle', drums: 'k:4 .:4 s:4 .:2 h:2' },                                  // ретро: м'яке, з поштовхом
  { bpm: 1.14, shift: 3,  lead: 'sawtooth', bass: 'square',   drums: 'k:2 h:2 k:2 h:2 k:2 h:2 k:2 h:2' },                      // диско: чотири долі
  { bpm: 1.2,  shift: 5,  lead: 'square',   bass: 'triangle', arp: 'square', drums: 'k:2 h:1 h:1 s:2 h:1 h:1 k:2 h:1 h:1 s:2 h:1 h:1' },   // аркади: швидко й дзвінко
  { bpm: 1.05, shift: 0,  lead: 'sawtooth', bass: 'sawtooth', drums: 'k:3 .:1 h:2 s:2 .:2 k:2 h:2 s:2' },                      // інтернет: цифровий
  { bpm: 0.84, shift: -3, lead: 'sine',     bass: 'sine',     drums: '.:4 h:2 .:2 .:4 h:2 .:2' },                              // еко: легке, повітряне
  { bpm: 0.78, shift: -5, lead: 'sine',     bass: 'triangle', arp: 'sine', drums: null },                                       // космос: повільне, без барабанів
  { bpm: 1.1,  shift: -1, lead: 'sawtooth', bass: 'sawtooth', drums: 'k:2 .:2 s:2 .:2 k:2 k:2 s:2 h:2' },                      // неон: синтвейв
  { bpm: 0.8,  shift: 1,  lead: 'triangle', bass: 'sine',     arp: 'triangle', drums: '.:4 h:2 .:2 k:4 .:4 h:2 .:2' }          // Японія: спокійно, як гра на кото
];
const WAVE_GAIN = { square: 1, triangle: 1, sine: 1.45, sawtooth: 0.55 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function shiftNote(tok, semis) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(tok);
  if (!m || !semis) return tok;
  const midi = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12 + semis;
  return SHARP_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}
function parseTokens(text) {
  let step = 0;
  const events = text.trim().split(/\s+/).map(tok => {
    const [name, len] = tok.split(':');
    const e = { step, len: parseInt(len, 10) || 1, tok: name };
    step += e.len;
    return e;
  });
  return { events, total: step };
}
// Мелодія для пари (базова мелодія, епоха): темп, тональність, тембри й ударні змінюються (результат кешується)
function trackDef(key) {
  if (key.startsWith('ep') && typeof epochTrackDef === 'function') return epochTrackDef(key);      // власні мелодії епох: 190_d_epoch_tunes.js
  const [baseId, epStr] = key.split('#');
  if (epStr === undefined) return MUSIC_PARSED[baseId];
  const ep = Number(epStr), prof = EPOCH_MUSIC[ep], base = MUSIC_PARSED[baseId];
  if (!prof) return base;
  if (MUSIC_PARSED[key]) return MUSIC_PARSED[key];
  const channels = base.channels.map((ch, ci) => {
    if (ch.wave === 'noise') {
      if (!prof.drums) return { wave: 'noise', vol: 0, events: [{ step: 0, len: ch.total, tok: '.' }], total: ch.total };
      const bar = parseTokens(prof.drums).total;
      const text = Array(Math.max(1, Math.round(ch.total / bar))).fill(prof.drums).join(' ');
      const parsed = parseTokens(text);
      return { wave: 'noise', vol: ch.vol, events: parsed.events, total: parsed.total };
    }
    const role = ci === 0 ? 'lead' : ch.wave === 'triangle' ? 'bass' : 'arp';
    const wave = prof[role] || ch.wave;
    const events = ch.events.map(e => ({ step: e.step, len: e.len, tok: e.tok === '.' ? '.' : shiftNote(e.tok, prof.shift) }));
    return { wave, vol: ch.vol * (WAVE_GAIN[wave] || 1) / (WAVE_GAIN[ch.wave] || 1), events, total: ch.total };
  });
  return (MUSIC_PARSED[key] = { bpm: base.bpm * prof.bpm, channels, total: base.total });
}

// ---- Подорож у часі, майстерня, епохи, досягнення (етап 7) ----

// Покращення за Кристали. costs — ціна кожного рівня (довжина = максимум рівнів).
// Що саме робить кожне — див. функції wsEffect… нижче.
const WORKSHOP = [
  { id: 'goldenFreq',   icon: '🌟', costs: [6, 11, 17] },              // золоті покупці приходять частіше: +15% за рівень
  { id: 'autoTap',      icon: '🤖', costs: [6, 11, 17] },              // автотапи: +1 тап на секунду за рівень
  { id: 'offlineHours', icon: '🌙', costs: [5, 8, 12] },               // офлайн довше: +4 години за рівень
  { id: 'offlineRate',  icon: '💤', costs: [5, 8, 12, 18] },           // офлайн щедріший: +5% за рівень
  { id: 'salesFreq',    icon: '🏷️', costs: [5, 8, 12, 18] },          // розпродажі частіші: −5% до проміжку
  { id: 'saleLength',   icon: '⏱️', costs: [5, 8, 12, 18] },           // розпродаж довший: +20 с
  { id: 'wheelFast',    icon: '🎡', costs: [12, 21] },                 // цирк і бонус-ігри частіше: ×0,7, потім ×0,5 від паузи
  { id: 'thiefLess',    icon: '🦝', costs: [5, 8, 12, 18] },           // єнот краде менше й рідше
  { id: 'cheaperDepts', icon: '🛒', costs: [8, 12, 18, 26, 36] },    // відділи дешевші на 2%
  { id: 'cheaperTeam',  icon: '🐾', costs: [8, 12, 18, 26, 36] },    // звірята дешевші на 2%
  { id: 'tapPower',     icon: '👆', costs: [8, 12, 18, 26, 36] },    // тап сильніший: +10%
  { id: 'crystalGain',  icon: '💎', costs: [12, 18, 27, 39, 54] }   // більше осколків за подорож: +10%
];
const CIRCUS_FREQ_BY_LEVEL = [1, 0.7, 0.5];   // «Цирк частіше» (id wheelFast): множник паузи між візитами цирку або бонус-гри

// Епохи: після кожної подорожі місто змінюється. Епохи йдуть по колу (епоха N використовує запис N mod 4).
// sky — три кольори неба (угорі / посередині / біля горизонту); tint — затемнення; decor — листя чи зорі;
// signFill — колір вивіски; houses — кольори стін і дахів фонових будинків.
// Епохи: після кожної подорожі в часі місто змінюється. Їх 8, далі коло починається знов (епоха N використовує запис N mod 8).
// sky — три кольори неба; tint — загальний відтінок; decor — зорі/листя; signFill — фон вивіски; awning — кольори навісів;
// roofStyle — tile (черепиця) або flat (плаский дах); features — особливості пейзажу (див. «Особливості епох»).
const EPOCHS = [
  { id: 'renaissance', sky: ['s', 'S', 'y'], tint: null, decor: [], signFill: 'b', awning: ['t', 'w'], roofStyle: 'tile', features: ['pennants'],
    houses: { walls: ['W', 'c', 'y', 'q'], roofs: ['t', 'r', 'b'] } },
  { id: 'retro', sky: ['q', 'w', 'W'], tint: { color: 'm', alpha: 0.10 }, decor: [], signFill: 'n', awning: ['p', 'w'], roofStyle: 'tile', features: ['blimp'],
    houses: { walls: ['m', 'q', 'y', 'S'], roofs: ['p', 'n'] } },
  { id: 'disco', sky: ['J', 'j', 'y'], tint: { color: 'o', alpha: 0.10 }, decor: [], signFill: 'P', awning: ['f', 'y'], roofStyle: 'tile', features: ['disco'],
    houses: { walls: ['o', 'h', 'y', 'c'], roofs: ['b', 'P', 't'] } },
  { id: 'arcade', sky: ['V', 'v', 'f'], tint: { color: 'u', alpha: 0.14 }, decor: ['stars'], signFill: 'k', awning: ['T', 'f'], roofStyle: 'flat', features: ['retrosun'],
    houses: { walls: ['v', 'P', 'T', 'f'], roofs: ['k', 'V', 'n'] } },
  { id: 'internet', sky: ['a', 'S', 'w'], tint: null, decor: [], signFill: 'n', awning: ['n', 'S'], roofStyle: 'flat', features: ['planes'],
    houses: { walls: ['S', 'a', 'w', 'e'], roofs: ['n', 'e', 'd'] } },
  { id: 'eco', sky: ['s', 'S', 'm'], tint: { color: 'g', alpha: 0.06 }, decor: [], signFill: 'G', awning: ['g', 'w'], roofStyle: 'flat', features: ['turbines'],
    houses: { walls: ['m', 'w', 'S', 'c'], roofs: ['g', 'G', 'm'] } },
  { id: 'space', sky: ['z', 'n', 's'], tint: { color: 'n', alpha: 0.12 }, decor: ['stars'], signFill: 'z', awning: ['u', 'S'], roofStyle: 'flat', features: ['rockets'],
    houses: { walls: ['e', 'E', 'S', 'w'], roofs: ['n', 'u', 'z'] } },
  { id: 'neon', sky: ['n', 'u', 'p'], tint: { color: 'n', alpha: 0.22 }, decor: ['stars'], signFill: 'k', awning: ['f', 'T'], roofStyle: 'flat', features: ['drones'],
    houses: { walls: ['n', 'u', 'e', 'd'], roofs: ['p', 'y'] } },
  { id: 'japan', sky: ['s', 'S', 'p'], tint: null, decor: [], signFill: 'n', awning: ['r', 'w'], roofStyle: 'tile', features: [],
    houses: { walls: ['b', 'c', 'l', 'y'], roofs: ['n', 'G'] } }
];

// Досягнення: набори за показником (metric). Для кожної цілі — свій значок-медаль (бронза → срібло → золото → кристал).
const ACH_SETS = [
  { metric: 'taps',        glyph: 'hand',     targets: [100, 1e3, 1e4, 1e5] },
  { metric: 'earned',      glyph: 'coin',     targets: [1e3, 1e6, 1e9, 1e12, 1e15] },
  { metric: 'level',       glyph: 'shop',     targets: [2, 3, 4, 5, 6] },
  { metric: 'deptsBought', glyph: 'bag',      targets: [10, 100, 500] },
  { metric: 'milestones',  glyph: 'star',     targets: [1, 10, 25] },
  { metric: 'teamEver',    glyph: 'paw',      targets: [1, 6, 12] },
  { metric: 'teamMax',     glyph: 'hammer',   targets: [5, 10] },
  { metric: 'raccoons',    glyph: 'raccoon',  targets: [1, 10, 50] },
  { metric: 'puddles',     glyph: 'drop',     targets: [5, 25], hidden: true },   // колишнє «Королева калюж»: слот лишено, щоб не зсунути індекси state.ach
  { metric: 'wheel',       glyph: 'wheel',    targets: [1, 7] },
  { metric: 'travels',     glyph: 'clock',    targets: [1, 3, 10] },
  { metric: 'crystals',    glyph: 'gem',      targets: [5, 50, 200] },
  { metric: 'chapters',    glyph: 'book',     targets: [3, 8] },
  { metric: 'holidays',    glyph: 'calendar', targets: [1, 3] },
  { metric: 'hours',       glyph: 'clock',    targets: [1, 12] }
];
const ACHIEVEMENTS = ACH_SETS.flatMap(set => set.targets.map((target, tier) => ({ id: set.metric + '_' + tier, metric: set.metric, glyph: set.glyph, target, tier, hidden: !!set.hidden })));
function achTotal() { return ACHIEVEMENTS.filter(a => !a.hidden).length; }   // скриті (колишні калюжі) не показуються й не рахуються
const ACH_TIER_COLORS = ['c', 'E', 'h', 'S'];     // колір медалі: бронза, срібло, золото, кристал
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
function popcount(n) { let c = 0; n = Math.floor(n); while (n > 0) { c += n & 1; n >>= 1; } return c; }
// Як рахується кожен показник зі стану
const METRICS = {
  taps: s => s.taps,
  earned: s => s.totalEarned,
  level: s => Math.max(s.stats.maxLevel, s.shopLevel),
  deptsBought: s => s.stats.deptsBought,
  milestones: s => s.stats.milestones,
  teamEver: s => s.teamKnown.reduce((a, b) => a + b, 0),
  teamMax: s => s.stats.teamMaxLevel,
  raccoons: s => s.stats.raccoonsCaught,
  puddles: s => s.stats.puddlesFixed,
  wheel: s => s.stats.wheelSpins,
  travels: s => s.stats.timeTravels,
  crystals: s => s.crystalsTotal,
  chapters: s => s.story.done,
  holidays: s => popcount(s.stats.holidaysSeen),
  hours: s => s.playTime / 3600
};

// Значки досягнень 8×8 (літери — з палітри)
const GLYPHS = {
  hand:     ['...dd...', '..dwwd..', '..dwwd..', '..dwwdd.', '.dwwwwwd', '.dwwwwwd', '..dwwwd.', '...ddd..'],
  shop:     ['rwrwrwrw', 'rwrwrwrw', '.dddddd.', '.dsddbd.', '.dsddbd.', '.dsddbd.', '.dddddd.', '........'],
  bag:      ['..d..d..', '...dd...', '.dppppd.', 'dppwwppd', 'dppppppd', 'dppppppd', '.dppppd.', '..dddd..'],
  star:     ['...dd...', '..dyyd..', 'ddyyyydd', '.dyyyyd.', '..dyyd..', '.dyddyd.', '.dd..dd.', '........'],
  paw:      ['d..dd..d', 'd..dd..d', '..dddd..', '.dddddd.', '.dddddd.', '..dddd..', '........', '........'],
  hammer:   ['.ddddd..', '.deeeed.', '.ddddd..', '..dbd...', '..dbd...', '..dbd...', '..dbd...', '...dd...'],
  raccoon:  ['.d....d.', 'deeeeeed', 'dkkeekkd', 'dkwkkwkd', 'deeEEeed', '.dEEkEd.', '..dEEd..', '...dd...'],
  drop:     ['...dd...', '..dsSd..', '.dsSSsd.', '.dsSSsd.', 'dsSSSssd', 'dsSSSssd', '.dsSssd.', '..dddd..'],
  wheel:    ['..dddd..', '.dhrrhd.', 'dhrrrrhd', 'drrddrrd', 'drrddrrd', 'dhrrrrhd', '.dhrrhd.', '..dddd..'],
  clock:    ['..dddd..', '.dwwwwd.', 'dwwwdwwd', 'dwwwdwwd', 'dwwwddwd', 'dwwwwwwd', '.dwwwwd.', '..dddd..'],
  gem:      ['..dddd..', '.dSSwSd.', 'dSwSSSSd', 'dsSSSSsd', '.dsSSsd.', '..dssd..', '...dd...', '........'],
  shard:    ['...VV...', '..VwuV..', '.VwuvvV.', '.VuvvvV.', 'VuvvvPV.', '.VvvPPV.', '..VvPV..', '...VV...'],       // осколок часу
  book:     ['dddddddd', 'dwwwdwwd', 'dwewdwed', 'dwwwdwwd', 'dwewdwed', 'dwwwdwwd', 'dddddddd', '........'],
  calendar: ['dddddddd', 'drrrrrrd', 'dwwwwwwd', 'dwdwdwwd', 'dwwwwwwd', 'dwdwwwwd', 'dwwwwwwd', 'dddddddd']
};

// Нові сюжетні фрагменти: kind 'ep' — епохи (ep1…ep4), 'tut' — туторіал. Тексти: ep{N}_title, ep{N}_{k}, tut1_{k}.
// 8 історій: прихід у епохи 2…8 і нове коло. guest — гість епохи; pre — репліки до вибору; потім Капі обирає (o1/o2), reply — хто відповідає; post — кінець.
// Тексти: ep{N}_title, ep{N}_{k} (по порядку pre, потім post), ep{N}_o1/o2 (варіанти Капі), ep{N}_r1/r2 (відповіді)
const EPOCH_STORIES = [
  { guest: 'pip', pre: ['narr', 'pip', 'capy', 'shnyr1', 'pip', 'capy'], reply: ['shnyr1', 'shnyr1'], post: ['pip', 'capy', 'clock'], thx: ['pip', 'capy', 'pip'] },
  { guest: 'zina', pre: ['narr', 'zina', 'capy', 'shnyr2', 'zina', 'capy'], reply: ['shnyr2', 'shnyr2'], post: ['zina', 'capy', 'clock'], thx: ['zina', 'capy', 'zina'] },
  { guest: 'maks', pre: ['narr', 'maks', 'capy', 'shnyr3', 'maks', 'capy'], reply: ['shnyr3', 'shnyr3'], post: ['maks', 'capy', 'clock'], thx: ['maks', 'capy', 'maks'] },
  { guest: 'bitik', pre: ['narr', 'bitik', 'capy', 'shnyr4', 'bitik', 'capy'], reply: ['shnyr4', 'bitik'], post: ['bitik', 'capy', 'clock'], thx: ['bitik', 'capy', 'bitik'] },
  { guest: 'lesyk', pre: ['narr', 'lesyk', 'capy', 'shnyr5', 'lesyk', 'capy'], reply: ['shnyr5', 'shnyr5'], post: ['lesyk', 'capy', 'clock'], thx: ['lesyk', 'capy', 'lesyk'] },
  { guest: 'orbit', pre: ['narr', 'orbit', 'capy', 'shnyr6', 'orbit', 'capy'], reply: ['shnyr6', 'orbit'], post: ['orbit', 'capy', 'clock'], thx: ['orbit', 'capy', 'orbit'] },
  { guest: 'lumi', pre: ['narr', 'lumi', 'capy', 'shnyr7', 'lumi', 'capy'], reply: ['shnyr7', 'shnyr7'], post: ['lumi', 'shnyr7', 'capy', 'clock'], thx: ['lumi', 'capy', 'lumi'] },
  { guest: 'bruno', pre: ['narr', 'bruno', 'capy', 'shnyr8', 'bruno', 'capy'], reply: ['bruno', 'bruno'], post: ['bruno', 'capy', 'clock'], thx: ['bruno', 'capy', 'bruno'] },
  { guest: 'pietro', pre: ['narr', 'pietro', 'capy', 'shnyr0', 'pietro', 'capy'], reply: ['shnyr0', 'shnyr0'], post: ['pietro', 'capy', 'clock'], thx: ['pietro', 'capy', 'pietro'] },
  { guest: 'sora', pre: ['narr', 'sora', 'capy', 'shnyr9', 'sora', 'capy'], reply: ['shnyr9', 'shnyr9'], post: ['sora', 'shnyr9', 'capy', 'clock'], thx: ['sora', 'capy', 'sora'] }
];
const GUEST_IDS = EPOCH_STORIES.map(e => e.guest);
const TUTORIAL = { lines: ['capy', 'capy'] };

function epochOf(s) { return s.eid !== undefined ? (s.eid | 0) : ((s.epoch | 0) % 8); }          // номер епохи (0…8) для стану s (у старих збереженнях eid ще нема)
function guestStoryNoOf(e) { return e === 8 ? 10 : e === 0 ? 8 : e; }          // номер історії гостя (ep1…ep10), яка грається, коли приходимо в епоху e
function guestIdxOfEpoch(e) { return e === 8 ? 9 : (e + 7) % 8; }           // номер гостя епохи в EPOCH_STORIES: Японія — 10-й, Відродження — Бруно
// Умова відкриття глави для стану s (використовується і в грі, і при міграції старих збережень)
function triggerMet(trig, s) {
  if (trig.earned !== undefined && !(s.totalEarned >= trig.earned)) return false;
  if (trig.level !== undefined && !(s.shopLevel >= trig.level)) return false;
  if (trig.nights !== undefined && !(s.story && s.story.nights >= trig.nights)) return false;
  if (trig.depts && !trig.depts.every(([i, n]) => s.depts && s.depts[i] >= n)) return false;
  if (trig.guest && !(s.story && s.story.guests && s.story.guests[guestIdxOfEpoch(epochOf(s))] > 0)) return false;               // гість цієї епохи вже прийшов (його історія прочитана)
  if (trig.eeSec !== undefined && !((s.epochEarned && s.epochEarned[epochOf(s)] || 0) >= (s.cps || 0) * trig.eeSec)) return false;   // у цій епосі зароблено хоча б eeSec секунд доходу
  if (trig.near && !(Math.max(0, s.totalEarned - s.runStartEarned) >= shardThreshold() * 0.5)) return false;                      // до подорожі лишилось недалеко
  return true;
}

// Спрайти: масиви рядків, кожна літера — колір з PALETTE, крапка — прозорість.
// variants — заміни кольорів для альтернативних кадрів (наприклад, кліпання).
const SPRITES = {
  // Монетка 8×8
  coin: { rows: [
    '..dddd..',
    '.dhyyhd.',
    'dhyhhhhd',
    'dhyhhhhd',
    'dhhhhhhd',
    'dhhhhhod',
    '.dhhhod.',
    '..dddd..'
  ] },
  // Хмаринка 24×7
  cloud: { rows: [
    '..........wwww..........',
    '......wwww.wwwwww..www..',
    '....wwwwwwwwwwwwwwwwww..',
    '.wwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    '.WWWWWWWWWWWWWWWWWWWWWW.',
    '..WWWWWWWWWWWWWWWWWWWW..'
  ], variants: { grey: { w: '#b8b6bf', W: '#9d9ba7' }, light: { w: '#e4e7ee', W: '#cbd0db' }, dark: { w: '#7c7890', W: '#625f78' } } },
  // Капі 28×24 (дивиться вправо; X — око, при кліпанні стає шерстю). Дівчина: квіточка, рожева сукня й бантик

};
// Покупці у стилі «чібі»: велика голова, тіло-ґудзик, дві ніжки, м'який контур. Малюються кодом один раз на старті (18×23, ноги внизу)
const CHIBI = (function () {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d'), w, h }; };
  const rect = (S, x, y, w, h, col) => { S.g.fillStyle = col; S.g.fillRect(x, y, w, h); };
  const px = (S, x, y, col) => { if (x >= 0 && y >= 0 && x < S.w && y < S.h) rect(S, x, y, 1, 1, col); };
  const ell = (S, cx, cy, rx, ry, col, shade, hi) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) { let c = col; if (shade && (dy > 0.35 || dx * 0.6 + dy > 0.75)) c = shade; if (hi && dx < -0.35 && dy < -0.35) c = hi; px(S, x, y, c); }
    }
  };
  const outline = (S, col) => {
    const o = mk(S.w + 2, S.h + 2), d = S.g.getImageData(0, 0, S.w, S.h).data;
    const has = (x, y) => x >= 0 && y >= 0 && x < S.w && y < S.h && d[(y * S.w + x) * 4 + 3] > 0;
    o.g.fillStyle = col;
    for (let y = -1; y <= S.h; y++) for (let x = -1; x <= S.w; x++) if (!has(x, y) && (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1))) o.g.fillRect(x + 1, y + 1, 1, 1);
    o.g.drawImage(S.c, 1, 1);
    return o.c;
  };
  const PK = '#ef8fa3', E = '#2a1d1a', WH = '#ffffff';
  // Кожен покупець: b — шерсть, s — тінь, h — відблиск, o — колір контуру (м'який, темніший за звіря)
  const PAL = {
    bunny:    { b: '#fff4dc', s: '#e2d3b8', h: '#ffffff', o: '#8a7560' },
    mouse:    { b: '#aaa6a2', s: '#8d8884', h: '#c9c5c0', o: '#4f4a48' },
    duck:     { b: '#ffe08a', s: '#f0bf55', h: '#fff0b5', o: '#8a5a2a' },
    dog:      { b: '#b57a45', s: '#8f5c33', h: '#d49a62', o: '#4a2d18' },
    cat:      { b: '#e8863c', s: '#c46a28', h: '#f6a860', o: '#6e3a14' },
    pig:      { b: '#f4a8b8', s: '#d98aa0', h: '#ffc8d4', o: '#8a4258' },
    sheep:    { b: '#fdf6ea', s: '#e6dac6', h: '#ffffff', o: '#6a5a52' },
    cow:      { b: '#fff4dc', s: '#e2d3b8', h: '#ffffff', o: '#4a3a34' },
    squirrel: { b: '#c9743a', s: '#a65a28', h: '#e09258', o: '#5e2e12' },
    deer:     { b: '#c9955a', s: '#a87a44', h: '#e0b078', o: '#5a3a1c' },
    raccoon:  { b: '#9a9a9e', s: '#7c7c82', h: '#b8b8bc', o: '#3a3a40' },
    hedgehog: { b: '#a07850', s: '#80603c', h: '#b89068', o: '#4a3020' },
    penguin:  { b: '#3a3d4a', s: '#2a2c38', h: '#55596a', o: '#171822' },
    koala:    { b: '#9aa0a8', s: '#7e848c', h: '#b8bec6', o: '#3e4248' },
    tiger:    { b: '#f09a38', s: '#d07c24', h: '#f8b862', o: '#6a3a10' },
    monkey:   { b: '#9c6a3c', s: '#7e522c', h: '#b88456', o: '#4a2c14' },
    hamster:  { b: '#f2d4a0', s: '#dcb878', h: '#fae8c4', o: '#7a5a30' },
    chick:    { b: '#ffe566', s: '#f2c840', h: '#fff2a0', o: '#8a6a1a' },
    frog:     { b: '#6dbb5a', s: '#4f9a43', h: '#8ad278', o: '#2a5a24' },
    foxcub:   { b: '#e8742c', s: '#c85a1c', h: '#f4985a', o: '#5e2a10' }
  };
  const eye = (S, x, y) => { rect(S, x, y, 2, 2, E); px(S, x, y, WH); };
  function make(a, frame) {
    const p = PAL[a], S = mk(16, 21), hy = 11, step = frame ? 1 : 0, DK = '#2a1d1a';
    let fc = p.s, belly = p.h;                                    // колір ніжок і животика
    // --- що за головою / тілом (вуха, роги, хвіст)
    switch (a) {
      case 'bunny': ell(S, 5.5, 4, 1.8, 4.5, p.b, p.s); ell(S, 10.5, 4, 1.8, 4.5, p.b, p.s); rect(S, 5, 2, 1, 5, PK); rect(S, 10, 2, 1, 5, PK); break;
      case 'mouse': ell(S, 3.5, 7, 2.6, 2.6, p.b, p.s); ell(S, 12.5, 7, 2.6, 2.6, p.b, p.s); ell(S, 3.5, 7, 1.4, 1.4, PK); ell(S, 12.5, 7, 1.4, 1.4, PK); break;
      case 'dog': ell(S, 3, 10, 2, 3.4, '#6f4526'); ell(S, 13, 10, 2, 3.4, '#6f4526'); belly = '#e8c08a'; break;
      case 'duck': px(S, 7, 4, p.b); px(S, 8, 3, p.b); px(S, 9, 4, p.b); fc = '#e8863c'; break;
      case 'cat': rect(S, 3, 4, 3, 3, p.b); px(S, 3, 3, p.b); px(S, 4, 5, PK); rect(S, 10, 4, 3, 3, p.b); px(S, 12, 3, p.b); px(S, 11, 5, PK); rect(S, 13, 14, 3, 5, p.b); px(S, 15, 13, p.b); belly = '#fff4dc'; break;
      case 'pig': ell(S, 3.5, 6, 2, 2, p.b, p.s); ell(S, 12.5, 6, 2, 2, p.b, p.s); px(S, 3, 6, PK); px(S, 12, 6, PK); fc = '#d98aa0'; break;
      case 'sheep': ell(S, 2.5, 9, 2, 1.6, '#4a3e38'); ell(S, 13.5, 9, 2, 1.6, '#4a3e38'); fc = '#4a3e38'; break;
      case 'cow': ell(S, 2.5, 8, 2.2, 1.4, '#fff4dc', p.s); ell(S, 13.5, 8, 2.2, 1.4, '#fff4dc', p.s); rect(S, 4, 4, 2, 2, '#e8d8a8'); rect(S, 10, 4, 2, 2, '#e8d8a8'); fc = '#4a3a34'; break;
      case 'squirrel': ell(S, 13.5, 14, 2.6, 5, p.b, p.s); ell(S, 13.5, 12, 1.4, 3, p.h); rect(S, 4, 4, 2, 3, p.b); px(S, 4, 3, DK); rect(S, 10, 4, 2, 3, p.b); px(S, 11, 3, DK); belly = '#fff0d0'; break;
      case 'deer': rect(S, 4, 2, 1, 4, '#7a5030'); rect(S, 3, 2, 1, 1, '#7a5030'); px(S, 5, 3, '#7a5030'); rect(S, 11, 2, 1, 4, '#7a5030'); rect(S, 12, 2, 1, 1, '#7a5030'); px(S, 10, 3, '#7a5030'); ell(S, 2.5, 8, 2, 1.4, p.b, p.s); ell(S, 13.5, 8, 2, 1.4, p.b, p.s); belly = '#fff0d0'; break;
      case 'raccoon': ell(S, 3.5, 6.5, 2.4, 2.4, p.b, p.s); ell(S, 12.5, 6.5, 2.4, 2.4, p.b, p.s); ell(S, 3.5, 6.5, 1.2, 1.2, '#3a3a40'); ell(S, 12.5, 6.5, 1.2, 1.2, '#3a3a40'); rect(S, 13, 15, 3, 4, p.b); rect(S, 13, 16, 3, 1, '#3a3a40'); rect(S, 13, 18, 3, 1, '#3a3a40'); belly = '#cfcfd2'; break;
      case 'hedgehog': for (let i = 0; i < 6; i++) { px(S, 3 + i * 2, 5 + (i % 2), '#5a4030'); px(S, 3 + i * 2, 6 + (i % 2), '#5a4030'); } px(S, 1, 9, '#5a4030'); px(S, 14, 9, '#5a4030'); px(S, 1, 12, '#5a4030'); px(S, 14, 12, '#5a4030'); belly = '#f0d8b0'; break;
      case 'penguin': belly = '#ffffff'; fc = '#f08a2e'; ell(S, 2, 17, 1.6, 2.6, p.b); ell(S, 14, 17, 1.6, 2.6, p.b); break;
      case 'koala': ell(S, 2.5, 7, 3, 3, p.b, p.s); ell(S, 13.5, 7, 3, 3, p.b, p.s); ell(S, 2.5, 7, 1.6, 1.6, '#f4eee6'); ell(S, 13.5, 7, 1.6, 1.6, '#f4eee6'); belly = '#e6e8ea'; break;
      case 'tiger': ell(S, 3.5, 6.5, 2.2, 2.2, p.b, p.s); ell(S, 12.5, 6.5, 2.2, 2.2, p.b, p.s); ell(S, 3.5, 6.5, 1.1, 1.1, '#fff4dc'); ell(S, 12.5, 6.5, 1.1, 1.1, '#fff4dc'); belly = '#fff4dc'; break;
      case 'monkey': ell(S, 1.8, 11, 2.2, 2.4, p.b, p.s); ell(S, 14.2, 11, 2.2, 2.4, p.b, p.s); ell(S, 1.8, 11, 1.1, 1.2, '#f0c898'); ell(S, 14.2, 11, 1.1, 1.2, '#f0c898'); rect(S, 13, 15, 3, 1, p.b); rect(S, 15, 13, 1, 3, p.b); belly = '#f0c898'; break;
      case 'hamster': ell(S, 3.5, 6.5, 1.8, 1.8, p.b, p.s); ell(S, 12.5, 6.5, 1.8, 1.8, p.b, p.s); px(S, 3, 6, PK); px(S, 12, 6, PK); belly = '#fff4dc'; break;
      case 'chick': px(S, 8, 3, p.b); px(S, 7, 4, p.b); px(S, 9, 4, p.b); px(S, 8, 4, p.b); fc = '#f08a2e'; break;
      case 'frog': fc = '#4f9a43'; belly = '#d8f0b0'; break;
      case 'foxcub': rect(S, 3, 3, 3, 4, p.b); px(S, 3, 2, DK); px(S, 4, 2, DK); rect(S, 10, 3, 3, 4, p.b); px(S, 11, 2, DK); px(S, 12, 2, DK); rect(S, 13, 14, 3, 5, p.b); rect(S, 14, 17, 2, 2, '#fff4dc'); belly = '#fff4dc'; break;
    }
    // --- ніжки й тіло
    ell(S, 5.5, 20, 2.2, 1, fc); ell(S, 10.5, 20, 2.2, 1, fc); if (step) rect(S, 4, 19, 3, 1, fc);
    ell(S, 8, 17, 4.6, 3.3, p.b, p.s);
    ell(S, 8, 17.5, 2.6, 1.8, belly);
    if (a === 'cow') { rect(S, 10, 15, 3, 2, '#3a2a24'); }
    if (a === 'tiger') { [[4, 15], [11, 15], [4, 18], [11, 18]].forEach(q => rect(S, q[0], q[1], 1, 2, DK)); }
    if (a === 'deer') { [[6, 15], [10, 16], [8, 18]].forEach(q => px(S, q[0], q[1], '#fff4dc')); }
    if (a === 'hedgehog') ell(S, 8, 17.5, 2.6, 1.8, '#f0d8b0');
    // --- голова
    ell(S, 8, hy, 6.2, 5.2, p.b, p.s, p.h);
    // --- обличчя
    switch (a) {
      case 'bunny': case 'mouse': eye(S, 4, hy - 1); eye(S, 10, hy - 1); [[7, 2], [8, 2], [3, 2], [12, 2], [4, 2], [11, 2]].forEach(q => px(S, q[0], hy + q[1], PK)); break;
      case 'dog': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 3, 2, '#e8c08a'); px(S, 7, hy + 1, E); px(S, 8, hy + 1, E); rect(S, 7, hy + 3, 2, 1, PK); break;
      case 'duck': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 3, 1.5, '#e8863c'); rect(S, 5, hy + 3, 6, 1, '#c96d28'); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'cat': eye(S, 4, hy - 1); eye(S, 10, hy - 1); [[7, -5], [9, -5], [8, -4]].forEach(q => px(S, q[0], hy + q[1], p.s)); rect(S, 3, hy - 4, 1, 2, p.s); rect(S, 12, hy - 4, 1, 2, p.s); px(S, 7, hy + 2, PK); px(S, 8, hy + 2, PK); px(S, 7, hy + 3, DK); px(S, 8, hy + 3, DK); rect(S, 0, hy + 1, 2, 1, '#fff4dc'); rect(S, 14, hy + 1, 2, 1, '#fff4dc'); break;
      case 'pig': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.6, 3, 2, '#e888a0'); px(S, 7, hy + 2, '#8a4258'); px(S, 9, hy + 2, '#8a4258'); px(S, 3, hy + 2, '#ff9ab0'); px(S, 12, hy + 2, '#ff9ab0'); break;
      case 'sheep': ell(S, 8, hy + 0.6, 4.2, 4.2, '#6a5a52'); rect(S, 5, hy - 1, 2, 2, WH); rect(S, 9, hy - 1, 2, 2, WH); px(S, 5, hy, DK); px(S, 10, hy, DK); px(S, 7, hy + 2, '#3a2e2a'); px(S, 8, hy + 2, '#3a2e2a'); ell(S, 5, 6, 1.6, 1.4, p.b); ell(S, 8, 5.4, 1.8, 1.5, p.b); ell(S, 11, 6, 1.6, 1.4, p.b); break;
      case 'cow': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 5.5, hy - 3, 2.2, 1.6, '#3a2a24'); ell(S, 8, hy + 2.8, 3.6, 2, '#f4a8b8'); px(S, 7, hy + 2, '#a8586c'); px(S, 9, hy + 2, '#a8586c'); break;
      case 'squirrel': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 2.8, 1.8, '#fff0d0'); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); px(S, 3, hy + 2, '#ff9a7a'); px(S, 12, hy + 2, '#ff9a7a'); break;
      case 'deer': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.6, 2.6, 1.8, '#e8c898'); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); break;
      case 'raccoon': rect(S, 2, hy - 2, 12, 3, '#3a3a40'); rect(S, 3, hy - 1, 2, 2, WH); rect(S, 11, hy - 1, 2, 2, WH); px(S, 4, hy, DK); px(S, 11, hy, DK); ell(S, 8, hy + 2.6, 2.6, 1.8, '#d8d8dc'); rect(S, 7, hy + 1, 2, 1, DK); break;
      case 'hedgehog': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2, 5, 3.4, '#f0d8b0'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); break;
      case 'penguin': ell(S, 8, hy + 1, 4.8, 4, '#ffffff'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 6, hy + 2, 4, 2, '#f08a2e'); rect(S, 7, hy + 4, 2, 1, '#d4701c'); break;
      case 'koala': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.2, 2, 1.8, '#3a3438'); break;
      case 'tiger': eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 7, hy - 5, 2, 2, DK); rect(S, 3, hy - 4, 1, 2, DK); rect(S, 12, hy - 4, 1, 2, DK); rect(S, 1, hy + 1, 2, 1, DK); rect(S, 13, hy + 1, 2, 1, DK); ell(S, 8, hy + 2.6, 3, 2, '#fff4dc'); rect(S, 7, hy + 2, 2, 1, '#e0707a'); break;
      case 'monkey': ell(S, 8, hy + 1.4, 4.6, 3.6, '#f0c898'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); px(S, 7, hy + 2, '#7a4a30'); px(S, 8, hy + 2, '#7a4a30'); rect(S, 6, hy + 4, 4, 1, '#7a4a30'); break;
      case 'hamster': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 3.5, hy - 2, 2.4, 1.8, '#e0a860'); ell(S, 12.5, hy - 2, 2.4, 1.8, '#e0a860'); ell(S, 8, hy + 2.6, 4.6, 2, '#fff4dc'); px(S, 7, hy + 1, PK); px(S, 8, hy + 1, PK); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'chick': eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 6, hy + 2, 4, 2, '#f08a2e'); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'frog': ell(S, 4.5, hy - 5, 2.4, 2.4, p.b, p.s, p.h); ell(S, 11.5, hy - 5, 2.4, 2.4, p.b, p.s, p.h); rect(S, 3, hy - 6, 3, 3, WH); rect(S, 10, hy - 6, 3, 3, WH); rect(S, 4, hy - 5, 2, 2, DK); rect(S, 11, hy - 5, 2, 2, DK); rect(S, 4, hy + 2, 8, 1, '#2a5a24'); rect(S, 3, hy + 1, 1, 1, '#2a5a24'); rect(S, 12, hy + 1, 1, 1, '#2a5a24'); px(S, 6, hy, '#2a5a24'); px(S, 9, hy, '#2a5a24'); px(S, 3, hy + 3, '#ff9ab0'); px(S, 12, hy + 3, '#ff9ab0'); break;
      case 'foxcub': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.8, 5.4, 2.4, '#fff4dc'); ell(S, 8, hy + 2.8, 5.4, 2.4, '#fff4dc'); rect(S, 7, hy + 1, 2, 2, DK); break;
    }
    return outline(S, p.o);
  }
  // Пакети з покупками: 3 види (багет і зелень / квіти / яблуко), різні кольори, білі ручки
  const BAGS = {};
  const BAG_COL = { p: ['#ef8fa3', '#d4537e'], h: ['#f2b84b', '#c98a1e'], g: ['#4f9a63', '#2f7a4a'], n: ['#3d5a8c', '#2d467a'], u: ['#8b6bb0', '#6a4a94'] };
  function bag(kind, color) {
    const ep = (typeof viewEpoch === 'function') ? viewEpoch() % EPOCHS.length : 1;
    const key = kind + color + '_' + ep;
    if (BAGS[key]) return BAGS[key];
    if (window.SHOPBAG_OPT && SHOPBAG_OPT[ep]) { const k2 = 'A_' + ep; return BAGS[k2] || (BAGS[k2] = SHOPBAG_OPT[ep].A()); }       // у кожної епохи свій пакет
    const S = mk(10, 13), col = (BAG_COL[color] || BAG_COL.p)[0], sh = (BAG_COL[color] || BAG_COL.p)[1];
    if (kind === 0) { rect(S, 4, 0, 2, 5, '#e8b060'); px(S, 4, 0, '#f6d28a'); px(S, 5, 2, '#c98a3a'); px(S, 5, 4, '#c98a3a'); rect(S, 6, 2, 1, 3, '#4f9a63'); }
    if (kind === 1) { ell(S, 3, 3, 1.3, 1.3, PK); ell(S, 6, 2, 1.3, 1.3, '#ffe08a'); rect(S, 3, 4, 1, 2, '#4f9a63'); rect(S, 6, 3, 1, 3, '#4f9a63'); }
    if (kind === 2) { rect(S, 3, 1, 4, 4, '#e0604a'); px(S, 4, 1, '#ff9a8a'); rect(S, 5, 0, 1, 2, '#4f9a63'); }
    rect(S, 1, 5, 8, 8, col); rect(S, 1, 11, 8, 2, sh); rect(S, 1, 5, 8, 1, WH); rect(S, 3, 7, 4, 3, '#fff4dc');
    if (kind === 0) { px(S, 4, 8, sh); px(S, 5, 8, sh); }
    if (kind === 1) { rect(S, 4, 8, 2, 1, '#e0604a'); px(S, 4, 7, '#e0604a'); px(S, 5, 7, '#e0604a'); }
    if (kind === 2) { px(S, 4, 8, sh); px(S, 5, 9, sh); px(S, 6, 8, sh); }
    rect(S, 2, 3, 1, 3, '#fff4dc'); rect(S, 7, 3, 1, 3, '#fff4dc');
    // покупки залежать від епохи: кошик, блискучий пакет, коробка гри, посилка, сітка з овочами, капсула, неонова торба
    if (ep === 0) { rect(S, 1, 6, 8, 7, '#c98a3a'); for (let y = 6; y < 13; y++) for (let x = 1; x < 9; x++) if ((x + y) % 2) px(S, x, y, '#a8703f'); rect(S, 1, 6, 8, 1, '#8a5a2a'); rect(S, 2, 2, 1, 4, '#8a5a2a'); rect(S, 7, 2, 1, 4, '#8a5a2a'); rect(S, 2, 2, 6, 1, '#8a5a2a'); rect(S, 3, 3, 2, 3, '#e8b060'); rect(S, 5, 4, 2, 2, '#4f9a63'); }
    else if (ep === 2) { for (let k = 0; k < 6; k++) px(S, 2 + (k * 3) % 7, 6 + (k * 5) % 6, k % 2 ? '#ffffff' : '#ffe08a'); rect(S, 1, 9, 8, 1, '#ff5fa2'); }
    else if (ep === 3) { rect(S, 1, 5, 8, 8, '#2a1d1a'); rect(S, 1, 5, 8, 1, '#7a5cc9'); rect(S, 2, 7, 6, 2, '#3fa7a0'); rect(S, 3, 10, 1, 1, '#ffe08a'); rect(S, 5, 10, 2, 1, '#ff5fa2'); px(S, 3, 8, '#ffffff'); rect(S, 4, 1, 2, 4, '#c26b4a'); }
    else if (ep === 4) { rect(S, 1, 5, 8, 8, '#d9a066'); rect(S, 1, 5, 8, 1, '#e8b87a'); rect(S, 4, 5, 2, 8, '#fff4dc'); rect(S, 1, 10, 3, 2, '#ffffff'); px(S, 2, 11, '#4a3228'); px(S, 7, 8, '#3d5a8c'); rect(S, 2, 3, 1, 2, '#4a3228'); rect(S, 7, 3, 1, 2, '#4a3228'); }
    else if (ep === 5) { rect(S, 1, 5, 8, 8, '#4f9a63'); for (let y = 5; y < 13; y++) for (let x = 1; x < 9; x++) if ((x + y) % 2) px(S, x, y, '#2f6b48'); rect(S, 2, 7, 2, 2, '#e8863c'); rect(S, 5, 8, 3, 3, '#c4553d'); rect(S, 3, 10, 2, 2, '#ffe08a'); rect(S, 6, 5, 1, 3, '#8ed4a6'); rect(S, 2, 3, 1, 2, '#8ed4a6'); rect(S, 7, 3, 1, 2, '#8ed4a6'); }
    else if (ep === 6) { rect(S, 2, 5, 6, 8, '#9c9087'); rect(S, 1, 6, 8, 6, '#cfc5b8'); rect(S, 3, 7, 4, 2, '#86cfe8'); rect(S, 2, 10, 6, 1, '#4a3228'); rect(S, 4, 12, 2, 1, '#ffe08a'); rect(S, 4, 2, 2, 3, '#9c9087'); px(S, 4, 1, '#c4553d'); }
    else if (ep === 7) { rect(S, 1, 5, 8, 8, '#1b1230'); for (let x = 1; x < 9; x++) { px(S, x, 5, '#ff5fa2'); px(S, x, 12, '#3fa7a0'); } for (let y = 5; y < 13; y++) { px(S, 1, y, '#ff5fa2'); px(S, 8, y, '#3fa7a0'); } rect(S, 3, 8, 4, 1, '#3fa7a0'); px(S, 4, 7, '#ff5fa2'); px(S, 5, 9, '#ffffff'); }
    else if (ep === 8) { rect(S, 1, 5, 8, 8, '#d3342c'); rect(S, 1, 5, 8, 1, '#ffffff'); rect(S, 3, 7, 4, 3, '#fff4dc'); px(S, 4, 8, '#d3342c'); px(S, 5, 8, '#d3342c'); px(S, 4, 9, '#d3342c'); px(S, 5, 9, '#d3342c'); px(S, 2, 11, '#7a0f1c'); px(S, 7, 11, '#7a0f1c'); }
    return (BAGS[key] = outline(S, '#4a3228'));
  }
  return { make, bag };
})();
