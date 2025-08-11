```tsx
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

renderer.localClippingEnabled = true;

material.clippingPlanes = [plane]; // 이 material에만 적용
material.clipShadows = true;
```

해당 `material`로 렌더링되는 물체를, 설정된 평면(`plane`)을 기준으로 해당면의 바깥쪽 또는 안쪽을 시각적으로 잘라냄.

![](https://i.imgur.com/fRVcxNF.png)
https://threejs.org/examples/#webgl_clipping_intersection

잘랐다!!

![](https://i.imgur.com/MpjrD3f.png)

```tsx
const clippingPlane1 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
clippingPlane1.translate(new THREE.Vector3(0, 3.5, 0));
const clippingPlane2 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
clippingPlane2.translate(new THREE.Vector3(0, 3, 0));
```

이런식으로 가까이있는 plane을 두개만든다. 법선벡터는 서로 반대방향

```tsx
cityBuildings.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    const material = child.material as THREE.Material;
    material.clippingPlanes = [clippingPlane1, clippingPlane2];
    material.clipIntersection = true;
  }
});
```

cityBuildings의 모든 material을 돌며 clipping plane을 지정한다. plane은 두개 다 지정
`clipIntersection`을 true로 둬야 clip이 만나는 부분만 잘리고 나머지는 유지된다.

## 전체 city buildings 배경오브젝트의 크기를 구하자.

```ts
const cityBuildingsBox = new THREE.Box3().setFromObject(cityBuildings);
const cityBuildingsSize = new THREE.Vector3();
cityBuildingsBox.getSize(cityBuildingsSize);
console.log("cityBuildings bounding box size:", cityBuildingsSize);
```

## 아주 살짝 떨어진 두 개의 참격평면을 구하기

```tsx
const getNewSlashPlane = () => {
  const slashNormal = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);

  const slashPlane1Translation = new THREE.Vector3(0.1 * slashNormal.x, 0.1 * slashNormal.y, 0.1 * slashNormal.z);
  const slashPlane2Translation = new THREE.Vector3(-0.1 * slashNormal.x, -0.1 * slashNormal.y, -0.1 * slashNormal.z);

  const newSlashPlane1 = new THREE.Plane(slashNormal, 0);
  newSlashPlane1.translate(slashPlane1Translation);
  const newSlashPlane2 = new THREE.Plane(slashNormal.clone().negate(), 0);
  newSlashPlane2.translate(slashPlane2Translation);

  return [newSlashPlane1, newSlashPlane2];
};
```

![](https://i.imgur.com/qlyxuiu.png)

![](https://i.imgur.com/EjmmJ6u.png)

![](https://i.imgur.com/Jku45AP.jpeg)

근데 두개이상 하면 내가 원하는대로 안되네..

![](https://i.imgur.com/aDyu5p4.png)

난 위 사진처럼 되는걸 원했는데

![](https://i.imgur.com/b3w0fPG.png)

이렇게되어버린다.

# CSG

https://sbcode.net/threejs/csg/

구현코드가 MIT라이센스로 있다. 공부해보면 될듯

mesh, geometry, 또는 polygon으로부터 CSG객체를 만든다.
CSG객체는 `.substract(), .intersect(), .union()`같은 CSG메서드를 사용할 수 있다.
인자로는 같은 CSG객체를 넣는다.
기존 CSG객체의 기반mesh또는 geometry가 "위치, 회전"이 어땠건 상관하지 않는다.
