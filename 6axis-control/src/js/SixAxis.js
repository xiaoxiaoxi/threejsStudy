import * as THREE from 'three'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

/**
 * 工具函数限制 value 的最大最小值
 */
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}


/**
 * 每一个轴的定义
 */
export class Joint {
    /**
     * 
     * @param {int} i: 当前轴编号 1~6 （有效编号，但是可以扩展，例如 7 作为夹具，0 作为基础）
     * @param {String} id: 当前实体对象唯一编号uuid
     * @param {String} name： 当前对象名称
     * @param {THREE.Object3D} object ： 当前对象实体
     * @param {"x|y|z"} axis ： 对象围绕运动的轴
     * @param {int} min 最小值
     * @param {int} max  最大值
     * @param {int} speed 运行速度（每秒）
     * @param {boolean} reverse 是否反向， 默认顺时针为正，逆时针为负， 如果 反向需要设置 reverse 为 true
     */
    constructor(i, id, name, object, axis, min, max, speed, reverse=false) {
        this._i = i;
        this._id = id;
        this._name = name;
        this._object = object;
        this._axis = axis;
        this._min = min;
        this._max = max;
        this._speed = speed / 1000; // 转换成毫秒
        this._direction = reverse ? -1 : 1;
    }

    /**
     * 指定当前轴到达的角度
     * @param {int} degree 运行角度
     * @param {int} accelarate 上是否加快速度 默认是1
     */
    tween(degree, accelarate=1) {
        const value = this._direction * Math.PI*degree/180;  // 角度转弧度
        const curDegree = this._getCurrentDegree();
        const time = Math.abs(degree - curDegree) / (this._speed*accelarate);

        switch (this._axis) {
            case "x" || "X":
                return this._getTween().to({x:value}, time);
                break
            case "y" || "Y":
                return this._getTween().to({y:value}, time);
                break
            case "z" || "Z":
                return this._getTween().to({z:value}, time);
                break
        }        
    }

    /**
     * 获取当前的角度
     * @returns 
     */
    _getCurrentDegree() {
        var rValue = 0;
        switch (this._axis) {
            case "x" || "X":
                rValue = this._object.rotation.x;
                break
            case "y" || "Y":
                rValue = this._object.rotation.y;
                break
            case "z" || "Z":
                rValue = this._object.rotation.z;
                break
        }
        return rValue*180 / Math.PI;
    }



    /**
     * 获取当前对象的插值动画对象
     */
    _getTween() {
        if(!this._tween) {
            this._tween = new TWEEN.Tween(this._object.rotation);
        }
        return this._tween;
    }

}

/**
 * ////////////////////////////////////////////////////////////////////////////////////////
 * 6轴运动控制器
 *    -----------假定这里现在是 orgin 的位置
 *   i|   f     |g  （axis3 控制水平和垂直可变位置）
 *    +
 *    |
 *    |d  （axis2 控制水平和垂直的距离）
 *    |
 *  b | （水平不变长度）
 * ----o2（特殊点， 计算时候的原点， 在控件中是围绕 o 以b为半径旋转的点 不是固定点）
 * |a   （旋转度数 axis 1， 高度不变量）
 * -------------
 * # 运动模型参考 https://zhuanlan.zhihu.com/p/386162938
 * ///////////////////////////////////////////////////////////////////////////////////////// 
 */
export  class SixAxisRC {

    /**
     * 
     * @param {*} object 当前机械臂整体对象
     * @param {*} joints 6个关节轴的定义 一个数组（1~6) 可以多定义0作为基础，7 作为夹具
     * @param {int} a 底盘高度
     * @param {int} b 腰轴偏移量
     * @param {*} d 大臂长度
     * @param {*} i 小臂到大臂之间的偏移量
     * @param {*} f 小臂的长度
     * @param {*} g 夹具的长度
     */
    constructor(object, joints, a, b, d, i, f, g) {
        this._object = object;
        this._joints = joints;
        this._a = a;
        this._b = b;
        this._d = d;
        this._i = i;
        this._f = f;
        this._g = g;

        // 基础数据
        this._o = object.position; //当前对象的坐标为原点位置
        this._o2 = new THREE.Vector2(this._b, this._a);
        this._localTarget = new THREE.Vector3(0, 0, 0); 

        // 动画控制
        this._tweens = [];
    }

    /**
     * 用来重设当前关节的
     * @param {int} i 
     * @param {Joint} joint 
     */
    setJoint(i, joint) {
        this._joints[i] = joint;
    }

    /**
     * 所有轴移动到0点
     */
    moveToZero() {
        //简单化处理了需要先考虑 停止 tween
        // const tweens = [];
        this._stopTweens();

        //
        for (var i=0; i<6; i++) {
            // set tweens chain 
            this._tweens[i] = this._joints[i+1].tween((i==2 ) ? 90 : 0, 1);
            // this._tweens[i] = this._joints[i+1].tween(0, 1);
            if(i>0) {
                this._tweens[i-1].chain(this._tweens[i]);
            }
        }
        console.log(this._tweens);
        this._tweens[0].start();        
    }

    /**
     * 机械臂移动到指定的目标点
     * @param {THREE.Vector3} target 移动到目标点
     */
    moveToTarget(target) {
        // this._tweens = [];
        this._stopTweens();

        // 获得目标位置相对坐标
        this._target = target;
        // const oldPoint = new THREE.Vector3().copy(this._localTarget); //TODO 暂时还未起做用
        if(!this._localTarget) {
            this._localTarget = new THREE.Vector3();
        }
        this._localTarget = this._localTarget.subVectors(target, this._o); //得到相对坐标
        console.log("current target local position!", this._localTarget);

        //分别计算水平和垂直的运动位置
        this._hMovement();
        this._vMovement();

        // 设置动画链
        // this._tweens[0].chain(this._tweens[1]);
        this._tweens[1] ? this._tweens[0].chain(this._tweens[1]) : console.log("no action for jonit 1");
        this._tweens[2] ? this._tweens[1].chain(this._tweens[2]) : console.log("no action for jonit 2");
        this._tweens[4] ? this._tweens[2].chain(this._tweens[4]) : console.log("no action for jonit 4");
        
        this._tweens[0].start();
    }

    /**
     * 水平移动
     * 腰部运动是逆时针为正顺时针为负
     */
    _hMovement() {
        const p2D = new THREE.Vector2(this._localTarget.x, this._localTarget.z);
        // const old2D = new THREE.Vector2(oldPoint.x, oldPoint.z);
        const angle = p2D.angle();
        // const oldAngle = old2D.angle();
        // console.log(p2D, angle);
        this._tweens[0] = this._joints[1].tween(angle*180/Math.PI, 1);
    }

    /**
     * 垂直运动
     */
    _vMovement() {
        const p2D = this._getLocatTargetVPoint();
        // console.log("the v point for o2", p2D); 

        const h = Math.sqrt(Math.pow(this._i, 2) + Math.pow(this._f,2));
        const q = Math.sqrt(Math.pow(p2D.x, 2) + Math.pow((p2D.y + this._g), 2));

        if(q>(h+this._d)) {
            // 无法到达的点 不进行处理
            console.warn("somgthing is wrong, q is to much!!!", p2D, this, this._d, h, q);    
        } else {
            //TODO： ？？？ 补偿是否作为各个轴的参数保存？ 
            console.debug("vMovement argument", p2D, this, h, q);
            // 大臂摆动角度 
            const alta = Math.PI /2 - this._getAngleJoint(this._d, q, h, (p2D.y  + this._g), q);
            this._tweens[1] = this._joints[2].tween(alta * 180 / Math.PI, 1);
            //小臂摆动角度
            const beta = Math.PI  - this._getAngleJoint(this._d, h, q, this._f, h) + Math.PI/2; // TODO: 需要加上一个90度的补偿
            this._tweens[2] = this._joints[3].tween(beta * 180 / Math.PI, 1); 
    
            console.debug("vMovement result: ", alta, beta);
    
            // const endDegree = altaDegree - betaDegree;
            const end = Math.PI - (alta + beta);  // TODO: 增加了 90 度的补偿
            this._tweens[4] = this._joints[5].tween(end * 180 / Math.PI, 1); // 小臂运行需要加上90度
        }
    }

    /**
     * // 求中间三角形的夹角参数, 主要是用来返回运动模型中 alta1+alta2 和 beta1+beta2
     * @param {double} e1 三角形夹角边1
     * @param {double} e2 三角形夹角边2
     * @param {double} o 三角型对边
     * // 求直角三角形的夹角参数
     * @param {double} a 直角三角形对边
     * @param {double} c 直角三角形斜边
     */
    _getAngleJoint(e1, e2, o, a, c) {
        const s = (Math.pow(e1, 2) + Math.pow(e2,2) - Math.pow(o,2))/(2*e1*e2)
        console.debug("中间三角形： 夹角边1, 夹角边2, 对边, 余弦", e1, e2, o, s);
        console.debug("直角三角形： 对边， 斜边", a, c);
        const r1 = Math.abs(Math.acos(clamp(s, -1, 1)));
        const r2 = Math.abs(Math.asin(a/c));
        const radian = r1+ r2;

        // const radian2 = 90 - Math.abs(r1*180/Math.PI) - Math.abs(r2*180/Math.PI);
        // console.log("r1, r2, r", r1, r2, radian * 180 / Math.PI, radian2);
        console.debug("r1, r2, r, degree", r1, r2, radian, radian * 180 / Math.PI);

        // 用角度计算
        // const d1 = r1*180/Math.PI;
        // const d2 = r2*180/Math.PI;
        // const degree = 90 - d1 - d2;
        // console.debug("d1, d2, d", d1, d2, degree);

        // return radian * 180 / Math.PI;  // 返回角度
        return radian;
    }

    // _clamp(v, min, max) {
    //     return Math.min(Math.max(v, min), max);
    // }

    /**
     * 获取垂直切面的坐标点
     * @returns 
     */
    _getLocatTargetVPoint() {
        // 在垂直切面相对于原点的位置点
        let c = this._localTarget.length();
        c = clamp(c, this._o2.length(), this._o2.length() + this._d + this._f);
        const y = this._localTarget.y;
        // 通过当前点的 x, z 坐标计算出当前崔志切面的 x 坐标
        const x = Math.sqrt(Math.pow(this._localTarget.x, 2 ) + Math.pow(this._localTarget.z, 2));
        // console.log("v point c, y, x", c, y, x, x2);

        const p = new THREE.Vector2(x, y);  // 当前节点垂直切面坐标位置
        return new THREE.Vector2().subVectors(p, this._o2); // 偏移以o2为计算的原点坐标
    }

    /**
     * 停止当前机械臂的动作
     */
    _stopTweens() {
        if(this._tweens && this._tweens[0]) {
            this._tweens[0].stop();
        }
        this._tweens = [];
    }
}

