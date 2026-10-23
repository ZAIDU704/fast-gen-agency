/* Character engine: still images for instant states, ONE shared <video> per stage for clips.
   A token invalidates stale timers/callbacks so states never fight each other. */
(function () {
  const A = window.FASTGEN_ASSETS;
  const url = (f) => A.base + f;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SHOW_MS = 2600;   // look-left/right duration before returning to idle
  const PEEK_MS = 3200;   // still-image pointing/greeting duration (fallback / reduced motion)

  class Character {
    constructor(root) {
      this.root = root;
      this.stills = {};
      this.video = root.querySelector("video");
      this.bubble = root.querySelector(".bubble");
      this.token = 0;
      this.timer = null;
      this.state = "idle";
      this.videoOK = !!(this.video && this.video.canPlayType && this.video.canPlayType('video/mp4; codecs="avc1.42E01E"'));
      root.querySelectorAll("img[data-still]").forEach((img) => {
        img.src = url(A.stills[img.dataset.still]);
        this.stills[img.dataset.still] = img;
      });
      this.show("idle");
    }
    // Make exactly one still visible (video hidden)
    show(still) {
      Object.entries(this.stills).forEach(([k, el]) => el.classList.toggle("on", k === still));
      if (this.video) this.video.classList.remove("on");
    }
    say(text) {
      if (!this.bubble) return;
      this.bubble.textContent = text || "";
      this.bubble.classList.toggle("on", !!text);
    }
    cancel() {
      this.token++;
      clearTimeout(this.timer);
      if (this.video) { this.video.pause(); this.video.onended = this.video.onerror = null; }
    }
    idle() {
      this.cancel(); this.state = "idle";
      this.show("idle"); this.say("");
      if (this.video) { this.video.removeAttribute("src"); this.video.load(); } // free memory
    }
    // Still-image reaction that returns to idle
    pose(still, text, ms, onDone) {
      this.cancel(); this.state = still;
      this.show(still); this.say(text);
      const t = this.token;
      this.timer = setTimeout(() => { if (t === this.token) { this.idle(); onDone && onDone(); } }, ms || SHOW_MS);
    }
    look(side) { // "left" | "right" — SCREEN direction
      if (side === "left") this.pose("lookScreenLeft", "Looking for something over here?");
      else this.pose("lookScreenRight", "Our work and pricing are this way.");
    }
    // Play a clip; fall back to its still if video cannot play
    clip(name, text, onDone) {
      const stillFor = name === "greeting" ? "greeting" : name;
      if (reduceMotion.matches || !this.videoOK) return this.pose(stillFor, text, PEEK_MS, onDone);
      this.cancel(); this.state = name;
      const t = this.token, v = this.video;
      this.show(stillFor);               // still is the instant poster while the clip loads
      this.say(text);
      const finish = () => { if (t === this.token) { this.idle(); onDone && onDone(); } };
      v.onended = finish;
      v.onerror = () => { if (t === this.token) this.pose(stillFor, text, PEEK_MS, onDone); };
      v.muted = true; v.playsInline = true;
      v.src = url(A.clips[name]);
      v.play().then(() => { if (t === this.token) v.classList.add("on"); })
        .catch(() => { if (t === this.token) this.pose(stillFor, text, PEEK_MS, onDone); });
      this.timer = setTimeout(finish, 9000); // safety net if 'ended' never fires
    }
    greet(onDone) { this.clip("greeting", "Welcome to FAST GEN!", onDone); }
    pointExplore(onDone) { this.clip("pointScreenLeft", "Start here: Explore Services", onDone); }
    pointContact(onDone) { this.clip("pointScreenRight", "Ready? Contact Here", onDone); }
  }
  window.FastGenCharacter = Character;
})();
