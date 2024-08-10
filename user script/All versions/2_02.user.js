// ==UserScript==
// @name         Dragons of the Void - Raid Loot Tiers
// @version      2.02
// @author       Matrix4348
// @description  Look at raid loot tiers in-game.
// @license      MIT
// @namespace    https://greasyfork.org/users/4818
// @match        https://play.dragonsofthevoid.com/*
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

// Global variables.
// Raid tiers were taken from: https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972
// Loot drops data and a few loot tiers were taken from https://docs.google.com/spreadsheets/d/1r70QLIbz4xBYAu1PWy9Sn-lRrR3pyosH6bxvtWkSXQU/edit#gid=1404823998

class raid {
    constructor(a,b,c,dmg,d,e,f,g,h,i,j,k,l,m,n,o) {
        this.raid_size=a; // "Small", "Medium", "Large", "Immense" or "World"
        this.raid_type=b; // "", "Guild raid" or "World raid"
        this.loot_format=c; // "EHL" or "image"
        this.damage={type:dmg[0]||"?",Easy:dmg[1]||"?",Hard:dmg[2]||"?",Legendary:dmg[3]||"?"};
        this.FS={Easy:d[0]||"0",Hard:d[1]||"0",Legendary:d[2]||"0"};
        this["Easy tiers"]=e;
        this["Hard tiers"]=f;
        this["Legendary tiers"]=g;
        if(e[0]==this.FS.Easy){this.Easy="<b>"+e[0]+"=FS</b>";} else{this.Easy=e[0];} // easy loot tiers, put as a character string
        for(let k=1; k<e.length; k++){ if(e[k]==this.FS.Easy){this.Easy=this.Easy+" | <b>"+e[k]+"=FS</b>";} else{this.Easy=this.Easy+" | "+e[k];} }
        if(f[0]==this.FS.Hard){this.Hard="<b>"+f[0]+"=FS</b>";} else{this.Hard=f[0];} // hard loot tiers, put as a character string
        for(let k=1; k<f.length; k++){ if(f[k]==this.FS.Hard){this.Hard=this.Hard+" | <b>"+f[k]+"=FS</b>";} else{this.Hard=this.Hard+" | "+f[k];} }
        if(g[0]==this.FS.Legendary){this.Legendary="<b>"+g[0]+"=FS</b>";} else{this.Legendary=g[0];} // legendary loot tiers, put as a character string
        for(let k=1; k<g.length; k++){ if(g[k]==this.FS.Legendary){this.Legendary=this.Legendary+" | <b>"+g[k]+"=FS</b>";} else{this.Legendary=this.Legendary+" | "+g[k];} }
        this["Loot table"]=h; // link to the loot table if it exists
        this.has_hidden_loot=i||false;
        this.has_summoner_loot=j||false;
        k=k||[[],[],[]]; l=l||[[],[],[]]; m=m||[[],[],[]]; n=n||[[],[],[]]; o=o||[[],[],[]]; // the drop data
        for(let v1 of [0,1,2]){
            for(let v2=0;v2<this[["Easy","Hard","Legendary"][v1]+" tiers"].length;v2++){
                if(typeof(k[v1][v2])=="undefined"){ k[v1][v2]="?"; }
                if(typeof(l[v1][v2])=="undefined"){ l[v1][v2]="?"; }
                if(typeof(m[v1][v2])=="undefined"){ m[v1][v2]="?"; }
                if(this.has_hidden_loot){ if(typeof(n[v1][v2])=="undefined"){ n[v1][v2]="?"; } } else{ if(typeof(n[v1][v2])=="undefined"){ n[v1][v2]=0; } }
                if(this.has_summoner_loot){ if(typeof(o[v1][v2])=="undefined"){ o[v1][v2]="?"; } } else{ if(typeof(o[v1][v2])=="undefined"){ o[v1][v2]=0; } }
            }
        };
        this.Common={Easy:k[0],Hard:k[1],Legendary:k[2]};
        this.Rare={Easy:l[0],Hard:l[1],Legendary:l[2]};
        this.Mythic={Easy:m[0],Hard:m[1],Legendary:m[2]};
        this.Hidden={Easy:n[0],Hard:n[1],Legendary:n[2]};
        this.Summoner={Easy:o[0],Hard:o[1],Legendary:o[2]};
        this.drops={Easy:[], Hard:[], Legendary:[]}; // lists of detailed drop data as character strings
        for(let k=0; k<this["Easy tiers"].length; k++){
            this.drops.Easy[k]=this.Common.Easy[k]+" | "+this.Rare.Easy[k]+" | "+this.Mythic.Easy[k]+" | "+this.Hidden.Easy[k]+" | "+this.Summoner.Easy[k];
        }
        for(let k=0; k<this["Hard tiers"].length; k++){
            this.drops.Hard[k]=this.Common.Hard[k]+" | "+this.Rare.Hard[k]+" | "+this.Mythic.Hard[k]+" | "+this.Hidden.Hard[k]+" | "+this.Summoner.Hard[k];
        }
        for(let k=0; k<this["Legendary tiers"].length; k++){
            this.drops.Legendary[k]=this.Common.Legendary[k]+" | "+this.Rare.Legendary[k]+" | "+this.Mythic.Legendary[k]+" | "+this.Hidden.Legendary[k]+" | "+this.Summoner.Legendary[k];
        }
    }
}

var raid_list={
    //"raid name":new raid("Size","Raid type","EHL or image",["damage taken"],[FS],["easy tiers"],["hard tiers"],["legendary tiers"],"loot table.png",has_hidden_loot,has_summoner_loot,[[],[],[]],[[],[],[]],[[],[],[]],[[],[],[]],[[],[],[]]),
    "Basiliscus":new raid("World","World raid","image",[],[],[],[],["https://cdn.discordapp.com/attachments/739356891762655372/1051162576899280916/Basiliscus.png"],"https://cdn.discordapp.com/attachments/739356891762655372/1051162576899280916/Basiliscus.png"),
    "Corrupted Golem":new raid("Medium","","EHL",["Physical",30,50,210],["240,000","720,000","2,160,000"],["2,000","10,000","20,000","40,000","80,000","120,000","180,000","240,000","300,000","360,000","480,000","600,000"],["10,000","30,000","60,000","120,000","180,000","250,000","350,000","450,000","600,000","720,000","1,100,000","1,500,000","2,200,000"],["???","2,160,000","???","6,000,000?"],"",false,true,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[]],[[],[],[]],[[],[],[]]),
    "Elven Rangers":new raid("Small","","EHL",["Physical",12,35,190],["100,000","300,000","900,000"],["90?","4,000","10,000","20,000","40,000","60,000","80,000","100,000","120,000","150,000","180,000","240,000"],["1,000","10,000","20,000","40,000","80,000","100,000","150,000","200,000","250,000","300,000","400,000","550,000","750,000"],["5,000","20,000","75,000","150,000","300,000","450,000","600,000","900,000","1,000,000","1,200,000","1,500,000","1,800,000","2,000,000"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,5,5,5,5,6,6]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,2,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[0,0,0,0,0,0,1,1,1,1,2,2,3]],[[],[],[]],[[],[],[]]),
    "Galeohog":new raid("Large","","EHL",["Poison",25,44,220],["220,000","660,000","1,980,000"],["2,500","10,000","20,000","40,000","80,000","110,000","150,000","175,000","220,000","330,000","440,000","750,000","1,200,000","1,760,000"],["?","34,000?","84,000?","160,026?","250,000","350,000","485,000","660,000","1,447,000?","2,475,000?","3,270,000","4,400,000","5,280,000"],["90,000","170,000","435,000","780,000","1,100,000","1,620,000","1,980,000","3,150,000","4,250,000","6,520,000","10,100,000","12,200,000","15,840,000"],"",true,false,[[1,2,2,2,3,3,3,4,4,5,5,6,7,7],[1,2,2,2,3,3,3,4,4,5,5,5,6,6],[]],[[0,0,1,2,2,2,3,3,3,4,4,5,5,5],[0,0,1,2,2,2,2,2,3,3,3,3,3,4],[]],[[0,0,0,0,0,1,1,1,2,2,3,3,3,4],[0,0,0,0,0,1,2,2,2,2,3,3,3,3],[]],[[],[],[]],[[],[],[]]),
    "Greater Ent":new raid("Medium","","EHL",["Nature",16,38,200],["160,000","480,000","1,440,000"],["500","4,000","8,000","20,000","40,000","80,000","120,000","160,000","200,000","240,000","300,000","370,000"],["2,000","15,000","30,000","60,000","120,000","180,000","240,000","300,000","400,000","480,000","640,000","960,000","1,200,000"],["???","1,440,000","???","3,600,000?"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[]],[[],[],[]],[[],[],[]]),
    "Jagar the Red":new raid("Immense","","EHL",["Fire",35,60,260],["320,000","960,000","2,880,000"],["40,000?","50,000?","85,000?","120,000?","160,000?","220,000?","260,000?","320,000","540,000?","800,000?","1,280,000?","1,940,000?","2,500,000?","3,200,000"],["80,000","137,000","226,000","252,000","468,000","?","?","?","768,000","960,000","1,680,000","2,360,000","4,135,000","6,190,000","7,910,000","9,600,000"],["???","2,880,000","4,400,000","5,800,000","11,600,000","17,400,000","23,400,000","28,800,000"],"",false,false,[[2,2,2,3,4,4,5,5,5,6,6,6,6,6],[],[]],[[0,1,2,2,2,2,2,3,3,3,3,4,5,5],[],[]],[[0,0,0,0,0,1,1,1,2,2,3,3,3,4],[],[]],[[],[],[]],[[],[],[]]),
    "Lesser Tree Ent":new raid("Small","","EHL",["Nature",6,40,120],["20,000","60,000","180,000"],["100?","1,000","2,000","5,000","10,000","20,000","30,000","50,000"],["200?","5,000","10,000","20,000","30,000","60,000","87,000","90,000","120,000"],["1,000","10,000","30,000","60,000","90,000","120,000","180,000","200,000","240,000","300,000"],"",false,false,[[2,2,3,4,4,4,4,5],[1,2,3,3,3,3,4,4,5],[2,2,3,4,4,4,4,5,6,6]],[[0,1,2,2,2,2,3,3],[0,1,1,2,2,3,3,4,4],[0,1,2,2,2,3,4,4,4,4]],[[0,0,0,0,1,2,2,3],[0,0,0,0,1,2,2,2,3],[0,0,0,0,1,2,2,2,2,3]],[[],[],[]],[[],[],[]]),
    "Naga Karamati":new raid("Large","","EHL",["Lightning",26,50,230],["240,000","720,000","2,160,000"],["2,000","10,000","20,000","40,000","80,000","120,000","175,000","240,000","320,000","450,000","580,000","840,000","1,350,000","1,920,000"],["15,000","50,000","120,000","180,000","240,000","400,000","600,000","720,000","1,120,000","1,600,000","2,400,000","3,200,000","4,400,000","5,760,000"],["???","2,160,000","???","17,280,000?"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5,6,7],[1,2,2,3,3,4,5,5,5,6,6,6,6,7],[]],[[0,0,1,2,2,2,2,2,3,3,4,4,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4,5],[]],[[0,0,0,0,0,0,1,2,2,2,2,3,3,4],[0,0,0,0,0,0,0,1,1,1,2,2,3,3],[]],[[],[],[]],[[],[],[]]),
    "Naga Risaldar":new raid("Large","","EHL",["Poison",15,38,220],["150,000","450,000","1,350,000"],["2,500","5,000","15,000","30,000","75,000","100,000","120,000","150,000","180,000","200,000","300,000","400,000","600,000","800,000","1,200,000"],["???","450,000","???","3,600,000?"],["???","1,350,000","???","10,800,000?"],"",false,false,[[1,2,2,2,3,3,3,3,4,5,5,5,6,7,7],[],[]],[[0,0,1,2,2,2,3,3,3,3,4,4,5,5,5],[],[]],[[0,0,0,0,0,1,1,2,2,2,2,3,3,3,4],[],[]],[[],[],[]],[[],[],[]]),
    "Sand Wyrm":new raid("Small","","EHL",["Physical",20,40,200],["250,000","750,000","2,250,000"],["1,000","10,000","25,000","50,000","100,000","150,000","200,000","250,000","300,000","380,000","450,000","530,000"],["15,000","35,000","75,000","150,000","225,000","300,000","400,000","500,000","625,000","750,000","1,000,000","1,500,000","2,000,000"],["100,000","250,000","500,000","800,000","1,100,000","1,500,000","1,750,000","2,250,000","2,750,000","3,250,000","4,000,000","4,750,000","5,500,000"],"",true,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,4,5,5,5,6,6]],[[0,0,1,1,1,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,3,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3,3],[0,0,0,0,0,0,1,1,1,1,2,3,3]],[[],[],[]],[[],[],[]]),
    "Skliros, the General of Cruelty":new raid("World","World raid","image",[],[],[],[],["https://cdn.discordapp.com/attachments/830113306399604826/922193128134426704/Skliros.png"],"https://cdn.discordapp.com/attachments/830113306399604826/922193128134426704/Skliros.png"),
    "Superior Watcher":new raid("Medium","","EHL",["Magic",8,32,180],["80,000","240,000","720,000"],["200?","2,000","5,000","10,000","20,000","40,000","60,000","80,000","110,000","140,000","160,000","200,000"],["200?","5,000","10,000","20,000","40,000","80,000","120,000","160,000","200,000","240,000","300,000","400,000","480,000"],["5,000","20,000","60,000","120,000","240,000","360,000","480,000","720,000","840,000","960,000","1,080,000","1,200,000","1,440,000"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,5,5,5,5,6,6]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,2,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[0,0,0,0,0,0,1,1,1,1,2,3,3]],[[],[],[]],[[],[],[]]),
};

var options_div, main_div, in_raid_div, detailed_div;
var button_pressed=false, in_raid_button_pressed=false;
var difficulties_to_display_default={"Easy":1,"Hard":1,"Legendary":1};
var automatically_show_in_raid_div_default=1, show_detailed_div_default=true, show_advanced_view_default=false;
var current_tab_default="All raids";
var difficulties_to_display, automatically_show_in_raid_div, current_tab, show_detailed_div, show_advanced_view;
var custom_colours={"Easy":"rgb(0,255,0)","Hard":"rgb(255,165,0)","Legendary":"rgb(238,130,238)","Main":"rgb(153,255,170)","Buttons":"rgb(153,187,255)"};
var colourless_mode_default=0, colourless_mode, current_difficulty;

// Workaround to an unexpected compatibility issue with some GM_* functions in Greasemonkey 4.

if( typeof(GM_getValue)=="undefined" ){ GM_getValue=GM.getValue; }
if( typeof(GM_setValue)=="undefined" ){ GM_setValue=GM.setValue; }

// Functions.

async function initialize_saved_variables(){ // Note: Just in case, global variables and stored variables will be used in parallel.
    difficulties_to_display={};
    difficulties_to_display.Easy=await GM_getValue("Easy_stored",difficulties_to_display_default.Easy);
    difficulties_to_display.Hard=await GM_getValue("Hard_stored",difficulties_to_display_default.Hard);
    difficulties_to_display.Legendary=await GM_getValue("Legendary_stored",difficulties_to_display_default.Legendary);
    current_tab=await GM_getValue("current_tab_stored",current_tab_default);
    automatically_show_in_raid_div=await GM_getValue("automatically_show_in_raid_div_stored",automatically_show_in_raid_div_default);
    show_detailed_div=await GM_getValue("show_detailed_div_stored",show_detailed_div_default);
    show_advanced_view=await GM_getValue("show_advanced_view_stored",show_advanced_view_default);
    colourless_mode=await GM_getValue("colourless_mode_stored",colourless_mode_default);
}

function pressButton(){
    if(button_pressed==true){ options_div.style.display="none"; main_div.style.display="none"; button_pressed=false; }
    else{ options_div.style.display=""; main_div.style.display=""; button_pressed=true; }
}

function create_main_button(){
    var b=document.createElement("button");
    b.id="DotVRLT main button";
    b.innerHTML="Raid tiers";
    b.style.fontSize="18px";
    b.style.width="55px";
    b.style.height="50px";
    b.style.borderRadius="50%";
    b.style.backgroundColor="rgb(153,187,255)";
    b.onclick=pressButton;
    document.getElementsByClassName("dotv-nav")[0].appendChild(b);
}

function create_main_div(){
    var d=document.createElement("div");
    d.id="DotVRLT main div";
    d.style.width="500px";
    d.style.height="500px";
    d.style.display="none";
    d.style.borderRadius="30px";
    d.style.overflow="auto";
    d.style.backgroundColor="rgb(153, 255, 170)";
    d.style.border="1px solid black";
    d.style.position="absolute";
    d.style.zIndex="100000";
    var button_boundaries=document.getElementById("DotVRLT main button").getBoundingClientRect();
    d.style.left=button_boundaries.x+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+10+"px";
    document.body.appendChild(d);
    main_div=d;
}

function set_main_div(){
    var td=document.createElement("div");
    td.id="DotVRLT main title div"; td.style.fontSize="22px"; td.style.width="100%"; td.style.height="50px"; td.style.textAlign="center"; main_div.appendChild(td);
    var tt=document.createElement("div");
    tt.id="DotVRLT main table div"; tt.style.width="100%"; tt.style.height="450px"; tt.style.overflow="auto"; main_div.appendChild(tt);
}

function create_options_div(){
    var d=document.createElement("div");
    d.id="DotVRLT options div";
    d.style.width="500px";
    d.style.height="190px";
    d.style.display="none";
    d.style.borderRadius="30px";
    d.style.overflow="auto";
    d.style.backgroundColor="rgb(153, 255, 170)";
    d.style.border="1px solid black";
    d.style.position="absolute";
    d.style.zIndex="100000";
    var button_boundaries=document.getElementById("DotVRLT main button").getBoundingClientRect();
    d.style.left=button_boundaries.x-d.style.width.substring(0,d.style.width.length-2)-10+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+10+"px";
    document.body.appendChild(d);
    options_div=d;
}

function create_options_title_div(){
    var t=document.createElement("div");
    t.id="DotVRLT options title div";
    t.style.width="100%";
    t.style.height="40px";
    t.innerHTML="Options";
    t.style.fontSize="22px";
    t.style.textAlign="center";
    options_div.appendChild(t);
}

function create_difficulty_div(){
    var d=document.createElement("div");
    d.id="DotVRLT difficulty div";
    d.style.width="100%";
    d.style.height="30px";
    d.style.fontSize="15px";
    d.style.textAlign="left";
    options_div.appendChild(d);
}

function createNewCheckbox(div, id, content){
    var a=document.createElement("span");
    div.appendChild(a);
    var checkbox = document.createElement("input");
    checkbox.type= "checkbox";
    checkbox.id = id;
    a.appendChild(checkbox);
    var t=document.createElement("span");
    t.innerHTML=content;
    a.appendChild(t);
    return checkbox;
}

function create_difficulty_selector(){
    var d=document.getElementById("DotVRLT difficulty div");
    var t=document.createElement("span");
    t.innerHTML="Difficulty to display: ";
    d.appendChild(t);
    var all=createNewCheckbox(d, "DotVRLT show all checkbox", " All ");
    var easy=createNewCheckbox(d, "DotVRLT show easy checkbox", " Easy ");
    var hard=createNewCheckbox(d, "DotVRLT show hard checkbox", " Hard ");
    var legendary=createNewCheckbox(d, "DotVRLT show legendary checkbox", " Legendary ");
    easy.defaultChecked=difficulties_to_display.Easy;
    easy.onclick=async function(){
        difficulties_to_display.Easy=easy.checked;
        await GM_setValue("Easy_stored",difficulties_to_display.Easy);
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    hard.defaultChecked=difficulties_to_display.Hard;
    hard.onclick=async function(){
        difficulties_to_display.Hard=hard.checked;
        await GM_setValue("Hard_stored",difficulties_to_display.Hard);
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    legendary.defaultChecked=difficulties_to_display.Legendary;
    legendary.onclick=async function(){
        difficulties_to_display.Legendary=legendary.checked;
        await GM_setValue("Legendary_stored",difficulties_to_display.Legendary);
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    all.defaultChecked=difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary;
    all.onclick=async function(){
        difficulties_to_display.Easy=all.checked;
        await GM_setValue("Easy_stored",difficulties_to_display.Easy);
        easy.checked=all.checked;
        difficulties_to_display.Hard=all.checked;
        await GM_setValue("Hard_stored",difficulties_to_display.Hard);
        hard.checked=all.checked;
        difficulties_to_display.Legendary=all.checked;
        await GM_setValue("Legendary_stored",difficulties_to_display.Legendary);
        legendary.checked=all.checked;
        createTab(current_tab);
    };
}

function createTable(name,size,type){
    document.getElementById("DotVRLT main title div").innerHTML=name;
    var t=document.createElement("table");
    t.width="100%";
    t.border="1";
    t.style.textAlign="center";
    t.style.fontSize="14px";
    document.getElementById("DotVRLT main table div").appendChild(t);
    if(show_advanced_view==false){
        t.innerHTML=`<tr> <td>Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> </tr>`;
        let diffsum=difficulties_to_display.Easy+difficulties_to_display.Hard+difficulties_to_display.Legendary;
        for(let k in raid_list){
            if( ((size=="All")||(raid_list[k].raid_size==size))&&((type=="All")||(raid_list[k].raid_type==type)) ){
                if(raid_list[k].loot_format=="EHL"){
                    if(diffsum>0){
                        let firstdiff=1;
                        for(let j of ["Easy","Hard","Legendary"]){
                            if(difficulties_to_display[j]==1){
                                let tl=t.insertRow();
                                if(firstdiff==1){
                                    tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_type+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_size+`</td> <td>`+j+`</td> <td>`+raid_list[k][j]+`</td>`;
                                    firstdiff=0;
                                }
                                else{
                                    tl.innerHTML=`<td>`+j+`</td> <td>`+raid_list[k][j]+`</td>`;
                                }
                            }
                        }
                    }
                }
                else if(raid_list[k].loot_format=="image"){
                    let tllt=t.insertRow();
                    tllt.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k].raid_type+`</td> <td>`+raid_list[k].raid_size+`</td> <td colspan="2" style="word-break:break-all"><i>`+raid_list[k]["Loot table"]+`</i></td>`;
                }
            }
        }
    }
    else{
        t.innerHTML=`<tr> <td>Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> <td>common | rare | mythic | hidden | summoner</td></tr>`;
        for(let k in raid_list){
            let diffsum=difficulties_to_display.Easy*raid_list[k]["Easy tiers"].length+difficulties_to_display.Hard*raid_list[k]["Hard tiers"].length+difficulties_to_display.Legendary*raid_list[k]["Legendary tiers"].length;
            if( ((size=="All")||(raid_list[k].raid_size==size))&&((type=="All")||(raid_list[k].raid_type==type)) ){
                if(raid_list[k].loot_format=="EHL"){
                    if(diffsum>0){
                        let firstdiff=1;
                        for(let j of ["Easy","Hard","Legendary"]){
                            if(difficulties_to_display[j]==1){
                                let tl=t.insertRow();
                                var tiers0_text=raid_list[k][j+" tiers"][0];
                                if(tiers0_text==raid_list[k].FS[j]){ tiers0_text="<b>FS: "+tiers0_text+"</b>"; }
                                if(firstdiff==1){
                                    tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_type+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_size+`</td> <td rowspan="`+raid_list[k][j+" tiers"].length+`">`+j+`</td> <td>`+tiers0_text+`</td> <td>`+raid_list[k].drops[j][0]+`</td>`;
                                    firstdiff=0;
                                }
                                else{
                                    tl.innerHTML=`<td rowspan="`+raid_list[k][j+" tiers"].length+`">`+j+`</td> <td>`+tiers0_text+`</td> <td>`+raid_list[k].drops[j][0]+`</td>`;
                                }
                                for(let v=1; v<raid_list[k][j+" tiers"].length; v++){
                                    let tlv=t.insertRow();
                                    var tiers_text=raid_list[k][j+" tiers"][v];
                                    if(tiers_text==raid_list[k].FS[j]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
                                    tlv.innerHTML=`<td>`+tiers_text+`</td> <td>`+raid_list[k].drops[j][v]+`</td>`;
                                }
                            }
                        }
                    }
                }
                else if(raid_list[k].loot_format=="image"){
                    let tllt=t.insertRow();
                    tllt.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k].raid_type+`</td> <td>`+raid_list[k].raid_size+`</td> <td colspan="3" style="word-break:break-all"><i>`+raid_list[k]["Loot table"]+`</i></td>`;
                }
            }
        }
    }
}

function createAboutTab(){
    document.getElementById("DotVRLT main title div").innerHTML="Dragons of the Void - Raid Loot Tiers";
    var moi=document.createElement("div");
    moi.innerHTML="Version "+GM_info.script.version+", by Matrix4348";
    moi.style.fontSize="12px";
    document.getElementById("DotVRLT main title div").appendChild(moi);
    document.getElementById("DotVRLT main table div").style.fontSize="14px";
    document.getElementById("DotVRLT main table div").innerHTML=`
    <p>Most of the data is taken either from <a href='https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972'>
    this spreadsheet</a> (which I am not related to) or from another of the community documents
    <a href='https://docs.google.com/document/d/1rU5HoUzPvDm_RpM9gpY0pBJBz55OVY-VcNF1ukT2ySA/edit'>gathered by NorionV</a>, so if there are holes there, then there will likely be
    holes here, too.</p>
    <br>
    <p>If I forgot anything or if you find any bugs, do not forget to report them to me, either on
    <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/feedback'>Greasyfork</a> (if you have an account) or anywhere else you might find me.
    I am also always open to suggestions.</p>
    <br>
    <p>Update logs can be found <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/versions'>here</a>.</p>`;
}

async function createTab(name){
    document.getElementById("DotVRLT main title div").innerHTML="";
    document.getElementById("DotVRLT main table div").innerHTML="";
    if(name=="About"){ createAboutTab(); }
    else if(name=="Small"){ createTable("Small raids","Small","All"); }
    else if(name=="Medium"){ createTable("Medium raids","Medium","All"); }
    else if(name=="Large"){ createTable("Large raids","Large","All"); }
    else if(name=="Immense"){ createTable("Immense raids","Immense","All"); }
    else if(name=="World"){ createTable("World raids","World","All"); }
    else if(name=="Guild raids"){ createTable("Guild raids","All","Guild raid"); }
    else if(name=="World raids"){ createTable("World raids","All","World raid"); }
    else if(name=="All raids"){ createTable("All raids","All","All"); }
    else if(name=="Damage taken"){ createDamageTakenTable(); }
    current_tab=name;
    await GM_setValue("current_tab_stored",current_tab);
}

function createTabButton(div,bname){
    var b=document.createElement("button");
    b.innerHTML=bname;
    b.style.fontSize="14px";
    b.style.width=bname.length*(b.style.fontSize.substring(0,b.style.fontSize.length-2)-3)+"px";
    b.style.height="25px";
    b.style.marginLeft="2px";
    b.style.marginRight="2px";
    b.onclick=function(){ createTab(bname); };
    div.appendChild(b);
}

function create_tab_buttons_div(){
    var t=document.createElement("div");
    t.id="DotVRLT tab buttons div"; t.style.width="100%"; t.style.height="90px"; t.style.textAlign="center"; options_div.appendChild(t);
    var t1=document.createElement("div");
    t1.innerHTML="Raid size: "; t1.style.fontSize="15px"; t1.style.width="100%"; t1.style.height="30px"; t1.style.textAlign="left"; t.appendChild(t1);
    var t2=document.createElement("div");
    t2.innerHTML="Raid type: "; t2.style.fontSize="15px"; t2.style.width="100%"; t2.style.height="30px"; t2.style.textAlign="left"; t.appendChild(t2);
    var t3=document.createElement("div");
    t3.innerHTML="Other: "; t3.style.fontSize="15px"; t3.style.width="100%"; t3.style.height="25px"; t3.style.textAlign="left"; t.appendChild(t3);
    createTabButton(t1,"Small");
    createTabButton(t1,"Medium");
    createTabButton(t1,"Large");
    createTabButton(t1,"Immense");
    createTabButton(t1,"World");
    createTabButton(t2,"Guild raids");
    createTabButton(t2,"World raids");
    createTabButton(t2,"All raids");
    createTabButton(t3,"Damage taken");
    createTabButton(t3,"About");
}

function create_extra_div(){
    var d=document.createElement("div");
    d.id="DotVRLT extra settings div";
    d.style.width="100%";
    d.style.height="25px";
    d.style.fontSize="15px";
    d.style.textAlign="center";
    options_div.appendChild(d);
    var adv=createNewCheckbox(d, "DotVRLT advanced view checkbox", " Toggle advanced view ");
    adv.defaultChecked=show_advanced_view;
    adv.onclick=async function(){
        show_advanced_view=adv.checked;
        await GM_setValue("show_advanced_view_stored",show_advanced_view);
        createTab(current_tab);
    };
    var col=createNewCheckbox(d, "DotVRLT colourless mode checkbox", " Toggle colourless mode ");
    col.defaultChecked=colourless_mode;
    col.onclick=async function(){
        colourless_mode=col.checked;
        await GM_setValue("colourless_mode_stored",colourless_mode);
        actualize_colours(colourless_mode);
    };
}

function in_raid_button(){
    var b=document.createElement("button");
    b.id="DotVRLT in-raid button";
    b.innerHTML="Loot tiers";
    b.style.fontSize="18px";
    b.style.width="127px";
    b.style.height="30px";
    b.style.top=document.getElementsByClassName("leader-board")[0].getBoundingClientRect().bottom+"px";
    b.style.marginTop="5px";
    b.style.borderRadius="30px";
    b.style.backgroundColor="rgb(153,187,255)";
    b.onclick=press_in_raid_button;
    document.getElementsByClassName("leader-board")[0].appendChild(b);
    in_raid_button_pressed=false;
}

function press_in_raid_button(){
    if(in_raid_button_pressed==true){ in_raid_div.style.display="none"; in_raid_button_pressed=false; detailed_div.style.display="none"; }
    else{
        in_raid_div.style.display="";
        in_raid_button_pressed=true;
        set_detailed_div_state();
        var t=document.getElementById("DotVRLT in-raid table div"), n=t.firstElementChild.clientHeight;
        if(n<t.clientHeight){
            t.style.height=n+"px";
            in_raid_div.style.height=in_raid_div.clientHeight-(80-n)+"px";
        }
    }
}

function create_in_raid_div(raid_name,raid_difficulty){
    var d=document.createElement("div");
    d.id="DotVRLT in-raid div";
    d.style.width="450px";
    d.style.height="130px";
    d.style.display="none";
    d.style.backgroundColor=custom_colours[raid_difficulty];
    d.style.border="1px solid black";
    d.style.borderRadius="30px";
    d.style.overflow="auto";
    d.style.position="absolute";
    d.style.zIndex="0";
    document.getElementsByClassName("broadcast-damage-container")[0].style.zIndex="1"; // Normal value is 0, but then the above z-index should be set to -1 and this would make the checkboxes unclickable.
    var button_boundaries=document.getElementById("DotVRLT in-raid button").getBoundingClientRect();
    d.style.left=button_boundaries.x+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+5+"px";
    document.getElementsByClassName("raid-container")[0].appendChild(d);
    in_raid_div=d;
    // Creation of the three subdivs.
    var td=document.createElement("div");
    td.id="DotVRLT in-raid table div"; td.style.width="100%"; td.style.height="80px"; d.appendChild(td);
    var tt=document.createElement("div");
    tt.id="DotVRLT in-raid settings div"; tt.style.width="100%"; tt.style.height="25px"; tt.style.fontSize="14px"; tt.style.textAlign="center";d.appendChild(tt);
    var tt2=document.createElement("div");
    tt2.id="DotVRLT detailed settings div"; tt2.style.width="100%"; tt2.style.height="25px"; tt2.style.fontSize="14px"; tt2.style.textAlign="center";d.appendChild(tt2);
    // Table creation.
    var t=document.createElement("table");
    t.width="100%";
    t.height="100%";
    t.border="1";
    t.style.textAlign="center";
    t.style.fontSize="14px";
    if(raid_list[raid_name].loot_format=="EHL"){
        t.innerHTML=`<td>`+raid_list[raid_name][raid_difficulty]+`</td>`;
    }
    else if(raid_list[raid_name].raid_type=="World raid"){
        t.innerHTML=`<td style="word-break:break-all">Latest loot table known by the script (be careful in case of a rerun): <i>`+raid_list[raid_name]["Loot table"]+`</i></td>`;
    }
    td.appendChild(t);
    // In-raid settings creation.
    var cb=createNewCheckbox(tt, "", " Automatically display relevant raid tiers when entering a raid");
    cb.defaultChecked=automatically_show_in_raid_div;
    cb.onclick=async function(){ automatically_show_in_raid_div=cb.checked; await GM_setValue("automatically_show_in_raid_div_stored",automatically_show_in_raid_div); };
    if(automatically_show_in_raid_div){ press_in_raid_button(); }
    var cb2=createNewCheckbox(tt2, "", " Display drop data (and more)");
    cb2.defaultChecked=show_detailed_div;
    cb2.onclick=async function(){ show_detailed_div=cb2.checked; await GM_setValue("show_detailed_div_stored",show_detailed_div); set_detailed_div_state(); };
}

function create_detailed_div(raid_name,raid_difficulty){
    var d=document.createElement("div");
    d.id="DotVRLT detailed div";
    d.style.width="400px";
    d.style.height="550px";
    d.style.display="none";
    d.style.backgroundColor=custom_colours[raid_difficulty];
    d.style.border="1px solid black";
    d.style.position="absolute";
    d.style.borderRadius="30px";
    d.style.overflow="auto";
    d.style.zIndex="20000";
    d.style.right="0px";
    var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
    d.style.top=magics_area.getBoundingClientRect().bottom-4+"px";
    document.getElementsByClassName("raid-container")[0].appendChild(d);
    detailed_div=d;
    // Table creation.
    if(raid_list[raid_name].loot_format=="EHL"){
        var ncol=4+raid_list[raid_name].has_hidden_loot+raid_list[raid_name].has_summoner_loot;
        var t=document.createElement("table");
        t.id="DotVRLT detailed table";
        t.width="100%"; t.height="100%"; t.border="1"; t.style.textAlign="center"; t.style.fontSize="14px";
        t.innerHTML=`<td colspan="`+ncol+`" style="font-size:18px;">`+raid_name+" ("+raid_difficulty+`)</td>`;
        d.appendChild(t);
        var r0=t.insertRow();
        if(raid_list[raid_name].raid_type!=""){ r0.innerHTML=`<td colspan="`+(2+raid_list[raid_name].has_hidden_loot)+`">`+raid_list[raid_name].raid_type+`</td> <td colspan="`+(2+raid_list[raid_name].has_summoner_loot)+`"> Size: `+raid_list[raid_name].raid_size+`</td>`; }
        else{ r0.innerHTML=`<td colspan="`+ncol+`"> Size: `+raid_list[raid_name].raid_size+`</td>`; }
        var r1=t.insertRow();
        var dmg=damage_taken(raid_list[raid_name].damage[raid_difficulty],raid_list[raid_name].damage.type);
        r1.innerHTML=`<td colspan="`+ncol+`"> Damage taken: `+dmg+` (base: `+raid_list[raid_name].damage[raid_difficulty]+`, type: `+raid_list[raid_name].damage.type.toLowerCase()+`)</td>`;
        var r2=t.insertRow(); r2.innerHTML=`<td rowspan="2">Damage</td><td colspan="`+(ncol-1)+`">Loot drops</td>`;
        var r3=t.insertRow(); r3.innerHTML=`<td>Common</td><td>Rare</td><td>Mythic</td>`;
        if(raid_list[raid_name].has_hidden_loot){ r3.innerHTML=r3.innerHTML+`<td>Hidden</td>`; }
        if(raid_list[raid_name].has_summoner_loot){ r3.innerHTML=r3.innerHTML+`<td>Summoner</td>`; }
        for(let k=0; k<raid_list[raid_name][raid_difficulty+" tiers"].length; k++){
            let r4=t.insertRow();
            let tiers_text=raid_list[raid_name][raid_difficulty+" tiers"][k];
            if(tiers_text==raid_list[raid_name].FS[raid_difficulty]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
            r4.innerHTML=`<td>`+tiers_text+`</td><td>`+raid_list[raid_name].Common[raid_difficulty][k]+`</td><td>`+raid_list[raid_name].Rare[raid_difficulty][k]+`</td><td>`+raid_list[raid_name].Mythic[raid_difficulty][k]+`</td>`;
            if(raid_list[raid_name].has_hidden_loot){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name].Hidden[raid_difficulty][k]+`</td>`; }
            if(raid_list[raid_name].has_summoner_loot){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name].Summoner[raid_difficulty][k]+`</td>`; }
        }
    }
    else if(raid_list[raid_name].loot_format=="image"){
        var i=document.createElement("img");
        i.id="DotVRLT detailed table";
        i.width="400"; i.height="550";
        i.src=raid_list[raid_name]["Loot table"];
        d.appendChild(i);
    }
    //
    set_detailed_div_state();
}

function set_detailed_div_state(){
    if(show_detailed_div&&in_raid_button_pressed){
        detailed_div.style.display="";
        var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
        detailed_div.style.top=magics_area.getBoundingClientRect().bottom-4+"px";
        var t=document.getElementById("DotVRLT detailed table");
        if( t.getBoundingClientRect().height < detailed_div.getBoundingClientRect().height ){ detailed_div.style.height=t.getBoundingClientRect().height+"px"; }
    }
    else{ detailed_div.style.display="none"; }
}

function THE_WATCHER(){
    var targetNode = document.getElementById("game-view").firstChild;
    var config = { childList: true, subtree: true };
    var callback = (mutationList, observer) => {
        for (let mutation of mutationList) {
            if (mutation.type === 'childList') {
                for(let node of mutation.addedNodes){
                    if(node.className=="router-container"){
                        function in_raid_stuff(A){
                            if(typeof(document.getElementsByClassName("dotv-btn dotv-btn-xl active")[0])==='object'){
                                if(document.getElementsByClassName("dotv-btn dotv-btn-xl active").length>1){
                                    var raid_name=document.getElementsByClassName("boss-name-container")[0].firstChild.innerHTML;
                                    var rd0=document.getElementsByClassName("boss-name-container")[0].firstChild.className;
                                    var rd1=rd0.substring(5,rd0.length);
                                    var raid_difficulty=rd1[0].toUpperCase()+rd1.substring(1,rd1.length);
                                    if(raid_name in raid_list){
                                        in_raid_button();
                                        create_detailed_div(raid_name,raid_difficulty);
                                        create_in_raid_div(raid_name,raid_difficulty);
                                        assign_current_difficulty(raid_difficulty);
                                    }
                                    setTimeout(function(){delete in_raid_stuff;},1);
                                }
                            }
                            else if(A){setTimeout(function(B){in_raid_stuff(B);},1000,A-1);}
                            else{setTimeout(function(){ delete in_raid_stuff; },1);}
                        }
                        in_raid_stuff(10);
                    }
                }
            }
        }
    };
    var observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

function damage_taken(base,element){ return "?"; }

function createDamageTakenTable(){
    document.getElementById("DotVRLT main title div").innerHTML="Damage taken from raids";
    var t=document.createElement("table");
    t.width="100%";
    t.border="1";
    t.style.textAlign="center";
    t.style.fontSize="14px";
    document.getElementById("DotVRLT main table div").appendChild(t);
    t.innerHTML=`<tr> <td>Name</td> <td>Damage type</td> <td colspan="2">Damage taken</td></tr>`;
    let diffsum=difficulties_to_display.Easy+difficulties_to_display.Hard+difficulties_to_display.Legendary;
    for(let k in raid_list){
        if(raid_list[k].loot_format=="EHL"){
            if(diffsum>0){
                let firstdiff=1;
                for(let j of ["Easy","Hard","Legendary"]){
                    if(difficulties_to_display[j]==1){
                        let dmg=damage_taken(raid_list[k].damage[j],raid_list[k].damage.type);
                        let tl=t.insertRow();
                        if(firstdiff==1){
                            tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].damage.type+`</td> <td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k].damage[j]+`)</td>`;
                            firstdiff=0;
                        }
                        else{
                            tl.innerHTML=`<td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k].damage[j]+`)</td>`;
                        }
                    }
                }
            }
        }
        else if(raid_list[k].loot_format=="image"){
            // Nothing unless people somehow end up digging for this kind of data for world raids.
        }
    }
}

function assign_current_difficulty(d){ current_difficulty=d; }

function actualize_colours(colourless){
    if(colourless==true){ custom_colours={"Easy":"rgb(255,255,255)","Hard":"rgb(255,255,255)","Legendary":"rgb(255,255,255)","Main":"rgb(255,255,255)","Buttons":"rgb(255,255,255)"}; }
    else{ custom_colours={"Easy":"rgb(0,255,0)","Hard":"rgb(255,165,0)","Legendary":"rgb(238,130,238)","Main":"rgb(153,255,170)","Buttons":"rgb(153,187,255)"}; }
    document.getElementById("DotVRLT main button").style.backgroundColor=custom_colours.Buttons;
    document.getElementById("DotVRLT main div").style.backgroundColor=custom_colours.Main;
    document.getElementById("DotVRLT options div").style.backgroundColor=custom_colours.Main;
    if( document.getElementsByClassName("raid-container").length>0 ){
        document.getElementById("DotVRLT in-raid button").style.backgroundColor=custom_colours.Buttons;
        document.getElementById("DotVRLT in-raid div").style.backgroundColor=custom_colours[current_difficulty];
        document.getElementById("DotVRLT detailed div").style.backgroundColor=custom_colours[current_difficulty];
    }
}

async function DotVRLT(){
    await initialize_saved_variables();
    create_main_button();
    create_main_div();
    set_main_div();
    create_options_div();
    create_options_title_div();
    create_difficulty_div();
    create_difficulty_selector();
    create_tab_buttons_div();
    create_extra_div();
    createTab(current_tab);
    THE_WATCHER();
}

// Execution.

function timed_execution(A){
    if(typeof(document.getElementsByClassName("dotv-nav")[0])==='object'){
        DotVRLT();
        setTimeout(function(){delete timed_execution;},1);
    }
    else if(A){setTimeout(function(B){timed_execution(B);},1000,A-1);}
    else{setTimeout(function(){ delete timed_execution; },1);}
}
timed_execution(1000);