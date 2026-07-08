// ==UserScript==
// @name         MosWar Robot Button
// @namespace    https://www.moswar.ru/
// @version      8.0
// @description  Robot mech + talents
// @match        https://www.moswar.ru/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function(){
'use strict';

const ID='mw-robot-button';
const POS='mw_robot_button_position';
let notes=[];

if(document.getElementById(ID))return;

function sleep(ms){
    return new Promise(r=>setTimeout(r,ms));
}

function showNotify(text){
    let d=document.createElement('div');
    d.innerHTML=text;

    Object.assign(d.style,{
        position:'fixed',
        left:'50%',
        top:(80+notes.length*60)+'px',
        transform:'translateX(-50%)',
        background:'rgba(0,0,0,.85)',
        color:'#fff',
        padding:'12px 20px',
        borderRadius:'10px',
        fontSize:'18px',
        zIndex:1000000,
        textAlign:'center'
    });

    document.body.appendChild(d);
    notes.push(d);

    setTimeout(()=>{
        d.remove();
        notes=notes.filter(x=>x!==d);
        notes.forEach((x,i)=>{
            x.style.top=(80+i*60)+'px';
        });
    },2000);
}

async function sendPost(url,body){

    console.log('SEND:',url,body);

    let r=await fetch(url,{
        method:'POST',
        credentials:'include',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With':'XMLHttpRequest'
        },
        body
    });

    let t=await r.text();

    console.log('ANSWER:',url,t);

    try{
        return JSON.parse(t);
    }catch(e){
        console.error('JSON ERROR',e);
        return {};
    }
}

function hasError(data){
    return data && data.error;
}

async function activateNatal(type,num){

    let data=await sendPost(
        '/natal2026/',
        'action=activate-talant&type='+type+'&ajax=1&__referrer=%2Fnatal2026%2F&return_url=%2Fnatal2026%2F'
    );

    if(hasError(data)){
        showNotify('Талант №'+num+' в откате');
        return;
    }

    if(data.code==='revive'){
        showNotify('Вы получили бессмертие на 1 ход<br>Код: revive');
    }
    else if(data.code==='passive2'){
        showNotify('Вы получили немного статов<br>Код: passive2');
    }
    else if(data.code){
        showNotify('Код: '+data.code);
    }
}

async function runRobot(){

    console.log('=== ROBOT START ===');


    let mech=await sendPost(
        '/mech/',
        'action=overcharge&__referrer=%2Fmech%2F&return_url=%2Fmech%2F'
    );


    if(hasError(mech)){
        showNotify('Робот в откате');
    }
    else{
        showNotify('Робот запущен');
    }


    await sleep(50);


    await activateNatal('talants',2);


    await sleep(50);


    await activateNatal('abils',3);


    console.log('=== ROBOT END ===');
}


function createButton(){

    let b=document.createElement('div');
    b.id=ID;

    let p=JSON.parse(localStorage.getItem(POS)||'null');


    Object.assign(b.style,{
        position:'fixed',
        left:p?p.left:'20px',
        top:p?p.top:'80px',
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


    let img=document.createElement('img');
    img.src='/@/images/loc/robot/robot_3.png';
    img.width=55;
    img.height=55;
    b.appendChild(img);


    let drag=false;
    let moved=false;
    let dx=0;
    let dy=0;


    function start(x,y){
        drag=true;
        moved=false;
        dx=x-b.offsetLeft;
        dy=y-b.offsetTop;
    }


    function move(x,y){

        if(!drag)return;

        if(
            Math.abs(x-b.offsetLeft)>5 ||
            Math.abs(y-b.offsetTop)>5
        ){
            moved=true;
        }

        b.style.left=(x-dx)+'px';
        b.style.top=(y-dy)+'px';
    }


    function end(){

        if(!drag)return;

        drag=false;

        localStorage.setItem(
            POS,
            JSON.stringify({
                left:b.style.left,
                top:b.style.top
            })
        );
    }


    b.addEventListener('mousedown',e=>{
        start(e.clientX,e.clientY);
    });

    document.addEventListener('mousemove',e=>{
        move(e.clientX,e.clientY);
    });

    document.addEventListener('mouseup',end);


    b.addEventListener('touchstart',e=>{
        let t=e.touches[0];
        start(t.clientX,t.clientY);
    },{passive:false});


    b.addEventListener('touchmove',e=>{
        let t=e.touches[0];
        move(t.clientX,t.clientY);
        e.preventDefault();
    },{passive:false});


    b.addEventListener('touchend',end);


    b.onclick=()=>{
        if(!moved){
            runRobot();
        }
    };


    document.body.appendChild(b);
}


createButton();

})();
