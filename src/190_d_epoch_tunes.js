//#part 190_d_epoch_tunes.js
/* =====================================================================
   МУЗИКА ЕПОХ: у кожної епохи 0…8 (Ретро … Японія) свої дві мелодії (A — перші рівні магазину, B — пізні) й акорди,
   а три стилі гри (класична, пригодницька, спокійна) грають їх по-своєму: інший темп, тембри, рисунок баса, арпеджіо й ударних.
   Відродження (0): з р. 69 своя «Гальярда» в усіх стилях (старі MUSIC у 100_b лишились для свят і заставок).
   Токени як у MUSIC: «нота:кроки» (16 кроків = такт), «.» — пауза. Бас: R корінь, r вище, F квінта, T терція, S секста, l нижня квінта;
   арпеджіо: цифри 1…8 — звуки акорда знизу вгору. Ударні: k бас-барабан, s малий, h хет, o відкритий хет, c хлопок, T тайко, w дерев'яний блок, g дзвіночок.
   ===================================================================== */
const TUNE_Q = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], M7: [0, 4, 7, 11], dim: [0, 3, 6], sus: [0, 5, 7], '5': [0, 7, 12] };
const ARP_FAST = '1:1 2:1 3:1 4:1 3:1 2:1 3:1 4:1 1:1 2:1 3:1 4:1 3:1 2:1 3:1 4:1';
const ARP_SOFT = '1:4 3:4 2:4 3:4';
const LEAD_VOL = { square: 0.09, triangle: 0.16, sine: 0.15, sawtooth: 0.065 };
const BASS_VOL = { triangle: 0.22, sine: 0.28, sawtooth: 0.12, square: 0.07 };
const ARP_VOL = { square: 0.034, triangle: 0.07, sine: 0.08, sawtooth: 0.02 };

const EPOCH_TUNES = {
  /* 0. ВІДРОДЖЕННЯ (1500) «Гальярда при дворі»: 6/8 (такт = 12 кроків), ре дорійський, лютня-перебір, «флейта» з вібрато, тамбурин */
  0: {
    bpm: 92, lead: { wave: 'triangle', env: 'soft', vib: 1 },
    arp: { wave: 'triangle', env: 'pluck', pat: '1:2 2:2 3:2 4:2 3:2 2:2' },
    bass: { wave: 'triangle', pat: 'R:6 F:6', soft: 'R:12' },
    drums: { main: ['k:4 h:2 s:4 h:2'], chip: ['k:2 h:2 h:2 s:2 h:2 h:2'], soft: ['.:6 h:6'] },
    arpFast: '1:1 2:1 3:1 4:1 3:1 2:1 1:1 2:1 3:1 4:1 3:1 2:1',
    arpSoft: '1:4 3:4 2:4',
    A: { ch: ['Dm', 'C', 'Dm', 'A', 'F', 'C', 'A', 'Dm'], mel: [
      'D5:4 E5:2 F5:4 G5:2', 'E5:4 D5:2 C5:6', 'F5:4 G5:2 A5:4 F5:2', 'E5:6 C#5:6',
      'A5:4 C6:2 A5:4 F5:2', 'G5:4 E5:2 C5:4 E5:2', 'F5:2 E5:2 D5:2 F5:2 E5:2 C#5:2', 'D5:10 .:2'] },
    B: { ch: ['F', 'C', 'Bb', 'F', 'Dm', 'Gm', 'A', 'Dm'], mel: [
      'C6:4 A5:2 F5:4 A5:2', 'G5:4 E5:2 C6:6', 'D6:4 C6:2 Bb5:4 F5:2', 'A5:6 F5:4 G5:2',
      'A5:4 D6:2 F6:4 D6:2', 'G6:4 F6:2 D6:4 Bb5:2', 'A5:2 C#6:2 E6:2 G6:2 F6:2 E6:2', 'D6:10 .:2'] }
  },
  /* 1. РЕТРО (1957) «Рок-н-рол у закусочній»: 12-тактовий блюз, бугі-бас, гітарні рифи */
  1: {
    bpm: 150, lead: { wave: 'square', env: 'pluck', vol: 0.08 },
    arp: { wave: 'square', env: 'pluck', pat: '.:2 1:2 .:2 3:2 .:2 1:2 .:2 3:2' },
    bass: { wave: 'triangle', pat: 'R:2 T:2 F:2 S:2 r:2 S:2 F:2 T:2', soft: 'R:8 F:8' },
    drums: { main: ['k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['A', 'A', 'A', 'A', 'D', 'D', 'A', 'A', 'E', 'D', 'A', 'E'], mel: [
      'A4:1 C5:1 C#5:2 E5:2 A5:2 .:2 G5:2 E5:4', 'A5:3 G5:1 E5:2 C#5:2 A4:4 .:4', 'E5:2 E5:2 A5:2 E5:2 C#6:4 A5:4', 'G5:2 A5:2 G5:2 E5:2 D5:2 C#5:2 A4:4', 'D5:2 F#5:2 A5:2 B5:2 C6:2 B5:2 A5:4', 'F#5:3 E5:1 D5:4 A4:4 .:4',
      'C#5:2 E5:2 A5:2 C#6:2 E6:4 C#6:4', 'A5:2 G5:2 E5:2 C#5:2 A4:8', 'B4:2 E5:2 G#5:2 B5:2 E6:4 B5:4', 'A5:2 F#5:2 D5:2 F#5:2 A5:4 .:4', 'E5:2 A5:2 C#6:2 E6:2 A6:4 E6:4', 'E6:2 D6:2 B5:2 G#5:2 E5:2 G#5:2 B5:4'] },
    B: { ch: ['D', 'D', 'D', 'D', 'G', 'G', 'D', 'D', 'A', 'G', 'D', 'A'], mel: [
      'D5:2 F#5:2 A5:2 D6:2 F#6:4 D6:4', 'C6:2 A5:2 F#5:2 D5:2 A4:8', 'F#5:2 A5:2 D6:2 A5:2 F6:2 F#6:2 D6:4', 'C6:2 D6:2 C6:2 A5:2 G5:2 F#5:2 D5:4', 'G5:2 B5:2 D6:2 E6:2 F6:2 E6:2 D6:4', 'B5:3 A5:1 G5:4 D5:4 .:4',
      'F#5:2 A5:2 D6:2 F#6:2 A6:4 F#6:4', 'D6:2 C6:2 A5:2 F#5:2 D5:8', 'E5:2 A5:2 C#6:2 E6:2 A6:4 E6:4', 'D6:2 B5:2 G5:2 B5:2 D6:4 .:4', 'A5:2 D6:2 F#6:2 A6:2 D7:4 A6:4', 'A6:2 G6:2 E6:2 C#6:2 A5:2 C#6:2 E6:4'] }
  },
  /* 2. ДИСКО (1977) «Синт-диско» (як «I Feel Love»): біжучий секвенсорний бас, мрійлива мелодія */
  2: {
    bpm: 124, lead: { wave: 'square', env: 'soft', vib: 1, vol: 0.07 },
    arp: { wave: 'sine', env: 'soft', pat: '1:4 2:4 3:4 2:4' },
    bass: { wave: 'sawtooth', vol: 0.09, pat: 'R:1 r:1 F:1 r:1 R:1 r:1 F:1 r:1 R:1 r:1 F:1 r:1 R:1 r:1 F:1 r:1', soft: 'R:4 .:4 F:4 .:4' },
    drums: { main: ['k:4 k:4 k:4 k:4', '.:4 c:4 .:4 c:4', '.:2 o:2 .:2 o:2 .:2 o:2 .:2 o:2'], chip: ['k:4 k:4 k:4 k:4', '.:4 s:4 .:4 s:4', '.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2'], soft: ['k:8 k:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Cm', 'Cm', 'Ab', 'Ab', 'Fm', 'Fm', 'G', 'G'], mel: [
      'G5:8 D#5:4 F5:4', 'G5:4 G#5:4 G5:8', 'C6:8 A#5:4 G#5:4', 'G5:12 .:4',
      'G#5:8 G5:4 F5:4', 'C5:4 D#5:4 F5:8', 'G5:4 F5:4 D5:4 B4:4', 'D5:4 F5:4 G5:8'] },
    B: { ch: ['Ab', 'Bb', 'Cm', 'Cm', 'Ab', 'Bb', 'G', 'G'], mel: [
      'C6:6 D#6:2 C6:8', 'D6:6 F6:2 D6:8', 'D#6:4 D6:4 C6:4 G5:4', 'C6:12 .:4',
      'C6:4 D#6:4 G#6:8', 'F6:4 D6:4 A#5:8', 'B5:4 D6:4 G6:4 F6:4', 'D6:4 B5:4 G5:8'] }
  },
  /* 3. АРКАДИ (1986) «Чарівний замок» (як NES-платформер): швидкі арпеджіо, стрибучий бас, шумові барабани */
  3: {
    bpm: 150, lead: { wave: 'square', vib: 1, vol: 0.085 },
    arp: { wave: 'square', pat: '1:1 2:1 3:1 4:1 3:1 2:1 3:1 4:1 1:1 2:1 3:1 4:1 3:1 2:1 3:1 4:1', oct: 1 },
    bass: { wave: 'triangle', pat: 'R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1 F:1 r:1 F:1 r:1 R:1 r:1 R:1 r:1', soft: 'R:4 R:4 F:4 R:4' },
    drums: { main: ['k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 h:2'], chip: ['k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 h:2'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Am', 'F', 'G', 'Em', 'Am', 'F', 'G', 'E'], mel: [
      'A5:2 .:1 A5:1 C6:2 E6:2 D6:2 C6:2 B5:2 C6:2', 'A5:6 F5:2 A5:4 C6:4', 'B5:2 .:1 B5:1 D6:2 G6:2 F6:2 E6:2 D6:2 B5:2', 'E6:8 B5:4 G5:4',
      'A5:2 C6:2 E6:2 A6:2 G6:2 E6:2 C6:2 E6:2', 'F6:4 E6:2 C6:2 A5:8', 'G5:2 B5:2 D6:2 G6:2 F6:2 D6:2 B5:2 D6:2', 'E6:4 G#6:4 B6:8'] },
    B: { ch: ['F', 'G', 'Am', 'Am', 'F', 'G', 'E', 'E'], mel: [
      'C7:4 A6:4 F6:4 C6:4', 'D7:4 B6:4 G6:4 D6:4', 'E7:6 C7:2 A6:8', 'A6:2 B6:2 C7:2 E7:2 A7:8',
      'F6:2 A6:2 C7:2 A6:2 F6:2 C6:2 A5:4', 'G6:2 B6:2 D7:2 B6:2 G6:2 D6:2 B5:4', 'G#6:4 B6:4 E7:8', 'E7:2 D7:2 B6:2 G#6:2 E6:8'] }
  },
  /* 4. ІНТЕРНЕТ (2001) «Євроденс-гімн»: офбіт-бас, «супер-пила», прилипливий риф шістнадцятими, хлопки */
  4: {
    bpm: 136, lead: { wave: 'sawtooth', vol: 0.07 },
    arp: { wave: 'square', env: 'pluck', pat: '.:2 1:2 .:2 2:2 .:2 3:2 .:2 2:2' },
    bass: { wave: 'sawtooth', vol: 0.1, pat: '.:2 R:2 .:2 r:2 .:2 R:2 .:2 r:2', soft: 'R:8 F:8' },
    drums: { main: ['k:4 k:4 k:4 k:4', '.:4 c:4 .:4 c:4', '.:2 o:2 .:2 o:2 .:2 o:2 .:2 o:2'], chip: ['k:4 h:2 h:2 k:4 s:2 h:2'], soft: ['k:8 k:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G'], mel: [
      'A5:2 A5:1 A5:1 E6:2 A5:2 C6:2 A5:1 A5:1 E6:2 D6:2', 'C6:2 B5:2 A5:2 E5:2 G5:3 A5:5', 'A5:2 A5:1 A5:1 F6:2 A5:2 C6:2 A5:1 A5:1 F6:2 E6:2', 'C6:2 A5:2 F5:2 A5:2 C6:3 F6:5',
      'G5:2 G5:1 G5:1 E6:2 G5:2 C6:2 G5:1 G5:1 E6:2 D6:2', 'E6:2 D6:2 C6:2 G5:2 C6:3 E6:5', 'B5:2 B5:1 B5:1 D6:2 G6:2 D6:2 B5:1 B5:1 G6:2 A6:2', 'B6:4 A6:2 G6:2 D6:4 B5:4'] },
    B: { ch: ['F', 'G', 'Am', 'Am', 'F', 'G', 'E', 'E'], mel: [
      'C6:6 A5:2 C6:4 F6:4', 'D6:6 B5:2 D6:4 G6:4', 'E6:4 C6:2 A5:2 E6:4 A6:4', 'G6:3 E6:3 C6:2 A5:8',
      'A6:2 G6:2 F6:2 C6:2 A6:2 G6:2 F6:2 C6:2', 'B6:2 A6:2 G6:2 D6:2 B6:2 A6:2 G6:2 D6:2', 'G#6:4 E6:4 B5:4 E6:4', 'G#6:8 B6:8'] }
  },
  /* 5. ЕКО (2025) «Інді-фолк біля грядок»: укулеле-страм, тупіт і плескання, мелодія-свист */
  5: {
    bpm: 104, lead: { wave: 'sine', vib: 1, vol: 0.14 },
    arp: { wave: 'triangle', env: 'pluck', pat: '1:2 3:2 .:2 2:1 3:1 .:2 2:1 3:1 1:2 3:2' },
    bass: { wave: 'triangle', pat: 'R:4 .:2 F:2 R:4 T:4', soft: 'R:8 F:8' },
    drums: { main: ['k:4 c:4 k:2 k:2 c:4', 'h:2 h:2 h:2 h:2 h:2 h:2 h:2 h:2'], chip: ['k:4 s:4 k:2 k:2 s:4'], soft: ['.:4 h:4 .:4 h:4'] },
    leadSoft: { wave: 'sine', env: 'pluck', vol: 0.2 },
    A: { ch: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'], mel: [
      'D5:2 G5:2 B5:4 A5:2 G5:2 D5:4', 'F#5:2 A5:2 D6:4 B5:2 A5:2 F#5:4', 'G5:2 B5:2 E6:4 D6:2 B5:2 G5:4', 'E5:2 G5:2 C6:3 B5:1 A5:4 G5:4',
      'B5:2 D6:2 G6:4 F#6:2 D6:2 B5:4', 'A5:2 D6:2 F#6:4 E6:2 D6:2 A5:4', 'G5:2 C6:2 E6:4 D6:2 C6:2 B5:2 A5:2', 'A5:4 F#5:2 A5:2 D6:8'] },
    B: { ch: ['C', 'G', 'Am', 'Em', 'C', 'G', 'D', 'G'], mel: [
      'E6:6 D6:2 C6:4 G5:4', 'D6:6 B5:2 G5:8', 'C6:4 E6:4 A6:4 G6:2 E6:2', 'G6:6 E6:2 B5:8',
      'C6:2 E6:2 G6:4 E6:2 G6:2 C7:4', 'B6:4 G6:2 D6:2 B5:4 D6:4', 'A5:2 D6:2 F#6:2 A6:2 G6:2 F#6:2 E6:2 D6:2', 'G6:12 .:4'] }
  },
  /* 6. КОСМОС (2160) «Космічна одіссея» (як старі синт-альбоми про космос): синт-струнні з вібрато, секвенсорні бліпи, повільний пульс ритм-машини */
  6: {
    bpm: 92, lead: { wave: 'sawtooth', env: 'soft', vib: 1, vol: 0.05 },
    arp: { wave: 'square', env: 'pluck', oct: 1, pat: '1:1 2:1 3:1 2:1 4:1 3:1 2:1 3:1 1:1 2:1 3:1 2:1 4:1 3:1 2:1 3:1' },
    bass: { wave: 'sine', vol: 0.2, pat: 'R:3 R:1 r:2 R:2 F:3 R:1 r:2 F:2', soft: 'R:16' },
    drums: { main: ['k:4 s:4 k:2 k:2 s:4', '.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2', '.:14 g:2'], chip: ['k:4 s:4 k:4 s:4', 'h:2 h:2 h:2 h:2 h:2 h:2 h:2 h:2'], soft: ['g:16'] },
    leadSoft: { wave: 'sine', env: 'soft', vib: 1, vol: 0.17 },
    A: { ch: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'C', 'A'], mel: [
      'A5:6 D6:2 F6:4 E6:2 D6:2', 'D6:6 F6:2 Bb5:8', 'G5:4 Bb5:4 D6:4 G6:4', 'E6:8 C#6:4 A5:4',
      'F6:6 E6:2 D6:4 A5:4', 'Bb5:4 D6:4 F6:6 G6:2', 'E6:4 G6:4 C7:4 Bb6:4', 'A6:12 .:4'] },
    B: { ch: ['FM7', 'C', 'Dm', 'Bb', 'Gm', 'C', 'FM7', 'A'], mel: [
      'C6:8 A5:4 F5:4', 'G5:6 E5:2 C6:8', 'F5:4 A5:4 D6:8', 'D6:6 C6:2 Bb5:8',
      'G5:4 Bb5:4 D6:4 F6:4', 'E6:6 D6:2 C6:8', 'A5:4 C6:4 E6:4 F6:4', 'E6:8 C#6:4 E6:4'] }
  },
  /* 7. НЕОН (2099) «Кіберпанк-драйв» (як нічні перегони): героїчна пила, арпеджіо шістнадцятими, октавний бас, гейтований малий */
  7: {
    bpm: 112, lead: { wave: 'sawtooth', vol: 0.08 },
    arp: { wave: 'square', oct: 1, pat: '1:1 2:1 3:1 4:1 5:1 4:1 3:1 2:1 1:1 2:1 3:1 4:1 5:1 4:1 3:1 2:1' },
    bass: { wave: 'sawtooth', vol: 0.12, pat: 'R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1 R:1 r:1', soft: 'R:8 F:8' },
    drums: { main: ['k:4 .:4 k:4 .:2 k:2', '.:4 s:4 .:4 s:4', 'h:1 h:1 o:2 h:1 h:1 o:2 h:1 h:1 o:2 h:1 h:1 o:2'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Fm', 'G'], mel: [
      'C6:3 D6:3 Eb6:2 G6:6 F6:2', 'Eb6:4 C6:4 Ab5:6 C6:2', 'Bb5:3 C6:3 Eb6:2 G6:6 Bb6:2', 'F6:4 D6:4 Bb5:8',
      'G6:3 F6:3 Eb6:2 C6:6 Eb6:2', 'F6:3 Eb6:3 C6:2 Ab5:8', 'Ab5:2 C6:2 F6:4 Eb6:2 D6:2 C6:4', 'B5:4 D6:4 G6:8'] },
    B: { ch: ['Ab', 'Bb', 'Cm', 'Cm', 'Ab', 'Bb', 'G', 'G'], mel: [
      'Eb6:6 C6:2 Ab5:4 C6:4', 'F6:6 D6:2 Bb5:4 D6:4', 'G6:4 F6:2 Eb6:2 D6:2 Eb6:2 C6:4', 'C6:12 .:4',
      'Ab5:2 C6:2 Eb6:2 Ab6:2 G6:4 Eb6:4', 'Bb5:2 D6:2 F6:2 Bb6:2 Ab6:4 F6:4', 'G6:4 D6:4 B5:4 D6:4', 'G6:6 F6:2 D6:4 B5:4'] }
  },
  /* 8. ЯПОНІЯ (1868) «Стежка-вальс»: вальс на 3 долі (такт = 12 кроків) у японській гамі йо (ре-мі-соль-ля-сі): мелодія «Стежки до Фудзі» в ритмі «Вальсу сакури».
     Класична — флейта-сякухачі з вібрато + кото-щипки; пригодницька (leadChip/arpChip/arpFast) — мелодія на кото й жвавіший перебір; спокійна (leadSoft/arpSoft) — повільніше, лише флейта й тихий щипок. БЕЗ ударних. 16 тактів на частину. */
  8: {
    bpm: 96, lead: { wave: 'sine', env: 'soft', vib: 1, vol: 0.2 },
    arp: { wave: 'triangle', env: 'pluck', pat: '1:2 3:2 2:2 3:2 2:2 3:2', vol: 0.075 },
    bass: { wave: 'sine', pat: 'R:4 F:4 F:4', soft: 'R:12', vol: 0.2 },
    drums: { main: ['.:12'], chip: ['.:12'], soft: ['.:12'] },
    leadChip: { wave: 'triangle', env: 'pluck', vib: 0, vol: 0.24 },
    arpChip: { wave: 'sine', env: 'pluck', vol: 0.06 },
    arpFast: '1:1 2:1 3:1 2:1 1:1 2:1 3:1 2:1 1:1 2:1 3:1 2:1',
    leadSoft: { wave: 'sine', env: 'soft', vib: 0, vol: 0.2 },
    arpSoft: '1:4 3:4 2:4',
    A: { ch: ['D', 'D', 'G', 'Asus', 'D', 'Bm', 'G', 'Asus', 'D', 'Bm', 'G', 'D', 'Bm', 'G', 'Asus', 'Asus'], mel: [
      'D5:4 E5:4 G5:4', 'A5:6 G5:2 E5:4', 'B5:4 A5:4 G5:4', 'E5:8 D5:2 E5:2',
      'D5:4 G5:4 A5:4', 'B5:6 A5:2 G5:4', 'A5:4 B5:4 D6:4', 'A5:8 E5:4',
      'A5:4 G5:4 E5:4', 'D6:6 B5:2 A5:4', 'B5:4 D6:4 G6:4', 'A5:6 G5:2 E5:4',
      'D6:4 B5:4 G5:4', 'A5:6 B5:2 D6:4', 'E6:6 D6:2 B5:4', 'A5:8 E5:4'] },
    B: { ch: ['D', 'G', 'D', 'Asus', 'Bm', 'G', 'Asus', 'D', 'G', 'D', 'Bm', 'Asus', 'G', 'D', 'Asus', 'D'], mel: [
      'A5:4 D6:4 G6:4', 'E6:6 D6:2 B5:4', 'D6:4 B5:4 A5:4', 'A5:8 B5:2 A5:2',
      'B5:4 D6:4 E6:4', 'G6:6 E6:2 D6:4', 'E6:4 D6:4 B5:4', 'D6:8 A5:4',
      'B5:4 D6:4 G6:4', 'E6:6 D6:2 A5:4', 'B5:4 D6:4 E6:4', 'A5:6 B5:2 D6:4',
      'E6:6 D6:2 B5:4', 'D6:4 E6:4 G6:4', 'E6:4 D6:4 B5:4', 'D6:8 A5:4'] }
  }
};

// «Am7» → { root: 'A', iv: [0,3,7,10] }
function chordInfo(name) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(name), iv = TUNE_Q[m[3]] || TUNE_Q[''];
  return { letter: m[1], acc: m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, iv };
}
function midiNote(midi) { return SHARP_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1); }
// один такт патерну: літери/цифри замінюються на ноти акорда
function tuneBar(pat, ci, kind, octShift) {
  const base = NOTE_INDEX[ci.letter] + ci.acc;
  const root = kind === 'bass' ? base + (NOTE_INDEX[ci.letter] >= 5 ? 3 : 4) * 12 : base + 5 * 12 + (octShift || 0) * 12;   // бас: F2…B2 і C3…E3; арпеджіо: від C4
  return pat.split(/\s+/).map(tok => {
    const [n, len] = tok.split(':');
    let v = null;
    if (n === '.') return '.:' + len;
    if (kind === 'bass') {
      v = { R: root, r: root + 12, F: root + 7, T: root + (ci.iv[1] || 4), S: root + 9, l: root - 5 }[n];
    } else {
      const i = Number(n) - 1; v = root + ci.iv[i % ci.iv.length] + 12 * Math.floor(i / ci.iv.length);
    }
    return midiNote(v) + ':' + len;
  }).join(' ');
}
function epochTrackKey(ep, level, styleId) {
  const lvl = Math.max(1, Math.min(6, level | 0));
  return 'ep' + ep + ':' + (lvl <= 4 ? 'A' : 'B') + ':' + (lvl >= 3 ? 1 : 0) + ':' + styleId;
}
function epochTrackDef(key) {
  if (MUSIC_PARSED[key]) return MUSIC_PARSED[key];
  const [epS, tuneId, fullS, style] = key.split(':'), ep = Number(epS.slice(2)), P = EPOCH_TUNES[ep];
  if (!P) return trackDef('calm');
  const tune = P[tuneId], full = fullS === '1', chords = tune.ch.map(chordInfo), bars = tune.mel.length;
  const chill = style === 'chill', chip = style === 'chip';
  // тембри ролей за стилем
  const lead = Object.assign({}, P.lead, chip ? Object.assign({ wave: 'square', env: null, vib: 0, vol: LEAD_VOL.square }, P.leadChip || {}) : chill ? Object.assign({ wave: 'triangle', env: 'soft', vib: 0, vol: LEAD_VOL.triangle }, P.leadSoft || {}) : {});
  if (!lead.vol) lead.vol = LEAD_VOL[lead.wave];
  const arp = chip ? Object.assign({ wave: 'square', pat: P.arpFast || ARP_FAST, vol: ARP_VOL.square }, P.arpChip || {}) : chill ? { wave: 'sine', env: 'soft', pat: P.arpSoft || ARP_SOFT, vol: ARP_VOL.sine, vib: 0 } : Object.assign({}, P.arp);
  if (!arp.vol) arp.vol = ARP_VOL[arp.wave];
  const bass = chip ? { wave: 'triangle', pat: P.bass.pat } : chill ? { wave: 'triangle', pat: P.bass.soft } : P.bass;
  const bvol = (!chip && !chill && P.bass.vol) || BASS_VOL[bass.wave];
  const drums = chill || !full ? P.drums.soft : chip ? P.drums.chip : P.drums.main;
  const mk = (kind, o) => parseTokens(chords.map(ci => tuneBar(o.pat, ci, kind, o.oct || 0)).join(' '));
  const melody = parseTokens(tune.mel.join(' '));
  const channels = [{ wave: lead.wave, vol: lead.vol, env: lead.env || null, vib: lead.vib || 0, events: melody.events, total: melody.total }];
  if (full || chill) { const a = mk('arp', { pat: arp.pat, oct: arp.oct || 0 }); channels.push({ wave: arp.wave, vol: arp.vol, env: arp.env || null, vib: arp.vib || 0, events: a.events, total: a.total }); }
  const b = mk('bass', { pat: bass.pat });
  channels.push({ wave: bass.wave, vol: bvol, env: null, vib: 0, events: b.events, total: b.total });
  drums.forEach((d, i) => { const p = parseTokens(Array(bars).fill(d).join(' ')); channels.push({ wave: 'noise', vol: i ? 0.26 : 0.3, events: p.events, total: p.total }); });
  const bpmK = chip ? 1.15 : chill ? 0.8 : 1;
  return (MUSIC_PARSED[key] = { bpm: P.bpm * bpmK, channels, total: melody.total });
}
