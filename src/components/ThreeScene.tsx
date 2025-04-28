import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  className?: string;
  onAnimationComplete?: () => void;
}

export default function ThreeScene({ className = '', onAnimationComplete }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number>(Date.now());
  const animationCompleteRef = useRef<boolean>(false);

  useEffect(() => {
    // すでにマウントされている場合は何もしない
    if (!mountRef.current) return;

    // シーン、カメラ、レンダラーの初期化
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 既存のcanvasがあれば削除
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 霧の効果を追加
    scene.fog = new THREE.FogExp2(0xf0f5f9, 0.05);

    // ライトの追加
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // ローポリ山の作成
    const mountainGeometries: THREE.Mesh[] = [];
    const originalVertices: { [key: string]: number[] } = {};
    
    // 第一の山 - メインの山（Kumonoブランドカラーの濃い緑）
    const mountainGeo1 = new THREE.ConeGeometry(3, 5, 8, 3); // より多くの面を持つ
    
    // 頂点をランダムに変位させてローポリ感を強調
    const positionAttribute = mountainGeo1.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    // 元の頂点位置を保存
    originalVertices['mountain1'] = [];
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      originalVertices['mountain1'].push(vertex.x, vertex.y, vertex.z);
      
      // 頂点を少しランダムに動かす（底面の頂点は除く）
      if (vertex.y > 0) {
        vertex.x += (Math.random() - 0.5) * 0.5;
        vertex.z += (Math.random() - 0.5) * 0.5;
        
        // 頂点の高さもわずかに変える
        if (vertex.y < 4.5) { // 山頂以外
          vertex.y += (Math.random() - 0.5) * 0.3;
        }
      }
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // ジオメトリの更新
    mountainGeo1.computeVertexNormals();
    positionAttribute.needsUpdate = true;
    
    const mountainMat1 = new THREE.MeshPhongMaterial({
      color: 0x15803d, // Kumonoブランドカラー（濃い緑）
      flatShading: true, // フラットシェーディングでローポリ感を強調
      transparent: true,
      opacity: 0.9,
      shininess: 30, // 光沢を追加
    });
    
    const mountain1 = new THREE.Mesh(mountainGeo1, mountainMat1);
    mountain1.position.set(-1.5, -2, 0);
    mountain1.rotation.x = Math.PI * 0.05;
    scene.add(mountain1);
    mountainGeometries.push(mountain1);
    
    // 第二の山 - 明るい緑色
    const mountainGeo2 = new THREE.ConeGeometry(2.5, 4, 7, 2);
    
    // 頂点をランダムに変位させる
    const positionAttribute2 = mountainGeo2.getAttribute('position');
    
    // 元の頂点位置を保存
    originalVertices['mountain2'] = [];
    for (let i = 0; i < positionAttribute2.count; i++) {
      vertex.fromBufferAttribute(positionAttribute2, i);
      originalVertices['mountain2'].push(vertex.x, vertex.y, vertex.z);
      
      // 頂点を少しランダムに動かす（底面の頂点は除く）
      if (vertex.y > 0) {
        vertex.x += (Math.random() - 0.5) * 0.4;
        vertex.z += (Math.random() - 0.5) * 0.4;
        
        if (vertex.y < 3.5) { // 山頂以外
          vertex.y += (Math.random() - 0.5) * 0.2;
        }
      }
      
      positionAttribute2.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    mountainGeo2.computeVertexNormals();
    positionAttribute2.needsUpdate = true;
    
    const mountainMat2 = new THREE.MeshPhongMaterial({
      color: 0x22c55e, // 明るい緑
      flatShading: true,
      transparent: true,
      opacity: 0.85,
      shininess: 20,
    });
    
    const mountain2 = new THREE.Mesh(mountainGeo2, mountainMat2);
    mountain2.position.set(0.5, -2.5, -1);
    scene.add(mountain2);
    mountainGeometries.push(mountain2);
    
    // 第三の山 - 青みがかった緑
    const mountainGeo3 = new THREE.ConeGeometry(2, 3.5, 6, 2);
    
    // 頂点をランダムに変位させる
    const positionAttribute3 = mountainGeo3.getAttribute('position');
    
    // 元の頂点位置を保存
    originalVertices['mountain3'] = [];
    for (let i = 0; i < positionAttribute3.count; i++) {
      vertex.fromBufferAttribute(positionAttribute3, i);
      originalVertices['mountain3'].push(vertex.x, vertex.y, vertex.z);
      
      // 頂点を少しランダムに動かす（底面の頂点は除く）
      if (vertex.y > 0) {
        vertex.x += (Math.random() - 0.5) * 0.3;
        vertex.z += (Math.random() - 0.5) * 0.3;
        
        if (vertex.y < 3) { // 山頂以外
          vertex.y += (Math.random() - 0.5) * 0.2;
        }
      }
      
      positionAttribute3.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    mountainGeo3.computeVertexNormals();
    positionAttribute3.needsUpdate = true;
    
    const mountainMat3 = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9, // 青みがかった色
      flatShading: true,
      transparent: true,
      opacity: 0.7,
      shininess: 25,
    });
    
    const mountain3 = new THREE.Mesh(mountainGeo3, mountainMat3);
    mountain3.position.set(2, -3, -2);
    scene.add(mountain3);
    mountainGeometries.push(mountain3);

    // 雲のパーティクル - メイングループ（より多く、より目立つ）
    const cloudParticleCount = 1200; // パーティクル数を増加
    const cloudParticles: THREE.Points[] = [];
    
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(cloudParticleCount * 3);
    const cloudSizes = new Float32Array(cloudParticleCount);
    
    for (let i = 0; i < cloudParticleCount; i++) {
      const i3 = i * 3;
      cloudPositions[i3] = (Math.random() - 0.5) * 25; // 範囲を広げる
      cloudPositions[i3 + 1] = Math.random() * 12 - 3; // 高さ方向の範囲を広げる
      cloudPositions[i3 + 2] = (Math.random() - 0.5) * 25 - 5; // 奥行きの範囲を広げる
      cloudSizes[i] = Math.random() * 0.6 + 0.15; // サイズをやや大きく
    }
    
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
    cloudGeo.setAttribute('size', new THREE.BufferAttribute(cloudSizes, 1));
    
    const cloudMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35, // サイズを少し大きく
      transparent: true,
      opacity: 0.65, // 少し不透明度を上げる
      sizeAttenuation: true,
    });
    
    const cloudParticle = new THREE.Points(cloudGeo, cloudMaterial);
    scene.add(cloudParticle);
    cloudParticles.push(cloudParticle);
    
    // 雲のパーティクル - 2つ目のグループ（別方向に動く）
    const cloudParticleCount2 = 800;
    const cloudGeo2 = new THREE.BufferGeometry();
    const cloudPositions2 = new Float32Array(cloudParticleCount2 * 3);
    const cloudSizes2 = new Float32Array(cloudParticleCount2);
    
    for (let i = 0; i < cloudParticleCount2; i++) {
      const i3 = i * 3;
      cloudPositions2[i3] = (Math.random() - 0.5) * 22;
      cloudPositions2[i3 + 1] = Math.random() * 10 - 1;
      cloudPositions2[i3 + 2] = (Math.random() - 0.5) * 22 - 3;
      cloudSizes2[i] = Math.random() * 0.4 + 0.1;
    }
    
    cloudGeo2.setAttribute('position', new THREE.BufferAttribute(cloudPositions2, 3));
    cloudGeo2.setAttribute('size', new THREE.BufferAttribute(cloudSizes2, 1));
    
    const cloudMaterial2 = new THREE.PointsMaterial({
      color: 0xf8f8ff, // 少し青みがかった白
      size: 0.25,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    
    const cloudParticle2 = new THREE.Points(cloudGeo2, cloudMaterial2);
    scene.add(cloudParticle2);
    cloudParticles.push(cloudParticle2);
    
    // 雲のパーティクル - 3つ目のグループ（より小さく、速く動く）
    const cloudParticleCount3 = 600;
    const cloudGeo3 = new THREE.BufferGeometry();
    const cloudPositions3 = new Float32Array(cloudParticleCount3 * 3);
    const cloudSizes3 = new Float32Array(cloudParticleCount3);
    
    for (let i = 0; i < cloudParticleCount3; i++) {
      const i3 = i * 3;
      cloudPositions3[i3] = (Math.random() - 0.5) * 20;
      cloudPositions3[i3 + 1] = Math.random() * 8;
      cloudPositions3[i3 + 2] = (Math.random() - 0.5) * 20 - 4;
      cloudSizes3[i] = Math.random() * 0.3 + 0.05; // より小さいパーティクル
    }
    
    cloudGeo3.setAttribute('position', new THREE.BufferAttribute(cloudPositions3, 3));
    cloudGeo3.setAttribute('size', new THREE.BufferAttribute(cloudSizes3, 1));
    
    const cloudMaterial3 = new THREE.PointsMaterial({
      color: 0xfafafa,
      size: 0.2,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    
    const cloudParticle3 = new THREE.Points(cloudGeo3, cloudMaterial3);
    scene.add(cloudParticle3);
    cloudParticles.push(cloudParticle3);

    // アニメーション関数
    const animate = () => {
      // 現在の時間を取得
      const time = Date.now() * 0.001;
      const elapsedTime = (Date.now() - animationStartTimeRef.current) / 1000; // 経過時間（秒）
      
      // アニメーション完了の判定（8秒後）
      if (elapsedTime > 8 && !animationCompleteRef.current && onAnimationComplete) {
        animationCompleteRef.current = true;
        // カスタムイベントの発火
        onAnimationComplete();
        // アニメーション完了イベントをdocumentにも発火
        const event = new CustomEvent('animation-complete', { detail: { component: 'ThreeScene' } });
        document.dispatchEvent(event);
        console.log('Animation complete event fired');
      }
      
      // 山の頂点アニメーション - 「生きた」印象を出す
      mountainGeometries.forEach((mountain, index) => {
        // ゆっくりとした回転
        mountain.rotation.y += 0.0005 * (index + 1) * 0.5;
        
        // 頂点の微妙な動き
        const positions = mountain.geometry.getAttribute('position');
        const originalPositions = originalVertices[`mountain${index + 1}`];
        
        if (originalPositions) {
          for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            // 元の頂点位置を基準に微妙に動かす（底面の頂点は除く）
            if (originalPositions[i3 + 1] > 0) { // y > 0 なら底面ではない
              positions.setX(i, originalPositions[i3] + Math.sin(time + i) * 0.03);
              // 山頂以外の頂点のみ上下に動かす
              if (originalPositions[i3 + 1] < (index === 0 ? 4.5 : index === 1 ? 3.5 : 3)) {
                positions.setY(i, originalPositions[i3 + 1] + Math.cos(time * 0.8 + i) * 0.02);
              }
              positions.setZ(i, originalPositions[i3 + 2] + Math.sin(time * 1.2 + i) * 0.03);
            }
          }
          positions.needsUpdate = true;
          mountain.geometry.computeVertexNormals();
        }
      });
      
      // 雲のアニメーション - より動的に
      const now = Date.now() * 0.001;
      
      // 各パーティクルグループに異なる動きを適用
      if (cloudParticles.length > 0) {
        // 第1グループ - 基本的な回転と波打つような動き
        cloudParticles[0].rotation.z -= 0.0006;
        cloudParticles[0].rotation.x = Math.sin(now * 0.1) * 0.02;
        cloudParticles[0].position.y = Math.sin(now * 0.2) * 0.1;
      }
      
      if (cloudParticles.length > 1) {
        // 第2グループ - 反対方向の回転と異なる波のパターン
        cloudParticles[1].rotation.z += 0.0004;
        cloudParticles[1].rotation.y = Math.cos(now * 0.15) * 0.02;
        cloudParticles[1].position.x = Math.sin(now * 0.25) * 0.1;
      }
      
      if (cloudParticles.length > 2) {
        // 第3グループ - より速い回転と複合的な動き
        cloudParticles[2].rotation.z -= 0.001;
        cloudParticles[2].rotation.x = Math.sin(now * 0.3) * 0.03;
        cloudParticles[2].position.z = Math.cos(now * 0.2) * 0.15;
      }
      
      // カメラをわずかに動かす - より自然な動き
      camera.position.x = Math.sin(time * 0.3) * 0.4;
      camera.position.y = Math.cos(time * 0.2) * 0.3 + 0.2; // 少し上から見る
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // アニメーションの開始
    animate();
    
    // ウィンドウリサイズへの対応
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // メモリリーク防止のためのリソース解放
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // ジオメトリとマテリアルの解放
      mountainGeometries.forEach(mountain => {
        if (mountain.geometry) mountain.geometry.dispose();
        if ((mountain.material as THREE.Material)) (mountain.material as THREE.Material).dispose();
      });
      
      cloudParticles.forEach(particle => {
        if (particle.geometry) particle.geometry.dispose();
        if ((particle.material as THREE.Material)) (particle.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className={`w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
