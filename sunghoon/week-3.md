Buffer Geometry는 모든 기하학을 표현할 수 있는 방법이다
`BufferGeometry`는 기본적으로 `BufferAttribute`들의 집합이다.

- 각 `BufferAttribute`는 _Position, Normal, Colors, uv, ..._ 등등 중 하나의 유형을 나타내는 배열이다.
- 각 `BufferAttribute`들은 각 정점(Vertex)들의 데이터에 대한 평행 배열 형태로 나타난다.

![](https://i.imgur.com/N9LnIav.png)
^ Three.js 공식문서

### 잠깐: uv에 대해

uv는 **텍스쳐 이미지에서 어디를 가져다 붙일지 정하는 좌표**임.
예를 들어,

- **U = 0** → 텍스처 왼쪽 끝
- **U = 1** → 텍스처 오른쪽 끝
- **V = 0** → 텍스처 아래쪽 끝
- **V = 1** → 텍스처 위쪽 끝

![](https://i.imgur.com/PGK1b09.png)

요컨대 텍스쳐 양 끝을 `0 ~ 1` 범위로 normalize하고,  
가로축을 u축, 세로축을 v축이라고 놓는 것이다

`BufferAttribute`의 각 uv 하나하나는 "이 정점에는 텍스쳐의 어느 부분이 오면 됩니다"를 가리키게 된다
예를 들어, `pos(1, 1, 1), norm(0,0,1)` 에는 텍스쳐의 오른쪽 위 끝부분이 오게 하겠다! 그러면 `uv(1,1)`

---

다시 돌아와서 아래와 같은 직육면체를 만들려는 상황을 생각해보면
![](https://threejs.org/manual/resources/cube-faces-vertex.svg)
이 꼭짓점 하나는 :

- 맞닿은 면이 세 개니까, 각기 다른 법선벡터 세 개를 제공해야한다.
- 마찬가지로 uv도 달라야한다
- 위치는 동일하겠다
- 색상은 정하기 나름..

위에서 *하나의 꼭짓점*은 `(위치, 법선, uv, 색상)` 네 개 속성의 묶음이었고,
따라서 속성이 하나라도 달라야 하면 별도의 꼭짓점으로 분리되어야 한다
그럼 당연히 이 지점은 하나가 아닌 적어도 세 개 꼭짓점이 만들어져야 함

![](https://i.imgur.com/hn8ZR33.png)

동그라미 친 세 개의 정점이 따로 존재해야 함
직육면체 전체는 그럼 : 6개 면, 각 면마다 2개의 삼각형, 삼각형마다 3개의 정점 총 36개 필요
**_근데 왜 평면은 무조건 삼각형으로 표현해야 함??_** (사각형을 왜 2개의 삼각형으로 나누는가?)

### 잠깐: 왜 평면을 삼각형으로 표현하나

Three.js Mentor (GPT o4-mini-high) 한테 물어보니

- GPU 파이프라인 제약: **OpenGL/WebGL 표준**은 `gl.TRIANGLES` 모드만 지원되고 `gl.QUADS`는 없다(사라진지 오래라고 언급됨)
- 삼각형은 안정적임: **평면을 나타내는 데는 삼각형이 기본**임.
  - 연산이 간단하고, 사각형으로 하면 기울어진 사각형이 왜곡되는 현상이 생긴다?

또한 버퍼 구성 방식은

- 비인덱스 : `BufferAttribute`만 사용해서, 각 삼각형(12개)의 정점을 모두 나열. => 36개 정점
- 인덱스 : `BufferGeometry.setIndex` : 중복되는 정점(예를 들어, 각 큐브 코너에 해당하는 8개 위치만 선언하고 재활용) => 8개 정점. 인덱스를 36개 하면 됨

[webglfundamentals.org - WebGL How It Works](https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html)에서 더 자세한 내용을 알아볼 수 있을 것 같다
