// Time format toggle functionality - v1.1
console.log("Loading format-toggle.js v1.1");

// Global variable to track format state
window.use24HourFormat = true;

// Function to toggle between 12-hour and 24-hour formats
window.toggleTimeFormat = function() {
  console.log("Toggle time format called");
  window.use24HourFormat = !window.use24HourFormat;
  
  // Update the toggle button text
  const toggleBtn = document.getElementById('timeFormatToggle');
  if (toggleBtn) {
    toggleBtn.textContent = window.use24HourFormat ? '24h' : '12h';
    toggleBtn.classList.toggle('active');
    
    // Save preference to localStorage
    try {
      localStorage.setItem('use24HourFormat', window.use24HourFormat);
    } catch (e) {
      console.error("Could not save to localStorage:", e);
    }
    
    // Update the clock immediately if updateTimeDisplay exists
    if (typeof updateTimeDisplay === 'function') {
      updateTimeDisplay();
    }
  }
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("Format toggle initializing");
  
  // Set up the button
  const setupButton = function() {
    const toggleBtn = document.getElementById('timeFormatToggle');
    if (!toggleBtn) {
      console.error("Toggle button not found");
      return;
    }
    
    console.log("Setting up toggle button");
    
    // Load saved preference from localStorage
    try {
      const savedFormat = localStorage.getItem('use24HourFormat');
      if (savedFormat !== null) {
        window.use24HourFormat = savedFormat === 'true';
        toggleBtn.textContent = window.use24HourFormat ? '24h' : '12h';
        if (!window.use24HourFormat) {
          toggleBtn.classList.add('active');
        }
      }
    } catch (e) {
      console.error("Could not read from localStorage:", e);
    }
    
    // Make sure onclick is set
    if (!toggleBtn.getAttribute('onclick')) {
      toggleBtn.setAttribute('onclick', 'toggleTimeFormat()');
    }
    
    // Also add event listener as a backup
    toggleBtn.addEventListener('click', function(e) {
      console.log("Toggle button clicked via event listener");
      e.preventDefault(); // Prevent any default action
      e.stopPropagation(); // Stop event bubbling
      window.toggleTimeFormat();
    });
  };
  
  // Set up immediately and after a delay
  setupButton();
  setTimeout(setupButton, 500);
  
  // Also set up when window is fully loaded
  window.addEventListener('load', setupButton);
}); 