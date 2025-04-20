const selectImagesBtn = document.getElementById('selectImages');
const saveImagesBtn = document.getElementById('saveImages');
const loadImagesBtn = document.getElementById('loadImages');
const fileList = document.getElementById('fileList');
const imageGallery = document.getElementById('imageGallery');

let selectedImagePaths = [];

selectImagesBtn.addEventListener('click', async () => {
  const paths = await window.electronAPI.pickImages();
  if (paths) {
    selectedImagePaths = paths;
    fileList.innerHTML = paths.map(p => `<li>${p}</li>`).join('');
  }
});

saveImagesBtn.addEventListener('click', async () => {
  const groupName = document.getElementById('groupName').value.trim();
  if (!groupName || selectedImagePaths.length === 0) return alert('Enter group name and select images.');
  await window.electronAPI.saveImages(groupName, selectedImagePaths);
  alert('Images saved!');
  fileList.innerHTML = '';
  selectedImagePaths = [];
});

loadImagesBtn.addEventListener('click', async () => {
  const groupName = document.getElementById('searchGroup').value.trim();
  if (!groupName) return alert('Enter group name to search.');
  const images = await window.electronAPI.loadImages(groupName);
  if (images.length === 0) return alert('No images found.');
  imageGallery.innerHTML = images.map(src => `<img src="${src}" />`).join('');
});
