import { soundManager } from './audio.js';

export class InteractiveCake {
  constructor(container, options = {}) {
    this.container = container;
    this.candleCount = options.candleCount || 3;
    this.onAllBlown = options.onAllBlown || (() => {});
    this.enableMic = options.enableMic ?? true;
    this.candles = [];
    this.blownCount = 0;
    this.isCompleted = false;
    this.audioContext = null;
    this.analyser = null;
    this.micStream = null;
    this.micAnimationId = null;

    this.render();
    if (this.enableMic) {
      this.initMicBlowDetection();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="cake-wrapper">
        <!-- Cake Display -->
        <div class="cake" id="cakeBody" title="Sentuh untuk meniup lilin">
          <!-- Plate -->
          <div class="plate"></div>

          <!-- Tier 1 (Bottom) -->
          <div class="layer layer-bottom">
            <div class="frosting-drip"></div>
            <div class="cake-decorations">
              <span class="decor-dot"></span>
              <span class="decor-dot"></span>
              <span class="decor-dot"></span>
              <span class="decor-dot"></span>
            </div>
          </div>

          <!-- Tier 2 (Top) -->
          <div class="layer layer-top">
            <div class="frosting-drip"></div>
            <div class="strawberries">
              <span class="strawberry">🍓</span>
              <span class="strawberry">🍓</span>
              <span class="strawberry">🍓</span>
            </div>
          </div>

          <!-- Candles Container -->
          <div class="candles-container" id="candlesGroup"></div>
        </div>

        <!-- Mic & Tap Hint -->
        <div class="cake-action-hint">
          <div class="hint-badge" id="micStatusBadge">
            <span class="hint-icon">🌬️</span>
            <span class="hint-text">Tiup ke mic HP atau sentuh lilinnya</span>
          </div>

          <!-- Live Blow Meter (fills when blowing sound is detected) -->
          <div class="mic-meter-bar" id="micMeterBar" style="display: none;">
            <div class="mic-meter-fill" id="micMeterFill"></div>
          </div>

          <p class="candles-remaining" id="candleCounterText">
            ${this.candleCount} lilin menyala
          </p>

          <!-- Dedicated Blow Button for Easy Tap on Phones -->
          <button class="blow-btn" id="btnBlowCandle" type="button">
            <span>💨</span>
            <span>Tiup Lilin Sekarang</span>
          </button>
        </div>
      </div>
    `;

    const candlesGroup = this.container.querySelector('#candlesGroup');
    const candleColors = ['#f472b6', '#60a5fa', '#facc15', '#a78bfa', '#34d399'];

    for (let i = 0; i < this.candleCount; i++) {
      const candleEl = document.createElement('div');
      candleEl.className = 'candle';
      const stripeColor = candleColors[i % candleColors.length];
      candleEl.style.setProperty('--stripe-color', stripeColor);

      candleEl.innerHTML = `
        <div class="flame-wrapper">
          <div class="flame"></div>
          <div class="flame-glow"></div>
          <div class="smoke"></div>
        </div>
        <div class="wick"></div>
        <div class="stick"></div>
      `;

      candleEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.extinguishCandle(i);
      });

      candleEl.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.extinguishCandle(i);
      }, { passive: true });

      candlesGroup.appendChild(candleEl);
      this.candles.push({
        element: candleEl,
        isBlown: false
      });
    }

    // Touch cake itself to blow a candle
    const cakeBody = this.container.querySelector('#cakeBody');
    if (cakeBody) {
      cakeBody.addEventListener('click', () => {
        this.blowRandomLitCandle();
      });
    }

    // Dedicated Blow Button
    const btnBlow = this.container.querySelector('#btnBlowCandle');
    if (btnBlow) {
      const handleBlowClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.blowRandomLitCandle();
      };
      btnBlow.addEventListener('click', handleBlowClick);
      btnBlow.addEventListener('touchstart', handleBlowClick, { passive: false });
    }

    // Allow user to tap badge to trigger mic permission if blocked initially
    const badge = this.container.querySelector('#micStatusBadge');
    if (badge) {
      badge.addEventListener('click', () => {
        this.initMicBlowDetection(true);
      });
    }
  }

  extinguishCandle(index) {
    if (this.isCompleted || index < 0 || index >= this.candles.length) return;
    const candle = this.candles[index];
    if (candle.isBlown) return;

    candle.isBlown = true;
    this.blownCount++;
    candle.element.classList.add('extinguished');

    // Haptic vibration if supported
    if (navigator.vibrate) {
      try {
        navigator.vibrate(60);
      } catch (err) {
        // ignore
      }
    }

    soundManager.playPuff();
    this.updateCounter();

    if (this.blownCount === this.candles.length) {
      this.handleAllBlown();
    }
  }

  blowRandomLitCandle() {
    const unlit = this.candles
      .map((c, i) => ({ c, i }))
      .filter((item) => !item.c.isBlown);

    if (unlit.length > 0) {
      this.extinguishCandle(unlit[0].i);
    }
  }

  blowAllRemainingCandles() {
    this.candles.forEach((c, i) => {
      if (!c.isBlown) {
        setTimeout(() => {
          this.extinguishCandle(i);
        }, i * 140);
      }
    });
  }

  updateCounter() {
    const counter = this.container.querySelector('#candleCounterText');
    if (!counter) return;

    const remaining = this.candleCount - this.blownCount;
    if (remaining > 0) {
      counter.textContent = `Tersisa ${remaining} lilin lagi`;
    } else {
      counter.textContent = `✨ Lilin padam! Semoga wish kamu terkabul! 🎉`;
    }
  }

  handleAllBlown() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    this.stopMic();

    // Hide blow button & show completion
    const btnBlow = this.container.querySelector('#btnBlowCandle');
    if (btnBlow) {
      btnBlow.style.display = 'none';
    }

    // Trigger sweet celebration fanfare chime
    soundManager.playCelebrationFanfare();

    setTimeout(() => {
      this.onAllBlown();
    }, 800);
  }

  async initMicBlowDetection(userTriggered = false) {
    // Check for Secure Context / getUserMedia availability
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const badge = this.container.querySelector('#micStatusBadge');
      if (badge) {
        badge.querySelector('.hint-text').textContent = '💡 Sentuh lilin atau tekan tombol tiup di bawah!';
      }
      return;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let blowStreak = 0;
      const meterBar = this.container.querySelector('#micMeterBar');
      const meterFill = this.container.querySelector('#micMeterFill');
      if (meterBar) meterBar.style.display = 'block';

      const checkBlow = () => {
        if (this.isCompleted) return;

        this.analyser.getByteFrequencyData(dataArray);

        // Calculate low-frequency rumble characteristic of blowing into microphone
        let lowSum = 0;
        const lowBins = Math.min(16, bufferLength);
        for (let i = 1; i < lowBins; i++) {
          lowSum += dataArray[i];
        }
        const lowAvg = lowSum / (lowBins - 1);

        // Overall volume average
        let totalSum = 0;
        for (let i = 0; i < bufferLength; i++) {
          totalSum += dataArray[i];
        }
        const totalAvg = totalSum / bufferLength;

        // Update live meter bar
        if (meterFill) {
          const fillPercent = Math.min(100, Math.round((lowAvg / 50) * 100));
          meterFill.style.width = `${fillPercent}%`;
        }

        // Sensitive detection threshold for blowing into phone mic
        if (lowAvg > 28 || totalAvg > 35) {
          blowStreak++;
          if (blowStreak >= 2) {
            blowStreak = 0;
            this.blowRandomLitCandle();
          }
        } else {
          blowStreak = Math.max(0, blowStreak - 1);
        }

        this.micAnimationId = requestAnimationFrame(checkBlow);
      };

      checkBlow();

      const badge = this.container.querySelector('#micStatusBadge');
      if (badge) {
        badge.classList.add('mic-active');
        badge.querySelector('.hint-icon').textContent = '🎙️';
        badge.querySelector('.hint-text').textContent = 'Mic Aktif! Tiup langsung ke mic HP 🌬️';
      }
    } catch (err) {
      console.log('Mic access error or denied:', err);
      const badge = this.container.querySelector('#micStatusBadge');
      if (badge) {
        badge.classList.remove('mic-active');
        badge.querySelector('.hint-icon').textContent = '👆';
        badge.querySelector('.hint-text').textContent = 'Sentuh lilin atau tekan tombol tiup di bawah!';
      }
    }
  }

  stopMic() {
    if (this.micAnimationId) {
      cancelAnimationFrame(this.micAnimationId);
      this.micAnimationId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  relight() {
    this.isCompleted = false;
    this.blownCount = 0;
    this.candles.forEach((c) => {
      c.isBlown = false;
      c.element.classList.remove('extinguished');
    });

    const btnBlow = this.container.querySelector('#btnBlowCandle');
    if (btnBlow) {
      btnBlow.style.display = 'inline-flex';
    }

    this.updateCounter();
    if (this.enableMic) {
      this.initMicBlowDetection();
    }
  }
}
