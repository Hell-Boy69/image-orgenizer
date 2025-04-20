// DOM Elements
const searchInput = document.getElementById('search');
const gallery = document.getElementById('gallery');
const groupList = document.getElementById('group-list');

// Fixed: Search input bug
searchInput.addEventListener('focus', () => {
  searchInput.style.border = '2px solid #4CAF50';
});

searchInput.addEventListener('blur', () => {
  searchInput.style.border = '1px solid #ddd';
});

// Image Preview
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('image-thumbnail')) {
    const modal = document.getElementById('preview-modal');
    const img = modal.querySelector('img');
    img.src = e.target.dataset.fullpath;
    modal.style.display = 'block';
    
    // Setup modal buttons
    document.getElementById('copy-btn').onclick = async () => {
      const dest = await window.api.openFolder();
      if (dest) {
        await window.api.copyImage({
          src: img.src,
          dest: dest
        });
        window.api.showToast('Image copied!');
      }
    };

    document.getElementById('delete-btn').onclick = async () => {
      await window.api.deleteImage(img.src);
      modal.style.display = 'none';
      window.api.showToast('Image deleted!');
      loadImages(); // Refresh gallery
    };
  }
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('preview-modal').style.display = 'none';
});