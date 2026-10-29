# Карта частин src/ (генерується: node tools/mkmap.js)

Усі JS-частини — ОДИН спільний скрипт (одна область видимості), порядок за іменем файлу. Імена: `NNN_літера_тема.js`.
Куди дивитись: скіни → `230_a`, `210`; збереження → `125_save`; епохи (дані) → `100_b`; магазин/фасад → `150_*`, `151_*`; помічники → `100_c`, `180_*`; покупці → `100_b`, `180_c`; тексти → `110_*`; сюжет → `240`, `241`; Японія → `275`, `276`.
Увага: `110_a*`/`110_b*` (по 3 частини) — дві половини одного об'єкта `translations` (розрізано між `uk` і `en`).

| Частина | КБ | Що там | Перші оголошення |
|---|---|---|---|
| `010_head.html` | 5 | HTML: шапка, мета, назва |  |
| `020_style_base.css` | 3 | CSS: змінні кольорів, базові стилі |  |
| `021_style_page.css` | 16 | CSS: сторінка, сцена, верхня панель |  |
| `022_style_panels.css` | 11 | CSS: меню, вкладки, картки |  |
| `023_style_boot.css` | 38 | CSS: екран завантаження, бульбашки, кат-сцена, газета |  |
| `024_style_modal_phone.css` | 21 | CSS: модальні вікна, телефон |  |
| `025_style_late.css` | 25 | CSS: пізні правки (поверх решти) |  |
| `030_body_open.html` | 1 | HTML: початок body |  |
| `040_boot_script.html` | 78 | JS: екран завантаження (окремий маленький скрипт до головного) |  |
| `050_body_markup.html` | 18 | HTML: розмітка гри (панель, меню, вікна) |  |
| `100_a_core_config.js` | 39 | ГОЛОВНИЙ СКРИПТ починається тут: «режим бога», CONFIG, вкладки, відділи, рівні, товари епох, ноти (дані) | GOD_HASH, sha256hex, GOD_OWNER, GOD_PAUSED, GOD_ON, errLog, logErr, CONFIG |
| `100_b_music_epochs_customers.js` | 44 | музика (MUSIC, EPOCH_MUSIC), майстерня часу, EPOCHS, досягнення, SPRITES, PALETTE, покупці CHIBI | arpBar, DRUMS_CALM, DRUMS_BOUNCE, MUSIC, DRUMS_CHIP, DRUMS_CHILL, MUSIC_STYLES, EPOCH_MUSIC |
| `100_c_team_costumes_capy.js` | 45 | костюми героїв по епохах (TEAM_COSTUMES, composeTeamCostume, скіни героїв), спрайти Капі | CHIBI_LOWER, composeChibi, TEAM_GLASSES, teamDeco, TEAM_COSTUMES, teamEyes, composeTeamCostume, TEAM_SKIN_BODY |
| `100_d_capy_coins_epoch_state.js` | 44 | Капі (нові/старі рядки), монети й кристали епох, curEpoch/nextEpochId/viewEpoch | makeCapyNewRows, makeCapyOldDetail, EPOCH_COIN_ROWS, EPOCH_COIN_COLORS, SHARD_CH, GEM_CH, GEM_ROWS, gemUrls |
| `100_e_team_new.js` | 11 | — | TEAM_SPECIES, TEAM_TINT, tintCanvas, TEAM_PAD, teamBaseCache, teamBaseCanvas, dressHero, teamEpochSprite |
| `110_a1_texts_uk.js` | 13 | ТЕКСТИ uk (початок translations): назви, рівні, відділи, розширення, офлайн, команда | translations |
| `110_a2_texts_uk.js` | 34 | ТЕКСТИ uk: сюжет, події, свята, міні-ігри |  |
| `110_a3_texts_uk.js` | 30 | ТЕКСТИ uk: вкладки, епохи, подорож, майстерня, досягнення, репліки, пори року, лавочка |  |
| `110_b1_texts_en.js` | 9 | ТЕКСТИ en (початок en-об'єкта): ті самі теми, що 110_a1 |  |
| `110_b2_texts_en.js` | 23 | ТЕКСТИ en: сюжет, події, свята, міні-ігри |  |
| `110_b3_texts_en.js` | 22 | ТЕКСТИ en: вкладки, епохи, подорож…, кінець translations, GENDER_TEXTS, SEASONS | GENDER_TEXTS, SEASONS |
| `120_state.js` | 16 | стан гри (state), множники, зірки, вимоги | createDefaultState, state, milestonesReached, nextMilestone, levelMult, teamLevelOf, STAR_MULT, STAR_HARD_CAP |
| `125_save.js` | 16 | ЗБЕРЕЖЕННЯ: міграції, mergeInto, saveGame/loadGame | storageOk, SAVE_MIGRATIONS, migrateSave, mergeInto, nativeApp, nativePlugin, lastNativeAt, nativeMirror |
| `130_format.js` | 42 | t() — переклади, формат чисел | t, tierSuffix, formatNumber, fmt |
| `140_a_sprite_core_world_props.js` | 46 | спрайти: кеш, R/disc, будинки, дерева, хмари, декор світу | spriteCache, getSpriteCanvas, OUTLINED, outlineCache, getOutlinedCanvas, drawCanvasSprite, drawSprite, R |
| `140_b_ground_houses_layers.js` | 41 | бруківка, дорога, будинки, шари освітлення, реквізит Хелловіну | paintCobble, snowBlob, winterGround, manholeSpots, buildGroundLayer, autumnGroundLeaves, drawRoadG, manholeG |
| `150_a1_facade_items_decor.js` | 29 | магазин: предмети вітрин, прилавки | tierOf, drawItem, drawDisplay, drawShelf, posterG, DOOR_LEAF_STYLES, drawDoorLeaves, placeRow |
| `150_a2_facade_items_decor.js` | 24 | магазин: епохальний декор фасаду, skinShopDeco | leafPileG, skinGlints, bigLollipopG, gumdropG, coinStackG, goldBarsG, gemG, snowmanG |
| `150_a3_skins_new_decor.js` | 11 | — | SHOP_DECO_EXTRA, STREET_EXTRA, sprG, thickG, roofRecolor, SPR_STAR7, SPR_CHEST, wheelG |
| `150_b_facade_epoch_props_roof.js` | 34 | магазин: епохальні деталі, вивіски (signMotif), дах (roofProp, drawRoof) | withPal, bandG, vinesG, neonLine, barrelG, crateG, speakerG, cabinetG |
| `150_c_facade_pavilions_build.js` | 43 | магазин: павільйони поверхів, кінозал, buildShopCanvas | snowCap, PAV_SEQ, PAV_PAL, PAV_BACK, PAV_CANOPY, PAV_TECH, artG, garmentG |
| `151_a_arch_core_renaissance.js` | 36 | ARCH: примітиви AR + епоха 0 (Відродження) | AR |
| `151_b_arch_retro_disco.js` | 26 | ARCH: епохи 1–2 (Ретро, Диско) |  |
| `151_c_arch_arcade_internet_eco.js` | 39 | ARCH: епохи 3–5 (Аркади, Інтернет, Еко) |  |
| `151_d_arch_space_neon.js` | 26 | ARCH: епохи 6–7 (Космос, Неон) |  |
| `160_refs.js` | 7 | посилання на елементи DOM (ui) | $, ui, ctx, skyLayer, shop, uiCache, sceneUnit, viewCrop |
| `165_shop.js` | 15 | rebuildShop, layoutScene, камера, панель на телефоні | rebuildShop, placeShopOverlay, updateSignText, cam, layoutReady, syncPanelPad, snapK, layoutScene |
| `165_tab_icons_hd.js` | 14 | — | TAB_ICONS_HD, tabImgHD, tabGlyphHD |
| `170_ui.js` | 32 | інтерфейс: вкладки, картки відділів і команди | detectLanguage, setText, outlineCanvas, tabGlyph, tabIconCanvas, buildTabs, TABS_PRIMARY, setSheet |
| `175_buy.js` | 1 | купівля | buyDept, expandShop |
| `178_offline.js` | 2 | дохід, поки гравця не було | addOfflineEarnings, refreshOfflineModal, showOfflineModal, claimOffline |
| `180_a_anim_weather_actors.js` | 41 | анімації: погода, хмари, звірята-помічники (actorHome, syncActors, updateActors) | shopAnim, capyAnim, fx, clouds, weather, raindrops, updateWeather, rainSpotCache |
| `180_b_actor_draw_lines.js` | 46 | малювання помічників, ACTOR_K, репліки, скіни-репліки | pickWanderTarget, drawTeamProp, ACTOR_K, actorK, evenScaleCache, evenScaled, crispFigCache, HERO_K |
| `180_c_customers_updates.js` | 41 | покупці (spawnCustomer, drawCustomer, spaceHelmet), updateAnimations, спливаючі числа | skinLineLast, skinLine, capySay, buyStar, hireOrUpgrade, CUSTOMERS_BY_LEVEL, customerTarget, passEdge |
| `190_a_audio_music_cutscene.js` | 48 | звук і музика (Web Audio), початок кат-сцени | audio, MUSIC_PARSED, NOTE_INDEX, noteFreq, parseMusic, initAudio, unlockSilent, resumeAudio |
| `190_b_cutscene_draw.js` | 39 | кат-сцена: малювання | cutFace, cutMark, cutEmo, cutTextPx, cutPopText, cutSpark, cutBubble, cutSayState |
| `190_c_cutscene_panel_tour_sfx.js` | 39 | кат-сцена: панель; екскурсія по меню; playSfx | cutCache, cutW2S, cutDrawFrame, cutPanel, cutPix, CUT_ARROW, CUT_UP, cutArrowR |
| `190_cz_cutscene_epic.js` | 21 | кат-сцена v3: кіно-вступ, кінорамки, тапи (монетка, заряд), будівництво маркету з блоків | CUT_CHG, CB, CUT_TXT2, cutT2, cutRate, cutBars, cutIntroCam, cutIntroText |
| `190_d_epoch_tunes.js` | 17 | музика епох 1–8: EPOCH_TUNES (дві мелодії на епоху, акорди), epochTrackDef/epochTrackKey | TUNE_Q, ARP_FAST, ARP_SOFT, LEAD_VOL, BASS_VOL, ARP_VOL, EPOCH_TUNES, chordInfo |
| `200_a_travel_ui_warp_base.js` | 43 | налаштування, вікна-підтвердження, основа анімації подорожі | warp, confirmCb, savingDisabled, achTimer, autoTapAcc, stars, leaves, wsEls |
| `200_b_warp_epoch_animations.js` | 34 | анімації подорожі для кожної епохи (WARP_BY_EPOCH) | warpPix, warpCapy, warpFont, warpText, drawWarpDisco, WARP_INV, drawWarpArcade, drawWarpNet |
| `200_c_time_travel_workshop_stats.js` | 27 | подорож (applyTimeTravel), майстерня часу, досягнення, статистика, налаштування | applyTimeTravelSteps, applyTimeTravel, wsEffectText, buildWorkshop, wsNeedTrips, buyWorkshop, routeSig, updateRouteCard |
| `210_skins.js` | 33 | скіни: інтерфейс, пил, ефекти магазину | SKIN_ICONS, skinCatIcon, skinsSig, shopFx, SHOP_FX, FX_CANDY_COLS, updateShopSkinFx, skinDust |
| `211_skins_new_fx.js` | 3 | — | SHOP_FX_DRAW, FX_SEA_COLS |
| `212_skins_shop_anim.js` | 9 | — | SKIN_SIGN_ANIM, signStripes, signFlakes, signSpark, drawRoofFountains, aquariumSpot, drawSkinInterior, drawSkinShopExtras |
| `213_epoch_roof_anim.js` | 3 | — | drawEpochRoofAnim, drawSpaceTelescope |
| `214_skin_town.js` | 25 | — | townHouses, skinTownOn, TW, skinTownHouse, rgbHsl, hslRgb, townRecolor, skinTownPreview |
| `214_skin_town_b.js` | 15 | — | TW2 |
| `220_a_events_weather.js` | 38 | події, сезони, погода, райдуга, дощ, блискавки (початок) | theme, snow, bats, trouble, sackDrop, eventTimer, inRange, isBlackFriday |
| `220_b1_rainbow_lightning_skyx.js` | 23 | райдуга, блискавки, прикраси неба (початок) | RAINBOW_M, rainbowM, rainbowCanvas, rainbowGeom, drawRainbowSkin, bolts, boltTimer, boltPath |
| `220_b2_rainbow_lightning_skyx.js` | 23 | прикраси неба (skyx*), кеш-спрайти | skyxDrone, skyxIsland, skyBlockCache, skyHash, skyxBlock, islandCanvas, skyxIsland2, droneBody |
| `220_c_epoch_sky_fx.js` | 44 | прикраси неба по епохах, епохальні ефекти, зірки | INV_ART, skyxInvader, skyxButterfly, SPACE_PL, spacePlanets, DISCO_COLS, discoLamps, drawSkyExtra |
| `220_d_night_garlands_halloween.js` | 40 | нічне небо, гірлянди, Хелловін (привиди, туман) | drawSkyScreen, drawNightShade, SEASON_MOOD, BULB_SETS, bulbColors, awningBulbs, garlandSpans, garlandY |
| `221_sky_life.js` | 4 | — | skyLife, SKY_LIFE_COLS, skyLifeGlow, seedSkyLife, drawSkyLife |
| `230_a1_skins_circus_hag.js` | 25 | СКІНИ: пули, ціни, володіння | CIRCUS_SECTORS, BONUS_GAME_SKINS, circusFreq, WEATHER_ORDER, SKIN_HIDDEN, SKIN_TYPES, SKIN_POOL, SKIN_SEASON |
| `230_a2_skins_circus_hag.js` | 18 | цирк (CIRCUS_ART), відьма, хатка | hagReset, hagStart, updateHagGame, hagPos, hagClick, circusStopX, circusStartX, bangPos |
| `230_a3_hag_v2.js` | 11 | — | hvEll, witchV2, hagFly, hagOrbitPos, hagEase, hagCruiseY, hagStartFlight, hagTap |
| `230_a4_hag_hut.js` | 12 | — | hutLeg, hutFace, hutV2 |
| `230_a5_hag_scene.js` | 18 | — | HAG_W, hvHash, hvBat, hvMoon, hvTree, hagBg, hagBgBuild, hagCauldronV2 |
| `230_b_circus_loot_letters.js` | 43 | колесо цирку, лут, газета (початок), листи | circusCanvas, drawCircus, drawBang, hitCircus, drawWheelIcon, drawCircusIcon, buildCircusWheelTexture, drawCircusWheel |
| `230_c_news_wheel_events.js` | 28 | газета (сторінки), листи, updateEvents/initEvents | npI, newsPortrait, newsSec, NP_SEC, NP_GUIDE, NP_SOON, npArticle, buildListPages |
| `230_d_circus_themes.js` | 30 | цирк по епохах: CIRCUS_THEMES (палітра, деталі, гірлянда), малює CIRCUS_ART з 230_a | CIRCUS_THEMES, circusGarland |
| `240_story.js` | 43 | сюжет: діалоги, гості, камео | dialog, storyTimer, cameos, speakerSprite, speakerName, pageText, renderDialogText, buildChoiceButtons |
| `241_a_epoch_story.js` | 30 | сюжет епох: початок EC_DATA (перші епохи) | EC_TRIGGERS, EC_DATA |
| `241_b_epoch_story.js` | 19 | сюжет епох: середина EC_DATA |  |
| `241_c_epoch_story.js` | 31 | сюжет епох: кінець EC_DATA, EC_TRIGGERS | EPOCH_CHAPTERS |
| `245_stands.js` | 35 | місця гостей біля магазину | GUEST_STAND_EPOCH, STANDS, standPending, guestArrived, guestStands, drawGuestStand |
| `245_t_stands_v2.js` | 21 | — |  |
| `246_a_help.js` | 35 | допомога гостям: логіка, подяки, тексти UK | helpChipUntil, HELP_NEED, guestEpochOf, helpCount, helpDone, helpMetIn, helpActiveIn, helpCredit |
| `246_b_help.js` | 19 | допомога гостям: тексти EN, підключення |  |
| `250_tap.js` | 8 | тапи | hapticSwitch, buzz, evMult, doTap, toScenePoint, hitShop, setupInput |
| `260_render.js` | 30 | головний render, будівельна техніка | render, shineTmp, drawStreetShine, drawShopShine, drawShopLayered, drawBuildTent, drawDrum, drawTruckWheel |
| `262_fx_plus.js` | 24 | — | FXP, fxLevel, EPFX, fxPx, fxFrac, fxSeed, updateFxPlus, fxCoin |
| `263_build_cinema.js` | 7 | — | bc, bcSweepCv, bcMake, bcPlace, buildCinemaStart, buildCinemaTick, buildCinemaEnd, drawBuildSweep |
| `264_smooth_ui.js` | 2 | — |  |
| `265_b_icons_art.js` | 9 | — | PX_PAL, PX_ART, pxArtCache, pxArt, pxArtImg |
| `265_icons_plus.js` | 26 | — | pxIconCache, pxEmojiIcon, iconBox, setIconBox, iconBackdrop, iconAvgColor, mixCol, skinTwinkles |
| `270_loop.js` | 2 | ігровий цикл | lastFrame, saveTimer, uiTimer, animClock, frame |
| `275_a_sakura.js` | 17 | — | SAKURA_W, SAKURA_CACHE, SAKURA_PAL, SAKURA_WOOD, SAKURA_SHAPES, drawSakura, sakuraBuild, TREE2_CACHE |
| `275_ads.js` | 9 | реклама AdMob (лише Android-обгортка, прапорець window.__ADS з mobile/sync-web.js): Ads.init/available/showRewarded, кнопки «×2» у вікні офлайну й пропуск очікування бонус-гри; див. store/ADS_PLAN.md | Ads, adsAddPrivacyButton, adsLog, adOfflineDone, updateAdButtons, adsOfferOffline, adsBoostClick, adsOfferBonusSkip |
| `275_japan.js` | 78 | епоха 9 Японія: малюнки, ARCH.japan, дракон, ліхтарі |  |
| `275_k_stand_sora.js` | 7 | — |  |
| `275_z_itch_rate.js` | 2 | — | ITCH_PAGE, onItchBuild |
| `276_japan_text.js` | 15 | епоха 9 Японія: тексти |  |
| `276_zz_lines_b.js` | 48 | — |  |
| `277_japan_noodle.js` | 19 | Японія: лапшична діда Рьо замість цирку (візок, портрет, гра «Звари лапшу», тексти) | NOODLE_BUST, noodleGame, NOODLE_ZH, NOODLE_ART, noodleReset, noodleStart, noodleTake, updateNoodleGame |
| `278_a_build_themes.js` | 31 | Будівництво по епохах: ядро BTH (rnd, помічники, ефекти), перші епохи | BTH, buildThemeRender |
| `278_b_build_themes.js` | 24 | Будівництво по епохах: середні епохи |  |
| `278_c_build_themes.js` | 31 | Будівництво по епохах: останні епохи, BTH.render, buildThemeRender (тап-прискорення build.boost) |  |
| `279_bonus_games.js` | 20 | бонус-ігри під епохи: реєстр MG_DEFS, спільний мінірушій mgMake (таймер, ціль, приз), «Танцпол» (епоха 2), «Спам» (епоха 4); перезарядка 12 год на епоху, приз-скін | BONUS_COOLDOWN_MIN, BONUS_LOSE_MIN, MG_DEFS, mgGame, mgForEpoch, mgActive, mgCur, bonusCooldownMs |
| `279_c_bonus_games_more.js` | 25 | бонус-ігри епох 0 Фреска, 1 Джубокс, 3 Клешня, 5 Сортування, 6 Кристали, 7 Нічна траса (mgMake) + їх тексти |  |
| `279_d_bonus_games_jp_hw.js` | 12 | — | dsc |
| `279_e_bonus_bg.js` | 11 | — | BBG_P, BBG_THEMES, BBG_ART, bbg, bbgShade, bbgMix, bbgThemeId, bbgSprite |
| `279_y_lang_base.js` | 1 | — | installLang |
| `279_z_lang_es.js` | 165 | — |  |
| `279_z_lang_it.js` | 165 | — |  |
| `279_z_lang_pl.js` | 159 | — |  |
| `279_z_lang_pt.js` | 163 | — |  |
| `280_launch.js` | 8 | запуск: ініціалізація, </script> | perf, ecoOn, perfSample, buildReport, copyText, hiddenAt, init, setupNativeApp |
