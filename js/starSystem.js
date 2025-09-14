// js/starSystem.js
class StarSystem {
  // 在 StarSystem 类的构造函数中添加轨道状态管理
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planets = [];
    this.orbits = [];
    this.centralStar = null;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0, z: 0 };
    this.currentRotation = { x: 0, y: 0, z: 0 };
    this.planetSprites = []; // 新增：存储星球精灵

    // 添加轨道状态管理
    this.orbitStates = [];
    this.hoveredOrbitIndex = -1;

    // 五行元素配置
    this.elements = [
      {
        name: "金",
        color: 0xffd700,
        radius: 130,
        speed: 0.01,
        size: 8,
        imagePath: "assets/images/1024.png", // 金元素图片
      },
      {
        name: "木",
        color: 0x32cd32,
        radius: 210,
        speed: 0.008,
        size: 10,
        imagePath: "assets/images/1024.png", // 木元素图片
      },
      {
        name: "水",
        color: 0x4169e1,
        radius: 300,
        speed: 0.015,
        size: 6,
        imagePath: "assets/images/1024.png", // 水元素图片
      },
      {
        name: "火",
        color: 0xff4500,
        radius: 400,
        speed: 0.012,
        size: 7,
        imagePath: "assets/images/1024.png", // 火元素图片
      },
      {
        name: "土",
        color: 0x8b4513,
        radius: 490,
        speed: 0.006,
        size: 9,
        imagePath: "assets/images/1024.png", // 土元素图片
      },
    ];

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createBackground();
    this.createCentralStar();
    this.createPlanetsAndOrbits();
    this.setupInitialView();
    this.createAxes();
    this.setupEventListeners();
    this.loadTexturesAndCreatePlanets();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x4a2a5a, 0.0008); // 使用指数雾效，密度更高
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    // 调整相机位置让星盘往上移
    this.camera.position.set(150, 80, 600);
    this.camera.lookAt(0, -50, 0);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a0a, 1); // 淡紫色背景
  }

  createLights() {
    // 只保留很微弱的环境光
    const ambientLight = new THREE.AmbientLight(0x202020, 0.1);
    this.scene.add(ambientLight);
  }

  createBackground() {
    // 创建星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1500;
    const positions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 3000;
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  createCentralStar() {
    const geometry = new THREE.SphereGeometry(25, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff88,
    });

    this.centralStar = new THREE.Mesh(geometry, material);
    this.scene.add(this.centralStar);

    // 中心星球光晕效果
    const glowGeometry = new THREE.SphereGeometry(30, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff88,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.centralStar.add(glow);
  }

  // 修改 createPlanetsAndOrbits 方法
  // 修改 createPlanetsAndOrbits 方法（保持星球本体，但可以设为透明或更小）
  createPlanetsAndOrbits() {
    this.elements.forEach((element, index) => {
      // 创建轨道
      const orbitGeometry = new THREE.RingGeometry(
        element.radius - 2,
        element.radius + 2,
        64
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xbbbbbb,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      orbit.userData = {
        isOrbit: true,
        originalOpacity: 0.5,
        originalColor: 0xbbbbbb,
        planetIndex: index,
      };
      this.scene.add(orbit);
      this.orbits.push(orbit);

      // 初始化轨道状态
      this.orbitStates.push({
        targetOpacity: 0.5,
        currentOpacity: 0.5,
        targetColor: new THREE.Color(0xbbbbbb),
        currentColor: new THREE.Color(0xbbbbbb),
        isHovered: false,
      });

      // 创建星球本体（可以设为很小或透明，主要作为定位参考）
      const planetGeometry = new THREE.SphereGeometry(
        element.size * 0.3,
        16,
        16
      ); // 缩小星球本体
      const planetMaterial = new THREE.MeshBasicMaterial({
        color: element.color,
        transparent: true,
        opacity: 0.3, // 半透明，主要作为背景
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      // 设置行星初始位置
      const angle = (index / this.elements.length) * Math.PI * 2;
      planet.position.x = Math.cos(angle) * element.radius;
      planet.position.z = Math.sin(angle) * element.radius;

      planet.userData = {
        element: element,
        angle: angle,
        orbitRadius: element.radius,
        speed: element.speed,
      };

      this.scene.add(planet);
      this.planets.push(planet);
    });
  }
  // 新增方法：加载纹理并创建星球
  loadTexturesAndCreatePlanets() {
    const textureLoader = new THREE.TextureLoader();
    const loadPromises = [];

    // 为每个元素加载纹理
    this.elements.forEach((element, index) => {
      const promise = new Promise((resolve, reject) => {
        textureLoader.load(
          element.imagePath,
          (texture) => {
            element.texture = texture;
            resolve();
          },
          undefined,
          (error) => {
            console.warn(
              `无法加载 ${element.name} 的纹理: ${element.imagePath}，使用默认颜色`
            );
            element.texture = null;
            resolve(); // 即使加载失败也继续
          }
        );
      });
      loadPromises.push(promise);
    });

    // 所有纹理加载完成后创建星球
    Promise.all(loadPromises).then(() => {
      this.createPlanetsAndOrbits();
      this.createPlanetSprites();
    });
  }
  // 新增方法：创建星球精灵（广告牌）
  // 修改 createPlanetSprites 方法
createPlanetSprites() {
    this.elements.forEach((element, index) => {
        let spriteMaterial;
        
        if (element.texture) {
            // 如果有纹理，使用纹理
            spriteMaterial = new THREE.SpriteMaterial({
                map: element.texture,
                transparent: true,
                opacity: 0.9
            });
        } else {
            // 如果没有纹理，创建圆形纹理
            const circleTexture = this.createCircleTexture(element.color);
            spriteMaterial = new THREE.SpriteMaterial({
                map: circleTexture,
                transparent: true,
                opacity: 0.9
            });
        }
        
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // 设置精灵大小
        const spriteSize = element.size * 4;
        sprite.scale.set(spriteSize, spriteSize, 1);
        
        // 设置初始位置
        const angle = (index / this.elements.length) * Math.PI * 2;
        sprite.position.x = Math.cos(angle) * element.radius;
        sprite.position.z = Math.sin(angle) * element.radius;
        sprite.position.y = 8; // 稍微高一些
        
        // 存储精灵的运动数据
        sprite.userData = {
            element: element,
            angle: angle,
            orbitRadius: element.radius,
            speed: element.speed,
            planetIndex: index
        };
        
        this.scene.add(sprite);
        this.planetSprites.push(sprite);
    });
}
// 简单的纯色圆形纹理
createCircleTexture(color) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // 清除画布
    context.clearRect(0, 0, size, size);
    
    // 将THREE.js颜色转换为CSS颜色
    const threeColor = new THREE.Color(color);
    const cssColor = `rgb(${Math.floor(threeColor.r * 255)}, ${Math.floor(threeColor.g * 255)}, ${Math.floor(threeColor.b * 255)})`;
    
    // 绘制实心圆
    context.fillStyle = cssColor;
    context.beginPath();
    context.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    context.fill();
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

  setupInitialView() {
    // 设置初始倾斜角度
    this.scene.rotation.z = 0.2; // 向左下倾斜
    this.scene.rotation.x = 0.25; // 向屏幕下方倾斜
    this.scene.rotation.y = -0.08; // 轻微向右旋转

    // 将整个场景向上移动
    this.scene.position.y = 50;

    // 设置初始旋转值
    this.currentRotation = {
      x: this.scene.rotation.x,
      y: this.scene.rotation.y,
      z: this.scene.rotation.z,
    };
    this.targetRotation = {
      x: this.scene.rotation.x,
      y: this.scene.rotation.y,
      z: this.scene.rotation.z,
    };
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());

    // 鼠标移动事件
    this.container.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 计算倾斜角度（在初始角度基础上微调）
      this.targetRotation.x = 0.25 + this.mouse.y * 0.15;
      this.targetRotation.y = -0.08 + this.mouse.x * 0.15;
      this.targetRotation.z = 0.2 + this.mouse.x * 0.05;
    });

    const raycaster = new THREE.Raycaster();
    this.container.addEventListener("mousemove", (event) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.orbits);

      // 更新轨道状态
      if (intersects.length > 0) {
        const hoveredOrbitIndex = intersects[0].object.userData.planetIndex;
        this.updateOrbitHoverState(hoveredOrbitIndex);
      } else {
        this.updateOrbitHoverState(-1);
      }
    });
  }
  // 统一白色虚线版本
  // 统一白色系细密虚线版本
  createAxes() {
    const axesLength = 500;

    const axisMaterial = new THREE.LineDashedMaterial({
      color: 0xeeeeee, // 非常亮的白色
      linewidth: 2,
      scale: 1,
      dashSize: 2, // 短虚线段
      gapSize: 1.5, // 小间隔
      transparent: true,
      opacity: 0.8,
    });

    // 创建三条轴线
    const axes = [
      // X轴
      [
        new THREE.Vector3(-axesLength, 0, 0),
        new THREE.Vector3(axesLength, 0, 0),
      ],
      // Y轴
      [
        new THREE.Vector3(0, -axesLength, 0),
        new THREE.Vector3(0, axesLength, 0),
      ],
      // Z轴
      [
        new THREE.Vector3(0, 0, -axesLength),
        new THREE.Vector3(0, 0, axesLength),
      ],
    ];

    axes.forEach((axisPoints) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(axisPoints);
      const line = new THREE.Line(geometry, axisMaterial.clone());
      line.computeLineDistances();
      this.scene.add(line);
    });
  }
  // 修改 animate 方法，更新精灵位置
  animate() {
    requestAnimationFrame(() => this.animate());

    // 平滑倾斜动画
    this.currentRotation.x +=
      (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y +=
      (this.targetRotation.y - this.currentRotation.y) * 0.05;
    this.currentRotation.z +=
      (this.targetRotation.z - this.currentRotation.z) * 0.05;

    // 应用整体倾斜
    this.scene.rotation.x = this.currentRotation.x;
    this.scene.rotation.y = this.currentRotation.y;
    this.scene.rotation.z = this.currentRotation.z;

    // 更新轨道动画
    this.updateOrbitAnimations();

    // 行星公转动画
    this.planets.forEach((planet) => {
      planet.userData.angle += planet.userData.speed;
      planet.position.x =
        Math.cos(planet.userData.angle) * planet.userData.orbitRadius;
      planet.position.z =
        Math.sin(planet.userData.angle) * planet.userData.orbitRadius;
      planet.rotation.y += 0.02;
    });

    // 精灵公转动画（与星球同步）
    this.planetSprites.forEach((sprite) => {
      sprite.userData.angle += sprite.userData.speed;
      sprite.position.x =
        Math.cos(sprite.userData.angle) * sprite.userData.orbitRadius;
      sprite.position.z =
        Math.sin(sprite.userData.angle) * sprite.userData.orbitRadius;
      // 精灵的Y位置可以稍微高一些，确保在星球上方
      sprite.position.y = 5;

      // 精灵会自动面向摄像机，无需手动旋转
    });

    // 中心星球自转
    if (this.centralStar) {
      this.centralStar.rotation.y += 0.005;
    }

    this.renderer.render(this.scene, this.camera);
  }
  updateOrbitAnimations() {
    this.orbitStates.forEach((state, index) => {
      if (index < this.orbits.length) {
        const orbit = this.orbits[index];

        // 平滑过渡透明度
        state.currentOpacity +=
          (state.targetOpacity - state.currentOpacity) * 0.1;
        orbit.material.opacity = state.currentOpacity;

        // 平滑过渡颜色
        state.currentColor.lerp(state.targetColor, 0.1);
        orbit.material.color.copy(state.currentColor);
      }
    });
  }
  updateOrbitHoverState(hoveredIndex) {
    this.orbitStates.forEach((state, index) => {
      if (index === hoveredIndex) {
        // 悬停状态：更亮的白色，更高的透明度
        state.targetOpacity = 0.9;
        state.targetColor.setHex(0xffffff); // 纯白色
        state.isHovered = true;
      } else {
        // 非悬停状态：恢复更亮的原始状态
        state.targetOpacity = 0.5;
        state.targetColor.setHex(0xbbbbbb); // 更亮的基础颜色
        state.isHovered = false;
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
