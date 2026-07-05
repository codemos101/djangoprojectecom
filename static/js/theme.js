// Dark Mode Toggle Script - Global Functions

// Global function to toggle theme
window.toggleTheme = function() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
};

// Global function to update theme icon
window.updateThemeIcon = function() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
  const themeToggle = document.getElementById('themeToggle');
  
  if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'light' 
      ? '<i class="fa fa-moon-o"></i>' 
      : '<i class="fa fa-sun-o"></i>';
    themeToggle.title = currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const htmlElement = document.documentElement;
  
  // Get saved theme from localStorage or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  
  // Update toggle button icon
  updateThemeIcon();
  
  // Add click listener to all theme toggles
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
  });
});

// Ensure theme persists across page loads
window.addEventListener('load', function() {
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon();
});
