# 3주차: 빛과 그림자, 그리고 질감

## 🎯 학습 목표

- 물리 기반 렌더링(PBR)과 MeshStandardMaterial의 원리 이해
- 3D 그래픽스에서의 조명 이론과 다양한 조명 시스템 구현
- 실시간 그림자 렌더링의 4단계 파이프라인 마스터
- 텍스처 매핑과 프로그래매틱 텍스처 생성 기법
- GPU 메모리 관리와 텍스처 최적화 전략

## 📚 조명과 재질의 과학

### 1. 물리 기반 렌더링 (PBR) 이론

#### 빛과 물질의 상호작용

현실 세계에서 우리가 보는 모든 것은 **빛의 반사와 흡수**의 결과입니다:

```javascript
// 실제 물리 공식 (Fresnel 방정식)
// F(θ) = F₀ + (1 - F₀)(1 - cos θ)⁵

// Three.js에서의 PBR 구현
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff, // 기본 색상 (albedo)
  roughness: 0.5, // 표면 거칠기 (0: 거울, 1: 완전 거침)
  metalness: 0.0, // 금속성 (0: 유전체, 1: 금속)
  envMapIntensity: 1.0, // 환경 반사 강도

  // 고급 속성들
  emissive: 0x000000, // 자체 발광
  transparent: false, // 투명도
  alphaTest: 0.5, // 알파 테스트 임계값
  side: THREE.FrontSide, // 렌더링할 면
});
```

#### MeshBasicMaterial vs MeshStandardMaterial 심화

| 속성          | MeshBasicMaterial | MeshStandardMaterial |
| ------------- | ----------------- | -------------------- |
| **조명 계산** | 없음 (고정 색상)  | 물리 기반 BRDF 계산  |
| **GPU 연산**  | 매우 적음         | 중간 수준            |
| **현실감**    | 낮음 (만화/UI용)  | 높음 (사실적)        |
| **그림자**    | 지원 안함         | 완전 지원            |
| **반사**      | 없음              | 환경 반사 지원       |

#### BRDF (Bidirectional Reflectance Distribution Function)

물체 표면에서 빛이 어떻게 반사되는지를 수학적으로 표현:

```javascript
// 단순화된 PBR BRDF 공식
// BRDF = Diffuse + Specular
// Diffuse = albedo / π
// Specular = D * G * F / (4 * NdotL * NdotV)

// Three.js에서 자동으로 계산되지만, 이해를 위한 예시
function calculatePBR(normal, lightDir, viewDir, roughness, metalness, albedo) {
  const NdotL = Math.max(0, normal.dot(lightDir));
  const NdotV = Math.max(0, normal.dot(viewDir));

  // 디퓨즈 컴포넌트 (Lambert)
  const diffuse = albedo.multiplyScalar(NdotL / Math.PI);

  // 스페큘러 컴포넌트 (Cook-Torrance)
  const halfVector = lightDir.clone().add(viewDir).normalize();
  const NdotH = Math.max(0, normal.dot(halfVector));

  // 거칠기에 따른 분포 함수
  const alpha = roughness * roughness;
  const alpha2 = alpha * alpha;
  const denom = NdotH * NdotH * (alpha2 - 1) + 1;
  const D = alpha2 / (Math.PI * denom * denom);

  return diffuse.add(specular);
}
```

### 2. 조명 시스템 완전 분석

#### 조명의 물리학적 기초

##### 1. AmbientLight (환경광)

```javascript
// 균등한 전역 조명 - 그림자 없음
const ambientLight = new THREE.AmbientLight(
  0x404040, // 색상 (회색)
  0.4 // 강도 (40%)
);

// 물리적 의미: 대기 중 산란된 빛
// 사용법: 어두운 그림자 영역을 밝게 만드는 기본 조명
scene.add(ambientLight);
```

##### 2. DirectionalLight (방향성 조명)

```javascript
// 태양과 같은 평행광 - 무한 거리
const directionalLight = new THREE.DirectionalLight(
  0xffffff, // 색상 (흰색)
  1.0 // 강도 (100%)
);

// 위치는 방향만 의미 (거리 무관)
directionalLight.position.set(10, 10, 5);

// 그림자 설정 (고급)
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.setScalar(2048);

// 그림자 카메라 (직교 투영)
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

// 그림자 품질 향상
directionalLight.shadow.bias = -0.0001; // 그림자 여드름 방지
directionalLight.shadow.normalBias = 0.02; // 법선 기반 바이어스
```

##### 3. PointLight (점 조명)

```javascript
// 전구와 같은 점광원 - 모든 방향으로 발산
const pointLight = new THREE.PointLight(
  0xff6b6b, // 색상 (빨간색)
  0.8, // 강도 (80%)
  20, // 거리 (20 유닛에서 0이 됨)
  2 // 감쇠 지수 (기본값 2 = 물리적으로 정확)
);

pointLight.position.set(-5, 5, 5);
pointLight.castShadow = true;

// 거리 감쇠 공식: intensity / (distance² * decay + 1)
```

##### 4. SpotLight (스포트 조명)

```javascript
// 원뿔 모양의 집중 조명
const spotLight = new THREE.SpotLight(
  0xffffff, // 색상
  1.0, // 강도
  30, // 거리
  Math.PI / 6, // 각도 (30도)
  0.5, // 가장자리 감쇠
  2 // 거리 감쇠
);

spotLight.position.set(0, 10, 0);
spotLight.target.position.set(0, 0, 0); // 조명 방향
```

#### 조명 조합 전략

**3점 조명 기법 (Three-Point Lighting)**

```javascript
// 1. 키 라이트 (주조명) - 60% 강도
const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
keyLight.position.set(5, 5, 2);

// 2. 필 라이트 (보조조명) - 30% 강도, 반대편
const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
fillLight.position.set(-3, 3, 2);

// 3. 백 라이트 (역광) - 40% 강도, 뒤에서
const backLight = new THREE.DirectionalLight(0xffa500, 0.4);
backLight.position.set(0, 3, -5);

// 4. 환경광 (전체 밝기) - 20% 강도
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
```

### 3. 그림자 시스템 마스터

#### 그림자 렌더링의 4단계 파이프라인

```javascript
// 1단계: Renderer 그림자 활성화
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 부드러운 그림자

// 그림자 맵 타입 비교
const shadowTypes = {
  BasicShadowMap: "빠름, 날카로운 가장자리",
  PCFShadowMap: "중간, 기본 부드러움",
  PCFSoftShadowMap: "느림, 매우 부드러움",
  VSMShadowMap: "고급, 반투명 그림자 지원",
};

// 2단계: 조명에서 그림자 생성 설정
light.castShadow = true;
light.shadow.mapSize.width = 2048; // 해상도 (높을수록 선명)
light.shadow.mapSize.height = 2048;

// 3단계: 객체에서 그림자 투사 설정
mesh.castShadow = true;

// 4단계: 객체에서 그림자 수신 설정
floor.receiveShadow = true;
```

#### 그림자 품질 최적화

```javascript
// 동적 그림자 해상도 조절
class DynamicShadowManager {
  constructor(light, baseResolution = 1024) {
    this.light = light;
    this.baseResolution = baseResolution;
    this.currentResolution = baseResolution;
  }

  updateQuality(cameraDistance, performanceFPS) {
    // 거리에 따른 해상도 조절
    const distanceFactor = Math.max(0.5, Math.min(2.0, 10 / cameraDistance));

    // 성능에 따른 해상도 조절
    const performanceFactor = performanceFPS > 30 ? 1.0 : 0.5;

    const newResolution =
      this.baseResolution * distanceFactor * performanceFactor;

    if (Math.abs(newResolution - this.currentResolution) > 128) {
      this.currentResolution = Math.pow(
        2,
        Math.round(Math.log2(newResolution))
      );
      this.light.shadow.mapSize.setScalar(this.currentResolution);
      this.light.shadow.map = null; // 강제 재생성
    }
  }
}
```

#### 그림자 최적화 기법

```javascript
// 1. 그림자 카메라 최적화
function optimizeShadowCamera(light, scene) {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // 그림자 카메라를 장면에 맞게 조정
  light.shadow.camera.left = -size.x / 2;
  light.shadow.camera.right = size.x / 2;
  light.shadow.camera.top = size.y / 2;
  light.shadow.camera.bottom = -size.y / 2;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = size.z * 2;

  light.shadow.camera.updateProjectionMatrix();
}

// 2. 단계별 그림자 (Cascaded Shadow Maps)
class CascadedShadows {
  constructor(light, camera, distances = [5, 15, 50]) {
    this.mainLight = light;
    this.camera = camera;
    this.cascades = distances.map((distance) => this.createCascade(distance));
  }

  createCascade(maxDistance) {
    const light = this.mainLight.clone();
    light.shadow.camera.far = maxDistance;
    return light;
  }

  update() {
    // 카메라 거리에 따라 적절한 캐스케이드 선택
    const distance = this.camera.position.length();
    const cascade =
      this.cascades.find((c) => c.shadow.camera.far >= distance) ||
      this.cascades[0];
    return cascade;
  }
}
```

### 4. 텍스처 시스템 심화

#### 텍스처 매핑의 수학적 원리

```javascript
// UV 좌표 → 텍스처 픽셀 변환
// u, v ∈ [0, 1] → 텍스처 좌표 (0, 0)은 좌하단, (1, 1)은 우상단
function uvToTextureCoord(u, v, textureWidth, textureHeight) {
  const x = Math.floor(u * textureWidth) % textureWidth;
  const y = Math.floor((1 - v) * textureHeight) % textureHeight; // Y축 뒤집기
  return { x, y };
}

// 텍스처 래핑 모드
const wrapModes = {
  RepeatWrapping: "반복 (타일링)",
  ClampToEdgeWrapping: "가장자리 고정",
  MirroredRepeatWrapping: "거울 반복",
};
```

#### 프로그래매틱 텍스처 생성

```javascript
// 고급 텍스처 생성기
class ProceduralTextures {
  static createCheckerboard(size = 512, squares = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const squareSize = size / squares;

    for (let x = 0; x < squares; x++) {
      for (let y = 0; y < squares; y++) {
        const isEven = (x + y) % 2 === 0;
        ctx.fillStyle = isEven ? '#ffffff' : '#cccccc';
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createNoise(size = 256, scale = 50) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(size, size);

    // Perlin Noise 근사
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const value = Math.random() * 255;
        const index = (y * size + x) * 4;

        imageData.data[index] = value;     // R
        imageData.data[index + 1] = value; // G
        imageData.data[index + 2] = value; // B
        imageData.data[index + 3] = 255;   // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }

  static createGradient(size = 256, color1 = '#ff0000', color2 = '#0000ff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }
}
```

#### 텍스처 메모리 최적화

```javascript
class TextureOptimizer {
  static compress(texture, quality = 0.8) {
    if (texture.image && texture.image.width > 1024) {
      // 큰 텍스처 자동 리사이징
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const maxSize = 1024;
      const scale = Math.min(maxSize / texture.image.width, maxSize / texture.image.height);

      canvas.width = texture.image.width * scale;
      canvas.height = texture.image.height * scale;

      ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

      // 새 텍스처로 교체
      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.wrapS = texture.wrapS;
      newTexture.wrapT = texture.wrapT;
      newTexture.minFilter = texture.minFilter;
      newTexture.magFilter = texture.magFilter;

      return newTexture;
    }

    return texture;
  }

  static generateMipmaps(texture) {
    // 자동 밉맵 생성 활성화
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }
}
```

## 💡 고급 학습 포인트

### 1. 물리 기반 렌더링의 수학

- **Fresnel 방정식**: 시야각에 따른 반사 변화
- **BRDF 모델**: 빛의 산란 패턴 수식화
- **에너지 보존**: 입사광 = 반사광 + 흡수광

### 2. 조명 설계의 예술성

- **색온도**: 조명의 따뜻함/차가움 표현
- **대비와 하이라이트**: 시각적 중심점 생성
- **분위기 연출**: 조명으로 감정 표현

### 3. 그림자의 시각적 심리학

- **접지감**: 그림자로 물체의 공간감 확립
- **시간성**: 그림자 방향으로 시간대 표현
- **깊이감**: 그림자 농도로 거리감 표현

### 4. 텍스처와 성능의 균형

- **LOD 전략**: 거리별 텍스처 품질 조절
- **압축 기법**: 품질 손실 최소화
- **스트리밍**: 필요 시점에 로딩

3주차를 통해 Three.js의 시각적 표현력이 극적으로 향상되었습니다. 이제 4주차에서 사용자 인터랙션을 추가하면 완전한 3D 경험이 완성됩니다.

## Q&A
