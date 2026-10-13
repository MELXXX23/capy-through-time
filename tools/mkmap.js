// Складає src/MAP.md — карту «що де лежить» (за частинами src/). Запуск: node tools/mkmap.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), dir = path.join(ROOT, 'src');
const DESC = {
  '010_head.html': 'HTML: шапка, мета, назва',
  '020_style_base.css': 'CSS: змінні кольорів, базові стилі',
  '021_style_page.css': 'CSS: сторінка, сцена, верхня панель',
  '022_style_panels.css': 'CSS: меню, вкладки, картки',
  '023_style_boot.css': 'CSS: екран завантаження, бульбашки, кат-сцена, газета',
  '024_style_modal_phone.css': 'CSS: модальні вікна, телефон',
  '025_style_late.css': 'CSS: пізні правки (поверх решти)',
  '030_body_open.html': 'HTML: початок body',
  '040_boot_script.html': 'JS: екран завантаження (окремий маленький скрипт до головного)',
  '050_body_markup.html': 'HTML: розмітка гри (панель, меню, вікна)',
  '100_a_core_config.js': 'ГОЛОВНИЙ СКРИПТ починається тут: «режим бога», CONFIG, вкладки, відділи, рівні, товари епох, ноти (дані)',
  '100_b_music_epochs_customers.js': 'музика (MUSIC, EPOCH_MUSIC), майстерня часу, EPOCHS, досягнення, SPRITES, PALETTE, покупці CHIBI',
  '100_c_team_costumes_capy.js': 'костюми героїв по епохах (TEAM_COSTUMES, composeTeamCostume, скіни героїв), спрайти Капі',
  '100_d_capy_coins_epoch_state.js': 'Капі (нові/старі рядки), монети й кристали епох, curEpoch/nextEpochId/viewEpoch',
  '110_a_texts_uk.js': 'ТЕКСТИ: translations.uk (початок об\'єкта translations)',
  '110_b_texts_en.js': 'ТЕКСТИ: translations.en (друга половина об\'єкта), GENDER_TEXTS, SEASONS',
  '120_state.js': 'стан гри (state), множники, зірки, вимоги',
  '125_save.js': 'ЗБЕРЕЖЕННЯ: міграції, mergeInto, saveGame/loadGame',
  '130_format.js': 't() — переклади, формат чисел',
  '140_a_sprite_core_world_props.js': 'спрайти: кеш, R/disc, будинки, дерева, хмари, декор світу',
  '140_b_ground_houses_layers.js': 'бруківка, дорога, будинки, шари освітлення, реквізит Хелловіну',
  '150_a_facade_items_decor.js': 'магазин: предмети вітрин, прилавки, епохальний декор фасаду',
  '150_b_facade_epoch_props_roof.js': 'магазин: епохальні деталі, вивіски (signMotif), дах (roofProp, drawRoof)',
  '150_c_facade_pavilions_build.js': 'магазин: павільйони поверхів, кінозал, buildShopCanvas',
  '151_a_arch_core_renaissance.js': 'ARCH: примітиви AR + епоха 0 (Відродження)',
  '151_b_arch_retro_disco.js': 'ARCH: епохи 1–2 (Ретро, Диско)',
  '151_c_arch_arcade_internet_eco.js': 'ARCH: епохи 3–5 (Аркади, Інтернет, Еко)',
  '151_d_arch_space_neon.js': 'ARCH: епохи 6–7 (Космос, Неон)',
  '160_refs.js': 'посилання на елементи DOM (ui)',
  '165_shop.js': 'rebuildShop, layoutScene, камера, панель на телефоні',
  '170_ui.js': 'інтерфейс: вкладки, картки відділів і команди',
  '175_buy.js': 'купівля',
  '178_offline.js': 'дохід, поки гравця не було',
  '180_a_anim_weather_actors.js': 'анімації: погода, хмари, звірята-помічники (actorHome, syncActors, updateActors)',
  '180_b_actor_draw_lines.js': 'малювання помічників, ACTOR_K, репліки, скіни-репліки',
  '180_c_customers_updates.js': 'покупці (spawnCustomer, drawCustomer, spaceHelmet), updateAnimations, спливаючі числа',
  '190_a_audio_music_cutscene.js': 'звук і музика (Web Audio), початок кат-сцени',
  '190_b_cutscene_draw.js': 'кат-сцена: малювання',
  '190_c_cutscene_panel_tour_sfx.js': 'кат-сцена: панель; екскурсія по меню; playSfx',
  '200_a_travel_ui_warp_base.js': 'налаштування, вікна-підтвердження, основа анімації подорожі',
  '200_b_warp_epoch_animations.js': 'анімації подорожі для кожної епохи (WARP_BY_EPOCH)',
  '200_c_time_travel_workshop_stats.js': 'подорож (applyTimeTravel), майстерня часу, досягнення, статистика, налаштування',
  '210_skins.js': 'скіни: інтерфейс, пил, ефекти магазину',
  '220_a_events_weather.js': 'події, сезони, погода, райдуга, дощ, блискавки (початок)',
  '220_b_rainbow_lightning_skyx.js': 'райдуга, блискавки, прикраси неба (skyx*)',
  '220_c_epoch_sky_fx.js': 'прикраси неба по епохах, епохальні ефекти, зірки',
  '220_d_night_garlands_halloween.js': 'нічне небо, гірлянди, Хелловін (привиди, туман)',
  '230_a_skins_circus_hag.js': 'СКІНИ: пули, ціни, володіння; цирк і відьма',
  '230_b_circus_loot_letters.js': 'колесо цирку, лут, газета (початок), листи',
  '230_c_news_wheel_events.js': 'газета (сторінки), «Барабан фортуни», updateEvents/initEvents',
  '240_story.js': 'сюжет: діалоги, гості, камео',
  '241_epoch_story.js': 'сюжет епох 1–8 (EC_DATA, EC_TRIGGERS)',
  '245_stands.js': 'місця гостей біля магазину',
  '246_help.js': 'допомога гостям, подяки',
  '250_tap.js': 'тапи',
  '260_render.js': 'головний render, будівельна техніка',
  '270_loop.js': 'ігровий цикл',
  '275_japan.js': 'епоха 9 Японія: малюнки, ARCH.japan, дракон, ліхтарі',
  '276_japan_text.js': 'епоха 9 Японія: тексти',
  '280_launch.js': 'запуск: ініціалізація, </script>'
};
const files = fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f)).sort();
const names = f => {
  const out = [], t = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  t.forEach(l => { const m = /^(?:async )?(?:function\*? |const |let |class )([\w$]+)/.exec(l); if (m && out.length < 8) out.push(m[1]); });
  return out.join(', ');
};
let md = '# Карта частин src/ (генерується: node tools/mkmap.js)\n\n' +
  'Усі JS-частини — ОДИН спільний скрипт (одна область видимості), порядок за іменем файлу. Імена: `NNN_літера_тема.js`.\n' +
  'Куди дивитись: скіни → `230_a`, `210`; збереження → `125_save`; епохи (дані) → `100_b`; магазин/фасад → `150_*`, `151_*`; помічники → `100_c`, `180_*`; покупці → `100_b`, `180_c`; тексти → `110_*`; сюжет → `240`, `241`; Японія → `275`, `276`.\n' +
  'Увага: `110_a`/`110_b` — дві половини одного об\'єкта `translations` (розрізано між `uk` і `en`).\n\n' +
  '| Частина | КБ | Що там | Перші оголошення |\n|---|---|---|---|\n';
files.forEach(f => {
  const kb = Math.round(fs.statSync(path.join(dir, f)).size / 1024);
  md += '| `' + f + '` | ' + kb + ' | ' + (DESC[f] || '—') + ' | ' + (f.endsWith('.js') ? names(f) : '') + ' |\n';
});
fs.writeFileSync(path.join(dir, 'MAP.md'), md, 'utf8');
console.log('src/MAP.md: ' + files.length + ' частин');
const missing = files.filter(f => !DESC[f]); if (missing.length) console.log('Без опису: ' + missing.join(', '));
