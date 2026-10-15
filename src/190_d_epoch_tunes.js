//#part 190_d_epoch_tunes.js
/* =====================================================================
   МУЗИКА ЕПОХ: у кожної епохи 1…8 (Ретро … Японія) свої дві мелодії (A — перші рівні магазину, B — пізні) й акорди,
   а три стилі гри (класична, пригодницька, спокійна) грають їх по-своєму: інший темп, тембри, рисунок баса, арпеджіо й ударних.
   Відродження (0): класичний стиль — старі мелодії (MUSIC у 100_b), пригодницький і спокійний — ті самі мелодії в тембрах стилю (запис 0 нижче); свята лишаються на старих. Ключ треку: ep<епоха>:<A|B>:<повний 0|1>:<стиль>.
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
  /* 0. ВІДРОДЖЕННЯ: ті самі мелодії, що в класичному стилі (calm → A, mall → B), у пригодницькому й спокійному тембрах */
  0: {
    bpm: 100, lead: { wave: 'square' },
    arp: { wave: 'square', pat: ARP_FAST },
    bass: { wave: 'triangle', pat: 'R:4 r:4 R:4 r:4', soft: 'R:8 F:8' },
    drums: { main: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['.:4 h:2 .:2 .:4 h:2 .:2'] },
    A: { ch: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'], mel: [
      'E5:4 G5:2 E5:2 C5:4 E5:4', 'C5:4 E5:2 A4:2 A4:8', 'A4:4 C5:2 F5:2 E5:4 C5:4', 'D5:4 B4:4 G4:8',
      'E5:4 G5:2 E5:2 C6:4 G5:4', 'E5:4 C5:2 A4:2 E5:8', 'F5:4 E5:2 D5:2 C5:4 A4:4', 'G4:2 B4:2 D5:4 G5:8'] },
    B: { ch: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'], mel: [
      'A4:4 D5:4 F#5:4 A5:4', 'E5:4 A5:4 C#6:4 A5:4', 'D5:4 F#5:4 B5:4 F#5:4', 'B4:4 D5:4 G5:4 B5:4',
      'D6:6 C#6:2 A5:4 F#5:4', 'E5:2 F#5:2 G#5:2 A5:2 C#6:8', 'B5:4 A5:4 G5:4 F#5:4', 'E5:4 F#5:4 A5:8'] }
  },
  /* 1. РЕТРО (1957): ду-воп I–vi–IV–V, хитка свінгова пульсація, ходячий бас */
  1: {
    bpm: 100, lead: { wave: 'triangle' },
    arp: { wave: 'square', pat: '.:2 2:1 3:1 .:2 4:2 .:2 2:1 3:1 .:2 4:2' },
    bass: { wave: 'triangle', pat: 'R:4 T:4 F:4 S:4', soft: 'R:8 F:8' },
    drums: { main: ['k:3 h:1 h:4 s:3 h:1 h:4'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'], mel: [
      'G5:3 E5:1 G5:3 E5:1 C5:4 .:4', 'A5:3 G5:1 E5:3 C5:1 A4:4 .:4', 'A5:3 F5:1 A5:3 F5:1 C6:4 .:4', 'B5:3 G5:1 D6:3 B5:1 G5:8',
      'G5:3 E5:1 G5:3 E5:1 C6:4 G5:4', 'E5:3 A5:1 E5:3 C5:1 A4:8', 'D5:3 F5:1 A5:3 F5:1 D6:4 A5:4', 'G5:2 A5:2 B5:2 D6:2 G5:8'] },
    B: { ch: ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'], mel: [
      'C6:4 A5:4 F5:4 A5:4', 'D6:4 B5:4 G5:4 B5:4', 'E6:6 C6:2 G5:4 E5:4', 'A5:4 C6:4 E6:4 C6:4',
      'F6:3 E6:1 D6:4 C6:4 A5:4', 'G5:3 A5:1 B5:4 D6:4 B5:4', 'C6:3 B5:1 C6:4 E6:4 G6:4', 'C6:12 .:4'] }
  },
  /* 2. ДИСКО (1977): ля мінор, чотири долі, октавний бас, синкопований ріф, стаби на «і» */
  2: {
    bpm: 116, lead: { wave: 'sawtooth' },
    arp: { wave: 'square', pat: '.:2 3:1 .:1 .:2 3:1 .:1 .:2 3:1 .:1 .:2 3:1 .:1' },
    bass: { wave: 'triangle', pat: 'R:2 r:2 R:2 r:2 R:2 r:2 R:2 r:2', soft: 'R:4 .:4 F:4 .:4' },
    drums: { main: ['k:4 k:4 k:4 k:4', '.:4 c:4 .:4 c:4', '.:2 o:2 .:2 o:2 .:2 o:2 .:2 o:2'], chip: ['k:4 k:4 k:4 k:4', '.:4 s:4 .:4 s:4', '.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2'], soft: ['k:8 k:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Am7', 'Dm7', 'G7', 'CM7', 'FM7', 'Bdim', 'E7', 'Am7'], mel: [
      'A5:2 .:1 C6:1 E6:2 C6:2 A5:2 .:2 E5:2 G5:2', 'D6:2 .:1 F6:1 A6:2 F6:2 D6:2 .:2 A5:2 C6:2', 'G5:2 .:1 B5:1 D6:2 B5:2 G5:2 .:2 F5:2 G5:2', 'E6:4 D6:2 C6:2 B5:4 G5:4',
      'F6:2 .:1 E6:1 C6:2 A5:2 C6:2 .:2 E6:2 F6:2', 'D6:2 .:1 F6:1 B5:2 D6:2 F6:2 .:2 D6:4', 'G#5:2 .:1 B5:1 E6:2 B5:2 G#5:2 .:2 D6:2 B5:2', 'A5:4 C6:4 E6:4 A6:4'] },
    B: { ch: ['Am7', 'Am7', 'Dm7', 'Dm7', 'G7', 'CM7', 'FM7', 'E7'], mel: [
      'A5:6 G5:2 E5:4 A5:4', 'C6:6 B5:2 A5:8', 'D6:6 C6:2 A5:4 F5:4', 'F5:2 A5:2 D6:4 C6:8',
      'B5:6 A5:2 G5:4 D5:4', 'E6:6 D6:2 C6:4 G5:4', 'A5:4 C6:4 F6:4 E6:4', 'G#5:4 B5:4 E6:6 .:2'] }
  },
  /* 3. АРКАДИ (1986): чіптюн, ми мінор, стрімкі арпеджіо-пробіжки, швидкий темп */
  3: {
    bpm: 148, lead: { wave: 'square' },
    arp: { wave: 'square', pat: ARP_FAST },
    bass: { wave: 'triangle', pat: 'R:2 R:2 r:2 R:2 R:2 R:2 r:2 R:2', soft: 'R:4 R:4 F:4 R:4' },
    drums: { main: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], chip: ['k:2 h:1 h:1 s:2 h:1 h:1 k:2 h:1 h:1 s:2 h:1 h:1'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'B7'], mel: [
      'E5:1 G5:1 B5:1 E6:1 B5:1 G5:1 B5:1 E6:1 G6:4 E6:4', 'C5:1 E5:1 G5:1 C6:1 G5:1 E5:1 G5:1 C6:1 E6:4 C6:4', 'B4:1 D5:1 G5:1 B5:1 G5:1 D5:1 G5:1 B5:1 D6:4 B5:4', 'A4:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 D6:4 A5:4',
      'G5:4 E5:2 G5:2 B5:4 G5:4', 'E5:4 C5:2 E5:2 G5:4 E5:4', 'F#5:4 D5:2 F#5:2 A5:4 F#5:4', 'D#5:2 F#5:2 B5:2 F#5:2 A5:2 F#5:2 D#5:2 B4:2'] },
    B: { ch: ['Am', 'B7', 'Em', 'C', 'Am', 'B7', 'Em', 'Em'], mel: [
      'A5:2 A5:2 C6:2 A5:2 E6:4 C6:4', 'B5:2 B5:2 D#6:2 B5:2 F#6:4 D#6:4', 'E6:2 E6:2 G6:2 E6:2 B5:4 G5:4', 'C6:2 C6:2 E6:2 C6:2 G5:4 E5:4',
      'A5:1 C6:1 E6:1 C6:1 A5:1 C6:1 E6:1 A6:1 E6:8', 'F#5:1 A5:1 B5:1 D#6:1 F#6:1 D#6:1 B5:1 A5:1 F#5:8', 'G5:2 B5:2 E6:2 G6:2 E6:4 B5:4', 'E6:12 .:4'] }
  },
  /* 4. ІНТЕРНЕТ (2001): транс/євроденс, ля мінор, «супер-пила» й гейтові арпеджіо, ходовий бас */
  4: {
    bpm: 128, lead: { wave: 'sawtooth' },
    arp: { wave: 'square', pat: '.:1 1:1 .:1 2:1 .:1 3:1 .:1 2:1 .:1 1:1 .:1 2:1 .:1 3:1 .:1 2:1' },
    bass: { wave: 'sawtooth', pat: '.:1 R:1 R:1 R:1 .:1 R:1 R:1 R:1 .:1 R:1 R:1 R:1 .:1 R:1 R:1 R:1', soft: 'R:8 F:8' },
    drums: { main: ['k:4 k:4 k:4 k:4', '.:4 c:4 .:4 c:4', '.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['k:8 k:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'G'], mel: [
      'E6:4 C6:2 E6:2 A5:8', 'F6:4 C6:2 F6:2 A5:8', 'E6:4 G6:2 E6:2 C6:8', 'D6:4 B5:2 D6:2 G5:8',
      'A5:2 C6:2 E6:2 A6:2 G6:4 E6:4', 'F6:2 A5:2 C6:2 F6:2 E6:4 C6:4', 'D6:2 G5:2 B5:2 D6:2 G6:8', 'D6:4 B5:4 G5:8'] },
    B: { ch: ['F', 'C', 'G', 'Am', 'F', 'C', 'G', 'G'], mel: [
      'A5:8 C6:8', 'G5:8 E6:8', 'D6:8 B5:8', 'C6:4 E6:4 A5:8',
      'F6:6 E6:2 C6:8', 'E6:6 D6:2 C6:8', 'B5:6 D6:2 G6:8', 'G6:4 D6:4 B5:4 D6:4'] }
  },
  /* 5. ЕКО (2025): акустична пастораль, соль мажор, пентатоніка, перебір «кальвінг» і легкий шейкер */
  5: {
    bpm: 88, lead: { wave: 'triangle', env: 'pluck', vol: 0.2 },
    arp: { wave: 'sine', pat: '1:2 3:2 4:2 3:2 1:2 3:2 4:2 3:2' },
    bass: { wave: 'sine', pat: 'R:8 F:4 T:4', soft: 'R:16' },
    drums: { main: ['.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2'], chip: ['k:4 .:4 s:4 .:4', 'h:2 h:2 h:2 h:2 h:2 h:2 h:2 h:2'], soft: ['.:4 h:4 .:4 h:4'] },
    leadSoft: { wave: 'sine', env: 'pluck', vol: 0.2 },
    A: { ch: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'], mel: [
      'B5:4 D6:4 B5:2 A5:2 G5:4', 'A5:4 D6:4 A5:2 G5:2 A5:4', 'G5:4 B5:4 E6:4 B5:4', 'E6:4 D6:4 C6:4 G5:4',
      'B5:4 D6:4 G6:4 D6:4', 'A5:4 D6:4 F#6:4 D6:4', 'E6:6 D6:2 C6:4 E6:4', 'D6:8 A5:4 .:4'] },
    B: { ch: ['C', 'G', 'Am', 'D', 'C', 'G', 'D', 'G'], mel: [
      'G5:2 E6:6 D6:4 C6:4', 'D6:6 B5:2 G5:8', 'C6:4 E6:4 A5:4 C6:4', 'A5:4 D6:4 F#6:8',
      'E6:4 G6:4 E6:4 C6:4', 'D6:4 B5:4 D6:4 G6:4', 'A5:4 F#5:4 A5:4 D6:4', 'G5:12 .:4'] }
  },
  /* 6. КОСМОС (2160): повільний амбієнт, ре мінор → ліддійський, довгі звуки з вібрато, «бліпи» арпеджіо, бас-гул */
  6: {
    bpm: 72, lead: { wave: 'sine', env: 'soft', vib: 1, vol: 0.13 },
    arp: { wave: 'sine', env: 'pluck', oct: 1, pat: '1:1 .:3 3:1 .:3 4:1 .:3 3:1 .:3', vol: 0.07 },
    bass: { wave: 'sine', pat: 'R:16', soft: 'R:16', vol: 0.2 },
    drums: { main: ['.:8 g:8'], chip: ['k:4 .:4 s:4 .:4', 'h:2 h:2 h:2 h:2 h:2 h:2 h:2 h:2'], soft: ['g:16'] },
    leadSoft: { wave: 'sine', env: 'soft', vib: 1, vol: 0.17 },
    A: { ch: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], mel: [
      'D6:8 .:2 A5:2 F5:4', 'D6:6 F6:2 Bb5:8', 'A5:8 C6:4 F6:4', 'E6:8 G5:4 C6:4',
      'D6:6 F6:2 E6:8', 'D6:8 F6:4 D6:4', 'G5:6 Bb5:2 D6:8', 'C#6:8 E6:4 A5:4'] },
    B: { ch: ['FM7', 'G', 'FM7', 'Em', 'Dm7', 'Bb', 'C', 'C'], mel: [
      'A5:12 C6:4', 'B5:6 D6:2 G6:8', 'C6:8 E6:4 A5:4', 'B5:8 G5:4 E5:4',
      'F5:4 A5:4 D6:8', 'F6:6 D6:2 Bb5:8', 'G5:4 C6:4 E6:8', 'D6:8 C6:8'] }
  },
  /* 7. НЕОН (2099): синтвейв, до мінор, довгі «пилкові» ноти над пульсуючим басом, гейтований малий барабан */
  7: {
    bpm: 104, lead: { wave: 'sawtooth', vol: 0.09 },
    arp: { wave: 'square', pat: '1:1 .:1 3:1 .:1 2:1 .:1 3:1 .:1 1:1 .:1 3:1 .:1 2:1 .:1 3:1 .:1' },
    bass: { wave: 'sawtooth', pat: 'R:2 R:2 R:2 R:2 R:2 R:2 R:2 R:2', soft: 'R:8 F:8', vol: 0.16 },
    drums: { main: ['k:4 .:4 k:4 .:4', '.:4 s:4 .:4 s:4', 'h:2 h:2 h:2 h:2 h:2 h:2 h:2 h:2'], chip: ['k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'], soft: ['k:8 .:8', '.:4 h:4 .:4 h:4'] },
    A: { ch: ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Eb', 'Bb'], mel: [
      'G5:6 .:2 Eb5:4 G5:4', 'Ab5:6 .:2 C6:4 Ab5:4', 'G5:6 .:2 Bb5:4 G5:4', 'F5:6 .:2 Bb5:4 D6:4',
      'C6:4 D6:2 Eb6:2 G6:8', 'Eb6:4 C6:4 Ab5:8', 'Bb5:4 G5:4 Eb5:4 G5:4', 'D6:8 F6:4 D6:4'] },
    B: { ch: ['Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Eb', 'Bb', 'Cm'], mel: [
      'C6:8 Eb6:8', 'Bb5:8 G6:8', 'F6:6 D6:2 Bb5:8', 'Eb6:6 C6:2 G5:8',
      'C6:4 Eb6:4 C6:8', 'Bb5:4 Eb6:4 G6:8', 'F6:4 D6:4 F6:4 D6:4', 'G5:12 .:4'] }
  },
  /* 8. ЯПОНІЯ (1868): гірадзьосі (ля, сі, до, мі, фа), кото-щипки з паузами, дрон флейти-сякухачі з вібрато, тайко й дерев'яний блок */
  8: {
    bpm: 76, lead: { wave: 'triangle', env: 'pluck', vol: 0.24 },
    arp: { wave: 'sine', env: 'soft', vib: 1, pat: '2:8 3:8', vol: 0.06 },
    bass: { wave: 'sine', pat: 'R:12 F:4', soft: 'R:16', vol: 0.2 },
    drums: { main: ['T:8 .:4 T:2 T:2', '.:2 w:2 .:4 .:2 w:2 .:4'], chip: ['T:4 .:4 T:4 w:2 w:2'], soft: ['g:16'] },
    leadSoft: { wave: 'sine', env: 'pluck', vib: 0, vol: 0.2 },
    A: { ch: ['Am', 'Am', 'F', 'E5', 'Am', 'F', 'E5', 'Am'], mel: [
      'A5:4 .:2 E5:2 C5:4 E5:4', 'F5:4 .:2 E5:2 C5:4 B4:4', 'A4:4 C5:4 E5:4 F5:4', 'E5:8 C5:4 B4:4',
      'A5:2 B5:2 C6:4 B5:2 A5:2 F5:4', 'E5:4 F5:4 E5:2 C5:2 B4:4', 'C5:2 E5:2 A5:4 F5:4 E5:4', 'A4:12 .:4'] },
    B: { ch: ['Am', 'Am', 'F', 'E5', 'Am', 'F', 'E5', 'Am'], mel: [
      'A5:1 A5:1 A5:1 A5:1 C6:4 E6:4 C6:4', 'B5:2 C6:2 B5:2 A5:2 E5:8', 'F5:2 A5:2 C6:2 A5:2 F6:4 C6:4', 'E6:4 C6:4 B5:4 E5:4',
      'A5:2 C6:2 E6:2 C6:2 A5:2 C6:2 E6:4', 'F6:4 E6:2 C6:2 A5:4 F5:4', 'B5:4 C6:2 B5:2 A5:4 E5:4', 'A5:8 E5:4 A4:4'] }
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
  const lead = Object.assign({}, P.lead, chip ? { wave: 'square', env: null, vib: 0, vol: LEAD_VOL.square } : chill ? Object.assign({ wave: 'triangle', env: 'soft', vib: 0, vol: LEAD_VOL.triangle }, P.leadSoft || {}) : {});
  if (!lead.vol) lead.vol = LEAD_VOL[lead.wave];
  const arp = chip ? { wave: 'square', pat: P.arpFast || ARP_FAST, vol: ARP_VOL.square } : chill ? { wave: 'sine', env: 'soft', pat: P.arpSoft || ARP_SOFT, vol: ARP_VOL.sine, vib: 0 } : Object.assign({}, P.arp);
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
