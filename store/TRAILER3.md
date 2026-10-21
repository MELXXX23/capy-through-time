# Трейлер Steam v3 (2 хв 18 с, 1080p60): як зроблений і як міняти

Готовий файл: `previews/yt/READY/CapyTap_Market_Trailer_v3.mp4` (346 МБ; майстер без стиснення `previews/t3/out/trailer3_final_silent.mp4` ≈ 2 ГБ + звук `previews/t3/audio/t3_mix.m4a`). Музика (власна, `previews/music/capy_theme.wav`, нарізана за тактами), жіночий голос, ефекти — усе зведено в один звук. Тут усе, що показано в грі: кінематографічні переходи, камера, справжній інтерфейс ПК із курсором.

## Склад (15 шотів, 72 такти по 1,875 с = 135 с + 3 с хвіст)
| Шот | Такти | Що | Голос (приблизно) |
|---|---|---|---|
| S01 | 3 | світанок над крихітною крамницею, камера відходить | Every big dream... starts small. |
| S02 | 6 | тап, покращення полиць, найм помічників (справжнє меню, курсор) | Meet Capi... Tap to earn coins... hire adorable helpers |
| S03 | 10 | два ПОВНІ будівництва Ренесансу (по 8,5 с) | Then watch your shop grow... |
| S04 | 2 | подорож у часі (варп) | ...travel through time |
| S05 | 5 | Диско: повне будівництво | Every era builds in its own style... |
| S06 | 3 | швидкий огляд епох (Ретро, Аркади, Інтернет, Еко, Космос, Неон) | Nine eras to explore... |
| S07 | 4 | крупні плани Капі й гостей із репліками | Meet the locals... |
| S08 | 4 | щоденник історій, діалог героїв | Read their stories... |
| S09 | 7 | меню скінів: Капі, бруківка, хмари | Make it yours... |
| S10 | 8 | бонус-ігри (Фреска, Диско, Аркада, Космос, Неон) і Цирк Фортуни | Play bonus mini-games... Wheel of Fortune |
| S11 | 4 | пори року, веселка, грозова ніч | Seasons change... |
| S12 | 3 | Хелловін (привиди) і єнот-злодій | Catch Halloween ghosts... raccoon |
| S13 | 4 | секретна епоха Японія, дракон | ...Japan, dragons included |
| S14 | 5 | цифри й «без реклами, без покупок, офлайн, 6 мов» | Nine eras, thirteen heroes... No ads... |
| S15 | 4 | назва, Капі, «Coming soon to Steam» | CapyTap: Market. Relax, tap, build... |

## Файли й команди (усе в `previews/`, не в git)
- Сценарії шотів: `previews/video/t3_s01…s15.src.js` (спільне: `scn_yt_lib.js`, `t3_lib.js`: плівковий вигляд, плашки, курсор, камера), збірка/рендер: `bash previews/t3/render.sh <draft|final> 01 02 …` (клипи в `previews/t3/clips/`; подій для звуку `sNN.ev.json`).
- Склейка: `node previews/t3/assemble.js <draft|final>`: переходи (fadewhite, smooth, pixelize, zoomin, dissolve, circleopen), колір, світіння, зерно, смуги «кіно» на початку й наприкінці. Рендер усіх шотів: ≈ 40–60 хв, склейка фіналу ≈ 15 хв.
- Звук: `node previews/t3/audio.js`: музика за тактами, голос (`previews/voice/t3/`), ефекти (`previews/t3/sfx.js`: молотки, монети, вуш, удари, дзвіночки, колесо), мікс із притишенням музики під голосом, гучність −15 LUFS.

## Голос
Зараз голос Microsoft Edge Neural `en-US-AvaMultilingualNeural` (жіночий, плавний; генерація `node previews/voice/gen_t3.js`, швидкість −5 %). Це синтез, не жива людина. Кращий варіант: записати свій голос (або акторки) або ElevenLabs. Як підмінити: записати фрази з таблиці (час початку й текст у `previews/voice/t3/manifest.json`) і покласти як `previews/voice/t3_user/v01.wav … v21.wav` (будь-яка фраза, що відсутня, лишається синтезованою); потім `node previews/t3/audio.js` і `node previews/t3/assemble.js final`.

| Файл | З секунди | Текст |
|---|---|---|
| v01 | 1,3 | Every big dream... starts small. |
| v02 | 5,85 | Meet Capi. One tiny shop... and one very big dream. |
| v03 | 10,35 | Tap to earn coins. Upgrade your shelves... and hire adorable animal helpers. |
| v04 | 17,5 | Then watch your shop grow, floor by floor... into a mighty mall. |
| v05 | 26,6 | Every upgrade brings new shelves... new customers... and new surprises. |
| v06 | 36,0 | And when your mall is ready... travel through time. |
| v07 | 40,2 | Every era builds in its own style... with its own look, its own music... and its own heroes. |
| v08 | 49,0 | Nine eras to explore... from retro arcades to neon skylines. |
| v09 | 54,8 | Meet the locals. Everyone in town has something to say. |
| v10 | 62,3 | Read their stories... and fill your diary with every adventure. |
| v11 | 69,8 | Make it yours. |
| v12 | 72,6 | Dress up Capi... your street... even the clouds in the sky. |
| v13 | 83,0 | Play bonus mini-games in every era. |
| v14 | 92,6 | And spin the Wheel of Fortune... for rare prizes. |
| v15 | 97,9 | Seasons change. Day turns to night. Rainbows... and thunderstorms. |
| v16 | 105,3 | Catch Halloween ghosts... and watch out for the sneaky raccoon! |
| v17 | 111,0 | And beyond the last era... a secret awaits. Japan... dragons included. |
| v18 | 118,5 | Nine eras, thirteen heroes, sixty skins, eight bonus games. |
| v19 | 123,4 | No ads. No purchases. Works offline. Six languages. |
| v20 | 128,5 | CapyTap: Market. Relax... tap... and build. |
| v21 | 133,1 | Coming soon to Steam. |

## Steam
Завантаження трейлера — у Steamworks → Store Page → Trailers (файл ≤ 1080p, mp4). Для YouTube-версії: `previews/yt/READY/…Trailer_v3.mp4` (чернетка).
