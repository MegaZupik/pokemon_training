// ==UserScript==
// @name         MosWar Robot Button Notifications
// @namespace    https://www.moswar.ru/
// @version      3.0
// @description  Robot button with response codes
// @match        https://www.moswar.ru/*
// @grant        none
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
r=>setTimeout(r,ms)
);

}








function showNotify(text){


let old =
document.getElementById(
'mw-robot-notify'
);



if(old)
old.remove();




let div =
document.createElement('div');


div.id='mw-robot-notify';


div.innerHTML=text;



Object.assign(div.style,{

position:'fixed',

top:'50%',

left:'50%',

transform:'translate(-50%,-50%)',

background:'rgba(0,0,0,.85)',

color:'white',

padding:'15px 25px',

borderRadius:'12px',

fontSize:'18px',

zIndex:1000000,

textAlign:'center'

});




document.body.appendChild(div);




setTimeout(()=>{


div.remove();


},2000);


}










async function postNatal(type){


let r =
await fetch(
'/natal2026/',
{

method:'POST',

credentials:'include',

headers:{

'Content-Type':
'application/x-www-form-urlencoded; charset=UTF-8',

'X-Requested-With':
'XMLHttpRequest'

},


body:

'action=activate-talant&type='
+type+
'&ajax=1&__referrer=%2Fnatal2026%2F&return_url=%2Fnatal2026%2F'


}

);



let data =
await r.json();



console.log(
'NATAL RESPONSE:',
data
);





if(data.code==='revive'){


showNotify(
'Вы получили бессмертие на 1 ход<br>Код: revive'
);


}



else if(data.code==='passive2'){


showNotify(
'Вы получили немного статов<br>Код: passive2'
);


}



else if(data.code){


showNotify(
'Код: '+data.code
);


}




return data;



}









async function doAll(){



try{


// мех

await fetch(
'/mech/',
{

method:'POST',

credentials:'include',

headers:{

'Content-Type':
'application/x-www-form-urlencoded; charset=UTF-8',

'X-Requested-With':
'XMLHttpRequest'

},

body:

'action=overcharge&__referrer=%2Fmech%2F&return_url=%2Fmech%2F'

}

);



await sleep(50);






// талант

await postNatal(
'talants'
);



await sleep(50);





// способности

await postNatal(
'abils'
);



await sleep(50);





// предмет

let item =
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
'ITEM:',
await item.json()
);




}
catch(e){

console.error(e);

}


}









function createButton(){



let btn =
document.createElement('div');


btn.id=BUTTON_ID;





let pos =
localStorage.getItem(POS_KEY);



let left='20px';

let top='80px';



if(pos){

try{

let p=
JSON.parse(pos);

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

touchAction:'none'

});







let img =
document.createElement('img');


img.src=
'/@/images/loc/robot/robot_3.png';


img.width=55;

img.height=55;



btn.appendChild(img);









let drag=false;

let moved=false;

let dx=0;

let dy=0;






function start(x,y){

drag=true;

moved=false;

dx=x-btn.offsetLeft;

dy=y-btn.offsetTop;

}







function move(x,y){


if(!drag)
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

if(!drag)
return;


drag=false;



localStorage.setItem(

POS_KEY,

JSON.stringify({

left:btn.style.left,

top:btn.style.top

})

);

}





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







btn.onclick=()=>{


if(moved)
return;


doAll();


};





document.body.appendChild(btn);


}






createButton();



})();
