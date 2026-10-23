/* Single source of truth for character files (paths relative to index.html).
   Names follow the CHARACTER's own left/right, as in the supplied files:
   "left" faces/points toward the SCREEN RIGHT, "right" toward the SCREEN LEFT.
   The "screen" keys below are what the site logic uses. */
window.FASTGEN_ASSETS = {
  base: "assets/character/",
  stills: {
    idle: "idle.png",
    lookScreenLeft: "right.png",    // character looks toward screen-left
    lookScreenRight: "left.png",    // character looks toward screen-right
    greeting: "greeting.png",
    pointScreenLeft: "right-point.png",
    pointScreenRight: "left-point.png"
  },
  clips: {
    greeting: "greeting.mp4",
    pointScreenLeft: "right-point.mp4",   // toward Explore Services (hero, left of stage)
    pointScreenRight: "left-point.mp4"    // toward Contact Here (services end, right of stage)
  },
  // Copied into the project but NOT loaded by default (different, tighter framing):
  unusedByDefault: ["idle.mp4", "left.mp4", "right.mp4", "reference/character-master.png"]
};
