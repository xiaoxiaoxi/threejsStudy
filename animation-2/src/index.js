import * as THREE from 'three'

// 可选根据实际需求
import  { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'

import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

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
// var prePostions = [];
var nextPositions = [];
var tweens = [];
var moveSpeed = 100; // 速度控制
/////////////////////////////////////////////////////
// 本次项目特定的内容
// var modelMesh, modelMeshHelp;
var guiControl = {};
var mixers = [];

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
  camera.position.set(100, 200, 300 );
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
  // 特定内容
  guiControl.play = true;
  gui.add(guiControl, "play").name("播放动画");
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

  const light = new THREE.DirectionalLight(0x888888);
  light.position.set(0, 200, 100 );

  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = -100;
  light.shadow.camera.left = -120;
  light.shadow.camera.right = 120;

  //告诉平行光需要开启阴影投射
  light.castShadow = true;

  scene.add(light);
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//  常用修改内容区域
//////////////////////////////////////////////////////////////////////////////////////////////////

/** 根据需要添加对象 */ 
function initContents() {
  loadEnvironment();
  loadContents();
}

function loadEnvironment() {
  // 地板
  var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x666666, depthWrite: false } ) );
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add( mesh );
  //添加地板割线
  var grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

}

/** 循环处理 */
function loop() {
  // console.log(scene);
  requestAnimationFrame( loop );
  if(stats) {
    stats.update();
  }

  if(controls) {
    controls.update();
  }

  // 播放动画的控制
  var time = clock.getDelta();
  // if (mixer) {
  //     mixer.update(time);
  // }

  if(guiControl.play) {
    for ( const mixer of mixers ) mixer.update( time );
    // update position 
    updatePosition();
  }

  renderer.render( scene, camera );
};

function updatePosition() {
  
  TWEEN.update();

  objects.forEach(function(v, i) {
    // replace by tween 
    // if(v.position.distanceTo(nextPositions[i]) > 0.1) {
    //   //尚未到达持续运动

    //   // 插值控制， 步长会越来越小，不容易收敛， 但是到达时候会减速
    //   // let p = new THREE.Vector3().lerpVectors( v.position, nextPositions[i], 0.05 );  // 根据当前距离插值计算， 最后收敛比较慢
    //   // console.log(v.position, nextPositions[i], p);
    //   // v.position.x = p.x;
    //   // v.position.z = p.z;

    //   // 绝对步长控制， 根据起始点计算绝对步长
    //   let p = new THREE.Vector3().lerpVectors( prePostions[i], nextPositions[i], 0.005 ).sub(prePostions[i]);  // 固定步长
    //   // console.log(prePostions[i], nextPositions[i], p);
    //   v.position.x += p.x;
    //   v.position.z += p.z;
    // } else {
    // // 到达指定位置 移动完成
    //   prePostions[i] = nextPositions[i];
    //   nextPositions[i] = getPosition(); // 计算一个新的位置
    // }
    if(v.position.distanceTo(nextPositions[i]) < 0.01) {
      // 到达
      // prePostions[i] = nextPositions[i];  // 看看是否还需要
      setNetPosition(i);
    }

  });
}

///////////////////////////////////////////////

function getPosition() {
  const size = 400;
  return new THREE.Vector3(
    Math.ceil(Math.random()*(2*size)) - size, 
    100,
    Math.ceil(Math.random()*(2*size) - size)
    );
}

function loadContents() {
  
  let loader = new FBXLoader();
  loader.load("assets/models/Naruto.fbx", function (mesh) {
  // const loader = new GLTFLoader();
  // loader.load( '/assets/models/Soldier.glb', function ( gltf ) {
      // const mesh = gltf.scene;
    // console.log(mesh);
    //设置模型的每个部位都可以投影
    mesh.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    buildContents(mesh);
    // scene.add(gltf.scene);
  });
}

function buildContents(mesh) {
  for(var i=0; i<mesh.animations.length; i++){
    cloneModel(mesh, i);
  }
}

function cloneModel(object, num) {
  let p = getPosition();  // 计一个随机的position 
  // const cloneObj = object.clone();
  objects[num] = SkeletonUtils.clone( object ); // 对象克隆
  objects[num].twinData = {name: "小悟空" + num + "号"};
  objects[num].traverse( function ( child ) {
    if ( child.isMesh ) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  // 设定 position 
  objects[num].position.set(p.x, p.y, p.z);
  // replace with TWEEN 
  // prePostions[num] = p;
  setNetPosition(num);


  mixers[num] = new THREE.AnimationMixer( objects[num] );
  mixers[num].clipAction( object.animations[num] ).play(); // idle

  scene.add(objects[num]);
}

function setNetPosition(num) {
  let p = getPosition();  // 计一个随机的position 
  nextPositions[num] = p;
  if(!tweens[num]) {
    tweens[num] = new TWEEN.Tween(objects[num].position);
  }
  var time = p.distanceTo(objects[num].position) / moveSpeed;
  tweens[num].to({x:p.x, y:p.y, z:p.z}, time * 1000).start(); // 设置插值动画
}

