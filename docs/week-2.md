# 2주차: 장면을 살아있게 - 애니메이션과 카메라

## 🎯 학습 목표

- 컴퓨터 그래픽스에서의 애니메이션 이론과 requestAnimationFrame의 동작 원리
- 시간 기반 애니메이션과 프레임 독립적 움직임의 수학적 구현
- 3D 공간에서의 카메라 수학(구면 좌표계, 쿼터니언)과 OrbitControls 설계
- 수학 함수를 이용한 자연스러운 움직임 패턴과 Easing Functions
- 성능 모니터링과 적응적 품질 조절 시스템

## 📚 애니메이션 이론과 수학

### 1. 컴퓨터 애니메이션의 과학적 원리

#### 프레임과 시각 착시

컴퓨터 애니메이션은 **연속된 정지 이미지의 빠른 교체**로 움직임의 착시를 만듭니다:

- **영화**: 24fps, **TV**: 30/60fps, **게임**: 60fps+, **VR**: 90fps+

```javascript
// setInterval vs requestAnimationFrame 비교
// ❌ 문제가 있는 방식
setInterval(() => {
  updateObjects();
  render();
}, 16); // 약 60fps

// 문제점: 브라우저 렌더링 주기와 비동기화, 탭 비활성화 시에도 실행

// ✅ 올바른 방식
function animate(currentTime) {
  updateObjects(currentTime);
  render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 장점: 브라우저 최적화, 탭 비활성화 시 자동 중지, 적응적 프레임 레이트
```

#### 시간 기반 애니메이션의 수학

**프레임 독립적 애니메이션**을 위한 Delta Time 활용:

```javascript
// ❌ 프레임 의존적 (문제)
function updateBad() {
  object.position.x += 0.1; // 60fps에서 초당 6, 30fps에서 초당 3
}

// ✅ 시간 기반 (정확)
function updateGood(deltaTime) {
  const speed = 6; // 초당 6 단위
  object.position.x += speed * (deltaTime / 1000);
}

// THREE.Clock 구현 원리
class TimeClock {
  constructor() {
    this.startTime = performance.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
  }

  getDelta() {
    const newTime = performance.now();
    const diff = (newTime - this.oldTime) / 1000;
    this.oldTime = newTime;
    this.elapsedTime += diff;
    return diff;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }
}
```

### 2. 수학적 애니메이션 함수 시스템

#### 자연스러운 움직임을 위한 수학 함수들

```javascript
// 사인파 - 부드러운 진동
function sinusoidalMotion(time, amplitude = 1, frequency = 1) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time);
}

// 원형 운동 - 구면 좌표계
function circularMotion(time, radius = 1, speed = 1) {
  const angle = speed * time;
  return {
    x: radius * Math.cos(angle),
    z: radius * Math.sin(angle),
  };
}

// Easing Functions - 자연스러운 가속/감속
const EasingFunctions = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // 바운스 효과
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    else if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    else if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    else return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};
```

### 3. 3D 카메라 수학과 OrbitControls

#### 구면 좌표계 (Spherical Coordinates)

OrbitControls는 **구면 좌표계**로 카메라 위치를 관리합니다:

```javascript
// 직교 좌표 → 구면 좌표
function cartesianToSpherical(x, y, z) {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(y, x); // 방위각 (0 ~ 2π)
  const phi = Math.acos(z / radius); // 극각 (0 ~ π)
  return { radius, theta, phi };
}

// 구면 좌표 → 직교 좌표
function sphericalToCartesian(radius, theta, phi) {
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  };
}

// OrbitControls 핵심 로직 (단순화)
class SimpleOrbitControls {
  constructor(camera, domElement) {
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    this.dampingFactor = 0.05;
  }

  onMouseMove(deltaX, deltaY) {
    // 마우스 움직임을 구면 좌표 변화로 변환
    this.sphericalDelta.theta -= deltaX * 0.01;
    this.sphericalDelta.phi -= deltaY * 0.01;

    // 극각 제한 (위아래 회전 제한)
    this.sphericalDelta.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, this.sphericalDelta.phi)
    );
  }

  update() {
    // 댐핑 적용
    this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
    this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;

    // 카메라 위치 계산
    const position = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(position);
    this.camera.lookAt(this.target);
  }
}
```

#### 쿼터니언과 회전 수학

3D 회전을 표현하는 방법들과 장단점:

```javascript
// 1. 오일러 각 - 직관적이지만 짐벌 락 문제
const euler = new THREE.Euler(x, y, z, "XYZ");

// 2. 쿼터니언 - 복잡하지만 안정적
const quaternion = new THREE.Quaternion();
quaternion.setFromEuler(euler);

// 쿼터니언 보간 (부드러운 회전)
function interpolateRotation(q1, q2, t) {
  const result = new THREE.Quaternion();
  result.slerpQuaternions(q1, q2, t); // 구면 선형 보간
  return result;
}
```

### 4. 카메라 시스템 심화

#### PerspectiveCamera vs OrthographicCamera

```javascript
// Perspective - 현실적 원근감 (3D 점을 2D로 투영)
// sx = (x * fov) / z, sy = (y * fov) / z

const perspectiveCamera = new THREE.PerspectiveCamera(
  75, // FOV: 35°(망원) ~ 120°(초광각)
  aspect, // 종횡비
  0.1, // Near: 너무 작으면 Z-fighting
  1000 // Far: 너무 크면 정밀도 손실
);

// Orthographic - 일정한 크기 (CAD, 2D 게임용)
const orthographicCamera = new THREE.OrthographicCamera(
  -width / 2,
  width / 2,
  height / 2,
  -height / 2,
  0.1,
  1000
);

// 실시간 카메라 전환
function switchProjection(camera) {
  if (camera.isPerspectiveCamera) {
    const distance = camera.position.distanceTo(new THREE.Vector3());
    const fov = camera.fov * (Math.PI / 180);
    const viewHeight = 2 * Math.tan(fov / 2) * distance;
    // Perspective → Orthographic 변환 로직
  }
}
```

## 🛠️ 성능 최적화와 모니터링

### 애니메이션 성능 분석

```javascript
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
  }

  update() {
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / this.frameTime;
      console.log(`FPS: ${this.fps.toFixed(1)}`);
    }
  }
}

// 적응적 품질 조절
class AdaptiveQuality {
  adjustQuality(currentFPS) {
    if (currentFPS < 45) {
      // 성능 저하 시 품질 낮춤
      renderer.setPixelRatio(Math.max(1, window.devicePixelRatio * 0.8));
    } else if (currentFPS > 58) {
      // 성능 여유 시 품질 높임
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    }
  }
}
```

### 실습 구현 분석

#### `AnimatedSceneManager` 아키텍처

```typescript
export class AnimatedSceneManager {
  private animateCallback?: () => void;

  public startAnimationLoop(animateCallback: () => void): void {
    this.animateCallback = animateCallback;
    this.animate();
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // 콜백 패턴으로 유연한 애니메이션 로직
    if (this.animateCallback) {
      this.animateCallback();
    }

    // OrbitControls 댐핑 업데이트
    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
```

**설계 패턴 적용:**

- **Strategy Pattern**: 애니메이션 콜백으로 다양한 전략 구현
- **Observer Pattern**: 렌더링 루프에서 여러 시스템 업데이트
- **Template Method**: 고정된 렌더링 파이프라인

### 수학적 애니메이션 구현 분석

#### 메인 큐브의 복합 움직임

```typescript
private animate(): void {
  const elapsedTime = this.clock.getElapsedTime();

  if (this.animatingCube) {
    // 복합 회전: 두 축의 서로 다른 각속도
    this.animatingCube.rotation.y = elapsedTime * 0.8; // ω₁ = 0.8 rad/s
    this.animatingCube.rotation.x = elapsedTime * 0.4; // ω₂ = 0.4 rad/s

    // 사인파 부유: y = A sin(ωt) + y₀
    this.animatingCube.position.y = Math.sin(elapsedTime * 1.5) * 0.5;
    // 진폭 0.5, 각주파수 1.5, 중심점 0
  }
}
```

**수학적 분석:**

- **회전 속도비**: 0.8:0.4 = 2:1 → 매 2회전마다 패턴 반복
- **부유 주기**: T = 2π/1.5 ≈ 4.19초
- **합성 운동**: 두 회전축 + 사인파 이동 = 복잡한 3D 궤적

#### 참조 구들의 공간 수학

```typescript
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2; // 45도 간격
  sphere.position.set(
    Math.cos(angle) * 3, // X: 반지름 3인 원
    Math.sin(angle * 2) * 0.5, // Y: 이중 주파수 파동
    Math.sin(angle) * 3 // Z: 반지름 3인 원
  );
}
```

**공간 패턴 분석:**

- **기본 원**: `x² + z² = 9` (반지름 3)
- **Y축 변조**: `y = 0.5 sin(2θ)` → 8엽 장미곡선의 수직 투영
- **결과**: 3D 공간에서 복잡한 나선형 배치

## Q&A

### Q1. requestAnimationFrame 쓰라고 하는데 setInterval이랑 뭐가 다른 거야?

**A:** 가장 큰 차이는 **브라우저가 렌더링하는 타이밍에 맞춰서 실행된다는 거야.**

```javascript
// setInterval의 문제점
setInterval(() => {
  updateAnimation();
  render();
}, 16); // 60fps 목표

// 문제점들:
// 1. 브라우저 렌더링과 안 맞음 → 프레임 드롭
// 2. 탭 꺼도 계속 돌아감 → 배터리 죽음
// 3. 정확히 16ms마다 안 됨

// requestAnimationFrame은 이렇게
function animate() {
  updateAnimation();
  render();
  requestAnimationFrame(animate);
}

// 좋은 점들:
// 1. 브라우저가 렌더링할 때 맞춰서 실행
// 2. 탭 꺼지면 자동으로 멈춤
// 3. 120Hz 모니터면 120fps로 자동 조절
```

### Q2. Delta Time 안 쓰면 뭔 문제가 생기는데?

**A:** **컴퓨터 성능에 따라 움직임 속도가 달라져서 망한다.** 진짜 심각한 문제야.

```javascript
// ❌ 프레임 의존적 코드
function badUpdate() {
  cube.rotation.y += 0.01; // 매 프레임마다 0.01 라디안 회전
}

// 60fps: 0.01 × 60 = 0.6 rad/s
// 30fps: 0.01 × 30 = 0.3 rad/s → 절반 속도! 망함

// ✅ 시간 기반으로 하면
function goodUpdate(deltaTime) {
  const rotationSpeed = 0.6; // 초당 0.6 라디안
  cube.rotation.y += rotationSpeed * deltaTime;
}

// 어떤 컴퓨터든 똑같이 0.6 rad/s로 돌아감
```

### Q3. OrbitControls에서 댐핑이 뭐야? 왜 써야 해?

**A:** **마우스 놓으면 뚝 멈추는 게 어색해서.** 댐핑 쓰면 천천히 멈춰서 훨씬 자연스러워.

```javascript
// 댐핑 구현 원리
class DampingExample {
  update() {
    // 목표값과 현재값의 차이를 점진적으로 줄임
    this.current += (this.target - this.current) * this.dampingFactor;

    // dampingFactor가 0.05면:
    // 1프레임: 차이의 5%만큼 움직임
    // 2프레임: 남은 차이의 5%만큼 또 움직임
    // → 점점 느려져서 자연스럽게 멈춤
  }
}
```

### Q4. 구면 좌표계가 뭔데? 왜 3D 카메라에 좋다는 거야?

**A:** **중심점에서 일정한 거리 유지하면서 빙글빙글 돌면서 볼 수 있어서 좋아.** 마우스로 돌리기도 쉽고.

```javascript
// 직교 좌표계의 문제점
camera.position.set(x, y, z); // 자유롭지만 복잡

// 구면 좌표계의 장점
const spherical = {
  radius: 10, // 중심점으로부터 거리 (줌)
  theta: angle1, // 좌우 회전 (방위각)
  phi: angle2, // 상하 회전 (극각)
};

// 마우스 움직임 → 각도 바뀜 → 위치 계산
// 간단하고 직관적임
```

### Q5. Easing Function이 뭐야? 왜 써야 하는데?

**A:** **일정한 속도로 움직이면 로봇 같아 보여서.** 현실에서는 모든 게 가속하고 감속하잖아?

```javascript
// 선형 vs 자연스러운 움직임 비교
const startPos = 0,
  endPos = 100,
  duration = 1000;

// ❌ 선형 - 로봇 같음
function linear(t) {
  return startPos + (endPos - startPos) * t;
}

// ✅ Ease-out - 자연스러움
function easeOut(t) {
  return startPos + (endPos - startPos) * (1 - Math.pow(1 - t, 3));
}

// 현실에서 보면:
// - 자동차: 천천히 가속 → 일정 속도 → 천천히 감속
// - 공 던지기: 빨리 시작 → 중력 때문에 느려짐
// - UI 애니메이션: 빠르게 시작 → 부드럽게 끝
```

### Q6. 성능 체크할 때 FPS만 보면 되는 거 아니야?

**A:** **아니야.** FPS는 그냥 결과고, **진짜 뭐가 문제인지 알려면 더 자세히 봐야 해.**

```javascript
class DetailedPerformanceMonitor {
  measure() {
    const frameStart = performance.now();

    // 1. CPU 작업 시간
    const cpuStart = performance.now();
    this.updateLogic();
    const cpuTime = performance.now() - cpuStart;

    // 2. GPU 작업 시간 (근사치)
    const renderStart = performance.now();
    this.renderer.render(this.scene, this.camera);
    const renderTime = performance.now() - renderStart;

    const totalFrame = performance.now() - frameStart;

    // 3. 메모리 사용량 (크롬에서만 됨)
    const memory = performance.memory
      ? performance.memory.usedJSHeapSize / 1048576
      : 0;

    console.log(
      `CPU: ${cpuTime.toFixed(2)}ms, 렌더링: ${renderTime.toFixed(
        2
      )}ms, 메모리: ${memory.toFixed(1)}MB`
    );
  }
}
```

### Q7. 카메라 타입을 실시간으로 바꿀 수 있어?

**A:** **바로는 안 되고,** 새 카메라 만들어서 위치랑 회전을 복사하는 식으로 해야 해.

```javascript
class CameraSwitcher {
  switchToOrthographic(perspectiveCamera) {
    // 현재 카메라 정보 가져오기
    const distance = perspectiveCamera.position.distanceTo(this.target);
    const fov = perspectiveCamera.fov * (Math.PI / 180);

    // 시야 크기 계산해야 함
    const viewHeight = 2 * Math.tan(fov / 2) * distance;
    const viewWidth = viewHeight * perspectiveCamera.aspect;

    // 새로운 Orthographic 카메라 만들기
    const orthoCamera = new THREE.OrthographicCamera(
      -viewWidth / 2,
      viewWidth / 2,
      viewHeight / 2,
      -viewHeight / 2,
      perspectiveCamera.near,
      perspectiveCamera.far
    );

    // 위치랑 회전 그대로 복사
    orthoCamera.position.copy(perspectiveCamera.position);
    orthoCamera.rotation.copy(perspectiveCamera.rotation);

    return orthoCamera;
  }
}
```

### Q8. 애니메이션 많이 돌리면 느려지는데 어떻게 최적화해?

**A:** **LOD, 컬링, 배치 처리** 같은 기법들 써야 해. 멀리 있는 건 대충 그리고, 안 보이는 건 아예 안 그리고.

```javascript
class OptimizedAnimationManager {
  update(camera) {
    this.objects.forEach((obj) => {
      const distance = camera.position.distanceTo(obj.position);

      // 1. LOD - 거리별로 품질 조절
      if (distance > 50) {
        obj.visible = false; // 너무 멀면 그냥 안 그림
      } else if (distance > 20) {
        obj.material = this.lowDetailMaterial; // 멀면 대충
      } else {
        obj.material = this.highDetailMaterial; // 가까우면 예쁘게
      }

      // 2. 프러스텀 컬링 - 화면 밖은 안 그림
      if (this.isInFrustum(obj, camera)) {
        obj.visible = true;
        this.updateAnimation(obj);
      } else {
        obj.visible = false; // 안 보이면 처리 안 함
      }
    });

    // 3. 배치 처리 - 한 번에 여러 개 처리
    this.batchUpdateTransforms();
  }
}
```
