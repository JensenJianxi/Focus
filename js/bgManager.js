// Enhanced Background Manager - v2.0
console.log("Loading Enhanced Background Manager v2.0");

document.addEventListener('DOMContentLoaded', () => {
  console.log("Setting up background manager");
  const bgVideo = document.getElementById('bg-video');
  const bgContainer = document.getElementById('background-container');
  
  // Track loading state
  let isChangingBackground = false;
  
  // Preload videos to improve switching speed
  const videoCache = {};
  
  // Preload all videos
  function preloadVideos() {
    console.log("Starting video preload");
    
    // Get all background options
    document.querySelectorAll('button[data-type="bg"]').forEach(btn => {
      const bgName = btn.getAttribute('data-bg');
      preloadVideo(bgName);
    });
  }
  
  // Preload a specific video
  function preloadVideo(filename) {
    if (videoCache[filename]) {
      console.log(`Video ${filename} already preloaded`);
      return videoCache[filename];
    }
    
    console.log(`Preloading video: ${filename}`);
    const videoPath = `assets/background/${filename}`;
    
    // Create a video element for preloading
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.src = videoPath;
    
    // Start loading
    video.load();
    
    // Store in cache
    videoCache[filename] = video;
    
    return video;
  }
  
  // Add error handling for video
  bgVideo.addEventListener('error', (e) => {
    console.error('Video error:', e);
    // Fallback to a static background if video fails
    bgContainer.style.backgroundColor = '#0a1a2a';
    isChangingBackground = false;
  });
  
  // Set active class on clicked background button
  function setActiveButton(clickedButton) {
    document.querySelectorAll('button[data-type="bg"]').forEach(btn => {
      btn.classList.remove('active');
    });
    if (clickedButton) {
      clickedButton.classList.add('active');
    }
  }

  // Switch to a new background
  function switchBackground(newBgFile) {
    // Prevent multiple rapid switches
    if (isChangingBackground) {
      console.log("Background change already in progress, ignoring request");
      return;
    }
    
    isChangingBackground = true;
    console.log(`Switching to background: ${newBgFile}`);
    
    // Fade out current video
    bgVideo.classList.add('fade-out');
    
    // Store selection in localStorage
    localStorage.setItem('selectedBackground', newBgFile);
    
    // Use the preloaded video if available
    let newVideoSrc = `assets/background/${newBgFile}`;
    let preloadedVideo = videoCache[newBgFile];
    
    // Short delay to allow fade-out to start
    setTimeout(() => {
      // If we have a preloaded version, use its source
      if (preloadedVideo) {
        console.log(`Using preloaded video for ${newBgFile}`);
        bgVideo.src = preloadedVideo.src;
      } else {
        console.log(`No preloaded video for ${newBgFile}, loading directly`);
        bgVideo.src = newVideoSrc;
      }
      
      // Force load
      bgVideo.load();
      
      // Play when ready
      bgVideo.oncanplay = () => {
        console.log(`Video ${newBgFile} can play, starting playback`);
        bgVideo.play()
          .then(() => {
            console.log(`Video ${newBgFile} playing successfully`);
            bgVideo.classList.remove('fade-out');
            isChangingBackground = false;
          })
          .catch(err => {
            console.error('Video play error:', err);
            bgVideo.classList.remove('fade-out');
            isChangingBackground = false;
          });
        
        // Remove the event handler to avoid multiple triggers
        bgVideo.oncanplay = null;
      };
      
      // Handle errors
      bgVideo.onerror = (e) => {
        console.error(`Error loading video ${newBgFile}:`, e);
        bgContainer.style.backgroundColor = '#0a1a2a';
        bgVideo.classList.remove('fade-out');
        isChangingBackground = false;
        
        // Remove the event handler
        bgVideo.onerror = null;
      };
      
      // Set a timeout in case the video never loads
      setTimeout(() => {
        if (isChangingBackground) {
          console.warn(`Video ${newBgFile} taking too long to load, resetting state`);
          bgVideo.classList.remove('fade-out');
          isChangingBackground = false;
        }
      }, 5000);
      
    }, 100); // Reduced from 500ms to 100ms for faster transitions
  }

  // Hook up background selection buttons
  document.querySelectorAll('button[data-type="bg"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const newBg = btn.getAttribute('data-bg');
      setActiveButton(btn);
      switchBackground(newBg);
    });
  });
  
  // Load previously selected background if available
  const savedBackground = localStorage.getItem('selectedBackground');
  if (savedBackground) {
    console.log(`Loading saved background: ${savedBackground}`);
    
    // Set active button
    const button = document.querySelector(`button[data-bg="${savedBackground}"]`);
    if (button) {
      setActiveButton(button);
    }
    
    // Set the initial source directly (no transition needed)
    bgVideo.src = `assets/background/${savedBackground}`;
    
    // Play when ready
    bgVideo.oncanplay = () => {
      console.log("Initial video can play");
      bgVideo.play().catch(e => console.warn('Initial autoplay prevented:', e));
      bgVideo.oncanplay = null;
    };
    
    bgVideo.onerror = (e) => {
      console.error('Failed to load initial video:', e);
      bgContainer.style.backgroundColor = '#0a1a2a';
      bgVideo.onerror = null;
    };
    
    // Start loading
    bgVideo.load();
  }
  
  // Start preloading videos after a short delay
  setTimeout(preloadVideos, 1000);
}); 