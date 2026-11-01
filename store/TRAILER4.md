# Трейлер TR4 «Офіційний» (YouTube, 16:9, 1080p60, 1:59)

Справжній кінотрейлер: світлий ретро-рок «Nowhere Land» (Kevin MacLeod; вибрано 1.11 зі зразків; «Born Of The Sky» і «Aphelion» — занадто епічні, «Inspired» — занадто спокійна), монтаж у такт (120 уд/хв, такт = 2 с), жіночий голос Sonia, порівняння «до/після», дві пришвидшені забудови, скіни, музика гри, пори року, Хелловін, Японія, жива людина з телефоном (гра в екрані, монетки рівно на дотики пальця).

Готовий файл: `previews/tr4/out/CapyTap_Market_Official_Trailer_sonia_final.mp4` (не в git). Робоча папка `previews/tr4/`.

## Як зібрати заново
1. Сценарії шотів: `node previews/tr4/mkscn.js` (генерує `scn/*.src.js`), рендер: `node previews/tr4/render_all.js final 3 bR sk ti se er bN jp n6 mu n1 c1 wp` (3 процеси, ≈ 20 хв; журнали `clips/<ім'я>.log`; завислий або впалий шот запускається знову). Прогрес: останній рядок `frame N` у журналі, а не те, що процес живий.
2. Телефон (Pexels #8395834, тапає великим пальцем): `dl/stock/pexels_8395834_25.mp4` (= uhd 2560×1440, перекодовано в 25 к/с); трекінг `node track2.js <відео> phone/track_8395834.json 1632,160,2120,272,1820,1272,1332,1160`; тапи `node taps3.js <відео> phone/track_8395834.json phone/taps_8395834.json` → відбір (≥ 0,3 с між тапами) у `phone/taps_8395834_sel.json`; `ph` рендериться окремо: `CAPY_CDP=1 CAPY_CW=390 CAPY_CH=844 CAPY_Z=2 CAPY_FPS=25 CAPY_CRF=14 CAPY_PRESET=fast` + `previews/video/rec2.js`; ph_trim = ph_final без перших 1,3 с; `node composite.js dl/stock/pexels_8395834_25.mp4 phone/track_8395834.json clips/ph_trim.mp4 phone/ph_comp.mp4 0 8.0`. Перевірка рамки й кінчика: `quadviz.js`.
3. Голос: `node previews/tr4/voice.js natural en-GB-SoniaNeural -2%` (фрази — `previews/tr4/lines.js`, набір `natural`: без «...», легка обробка, f09 — три окремі файли під частини сцени скінів). Порівняння голосів: `voice_test.js`. Живий голос: покласти `previews/tr4/voice/user/fNN.wav`.
4. Збірка: `node previews/tr4/assemble.js final sonia` (≈ 5 хв). Лише звук: `node previews/tr4/assemble.js final sonia --audio-only`, далі ffmpeg `-c:v copy` (хвилина, відео не перекодовується). Музика: `TR4_MUSIC=nowhere|second|impact|aphelion|inspired|lemonade|kitsune|sky` (типово nowhere). Сайт Скотта Баклі блокує скачування програмою: його треки лише вручну з браузера.

## Сцени (T — секунда фільму)
| T | Що | Диктор |
|---|---|---|
| 0–4 | Стара гра (5.10.2026, перший коміт), підпис OCTOBER 2026 | One month ago... it was just one little shop. |
| 4–12 | ДО/ПІСЛЯ: шторка на рівні 1 і на ТЦ 6 рівня | Then we rebuilt everything... pixel by pixel. |
| 12–16 | Наїзд на Капі, тапи, затемнення | Now... it is time to build. |
| 16–30 | **ВИБУХ**. Відродження: 5 будувань 1→6 (×3,1, кожне цілком) | Tap. Build. Grow. From a tiny shop... to a mighty mall. |
| 30–32 | Вир подорожі | Then... travel through time. |
| 32–40 | Неон: 3 будування (×3,4) | Nine eras... each with its own style. |
| 40–48 | 8 епох по 1 с у такт, різкі склейки без білих спалахів | — |
| 48–68 | **Другий вибух**. Скіни (20 с): меню, клік; Капі великим планом, 5 вбрань по 1,5 с; бруківка стелиться цілком (дерево, золото); хмари, веселка, сяйво. Під кожним скіном — його назва; без диму й конфеті | Make it yours. Skins for Capi... your street... even the sky. |
| 68–74 | Вікно «Звук»: Adventure → Chill → Halloween → Classic, звучить справжня музика гри | Every style has its own soundtrack. |
| 74–84 | Пори року по 1,5 с, без ігрової хвилі поверх кадру; Хелловін: камера стоїть близько до вулиці, видно привидів | Seasons change... And on Halloween... catch the ghosts! |
| 84–92 | Японія, дракон влітає в камеру | And beyond time itself... a secret. Japan... dragons included. |
| 92–100 | Жива людина (Pexels #8395834, лише тапає): гра в телефоні, монетки на кожен дотик, наїзд в екран | Play it on your phone... or on your PC. |
| 100–108 | Кульмінація: 8 кадрів по 1 с | — |
| 108–119 | CAPYTAP MARKET, Капі, PLAY FREE NOW · LINK BELOW, COMING SOON TO STEAM | CapyTap: Market. Play free now. Coming soon to Steam. |

Музика: «Nowhere Land» (Kevin MacLeod, 120 уд/хв) — один шматок від 0:00,03 (долі збігаються з сіткою монтажу). Музика тихіша на 3 дБ і з легким спадом на 2,5 кГц, щоб не перекривати голос; під голосом −13 дБ, під музикою гри майже нуль. Гучність −14 LUFS. Білі спалахи лишилися лише на великих переходах (після вихору, перед скінами, «пірнання» в телефон). Чистий кадр: у шотах вимкнено розмиття зверху й знизу та пилинки, віньєтка ледь помітна (`CLEAN` у `mkscn.js`); у збірці без зерна, світіння слабше. Скіни в шоті треба спершу видати (`skinGrant`), інакше гра їх не вдягає.

## Як зроблено «гру в телефоні»
- `track.js`: у кожному кадрі 4 кути зеленого екрана (прямі по краях, без вирізу-«чубчика», відкидання точок під пальцем), згладжування.
- `taps2.js` + `tapsel.js`: кінчик пальця над екраном; тап = найглибша точка руху пальця (перевірка кадрами `tapviz.js`). Знайдені тапи → `phone/ph_taps.json`.
- Шот `ph`: гра тапає в ті самі миті й у ті самі точки екрана (`toScenePoint` → `doTap`), посередині будування.
- `composite.js`: гомографія, ключ по зеленому, палець поверх гри, прибирання зеленого відсвіту з рук.

## Ліцензії й підписи (обов'язково в описі YouTube)
- Music: "Nowhere Land" Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/
- Stock footage: Pexels (#8395834, Pexels License — безкоштовно, підпис не обов'язковий, але бажаний: "Footage: Pexels").
- Голос: Microsoft Edge Neural (Sonia) — синтез; замінюється живим записом.

## Текст для YouTube (чернетка)
**Назва:** CapyTap: Market — Official Trailer | Cozy Pixel Idle Tycoon Through Time

**Опис:**
Build a tiny shop into a mighty mall — then travel through nine eras of time!
CapyTap: Market is a cozy pixel-art idle tycoon: tap, build, hire adorable helpers, dress up Capi, change seasons, catch Halloween ghosts and find the secret era... Japan (dragons included).

▶ Play free in your browser: https://melxxx23.github.io/capy-through-time/
▶ itch.io: https://melxxxnika.itch.io/capytap-market
▶ Coming soon to Steam.

No ads · No purchases · Works offline · 6 languages

Music: "Nowhere Land" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
Footage: Pexels.

#indiegame #pixelart #idlegame #tycoon #cozygames

## YouTube
Публікація, видимість, «Аудиторія», заміна старих чернеток — лише після окремого «так».
