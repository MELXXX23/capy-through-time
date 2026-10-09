//#part 160_refs.js
/* =====================================================================
   ПОСИЛАННЯ НА ЕЛЕМЕНТИ ІНТЕРФЕЙСУ
   ===================================================================== */

const $ = id => document.getElementById(id);
const ui = {
  stage: $('stage'), scene: $('scene'), world: $('world'), view: $('view'),
  shopOverlay: $('shopOverlay'), sign: $('sign'), signText: $('signText'), floaters: $('floaters'),
  goalLine: $('goalLine'), dailyCard: $('dailyCard'),
  coinCount: $('coinCount'), cps: $('cps'), coinIcon: $('coinIcon'), gemCount: $('gemCount'), shardBox: $('shardBox'), shardCount: $('shardCount'), gemIcon: $('gemIcon'),
  tabs: $('tabs'),
  paneShop: $('pane-shop'), paneDepts: $('pane-departments'), paneSoon: $('pane-soon'),
  soonTitle: $('soonTitle'), capiPortrait: $('capiPortrait'), saveWarn: $('saveWarn'),
  shopName: $('shopName'), shopLevelLabel: $('shopLevelLabel'),
  statTapPower: $('statTapPower'), statLevelMult: $('statLevelMult'), statTaps: $('statTaps'), statEarned: $('statEarned'),
  expandCard: $('expandCard'), expandTitle: $('expandTitle'), expandNote: $('expandNote'), expandReqs: $('expandReqs'), expandBtn: $('expandBtn'),
  buyModes: $('buyModes'), deptList: $('deptList'),
  paneTeam: $('pane-team'), teamList: $('teamList'), bubbles: $('bubbles'),
  paneStory: $('pane-story'), storyList: $('storyList'),
  panL: $('panL'), panR: $('panR'), eventBanner: $('eventBanner'), boosts: $('boosts'), wheelOpen: $('wheelOpen'),
  wheelModal: $('wheelModal'), wheelCanvas: $('wheelCanvas'), wheelStreak: $('wheelStreak'), wheelResult: $('wheelResult'),
  lootModal: $('lootModal'), lootCanvas: $('lootCanvas'), lootName: $('lootName'), lootType: $('lootType'), lootTag: $('lootTag'), lootWear: $('lootWear'), lootClose: $('lootClose'),
  circusModal: $('circusModal'), circusWheel: $('circusWheel'), clownCanvas: $('clownCanvas'), circusTitle: $('circusTitle'), circusSub: $('circusSub'), circusResult: $('circusResult'), circusBtn: $('circusBtn'), circusClose: $('circusClose'), dbgCircus: $('dbgCircus'),
  wheelBtn: $('wheelBtn'), wheelGhostBtn: $('wheelGhostBtn'), wheelGhostNote: $('wheelGhostNote'), wheelClose: $('wheelClose'),
  paneWorkshop: $('pane-workshop'), wsList: $('wsList'), wsInfo: $('wsInfo'), routeTitle: $('routeTitle'), routeNext: $('routeNext'), routeList: $('routeList'), wsBonus: $('wsBonus'), warpPreview: $('warpPreview'), warpBtn: $('warpBtn'),
  paneSkins: $('pane-skins'), paneSeasons: $('pane-seasons'), skinsList: $('skinsList'), paneAch: $('pane-achievements'), achList: $('achList'), achSummary: $('achSummary'), statsCard: $('statsCard'),
  app: $('app'), panelToggle: $('panelToggle'), setGender: $('setGender'), setSeason: $('setSeason'), setEpochView: $('setEpochView'), setTime: $('setTime'), setDayNight: $('setDayNight'), setRain: $('setRain'), setEco: $('setEco'), exportLast: $('exportLast'), reportBox: $('reportBox'), reportBtn: $('reportBtn'), privacyBtn: $('privacyBtn'), aboutInfo: $('aboutInfo'), licenseBtn: $('licenseBtn'), setBirds: $('setBirds'), setBirdsLate: $('setBirdsLate'), setClouds: $('setClouds'), setSteam: $('setSteam'), setBigText: $('setBigText'), setVibrate: $('setVibrate'),
  paneSettings: $('pane-settings'), setLangBtns: $('setLangBtns'), setNumFmt: $('setNumFmt'), setAnim: $('setAnim'), setSound: $('setSound'),
  exportBox: $('exportBox'), importBox: $('importBox'), exportInfo: $('exportInfo'), shareBtn: $('shareBtn'), exportBtn: $('exportBtn'), copyBtn: $('copyBtn'), importBtn: $('importBtn'), resetBtn: $('resetBtn'),
  debugCard: $('debugCard'), dbgHour: $('dbgHour'), dbgX100: $('dbgX100'), statEpoch: $('statEpoch'),
  confirmModal: $('confirmModal'), confirmTitle: $('confirmTitle'), confirmText: $('confirmText'), confirmYes: $('confirmYes'), confirmNo: $('confirmNo'),
  timeWarp: $('timeWarp'), warpCanvas: $('warpCanvas'),
  seasonFx: $('seasonFx'), seasonBanner: $('seasonBanner'), sbTitle: $('sbTitle'), sbSub: $('sbSub'), panel: $('panel'), fbModal: $('feedbackModal'), fbTitle: $('fbTitle'), fbHint: $('fbHint'), fbText: $('fbText'), fbCount: $('fbCount'), fbContact: $('fbContact'), fbSend: $('fbSend'), fbCancel: $('fbCancel'), npWrite: $('npWrite'), newsModal: $('newsModal'), npTabs: $('npTabs'), npSecs: $('npSecs'), npPaper: $('npPaper'), npPrev: $('npPrev'), npNext: $('npNext'), npNum: $('npNum'), newsTitle: $('newsTitle'), newsSub: $('newsSub'), newsBody: $('newsBody'), newsClose: $('newsClose'), siModal: $('seasonIntroModal'), siIcon: $('siIcon'), siTitle: $('siTitle'), siText: $('siText'), siGo: $('siGo'), siLater: $('siLater'),
  letterModal: $('letterModal'), letterTitle: $('letterTitle'), letterText: $('letterText'), letterBoost: $('letterBoost'), letterBtn: $('letterBtn'),
  epochIntro: $('epochIntro'), eiFx: $('eiFx'), eiEmblem: $('eiEmblem'), eiNum: $('eiNum'), eiTitle: $('eiTitle'), eiSub: $('eiSub'), eiSparks: $('eiSparks'),
  soundModal: $('soundModal'), musicVol: $('musicVol'), musicStyleRow: $('musicStyleRow'), sfxVol: $('sfxVol'), muteBtn: $('muteBtn'), soundClose: $('soundClose'),
  dialog: $('dialog'), dlgBox: $('dialogBox'), dlgWrap: $('dlgPortraitWrap'), dlgPortrait: $('dlgPortrait'),
  dlgName: $('dlgName'), dlgText: $('dlgText'), dlgChoices: $('dlgChoices'), dlgNext: $('dlgNext'), dlgSkip: $('dlgSkip'),
  toasts: $('toasts'), modal: $('modal'), modalTitle: $('modalTitle'), modalText: $('modalText'), modalBig: $('modalBig'), modalBtn: $('modalBtn')
};
const ctx = ui.view.getContext('2d');
ctx.imageSmoothingEnabled = false;

let skyLayer, groundLayer, propsLayer;
let shop = null;               // поточний магазин: canvas, розміри, позиція, вивіска, двері
const uiCache = {};            // щоб не чіпати DOM, коли текст не змінився
let sceneUnit = 3;             // css-пікселів на піксель сцени
let viewCrop = { x: 0, w: 320 };   // яку частину вулиці зараз видно (на телефоні — лише середину)
const landscapePhoneMQ = window.matchMedia('(orientation: landscape) and (max-height: 520px)');
function collapseOnLandscapePhone() {              // коли телефон перевертають горизонтально — меню згортається, гра відкривається на весь екран
  /* горизонтально меню більше не згортається саме: вигляд такий самий, як на ПК */
}
const mobileMQ = window.matchMedia('(max-width: 820px) and (orientation: portrait), (max-width: 560px)');
const deptEls = [];            // елементи карток відділів
const teamEls = [];            // елементи карток звіряток
let teamLockedEl = null;       // картка «нові звірята прийдуть пізніше»
let deptLockedEl = null;       // картка «нові відділи відкриються пізніше»

