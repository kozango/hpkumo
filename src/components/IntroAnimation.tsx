import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface IntroAnimationProps {
  onAnimationComplete?: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onAnimationComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mountainRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const logoRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number>(0);
  const animationCompleteRef = useRef<boolean>(false);

  // ブランドカラー
  const brandColors = {
    darkGreen: new THREE.Color('#0D5D56'),
    midGreen: new THREE.Color('#16A34A'),
    lightGreen: new THREE.Color('#86EFAC'),
    white: new THREE.Color('#FFFFFF'),
  };

  // 初期化
  useEffect(() => {
    console.log('IntroAnimation component initialized');
    if (!containerRef.current) return;

    // シーン、カメラ、レンダラーの設定
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // コンテナサイズに合わせる
    const updateSize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    containerRef.current.appendChild(renderer.domElement);

    // 環境光と平行光源を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // ローポリ山の作成
    createMountain();
    
    // パーティクルの作成
    createParticles();

    // アニメーションの開始
    startAnimation();

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Three.jsオブジェクトの破棄
      if (mountainRef.current) {
        mountainRef.current.geometry.dispose();
        if (Array.isArray(mountainRef.current.material)) {
          mountainRef.current.material.forEach(m => m.dispose());
        } else {
          mountainRef.current.material.dispose();
        }
      }
      
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach(m => m.dispose());
        } else {
          particlesRef.current.material.dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // ローポリ山の作成
  const createMountain = () => {
    if (!sceneRef.current) return;
    
    // ローポリ山のジオメトリ
    const geometry = new THREE.ConeGeometry(1.5, 2, 5);
    
    // 頂点をランダムに少し動かして不規則にする
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      // 頂点（山頂）はあまり動かさない
      if (vertex.y > 0.5) {
        vertex.x += (Math.random() - 0.5) * 0.1;
        vertex.z += (Math.random() - 0.5) * 0.1;
      } else {
        vertex.x += (Math.random() - 0.5) * 0.3;
        vertex.z += (Math.random() - 0.5) * 0.3;
      }
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // 法線を再計算
    geometry.computeVertexNormals();
    
    // グラデーションマテリアル
    const material = new THREE.MeshPhongMaterial({
      color: brandColors.midGreen,
      shininess: 30,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });
    
    const mountain = new THREE.Mesh(geometry, material);
    mountain.rotation.x = -Math.PI / 6; // 少し傾ける
    mountain.position.y = -0.5;
    
    mountainRef.current = mountain;
    sceneRef.current.add(mountain);
  };

  // パーティクルの作成
  const createParticles = () => {
    if (!sceneRef.current) return;
    
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // パーティクルをシーン全体に広げる
      positions[i3] = (Math.random() - 0.5) * 5;
      positions[i3 + 1] = (Math.random() - 0.5) * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: brandColors.lightGreen,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    sceneRef.current.add(particles);
  };

  // ロゴの作成（最終形態）
  const createLogo = () => {
    if (!sceneRef.current) return;
    
    const group = new THREE.Group();
    
    // 「K」の形状を作成
    const createKShape = () => {
      const kGroup = new THREE.Group();
      
      // 縦棒
      const verticalBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.6, 0.05),
        new THREE.MeshPhongMaterial({ color: brandColors.midGreen })
      );
      kGroup.add(verticalBar);
      
      // 斜め線（上）
      const upperDiagonal = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.05),
        new THREE.MeshPhongMaterial({ color: brandColors.midGreen })
      );
      upperDiagonal.position.set(0.15, 0.15, 0);
      upperDiagonal.rotation.z = -Math.PI / 4;
      kGroup.add(upperDiagonal);
      
      // 斜め線（下）
      const lowerDiagonal = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.05),
        new THREE.MeshPhongMaterial({ color: brandColors.midGreen })
      );
      lowerDiagonal.position.set(0.15, -0.15, 0);
      lowerDiagonal.rotation.z = Math.PI / 4;
      kGroup.add(lowerDiagonal);
      
      return kGroup;
    };
    
    // シンプルな山のアイコン
    const createMountainIcon = () => {
      const mountainGeometry = new THREE.BufferGeometry();
      
      // 三角形の頂点
      const vertices = new Float32Array([
        0, 0.3, 0,    // 頂点
        -0.2, 0, 0,   // 左下
        0.2, 0, 0     // 右下
      ]);
      
      mountainGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      mountainGeometry.computeVertexNormals();
      
      const mountainMaterial = new THREE.MeshPhongMaterial({
        color: brandColors.midGreen,
        side: THREE.DoubleSide
      });
      
      return new THREE.Mesh(mountainGeometry, mountainMaterial);
    };
    
    // ロゴの各パーツを配置
    const kShape = createKShape();
    kShape.position.set(-0.4, 0, 0);
    group.add(kShape);
    
    const mountainIcon = createMountainIcon();
    mountainIcon.position.set(0.4, 0, 0);
    group.add(mountainIcon);
    
    // 全体を小さくして位置調整
    group.scale.set(0.5, 0.5, 0.5);
    group.position.set(0, 1.5, 0);
    
    // 最初は非表示
    group.visible = false;
    
    logoRef.current = group;
    sceneRef.current.add(group);
  };

  // アニメーションの開始
  const startAnimation = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    
    // ロゴを作成
    createLogo();
    
    // アニメーションのタイムライン
    const timeline = gsap.timeline({
      onComplete: () => {
        animationCompleteRef.current = true;
        
        // カスタムイベントを発火
        const event = new CustomEvent('introAnimationComplete');
        window.dispatchEvent(event);
        
        // コールバックがあれば実行
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    });
    
    // 山のアニメーション
    if (mountainRef.current) {
      // 初期状態
      mountainRef.current.scale.set(0.01, 0.01, 0.01);
      mountainRef.current.rotation.y = 0;
      
      // 出現アニメーション
      timeline.to(mountainRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.5,
        ease: "power2.out"
      }, 0);
      
      // 回転アニメーション
      timeline.to(mountainRef.current.rotation, {
        y: Math.PI * 2,
        duration: 8,
        ease: "none",
        repeat: -1
      }, 0);
      
      // 変形アニメーション（山から抽象的な形へ）
      timeline.to(mountainRef.current.position, {
        y: 0,
        duration: 2,
        ease: "power1.inOut"
      }, 1);
      
      // マテリアルの変化
      if (!Array.isArray(mountainRef.current.material)) {
        timeline.to(mountainRef.current.material, {
          opacity: 0.7,
          duration: 2,
          ease: "power1.inOut"
        }, 1);
        
        timeline.to(mountainRef.current.material.color, {
          r: brandColors.lightGreen.r,
          g: brandColors.lightGreen.g,
          b: brandColors.lightGreen.b,
          duration: 2,
          ease: "power1.inOut"
        }, 3);
      }
      
      // 山からロゴへの変形
      timeline.to(mountainRef.current.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.5,
        ease: "power2.in"
      }, 6);
      
      timeline.to(mountainRef.current.position, {
        y: 1.5,
        duration: 1.5,
        ease: "power2.in"
      }, 6);
    }
    
    // パーティクルのアニメーション
    if (particlesRef.current) {
      // 初期状態
      particlesRef.current.visible = true;
      
      // 動きのアニメーション
      timeline.to(particlesRef.current.rotation, {
        y: Math.PI * 2,
        duration: 10,
        ease: "none",
        repeat: -1
      }, 0);
      
      // フェードアウト
      if (!Array.isArray(particlesRef.current.material)) {
        timeline.to(particlesRef.current.material, {
          opacity: 0,
          duration: 1,
          ease: "power2.in"
        }, 6.5);
      }
    }
    
    // ロゴのアニメーション
    if (logoRef.current) {
      // 6秒後に表示
      timeline.set(logoRef.current, {
        visible: true
      }, 6);
      
      // スケールアニメーション
      timeline.from(logoRef.current.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)"
      }, 6);
      
      // 最終位置へ移動
      timeline.to(logoRef.current.position, {
        y: 0.5,
        duration: 1,
        ease: "power2.out"
      }, 7.5);
    }
    
    // レンダリングループ
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // パーティクルの動き
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // アニメーション完了後、フレームレートを下げる
      if (animationCompleteRef.current) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(animate);
        }, 100); // 10fpsくらいに
      }
    };
    
    animate();
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-10 pointer-events-none transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
};

export default IntroAnimation;
