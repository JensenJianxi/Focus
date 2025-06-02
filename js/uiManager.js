document.addEventListener('DOMContentLoaded', () => {
  // Fullscreen functionality
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Auto-hide controls after inactivity
  const controlBar = document.getElementById('control-bar');
  let hideTimeout;
  
  function showControls() {
    controlBar.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      controlBar.style.opacity = '0.2';
    }, 5000); // fade controls after 5 seconds of no movement
  }

  // Show controls on mouse movement
  document.addEventListener('mousemove', showControls);
  
  // Show controls on touch (for mobile)
  document.addEventListener('touchstart', showControls);
  
  // Add active class style for buttons
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .ctrl-btn.active {
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
        transform: scale(1.05);
      }
    </style>
  `);

  // Initialize controls visibility
  controlBar.style.opacity = '0.2';
  controlBar.style.transition = 'opacity 0.5s';
  showControls();
}); 