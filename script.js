// 获取DOM元素
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const targetFormat = document.getElementById('targetFormat');
const sizeSlider = document.getElementById('sizeSlider');
const currentQuality = document.getElementById('currentQuality');
const sizeControl = document.querySelector('.size-control');

// 存储原始图片数据
let originalImage = null;
let convertedImage = null;
let originalConvertedImage = null;

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件拖拽处理
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007AFF';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#CECED2';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#CECED2';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 文件选择处理
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            // 显示原图预览
            displayOriginalImage();
            // 更新原图信息
            updateOriginalInfo(file);
            // 启用转换按钮
            convertBtn.disabled = false;
        };
    };
    reader.readAsDataURL(file);
}

// 显示原图预览
function displayOriginalImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    
    uploadArea.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    uploadArea.appendChild(img);
}

// 更新原图信息
function updateOriginalInfo(file) {
    document.getElementById('originalFormat').textContent = file.type.split('/')[1].toUpperCase();
    document.getElementById('originalSize').textContent = formatFileSize(file.size);
}

// 修改转换图片函数
convertBtn.addEventListener('click', () => {
    if (!originalImage) return;
    
    // 保存原始图片用于后续调整
    originalConvertedImage = originalImage;
    
    // 重置滑块到中间位置（100%，即原始大小）
    sizeSlider.value = 100;
    currentQuality.textContent = '100%';
    
    // 执行初始转换
    performConversion(1); // 初始比例为1，即原��大小
    
    // 显示大小控制
    sizeControl.style.display = 'block';
    
    // 启用下载按钮
    downloadBtn.disabled = false;
});

// 执行转换的函数
function performConversion(scale) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算新的尺寸
    const newWidth = Math.floor(originalImage.width * scale);
    const newHeight = Math.floor(originalImage.height * scale);
    
    // 设置画布尺寸
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // 使用更好的缩放算法
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制调整后的图片
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    
    // 转换格式
    const format = targetFormat.value;
    const mimeType = `image/${format}`;
    
    // 对于JPEG和WEBP格式，使用较高质量以保证清晰度
    if (format === 'jpeg' || format === 'webp') {
        convertedImage = canvas.toDataURL(mimeType, 0.9);
    } else {
        convertedImage = canvas.toDataURL(mimeType);
    }
    
    // 显示转换后的图片
    displayConvertedImage();
    
    // 更新转换后的信息
    updateConvertedInfo();
}

// 添加显示转换后图片的函数
function displayConvertedImage() {
    const previewArea = document.getElementById('previewArea');
    previewArea.innerHTML = '';
    const img = document.createElement('img');
    img.src = convertedImage;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    previewArea.appendChild(img);
}

// 更新转换后信息的函数
function updateConvertedInfo() {
    // 更新格式信息
    document.getElementById('convertedFormat').textContent = targetFormat.value.toUpperCase();
    
    // 计算转换后的文件大小
    const base64str = convertedImage.split(',')[1];
    const strLength = base64str.length;
    const fileSize = Math.floor((strLength - (strLength / 8) * 2) / 3) * 4;
    
    // 更新大小信息
    document.getElementById('convertedSize').textContent = formatFileSize(fileSize);
}

// 下载转换后的图片
downloadBtn.addEventListener('click', () => {
    if (!convertedImage) return;
    
    const link = document.createElement('a');
    link.download = `converted.${targetFormat.value}`;
    link.href = convertedImage;
    link.click();
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 修改HTML中的滑块范围
document.getElementById('sizeSlider').setAttribute('min', '10');  // 最小10%
document.getElementById('sizeSlider').setAttribute('max', '200'); // 最大200%
document.getElementById('sizeSlider').setAttribute('value', '100'); // 默认100%

// 修改滑块标签
document.querySelector('.size-labels').innerHTML = `
    <span>10%</span>
    <span id="currentQuality">100%</span>
    <span>200%</span>
`;

// 监听质量滑块变化
sizeSlider.addEventListener('input', () => {
    // 更新显示的百分比
    currentQuality.textContent = `${sizeSlider.value}%`;
    
    // 立即执行转换
    const scale = sizeSlider.value / 100;
    performConversion(scale);
}); 