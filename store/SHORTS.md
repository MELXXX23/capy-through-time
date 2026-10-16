# Shorts / TikTok для CapyTap: Market (3 відео, вертикаль 1080×1920, 60 к/с)

Усе в `previews/` (не в git). Музика — та сама власна, що в трейлері (`previews/music/capy_theme.wav`), нарізана за тактами (такт = 1,875 с).
Рендер: `bash previews/shorts/render_shorts.sh [1 2 3]` (≈7 хв кожен) → `previews/shorts/out/CapyTap_Short1..3.mp4`.
Звук: `previews/video/mix_short.js` бере `previews/shorts/sN_mix.json` (шматки музики + голос). Голос підхоплюється автоматично, якщо файл лежить у `previews/voice/shorts/`.

| # | Про що | Тривалість | Музика (такти трейлера) | Що видно |
|---|---|---|---|---|
| 1 | Скорочений трейлер | 31,9 с | 4–8, 13–15, 16–18, 21–22, 39–42 | Ренесанс: ПОВНЕ будівництво 8,5 с → подорож у часі → Диско: швидке будівництво → огляд епох (Ретро, Аркада, Космос, Неон) → «Coming soon to Steam» |
| 2 | Як прокачуватись | 26,3 с | 4–13, 39–42 | лише Ренесанс: тап → купити відділи → найняти трьох звірят → розширити магазин (швидке будівництво) |
| 3 | Секретна бонус-гра | 22,5 с | 4–5, 8–13, 39–42 | лише Ренесанс: іконка бонус-гри → «Фреска» (повтори порядок фарб) → приз-скін Капі → Капі в обновці |

Ролики 2 і 3 навмисно НЕ показують інших епох (лише напис «Epoch: Renaissance» у куті), щоб решта лишалась секретом.
Кінцівка 2–3: «PLAY FREE / LINK IN BIO» (текст змінюється в `endCard({ sub: … })` у `scn_short2.src.js`, `scn_short3.src.js`; для Steam-релізу можна поставити «WISHLIST ON STEAM»).

## Голос (ElevenLabs, Eleven v3, той самий жіночий голос, що й для трейлера)
Файли клади в `previews/voice/shorts/` (mp3 чи wav). Тривалість не довша за «вікно» (інакше я скорочу текст). Для Short 1 беруться ГОТОВІ репліки трейлера (A, C, D, I з `previews/voice/final/`) + одна нова.

### Short 1
| Файл | Текст | З секунди | Вікно, c |
|---|---|---|---|
| `final/A.mp3` | (з трейлера) Meet Capi. One tiny shop... and one very big dream. | 0,3 | ≤ 5,3 |
| `final/C.mp3` | (з трейлера) Then... travel through time. | 9,6 | ≤ 3,3 |
| `final/D.mp3` | (з трейлера) Every era builds in its own style. | 15,3 | ≤ 4,5 |
| `s1_E.mp3` НОВА | `[fast, energetic] Nine eras. One shop.` | 20,7 | ≤ 3,5 |
| `final/I.mp3` | (з трейлера) CapyTap: Market. The pixel tapper you won't put down. Coming soon to Steam. | 24,6 | ≤ 7,0 |

### Short 2 «Як прокачуватись»
| Файл | Текст | З секунди | Вікно, c |
|---|---|---|---|
| `s2_a.mp3` | `[playful] Grow your shop!` | 0,3 | ≤ 1,8 |
| `s2_b.mp3` | `[upbeat] Tap the shop to earn coins.` | 2,3 | ≤ 3,2 |
| `s2_c.mp3` | `[cheerful] Upgrade your shelves to earn even more.` | 5,8 | ≤ 5,2 |
| `s2_d.mp3` | `[warm, excited] Hire animal helpers. Each one gives you a bonus!` | 11,4 | ≤ 5,3 |
| `s2_e.mp3` | `[excited] Then level up... and watch your shop grow!` | 18,9 | ≤ 4,2 |
| `s2_f.mp3` | `[confident, warm] CapyTap: Market.` | 23,9 | ≤ 2,3 |

### Short 3 «Секретна бонус-гра»
| Файл | Текст | З секунди | Вікно, c |
|---|---|---|---|
| `s3_a.mp3` | `[whispering, mysterious] Psst... a secret bonus game!` | 0,3 | ≤ 3,6 |
| `s3_b.mp3` | `[playful] Watch the colors... and repeat them!` | 4,0 | ≤ 4,3 |
| `s3_c.mp3` | `[building excitement] Get it right... and win a brand-new skin!` | 9,0 | ≤ 5,0 |
| `s3_d.mp3` | `[delighted] Look at Capi!` | 17,2 | ≤ 2,3 |
| `s3_e.mp3` | `[confident, warm] CapyTap: Market.` | 20,0 | ≤ 2,3 |

Після голосу: дописати їх у `previews/shorts/sN_mix.json` (поле `voice`, приклад у `s1_mix.json`) і перезапустити лише мікс: `cd previews/video && node mix_short.js ../shorts/out/shortN_silent.mp4 ../shorts/sN_mix.json ../shorts/out/CapyTap_ShortN.mp4` (без нового запису відео).

## Чорновий голос (Edge, не для публікації)
`node previews/voice/gen_shorts_guide.js` читає таблиці вище й пише `previews/voice/shorts_guide/*.mp3` (показує, чи вкладається в вікно). Чернеткові відео з цим голосом: `previews/shorts/out/CapyTap_ShortN_voicedraft.mp4` (конфіги `sN_mix_draftvoice.json`). Фінал — тільки з голосом ElevenLabs.

## Рішення (2026-10-16)
Користувачка залишила голос Edge (Aria) як ФІНАЛЬНИЙ для Shorts: готові файли — `previews/shorts/final/CapyTap_Short1..3.mp4` (= `*_voicedraft`). ElevenLabs для Shorts не потрібен.
