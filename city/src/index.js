import * as THREE from 'three'

// 可选根据实际需求
// import  { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'

import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import chroma from 'chroma-js';

// windows 相关的常量
const container = document.getElementById( 'container' );
// 设定尺寸
var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

// 核心三要素
var scene, camera, renderer;
var stats, controls, gui; // 扩展内容(可选)
var clock = new THREE.Clock();
// 存放所有对象的数组，根据实际需求来确定
var objects = []; 

window.addEventListener('load', init, false);

/** 初始化方法 */
function init() {
  // alert("Hello Xiaoxi!");

  // 创建场景，相机和渲染器
  initThree();


  // 添加对象
  initContents();

  // 调用循环函数，在每帧更新对象的位置和渲染场景
  loop();
}

/** 创建 three js 的基础内容 三要素： scene camera render + control event*/
function initThree() {
  initScene();
  initCamera();
  initRenderer();
  initLights();
  initEvent();
  // 扩展内容
  initControls();
  initStats();
  initGui();
}

/** 场景初始化 */
function initScene() {
  scene = new THREE.Scene();
// scene.fog = new THREE.Fog(0xf7d9aa, 100, 950); //设置 雾化
}

/** 摄像机初始化 */
function initCamera() {
  // // 相机设置
  // camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.01, 1000 );
  // camera.position.set(0, 0, 5);
  // camera.lookAt(new THREE.Vector3(0, 0, 0));

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
  // this.camera.position.set(0, 5, 25);
  // office 视角和位置
  // this.camera.position.set(2, 16, 40); 
  // this.camera.lookAt(new THREE.Vector3(-50, 0, 10));
  // office 2 视角和位置
  camera.position.set(35, 10, 60); 
  camera.lookAt(new THREE.Vector3(0, -0.5, -3000));

}

/** 渲染器初始化 */
function initRenderer() {
  // 2选1
  // renderer = new THREE.WebGLRenderer(); // 普通渲染
  renderer = new THREE.WebGLRenderer({  // 打开特效
		alpha: true,  // 透明颜色，这样背景就是container 的背景
		antialias: true  // 打开抗锯齿 性能换效果
	});
	
  renderer.setSize(WIDTH, HEIGHT); // 渲染器的尺寸，默认采用全屏
  // renderer.setClearColor(0x050505);
  // renderer.shadowMap.enabled = true;// 启用阴影
  container.appendChild( renderer.domElement );  // 渲染内容加入倒 container 中
}

/** 控制器初始化 （可选） */
function initControls() {
  // 设置控制器，根据需求来确定
  // controls = new OrbitControls(camera, renderer.domElement);
  // //设置控制器的中心点
  // //controls.target.set( 0, 100, 0 );
  // // 如果使用animate方法时，将此函数删除
  // //controls.addEventListener( 'change', render );
  // // 使动画循环使用时阻尼或自转 意思是否有惯性
  // controls.enableDamping = true;
  // //动态阻尼系数 就是鼠标拖拽旋转灵敏度
  // //controls.dampingFactor = 0.25;
  // //是否可以缩放
  // controls.enableZoom = true;
  // //是否自动旋转
  // controls.autoRotate = false;
  // controls.autoRotateSpeed = 0.5;
  // //设置相机距离原点的最远距离
  // controls.minDistance = 1;
  // //设置相机距离原点的最远距离
  // controls.maxDistance = 2000;
  // //是否开启右键拖拽
  // controls.enablePan = true;

  /* 第一人称控件 */
  controls = new FirstPersonControls(camera);
  /* 属性参数默认 */
  controls.enabled = true;
  controls.lookSpeed = 0.1; //鼠标移动查看的速度
  controls.movementSpeed = 12; //相机移动速度
  controls.noFly = false;
  controls.constrainVertical = true; //约束垂直
  controls.verticalMin = 1;
  controls.verticalMax = 2.0;
  controls.heightCoef = 0;
  // controls.lookVertical = false;
  controls.heightMin = 2;
  controls.heightMax = 5;
  controls.lon = 0; //进入初始视角x轴的角度
  controls.lat = 0; //初始视角进入后y轴的角度
}

/** 性能控件（可选） */
function initStats() {
  stats = new Stats();
  container.appendChild( stats.dom );
}

/** GUI 界面（可选） */
function initGui() {
  gui = new GUI( { width: 180 } );
  
  gui.add(controls, 'enabled').name('允许动作').listen();
  gui.add(controls, 'movementSpeed', 0, 50).name('移动速度').listen();
  gui.add(controls, 'lookSpeed', 0, 1).name('查看速度').listen();
  gui.add(controls, 'lookVertical').name('上下观察').listen();
  gui.add(controls, 'autoForward').name('自动前行').listen();
  gui.add(controls, 'activeLook').name('四处观察').listen();
  gui.add(controls, 'moveForward').name('前进').listen();
  gui.add(controls, 'moveBackward').name('后退').listen();
  gui.add(controls, 'moveLeft').name('左行').listen();
  gui.add(controls, 'moveRight').name('右行').listen();
}

/** 事件初始化 */
function initEvent() {
  window.addEventListener('resize', onWindowResize, false);// 设置窗体尺寸变化时相应的设置
  window.addEventListener( 'keydown', onWindowKeydown);
}

/** 窗体大小改变响应事件 */ 
function onWindowResize() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  camera.aspect = WIDTH / HEIGHT;
  renderer.setSize( WIDTH, HEIGHT);
  camera.updateProjectionMatrix();
}

function onWindowKeydown(event) {
  switch ( event.keyCode ) {
      case 32: // Spacebar
          controls.enabled = !controls.enabled;
          console.log("current position:", camera.position);
          console.log("current rotation:", camera.rotation);
          break;
  }
}
/** 设置光线 */
function initLights() {
  // 根据需要添加灯光
  // scene.add( new THREE.AmbientLight( 0x8FBCD4, 0.4 ) );// 添加一个环境光

  // 如果后期不调整，不放入属性
  scene.add(new THREE.AmbientLight(0x0c0c0c));

  const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );
  
  let spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-400, -400, -400);
  scene.add(spotLight);

  let spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(400, 800, 400);
  scene.add(spotLight2);
   
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//  常用修改内容区域
//////////////////////////////////////////////////////////////////////////////////////////////////

/** 根据需要添加对象 */ 
function initContents() {
  // sample 对象操作
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial( { color: 0x003366 } );
  // const cube = new THREE.Mesh( geometry, material );
  // objects.push(cube);
  // scene.add( cube );

  let mtlLoader = new MTLLoader();
  mtlLoader.load('assets/models/city.mtl', function (materials) {

  let objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

    objLoader.load('assets/models/city.obj', function (object) {

        let scale = chroma.scale(['red', 'green', 'blue']);

        setRandomColor(object, scale);
        console.log(object);
        scene.add(object);

        // document.getElementById('loading').style.display = 'none';
    });
  });

}

function setRandomColor(object, scale) {
  // console.log(object);
  let children = object.children;
  if (children && children.length > 0) {
      children.forEach(function (e) {
          setRandomColor(e, scale );
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

/** 内置组件的更新 */
function commonUpdate() {

  if(stats) {
    stats.update();
  }

  if(controls) {
    // controls.update();
    
    controls.update(clock.getDelta());
  }

}


/** 循环处理 */
function loop() {
  // console.log(scene);
  requestAnimationFrame( loop );
  
  commonUpdate();
  
  // objects[0].rotation.x += 0.01;
  // objects[0].rotation.y += 0.01;

  renderer.render( scene, camera );
};

