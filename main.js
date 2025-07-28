import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

<<<<<<< HEAD
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { color } from 'three/tsl';
=======
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
>>>>>>> 63e7715036719ba0348fdacc5177de01061b00a1


let camera, scene, renderer, composer;
let effectSobel;
<<<<<<< HEAD
const colorParam = {
    color: new THREE.Color(0x00ffff)
};
=======
>>>>>>> 63e7715036719ba0348fdacc5177de01061b00a1
const params = { 
    enable: true
};

init();

function init(){
            //scene 객체 생성
            scene = new THREE.Scene();
            //scene.background = new THREE.Color('white');
            //camera 객체 생성;
            const camera = new THREE.PerspectiveCamera(
                60, // field of view (시야각)
                window.innerWidth/window.innerHeight, // aspect ratio(가로 세로 길이의 비율)
                0.1, // near (근거리 클리핑 평면)
                1000 // far (원거리 클리핑 평면)
            );
            //camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
            camera.position.set( 0, 1, 5 );
            camera.lookAt( scene.position );

            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 256, 32);
            const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );

            const mesh = new THREE.Mesh( geometry, material );
            mesh.position.set(0, 0, -4);
            scene.add( mesh );

            //

            const ambientLight = new THREE.AmbientLight( 0xe7e7e7 );
            scene.add( ambientLight );

            const pointLight = new THREE.PointLight( 0xffffff, 20 );
            camera.add( pointLight );
            scene.add( camera );

            //

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.setAnimationLoop( animate );
            document.body.appendChild( renderer.domElement );

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
            //Web Graphics Library 웹 상에서 2D 및 3D 그래픽 렌더링을 위한 로우레벨 javaScript API
           // const renderer = new THREE.WebGLRenderer({
            //    canvas : document.querySelector("#canvas"),
            //    antialias : true
            //});

        // postprocessing

				composer = new EffectComposer( renderer );
				const renderPass = new RenderPass( scene, camera );
				composer.addPass( renderPass );

<<<<<<< HEAD
            // color to grayscale conversion

            //const effectGrayScale = new ShaderPass( LuminosityShader );
            //composer.addPass( effectGrayScale );
            //const effectDot = new ShaderPass(DotScreenShader);
            //effectDot.uniforms['scale'].value = 10;
            //composer.addPass(effectDot);   

             const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
             composer.addPass(bloomPass);

            //const effectRGB = new ShaderPass(RGBShiftShader);
            //effectRGB.uniforms['amount'].value = 0.0015;
            //composer.addPass(effectRGB);


            // you might want to use a gaussian blur filter before
            // the next pass to improve the result of the Sobel operator

            // Sobel operator

            effectSobel = new ShaderPass( SobelOperatorShader );
            effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
            effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
            composer.addPass( effectSobel );

            const effectColorify = new ShaderPass(ColorifyShader);
            effectColorify.uniforms['color'].value = new THREE.Color(0x00ffff);
            composer.addPass(effectColorify);

            const controls = new OrbitControls( camera, renderer.domElement );
            controls.enableZoom = true;

            //

            const gui = new GUI();

            gui.add( params, 'enable' );
            gui.add( colorParam, 'color')
            gui.open();

            //

            window.addEventListener( 'resize', onWindowResize );
=======
				// color to grayscale conversion

				const effectGrayScale = new ShaderPass( LuminosityShader );
				composer.addPass( effectGrayScale );

				// you might want to use a gaussian blur filter before
				// the next pass to improve the result of the Sobel operator

				// Sobel operator

				effectSobel = new ShaderPass( SobelOperatorShader );
				effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
				effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
				composer.addPass( effectSobel );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.enableZoom = false;

				//

				const gui = new GUI();

				gui.add( params, 'enable' );
				gui.open();

				//

				window.addEventListener( 'resize', onWindowResize );
>>>>>>> 63e7715036719ba0348fdacc5177de01061b00a1
}

function onWindowResize() {

            //camera. = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );
            composer.setSize( window.innerWidth, window.innerHeight );

            effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
            effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

        }

function animate() {

            if ( params.enable === true ) {

                composer.render();

            } else {

                renderer.render( scene, camera );

            }

    }
//renderer.outputColorSpace = THREE.SRGBColorSpace;
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);

//function animate(){
    //renderer.render(scene, camera);
    //60frame per 1second
    //requestAnimationFrame(animate);
//}
//renderer.setAnimationLoop(animate);