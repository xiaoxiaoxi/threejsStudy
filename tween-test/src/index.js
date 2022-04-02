import * as THREE from 'three'

// 可选根据实际需求
import  { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

// windows 相关的常量
const container = document.getElementById( 'container' );
// 设定尺寸
var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

// 核心三要素
var scene, camera, renderer;
var stats, controls, gui; // 扩展内容(可选)

// 存放所有对象的数组，根据实际需求来确定
var objects = []; 
var tweens =[];

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
  camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.01, 1000 );
  camera.position.set(5, 5, 200);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
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
  controls = new OrbitControls(camera, renderer.domElement);
  //设置控制器的中心点
  //controls.target.set( 0, 100, 0 );
  // 如果使用animate方法时，将此函数删除
  //controls.addEventListener( 'change', render );
  // 使动画循环使用时阻尼或自转 意思是否有惯性
  controls.enableDamping = true;
  //动态阻尼系数 就是鼠标拖拽旋转灵敏度
  //controls.dampingFactor = 0.25;
  //是否可以缩放
  controls.enableZoom = true;
  //是否自动旋转
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.5;
  //设置相机距离原点的最远距离
  controls.minDistance = 1;
  //设置相机距离原点的最远距离
  controls.maxDistance = 2000;
  //是否开启右键拖拽
  controls.enablePan = true;
}

/** 性能控件（可选） */
function initStats() {
  stats = new Stats();
  container.appendChild( stats.dom );
}

/** GUI 界面（可选） */
function initGui() {
  gui = new GUI( { width: 180 } );
}

/** 事件初始化 */
function initEvent() {
  window.addEventListener('resize', onWindowResize, false);// 设置窗体尺寸变化时相应的设置
}

/** 窗体大小改变响应事件 */ 
function onWindowResize() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  camera.aspect = WIDTH / HEIGHT;
  renderer.setSize( WIDTH, HEIGHT);
  camera.updateProjectionMatrix();
}

/** 设置光线 */
function initLights() {
  // 根据需要添加灯光
  scene.add( new THREE.AmbientLight( 0x8FBCD4, 0.4 ) );// 添加一个环境光
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//  常用修改内容区域
//////////////////////////////////////////////////////////////////////////////////////////////////

/** 根据需要添加对象 */ 
function initContents() {
  // sample 对象操作
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x003366 } );
  const cube = new THREE.Mesh( geometry, material );
  objects.push(cube);
  scene.add( cube );
  var tween = new TWEEN.Tween(cube.position).to( {x:5, y:5, z:198}, 1000).start();
  var tween2 = new TWEEN.Tween(cube.rotation).to( {x:Math.PI, y:Math.PI, z:Math.PI}, 3000);
  var tween3 = new TWEEN.Tween(cube.position).to( {x:0, y:0, z:0}, 1000);
  var tween4 = new TWEEN.Tween(cube.rotation).to( {x:-Math.PI, y:-Math.PI, z:-Math.PI}, 3000);
  tween.chain(tween2);
  tween2.chain(tween3);
  tween3.chain(tween4);
  tween4.chain(tween);
}

/** 内置组件的更新 */
function commonUpdate() {

  if(stats) {
    stats.update();
  }

  if(controls) {
    controls.update();
  }

}


/** 循环处理 */
function loop() {
  // console.log(scene);
  requestAnimationFrame( loop );
  
  commonUpdate();
  
  // objects[0].rotation.x += 0.01;
  // objects[0].rotation.y += 0.01;

  TWEEN.update();

  renderer.render( scene, camera );
};

