import * as THREE from 'three'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

// 可选根据实际需求
import  { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Joint, SixAxisRC } from './js/SixAxis';

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
var joints = [];
var rc;
var targetPoint;
const args = {
  a: 44.5,
  b: 15,
  d: 70,
  i: 11.5,
  f: 79.5,
  g: 10,
}

var target = {x:100, y:100, z:0};
var guiControl = {};

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
  camera.position.set(0, 0, 300);
  // camera.lookAt(new THREE.Vector3(0, 0, 0));
  // camera.up.set(0,0,0)
  // camera.rotateY(1);
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

function getRandom (positive=false) {
  const min = 35;
  const max = 120;
  const r1 = Math.random()* (max-min)+min;
  if (positive) {
    return r1;
  }
  const r2 = Math.random();
  return r2 > 0.5 ? r1 : -r1;
}


/** GUI 界面（可选） */
function initGui() {
  gui = new GUI( { width: 180 } );
  const targetFolder = gui.addFolder('目标位置');
  targetFolder.add(target, 'x').listen();
  targetFolder.add(target, 'y').listen();
  targetFolder.add(target, 'z').listen();

  guiControl.start = function(){
    // alert('好了你看你好奇了吧！！！先看看目标: ' + JSON.stringify(target));
    targetPoint.position.set(target.x, target.y, target.z);
    if (rc) {
      rc.moveToTarget(new THREE.Vector3(target.x, target.y, target.z));
    }
  };

  guiControl.random = function() {
    target.x = getRandom();
    target.y = getRandom(true);
    target.z = getRandom();
  
    guiControl.start();
  }
  
  gui.add(guiControl, "start").name("移动目标");
  gui.add(guiControl, "random").name("随机目标");
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
  // 顶光
  const light = new THREE.SpotLight( 0xffffff, 0.8 );
  light.position.set( 0, 1000, 400 );
  light.angle = Math.PI * 0.2;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = - 0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add( light );
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
  scene.add( new THREE.AxesHelper( 100 ) );
  buildTargetPoint();
  loadRobot();
  // demoRobot();

}

function buildTargetPoint() {
  const geometry = new THREE.SphereGeometry( 5, 32, 32 );
  const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  targetPoint = new THREE.Mesh( geometry, material );
  objects.push( targetPoint);
  scene.add( targetPoint );
}


function demoRobot() {
  const group = new THREE.Group();
  group.name = 'Robot';
  scene.add(group);

  /////////////////////////
  let edgesMtl =  new THREE.LineBasicMaterial({color: 0xffffff});
  /////////////////////////
  const baseGeo = new THREE.CylinderGeometry( 50, 80, args.a-args.b, 36 );
  const baseMtl = new THREE.MeshBasicMaterial( {color: 0x003366} );
  const base = new THREE.Mesh( baseGeo, baseMtl );
  base.name = 'base';
  base.position.y = (args.a- args.b)/2;
  const baseEdges = new THREE.EdgesGeometry(baseGeo);
  const baseLine = new THREE.LineSegments(baseEdges, edgesMtl);
  base.add(baseLine);
  group.add(base);

  ///////////////////////// 围绕 y 轴旋转
  // const axis1Geo = new THREE.BoxGeometry( 2*args.b + 20, 10, 25 );
  const axis1 = new THREE.Group();
  const axis1Geo = new THREE.SphereGeometry( args.b);
  const axis1Mtl =  new THREE.MeshBasicMaterial( {color: 0xcc0066} );
  const axis1Mesh = new THREE.Mesh(axis1Geo, axis1Mtl);
  axis1.position.y = args.a / 2;
  // b.position.x = args.b/2;
  axis1.name = "axis1";
  axis1.add(axis1Mesh);
  axis1Mesh.position.x = args.b;
  base.add(axis1);

  

  //////////////////////////////////围绕z轴旋转
  const axis2 = new THREE.Group();
  const axis2Geo = new THREE.CylinderGeometry( 10, 10, args.d, 36 );
  const axis2Mtl =  new THREE.MeshBasicMaterial( {color: 0x006666} );
  const axis2Mesh = new THREE.Mesh(axis2Geo, axis2Mtl);
  axis2.name = "axis2";
  axis2.position.x = args.b;
  axis2Mesh.position.y = args.d/2;
  axis2.add(axis2Mesh);
  axis1.add(axis2);

  // axis2.rotateZ(-Math.PI/8);

  ///////////////////////////////// 围绕z轴旋转
  const axis3Geo = new THREE.SphereGeometry( args.i);
  const axis3Mtl =  new THREE.MeshBasicMaterial( {color: 0x00bbbb} );
  const axis3 = new THREE.Mesh(axis3Geo, axis3Mtl);
  axis3.name = 'axis3';
  axis3.position.y = args.d/2 + args.i;
  axis2Mesh.add(axis3);

  // axis3.rotateZ(-Math.PI/4);

  /////////////////////////////////围绕y轴旋转
  // const axis4Geo = 
  const axis4Geo = new THREE.CylinderGeometry(8,8, args.f, 36);
  const axis4Mtl =  new THREE.MeshBasicMaterial( {color: 0xcc6600} );
  const axis4 = new THREE.Mesh(axis4Geo, axis4Mtl);
  axis4.name = 'axis4';
  axis4.position.y = args.f / 2;
  axis3.add(axis4);

  ///////////////////////////////// 围绕z轴旋转
  const axis5Geo = new THREE.SphereGeometry(6);
  const axis5Mtl =  new THREE.MeshBasicMaterial( {color: 0x333333} );
  const axis5 = new THREE.Mesh(axis5Geo, axis5Mtl);
  axis5.name = 'axis5';
  axis5.position.y = args.f/2;
  axis4.add(axis5);
  
  //////////////////////////////////////// 围绕y轴旋转
  const axis6 = new THREE.Group();
  const axis6Geo = new THREE.BoxGeometry(20, 20, 20);
  const axis6Mtl =  new THREE.MeshBasicMaterial( {color: 0x000000,  wireframe : true} );
  const axis6Mesh = new THREE.Mesh(axis6Geo, axis6Mtl);
  axis6.name = 'axis6';
  axis6.add(axis6Mesh);
  axis6Mesh.position.y = 10 + 6
  axis5.add(axis6);

  // 定义 6 轴数组 及其附属 对象
  setAxis(1, axis1, 'y', -180, 180, 175, true);
  setAxis(2, axis2, 'z', -180, 65, 175, true);
  setAxis(3, axis3, 'z', -180, 75, 175, true);
  setAxis(4, axis4, 'y', -400, 400, 360, true);
  setAxis(5, axis5, 'z', -180, 60, 360, true);
  setAxis(6, axis6, 'y', -400, 400, 500, true);
  
  rc = new SixAxisRC(group, joints, args.a, args.b, args.d, args.i, args.f, args.g);
  rc.moveToZero();

  // 调试
  // axis1.rotateY(-Math.PI/4);
  // axis2.rotateZ(-Math.PI/4);
  // axis3.rotateZ(-Math.PI/4);
  // axis4.rotateY(-Math.PI/4);
  // axis5.rotateZ(-Math.PI/2);
  // axis6.rotateY(-Math.PI/4);
}

function loadRobot() {
  const file = "assets/models/loader.fbx";
  const loader = new FBXLoader();
  loader.load(file, function(object){

    const group = new THREE.Group();
    group.add(object);
    object.position.z = 0; // 调整位置对准坐标中心轴
    console.log(object);

    // 定义 6 轴数组 及其附属 对象
    setAxis(1, object.getObjectByName('IRB_2600-20_165__Axis1'), 'z', -180, 180, 175, true);
    setAxis(2, object.getObjectByName('IRB_2600-20_165__Axis2'), 'y', -180, 65, 175);
    setAxis(3, object.getObjectByName('IRB_2600-20_165__Axis3'), 'y', -180, 75, 175);
    setAxis(4, object.getObjectByName('IRB_2600-20_165__Axis4'), 'z', -400, 400, 360);
    setAxis(5, object.getObjectByName('IRB_2600-20_165__Axis5'), 'z', -180, 60, 360);
    setAxis(6, object.getObjectByName('IRB_2600-20_165__Axis6'), 'z', -400, 400, 500);
    setAxis(7, object.getObjectByName('SuctionGripper')); // 附属对象 一般就是 夹具吸盘之类的

    // rc = new SixAxisRC(object, joints, 44.5, 15, 70, 11.5, 79.5, 10);
    rc = new SixAxisRC(object, joints, args.a, args.b, args.d, args.i, args.f, args.g);
    console.log(rc);

    // runToZero();
    rc.moveToZero();

    objects.push(group);
    scene.add(group);
  });
}

function setAxis(i, o, a, min=-180, max=180, speed=175, reverse=false) {
  const joint = new Joint(i, o.uuid, o.name, o, a, min, max, 175, reverse);
  joints[i] = joint;
  if(joints[i-1]) {
    joints[i-1]._object.attach(o);
  }
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
  TWEEN.update();

  renderer.render( scene, camera );
};

