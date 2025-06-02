// Time display implementation - v3.1
console.log("Loading time-display.js v3.1");

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatHour(hour) {
  // Use the global format setting from format-toggle.js
  if (window.use24HourFormat) {
    return pad2(hour);
  } else {
    // Convert to 12-hour format
    const h12 = hour % 12 || 12; // 0 becomes 12
    return String(h12);
  }
}

function getAmPm(hour) {
  return hour >= 12 ? 'PM' : 'AM';
}

function updateTimeDisplay() {
  const now = new Date();               // uses your machine's local TZ
  const hh = now.getHours();            // 0–23
  const mm = now.getMinutes();          // 0–59
  
  // Get the clock element
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;
  
  // Format the time based on the current format setting
  if (window.use24HourFormat) {
    clockEl.innerHTML = `${formatHour(hh)}<span class="time-separator">:</span>${pad2(mm)}`;
  } else {
    clockEl.innerHTML = `${formatHour(hh)}<span class="time-separator">:</span>${pad2(mm)}<span class="am-pm">${getAmPm(hh)}</span>`;
  }
  
  // Check if we need to animate (minute changed)
  var lastMinute = clockEl.getAttribute('data-last-minute');
  if (lastMinute !== String(mm)) {
    clockEl.classList.add('pop-animate');
    setTimeout(() => clockEl.classList.remove('pop-animate'), 300);
    clockEl.setAttribute('data-last-minute', String(mm));
  }
}

// Initialize the clock when the DOM is ready
window.addEventListener('DOMContentLoaded', function() {
  console.log("Time display initialized");
  
  // Add CSS for the time separator and AM/PM indicator
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .time-separator {
        opacity: 0.8;
        display: inline-block;
        animation: pulse 2s infinite;
      }
      
      .am-pm {
        font-size: 0.3em;
        vertical-align: super;
        margin-left: 0.5rem;
        opacity: 0.8;
      }
      
      @keyframes pulse {
        0% { opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { opacity: 0.8; }
      }
    </style>
  `);
  
  // Draw immediately, then refresh every 1,000 ms (1 second)
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
}); 