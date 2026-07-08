// ==UserScript==
// @name         MosWar Robot Button
// @namespace    https://www.moswar.ru/
// @version      5.0
// @description  Robot mech + talents button
// @match        https://www.moswar.ru/*
// @grant        none
// @run-at       document-end
// ==/UserScript==


(function(){

'use strict';


const BUTTON_ID = 'mw-robot-button';
const POS_KEY = 'mw_robot_button_position';



if(document.getElementById(BUTTON_ID))
    return;





function sleep(ms){

    return new Promise(
        resolve=>setTimeout(resolve,ms)
    );

}







function showNotify(text){


    let old=document.getElementById(
        'mw-robot-notify'
    );


    if(old)
        old.remove();




    let div=document.createElement('div');


    div.id='mw-robot-notify';


    div.innerHTML=text;



    Object.assign(div.style,{

        position:'fixed',

        top:'50%',

        left:'50%',

        transform:'translate(-50%,-50%)',

        background:'rgba(0,0,0,.85)',

        color:'#fff',

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









async function sendPost(url,body){



    console.log(
        'SEND:',
        url,
        body
    );




    let response =
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




    let text =
    await response.text();



    console.log(
        'ANSWER:',
        text
    );




    try{


        return JSON.parse(text);


    }
    catch(e){


        return {};


    }


}









async function activateNatal(type,num){



    let data =
    await sendPost(

        '/natal2026/',


        'action=activate-talant&type='+
        type+
        '&ajax=1&__referrer=%2Fnatal2026%2F&return_url=%2Fnatal2026%2F'

    );




    console.log(
        'NATAL '+num,
        data
    );





    if(data.result !== 1){


        showNotify(
            'Талант №'+num+' в откате'
        );


        return data;


    }







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



console.log(
    'ROBOT START'
);




try{


    let mech =
    await sendPost(

        '/mech/',


        'action=overcharge&__referrer=%2Fmech%2F&return_url=%2Fmech%2F'

    );






    if(mech.result !== 1){


        showNotify(
            'Робот в откате'
        );


        return;


    }





    await sleep(50);






    await activateNatal(

        'talants',

        2

    );






    await sleep(50);






    await activateNatal(

        'abils',

        3

    );







}
catch(e){


    console.error(
        'ROBOT ERROR',
        e
    );


}



console.log(
    'ROBOT END'
);



}









function createButton(){



let btn =
document.createElement('div');


btn.id=BUTTON_ID;





let left='20px';

let top='80px';





let saved =
localStorage.getItem(
    POS_KEY
);





if(saved){


try{


let p =
JSON.parse(saved);


left=p.left;

top=p.top;



}
catch(e){}



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



img.src =
'/@/images/loc/robot/robot_3.png';



img.width=55;

img.height=55;



btn.appendChild(img);









let dragging=false;

let moved=false;

let dx=0;

let dy=0;








function startDrag(x,y){


dragging=true;

moved=false;


dx=x-btn.offsetLeft;

dy=y-btn.offsetTop;


}







function moveDrag(x,y){


if(!dragging)
return;




if(

Math.abs(x-btn.offsetLeft)>5 ||

Math.abs(y-btn.offsetTop)>5

)

moved=true;





btn.style.left =
(x-dx)+'px';



btn.style.top =
(y-dy)+'px';



}








function endDrag(){



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









btn.addEventListener(

'mousedown',

e=>{

startDrag(
e.clientX,
e.clientY
);

}

);






document.addEventListener(

'mousemove',

e=>{

moveDrag(
e.clientX,
e.clientY
);

}

);






document.addEventListener(

'mouseup',

endDrag

);









btn.addEventListener(

'touchstart',

e=>{


let t=e.touches[0];


startDrag(
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


moveDrag(
t.clientX,
t.clientY
);



e.preventDefault();


},

{passive:false}

);







btn.addEventListener(

'touchend',

endDrag

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
