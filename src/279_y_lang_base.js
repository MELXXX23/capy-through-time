//#part 279_y_lang_base.js
/* =====================================================================
   НОВІ МОВИ (pt, es, it, pl): спільна основа.
   Пакет мови лежить у 279_z_lang_<id>.js і викликає installLang(id, pack). Його робить tools/lang_merge.js
   з перекладів у шматках (tools/lang_extract.js виймає англійські тексти зі зібраної гри).
   Усе, чого в пакеті немає, лишається англійським: translations[id] починається з копії en.
   ===================================================================== */
NEWS_ABOUT.uk.toast = '+100 монет від розробників!';
NEWS_ABOUT.uk.paper = 'ГАЗЕТА ВІД РОЗРОБНИКІВ · ';
NEWS_ABOUT.en.toast = '+100 coins from the developers!';
NEWS_ABOUT.en.paper = 'NEWS FROM THE DEVELOPERS · ';

function installLang(id, p) {
  translations[id] = Object.assign({}, translations.en, p.tr || {});
  if (p.skin) SKIN_LINES[id] = Object.assign({}, SKIN_LINES.en, p.skin);
  if (p.tour) TOUR_TXT[id] = p.tour;
  if (p.cut) CUT_TXT[id] = p.cut;
  if (p.about) NEWS_ABOUT[id] = p.about;
  if (p.guide) NP_GUIDE[id] = p.guide;
  if (p.soon) NP_SOON[id] = p.soon;
  if (p.sec) NP_SEC[id] = p.sec;
}
