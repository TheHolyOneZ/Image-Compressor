document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const container = document.querySelector('.container');
    const progress = document.querySelector('.progress');
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');

    let loadingProgress = 0;
    const loadingInterval = setInterval(() => {
        loadingProgress += 1;
        progress.style.width = `${loadingProgress}%`;
        
        if (loadingProgress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loader.style.display = 'none';
                container.style.display = 'block';
            }, 500);
        }
    }, 20);
     
    const uploadContainer = document.querySelector('.upload-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, () => {
            uploadContainer.style.borderColor = '#fff';
            uploadContainer.style.boxShadow = '0 0 50px var(--neon-purple)';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, () => {
            uploadContainer.style.borderColor = 'var(--neon-purple)';
            uploadContainer.style.boxShadow = '0 0 30px var(--neon-purple-glow)';
        });
    });

    uploadContainer.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        imageInput.files = files;
        processImages(files);
    });

    imageInput.addEventListener('change', (e) => {
        processImages(e.target.files);
    });

    async function processImages(files) {
        preview.innerHTML = '';
        
        for (const file of files) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > 1920) {
                        height = (1920 * height) / width;
                        width = 1920;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.7;
                    if (file.size > 5000000) quality = 0.6;
                    if (file.size > 10000000) quality = 0.5;

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const compressedSize = Math.round((compressedDataUrl.length * 0.75));
                    const originalSize = file.size;
                    const percentageReduction = Math.round((1 - (compressedSize / originalSize)) * 100);
                    
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    const previewImg = document.createElement('img');
                    previewImg.src = compressedDataUrl;
                    
                    const statsDiv = document.createElement('div');
                    statsDiv.className = 'stats-container';
                    statsDiv.innerHTML = `
                        <div class="stat-row">
                            <span class="stat-label">Original:</span>
                            <span class="stat-value">${formatBytes(originalSize)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Compressed:</span>
                            <span class="stat-value">${formatBytes(compressedSize)}</span>
                        </div>
                        <div class="stat-row reduction">
                            <span class="stat-label">Reduced by:</span>
                            <span class="stat-value">${percentageReduction}%</span>
                        </div>
                    `;
                    
                    const downloadLink = document.createElement('a');
                    downloadLink.href = compressedDataUrl;
                    downloadLink.download = `compressed_${file.name}`;
                    downloadLink.className = 'download-link';
                    downloadLink.textContent = '↓ Download Compressed Image';
                    
                    previewItem.appendChild(previewImg);
                    previewItem.appendChild(statsDiv);
                    previewItem.appendChild(downloadLink);
                    preview.appendChild(previewItem);
                };
            };
            
            reader.readAsDataURL(file);
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
