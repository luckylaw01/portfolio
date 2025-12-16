// ============================================================================
// FBAS - Audio System (Web Audio API)
// ============================================================================

let audioContext = null;
let masterGain = null;
let isEnabled = true;
let volume = 0.7;

// Initialize audio context (must be called after user interaction)
export function initAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = volume;
    
    console.log('Audio system initialized');
}

// Ensure audio context is running (call after user interaction)
export function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Set master volume (0.0 to 1.0)
export function setVolume(vol) {
    volume = Math.max(0, Math.min(1, vol));
    if (masterGain) {
        masterGain.gain.value = volume;
    }
}

// Enable/disable audio
export function setEnabled(enabled) {
    isEnabled = enabled;
}

// ============================================================================
// Sound Generators
// ============================================================================

// Success beep - short high-pitched tone
export function playSuccessBeep() {
    if (!isEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.frequency.value = 880; // A5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Double beep for confirmed success
export function playDoubleBeep() {
    if (!isEnabled || !audioContext) return;
    
    playSuccessBeep();
    setTimeout(() => {
        if (isEnabled && audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGain);
            
            oscillator.frequency.value = 1100; // Higher pitch
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.12);
        }
    }, 100);
}

// Error buzz - low harsh tone
export function playErrorBuzz() {
    if (!isEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Button click - short noise burst
export function playButtonClick() {
    if (!isEnabled || !audioContext) return;
    
    const bufferSize = audioContext.sampleRate * 0.03; // 30ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    
    gainNode.gain.value = 0.15;
    
    source.start(audioContext.currentTime);
}

// Plug connect - click with subtle chime
export function playPlugConnect() {
    if (!isEnabled || !audioContext) return;
    
    // Click part
    playButtonClick();
    
    // Chime part
    setTimeout(() => {
        if (!isEnabled || !audioContext) return;
        
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc1.frequency.value = 523; // C5
        osc2.frequency.value = 659; // E5
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        osc1.start(audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.3);
        osc2.stop(audioContext.currentTime + 0.3);
    }, 50);
}

// Plug disconnect
export function playPlugDisconnect() {
    if (!isEnabled || !audioContext) return;
    
    const osc1 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc1.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc1.frequency.setValueAtTime(400, audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
    osc1.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.15);
}

// Sync sound - ascending data transfer tones
export function playSyncSound() {
    if (!isEnabled || !audioContext) return;
    
    const notes = [400, 500, 600, 800];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            if (!isEnabled || !audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGain);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }, i * 80);
    });
}

// Power on - rising sequence with boot chime
export function playPowerOn() {
    if (!isEnabled || !audioContext) return;
    
    // Initial click sound
    playButtonClick();
    
    // Boot sequence tones
    setTimeout(() => {
        if (!isEnabled || !audioContext) return;
        
        const notes = [220, 330, 440, 550, 660];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (!isEnabled || !audioContext) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(masterGain);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const duration = 0.15;
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, i * 80);
        });
    }, 100);
    
    // Final startup chime (chord)
    setTimeout(() => {
        if (!isEnabled || !audioContext) return;
        
        const chordFreqs = [523, 659, 784]; // C5, E5, G5 - major chord
        chordFreqs.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.5);
        });
    }, 600);
}

// Power off - falling sequence with shutdown sound
export function playPowerOff() {
    if (!isEnabled || !audioContext) return;
    
    // Initial click
    playButtonClick();
    
    // Shutdown chord (minor - sad goodbye sound)
    setTimeout(() => {
        if (!isEnabled || !audioContext) return;
        
        const chordFreqs = [392, 466, 587]; // G4, Bb4, D5 - minor chord
        chordFreqs.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.3);
        });
    }, 50);
    
    // Descending power-down tones
    setTimeout(() => {
        if (!isEnabled || !audioContext) return;
        
        const notes = [660, 550, 440, 330, 220, 110];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (!isEnabled || !audioContext) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(masterGain);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const duration = 0.1 + i * 0.02;
                const startGain = 0.1 - i * 0.015;
                gainNode.gain.setValueAtTime(Math.max(0.02, startGain), audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, i * 90);
        });
    }, 350);
}

// Scan start - quick blip
export function playScanStart() {
    if (!isEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Navigation sound - subtle tick
export function playNavigate() {
    if (!isEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.03);
}
