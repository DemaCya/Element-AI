// js/controls.js
class UIControls {
    constructor(starSystem) {
        this.starSystem = starSystem;
        this.overlay = document.getElementById('ui-overlay');
    }
    
    // 添加按钮的方法
    addButton(text, position, callback) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.position = 'absolute';
        button.style.left = position.x + 'px';
        button.style.top = position.y + 'px';
        button.style.padding = '10px 20px';
        button.style.background = 'rgba(255, 255, 255, 0.1)';
        button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        button.style.color = '#fff';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.backdropFilter = 'blur(10px)';
        
        button.addEventListener('click', callback);
        this.overlay.appendChild(button);
        
        return button;
    }
}