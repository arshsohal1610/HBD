"use strict";
const screens=[...document.querySelectorAll(".screen")];
const show=name=>{screens.forEach(screen=>screen.classList.toggle("active",screen.dataset.screen===name));window.scrollTo(0,0)};
document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>show(button.dataset.go)));
const loader=document.getElementById("loading");
window.setTimeout(()=>{if(loader)loader.classList.add("done");},350);

const wishes=[
 ["May your dreams come true","I wish ki tuhade sarre supne poore hon specially Abroad jaan da supna, tusi jyada irritate vi esse lyi hunde oh na. so, I wish ki tuhadi life di sab ton waddi khushi mile tuhanu"],
 ["May success follow you","Tusi apni mehnat naal financially independent bano, changa kmao, te apne saare supne poore karo. Te haan, ik din mainu gifts naal spoil kro — thodi jehi cute wish aa meri, mai jdo vi kuch manga, mainu osse time lai k dedo, je mai kuch bola ki mai kuch khana a te paisea da na sochna pave. ♡"],
 ["May happiness always find you","Main chahundi aa ke tuhanu hamesha sukoon, changi sehat, confidence, hasse te zindagi de sohne experiences milde rehan."],
 ["May you always feel supported","Tuhadi family tuhanu hamesha pyaar deve, te har mushkil ch tuhanu hamesha support te himmat mile."],
 ["Whatever path life chooses","Sab ton vadh main eh chahundi aa ke tusi khush ravo. Tuhanu oh sab mile jinna layi tusi mehnat karde o, oh sukoon mile jo tusi deserve karda o, te tuhade kol hmesha muskraun de reasons hon. Sade layi zindagi jo vi likhe, main hamesha tuhade layi changa hi mangoongi."]
];
let wish=0;const page=document.getElementById("wishPage"),counter=document.getElementById("wishCount"),previous=document.getElementById("prevWish"),next=document.getElementById("nextWish");
function drawWish(){page.innerHTML=`<h2>${wishes[wish][0]}</h2><p>${wishes[wish][1]}</p>`;counter.textContent=`0${wish+1} / 0${wishes.length}`;previous.disabled=wish===0;next.innerHTML=wish===wishes.length-1?"One last thing <span>♡</span>":"Next wish <span>→</span>"}
next.addEventListener("click",()=>{if(wish===wishes.length-1)show("final");else{wish+=1;drawWish()}});previous.addEventListener("click",()=>{if(wish>0){wish-=1;drawWish()}});drawWish();
