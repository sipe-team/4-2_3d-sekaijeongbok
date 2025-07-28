# Buffer Geometry를 런타임에 분할하는 예제를 만들어봤습니다. 이름하야 아토믹 참!!

![](https://i.imgur.com/6cuUnDP.png)

이런 느낌으로.. 정육면체를 조각조각으로 분할하는 예제를 만들어보고 싶었습니다

[직접 해보러 가기!!](https://sungpaks.github.io/atomic-slash/)  
플레이 방법

- 우하단의 `아토믹 참!!` 버튼을 클릭한다 .
- 그럼 3초간 참격모드에 들어감! (주변 배경이 어두워진 그 순간)
- 3초간 열심히 드래그 (mousedown -> mousemove -> mouseup)를 반복하여 참격을 긋는다!!
  - 터치도 가능~
  - 드래그 거리가 뷰포트 너비 또는 높이의 30퍼 이상이어야 "참격"으로 인정됩니다~
- 3초간 얼마나 많이 참격을 그었냐에 따라 아토믹참의 레베루가 달라진다. (많이 잘린다는 뜻)

https://threejs.org/manual/#en/custom-buffergeometry  
이 문서를 참고했습니다.

# 가장 먼저, Custom Buffer Geometry로 가장 간단한 정육면체를 만들기.

```tsx
class CustomCubeFactory {
  private vertices = [
    // +x side:
    // 1 3
    // 0 2
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [0, 0] }, // 0
    { pos: [1, 1, -1], norm: [1, 0, 0], uv: [0, 1] }, // 1
    { pos: [1, -1, 1], norm: [1, 0, 0], uv: [1, 0] }, // 2
    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [1, 1] }, // 3

    // -x side
    { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 4
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [0, 1] }, // 5
    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [1, 0] }, // 6
    { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 7

    // +y side
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [0, 0] }, // 8
    { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [0, 1] }, // 9
    { pos: [1, 1, -1], norm: [0, 1, 0], uv: [1, 0] }, // 10
    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [1, 1] }, // 11

    // -y side
    { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [0, 0] }, // 12
    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] }, // 13
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] }, // 14
    { pos: [1, -1, 1], norm: [0, -1, 0], uv: [1, 1] }, // 15

    // +z side
    { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 16
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 17
    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 18
    { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 19

    // -z side
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 20
    { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 21
    { pos: [1, -1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 22
    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 23
  ];

  // prettier-ignore
  private indices = [
    0, 1, 2, 2, 1, 3, 
    4, 5, 6, 6, 5, 7, 
    8, 9, 10, 10, 9, 11, 
    12, 13, 14, 14, 13, 15, 
    16, 17, 18, 18, 17, 19, 
    20, 21, 22, 22, 21, 23,
  ];

  private geometry = new THREE.BufferGeometry();

  constructor() {
    const positions = [];
    const normals = [];
    const uvs = [];

    for (const vertex of this.vertices) {
      positions.push(...vertex.pos);
      normals.push(...vertex.norm);
      uvs.push(...vertex.uv);
    }

    const geometry = new THREE.BufferGeometry();
    const POSITION_NUM_COMPONENTS = 3;
    const NORMAL_NUM_COMPONENTS = 3;
    const UV_NUM_COMPONENTS = 2;

    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), POSITION_NUM_COMPONENTS));
    geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), NORMAL_NUM_COMPONENTS));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), UV_NUM_COMPONENTS));
    // geometry.computeVertexNormals();
    geometry.setIndex(this.indices);

    this.geometry = geometry;
  }

  getGeometry() {
    return this.geometry;
  }
}
```

대충 이런식이 됨

이제 이 커스텀 큐브의 resolution을 동적으로 조절해보고 싶다.

- 지금처럼 하면 : 정점들이 완전히 독립적이므로 나중에 개별 평면을 다룰 때 용이함
- 조금 더 공유정점으로 효율성을 뽑아낼 수 있음: 예를 들어, 정점을 8개만 만들고 재사용.
  - (ex. `1,1,1`에서 세 개의 노말벡터가 필요해서 정점을 3개로 나눴지만, 공유정점은 같은 position 정점을 사용하고, normal만 다르게)

나중에 개별 평면을 조작하여 애니메이션을 만들거라 공유정점보다는 각 정점이 독립적인 편이 편할 것 같다.

# 정육면체 각 면들을 분할하기

## 1. Face 기반 구조로 리팩토링하자.

```ts
interface Vertex {
  pos: [number, number, number];
  norm: [number, number, number];
  uv: [number, number];
}

interface Face {
  vertices: Vertex[];
  indices: number[];
  normal: [number, number, number];
}

class CustomCubeFactory {
  private faces: Face[] = [
    {
      // +x side
      vertices: [
        { pos: [1, -1, -1], norm: [1, 0, 0], uv: [0, 0] }, // 0
        { pos: [1, 1, -1], norm: [1, 0, 0], uv: [0, 1] }, // 1
        { pos: [1, -1, 1], norm: [1, 0, 0], uv: [1, 0] }, // 2
        { pos: [1, 1, 1], norm: [1, 0, 0], uv: [1, 1] }, // 3
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [1, 0, 0],
    },
    {
      // -x side
      vertices: [
        { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 4
        { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [0, 1] }, // 5
        { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [1, 0] }, // 6
        { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 7
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [-1, 0, 0],
    },
    {
      // +y side
      vertices: [
        { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [0, 0] }, // 8
        { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [0, 1] }, // 9
        { pos: [1, 1, -1], norm: [0, 1, 0], uv: [1, 0] }, // 10
        { pos: [1, 1, 1], norm: [0, 1, 0], uv: [1, 1] }, // 11
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [-1, 0, 0],
    },
    {
      // -y side
      vertices: [
        { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [0, 0] }, // 12
        { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] }, // 13
        { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] }, // 14
        { pos: [1, -1, 1], norm: [0, -1, 0], uv: [1, 1] }, // 15
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [0, -1, 0],
    },

    {
      // +z side
      vertices: [
        { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 16
        { pos: [1, -1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 17
        { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 18
        { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 19
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [0, 0, 1],
    },
    {
      // -z side
      vertices: [
        { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 20
        { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 21
        { pos: [1, -1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 22
        { pos: [1, 1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 23
      ],
      indices: [0, 1, 2, 2, 1, 3],
      normal: [0, 0, -1],
    },
    // -z side
  ];
```

"정점"과 "면"을 interface로 정의하고
기존에는 그냥 정점의 집합이었던 것들을 의미를 더 쉽게 알 수 있도록 면 단위로 만들어줬다.

이러고 나면, constructor에서 attribute를 만드는 for문은

```ts
for (const face of this.faces) {
  for (const vertex of face.vertices) {
    positions.push(...vertex.pos);
    normals.push(...vertex.norm);
    uvs.push(...vertex.uv);
  }
}
```

이렇게만 바뀌면 된다

![](https://i.imgur.com/5sSsbna.png)

잘 유지되고 있는 모습.

## 면을 분할하려면 (resolution을 높이기)

![](https://i.imgur.com/22adI1p.png)

기존에 빨간 정점에 의한 실선 정사각형만이 있었을 것인데
각 빨간 정점의 중점에 파란 점을 찍고, 중앙에 또 파란 점을 또 하나 더 찍고
이를 점선으로 이으면, 정사각형이 1개에서 4개로 된다!!

### 1차 구현

```ts
function addMidpoints(vertices: Vertex[]): Vertex[] {
  // 기존 4개 정점
  const [v0, v1, v2, v3] = vertices;

  // 모서리 중점들 (v0-v1, v1-v2, v2-v3, v3-v0)
  const v01 = createMidpoint(v0, v1); // 0-1 중점
  const v12 = createMidpoint(v1, v2); // 1-2 중점
  const v23 = createMidpoint(v2, v3); // 2-3 중점
  const v30 = createMidpoint(v3, v0); // 3-0 중점

  // 중심점 (4개 정점의 평균)
  const center = createCenter(v0, v1, v2, v3);

  // 순서: 기존 4개 + 모서리 중점 4개 + 중심점 1개 = 총 9개
  return [v0, v1, v2, v3, v01, v12, v23, v30, center];
}

function createMidpoint(v1: Vertex, v2: Vertex): Vertex {
  return {
    pos: [(v1.pos[0] + v2.pos[0]) / 2, (v1.pos[1] + v2.pos[1]) / 2, (v1.pos[2] + v2.pos[2]) / 2],
    norm: v1.norm, // 같은 면이므로 normal은 동일
    uv: [(v1.uv[0] + v2.uv[0]) / 2, (v1.uv[1] + v2.uv[1]) / 2],
  };
}

function createCenter(v0: Vertex, v1: Vertex, v2: Vertex, v3: Vertex): Vertex {
  return {
    pos: [
      (v0.pos[0] + v1.pos[0] + v2.pos[0] + v3.pos[0]) / 4,
      (v0.pos[1] + v1.pos[1] + v2.pos[1] + v3.pos[1]) / 4,
      (v0.pos[2] + v1.pos[2] + v2.pos[2] + v3.pos[2]) / 4,
    ],
    norm: v0.norm, // 같은 면이므로 normal은 동일
    uv: [(v0.uv[0] + v1.uv[0] + v2.uv[0] + v3.uv[0]) / 4, (v0.uv[1] + v1.uv[1] + v2.uv[1] + v3.uv[1]) / 4],
  };
}
```

`addMidPoints(Vertex[])` : 이웃한 두 정점 사이의 중점을 생성한다.

- ex. `v0`와 `v1` 사이의 정점 `v01`.
- 센터도 생성

```ts
function createSubFaces(vertices: Vertex[], normal: [number, number, number]): Face[] {
  // vertices 순서: [v0, v1, v2, v3, v01, v12, v23, v30, center]
  // 인덱스: [0, 1, 2, 3, 4, 5, 6, 7, 8]

  // 4개의 하위 면 생성 (각각 4개 정점)
  const subFaces: Face[] = [
    // 하위 면 1: v0-v01-center-v30
    {
      vertices: [vertices[0], vertices[4], vertices[8], vertices[7]], // v0, v01, center, v30
      indices: [0, 1, 2, 2, 1, 3], // 2개 삼각형
      normal,
    },
    // 하위 면 2: v01-v1-v12-center
    {
      vertices: [vertices[4], vertices[1], vertices[5], vertices[8]], // v01, v1, v12, center
      indices: [0, 1, 2, 2, 1, 3],
      normal,
    },
    // 하위 면 3: center-v12-v2-v23
    {
      vertices: [vertices[8], vertices[5], vertices[2], vertices[6]], // center, v12, v2, v23
      indices: [0, 1, 2, 2, 1, 3],
      normal,
    },
    // 하위 면 4: v30-center-v23-v3
    {
      vertices: [vertices[7], vertices[8], vertices[6], vertices[3]], // v30, center, v23, v3
      indices: [0, 1, 2, 2, 1, 3],
      normal,
    },
  ];

  return subFaces;
}

function subdivideFace(face: Face): Face[] {
  // 1. 중점 추가하여 정점 수 증가 (4개 → 9개)
  const subdividedVertices = addMidpoints(face.vertices);

  // 2. 4개의 하위 면 생성
  const subFaces = createSubFaces(subdividedVertices, face.normal);

  return subFaces;
}
```

그 다음은, 중점들을 찍어낸 결과 ( `[v0, v1, v2, v3, v01, v12, v23, v30, center]` ) 배열에 대해 :

- 4개 Face를 만든다.

![](https://i.imgur.com/jXZ1XwP.png)

```
원래 사각형 면:
v1 ────────── v2
│              │
│              │
│              │
v0 ────────── v3

세분화 후:
v1 ─── v12 ─── v2
│       │       │
v01 ─── center ── v23
│       │       │
v0 ─── v30 ─── v3
```

이제 CustomCubeFactory에

```ts
  subdivideAllFaces(): void {
    const newFaces: Face[] = [];

    for (const face of this.faces) {
      const subFaces = subdivideFace(face);
      newFaces.push(...subFaces);
    }

    this.faces = newFaces;
    this.rebuildGeometry();
  }

  private rebuildGeometry(): void {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    for (const face of this.faces) {
      // 정점 데이터 추가
      for (const vertex of face.vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }

      // 인덱스 추가 (offset 적용)
      for (const index of face.indices) {
        indices.push(index + vertexOffset);
      }

      vertexOffset += face.vertices.length;
    }

    // geometry 재생성
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry();

    this.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    this.geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
    this.geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    this.geometry.setIndex(indices);
  }
```

이렇게 메서드를 추가한다.
사실 이제 `rebuildGeometry`가 생겼으니, constructor에서도 이걸 쓰면 되겠다.

아무튼, 외부에서는 어떤 이벤트에 의해 `customCubeFactory.subdivideAllFaces()`를 트리거하고, 물체를 없앴다가 다시 이 geometry로 만들어내면 되겠다.

- 사실 geometry만 갈아끼우려면 어떻게하는지 잘..

이제 어떤 버튼을 클릭하면 분할이 트리거되게끔 할거다.

```ts
const subdivideButton = document.getElementById("subdivide")!;
subdivideButton.addEventListener("click", () => {
  this.cube?.subdivideAllFaces();
  const mesh = this.scene.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh;
  const newGeometry = this.cube?.getGeometry();
  if (mesh && newGeometry) {
    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
  }
});
```

HTML에 `<button id="subdivide">아토믹 참!!</button>`을 추가하자.

![](https://i.imgur.com/cvuTP6g.png)

우하단 구석에 Floating Button으로 해줬다.

### 문제가 생김

![](https://i.imgur.com/iuDyJJ9.png)

중점이 4개 생겨야 하는데, 2개밖에 안생겼다.
그래서 모래시계 모양만 resolution이 많아짐

![](https://i.imgur.com/u3JZtzw.png)

문제를 찾았다.

```
v1 ────────── v2
│              │
│              │
│              │
v0 ────────── v3
```

원래 사각형 면을 이렇게 가정했기 때문인데

기존 사각형은

```
v1 ────────── v3
│              │
│              │
│              │
v0 ────────── v2
```

이렇게되게 만들어져있었다.

### 구현을 수정: 정점을 시계방향 순서로 바꾼다.

```ts
 {
  // +x side (왼쪽아래 → 왼쪽위 → 오른쪽위 → 오른쪽아래)
  vertices: [
	{ pos: [1, -1, -1], norm: [1, 0, 0], uv: [0, 0] }, // v0: 왼쪽아래
	{ pos: [1, 1, -1], norm: [1, 0, 0], uv: [0, 1] }, // v1: 왼쪽위
	{ pos: [1, 1, 1], norm: [1, 0, 0], uv: [1, 1] }, // v2: 오른쪽위
	{ pos: [1, -1, 1], norm: [1, 0, 0], uv: [1, 0] }, // v3: 오른쪽아래
  ],
  indices: [0, 1, 2, 2, 3, 0], // v0-v1-v2, v2-v3-v0
  normal: [1, 0, 0],
},
```

이런 식으로.

```
v1 ────────── v2
│              │
│              │
│              │
v0 ────────── v3
```

이 순서가 되게끔

이제 `createSubFaces`에서 `subFaces`의 `indices`를

```ts
 const subFaces: Face[] = [
    // 하위 면 1: v0-v01-center-v30
    {
      vertices: [vertices[0], vertices[4], vertices[8], vertices[7]], // v0, v01, center, v30
      indices: [0, 1, 2, 2, 3, 0], // v0-v01-center, center-v30-v0
      normal,
    },
```

이렇게 바꿔주면 된다.
그리고 indices가 계속 저거 똑같은 값으로 쓰이니까

```ts
const INDICES_FOR_RECT = [0, 1, 2, 2, 3, 0];

...
 indices: INDICES_FOR_RECT
```

이렇게 해줌

![](https://i.imgur.com/ijjviVW.gif)

Material을 `new THREE.MeshStandardMaterial({ ..., wireframe: true })` 로 edge들이 잘 보이게 구성했다.

그리고 아니면, 정점의 순서에 관계없는 방법이 있는 것 같은데 뭐냐면  
"모든 정점의 중점을 구한다"임!!

- 기존에는 인접한 정점 사이의 중점을 구하게 한건데, 대각선까지도 중점을 구하면 그건 center라서, 이를 이용해먹으면 될 듯
- 근데말이죠.. 그러면 n^2번 돌아야 한다는 뜻일라나?

## 이제 진짜 잘린 것처럼 표현하기

이렇게 할 생각인데요

![](https://i.imgur.com/tM0KRr8.png)

그러려면..

![](https://i.imgur.com/RwmsSxx.png)

중심점을 향해 각 정점을 조정해야할 것 같아요.

```ts
function shrinkSubFace(vertices: Vertex[], factor: number): Vertex[] {
  // 하위 면의 중심점 계산
  const center = [
    (vertices[0].pos[0] + vertices[1].pos[0] + vertices[2].pos[0] + vertices[3].pos[0]) / 4,
    (vertices[0].pos[1] + vertices[1].pos[1] + vertices[2].pos[1] + vertices[3].pos[1]) / 4,
    (vertices[0].pos[2] + vertices[1].pos[2] + vertices[2].pos[2] + vertices[3].pos[2]) / 4,
  ];

  // 각 정점을 중심점 방향으로 축소
  return vertices.map((vertex) => ({
    ...vertex,
    pos: [
      vertex.pos[0] + (center[0] - vertex.pos[0]) * factor,
      vertex.pos[1] + (center[1] - vertex.pos[1]) * factor,
      vertex.pos[2] + (center[2] - vertex.pos[2]) * factor,
    ],
  }));
}
```

그래서 이런 함수를 만들고
`createSubFaces`에서,

```ts
const subFaces: Face[] = [
  {
    vertices: shrinkSubFace([vertices[0], vertices[4], vertices[8], vertices[7]], SHRINK_FACTOR), // v0, v01, center, v30
    indices,
    normal,
  },
  ...
]
```

이렇게 `shrinkFace`로 감싸줍니다.

그러면:

![](https://i.imgur.com/1iAUV6D.png)

몇 번 자르고나면 이렇게 됨
이제 재질을 다시 wireframe이 아니게끔 해주면

![](https://i.imgur.com/boW9P98.png)

이렇고, 좀 더 극적이고 싶으니까.. 간격을 랜덤으로 조정해도 괜찮을 것 같고

근본적인 문제가 두 가지 있는데

지금은 무턱대고 줄여버리니까 처음에 잘렸던 간격이 계속 벌어집니다. 정사각형의 한쪽 평면에서 잘려있는 형태를 보면, 중심선에 가까울 수록(초반에 잘렸을 수록) 간격이 큰데
이는 매번 잘릴 때마다 줄어드니까, 5번 자르면 중심선은 간격이 5번 적용됩니다

또한 문제는, factor가 비율로 적용될거니까, 처음에는 크기가 커서 간격이 크고, 나중에는 간격이 조그매집니다.
예를 들어, 매번 0.01% 간격을 만들어도
100의 0.01%는 1이고, 10,000의 0.01%는 100이죠
그 대신에 매번 같은 간격이 생기게 해줘야겠습니다

그래서 `shrinkSubFace`를 아래와 같이 바꿨습니다.

```ts
function shrinkSubFace(
  vertices: Vertex[],
  shrinkAmount: number,
  notShrinkPosition: [number, number, number]
): Vertex[] {
  // 하위 면의 중심점 계산
  const center = [
    (vertices[0].pos[0] + vertices[1].pos[0] + vertices[2].pos[0] + vertices[3].pos[0]) / 4,
    (vertices[0].pos[1] + vertices[1].pos[1] + vertices[2].pos[1] + vertices[3].pos[1]) / 4,
    (vertices[0].pos[2] + vertices[1].pos[2] + vertices[2].pos[2] + vertices[3].pos[2]) / 4,
  ];

  return vertices.map((vertex, index) => {
    // 각 축별로 이동할 방향과 거리 계산
    const dirX = center[0] - vertex.pos[0];
    const dirY = center[1] - vertex.pos[1];
    const dirZ = center[2] - vertex.pos[2];

    // 각 축별로 이동 여부 결정 (notShrinkPosition과 다른 축만 이동)
    const shouldMoveX = vertex.pos[0] !== notShrinkPosition[0];
    const shouldMoveY = vertex.pos[1] !== notShrinkPosition[1];
    const shouldMoveZ = vertex.pos[2] !== notShrinkPosition[2];

    // 각 축별 이동 거리 계산 (절대값)
    const moveX = shouldMoveX ? Math.sign(dirX) * Math.min(Math.abs(dirX), shrinkAmount) : 0;
    const moveY = shouldMoveY ? Math.sign(dirY) * Math.min(Math.abs(dirY), shrinkAmount) : 0;
    const moveZ = shouldMoveZ ? Math.sign(dirZ) * Math.min(Math.abs(dirZ), shrinkAmount) : 0;

    return {
      ...vertex,
      pos: [vertex.pos[0] + moveX, vertex.pos[1] + moveY, vertex.pos[2] + moveZ],
    };
  });
}
```

하나의 정사각면이 4개의 면으로 나뉘어지면, 4개의 면 각각에는 무조건 하나가 기존에도 존재하던 정점입니다.  
`(x, y, z)`중 하나라도 이 정점에 해당하면 축소를 스킵해야하는데 그래야

![](https://i.imgur.com/7OhLmLR.png)

이렇게 사각형을 수평으로 한 번, 수직으로 한 번 자른듯이 됩니다

![](https://i.imgur.com/mbX8UvM.png)

# 드래그하여 참격하게 만들기.

이제 `아토믹 참!!`버튼으로 조각내는게 아니라, 직접 유저가 드래그로 참격하는 듯이 만들고 싶다.
기존 `아토믹 참!!` 버튼은 그냥 "아토믹 참 모드 시작!" 역할을 하게끔 했다. 3초간 아토믹 참 모드를 진행함.

드래그하여 Slash 하는 인터랙션을 관장할 `SlashDetector` 클래스를 만들자

```ts
export class SlashDetector {
  private isDragging = false;
  private startPos: { x: number; y: number } | null = null;
  private dragCount = 0;
  private readonly minDragDistance = 0.3; // 뷰포트의 30%

  constructor(private onDragComplete: (count: number) => void) {}

  start(x: number, y: number) {
    this.isDragging = true;
    this.startPos = { x, y };
  }

  move(x: number, y: number) {
    if (!this.isDragging || !this.startPos) return;

    const deltaX = Math.abs(x - this.startPos.x);
    const deltaY = Math.abs(y - this.startPos.y);

    // 뷰포트 크기 가져오기
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minDistanceX = viewportWidth * this.minDragDistance;
    const minDistanceY = viewportHeight * this.minDragDistance;

    // 드래그 거리가 충분한지 확인
    if (deltaX >= minDistanceX || deltaY >= minDistanceY) {
      this.dragCount++;
      this.onDragComplete(this.dragCount);
      this.reset();
    }
  }

  end() {
    this.reset();
  }

  private reset() {
    this.isDragging = false;
    this.startPos = null;
  }

  getDragCount() {
    return this.dragCount;
  }

  resetCount() {
    this.dragCount = 0;
  }
}
```

참격으로 인정되려면 최소한 뷰포트의 30%(높이, 너비 중 하나라도 만족)를 드래그로 그어야하게 했다.
드래그가 참격임이 인정되고나면 드래그가 (내부 로직 상으로는) 끝나버린다.
그렇다고 쭈우욱 안떼고 그어도 2회 3회씩 인정되는건 아니다. start를 안하니까
이제 마우스이벤트를 달자

```ts
// class App의 setupEvents() 메서드
...
this.renderer.domElement.addEventListener("mousedown", e => {
  if (this.subdivisionTimer.isSlashMode()) {
	this.dragDetector.start(e.clientX, e.clientY);
  }
});

this.renderer.domElement.addEventListener("mousemove", e => {
  if (this.subdivisionTimer.isSlashMode()) {
	this.dragDetector.move(e.clientX, e.clientY);
  }
});

this.renderer.domElement.addEventListener("mouseup", () => {
  if (this.subdivisionTimer.isSlashMode()) {
	this.dragDetector.end();
  }
});
```

이제 참격모드가 끝난 후 (3초 후)에 드래그한 횟수에 따라 사각형이 분할되게 할건데
횟수 그대로 분할하게 하면, 만약 3초동안 10번 그어버리면 너무 많이 분할되어버려서 좀 난감함..
연산도 많고 어차피 잘 보이지도 않게 됨 (진정한 아토믹??)

그래서 로그스케일로, 최대 6회지만 4회부터는 진짜 어렵게끔 했다.
2,3회까진 쉽지만, 4,5회는 힘들게. 하고싶었다

```ts
export function calculateSubdivisionLevel(dragCount: number): number {
  // 0~6회 범위에서 로그 스케일 적용
  const maxLevel = 6;

  if (dragCount === 0) return 0;

  // 로그 스케일: 1, 2, 3, 4, 5, 6 -> 1, 1, 2, 2, 3, 3
  const logScale = Math.floor(Math.log2(dragCount + 1));
  return Math.min(logScale, maxLevel);
}
```

참격타이머 관련 코드는 넘어가자. Three.js에 크게 관련한 문제는 아니니깐

## 드래그를 시각적으로 보여주기

```ts
export class DragPathVisualizer {
  private pathPoints: { x: number; y: number }[] = [];
  private isDrawing = false;
  private pathMeshes: Line2[] = []; // 여러 개의 mesh 관리
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
  }

  start(x: number, y: number) {
    this.isDrawing = true;
    this.pathPoints = [{ x, y }];
    this.createPathMesh();
  }

  addPoint(x: number, y: number) {
    if (!this.isDrawing) return;
    this.pathPoints.push({ x, y });
    this.updateCurrentPathMesh();
  }

  end() {
    this.isDrawing = false;
    this.fadeOutCurrentPath();
  }

  private createPathMesh() {
    const points = this.pathPoints.map((point) => {
      const vector = new THREE.Vector3();
      vector.setFromScreenPosition(point.x, point.y, this.camera);

      // 약간의 랜덤성 추가로 더 자연스러운 곡선
      vector.x += (Math.random() - 0.5) * 0.1;
      vector.y += (Math.random() - 0.5) * 0.1;

      return vector;
    });

    // LineGeometry 생성
    const geometry = new LineGeometry();
    const positions = new Float32Array(points.length * 3);

    points.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });

    geometry.setPositions(positions);

    // LineMaterial 생성
    const material = new LineMaterial({
      color: getRandomColor(),
      linewidth: 5,
      transparent: true,
      opacity: 0.8,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });

    const pathMesh = new Line2(geometry, material);
    this.pathMeshes.push(pathMesh); // 배열에 추가
    this.scene.add(pathMesh);
  }

  // 현재 드래그 중인 mesh만 업데이트
  private updateCurrentPathMesh() {
    if (this.pathMeshes.length === 0) return;

    const currentMesh = this.pathMeshes[this.pathMeshes.length - 1];
    const points = this.pathPoints.map((point) => {
      const vector = new THREE.Vector3();
      vector.setFromScreenPosition(point.x, point.y, this.camera);
      return vector;
    });

    const geometry = new LineGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    geometry.setPositions(positions);

    currentMesh.geometry.dispose();
    currentMesh.geometry = geometry as LineGeometry;
  }

  // 현재 드래그 중인 mesh만 페이드 아웃
  private fadeOutCurrentPath() {
    if (this.pathMeshes.length === 0) return;

    const currentMesh = this.pathMeshes[this.pathMeshes.length - 1];
    const material = currentMesh.material as LineMaterial;

    const fadeOut = () => {
      material.opacity -= 0.05;
      if (material.opacity <= 0) {
        this.removeMesh(currentMesh);
      } else {
        requestAnimationFrame(fadeOut);
      }
    };
    fadeOut();
  }

  // 특정 mesh 제거
  private removeMesh(mesh: Line2) {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else {
      mesh.material.dispose();
    }

    // 배열에서 제거
    const index = this.pathMeshes.indexOf(mesh);
    if (index > -1) {
      this.pathMeshes.splice(index, 1);
    }
  }

  // 모든 mesh 정리
  clearAllPaths() {
    this.pathMeshes.forEach((mesh) => this.removeMesh(mesh));
    this.pathMeshes = [];
  }

  // resolution 업데이트 (윈도우 리사이즈 시)
  updateResolution() {
    this.pathMeshes.forEach((mesh) => {
      const material = mesh.material as LineMaterial;
      material.resolution.set(window.innerWidth, window.innerHeight);
    });
  }
}
```

다만 문제는 유저가 긋는 드래그는 `x,y` 2차원인데, 이를 3차원세계에 반영해야한다.

```ts
declare module "three" {
  interface Vector3 {
    setFromScreenPosition(x: number, y: number, camera: THREE.Camera, targetPlane?: THREE.Plane): Vector3;
  }
}

// Vector3 프로토타입에 메서드 추가
THREE.Vector3.prototype.setFromScreenPosition = function (
  x: number,
  y: number,
  camera: THREE.Camera,
  targetPlane?: THREE.Plane
) {
  // 화면 좌표를 정규화
  const normalizedX = (x / window.innerWidth) * 2 - 1;
  const normalizedY = -(y / window.innerHeight) * 2 + 1;

  // Raycaster 생성
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

  if (targetPlane) {
    // 특정 평면과의 교차점 계산
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(targetPlane, intersection);
    this.copy(intersection);
  } else {
    // 카메라 앞쪽 고정 거리에서의 교차점
    const distance = 1; // 카메라로부터의 거리
    const point = raycaster.ray.at(distance, new THREE.Vector3());
    this.copy(point);
  }

  return this;
};
```

그래서 `THREE.Vector3`에 메서드를 추가한다.

- `x,y` 좌표를 정규화하고
- 카메라를 방향으로 레이캐스팅하고
- (`else`인 경우만 썼음 코드에서는. `targetPlane`을 지정하지 않는다) 레이캐스트가 1만큼의 거리를 나아간 지점을 가져온다.
- 카메라가 바라보는, 그리고 거리 1만큼 떨어진, 그 평면(3D평면)에 그림을 그리겠다는 뜻.

![](https://i.imgur.com/PjliLku.png)

- 처음에는 pathMesh를 하나만 유지하니까, 한번 드래그 하고나서 -> 사라질 때 -> 드래그중이면 -> 드래그가 끊기는 듯하게 보임
  - 그래서 pathMesh를 여러개 관리하게 개선
- 간단하게 position들로 buffer geometry를 만들고 재질을 `LineBasicMaterial`로 했는데, 너무 얇다. 근데 `linewidth`를 지정해도 두께가 변하지 않았음.
  - https://threejs.org/docs/#api/en/materials/LineBasicMaterial.linewidth 에 설명됨
  - 그래서 geometry를 LineGeometry로 바꾸고, material을 `LineMaterial`로 바꿨다.

이제 마우스이벤트를 넣어주면

```ts
this.renderer.domElement.addEventListener("mousedown", (e) => {
  if (this.subdivisionTimer.isSlashMode()) {
    this.dragDetector.start(e.clientX, e.clientY);
    this.dragPathVisualizer.start(e.clientX, e.clientY);
  }
});

this.renderer.domElement.addEventListener("mousemove", (e) => {
  if (this.subdivisionTimer.isSlashMode()) {
    this.dragDetector.move(e.clientX, e.clientY);
    this.dragPathVisualizer.addPoint(e.clientX, e.clientY);
  }
});

this.renderer.domElement.addEventListener("mouseup", () => {
  if (this.subdivisionTimer.isSlashMode()) {
    this.dragDetector.end();
    this.dragPathVisualizer.end();
  }
});
```

![](https://i.imgur.com/QMxm0qj.gif)

# 진짜같이 개선해보기

## 개선: 조각이 너무 균일해요

그래서 `addMidPoints`에서, 각 모서리 중점들에 대해 랜덤한 오차를 줬다

```ts
export function addMidpoints(vertices: Vertex[]): Vertex[] {
  // 기존 4개 정점
  const [v0, v1, v2, v3] = vertices;

  // 모서리 중점들 (v0-v1, v1-v2, v2-v3, v3-v0)
  const v01 = createMidpoint(v0, v1); // 0-1 중점
  const v12 = createMidpoint(v1, v2); // 1-2 중점
  const v23 = createMidpoint(v2, v3); // 2-3 중점
  const v30 = createMidpoint(v3, v0); // 3-0 중점

  // 중심점 (4개 정점의 평균)
  const center = createCenter(v0, v1, v2, v3);

  const randomFactor = 0.04;
  // 법선벡터 방향 인덱스 구하기 (가장 큰 절대값을 가진 축이 normal 방향)
  const normal = v01.norm;
  const normalAxis =
    Math.abs(normal[0]) > Math.abs(normal[1])
      ? Math.abs(normal[0]) > Math.abs(normal[2])
        ? 0
        : 2
      : Math.abs(normal[1]) > Math.abs(normal[2])
      ? 1
      : 2;

  [v01, v12, v23, v30].forEach((v) => {
    v.pos.forEach((p, i) => {
      if (i === normalAxis || p >= 1 || p <= -1) {
        // 법선 방향은 랜덤팩터 적용하지 않음
        // TODO: 가장 바깥쪽은 랜덤팩터를 적용하지 않는데, 하드코딩되어있는 값(1)을 개선하기.
        v.pos[i] = p;
      } else {
        v.pos[i] = p + getRandomFloat(-randomFactor, randomFactor);
      }
    });
  });

  // 순서: 기존 4개 + 모서리 중점 4개 + 중심점 1개 = 총 9개
  return [v0, v1, v2, v3, v01, v12, v23, v30, center];
}
```

중간에 `if (i === normalAxis || p >= 1 || p <= -1)`은

- 법선벡터 방향으로는 오차가 생기지 않게. (안쪽으로 들어가거나, 바깥쪽으로 돌출되거나 하는 것은 원하지 않음)
- 가장 바깥쪽은 오차가 적용되지 않게.

`p >= 1 || p <= -1`이 없으면

![](https://i.imgur.com/Q3QbV83.png)

근데 너무 안좋은 코드임. 크기를 하드코딩한거니까.

![](https://i.imgur.com/VHrA4R2.png)

아무튼 이렇게 된다.

또는, 중심점(center)까지도, 랜덤오차가 적용된 모서리 중점들을 잇는 직선의 교점으로 적용한다면
또한 현재 사각평면의 한 변의 길이를 기준으로, 그 일정 비율만큼 오차가 생기게 해서, 모든 분할 단계에서 비슷한 정도의 랜덤오차가 생기게 해주면

```ts
const edgeLength = Math.sqrt(
  Math.pow(v0.pos[0] - v1.pos[0], 2) + Math.pow(v0.pos[1] - v1.pos[1], 2) + Math.pow(v0.pos[2] - v1.pos[2], 2)
);
const randomFactor = 0.01 * edgeLength;

[v01, v12, v23, v30].forEach((v) => {
  v.pos.forEach((p, i) => {
    if (i === normalAxis || p >= 1 || p <= -1) {
      // 법선 방향은 랜덤팩터 적용하지 않음
      // TODO: 가장 바깥쪽은 랜덤팩터를 적용하지 않는데, 하드코딩되어있는 값(1)을 개선하기.
      v.pos[i] = p;
    } else {
      v.pos[i] = p + getRandomFloat(-randomFactor, randomFactor);
    }
  });
});

// 네 모서리 중점(v01, v12, v23, v30)을 잇는 두 대각선의 교차점 계산
// 대각선1: v01 <-> v23, 대각선2: v12 <-> v30
// 교차점은 두 대각선의 중점의 평균으로 근사 (평면 사각형이므로)
function averagePos(a: Vertex, b: Vertex) {
  return [(a.pos[0] + b.pos[0]) / 2, (a.pos[1] + b.pos[1]) / 2, (a.pos[2] + b.pos[2]) / 2] as [number, number, number];
}
const diag1Mid = averagePos(v01, v23);
const diag2Mid = averagePos(v12, v30);
const centerPos: [number, number, number] = [
  (diag1Mid[0] + diag2Mid[0]) / 2,
  (diag1Mid[1] + diag2Mid[1]) / 2,
  (diag1Mid[2] + diag2Mid[2]) / 2,
];

// uv도 같은 방식으로 평균
function averageUv(a: Vertex, b: Vertex) {
  return [(a.uv[0] + b.uv[0]) / 2, (a.uv[1] + b.uv[1]) / 2] as [number, number];
}
const diag1MidUv = averageUv(v01, v23);
const diag2MidUv = averageUv(v12, v30);
const centerUv: [number, number] = [(diag1MidUv[0] + diag2MidUv[0]) / 2, (diag1MidUv[1] + diag2MidUv[1]) / 2];

// 중심점 생성 (법선은 기존과 동일)
const center: Vertex = {
  pos: centerPos,
  norm: v01.norm,
  uv: centerUv,
};
```

![](https://i.imgur.com/Q34RU7x.jpeg)
![](https://i.imgur.com/tg2xFG0.jpeg)
