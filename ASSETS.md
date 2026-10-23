# Character asset map

Inspected from the files you uploaded (all videos H.264, 1280×720, 24 fps, no audio; all PNG poses 512×286).
Source of truth in code: `js/assets-manifest.js`. Original files were copied, never modified.

**Left/right naming:** your files are named from the *character's* point of view. `Left.png`/`left-point.mp4` face or point
toward the **screen right**; `Right.png`/`right-point.mp4` toward the **screen left**. The site maps by what the visitor sees.

| Site state | File used | Type | Notes |
|---|---|---|---|
| Idle (default) | `idle.png` | image | Gentle CSS "breathing" + glow. Wide framing matches every other state |
| Look toward screen-left (mouse enters left zone / tap) | `right.png` | image | Returns to idle after ~2.6 s |
| Look toward screen-right | `left.png` | image | Returns to idle after ~2.6 s |
| Welcome + wave | `greeting.mp4` (5.8 s, 910 KB) | video | Fallback: `greeting.png` |
| Point at **Explore Services** (screen-left of stage) | `right-point.mp4` (4.0 s, 523 KB) | video | Fallback: `right-point.png` |
| Point at **Contact Here** (screen-right of stage, end of services) | `left-point.mp4` (4.3 s, 602 KB) | video | Fallback: `left-point.png` |

**Copied but not loaded by default**
- `idle.mp4`, `left.mp4`, `right.mp4`: tighter, close-up framing (head and shoulders, laptop cropped) than the PNGs and the
  greeting/pointing clips (full desk view). Mixing them causes the character to jump in size, so the site uses `idle.png`,
  `left.png`, `right.png` instead. They are kept in `assets/character/` for future use.
- `reference/character-master.png`: a 1024×1280 cut-out *photograph* on black, not the cartoon character. Kept as reference only.

**Not supplied:** the PDF "Sri Tech Interactive Portfolio Hero Guide" was not among the uploaded files. The hero follows the
brief's description of it (white glow fading to dusty rose, nav on top, left/centre/right behaviour, short messages, simple mobile).

**Weights:** only the video playing right now is loaded (`preload="none"`; src removed when idle). Total clips ≈ 2.0 MB.
