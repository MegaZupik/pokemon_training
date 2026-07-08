// ==UserScript==
// @name         Pokemon Training x50
// @namespace    http://tampermonkey.net/
// @version      1.3
// @match        https://*.moswar.ru/*
// @name         MosWar Robot Multi Button
// @namespace    https://www.moswar.ru/
// @version      2.0
// @description  Robot button: mech + natal talents + abilities + item use
// @match        https://www.moswar.ru/*
// @grant        none
// @updateURL    https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js
// @downloadURL  https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js
// @run-at       document-end
// ==/UserScript==
(function(){

'use strict';


const BUTTON_ID='mw-robot-button';
const POS_KEY='mw_robot_button_position';



if(document.getElementById(BUTTON_ID))
return;




function sleep(ms){

return new Promise(
resolve=>setTimeout(resolve,ms)
);

}







async function post(url,body){


let r =
await fetch(
url,
{

method:'POST',

credentials:'include',

headers:{

'Content-Type':
'application/x-www-form-urlencoded; charset=UTF-8',

'X-Requested-With':
'XMLHttpRequest'

},

body:body

}
);


return r;

}









async function doAll(){



try{


// 1 мех

await post(
'/mech/',
'action=overcharge&__referrer=%2Fmech%2F&return_url=%2Fmech%2F'
);


await sleep(50);





// 2 таланты

await post(
'/natal2026/',
'action=activate-talant&type=talants&ajax=1&__referrer=%2Fnatal2026%2F&return_url=%2Fnatal2026%2F'
);


await sleep(50);





// 3 способности

await post(
'/natal2026/',
'action=activate-talant&type=abils&ajax=1&__referrer=%2Fnatal2026%2F&return_url=%2Fnatal2026%2F'
);


await sleep(50);





// 4 использование предмета

await fetch(
'/player/json/use/196104865/',
{

method:'GET',

credentials:'include',

headers:{

'X-Requested-With':
'XMLHttpRequest'

}

}
);





console.log(
'Robot actions completed'
);


location.reload();



}
catch(e){

console.error(
'Robot error:',
e
);

}


}









function createButton(){



let btn =
document.createElement('div');


btn.id=BUTTON_ID;



let left='20px';
let top='80px';




let saved =
localStorage.getItem(POS_KEY);



if(saved){


try{

let p=JSON.parse(saved);

left=p.left;

top=p.top;


}catch(e){}


}








Object.assign(btn.style,{

position:'fixed',

left:left,

top:top,

width:'65px',

height:'65px',

background:'#333',

border:'2px solid #aaa',

borderRadius:'12px',

zIndex:999999,

display:'flex',

alignItems:'center',

justifyContent:'center',

touchAction:'none',

userSelect:'none'

});







let img =
document.createElement('img');


img.src=
'/@/images/loc/robot/robot_3.png';


img.width=55;

img.height=55;



btn.appendChild(img);









let dragging=false;

let moved=false;

let dx=0;

let dy=0;







function start(x,y){

dragging=true;

moved=false;

dx=x-btn.offsetLeft;

dy=y-btn.offsetTop;

}







function move(x,y){


if(!dragging)
return;



if(
Math.abs(x-btn.offsetLeft)>5 ||
Math.abs(y-btn.offsetTop)>5
)

moved=true;




btn.style.left=
(x-dx)+'px';


btn.style.top=
(y-dy)+'px';


}








function end(){


if(!dragging)
return;


dragging=false;



localStorage.setItem(

POS_KEY,

JSON.stringify({

left:btn.style.left,

top:btn.style.top

})

);


}







// мышь

btn.addEventListener(
'mousedown',
e=>start(
e.clientX,
e.clientY
)
);


document.addEventListener(
'mousemove',
e=>move(
e.clientX,
e.clientY
)
);


document.addEventListener(
'mouseup',
end
);








// телефон

btn.addEventListener(
'touchstart',
e=>{

let t=e.touches[0];

start(
t.clientX,
t.clientY
);

},
{passive:false}
);




btn.addEventListener(
'touchmove',
e=>{

let t=e.touches[0];

move(
t.clientX,
t.clientY
);

e.preventDefault();

},
{passive:false}
);





btn.addEventListener(
'touchend',
end
);







btn.onclick=function(){


if(moved)
return;


doAll();


};






document.body.appendChild(btn);


}







createButton();



})();
