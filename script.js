// Moving "No" button script
(() => {
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsArea = document.getElementById('buttons');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');

  // Behavior settings
  const AVOID_DISTANCE = 140; // pixels: how close the cursor can get before the "No" moves
  const MOVE_PADDING = 12; // padding from edges
  let lastMove = 0;
  const MOVE_COOLDOWN = 80; // ms between forced moves to avoid jitter

  function getBounds(el){
    return el.getBoundingClientRect();
  }

  function moveNoButtonAway(mouseX, mouseY) {
    const now = Date.now();
    if (now - lastMove < MOVE_COOLDOWN) return;
    lastMove = now;

    const containerRect = buttonsArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const areaWidth = containerRect.width;
    const areaHeight = containerRect.height;

    const btnW = btnRect.width;
    const btnH = btnRect.height;

    // Pick a new random position inside the buttonsArea (relative to its top-left)
    // Ensure button stays fully visible inside the area with padding
    const minX = MOVE_PADDING;
    const maxX = Math.max(areaWidth - btnW - MOVE_PADDING, minX);
    const minY = MOVE_PADDING;
    const maxY = Math.max(areaHeight - btnH - MOVE_PADDING, minY);

    // pick a point that is farther from (mouseX,mouseY) (in viewport coords).
    // We'll attempt several times and choose the best candidate.
    let best = null;
    let bestDist = -1;
    for (let i = 0; i < 12; i++) {
      const rx = Math.random() * (maxX - minX) + minX;
      const ry = Math.random() * (maxY - minY) + minY;

      const candidateX = containerRect.left + rx + btnW / 2;
      const candidateY = containerRect.top + ry + btnH / 2;

      const dx = candidateX - mouseX;
      const dy = candidateY - mouseY;
      const d = Math.hypot(dx, dy);

      if (d > bestDist) {
        bestDist = d;
        best = { rx, ry };
      }
    }

    if (!best) return;

    // Apply transform to move the button
    noBtn.classList.add('moving');
    noBtn.style.left = `${best.rx + btnW / 2}px`; // left as absolute position in the area
    noBtn.style.top = `${best.ry + btnH / 2}px`;
    // remove moving class after transition ends
    setTimeout(()=> noBtn.classList.remove('moving'), 300);
  }

  // Calculate distance from pointer to button center
  function pointerDistanceToButton(clientX, clientY) {
    const btn = getBounds(noBtn);
    const bx = btn.left + btn.width / 2;
    const by = btn.top + btn.height / 2;
    return Math.hypot(clientX - bx, clientY - by);
  }

  // Event handlers
  function onMouseMove(e) {
    const dist = pointerDistanceToButton(e.clientX, e.clientY);
    if (dist < AVOID_DISTANCE) {
      moveNoButtonAway(e.clientX, e.clientY);
    }
  }

  function onTouchMove(e) {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    const dist = pointerDistanceToButton(t.clientX, t.clientY);
    if (dist < AVOID_DISTANCE) {
      moveNoButtonAway(t.clientX, t.clientY);
    }
  }

  // Initialize button position to center-right-ish
  function initPosition() {
    const btnRect = noBtn.getBoundingClientRect();
    const areaRect = buttonsArea.getBoundingClientRect();
    // center vertically, slightly offset horizontally
    const left = (areaRect.width * 0.65);
    const top = (areaRect.height / 2);
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }

  // Allow a tiny chance to click "No" if someone actually manages to press it:
  noBtn.addEventListener('click', () => {
    // playful message: swap text briefly
    const prev = noBtn.textContent;
    noBtn.textContent = "Oh... you caught me!";
    setTimeout(() => noBtn.textContent = prev, 1200);
  });

  yesBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Listen for pointer movement inside buttons area
  buttonsArea.addEventListener('mousemove', onMouseMove);
  buttonsArea.addEventListener('touchmove', onTouchMove, { passive: true });

  // Recompute initial position on load and resize
  window.addEventListener('load', initPosition);
  window.addEventListener('resize', initPosition);

  // Make the button initially positioned absolutely relative to buttonsArea
  // (left/top set in initPosition)
  noBtn.style.position = 'absolute';
})();
