# Карта частин src/ (генерується: node tools/mkmap.js)

Усі JS-частини — ОДИН спільний скрипт (одна область видимості), порядок за іменем файлу. Імена: `NNN_літера_тема.js`.
Куди дивитись: скіни → `230_a`, `210`; збереження → `125_save`; епохи (дані) → `100_b`; магазин/фасад → `150_*`, `151_*`; помічники → `100_c`, `180_*`; покупці → `100_b`, `180_c`; тексти → `110_*`; сюжет → `240`, `241`; Японія → `275`, `276`.
Увага: `110_a`/`110_b` — дві половини одного об'єкта `translations` (розрізано між `uk` і `en`).

| Частина | КБ | Що там | Перші оголошення |
|---|---|---|---|
| `010_head.html` | 3 | HTML: шапка, мета, назва |  |
| `020_style_base.css` | 3 | CSS: змінні кольорів, базові стилі |  |
| `021_style_page.css` | 13 | CSS: сторінка, сцена, верхня панель |  |
| `022_style_panels.css` | 10 | CSS: меню, вкладки, картки |  |
| `023_style_boot.css` | 29 | CSS: екран завантаження, бульбашки, кат-сцена, газета |  |
| `024_style_modal_phone.css` | 21 | CSS: модальні вікна, телефон |  |
| `025_style_late.css` | 5 | CSS: пізні правки (поверх решти) |  |
| `030_body_open.html` | 1 | HTML: початок body |  |
| `040_boot_script.html` | 47 | JS: екран завантаження (окремий маленький скрипт до головного) |  |
| `050_body_markup.html` | 19 | HTML: розмітка гри (панель, меню, вікна) |  |
| `100_a_core_config.js` | 39 | ГОЛОВНИЙ СКРИПТ починається тут: «режим бога», CONFIG, вкладки, відділи, рівні, товари епох, ноти (дані) | GOD_HASH, sha256hex, GOD_OWNER, GOD_PAUSED, GOD_ON, errLog, logErr, CONFIG |
| `100_b_music_epochs_customers.js` | 44 | музика (MUSIC, EPOCH_MUSIC), майстерня часу, EPOCHS, досягнення, SPRITES, PALETTE, покупці CHIBI | arpBar, DRUMS_CALM, DRUMS_BOUNCE, MUSIC, DRUMS_CHIP, DRUMS_CHILL, MUSIC_STYLES, EPOCH_MUSIC |
| `100_c_team_costumes_capy.js` | 42 | костюми героїв по епохах (TEAM_COSTUMES, composeTeamCostume, скіни героїв), спрайти Капі | CHIBI_LOWER, composeChibi, TEAM_GLASSES, teamDeco, TEAM_COSTUMES, teamEyes, composeTeamCostume, composeTeamSkin |
| `100_d_capy_coins_epoch_state.js` | 41 | Капі (нові/старі рядки), монети й кристали епох, curEpoch/nextEpochId/viewEpoch | makeCapyNewRows, makeCapyOldDetail, EPOCH_COIN_ROWS, EPOCH_COIN_COLORS, SHARD_CH, GEM_CH, GEM_ROWS, gemUrls |
| `110_a_texts_uk.js` | 75 | ТЕКСТИ: translations.uk (початок об'єкта translations) | translations |
| `110_b_texts_en.js` | 53 | ТЕКСТИ: translations.en (друга половина об'єкта), GENDER_TEXTS, SEASONS | GENDER_TEXTS, SEASONS |
| `120_state.js` | 16 | стан гри (state), множники, зірки, вимоги | createDefaultState, state, milestonesReached, nextMilestone, levelMult, teamLevelOf, STAR_MULT, STAR_HARD_CAP |
| `125_save.js` | 16 | ЗБЕРЕЖЕННЯ: міграції, mergeInto, saveGame/loadGame | storageOk, SAVE_MIGRATIONS, migrateSave, mergeInto, nativeApp, nativePlugin, lastNativeAt, nativeMirror |
| `130_format.js` | 43 | t() — переклади, формат чисел | t, tierSuffix, formatNumber, fmt |
| `140_a_sprite_core_world_props.js` | 40 | спрайти: кеш, R/disc, будинки, дерева, хмари, декор світу | spriteCache, getSpriteCanvas, OUTLINED, outlineCache, getOutlinedCanvas, drawCanvasSprite, drawSprite, R |
| `140_b_ground_houses_layers.js` | 37 | бруківка, дорога, будинки, шари освітлення, реквізит Хелловіну | paintCobble, snowBlob, winterGround, manholeSpots, buildGroundLayer, autumnGroundLeaves, drawRoadG, manholeG |
| `150_a_facade_items_decor.js` | 48 | магазин: предмети вітрин, прилавки, епохальний декор фасаду | tierOf, drawItem, drawDisplay, drawShelf, posterG, drawDoorLeaves, placeRow, pilasterG |
| `150_b_facade_epoch_props_roof.js` | 34 | магазин: епохальні деталі, вивіски (signMotif), дах (roofProp, drawRoof) | withPal, bandG, vinesG, neonLine, barrelG, crateG, speakerG, cabinetG |
| `150_c_facade_pavilions_build.js` | 42 | магазин: павільйони поверхів, кінозал, buildShopCanvas | snowCap, PAV_SEQ, PAV_PAL, PAV_BACK, PAV_CANOPY, PAV_TECH, artG, garmentG |
| `151_a_arch_core_renaissance.js` | 30 | ARCH: примітиви AR + епоха 0 (Відродження) | AR |
| `151_b_arch_retro_disco.js` | 21 | ARCH: епохи 1–2 (Ретро, Диско) |  |
| `151_c_arch_arcade_internet_eco.js` | 29 | ARCH: епохи 3–5 (Аркади, Інтернет, Еко) |  |
| `151_d_arch_space_neon.js` | 19 | ARCH: епохи 6–7 (Космос, Неон) |  |
| `160_refs.js` | 7 | посилання на елементи DOM (ui) | $, ui, ctx, skyLayer, shop, uiCache, sceneUnit, viewCrop |
| `165_shop.js` | 15 | rebuildShop, layoutScene, камера, панель на телефоні | rebuildShop, placeShopOverlay, updateSignText, cam, layoutReady, syncPanelPad, snapK, layoutScene |
| `170_ui.js` | 31 | інтерфейс: вкладки, картки відділів і команди | detectLanguage, setText, outlineCanvas, tabGlyph, tabIconCanvas, buildTabs, TABS_PRIMARY, setSheet |
| `175_buy.js` | 1 | купівля | buyDept, expandShop |
| `178_offline.js` | 1 | дохід, поки гравця не було | addOfflineEarnings, refreshOfflineModal, showOfflineModal, claimOffline |
| `180_a_anim_weather_actors.js` | 38 | анімації: погода, хмари, звірята-помічники (actorHome, syncActors, updateActors) | shopAnim, capyAnim, fx, clouds, weather, raindrops, updateWeather, rainSpotCache |
| `180_b_actor_draw_lines.js` | 44 | малювання помічників, ACTOR_K, репліки, скіни-репліки | pickWanderTarget, drawTeamProp, ACTOR_K, actorK, evenScaleCache, evenScaled, crispFigCache, crispFigure |
| `180_c_customers_updates.js` | 36 | покупці (spawnCustomer, drawCustomer, spaceHelmet), updateAnimations, спливаючі числа | skinLineLast, skinLine, capySay, buyStar, hireOrUpgrade, customerTarget, passEdge, spawnX |
| `190_a_audio_music_cutscene.js` | 40 | звук і музика (Web Audio), початок кат-сцени | audio, MUSIC_PARSED, NOTE_INDEX, noteFreq, parseMusic, initAudio, unlockSilent, resumeAudio |
| `190_b_cutscene_draw.js` | 41 | кат-сцена: малювання | cutFace, cutMark, cutEmo, cutTextPx, cutPopText, cutSpark, cutBubble, cutSayState |
| `190_c_cutscene_panel_tour_sfx.js` | 38 | кат-сцена: панель; екскурсія по меню; playSfx | cutCache, cutW2S, cutDrawFrame, cutPanel, cutPix, CUT_ARROW, CUT_UP, cutArrowR |
| `190_d_epoch_tunes.js` | 14 | музика епох 1–8: EPOCH_TUNES (дві мелодії на епоху, акорди), epochTrackDef/epochTrackKey | TUNE_Q, ARP_FAST, ARP_SOFT, LEAD_VOL, BASS_VOL, ARP_VOL, EPOCH_TUNES, chordInfo |
| `200_a_travel_ui_warp_base.js` | 42 | налаштування, вікна-підтвердження, основа анімації подорожі | warp, confirmCb, savingDisabled, achTimer, autoTapAcc, stars, leaves, wsEls |
| `200_b_warp_epoch_animations.js` | 33 | анімації подорожі для кожної епохи (WARP_BY_EPOCH) | warpPix, warpCapy, warpFont, warpText, drawWarpDisco, WARP_INV, drawWarpArcade, drawWarpNet |
| `200_c_time_travel_workshop_stats.js` | 25 | подорож (applyTimeTravel), майстерня часу, досягнення, статистика, налаштування | applyTimeTravel, wsEffectText, buildWorkshop, wsNeedTrips, buyWorkshop, routeSig, updateRouteCard, updateWorkshopUI |
| `210_skins.js` | 30 | скіни: інтерфейс, пил, ефекти магазину | SKIN_ICONS, skinsSig, shopFx, SHOP_FX, FX_CANDY_COLS, updateShopSkinFx, skinDust, DUST_COLS |
| `220_a_events_weather.js` | 39 | події, сезони, погода, райдуга, дощ, блискавки (початок) | theme, snow, bats, puddles, trouble, sackDrop, eventTimer, wheelAnim |
| `220_b_rainbow_lightning_skyx.js` | 46 | райдуга, блискавки, прикраси неба (skyx*) | RAINBOW_M, rainbowM, rainbowCanvas, rainbowGeom, drawRainbowSkin, bolts, boltTimer, boltPath |
| `220_c_epoch_sky_fx.js` | 39 | прикраси неба по епохах, епохальні ефекти, зірки | INV_ART, skyxInvader, skyxButterfly, SPACE_PL, spacePlanets, DISCO_COLS, discoLamps, drawSkyExtra |
| `220_d_night_garlands_halloween.js` | 38 | нічне небо, гірлянди, Хелловін (привиди, туман) | drawSkyScreen, drawNightShade, SEASON_MOOD, BULB_SETS, bulbColors, awningBulbs, garlandSpans, garlandY |
| `230_a_skins_circus_hag.js` | 46 | СКІНИ: пули, ціни, володіння; цирк і відьма | CIRCUS_SECTORS, WEATHER_ORDER, SKIN_HIDDEN, SKIN_TYPES, SKIN_POOL, SKIN_SEASON, skinHas, skinGrant |
| `230_b_circus_loot_letters.js` | 39 | колесо цирку, лут, газета (початок), листи | circusCanvas, drawCircus, drawBang, hitCircus, drawCircusIcon, buildCircusWheelTexture, drawCircusWheel, circusBusy |
| `230_c_news_wheel_events.js` | 39 | газета (сторінки), «Барабан фортуни», updateEvents/initEvents | npI, newsPortrait, newsSec, NP_SEC, NP_GUIDE, NP_SOON, npArticle, buildListPages |
| `230_d_circus_themes.js` | 30 | цирк по епохах: CIRCUS_THEMES (палітра, деталі, гірлянда), малює CIRCUS_ART з 230_a | CIRCUS_THEMES, circusGarland |
| `240_story.js` | 41 | сюжет: діалоги, гості, камео | dialog, storyTimer, cameos, speakerSprite, speakerName, pageText, renderDialogText, buildChoiceButtons |
| `241_epoch_story.js` | 80 | сюжет епох 1–8 (EC_DATA, EC_TRIGGERS) | EC_TRIGGERS, EC_DATA, EPOCH_CHAPTERS |
| `245_stands.js` | 36 | місця гостей біля магазину | GUEST_STAND_EPOCH, STANDS, standPending, guestArrived, guestStands, drawGuestStand |
| `246_help.js` | 53 | допомога гостям, подяки | helpChipUntil, HELP_NEED, guestEpochOf, helpCount, helpDone, helpMetIn, helpActiveIn, helpCredit |
| `250_tap.js` | 7 | тапи | hapticSwitch, buzz, evMult, doTap, toScenePoint, hitShop, setupInput |
| `260_render.js` | 28 | головний render, будівельна техніка | render, shineTmp, drawStreetShine, drawShopShine, drawShopLayered, drawBuildTent, drawDrum, drawTruckWheel |
| `270_loop.js` | 2 | ігровий цикл | lastFrame, saveTimer, uiTimer, animClock, frame |
| `275_japan.js` | 45 | епоха 9 Японія: малюнки, ARCH.japan, дракон, ліхтарі |  |
| `276_japan_text.js` | 15 | епоха 9 Японія: тексти |  |
| `280_launch.js` | 8 | запуск: ініціалізація, </script> | perf, ecoOn, perfSample, buildReport, copyText, hiddenAt, init, setupNativeApp |
