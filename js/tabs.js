// Initialize panel-tabset tabs from Quarto
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.panel-tabset').forEach(tabset => {
    // Find all h2 elements that serve as tab headers
    const headers = Array.from(tabset.querySelectorAll('h2'));
    if (headers.length === 0) return;

    // First pass: collect all content groups before modifying DOM
    const tabGroups = headers.map((header, index) => {
      const contentElements = [];
      let nextElement = header.nextElementSibling;

      // Collect all elements until next h2 or end
      while (nextElement && nextElement.tagName !== 'H2') {
        contentElements.push(nextElement);
        nextElement = nextElement.nextElementSibling;
      }

      return {
        title: header.textContent,
        header: header,
        content: contentElements
      };
    });

    // Create tab list container
    const tabList = document.createElement('div');
    tabList.className = 'tab-list';

    // Clear tabset and add tab list first
    tabset.innerHTML = '';
    tabset.appendChild(tabList);

    // Second pass: build new structure
    tabGroups.forEach((group, index) => {
      // Create tab button
      const tabButton = document.createElement('div');
      tabButton.className = 'tab-button';
      tabButton.textContent = group.title;
      tabButton.setAttribute('data-tab-index', index);
      tabList.appendChild(tabButton);

      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'tab-content';
      contentWrapper.setAttribute('data-tab-index', index);

      // Add collected content
      group.content.forEach(element => {
        contentWrapper.appendChild(element);
      });

      tabset.appendChild(contentWrapper);
    });

    // Activate first tab
    const firstTab = tabList.querySelector('.tab-button');
    const firstContent = tabset.querySelector('.tab-content');
    if (firstTab) firstTab.classList.add('active');
    if (firstContent) firstContent.classList.add('active');

    // Add click handlers
    tabList.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-button')) {
        const index = e.target.getAttribute('data-tab-index');

        // Deactivate all tabs
        tabList.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabset.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate clicked tab
        e.target.classList.add('active');
        const content = tabset.querySelector(`.tab-content[data-tab-index="${index}"]`);
        if (content) content.classList.add('active');
      }
    });
  });
});
