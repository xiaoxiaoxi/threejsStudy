import {TWEEN} from 'three/examples/jsm/libs/tween.module.min.js'

var box = document.getElementById("greenBox"), count = 0, tween;

tween = TWEEN.to(box, 2, {left:"740px", repeat:10, yoyo:true, onRepeat:onRepeat, repeatDelay:0.5, ease:Linear.easeNone});

function onRepeat() {
    count++;
    box.innerHTML = count;
    TweenLite.set(box, {backgroundColor:"hsl(" + Math.random() * 255 + ", 90%, 60%)"});
}
