// Moving "No" button script + simplified invitation modal
(() => {
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsArea = document.getElementById('buttons');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');

  // Behavior settings for "No" button
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

    const minX = MOVE_PADDING;
    const maxX = Math.max(areaWidth - btnW - MOVE_PADDING, minX);
    const minY = MOVE_PADDING;
    const maxY = Math.max(areaHeight - btnH - MOVE_PADDING, minY);

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

    noBtn.classList.add('moving');
    noBtn.style.left = `${best.rx + btnW / 2}px`;
    noBtn.style.top = `${best.ry + btnH / 2}px`;
    setTimeout(()=> noBtn.classList.remove('moving'), 300);
  }

  function pointerDistanceToButton(clientX, clientY) {
    const btn = getBounds(noBtn);
    const bx = btn.left + btn.width / 2;
    const by = btn.top + btn.height / 2;
    return Math.hypot(clientX - bx, clientY - by);
  }

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
    const left = (areaRect.width * 0.65);
    const top = (areaRect.height / 2);
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }

  // "No" button playful click
  noBtn.addEventListener('click', () => {
    const prev = noBtn.textContent;
    noBtn.textContent = "Oh... you caught me!";
    setTimeout(() => noBtn.textContent = prev, 1200);
  });

  // Show invitation modal when Yes clicked
  yesBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Listeners for pointer movement inside buttons area
  buttonsArea.addEventListener('mousemove', onMouseMove);
  buttonsArea.addEventListener('touchmove', onTouchMove, { passive: true });

  // Recompute initial position on load and resize
  window.addEventListener('load', initPosition);
  window.addEventListener('resize', initPosition);

  // Make the No button absolute within the buttonsArea
  noBtn.style.position = 'absolute';
})();
