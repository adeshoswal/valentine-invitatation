// Moving "No" button script + simplified invitation modal
(() => {
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsArea = document.getElementById('buttons');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const sealKissBtn = document.getElementById('sealKiss');
  const kissCanvas = document.getElementById('kissCanvas');

  // Romantic audio
  const romanticAudio = new Audio('Main Tera Boyfriend Raabta 320 Kbps.mp3');
  romanticAudio.loop = true;
  romanticAudio.volume = 0.3;
  romanticAudio.currentTime = 45;

  // Behavior settings for "No" button
  const AVOID_DISTANCE = 140;
  const MOVE_PADDING = 12;
  let lastMove = 0;
  const MOVE_COOLDOWN = 80;

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

  function initPosition() {
    const btnRect = noBtn.getBoundingClientRect();
    const areaRect = buttonsArea.getBoundingClientRect();
    const left = (areaRect.width * 0.65);
    const top = (areaRect.height / 2);
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }

  // Typewriter effect
  function typeWriter(text, element, speed = 100) {
    let i = 0;
    element.textContent = '';
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // Scratch-off effect
  function initScratchOff() {
    const scratchItems = document.querySelectorAll('.scratch-item');
    
    scratchItems.forEach(item => {
      const canvas = item.querySelector('.scratch-canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = item.offsetWidth;
      canvas.height = item.offsetHeight;
      
      // Draw scratch-off layer
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#b8b8b8');
      gradient.addColorStop(1, '#9e9e9e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add diagonal stripes
      ctx.strokeStyle = '#8a8a8a';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width + canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(0, i);
        ctx.stroke();
      }
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;
      ctx.fillText('🎁 Scratch to reveal', canvas.width / 2, canvas.height / 2);
      
      let isScratching = false;
      
      function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      
      function getPosition(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      }
      
      canvas.addEventListener('mousedown', (e) => {
        isScratching = true;
        const pos = getPosition(e, canvas);
        scratch(pos.x, pos.y);
      });
      
      canvas.addEventListener('mousemove', (e) => {
        if (!isScratching) return;
        const pos = getPosition(e, canvas);
        scratch(pos.x, pos.y);
      });
      
      canvas.addEventListener('mouseup', () => isScratching = false);
      canvas.addEventListener('mouseleave', () => isScratching = false);
      
      // Touch support
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isScratching = true;
        const pos = getPosition(e, canvas);
        scratch(pos.x, pos.y);
      });
      
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isScratching) return;
        const pos = getPosition(e, canvas);
        scratch(pos.x, pos.y);
      });
      
      canvas.addEventListener('touchend', () => isScratching = false);
    });
  }

  // Lipstick kiss mark
  function drawKiss() {
    kissCanvas.classList.remove('hidden');
    kissCanvas.width = 200;
    kissCanvas.height = 150;
    const ctx = kissCanvas.getContext('2d');
    
    ctx.fillStyle = '#ff1744';
    ctx.globalAlpha = 0.7;
    
    // Draw lips shape
    ctx.beginPath();
    ctx.ellipse(100, 60, 60, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(70, 50, 25, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(130, 50, 25, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();

    setTimeout(() => kissCanvas.classList.add('hidden'), 3000);
  }

  noBtn.addEventListener('click', () => {
    const prev = noBtn.textContent;
    noBtn.textContent = "Oh... you caught me!";
    setTimeout(() => noBtn.textContent = prev, 1200);
  });

  // Show invitation modal when Yes clicked
  yesBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    romanticAudio.play().catch(e => console.log('Audio play failed:', e));
    typeWriter("You're Invited 💌", modalTitle, 80);
    initScratchOff();
  });

  // Seal with kiss button
  sealKissBtn.addEventListener('click', () => {
    drawKiss();
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      romanticAudio.pause();
      romanticAudio.currentTime = 0;
    }
  });

  buttonsArea.addEventListener('mousemove', onMouseMove);
  buttonsArea.addEventListener('touchmove', onTouchMove, { passive: true });

  window.addEventListener('load', initPosition);
  window.addEventListener('resize', initPosition);

  noBtn.style.position = 'absolute';
})();
