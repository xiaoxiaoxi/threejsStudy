// 引入包
import * as THREE from 'three'

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Controller, GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import chroma from 'chroma-js';

export class PersonPlayer {
    constructor(container) {
        this.container = container;
        // this.container.innerHTML = "Hello Peron World!";

        this.clock = new THREE.Clock();
        
        // this.objects = [];
        // this.moveForward = false;
        // this.moveBackward = false;
        // this.moveLeft = false;
        // this.moveRight = false;
        // this.canJump = false;

        // this.blocker = document.getElementById( 'blocker' );
        // this.instructions = document.getElementById( 'instructions' );

        // this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

        this.initStats();
        // let scene, camera, renderer, controls, guiControls;
        this.initScene();
        this.initCamera();
        this.initRender();
        this.initLight();
        this.initControls();
        this.initEnvironment();
        
        this.initContent();
        this.initEvents();

        this.initGui();
    }

    // 场景
    initScene() {
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x050505);
        this.scene.background = new THREE.Color(0x0565E5)
    }

    /* 相机 */
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        // this.camera.position.set(0, 5, 25);
        // office 视角和位置
        // this.camera.position.set(2, 16, 40); 
        // this.camera.lookAt(new THREE.Vector3(-50, 0, 10));
        // office 2 视角和位置
        this.camera.position.set(35, 10, 60); 
        this.camera.lookAt(new THREE.Vector3(0, -0.5, -3000));
    }

     /* 渲染器 */
     initRender() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
    }

     /* 灯光 */
     initLight() {
         // 如果后期不调整，不放入属性
        this.scene.add(new THREE.AmbientLight(0x0c0c0c));

        const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        this.scene.add( light );
        
        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-400, -400, -400);
        this.scene.add(spotLight);

        let spotLight2 = new THREE.SpotLight(0xffffff);
        spotLight2.position.set(400, 800, 400);
        this.scene.add(spotLight2);

    }

    /* 控制器 */
    // first peron 
    initControls() {

        /* 第一人称控件 */
        this.controls = new FirstPersonControls(this.camera);
        /* 属性参数默认 */
        this.controls.enabled = true;
        this.controls.lookSpeed = 0.1; //鼠标移动查看的速度
        this.controls.movementSpeed = 12; //相机移动速度
        this.controls.noFly = false;
        this.controls.constrainVertical = true; //约束垂直
        this.controls.verticalMin = 1;
        this.controls.verticalMax = 2.0;
        this.controls.heightCoef = 0;
        // this.controls.lookVertical = false;
        this.controls.heightMin = 2;
        this.controls.heightMax = 5;
        this.controls.lon = 0; //进入初始视角x轴的角度
        this.controls.lat = 0; //初始视角进入后y轴的角度
    }

    // initControls() {
    //     this.controls = new PointerLockControls( camera, document.body );

    //     this.instructions.addEventListener( 'click', function () {
    //         this.controls.lock();
    //     } );

    //     this.controls.addEventListener( 'lock', function () {
    //         this.instructions.style.display = 'none';
    //         this.blocker.style.display = 'none';
    //     } );

    //     this.controls.addEventListener( 'unlock', function () {
    //         this.blocker.style.display = 'block';
    //         this.instructions.style.display = '';
    //     } );

    //     scene.add( controls.getObject() );

    // }


    // /* 调试插件 */
    initGui() {

        const scope = this;
        
        scope.gui = new GUI();
        this.gui.add(scope.controls, 'enabled').name('允许动作').listen();
        this.gui.add(scope.controls, 'movementSpeed', 0, 50).name('移动速度').listen();
        this.gui.add(scope.controls, 'lookSpeed', 0, 1).name('查看速度').listen();
        this.gui.add(scope.controls, 'lookVertical').name('上下观察').listen();
        this.gui.add(scope.controls, 'autoForward').name('自动前行').listen();
        this.gui.add(scope.controls, 'activeLook').name('四处观察').listen();
        this.gui.add(scope.controls, 'moveForward').name('前进').listen();
        this.gui.add(scope.controls, 'moveBackward').name('后退').listen();
        this.gui.add(scope.controls, 'moveLeft').name('左行').listen();
        this.gui.add(scope.controls, 'moveRight').name('右行').listen();
    }

    /** 添加背景 */
    initEnvironment() {
        // const textureCube = new THREE.CubeTextureLoader().load(
        //     ['assets/img/night/1.jpg', 'assets/img/night/2.jpg', 'assets/img/night/3.jpg', 'assets/img/night/4.jpg', 'assets/img/night/5.jpg', 'assets/img/night/6.jpg'],
        //     );

        // this.scene.background = textureCube; 

        // this.scene.background = new THREE.CubeTextureLoader()
        //     .setPath( 'assets/img/skyboxsun25deg/' )
        //     .load( [
        //         'px.jpg',
        //         'nx.jpg',
        //         'py.jpg',
        //         'ny.jpg',
        //         'pz.jpg',
        //         'nz.jpg'
        //     ] );
    }

    /* 场景中的内容 */
    initContent() {
        const scope = this;
        // // console.log('please inint contents!');
        // 默认建筑群
        let mtlLoader = new MTLLoader();
        mtlLoader.load('assets/models/city.mtl', function (materials) {

            let objLoader = new OBJLoader();
            objLoader.setMaterials(materials);

            objLoader.load('assets/models/city.obj', function (object) {

                let scale = chroma.scale(['red', 'green', 'blue']);

                scope._setRandomColor(object, scale, scope);
                console.log(object);
                scope.scene.add(object);

                // document.getElementById('loading').style.display = 'none';
            });
        });

        // 装载工厂
        // let fbxLoader = new FBXLoader();
        // fbxLoader.load('assets/models/factory.fbx', function (object) {
        //     let scale = chroma.scale(['red', 'green', 'blue']);
        //     scope._setRandomColor(object, scale, scope);
        //     scope.scene.add(object);
        //     document.getElementById('loading').style.display = 'none';
        // })

        // 装载上海
        // let loader = new GLTFLoader();
        // loader.load('assets/models/shanghai.gltf', function(model) {
        //     let scale = chroma.scale(['red', 'green', 'blue']);
        //     scope._setRandomColor(model.scene, scale, scope);
        //     scope.scene.add(model.scene);
        //     document.getElementById('loading').style.display = 'none';
        // });

        // 装载办公室
        // let loader = new GLTFLoader().setPath( 'assets/models/office/' );
        // let loader = new GLTFLoader().setPath( 'assets/models/office2/' );
        // loader.load( 'scene.gltf', function ( gltf ) {
        //     gltf.scene.scale.set(12, 12, 12);
        //     // gltf.scene.position.set(5, 0, 4);
        //     // gltf.scene.rotation.y = - 30 * Math.PI / 360;
        //     scope.scene.add(gltf.scene);
        //     document.getElementById('loading').style.display = 'none';
        // });

    }

    _setRandomColor = (object, scale, scope) => {
        // console.log(object);
        let children = object.children;
        if (children && children.length > 0) {
            children.forEach(function (e) {
                scope._setRandomColor(e, scale, scope);
            });
        } else {
            if (object instanceof THREE.Mesh) {
                for (let i = 0; i < object.material.length; i++) {
                    let material = object.material;
                    // if (material[i].name.indexOf('building') === 0) {
                        material[i].emissive = new THREE.Color(scale(Math.random()).hex());
                        material[i].transparent = true;
                        material[i].opacity = 0.7;
                    // }
                }
            }
        }
    }

    /* 性能插件 */
    initStats() {
        this.stats = new Stats();
        this.container.appendChild(this.stats.domElement);
    }


    /////////////////////////////////////////// events ////////////////////////////////////////////
    // 事件统一管理
    initEvents() {
        window.addEventListener('resize', this.onWindowResize, false);
        window.addEventListener( 'keydown', this.onWindowKeydown);
        
		// document.addEventListener( 'keydown', onKeyDown );
		// document.addEventListener( 'keyup', onKeyUp );

    }

    /* 窗口变动触发 */
    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.controls.handleResize();
    }

    onWindowKeydown = (event) => {
        const scope = this;
        switch ( event.keyCode ) {
            case 32: // Spacebar
                scope.controls.enabled = !scope.controls.enabled;
                console.log("current position:", this.camera.position);
                console.log("current rotation:", this.camera.rotation);
                break;
        }
    }

    // onKeyDown = function ( event ) {

    //     switch ( event.code ) {

    //         case 'ArrowUp':
    //         case 'KeyW':
    //             moveForward = true;
    //             break;

    //         case 'ArrowLeft':
    //         case 'KeyA':
    //             moveLeft = true;
    //             break;

    //         case 'ArrowDown':
    //         case 'KeyS':
    //             moveBackward = true;
    //             break;

    //         case 'ArrowRight':
    //         case 'KeyD':
    //             moveRight = true;
    //             break;

    //         case 'Space':
    //             if ( canJump === true ) velocity.y += 350;
    //             canJump = false;
    //             break;

    //     }

    // };

    // onKeyUp = function ( event ) {

    //     switch ( event.code ) {

    //         case 'ArrowUp':
    //         case 'KeyW':
    //             moveForward = false;
    //             break;

    //         case 'ArrowLeft':
    //         case 'KeyA':
    //             moveLeft = false;
    //             break;

    //         case 'ArrowDown':
    //         case 'KeyS':
    //             moveBackward = false;
    //             break;

    //         case 'ArrowRight':
    //         case 'KeyD':
    //             moveRight = false;
    //             break;

    //     }

    // };

    /////////////////////////////////////////// events ////////////////////////////////////////////
    // 动画部分
    /* 循环渲染 */
    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        this.update();

    }

    update() {
        this.stats.update();
        this.controls.update(this.clock.getDelta());
    }

}

new PersonPlayer(document.getElementById("container"));