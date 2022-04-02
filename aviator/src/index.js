import * as THREE from 'three'

// windows 相关的常量
const container = document.getElementById( 'container' );
// 设定尺寸
var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

// 核心三要素
var scene, camera, renderer;
var fieldOfView, aspectRatio, nearPlane, farPlane;

// 存放所有对象的数组，根据实际需求来确定
var objects = []; 

window.addEventListener('load', init, false);

/** 初始化方法 */
function init() {
  // alert("Hello Xiaoxi!");

  // 创建场景，相机和渲染器
  initScene();

  // 添加光源  
  initLights();

  // 添加对象
  initContents();

  // 添加 event 控制
  document.addEventListener('mousemove', onMouseMove, false);


  // 调用循环函数，在每帧更新对象的位置和渲染场景
  loop();
}

/** 创建 three js 的基础内容 三要素： scene camera render */
function initScene() {
  // 场景设置
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950); //设置 雾化

  // 相机设置
  aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
  camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);

  // 设置相机位置
  camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;


  // 渲染器设置
	renderer = new THREE.WebGLRenderer({ 
		alpha: true,  // 透明颜色，这样背景就是container 的背景
		antialias: true  // 打开抗锯齿 性能换效果
	});
 
  // 渲染器的尺寸，默认采用全屏
	renderer.setSize(WIDTH, HEIGHT);

  // 启用阴影
	renderer.shadowMap.enabled = true;

  // 渲染内容加入倒 container 中
  container.appendChild( renderer.domElement );

  // 设置窗体尺寸变化时相应的设置
  window.addEventListener('resize', onWindowResize, false);
}

/** 窗体大小改变响应事件 */ 
function onWindowResize() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  camera.aspect = WIDTH / HEIGHT;
  renderer.setSize( WIDTH, HEIGHT);
  camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

/** 设置光线 */
function initLights() {
  // 根据需要添加灯光
  // scene.add( new THREE.AmbientLight( 0x8FBCD4, 0.4 ) );// 添加一个环境光
  // A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
 
	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;
 
	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
 
	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

/////////////////////////////////////////////////////////////////////////////////////////////
// contents 
/////////////////////////////////////////////////////////////////////////////////////////////
// First let's define a Sea object :

import { Sea } from './js/sea';
import { Sky } from './js/sky';
import { AirPlane } from './js/airplane';

var sea; // Instantiate the sea and add it to the scene:
 
function createSea(){
	sea = new Sea();
 	// push it a little bit at the bottom of the scene
	sea.mesh.position.y = -600;
 	// add the mesh of the sea to the scene
	scene.add(sea.mesh);
}

var sky;
 
function createSky(){
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}

var airplane;
 
function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}

/** 根据需要添加对象 */ 
function initContents() {
  // sample 对象操作
  createSea();
  createSky();
  createPlane();
}

var mousePos={x:0, y:0};
 
// now handle the mousemove event
function onMouseMove(event) {
 	// here we are converting the mouse position value received 
	// to a normalized value varying between -1 and 1;
	// this is the formula for the horizontal axis:
	var tx = -1 + (event.clientX / WIDTH)*2;

	// for the vertical axis, we need to inverse the formula 
	// because the 2D y-axis goes the opposite direction of the 3D y-axis
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};
}


/** 循环处理 */
function loop() {
  // console.log(scene);

  // Rotate the propeller, the sea and the sky
	// airplane.propeller.rotation.x += 0.3;
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;

  // update the plane on each frame
	updatePlane();

  renderer.render( scene, camera );
  requestAnimationFrame( loop );
};


function updatePlane() {
  // let's move the airplane between -100 and 100 on the horizontal axis, 
	// and between 25 and 175 on the vertical axis,
	// depending on the mouse position which ranges between -1 and 1 on both axes;
	// to achieve that we use a normalize function (see below)
	
	var targetX = normalize(mousePos.x, -1, 1, -100, 100);
	var targetY = normalize(mousePos.y, -1, 1, 25, 175);
 
	// update the airplane's position
	airplane.mesh.position.y = targetY;
	airplane.mesh.position.x = targetX;
	airplane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin, tmax){
 	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;
}
