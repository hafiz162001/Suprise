import { SURPRISE_CONFIG } from './config.js';
import { soundManager } from './audio.js';
import { AmbientParticles, triggerCelebrationConfetti } from './confetti.js';
import { InteractiveCake } from './cake.js';

// DOM Elements
const ambientCanvas = document.getElementById('ambientCanvas');
const musicToggleBtn = document.getElementById('musicToggle');
const stageWelcome = document.getElementById('stageWelcome');
const stageCake = document.getElementById('stageCake');
const stageCelebration = document.getElementById('stageCelebration');

// Buttons
const btnOpenGift = document.getElementById('btnOpenGift');
const giftBoxTrigger = document.getElementById('giftBoxTrigger');
const btnReplay = document.getElementById('btnReplay');

// Cake container
const cakeMount = document.getElementById('cakeMount');

let cakeInstance = null;
let ambientEngine = null;

// Initialize App
function initApp() {
  // Start ambient floating hearts & particles
  if (ambientCanvas) {
    ambientEngine = new AmbientParticles(ambientCanvas);
    ambientEngine.start();
  }

  // Populate config texts
  setupDynamicTexts();

  // Setup Music Button
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      const isPlaying = soundManager.toggleMusic();
      if (isPlaying) {
        musicToggleBtn.classList.add('playing');
      } else {
        musicToggleBtn.classList.remove('playing');
      }
    });
  }

  // Stage 1 Trigger: Open surprise
  const startSurprise = () => {
    // Start background music and sound
    soundManager.startBackgroundMelody(SURPRISE_CONFIG.customMusicUrl);
    if (musicToggleBtn) {
      musicToggleBtn.classList.add('playing');
    }
    soundManager.playChime(659.25, 0.4);

    goToStage('cake');
    initCake();
  };

  btnOpenGift.addEventListener('click', startSurprise);
  giftBoxTrigger.addEventListener('click', startSurprise);

  // Stage 3: Replay
  btnReplay.addEventListener('click', () => {
    soundManager.playChime(783.99, 0.3);
    goToStage('cake');
    if (cakeInstance) {
      cakeInstance.relight();
    }
  });
}

function setupDynamicTexts() {
  // Welcome Stage
  document.getElementById('welcomeTitle').textContent = SURPRISE_CONFIG.welcomeTitle;
  document.getElementById('welcomeSubtitle').textContent = SURPRISE_CONFIG.welcomeSubtitle;
  document.getElementById('btnOpenGiftText').textContent = SURPRISE_CONFIG.openButtonText;

  // Cake Stage
  document.getElementById('cakeTitle').textContent = SURPRISE_CONFIG.cakeTitle;
  document.getElementById('cakeInstruction').textContent = SURPRISE_CONFIG.cakeInstruction;

  // Celebration Stage
  document.getElementById('celebrationTitle').textContent = SURPRISE_CONFIG.celebrationTitle;
  document.getElementById('celebrationSubtitle').textContent = SURPRISE_CONFIG.celebrationSubtitle;

  // Love Letter
  document.getElementById('letterTitle').textContent = SURPRISE_CONFIG.letterTitle;
  const letterBody = document.getElementById('letterBody');
  letterBody.innerHTML = '';
  SURPRISE_CONFIG.letterParagraphs.forEach((pText) => {
    const p = document.createElement('p');
    p.textContent = pText;
    letterBody.appendChild(p);
  });

  document.getElementById('letterSignOff').textContent = SURPRISE_CONFIG.letterSignOff;
  document.getElementById('senderName').textContent = SURPRISE_CONFIG.senderName;

  // Photo Polaroid
  const polaroidWrapper = document.getElementById('polaroidCard');
  if (SURPRISE_CONFIG.hasPhoto && SURPRISE_CONFIG.photoUrl) {
    polaroidWrapper.style.display = 'block';
    document.getElementById('polaroidImg').src = SURPRISE_CONFIG.photoUrl;
    document.getElementById('polaroidCaption').textContent = SURPRISE_CONFIG.photoCaption || SURPRISE_CONFIG.nickname;
  } else {
    polaroidWrapper.style.display = 'none';
  }
}

function goToStage(stageName) {
  // Hide all
  stageWelcome.classList.remove('active');
  stageCake.classList.remove('active');
  stageCelebration.classList.remove('active');

  if (stageName === 'welcome') {
    stageWelcome.classList.add('active');
  } else if (stageName === 'cake') {
    stageCake.classList.add('active');
  } else if (stageName === 'celebration') {
    stageCelebration.classList.add('active');
  }
}

function initCake() {
  if (!cakeInstance) {
    cakeInstance = new InteractiveCake(cakeMount, {
      candleCount: SURPRISE_CONFIG.candleCount,
      enableMic: SURPRISE_CONFIG.enableMicBlow,
      onAllBlown: () => {
        // Trigger celebratory confetti burst!
        triggerCelebrationConfetti();

        setTimeout(() => {
          goToStage('celebration');
        }, 1200);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Register service worker for PWA install capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW register failed:', err);
    });
  }
});
