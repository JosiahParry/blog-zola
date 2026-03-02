// Handle sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('[data-drawer-toggle]');
  const sidebar = document.getElementById('default-sidebar');

  if (!toggleButton || !sidebar) return;

  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (isMobile &&
        !sidebar.contains(e.target) &&
        !toggleButton.contains(e.target) &&
        !sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
    }
  });

  // Close sidebar when clicking links on mobile
  sidebar.addEventListener('click', (e) => {
    const isMobile = window.innerWidth < 640;
    if (isMobile && e.target.tagName === 'A') {
      sidebar.classList.add('-translate-x-full');
    }
  });
});
