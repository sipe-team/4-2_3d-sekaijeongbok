# 1주차: 3D 렌더링의 첫걸음

## 🎯 학습 목표

- Three.js의 핵심 아키텍처와 WebGL의 추상화 원리 이해
- Scene, Camera, Renderer의 3대 요소와 렌더링 파이프라인 학습
- 3D 좌표계와 변환 행렬의 수학적 기초 습득
- Mesh 시스템(Geometry + Material)의 구조적 이해
- 메모리 관리와 dispose 패턴을 통한 성능 최적화 기초

## 📚 Three.js 기초 이론

### 1. WebGL과 Three.js의 관계

#### WebGL의 복잡성

**WebGL**은 웹에서 3D 그래픽을 구현하는 로우레벨 API입니다. 하지만 순수 WebGL은 매우 복잡합니다:

```javascript
// 순수 WebGL (수백 줄의 복잡한 코드)
const vertexShaderSource = `
  attribute vec4 a_position;
  uniform mat4 u_matrix;
  void main() {
    gl_Position = u_matrix * a_position;
  }
`;
// 셰이더 컴파일, 버퍼 생성, 행렬 계산...

// Three.js (간단한 추상화)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0080 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

#### Three.js의 핵심 철학

1. **선언적 프로그래밍**: "무엇을" 그릴지만 명시
2. **객체 지향 설계**: 모든 것이 Object3D 기반 계층 구조
3. **수학적 추상화**: 복잡한 3D 수학을 직관적 API로 제공

### 2. Three.js의 3대 요소 심화

#### Scene (장면) - Scene Graph 관리자

**Scene**은 단순한 컨테이너가 아닌 **Scene Graph** 트리 구조를 관리합니다:

```
Scene (root)
├── Group (차량)
│   ├── Mesh (차체)
│   ├── Mesh (바퀴1-4)
│   └── Group (엔진부품들)
├── DirectionalLight (태양)
└── PerspectiveCamera (관찰자)
```

**Scene의 핵심 속성들:**

```javascript
const scene = new THREE.Scene();

// 배경 설정
scene.background = new THREE.Color(0x87CEEB); // 단색
// 또는
scene.background = cubeTextureLoader.load([...]); // 스카이박스

// 안개 효과 (거리감 연출)
scene.fog = new THREE.Fog(0x87CEEB, 10, 1000);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0025); // 지수 안개
```

#### Camera (카메라) - 투영 변환의 핵심

**투영의 수학적 원리:**

##### PerspectiveCamera (원근 투영)

```javascript
// 3D → 2D 투영 공식: sx = (x * fov) / z, sy = (y * fov) / z

const camera = new THREE.PerspectiveCamera(
  75, // FOV: 35°(망원) 50°(표준) 75°(광각) 120°(초광각)
  aspect, // 종횡비
  0.1, // Near: 너무 작으면 Z-fighting
  1000 // Far: 너무 크면 정밀도 손실
);

// FOV에 따른 시각적 효과
const narrowFOV = 35; // 압축된 느낌, 망원렌즈
const normalFOV = 50; // 자연스러운 시야
const wideFOV = 75; // 웅장한 느낌, 광각렌즈
```

##### OrthographicCamera (직교 투영)

```javascript
// 거리에 무관한 일정 크기 (CAD, 2D 게임용)
const orthoCamera = new THREE.OrthographicCamera(
  -width / 2,
  width / 2,
  height / 2,
  -height / 2,
  0.1,
  1000
);

// 사용 사례: CAD 도면, 2D 게임, UI 요소
```

#### Renderer (렌더러) - GPU 렌더링 엔진

```javascript
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true, // 계단 현상 제거
  alpha: true, // 투명 배경 지원
  powerPreference: "high-performance", // GPU 성능 우선
});

// 품질 최적화
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
```

### 3. 3D 좌표계와 변환 수학

#### 좌표계 이해

Three.js는 **오른손 좌표계** 사용:

- **X축**: 오른쪽 양수 (빨간색)
- **Y축**: 위쪽 양수 (초록색)
- **Z축**: 화면 밖 양수 (파란색)

```javascript
// 좌표계 시각화
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

#### 변환 행렬 (Transformation Matrix)

3D 객체의 변환은 **4×4 행렬**로 표현:

```
[Sx·cos(θ)  -Sy·sin(θ)   0   Tx]
[Sx·sin(θ)   Sy·cos(θ)   0   Ty]
[    0           0       Sz  Tz]
[    0           0       0    1]
```

```javascript
// 직접 조작
mesh.position.set(2, 3, 1); // Translation (이동)
mesh.rotation.set(0, Math.PI / 4, 0); // Rotation (회전)
mesh.scale.set(2, 1, 1); // Scale (크기)

// 행렬 직접 조작 (고급)
const matrix = new THREE.Matrix4();
matrix.makeRotationY(Math.PI / 4);
mesh.setRotationFromMatrix(matrix);
```

### 4. Mesh 시스템 완전 이해

#### Geometry (형태) - 3D 형상의 정의

**Geometry**는 정점(Vertices), 면(Faces), UV 좌표를 포함:

```javascript
// BufferGeometry 직접 생성 (삼각형 예시)
const geometry = new THREE.BufferGeometry();

// 정점 데이터 (3개씩 x, y, z)
const vertices = new Float32Array([
  -1.0,
  -1.0,
  1.0, // 정점 0
  1.0,
  -1.0,
  1.0, // 정점 1
  1.0,
  1.0,
  1.0, // 정점 2
]);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

// 법선 벡터 (조명 계산용)
const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

// UV 좌표 (텍스처 매핑용)
const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
```

**주요 내장 Geometry들:**

- `BoxGeometry(width, height, depth)`: 직육면체
- `SphereGeometry(radius, widthSegments, heightSegments)`: 구
- `PlaneGeometry(width, height)`: 평면
- `CylinderGeometry()`: 원기둥
- `TorusGeometry()`: 도넛

#### Material (재질) - 표면 속성 정의

**MeshBasicMaterial**의 특징:

- 조명 영향 없음 (항상 동일한 색상)
- 가장 빠른 렌더링 속도
- 단순한 색상/텍스처만 표시

```javascript
const material = new THREE.MeshBasicMaterial({
  color: 0xff6b6b,
  transparent: true, // 투명도 활성화
  opacity: 0.8, // 투명도 값
  side: THREE.DoubleSide, // 양면 렌더링
  wireframe: true, // 와이어프레임 모드
  vertexColors: true, // 정점 색상 사용
});
```

#### Mesh = Geometry + Material

```javascript
const mesh = new THREE.Mesh(geometry, material);

// 계층 구조 관리
mesh.add(childMesh); // 자식 추가
mesh.remove(childMesh); // 자식 제거
mesh.traverse((child) => {
  // 모든 자식 순회
  if (child instanceof THREE.Mesh) {
    child.material.wireframe = true;
  }
});
```

### 5. 렌더링 파이프라인 이해

#### GPU 렌더링 과정

1. **Vertex Processing**: 정점 변환 (월드 → 뷰 → 프로젝션)
2. **Primitive Assembly**: 삼각형 조립
3. **Rasterization**: 픽셀 단위 분해
4. **Fragment Processing**: 픽셀 색상 계산
5. **Output Merging**: 최종 이미지 조합

```javascript
// 렌더링 루프의 내부 동작
function render() {
  // 1. 객체 변환 행렬 업데이트
  mesh.updateMatrix();
  mesh.updateMatrixWorld();

  // 2. 카메라 투영 행렬 계산
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  // 3. GPU로 렌더링 명령 전송
  renderer.render(scene, camera);
}
```

### 6. 메모리 관리와 성능 최적화

#### Dispose 패턴의 중요성

**WebGL 리소스는 JavaScript GC가 자동 정리하지 않습니다:**

```javascript
// 올바른 메모리 정리
function disposeObject(obj) {
  if (obj.geometry) {
    obj.geometry.dispose();
  }

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat) => mat.dispose());
    } else {
      obj.material.dispose();
    }
  }

  // 텍스처도 정리
  if (obj.material?.map) {
    obj.material.map.dispose();
  }
}

// Scene 전체 정리
function disposeScene(scene) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      disposeObject(child);
    }
  });

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}
```

#### 성능 최적화 기법

```javascript
// 1. Object Pooling (객체 재사용)
class ObjectPool {
  constructor(createFn, resetFn) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
  }

  get() {
    return this.pool.pop() || this.createFn();
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 2. 성능 모니터링
console.log("Draw calls:", renderer.info.render.calls); // 적을수록 좋음
console.log("Triangles:", renderer.info.render.triangles); // 많으면 LOD 고려
console.log("Geometries:", renderer.info.memory.geometries);
console.log("Textures:", renderer.info.memory.textures);
```

## Q&A

#### Q1: WebGL을 직접 배우지 않고 Three.js부터 시작해도 괜찮아?

**A**: 네, 오히려 권장합니다. Three.js는 WebGL의 복잡성을 추상화한 라이브러리로, 3D 그래픽스의 핵심 개념을 이해하는 데 집중할 수 있게 해줍니다. WebGL을 직접 다루려면 셰이더 프로그래밍, 버퍼 관리, 행렬 계산 등을 모두 수동으로 해야 하지만, Three.js는 이런 복잡한 부분을 캡슐화해서 **"무엇을 그릴지"**에만 집중할 수 있게 해줍니다.

```javascript
// WebGL 직접 사용 (수백 줄 필요)
const program = createShaderProgram(gl, vertexShader, fragmentShader);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// ... 복잡한 설정들

// Three.js (간단한 추상화)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0080 })
);
```

#### Q2: Scene, Camera, Renderer가 왜 3대 요소라고 불려?

**A**: 이 세 요소는 3D 렌더링의 **필수 불가결한 구성요소**이기 때문입니다:

- **Scene**: "무엇을 그릴 것인가?" - 모든 3D 객체들의 컨테이너
- **Camera**: "어디서 볼 것인가?" - 관찰자의 시점과 투영 방식 정의
- **Renderer**: "어떻게 그릴 것인가?" - 실제 화면에 픽셀로 변환

이 중 하나라도 없으면 렌더링이 불가능합니다. 마치 영화 촬영에서 **무대(Scene), 카메라(Camera), 스크린(Renderer)**이 모두 필요한 것과 같은 원리입니다.

#### Q3: PerspectiveCamera와 OrthographicCamera는 언제 써?

**A**: 각각 다른 목적에 최적화되어 있습니다:

**PerspectiveCamera (원근 투영)**:

```javascript
// 게임, VR, 자연스러운 3D 뷰어
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
// → 멀리 있는 객체가 작게 보임 (현실과 동일)
```

**OrthographicCamera (직교 투영)**:

```javascript
// CAD, 건축 도면, 2D 게임, UI
const camera = new THREE.OrthographicCamera(
  -w / 2,
  w / 2,
  h / 2,
  -h / 2,
  0.1,
  1000
);
// → 거리에 관계없이 모든 객체가 동일한 크기
```

### 🛠️ 구현 관련 질문

#### Q4: Geometry와 Material 중에 성능에 더 큰 영향을 주는 건 뭐야?

**A**: **Material**이 일반적으로 더 큰 영향을 줍니다:

```javascript
// Geometry는 주로 메모리 사용량에 영향
const simpleGeo = new THREE.BoxGeometry(1, 1, 1); // 24개 정점
const complexGeo = new THREE.SphereGeometry(1, 64, 64); // 4,162개 정점

// Material은 픽셀 셰이더 성능에 직접적 영향
const fastMaterial = new THREE.MeshBasicMaterial(); // 조명 계산 없음
const slowMaterial = new THREE.MeshPhysicalMaterial(); // 복잡한 PBR 계산
```

**성능 우선순위**:

1. Material 복잡도 (픽셀 셰이더)
2. Draw calls 수 (객체 개수)
3. Geometry 복잡도 (정점 수)

#### Q5: dispose()를 호출하지 않으면 정확히 무슨 일이 일어나는거야?

**A**: **GPU 메모리 누수**가 발생합니다. JavaScript의 가비지 컬렉터는 GPU 리소스를 정리할 수 없기 때문입니다:

```javascript
// 🚨 메모리 누수 패턴
for (let i = 0; i < 1000; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  // dispose() 호출 없음 → GPU 메모리 1000개 누적
}

// ✅ 올바른 패턴
const geometry = new THREE.BoxGeometry(1, 1, 1); // 하나만 생성
const material = new THREE.MeshBasicMaterial();

for (let i = 0; i < 1000; i++) {
  const mesh = new THREE.Mesh(geometry, material); // 같은 리소스 재사용
  scene.add(mesh);
}
// 마지막에 geometry.dispose(), material.dispose() 한 번만
```

#### Q6: FOV(Field of View) 값에 따라서 실제로 어떻게 달라 보여?

**A**: FOV는 렌즈의 성격을 결정합니다:

```javascript
// 망원렌즈 효과 (압축된 느낌)
const telephoto = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
// → 배경과 전경의 거리감 압축, 인물 사진에 적합

// 표준 렌즈 (자연스러운 시야)
const normal = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
// → 인간의 시야와 가장 유사

// 광각렌즈 (웅장한 느낌)
const wideAngle = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
// → 넓은 시야, 건축물이나 풍경에 적합

// 어안렌즈 (왜곡 심함)
const fisheye = new THREE.PerspectiveCamera(120, aspect, 0.1, 1000);
// → 극단적 왜곡, 특수 효과용
```

### 🐛 문제 해결

#### Q7: 화면이 검게 나오는데 뭘 먼저 확인해야 해?

**A**: **체크리스트 순서대로** 확인하세요:

```javascript
// 1. 카메라 위치 확인 (가장 흔한 원인)
console.log("Camera position:", camera.position);
// → (0, 0, 0)이면 Scene 중심에 카메라가 있어서 객체 내부에 있을 수 있음

// 2. 객체 위치 확인
console.log("Object position:", mesh.position);
// → 카메라와 같은 위치에 있으면 보이지 않음

// 3. 카메라 방향 확인
camera.lookAt(0, 0, 0); // 원점을 바라보도록 설정

// 4. Near/Far 범위 확인
console.log("Camera near/far:", camera.near, camera.far);
// → 객체가 이 범위 밖에 있으면 보이지 않음

// 5. Scene에 추가되었는지 확인
console.log("Scene children:", scene.children.length);

// 6. MeshStandardMaterial 사용 시 조명 확인
const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light);
```

#### Q8: 성능이 갑자기 떨어졌을 때 어떻게 디버깅해?

**A**: **renderer.info**를 활용한 성능 프로파일링:

```javascript
function debugPerformance() {
  console.log("=== 성능 디버그 정보 ===");
  console.log("Draw calls:", renderer.info.render.calls);
  // → 100개 이상이면 배칭 최적화 필요

  console.log("Triangles:", renderer.info.render.triangles);
  // → 50만개 이상이면 LOD(Level of Detail) 고려

  console.log("Geometries:", renderer.info.memory.geometries);
  console.log("Textures:", renderer.info.memory.textures);
  // → 계속 증가하면 메모리 누수 의심

  // 프레임 레이트 측정
  const stats = new Stats();
  document.body.appendChild(stats.dom);
}

// 렌더링 루프에서 호출
function animate() {
  debugPerformance();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### 🚀 심화 이해

#### Q9: 변환 행렬을 직접 조작해야 하는 경우는 언제야?

**A**: **고급 애니메이션**이나 **물리 시뮬레이션**에서 필요합니다:

```javascript
// 일반적인 경우 (충분함)
mesh.position.set(x, y, z);
mesh.rotation.set(rx, ry, rz);

// 행렬 직접 조작이 필요한 경우
// 1. 복잡한 변환 조합
const matrix = new THREE.Matrix4();
matrix
  .makeRotationY(angle)
  .setPosition(x, y, z)
  .scale(new THREE.Vector3(sx, sy, sz));
mesh.setRotationFromMatrix(matrix);

// 2. 물리 엔진 연동
const physicsMatrix = physicsBody.getWorldTransform();
mesh.matrix.copy(physicsMatrix);
mesh.matrixAutoUpdate = false; // 수동 행렬 업데이트

// 3. 인스턴스드 렌더링
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
const matrix = new THREE.Matrix4();
for (let i = 0; i < count; i++) {
  matrix.setPosition(x, y, z);
  instancedMesh.setMatrixAt(i, matrix);
}
```

#### Q10: Object3D 계층 구조는 실제로 어떻게 활용해?

**A**: **논리적 그룹화**와 **상속적 변환**에 활용합니다:

```javascript
// 자동차 모델링 예시
const car = new THREE.Group(); // 루트 그룹

// 차체
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
car.add(body);

// 바퀴들 (차체에 상대적으로 위치)
const wheels = new THREE.Group();
const wheelPositions = [
  [-1, 0, 1],
  [1, 0, 1],
  [-1, 0, -1],
  [1, 0, -1],
];
wheelPositions.forEach((pos) => {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.set(...pos);
  wheels.add(wheel);
});
car.add(wheels);

// 애니메이션 시 계층적 변환
car.position.x += speed; // 전체 자동차 이동
wheels.children.forEach((wheel) => {
  wheel.rotation.x += wheelSpeed; // 바퀴만 회전
});

// 장점: 차체가 회전하면 바퀴도 함께 회전, 개별 바퀴 애니메이션도 가능
```

#### Q11: MeshBasicMaterial vs MeshLambertMaterial vs MeshPhongMaterial 차이점이 뭐야?

**A**: **조명 모델**의 복잡도와 **성능**의 트레이드오프입니다:

```javascript
// 조명 없음 (가장 빠름)
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// → 항상 동일한 색상, UI나 디버깅용

// Lambert 반사 (확산 반사만)
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
// → 부드러운 음영, 매트한 표면 표현

// Phong 반사 (확산 + 정반사)
const phongMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  shininess: 100,
});
// → 반짝이는 하이라이트, 금속이나 플라스틱 표현

// 성능 순서: Basic > Lambert > Phong > Standard > Physical
```

#### Q12: Scene Graph 트리 구조를 traverse()로 순회할 때 어떻게 활용해?

**A**: **일괄 처리**와 **조건부 작업**에 매우 유용합니다:

```javascript
// 패턴 1: 특정 타입 객체 찾기
scene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    child.material.wireframe = true; // 모든 메시를 와이어프레임으로
  }
  if (child instanceof THREE.Light) {
    child.intensity *= 0.5; // 모든 조명 밝기 절반으로
  }
});

// 패턴 2: 이름으로 객체 찾기
const weapon = scene.getObjectByName("sword");
const enemies = [];
scene.traverse((child) => {
  if (child.name.startsWith("enemy_")) {
    enemies.push(child);
  }
});

// 패턴 3: 거리 기반 LOD (Level of Detail)
const cameraPosition = camera.position;
scene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    const distance = child.position.distanceTo(cameraPosition);
    if (distance > 100) {
      child.visible = false; // 멀리 있는 객체 숨기기
    } else if (distance > 50) {
      child.material.wireframe = true; // 중간 거리는 와이어프레임
    }
  }
});

// 패턴 4: 애니메이션 일괄 적용
scene.traverse((child) => {
  if (child.userData.animatable) {
    child.rotation.y += 0.01; // 애니메이션 가능한 객체만 회전
  }
});
```

#### Q13: 3D → 2D 투영 공식 `sx = (x * fov) / z, sy = (y * fov) / z`는 어떤 방식으로 계산하는 거야?

**A**: 이 공식은 **원근 투영(Perspective Projection)**의 핵심 수학입니다. 3D 공간의 점을 2D 화면에 투영하는 과정을 설명합니다:

```javascript
// 원근 투영의 기본 원리
/*
멀리 있는 물체는 작게 보이고, 가까이 있는 물체는 크게 보인다.
이를 수학적으로 표현하면 거리(z)에 반비례한다.

실제 Three.js 내부 계산:
1. FOV를 라디안으로 변환
2. 투영 행렬 생성
3. 정점마다 투영 변환 적용
*/

// 간단한 투영 계산 예시
function projectTo2D(x, y, z, fov, aspect, near, far) {
  // 1. FOV를 라디안으로 변환
  const fovRad = (fov * Math.PI) / 180;
  const f = 1.0 / Math.tan(fovRad / 2);

  // 2. 정규화된 디바이스 좌표로 변환
  const ndcX = (x * f) / (aspect * z);
  const ndcY = (y * f) / z;

  // 3. 화면 좌표로 변환
  const screenX = (ndcX + 1) * 0.5 * canvasWidth;
  const screenY = (1 - ndcY) * 0.5 * canvasHeight;

  return { x: screenX, y: screenY };
}

// 실제 투영 행렬 (4x4 Matrix)
const projectionMatrix = new THREE.Matrix4().makePerspective(
  -aspect * near,
  aspect * near, // left, right
  -near,
  near, // bottom, top
  near,
  far // near, far
);
```

**핵심 포인트**:

- **z값이 클수록** (멀리 있을수록) → **sx, sy가 작아짐** (작게 보임)
- **FOV가 클수록** → **더 넓은 시야각** (광각 렌즈 효과)
- 이 계산은 **GPU의 버텍스 셰이더**에서 자동으로 처리됩니다

#### Q14: WebGLRenderer 옵션 값들에 대한 구체적인 설명

**A**: WebGLRenderer의 각 옵션은 **렌더링 품질**과 **성능**에 직접적인 영향을 줍니다:

```javascript
const renderer = new THREE.WebGLRenderer({
  // 🎯 기본 설정
  canvas: document.getElementById("canvas"), // 렌더링할 캔버스 지정
  context: null, // 기존 WebGL 컨텍스트 재사용 (성능 최적화)

  // 🎨 화질 관련
  antialias: true,
  // → true: 계단 현상(aliasing) 제거, 부드러운 모서리
  // → false: 성능 우선, 픽셀 단위 선명함

  alpha: true,
  // → true: 투명 배경 지원 (HTML과 합성 가능)
  // → false: 불투명 배경 (성능 약간 향상)

  premultipliedAlpha: true,
  // → true: 알파 프리멀티플라이 (표준)
  // → false: 일반 알파 블렌딩

  // ⚡ 성능 관련
  powerPreference: "high-performance",
  // → "high-performance": 전용 GPU 사용
  // → "low-power": 내장 GPU 사용 (배터리 절약)
  // → "default": 브라우저가 자동 선택

  precision: "highp",
  // → "highp": 높은 정밀도 (모바일에서 지원 안될 수 있음)
  // → "mediump": 중간 정밀도 (모바일 호환성 좋음)
  // → "lowp": 낮은 정밀도 (매우 빠름)

  // 🛡️ 호환성 관련
  preserveDrawingBuffer: false,
  // → true: 렌더링 버퍼 보존 (스크린샷 가능)
  // → false: 성능 최적화 (일반적으로 사용)

  failIfMajorPerformanceCaveat: false,
  // → true: 성능이 너무 나쁘면 실패
  // → false: 소프트웨어 렌더링이라도 실행

  // 🎪 고급 설정
  logarithmicDepthBuffer: false,
  // → true: 극도로 넓은 범위의 깊이값 처리 (천문학적 규모)
  // → false: 일반적인 깊이 버퍼 (대부분의 경우)

  stencil: true,
  // → true: 스텐실 버퍼 사용 (복잡한 마스킹)
  // → false: 스텐실 버퍼 비활성화 (메모리 절약)
});

// 렌더러 생성 후 추가 설정
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 고해상도 디스플레이 대응
renderer.setSize(window.innerWidth, window.innerHeight); // 캔버스 크기
renderer.outputColorSpace = THREE.SRGBColorSpace; // 색공간 설정
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 톤 매핑
renderer.toneMappingExposure = 1.0; // 노출값
```

**성능 vs 품질 가이드라인**:

```javascript
// 고품질 설정 (데스크톱, 고사양)
const highQuality = {
  antialias: true,
  powerPreference: "high-performance",
  precision: "highp",
};

// 성능 우선 설정 (모바일, 저사양)
const performanceFirst = {
  antialias: false,
  powerPreference: "low-power",
  precision: "mediump",
};
```

#### Q15: Mesh를 사용하는 게 일반적이야? Mesh를 사용하는 주된 이유는?

**A**: 네, **Mesh는 3D 그래픽스의 핵심이자 가장 일반적인 방식**입니다. 주된 이유들:

```javascript
// Mesh = Geometry + Material 조합의 장점

// 1. 🎯 명확한 관심사 분리
const geometry = new THREE.BoxGeometry(1, 1, 1); // "형태"만 정의
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // "표면"만 정의
const mesh = new THREE.Mesh(geometry, material); // 둘을 조합

// 2. 🔄 재사용성 극대화
const sharedGeometry = new THREE.SphereGeometry(1, 32, 32);
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// 같은 형태, 다른 재질
const redSphere = new THREE.Mesh(sharedGeometry, redMaterial);
const blueSphere = new THREE.Mesh(sharedGeometry, blueMaterial);

// 3. 🚀 성능 최적화
// 하나의 Geometry를 여러 Mesh에서 공유 → 메모리 절약
// GPU에서 동일한 버텍스 데이터 재사용 가능

// 4. 🎨 유연한 렌더링 제어
mesh.visible = false; // 숨기기/보이기
mesh.castShadow = true; // 그림자 생성
mesh.receiveShadow = true; // 그림자 받기
mesh.frustumCulled = false; // 컬링 제어
```

**Mesh 외의 다른 렌더링 방식들과 비교**:

```javascript
// 🌟 Points - 점 구름 렌더링
const points = new THREE.Points(geometry, pointsMaterial);
// → 사용 사례: 별자리, 파티클 시스템, 포인트 클라우드

// 🔗 Line - 선 렌더링
const line = new THREE.Line(geometry, lineMaterial);
// → 사용 사례: 와이어프레임, 그래프, 경로 표시

// 🎪 InstancedMesh - 대량 인스턴스 렌더링
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);
// → 사용 사례: 풀, 나무, 건물 등 동일한 객체 대량 배치

// 📊 Sprite - 2D 이미지 (항상 카메라를 바라봄)
const sprite = new THREE.Sprite(spriteMaterial);
// → 사용 사례: UI 요소, 빌보드, 라벨
```

**Mesh가 선호되는 이유**:

1. **직관적**: 현실 세계의 물체와 가장 유사한 표현
2. **범용적**: 거의 모든 3D 객체를 표현 가능
3. **최적화됨**: GPU 가속, 백페이스 컬링, LOD 지원
4. **생태계**: 풍부한 Material, Geometry 라이브러리

#### Q16: BufferGeometry는 뭐야?

**A**: **BufferGeometry는 Three.js의 현대적인 지오메트리 시스템**으로, GPU에 최적화된 방식으로 3D 형상 데이터를 저장합니다:

```javascript
// 전통적인 Geometry vs 현대적인 BufferGeometry

// ❌ 구식 Geometry (Three.js r125에서 제거됨)
// - 자바스크립트 객체로 정점 저장
// - 메모리 사용량 많음, 속도 느림
// const oldGeometry = new THREE.Geometry();

// ✅ 현재 BufferGeometry (권장)
// - TypedArray로 정점 저장
// - GPU 직접 전송 최적화
const geometry = new THREE.BufferGeometry();

// 핵심 구조: Attribute 시스템
// - position: 정점 위치 (x, y, z)
// - normal: 법선 벡터 (조명 계산용)
// - uv: 텍스처 좌표 (텍스처 매핑용)
// - color: 정점 색상 (선택적)
```

**BufferGeometry 생성 방법들**:

```javascript
// 1. 🏗️ 수동 생성 (완전한 제어)
const geometry = new THREE.BufferGeometry();

// 정점 데이터 (삼각형 예시)
const vertices = new Float32Array([
  -1.0,
  -1.0,
  1.0, // 정점 0
  1.0,
  -1.0,
  1.0, // 정점 1
  1.0,
  1.0,
  1.0, // 정점 2
]);

// 법선 벡터 (각 정점마다)
const normals = new Float32Array([
  0,
  0,
  1, // 정점 0의 법선
  0,
  0,
  1, // 정점 1의 법선
  0,
  0,
  1, // 정점 2의 법선
]);

// UV 좌표 (텍스처 매핑용)
const uvs = new Float32Array([
  0.0,
  0.0, // 정점 0의 UV
  1.0,
  0.0, // 정점 1의 UV
  1.0,
  1.0, // 정점 2의 UV
]);

// BufferAttribute로 등록
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3)); // 3개씩 그룹 (x,y,z)
geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2)); // 2개씩 그룹 (u,v)

// 2. 🎁 내장 지오메트리 사용 (편리함)
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
// → 내부적으로 BufferGeometry 기반

// 3. 🔄 기존 지오메트리 변환
const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.translate(1, 0, 0); // 이동
geometry.rotateX(Math.PI / 4); // 회전
geometry.scale(2, 1, 1); // 크기 조절
```

**BufferGeometry의 핵심 장점**:

```javascript
// 🚀 성능 최적화
console.log("Vertices count:", geometry.attributes.position.count);
console.log("Memory usage:", geometry.attributes.position.array.byteLength);

// 💾 메모리 효율성
// - Float32Array 사용 → 자바스크립트 객체보다 50-70% 메모리 절약
// - GPU 직접 전송 → 복사 오버헤드 없음

// 🔧 동적 수정 가능
const positions = geometry.attributes.position.array;
for (let i = 0; i < positions.length; i += 3) {
  positions[i + 1] += Math.sin(time) * 0.1; // Y 좌표 웨이브 애니메이션
}
geometry.attributes.position.needsUpdate = true; // GPU에 변경 알림
```

**실제 사용 패턴**:

```javascript
// 대부분의 경우: 내장 지오메트리 사용
const geometry = new THREE.SphereGeometry(1, 32, 32);

// 특수한 경우: 커스텀 지오메트리 생성
const customGeometry = new THREE.BufferGeometry();
// → 지형, 파티클 시스템, 절차적 생성 등
```

#### Q17: 법선 벡터, UV 좌표에 대해 자세히 설명해줘

**A**: **법선 벡터**와 **UV 좌표**는 3D 렌더링의 핵심 구성요소입니다:

### 🧭 법선 벡터 (Normal Vector)

**법선 벡터는 표면에 수직인 방향 벡터**로, 조명 계산의 핵심입니다:

```javascript
// 법선 벡터의 역할
/*
1. 🔆 조명 계산: 빛이 표면에 어떻게 반사되는지 결정
2. 🎭 백페이스 컬링: 뒷면 제거로 성능 향상  
3. 🌟 셰이딩: 부드러운 음영 vs 날카로운 모서리
*/

// 삼각형의 법선 벡터 계산
function calculateNormal(v1, v2, v3) {
  // 두 벡터의 외적(Cross Product)으로 법선 계산
  const edge1 = v2.clone().sub(v1);
  const edge2 = v3.clone().sub(v1);
  const normal = edge1.cross(edge2).normalize();
  return normal;
}

// Three.js에서 법선 벡터 다루기
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 1. 자동 계산된 법선 확인
console.log("법선 벡터들:", geometry.attributes.normal.array);

// 2. 법선 재계산 (지오메트리 변경 후)
geometry.computeVertexNormals(); // 부드러운 셰이딩
// 또는
geometry.computeFaceNormals(); // 평면 셰이딩 (구식)

// 3. 법선 시각화 (디버깅용)
const normalHelper = new THREE.VertexNormalsHelper(mesh, 0.1, 0xff0000);
scene.add(normalHelper);
```

**법선 벡터와 조명의 관계**:

```javascript
// Lambert의 반사 법칙: 조명 강도 = dot(normal, lightDirection)
/*
법선과 빛 방향이:
- 평행 (0°): 최대 밝기
- 수직 (90°): 빛 없음  
- 반대 (180°): 빛 없음 (백라이트)
*/

// 셰이더에서의 조명 계산 예시
const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalMatrix * normal; // 월드 공간 법선
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  uniform vec3 lightDirection;
  
  void main() {
    float intensity = max(dot(normalize(vNormal), lightDirection), 0.0);
    gl_FragColor = vec4(vec3(intensity), 1.0);
  }
`;
```

### 🗺️ UV 좌표 (UV Coordinates)

**UV 좌표는 3D 표면을 2D 텍스처에 매핑하는 좌표계**입니다:

```javascript
// UV 좌표의 이해
/*
U: 텍스처의 가로축 (0.0 ~ 1.0)
V: 텍스처의 세로축 (0.0 ~ 1.0)

(0,0) = 텍스처 왼쪽 하단
(1,1) = 텍스처 오른쪽 상단
*/

// 정육면체의 UV 매핑 예시
const geometry = new THREE.BoxGeometry(1, 1, 1);
const uvs = geometry.attributes.uv.array;

// UV 좌표 직접 설정
const customUVs = new Float32Array([
  // 각 면마다 4개 정점의 UV 좌표
  0.0,
  0.0,
  0.25,
  0.0,
  0.25,
  1.0,
  0.0,
  1.0, // 앞면
  0.25,
  0.0,
  0.5,
  0.0,
  0.5,
  1.0,
  0.25,
  1.0, // 오른쪽면
  // ... 나머지 면들
]);

geometry.setAttribute("uv", new THREE.BufferAttribute(customUVs, 2));
```

**UV 매핑의 다양한 기법**:

```javascript
// 1. 🎯 평면 매핑 (Planar Mapping)
function planarUVMapping(geometry, direction = "z") {
  const positions = geometry.attributes.position.array;
  const uvs = [];

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Z축 기준 평면 투영
    const u = (x + 1) * 0.5; // -1~1 → 0~1
    const v = (y + 1) * 0.5;

    uvs.push(u, v);
  }

  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
}

// 2. 🌐 구면 매핑 (Spherical Mapping)
function sphericalUVMapping(geometry) {
  const positions = geometry.attributes.position.array;
  const uvs = [];

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // 구면 좌표계로 변환
    const radius = Math.sqrt(x * x + y * y + z * z);
    const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
    const v = 0.5 - Math.asin(y / radius) / Math.PI;

    uvs.push(u, v);
  }

  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
}

// 3. 🔄 UV 애니메이션
function animateUV(geometry, time) {
  const uvs = geometry.attributes.uv.array;

  for (let i = 0; i < uvs.length; i += 2) {
    uvs[i] += 0.01; // U 좌표 이동 (스크롤 효과)
    if (uvs[i] > 1.0) uvs[i] -= 1.0; // 래핑
  }

  geometry.attributes.uv.needsUpdate = true;
}
```

**텍스처와 UV의 조합**:

```javascript
// 텍스처 로딩과 UV 적용
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("brick.jpg");

// UV 매핑 제어
texture.wrapS = THREE.RepeatWrapping; // U축 반복
texture.wrapT = THREE.RepeatWrapping; // V축 반복
texture.repeat.set(2, 2); // 2x2 타일링

const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);

// UV 좌표 시각화 (디버깅용)
const uvTexture = new THREE.DataTexture(
  new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0]), // RGBA
  2,
  2,
  THREE.RGBAFormat
);
const debugMaterial = new THREE.MeshBasicMaterial({ map: uvTexture });
```

**실무 팁**:

```javascript
// UV 좌표 문제 해결
// 1. UV 범위 확인
const uvAttribute = geometry.attributes.uv;
console.log("UV 범위:", uvAttribute.array.min(), uvAttribute.array.max());

// 2. 씨음(Seam) 문제 해결
texture.generateMipmaps = false; // 밉맵 비활성화
texture.minFilter = THREE.LinearFilter;

// 3. UV 왜곡 최소화
geometry.computeBoundingBox();
const uvGenerator = new THREE.UVGenerator();
// 자동 UV 생성 로직...
```

#### Q18: 오른손 좌표계는 뭐야?

https://www.youtube.com/watch?v=0U2kcNIG1FI
