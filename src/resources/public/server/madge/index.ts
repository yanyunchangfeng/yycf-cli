const thumbnail = document.getElementById('thumbnail') as HTMLImageElement;
const fullscreenPreview = document.getElementById('fullscreen-preview') as HTMLDivElement;
const closeBtn = document.getElementById('close-btn') as HTMLSpanElement;

// 点击缩略图显示全屏预览
thumbnail.addEventListener('click', () => {
  fullscreenPreview.style.display = 'flex';
});

// 点击关闭按钮隐藏全屏预览
closeBtn.addEventListener('click', () => {
  fullscreenPreview.style.display = 'none';
});

// 点击图片或空白区域关闭全屏预览
fullscreenPreview.addEventListener('click', (event: MouseEvent) => {
  if (event.target === fullscreenPreview || event.target === closeBtn) {
    fullscreenPreview.style.display = 'none';
  }
});
