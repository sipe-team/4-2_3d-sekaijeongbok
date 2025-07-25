import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

//scene 객체 생성
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
//camera 객체 생성
//const camera = new THREE.PerspectiveCamera();
const camera = new THREE.PerspectiveCamera(
    60, // field of view (시야각)
    window.innerWidth/window.innerHeight, // aspect ratio(가로 세로 길이의 비율)
    0.1, // near (근거리 클리핑 평면)
    1000 // far (원거리 클리핑 평면)
);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0,5,0);
controls.update();

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color,intensity);
light.position.set(0,10,0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);

// 3D 모델 로딩용 GLTF Loader 객체 생성
const loader = new GLTFLoader();
loader.load('Resouce/3D/sipe_arrow.glb', function(gltf){
    scene.add(gltf.scene);
}, undefined, function(error){
    console.error(error);
});

//const geometry = new THREE.BoxGeometry(1,1,1);
//const material = new THREE.MeshBasicMaterial({color: 0x00ff00}); //color green

//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

camera.position.z = 5;

//Web Graphics Library 웹 상에서 2D 및 3D 그래픽 렌더링을 위한 로우레벨 javaScript API
const renderer = new THREE.WebGLRenderer({
    canvas : document.querySelector("#canvas"),
    antialias : true
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function animate(){
    renderer.render(scene, camera);
    //60frame per 1second
    //requestAnimationFrame(animate);
}
renderer.setAnimationLoop(animate);