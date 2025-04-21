const uploadNameInput = document.getElementById('upload-name');
const searchNameInput = document.getElementById('search-name');
const uploadBtn = document.getElementById('upload-btn');
const searchBtn = document.getElementById('search-btn');
const gallery = document.getElementById('gallery');
const settingsBtn = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const themeToggle = document.getElementById('theme-toggle');
const bgInput = document.getElementById('bg-input');
const app = document.getElementById('app');

let currentConfig = { theme: 'light', background: '' };

window.addEventListener('DOMContentLoaded', async () => {
  currentConfig = await window.electronAPI.loadConfig();
  applyConfig();
});

function applyConfig() {
  app.setAttribute('data-theme', currentConfig.theme || 'light');
  if (currentConfig.background) {
    app.style.backgroundImage = `url("${currentConfig.background}")`;
  } else {
    app.style.backgroundImage = '';
  }
}

uploadBtn.addEventListener('click', async () => {
  const folder = uploadNameInput.value.trim();
  if (!folder) return;

  const uploaded = await window.electronAPI.uploadImage(folder);
  if (uploaded.length > 0) {
    uploadNameInput.value = '';
    searchNameInput.value = '';
    gallery.innerHTML = '';
    searchImages(folder);
  }
});

searchBtn.addEventListener('click', () => {
  const folder = searchNameInput.value.trim();
  if (!folder) return;

  uploadNameInput.value = '';
  gallery.innerHTML = '';
  searchImages(folder);
});

function searchImages(folder) {
  window.electronAPI.searchImages(folder).then((images) => {
    gallery.innerHTML = '';
    images.forEach(({ name, path }) => {
      const img = document.createElement('img');
      img.src = `file://${path}`;
      img.title = name;
      img.classList.add('thumbnail');

      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(img, path);
      });

      gallery.appendChild(img);
    });
  });
}

function showContextMenu(img, path) {
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.innerHTML = `
    <div class="context-item" data-action="preview">Preview</div>
    <div class="context-item" data-action="delete">Delete</div>
    <div class="context-item" data-action="info">Info</div>
    <div class="context-item" data-action="copy">Copy</div>
  `;
  document.body.appendChild(menu);

  const { x, y } = img.getBoundingClientRect();
  menu.style.left = `${x + 10}px`;
  menu.style.top = `${y + 10}px`;

  const cleanup = () => menu.remove();
  setTimeout(() => document.addEventListener('click', cleanup, { once: true }), 50);

  menu.addEventListener('click', async (e) => {
    const action = e.target.getAttribute('data-action');
    if (action === 'preview') {
      window.open(`file://${path}`, '_blank');
    } else if (action === 'delete') {
      const result = await window.electronAPI.deleteImage(path);
      if (result.success) {
        img.remove();
      }
    } else if (action === 'info') {
      const info = await window.electronAPI.getImageInfo(path);
      alert(`Size: ${(info.size / 1024).toFixed(2)} KB\nModified: ${info.modified}`);
    } else if (action === 'copy') {
      await window.electronAPI.copyImage(path);
    }
  });
}

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

themeToggle.addEventListener('change', (e) => {
  currentConfig.theme = e.target.value;
  applyConfig();
  window.electronAPI.saveConfig(currentConfig);
});

bgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const imagePath = `file://${file.path}`;
    currentConfig.background = imagePath;
    applyConfig();
    window.electronAPI.saveConfig(currentConfig);
  }
});
