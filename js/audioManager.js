// Enhanced Audio Manager - v2.1
// Uses both HTML5 Audio API and Howler.js for better reliability
console.log("Loading Enhanced Audio Manager v2.1");

// Create a singleton audio manager
window.AudioManagerInstance = (function() {
  // Audio files to preload
  const AUDIO_FILES = {
    rain: 'assets/sounds/rain.mp3',
    ocean: 'assets/sounds/ocean.mp3',
    piano: 'assets/sounds/piano.mp3',
    bird: 'assets/sounds/bird.mp3'
  };
  
  // Create both HTML5 Audio elements and Howl instances for redundancy
  const audioElements = {};
  const howlSounds = {};
  let currentSound = null;
  let currentVolume = 0.3; // Default volume
  let useHowl = true; // Toggle between Howl and HTML5 Audio
  let isInitialized = false;
  
  // Initialize audio elements
  function init() {
    console.log("Initializing Enhanced Audio Manager");
    
    // Create both HTML5 Audio elements and Howl instances
    Object.keys(AUDIO_FILES).forEach(key => {
      const path = AUDIO_FILES[key];
      
      // Create HTML5 Audio element
      const audio = new Audio();
      audio.src = path;
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = currentVolume;
      
      // Add event listeners
      audio.addEventListener('canplaythrough', () => {
        console.log(`HTML5 Audio: ${key} can play through`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`HTML5 Audio error for ${key}:`, e);
        // If HTML5 Audio fails, switch to Howl
        useHowl = true;
      });
      
      audioElements[key] = audio;
      
      // Create Howl instance as backup
      howlSounds[key] = new Howl({
        src: [path],
        loop: true,
        volume: currentVolume,
        html5: false, // Use Web Audio API for better performance
        preload: true,
        onload: () => console.log(`Howl: ${key} loaded`),
        onloaderror: (id, err) => console.error(`Howl error loading ${key}:`, err)
      });
    });
    
    // Start preloading all sounds immediately
    preloadAllSounds();
    
    // Mark as initialized
    isInitialized = true;
  }
  
  // Preload all audio files
  function preloadAllSounds() {
    console.log("Preloading all audio files");
    
    // Preload HTML5 Audio elements
    Object.values(audioElements).forEach(audio => {
      audio.load();
    });
    
    // Howl automatically preloads when created
  }
  
  // Play a sound using the current method (HTML5 or Howl)
  function playSound(soundKey) {
    if (!AUDIO_FILES[soundKey]) {
      console.error(`Sound ${soundKey} not found`);
      return;
    }
    
    // Make sure we're initialized
    if (!isInitialized) {
      init();
    }
    
    console.log(`Playing ${soundKey} using ${useHowl ? 'Howl' : 'HTML5 Audio'}`);
    
    // Stop current sound if different
    if (currentSound && currentSound !== soundKey) {
      stopSound(currentSound);
    }
    
    currentSound = soundKey;
    
    try {
      if (useHowl) {
        // Use Howl
        howlSounds[soundKey].volume(currentVolume);
        howlSounds[soundKey].play();
      } else {
        // Use HTML5 Audio
        const audio = audioElements[soundKey];
        audio.volume = currentVolume;
        
        // This is a more reliable way to play audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('HTML5 Audio play failed:', error);
            // Fall back to Howl if HTML5 Audio fails
            useHowl = true;
            howlSounds[soundKey].volume(currentVolume);
            howlSounds[soundKey].play();
          });
        }
      }
      
      // Mark button as active
      const button = document.querySelector(`button[data-sound="${soundKey}.mp3"]`);
      if (button) {
        setActiveButton(button);
      }
      
      // Store selection in localStorage
      localStorage.setItem('selectedSound', soundKey);
      
      // Update the volume slider to match the current volume
      updateVolumeSlider();
      
    } catch (e) {
      console.error(`Error playing ${soundKey}:`, e);
      // Try the other method
      useHowl = !useHowl;
      playSound(soundKey);
    }
  }
  
  // Stop a specific sound
  function stopSound(soundKey) {
    if (!soundKey) return;
    
    console.log(`Stopping ${soundKey}`);
    
    try {
      // Stop both implementations to be safe
      if (audioElements[soundKey]) {
        audioElements[soundKey].pause();
        audioElements[soundKey].currentTime = 0;
      }
      
      if (howlSounds[soundKey]) {
        howlSounds[soundKey].stop();
      }
    } catch (e) {
      console.error(`Error stopping ${soundKey}:`, e);
    }
  }
  
  // Stop all sounds
  function stopAllSounds() {
    Object.keys(AUDIO_FILES).forEach(stopSound);
    currentSound = null;
  }
  
  // Set volume for all audio
  function setVolume(volume) {
    currentVolume = volume;
    console.log(`Setting volume to ${volume}`);
    
    // Update volume for all audio elements
    Object.values(audioElements).forEach(audio => {
      audio.volume = volume;
    });
    
    // Update volume for all Howl instances
    Object.values(howlSounds).forEach(howl => {
      howl.volume(volume);
    });
    
    // Save to localStorage
    localStorage.setItem('volume', volume);
    
    // Update the volume slider
    updateVolumeSlider();
  }
  
  // Update the volume slider to match the current volume
  function updateVolumeSlider() {
    const volSlider = document.getElementById('volumeSlider');
    if (volSlider) {
      volSlider.value = currentVolume;
    }
  }
  
  // Toggle between HTML5 Audio and Howl
  function toggleAudioImplementation() {
    useHowl = !useHowl;
    console.log(`Switched to ${useHowl ? 'Howl' : 'HTML5 Audio'}`);
    
    // If currently playing something, restart it with the new implementation
    if (currentSound) {
      const sound = currentSound;
      stopSound(sound);
      setTimeout(() => playSound(sound), 50);
    }
  }
  
  // Set active button
  function setActiveButton(clickedButton) {
    document.querySelectorAll('button[data-type="sound"]').forEach(btn => {
      btn.classList.remove('active');
    });
    if (clickedButton) {
      clickedButton.classList.add('active');
    }
  }
  
  // Initialize on load
  init();
  
  // Public API
  return {
    play: playSound,
    stop: stopAllSounds,
    setVolume: setVolume,
    toggleImplementation: toggleAudioImplementation,
    getCurrentVolume: () => currentVolume,
    getCurrentSound: () => currentSound
  };
})();

// Set up UI controls when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, setting up audio controls");
  
  // Initialize volume from localStorage or use default
  const savedVolume = localStorage.getItem('volume');
  if (savedVolume !== null) {
    window.AudioManagerInstance.setVolume(parseFloat(savedVolume));
  } else {
    window.AudioManagerInstance.setVolume(0.3); // Default volume
  }
  
  // Hook up sound buttons
  document.querySelectorAll('button[data-type="sound"]').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log("Sound button clicked:", btn.textContent.trim());
      const soundKey = btn.getAttribute('data-sound').replace('.mp3', '');
      window.AudioManagerInstance.play(soundKey);
    });
  });

  // Hook up the volume slider
  const volSlider = document.getElementById('volumeSlider');
  if (volSlider) {
    // Set initial value
    volSlider.value = window.AudioManagerInstance.getCurrentVolume();
    
    volSlider.addEventListener('input', e => {
      const volume = parseFloat(e.target.value);
      window.AudioManagerInstance.setVolume(volume);
    });
  }
  
  // Autoplay last selected sound or default to rain
  const savedSound = localStorage.getItem('selectedSound');
  const soundToPlay = savedSound || 'rain'; // Default to rain if no saved preference
  
  console.log("Autoplay sound:", soundToPlay);
  
  // Play immediately but with a very short delay to ensure DOM is ready
  setTimeout(() => {
    window.AudioManagerInstance.play(soundToPlay);
  }, 100);
}); 
