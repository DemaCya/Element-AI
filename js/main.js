// js/main.js
let starSystem;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('star-canvas');
    const loading = document.getElementById('loading');
    
    try {
        // 初始化星盘系统
        starSystem = new StarSystem(canvas);
        
        // 隐藏加载界面
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 1500);
    } catch (error) {
        console.error('星盘初始化失败:', error);
        loading.innerHTML = '<div class="loader">加载失败，请刷新页面重试</div>';
    }
});

// 导出供其他模块使用
window.starSystem = starSystem;