// ==UserScript==
// @name         Dragons of the Void - Raid Loot Tiers
// @version      3.2
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
        this["Raid size"]=a; // "Small", "Medium", "Large", "Immense" or "World"
        this["Raid type"]=b; // "", "Guild raid" or "World raid"
        this["Loot format"]=c; // "EHL" or "Image"
        if (b=="World raid"){ this.Damage={Type:dmg[0]||"?",Legendary:dmg[1]||"?"}; }
        else{ this.Damage={Type:dmg[0]||"?",Easy:dmg[1]||"?",Hard:dmg[2]||"?",Legendary:dmg[3]||"?"}; }
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
        this["Has hidden loot?"]=i||false;
        this["Has summoner loot?"]=j||false;
        k=k||[[],[],[]]; l=l||[[],[],[]]; m=m||[[],[],[]]; n=n||[[],[],[]]; o=o||[[],[],[]]; // the drop data
        for(let v1 of [0,1,2]){
            for(let v2=0;v2<this[["Easy","Hard","Legendary"][v1]+" tiers"].length;v2++){
                if(typeof(k[v1][v2])=="undefined"){ k[v1][v2]="?"; }
                if(typeof(l[v1][v2])=="undefined"){ l[v1][v2]="?"; }
                if(typeof(m[v1][v2])=="undefined"){ m[v1][v2]="?"; }
                if(typeof(i)=="undefined"){ n[v1][v2]="maybe"; } else if(this["Has hidden loot?"]){ if(typeof(n[v1][v2])=="undefined"){ n[v1][v2]="?"; } } else{ if(typeof(n[v1][v2])=="undefined"){ n[v1][v2]=0; } }
                if(typeof(j)=="undefined"){ o[v1][v2]="maybe"; } else if(this["Has summoner loot?"]){ if(typeof(o[v1][v2])=="undefined"){ o[v1][v2]="?"; } } else{ if(typeof(o[v1][v2])=="undefined"){ o[v1][v2]=0; } }
            }
        }
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

var raid_list;
var options_div, main_div, in_raid_div, detailed_div;
var button_pressed=false, in_raid_button_pressed=false;
var difficulties_to_display_default={"Easy":1,"Hard":1,"Legendary":1};
var automatically_show_in_raid_div_default=1, show_detailed_div_default=true, show_advanced_view_default=false;
var current_tab_default="About";
var difficulties_to_display, automatically_show_in_raid_div, current_tab, show_detailed_div, show_advanced_view;
var custom_colours={"Easy":"rgb(0,255,0)","Hard":"rgb(255,165,0)","Legendary":"rgb(238,130,238)","Main":"rgb(153,255,170)","Buttons":"rgb(153,187,255)"};
var colourless_mode_default=0, colourless_mode, rounded_corners_default=1, rounded_corners, current_difficulty;

// Workaround to an unexpected compatibility issue with some GM_* functions in Greasemonkey 4.

if( typeof(GM_getValue)=="undefined" ){ GM_getValue=GM.getValue; }
if( typeof(GM_setValue)=="undefined" ){ GM_setValue=GM.setValue; }

// Functions.

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function fetch_online_raid_data(){
    try{
        var r = await makeRequest("GET", "https://matrix4348.github.io/raid_list.json");
        raid_list=JSON.parse(r);
    }
    catch(e){
        // The data known before version 3.0 was released will be used.
        raid_list={
            //"raid name":new raid("Size","Raid type","EHL or Image",["damage taken"],[FS],["easy tiers"],["hard tiers"],["legendary tiers"],"loot table.png",has_hidden_loot,has_summoner_loot,[[],[],[]],[[],[],[]],[[],[],[]],[[],[],[]],[[],[],[]]),
            "Basiliscus":new raid("Medium","Guild raid","EHL",["Poison",24,70,260],["320,000","960,000","2,880,000"],["12,000","40,000","75,000","120,000","180,000","320,000","425,000","530,000","640,000"],["35,000","120,000","320,000","480,000","720,000","960,000","1,360,000","1,760,000","2,160,000"],["???","2,880,000","???"],"",true,false,[[1,1,2,2,2,3,3,3,4],[1,1,2,2,2,3,3,3,4],[]],[[0,1,1,2,2,2,3,3,3],[0,1,1,2,2,2,3,3,3],[]],[[0,0,0,0,1,1,1,2,2],[0,0,0,0,1,1,1,2,2],[]],[[],[],[]],[[],[],[]]),
            //"Basiliscus (temporary beta world raid)":new raid("World","World raid","Image",["Poison",12],[],[],[],["https://matrix4348.github.io/Loot%20tables/Basiliscus_0.png"],"https://matrix4348.github.io/Loot%20tables/Basiliscus_0.png"),
            "Corrupted Golem":new raid("Medium","","EHL",["Physical",30,50,210],["240,000","720,000","2,160,000"],["2,000","10,000","20,000","40,000","80,000","120,000","180,000","240,000","300,000","360,000","480,000","600,000"],["10,000","30,000","60,000","120,000","180,000","250,000","350,000","450,000","600,000","720,000","1,100,000","1,500,000","2,200,000"],["???","2,160,000","???","6,000,000?"],"",false,true,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[]],[[],[],[]],[[],[],[]]),
            "Elven Rangers":new raid("Small","","EHL",["Physical",12,35,190],["100,000","300,000","900,000"],["1","4,000","10,000","20,000","40,000","60,000","80,000","100,000","120,000","150,000","180,000","240,000"],["1,000","10,000","20,000","40,000","80,000","100,000","150,000","200,000","250,000","300,000","400,000","550,000","750,000"],["5,000","20,000","75,000","150,000","300,000","450,000","600,000","900,000","1,000,000","1,200,000","1,500,000","1,800,000","2,000,000"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,5,5,5,5,6,6]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,2,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[0,0,0,0,0,0,1,1,1,1,2,2,3]],[[],[],[]],[[],[],[]]),
            "Fungal Fiend":new raid("Small","Guild raid","EHL",["Nature",6,30,140],["20,000","60,000","180,000"],["500","1,000","5,000","10,000","20,000","25,000","30,000","40,000","50,000"],["2,000","5,000","10,000","20,000","30,000","60,000","75,000","90,000","120,000","150,000"],["10,000","30,000","60,000","90,000","130,000","180,000","240,000","300,000","360,000","450,000"],"",false,false,[[1,2,3,3,3,3,4,4,4],[1,2,2,2,3,3,4,4,4,5],[1,2,2,2,3,3,4,4,4,5]],[[0,0,0,1,1,2,2,2,3],[0,0,1,2,2,2,2,3,3,3],[0,0,1,2,2,2,2,3,3,3]],[[0,0,0,0,1,1,1,2,2],[0,0,0,0,0,1,1,1,2,2],[0,0,0,0,0,1,1,1,2,2]],[[],[],[]],[[],[],[]]),
            "Galeohog":new raid("Large","","EHL",["Poison",25,44,220],["220,000","660,000","1,980,000"],["1","10,000","20,000","40,000","80,000","110,000","150,000","175,000","220,000","330,000","440,000","750,000","1,200,000","1,760,000"],["2,500","20,000","60,000","120,000","240,000","330,000","480,000","660,000","1,200,000","2,400,000","3,300,000","4,400,000","5,280,000"],["90,000","170,000","435,000","780,000","1,100,000","1,620,000","1,980,000","3,150,000","4,250,000","6,520,000","10,100,000","12,200,000","15,840,000"],"",true,false,[[1,2,2,2,3,3,3,4,4,5,5,6,7,7],[1,2,2,2,3,3,3,4,4,5,5,6,6],[]],[[0,0,1,2,2,2,3,3,3,4,4,5,5,5],[0,0,1,2,2,2,2,2,3,3,3,3,4],[]],[[0,0,0,0,0,1,1,1,2,2,3,3,3,4],[0,0,0,0,0,1,2,2,2,2,3,3,3],[]],[[],[],[]],[[],[],[]]),
            "Greater Ent":new raid("Medium","","EHL",["Nature",16,38,200],["160,000","480,000","1,440,000"],["500","4,000","8,000","20,000","40,000","80,000","120,000","160,000","200,000","240,000","300,000","370,000"],["2,000","15,000","30,000","60,000","120,000","180,000","240,000","300,000","400,000","480,000","640,000","960,000","1,200,000"],["???","1,440,000","???","3,600,000?"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[]],[[],[],[]],[[],[],[]]),
            "Jagar the Red":new raid("Immense","","EHL",["Fire",35,60,260],["320,000","960,000","2,880,000"],["15,000","30,000","50,000","80,000","120,000","160,000","200,000","260,000","320,000","480,000","640,000","1,280,000","1,920,000","2,560,000","3,200,000"],["80,000","137,000","226,000","252,000","468,000","?","?","?","768,000","960,000","1,680,000","2,360,000","4,135,000","6,190,000","7,910,000","9,600,000"],["???","2,880,000","4,400,000","5,800,000","11,600,000","17,400,000","23,400,000","28,800,000"],"",false,false,[[1,2,2,2,3,4,4,5,5,5,6,6,6,6,6],[],[]],[[0,0,1,2,2,2,2,2,3,3,3,3,4,5,5],[],[]],[[0,0,0,0,0,0,1,1,1,2,2,3,3,3,4],[],[]],[[],[],[]],[[],[],[]]),
            "Judah Jingse":new raid("World","World raid","image",["Nature",14],[],[],[],["https://matrix4348.github.io/Loot%20tables/Judah_Jingse_1.png"],"https://matrix4348.github.io/Loot%20tables/Judah_Jingse_1.png"),
            "Lesser Tree Ent":new raid("Small","","EHL",["Nature",6,40,120],["20,000","60,000","180,000"],["1","1,000","2,000","5,000","10,000","20,000","30,000","50,000"],["200?","5,000","10,000","20,000","30,000","60,000","87,000","90,000","120,000"],["1,000","10,000","30,000","60,000","90,000","120,000","180,000","200,000","240,000","300,000"],"",false,false,[[2,2,3,4,4,4,4,5],[1,2,3,3,3,3,4,4,5],[2,2,3,4,4,4,4,5,6,6]],[[0,1,2,2,2,2,3,3],[0,1,1,2,2,3,3,4,4],[0,1,2,2,2,3,4,4,4,4]],[[0,0,0,0,1,2,2,3],[0,0,0,0,1,2,2,2,3],[0,0,0,0,1,2,2,2,2,3]],[[],[],[]],[[],[],[]]),
            "Naga Karamati":new raid("Large","","EHL",["Lightning",26,50,230],["240,000","720,000","2,160,000"],["2,000","10,000","20,000","40,000","80,000","120,000","175,000","240,000","320,000","450,000","580,000","840,000","1,350,000","1,920,000"],["15,000","50,000","120,000","180,000","240,000","400,000","600,000","720,000","1,120,000","1,600,000","2,400,000","3,200,000","4,400,000","5,760,000"],["???","2,160,000","???","17,280,000?"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5,6,7],[1,2,2,3,3,4,5,5,5,6,6,6,6,7],[]],[[0,0,1,2,2,2,2,2,3,3,4,4,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4,5],[]],[[0,0,0,0,0,0,1,2,2,2,2,3,3,4],[0,0,0,0,0,0,0,1,1,1,2,2,3,3],[]],[[],[],[]],[[],[],[]]),
            "Naga Risaldar":new raid("Large","","EHL",["Poison",15,38,220],["150,000","450,000","1,350,000"],["1","5,000","15,000","30,000","75,000","100,000","120,000","150,000","180,000","200,000","300,000","400,000","600,000","800,000","1,200,000"],["1,000","10,000","50,000","100,000","225,000","350,000","450,000","600,000","900,000","1,200,000","2,000,000","2,750,000","3,600,000"],["???","1,350,000","???","10,800,000?"],"",false,false,[[1,2,2,2,3,3,3,3,4,5,5,5,6,7,7],[1,2,2,2,3,3,3,3,4,5,5,5,6],[]],[[0,0,1,2,2,2,3,3,3,3,4,4,5,5,5],[0,0,1,2,2,2,3,3,3,3,4,4,4],[]],[[0,0,0,0,0,1,1,2,2,2,2,3,3,3,4],[0,0,0,0,0,1,1,2,2,2,2,3,3],[]],[[],[],[]],[[],[],[]]),
            "Nitroglycergnat":new raid("Medium","Guild raid","EHL",["Nature",16,45,240],["75,000","225,000","675,000"],["500","2,000","5,000","15,000","30,000","50,000","75,000","100,000","125,000","150,000"],["4,000","20,000","45,000","75,000","115,000","150,000","225,000","270,000","330,000","450,000"],["???","675,000","???"],"",false,false,[[1,2,3,4,6,8,11,13,14,15],[2,5,10,15,16,22,33,38,43,46],[]],[[1,2,3,4,6,8,11,13,14,15],[2,5,10,15,16,22,33,38,43,46],[]],[[0,0,0,0,0,1,2,2,2,3],[0,0,0,0,1,1,2,2,2,3],[]],[[],[],[]],[[],[],[]]),
            "Rogue Slime":new raid("Small","Guild raid","EHL",["Acid",15,40,160],["150,000","450,000","1,350,000"],["5,000","15,000","50,000","80,000","120,000","150,000","180,000","210,000","250,000","300,000"],["10,000","40,000","80,000","150,000","250,000","350,000","450,000","600,000","800,000","1,000,000"],["???","1,350,000","???"],"",false,false,[[1,2,7,10,15,18,21,24,26,28],[2,5,9,17,27,40,49,60,72,77],[]],[[1,2,7,10,15,18,21,24,26,28],[2,5,9,17,27,40,49,60,72,77],[]],[[0,0,0,1,1,2,2,2,3,4],[0,0,0,0,1,1,2,2,3,4],[]],[[],[],[]],[[],[],[]]),
            "Sand Wyrm":new raid("Small","","EHL",["Physical",20,40,200],["250,000","750,000","2,250,000"],["1,000","10,000","25,000","50,000","100,000","150,000","200,000","250,000","300,000","380,000","450,000","525,000"],["15,000","35,000","75,000","150,000","225,000","300,000","400,000","500,000","625,000","750,000","1,000,000","1,500,000","2,000,000"],["100,000","250,000","500,000","800,000","1,100,000","1,500,000","1,750,000","2,250,000","2,750,000","3,250,000","4,000,000","4,750,000","5,500,000"],"",true,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,4,5,5,5,6,6]],[[0,0,1,1,1,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,3,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3,3],[0,0,0,0,0,0,1,1,1,1,2,3,3]],[[],[],[]],[[],[],[]]),
            "Skliros":new raid("World","World raid","Image",["Dark",8],[],[],[],["https://matrix4348.github.io/Loot%20tables/Skliros_0.png","https://matrix4348.github.io/Loot%20tables/Skliros_1.png"],"https://matrix4348.github.io/Loot%20tables/Skliros_1.png"),
            "Superior Watcher":new raid("Medium","","EHL",["Magic",8,32,180],["80,000","240,000","720,000"],["1","2,000","5,000","10,000","20,000","40,000","60,000","80,000","110,000","140,000","160,000","200,000"],["200?","5,000","10,000","20,000","40,000","80,000","120,000","160,000","200,000","240,000","300,000","400,000","480,000"],["5,000","20,000","60,000","120,000","240,000","360,000","480,000","720,000","840,000","960,000","1,080,000","1,200,000","1,440,000"],"",false,false,[[1,2,2,2,3,4,4,4,4,5,5,5],[1,2,2,3,3,4,5,5,5,6,6,6,6],[1,2,2,3,3,4,4,5,5,5,5,6,6]],[[0,0,1,2,2,2,2,2,3,3,4,4],[0,0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,2,2,2,2,3,4,4,4,5]],[[0,0,0,0,0,0,1,2,2,2,2,3],[0,0,0,0,0,0,0,1,1,1,2,2,3],[0,0,0,0,0,0,1,1,1,1,2,3,3]],[[],[],[]],[[],[],[]]),
            "Tunnanu":new raid("Large","Guild raid","EHL",["Physical",12,22,56],["230,000","690,000","2,070,000"],["2,500","10,000","25,000","75,000","120,000","230,000","390,000","575,000","770,000","950,000","1,150,000"],["???","690,000","???"],["???","2,070,000","???"],"",false,false,[[1,1,2,2,2,3,4,4,4,4,5],[],[]],[[0,1,1,2,2,2,2,3,3,4,5],[],[]],[[0,0,0,0,1,1,1,1,2,2,2],[],[]],[[],[],[]],[[],[],[]]),
        };
    }
}

function create_css(){
    var css=document.createElement("style");
    css.id="DotVRLT css";
    css.innerHTML=`
        :root {
            --corner-radius: 30px;
            --options-and-main-divs-display: none;
            --in-raid-display: none;
            --detailed-div-display: none;
            --button-colour: rgb(153,187,255);
            --main-colour: rgb(153,255,170);
            --in-raid-colour: rgb(255,255,255);
            --in-raid-table-height: 550px;
        }

        .dotvrlt_corners {
            border-radius: var(--corner-radius);
        }
        .dotvrlt_button {
            background-color: var(--button-colour);
            font-size: 18px;
        }
        .dotvrlt_table {
            width: 100%;
            text-align: center;
            font-size: 14px;
        }
        .dotvrlt_tab_button {
            height: 25px;
            margin-left: 2px;
            margin-right: 2px;
            font-size: 14px;
        }
        .dotvrlt_row_of_buttons_1 {
            font-size: 15px;
            width: 100%;
            height: 30px;
            text-align: left;
        }
        .dotvrlt_row_of_buttons_2 {
            font-size: 15px;
            width: 100%;
            height: 25px;
            text-align: left;
        }
        .dotvrlt_row_of_buttons_3 {
            font-size: 15px;
            width: 100%;
            height: 25px;
            text-align: center;
        }
        .dotvrlt_in_raid_settings_div {
            width: 100%;
            height: 25px;
            font-size: 14px;
            text-align: center;
        }

        .studious-inspector-container {
            z-index: 1;
        }

        #DotVRLT\\ main\\ button {
            width: 55px;
            height: 50px;
        }
        #DotVRLT\\ main\\ div {
            width: 500px;
            height: 500px;
            display: var(--options-and-main-divs-display);
            overflow: auto;
            background-color: var(--main-colour);
            border: 1px solid black;
            position: absolute;
            z-index: 100000;
        }
        #DotVRLT\\ main\\ title\\ div {
            font-size: 22px;
            width: 100%;
            height: 50px;
            text-align: center;
        }
        #DotVRLT\\ main\\ table\\ div {
            width: 100%;
            height: 450px;
            overflow: auto;
        }
        #DotVRLT\\ options\\ div {
            width: 500px;
            height: 190px;
            display: var(--options-and-main-divs-display);
            overflow: auto;
            background-color: var(--main-colour);
            border: 1px solid black;
            position: absolute;
            z-index: 100000;
        }
        #DotVRLT\\ options\\ title\\ div {
            width: 100%;
            height: 40px;
            font-size: 22px;
            text-align: center;
        }
        #DotVRLT\\ difficulty\\ div {
            width: 100%;
            height: 30px;
            font-size: 15px;
            text-align: left;
        }
        #DotVRLT\\ tab\\ buttons\\ div {
            width: 100%;
            height: 90px;
            text-align: center;
        }
        #DotVRLT\\ in-raid\\ button {
            width: 127px;
            height: 30px;
            margin-top: 5px;
        }
        #DotVRLT\\ in-raid\\ div {
            background-color: var(--in-raid-colour);
            width: 450px;
            height: 130px;
            display: var(--in-raid-display);
            border: 1px solid black;
            overflow: auto;
            position: absolute;
            z-index: 0;
        }
        #DotVRLT\\ in-raid\\ table\\ div {
            width: 100%;
            height: 80px;
        }
        #DotVRLT\\ detailed\\ div {
            background-color: var(--in-raid-colour);
            width: 400px;
            height: var(--in-raid-table-height);
            display: var(--detailed-div-display);
            border: 1px solid black;
            position: absolute;
            overflow-x: auto;
            overflow-y: auto;
            right: 0px;
        }
    `;
    document.body.appendChild(css);
}

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
    rounded_corners=await GM_getValue("rounded_corners_stored",rounded_corners_default);
}

function pressButton(){
    if(button_pressed==true){ document.documentElement.style.setProperty("--options-and-main-divs-display","none"); button_pressed=false; }
    else{
        document.documentElement.style.setProperty("--options-and-main-divs-display","yes");
        button_pressed=true;
        main_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x+window.scrollX+"px";
        options_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x-options_div.getBoundingClientRect().width-10+window.scrollX+"px";
    }
}

function create_main_button(){
    var b=document.createElement("button");
    b.id="DotVRLT main button";
    b.innerHTML="Raid tiers";
    b.classList.add("dotvrlt_corners");
    b.classList.add("dotvrlt_button");
    b.onclick=pressButton;
    document.getElementsByClassName("dotv-nav")[0].appendChild(b);
}

function create_main_div(){
    var d=document.createElement("div");
    d.id="DotVRLT main div";
    d.classList.add("dotvrlt_corners");
    var button_boundaries=document.getElementById("DotVRLT main button").getBoundingClientRect();
    d.style.left=button_boundaries.x+window.scrollX+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+10+window.scrollY+"px";
    document.body.appendChild(d);
    main_div=d;
    var td=document.createElement("div"); td.id="DotVRLT main title div"; main_div.appendChild(td);
    var tt=document.createElement("div"); tt.id="DotVRLT main table div"; main_div.appendChild(tt);
}

function create_options_div(){
    var d=document.createElement("div");
    d.id="DotVRLT options div";
    d.classList.add("dotvrlt_corners");
    var button_boundaries=document.getElementById("DotVRLT main button").getBoundingClientRect();
    d.style.left=button_boundaries.x-510+window.scrollX+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+10+window.scrollY+"px";
    document.body.appendChild(d);
    options_div=d;
}

function create_options_title_div(){
    var t=document.createElement("div");
    t.id="DotVRLT options title div";
    t.innerHTML="Options";
    options_div.appendChild(t);
}

function create_difficulty_div(){
    var d=document.createElement("div");
    d.id="DotVRLT difficulty div";
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

function delete_column(t,colname){
    // This works for the tables I will use.
    // As a general rule, excluded tables are:
    // * The ones containing a cell that is on several columns at once (columns being defined, here, by the top row, which contains the "column names"), unless all of these columns are deleted, of course.
    // * Tables with cells outside of the columns defined by the first row.
    var row=t.rows;
    // When reading an HTML table with Javascript, cells with a non-default rowspan are only accounted on ONE row, leading to rows (elements of t.rows) having different lengthes.
    // Similarly, cells with a colspan of X will appear only once, while X cells with a colspan of 1 will appear once EACH. Again, this leads to rows having different number of cells.
    // The idea to circumvent this problem is to map a new table to both the initial table and the "initial table read by Javascript": it will have the same structure as the true table (with each cell represented
    // by as many cells as needed in the new table - in other words we "fill the gap") but each cell will contain the column index related to the table "read by Javascript" (-1 for a "hole").
    // For example, if initial table is A, B[colspan=2], c in the first row and A, d, e, f in the second one (with the two "A" being a single big cell and "B" being two-cell long), then
    // the "initial table read by Javascript" will be A, B, c in a row and d, e, f in the second one while the new table linking both will be 0, 1, 1, 2 in the first row and -1, 0, 1, 2 in the second row.
    var headers_multiplied=[];
    for(let i=0; i<row[0].cells.length; i++){
        let colSpan=row[0].cells[i].colSpan;
        for(let j=0; j<colSpan; j++){
            headers_multiplied.push(row[0].cells[i].innerHTML);
        }
    }
    var R=row.length, C=0;
    for(let j=0; j<row[0].cells.length; j++){ C=C+row[0].cells[j].colSpan; }
    //var scanned_table=Array.from(Array.apply(null, {length: R}), () => Array.apply(null, {length: C})); // suddenly stopped working...?!
    var scanned_table=new Array(R).fill(undefined).map(()=>new Array(C).fill(undefined));
    for(let i=0; i<R; i++){
        var J=scanned_table[i].indexOf(undefined);
        for(let j=0; j<row[i].cells.length; j++){
            let a=row[i].cells[j].rowSpan;
            scanned_table[i][J]=j;
            for(let k=1; k<a; k++){ scanned_table[i+k][J]=-1; }
            let b=row[i].cells[j].colSpan;
            for(let l=1; l<b; l++){
                scanned_table[i][J+l]=-1;
                for(let k=1; k<a; k++){ scanned_table[i+k][J+l]=-1; }
            }
            J=scanned_table[i].indexOf(undefined);
        }
    }
    for(let i=0; i<row.length; i++){
        for(let j=scanned_table[0].length-1; j>=0; j--){
            if(scanned_table[i][j]>-1 && headers_multiplied[j]==colname){
                row[i].deleteCell(scanned_table[i][j]);
                scanned_table[i][j]=-1;
            }
        }
    }
}

function createTable(name,size,type,columns_to_remove){
    document.getElementById("DotVRLT main title div").innerHTML=name;
    if(type=="Guild raid"){
        var ita=document.createElement("i");
        ita.style.fontSize="14px";
        ita.innerHTML="Every hard and legendary guild raids drop an additional void token.";
        document.getElementById("DotVRLT main table div").appendChild(ita);
    }
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    if(show_advanced_view==false){
        t.innerHTML=`<tr> <td>Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> </tr>`;
        let diffsum=difficulties_to_display.Easy+difficulties_to_display.Hard+difficulties_to_display.Legendary;
        for(let k in raid_list){
            if( ((size=="All")||(raid_list[k]["Raid size"]==size))&&((type=="All")||(raid_list[k]["Raid type"]==type)) ){
                if(raid_list[k]["Loot format"]=="EHL"){
                    if(diffsum>0){
                        let firstdiff=1;
                        for(let j of ["Easy","Hard","Legendary"]){
                            if(difficulties_to_display[j]==1){
                                let tl=t.insertRow();
                                if(firstdiff==1){
                                    tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k]["Raid size"]+`</td> <td>`+j+`</td> <td>`+raid_list[k][j]+`</td>`;
                                    firstdiff=0;
                                }
                                else{
                                    tl.innerHTML=`<td>`+j+`</td> <td>`+raid_list[k][j]+`</td>`;
                                }
                            }
                        }
                    }
                }
                else if(raid_list[k]["Loot format"]=="Image"){
                    let tllt=t.insertRow();
                    tllt.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k]["Raid type"]+`</td> <td>`+raid_list[k]["Raid size"]+`</td> <td colspan="2" style="word-break:break-all"><i>`+raid_list[k]["Loot table"]+`</i></td>`;
                }
            }
        }
    }
    else{
        t.innerHTML=`<tr> <td>Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> <td>common | rare | mythic | hidden | summoner</td></tr>`;
        for(let k in raid_list){
            if( ((size=="All")||(raid_list[k]["Raid size"]==size))&&((type=="All")||(raid_list[k]["Raid type"]==type)) ){
                if(raid_list[k]["Loot format"]=="EHL"){
                    let diffsum=difficulties_to_display.Easy*raid_list[k]["Easy tiers"].length+difficulties_to_display.Hard*raid_list[k]["Hard tiers"].length+difficulties_to_display.Legendary*raid_list[k]["Legendary tiers"].length;
                    if(diffsum>0){
                        let firstdiff=1;
                        for(let j of ["Easy","Hard","Legendary"]){
                            if(difficulties_to_display[j]==1){
                                let tl=t.insertRow();
                                var tiers0_text=raid_list[k][j+" tiers"][0];
                                if(tiers0_text==raid_list[k].FS[j]){ tiers0_text="<b>FS: "+tiers0_text+"</b>"; }
                                if(firstdiff==1){
                                    tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k]["Raid size"]+`</td> <td rowspan="`+raid_list[k][j+" tiers"].length+`">`+j+`</td> <td>`+tiers0_text+`</td> <td>`+raid_list[k].drops[j][0]+`</td>`;
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
                else if(raid_list[k]["Loot format"]=="Image"){
                    let tllt=t.insertRow();
                    tllt.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k]["Raid type"]+`</td> <td>`+raid_list[k]["Raid size"]+`</td> <td colspan="3" style="word-break:break-all"><i>`+raid_list[k]["Loot table"]+`</i></td>`;
                }
            }
        }
    }
    for(let c of (columns_to_remove || [])){ delete_column(t,c); }
}

function createAboutTab(){
    document.getElementById("DotVRLT main title div").innerHTML="Dragons of the Void - Raid Loot Tiers";
    var moi=document.createElement("div");
    moi.innerHTML="Version "+GM_info.script.version+", by Matrix4348";
    moi.style.fontSize="12px";
    document.getElementById("DotVRLT main title div").appendChild(moi);
    document.getElementById("DotVRLT main table div").style.fontSize="14px";
    var d=document.createElement("div"); d.style.marginLeft="2%"; d.style.marginRight="2%";
    d.innerHTML=`
    <p>Most of the data is being taken either from <a href='https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972'>
    this spreadsheet</a> (which I am not related to) or from another of the community documents gathered
    <a href='https://docs.google.com/document/d/1rU5HoUzPvDm_RpM9gpY0pBJBz55OVY-VcNF1ukT2ySA/edit'>on this page</a>, so if there are holes there, then there will likely be
    holes here, too.
    <br>Credits for the drop distribution (common, rare, mythic...) go to Black Flame.</p>
    <br>
    <p>I do not take any credit for this data, all I do is gathering it in my dedicated <a href='https://github.com/Matrix4348/Dragons-of-the-Void---Raid-Loot-Tiers'>GitHub repository</a>. You are free to submit
    your findings there directly, should you have any.</p>
    <br>
    <p>If I forgot anything or if you find any bugs, do not forget to report them to me, either on
    <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/feedback'>Greasyfork</a>, <a href='https://www.kongregate.com/accounts/Matrix4348'>Kongregate</a> or anywhere else you might find me.
    I am also always open to suggestions.</p>
    <br>
    <p>Update logs can be found <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/versions'>here</a>.</p>`;
    var nv=(GM_info.scriptHandler+GM_info.version).toLowerCase().substring(0,13);
    if(nv=="greasemonkey4"){
        d.innerHTML=d.innerHTML+`
        <br>
        <p><b><u>Warning:</u> It seems that you are using Greasemonkey 4. Please, be aware that by design of this extension, this script will most likely
        not work outside of the main site. You will have to switch over to Tampermonkey, Violentmonkey, an earlier version of Greasemonkey or another user script manager.
        If you are only playing on the main site, then ignore this warning.</b></p>
        `;
    }
    document.getElementById("DotVRLT main table div").appendChild(d);
}

async function createTab(name){
    document.getElementById("DotVRLT main title div").innerHTML="";
    document.getElementById("DotVRLT main table div").innerHTML="";
    if(name=="About"){ createAboutTab(); }
    else if(name=="Small"){ createTable("Small raids","Small","All",["Size"]); }
    else if(name=="Medium"){ createTable("Medium raids","Medium","All",["Size"]); }
    else if(name=="Large"){ createTable("Large raids","Large","All",["Size"]); }
    else if(name=="Immense"){ createTable("Immense raids","Immense","All",["Size"]); }
    else if(name=="World"){ createTable("World-size raids","World","All",["Size"]); }
    else if(name=="Regular"){ createTable("Regular raids","All","",["Type"]); }
    else if(name=="Guild"){ createTable("Guild raids","All","Guild raid",["Type"]); }
    else if(name=="World "){ createTable("World raids","All","World raid",["Type","Size"]); }
    else if(name=="All"){ createTable("All raids","All","All"); }
    else if(name=="Damage taken"){ createDamageTakenTable(); }
    current_tab=name;
    await GM_setValue("current_tab_stored",current_tab);
}

function createTabButton(div,bname){
    var b=document.createElement("button");
    b.innerHTML=bname;
    b.style.fontSize="14px"; // TO REMOVE ONCE NEXT LINE REMADE
    b.style.width=bname.length*(b.style.fontSize.substring(0,b.style.fontSize.length-2)-3)+"px"; // TO BE IMPROVED
    b.classList.add("dotvrlt_tab_button");
    b.onclick=function(){ createTab(bname); };
    div.appendChild(b);
}

function create_tab_buttons_div(){
    var t=document.createElement("div"); t.id="DotVRLT tab buttons div"; options_div.appendChild(t);
    var t1=document.createElement("div"); t1.classList.add("dotvrlt_row_of_buttons_1"); t1.innerHTML="Raid size: "; t.appendChild(t1);
    var t2=document.createElement("div"); t2.classList.add("dotvrlt_row_of_buttons_1"); t2.innerHTML="Raid type: "; t.appendChild(t2);
    var t3=document.createElement("div"); t3.classList.add("dotvrlt_row_of_buttons_2"); t3.innerHTML="Other: "; t.appendChild(t3);
    // Filter by raid size
    createTabButton(t1,"Small");
    createTabButton(t1,"Medium");
    createTabButton(t1,"Large");
    createTabButton(t1,"Immense");
    createTabButton(t1,"World");
    createTabButton(t1,"All");
    // Filter by raid type
    createTabButton(t2,"Regular");
    createTabButton(t2,"Guild");
    createTabButton(t2,"World ");
    createTabButton(t2,"All");
    // Other buttons
    createTabButton(t3,"Damage taken");
    createTabButton(t3,"About");
}

function create_extra_div(){
    var d=document.createElement("div");
    d.id="DotVRLT extra settings div";
    d.classList.add("dotvrlt_row_of_buttons_3");
    options_div.appendChild(d);
    var adv=createNewCheckbox(d, "DotVRLT advanced view checkbox", " Advanced view ");
    adv.defaultChecked=show_advanced_view;
    adv.onclick=async function(){
        show_advanced_view=adv.checked;
        await GM_setValue("show_advanced_view_stored",show_advanced_view);
        createTab(current_tab);
    };
    var col=createNewCheckbox(d, "DotVRLT colourless mode checkbox", " Black-and-white ");
    col.defaultChecked=colourless_mode;
    col.onclick=async function(){
        colourless_mode=col.checked;
        await GM_setValue("colourless_mode_stored",colourless_mode);
        actualize_colours(colourless_mode);
    };
    var rc=createNewCheckbox(d, "DotVRLT rounded corners checkbox", " Rounded corners ");
    rc.defaultChecked=rounded_corners;
    rc.onclick=async function(){
        rounded_corners=rc.checked;
        await GM_setValue("rounded_corners_stored",rounded_corners);
        actualize_corners(rounded_corners);
    };
}

function in_raid_button(){
    var b=document.createElement("button");
    b.id="DotVRLT in-raid button";
    b.innerHTML="Loot tiers";
    b.style.top=document.getElementsByClassName("leader-board")[0].getBoundingClientRect().bottom+"px";
    b.classList.add("dotvrlt_corners");
    b.classList.add("dotvrlt_button");
    b.onclick=press_in_raid_button;
    document.getElementsByClassName("leader-board")[0].appendChild(b);
    in_raid_button_pressed=false;
}

function press_in_raid_button(){
    if(in_raid_button_pressed==true){
        document.documentElement.style.setProperty("--in-raid-display","none");
        in_raid_button_pressed=false;
        document.documentElement.style.setProperty("--detailed-div-display","none");
    }
    else{
        document.documentElement.style.setProperty("--in-raid-display","yes");
        in_raid_button_pressed=true;
        set_detailed_div_state();
        var t=document.getElementById("DotVRLT in-raid table div"), n=t.firstElementChild.clientHeight;
        if(n<t.clientHeight){
            t.style.height=n+"px";
            in_raid_div.style.height=in_raid_div.clientHeight-(80-n)+"px";
        }
        in_raid_div.style.left=document.getElementById("DotVRLT in-raid button").getBoundingClientRect().x+window.scrollX+"px";
    }
}

function create_in_raid_div(raid_name,raid_difficulty){
    var d=document.createElement("div");
    d.id="DotVRLT in-raid div";
    d.classList.add("dotvrlt_corners");
    document.getElementsByClassName("broadcast-damage-container")[0].style.zIndex="1"; // Normal value is 0, but then the above z-index should be set to -1 and this would make the checkboxes unclickable.
    var button_boundaries=document.getElementById("DotVRLT in-raid button").getBoundingClientRect();
    d.style.left=button_boundaries.x+window.scrollX+"px";
    d.style.top=button_boundaries.y+button_boundaries.height+5+window.scrollY+"px";
    document.getElementsByClassName("raid-container")[0].appendChild(d);
    in_raid_div=d;
    // Creation of the three subdivs.
    var td=document.createElement("div"); td.id="DotVRLT in-raid table div"; d.appendChild(td);
    var tt=document.createElement("div"); tt.id="DotVRLT in-raid settings div"; tt.classList.add("dotvrlt_in_raid_settings_div"); d.appendChild(tt);
    var tt2=document.createElement("div"); tt2.id="DotVRLT detailed settings div"; tt2.classList.add("dotvrlt_in_raid_settings_div"); d.appendChild(tt2);
    // Table creation.
    var t=document.createElement("table");
    t.classList.add("dotvrlt_table");
    t.border=1;
    if(raid_list[raid_name]["Loot format"]=="EHL"){
        t.innerHTML=`<td>`+raid_list[raid_name][raid_difficulty]+`</td>`;
    }
    else if(raid_list[raid_name]["Raid type"]=="World raid"){
        t.innerHTML=`<td style="word-break:break-all">Latest loot table known by the script (be careful in case of a rerun): <br><i>`+raid_list[raid_name]["Loot table"]+`</i></td>`;
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
    d.classList.add("dotvrlt_corners");
    var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
    d.style.top=magics_area.getBoundingClientRect().bottom-4+window.scrollY+"px";
    document.getElementsByClassName("raid-container")[0].appendChild(d);
    detailed_div=d;
    // Table creation.
    if(raid_list[raid_name]["Loot format"]=="EHL"){
        var ncol=4+raid_list[raid_name]["Has hidden loot?"]+raid_list[raid_name]["Has summoner loot?"];
        var t=document.createElement("table");
        t.id="DotVRLT detailed table";
        t.classList.add("dotvrlt_table");
        t.border=1;
        t.innerHTML=`<td colspan="`+ncol+`" style="font-size:18px;">`+raid_name+" ("+raid_difficulty.toLowerCase()+`)</td>`;
        d.appendChild(t);
        var r0=t.insertRow();
        if(raid_list[raid_name]["Raid type"]!=""){ r0.innerHTML=`<td colspan="`+(2+raid_list[raid_name]["Has hidden loot?"])+`">`+raid_list[raid_name]["Raid type"]+`</td> <td colspan="`+(2+raid_list[raid_name]["Has summoner loot?"])+`"> Size: `+raid_list[raid_name]["Raid size"]+`</td>`; }
        else{ r0.innerHTML=`<td colspan="`+ncol+`"> Size: `+raid_list[raid_name]["Raid size"]+`</td>`; }
        var r1=t.insertRow();
        var dmg=damage_taken(raid_list[raid_name].Damage[raid_difficulty],raid_list[raid_name].Damage.Type);
        r1.innerHTML=`<td colspan="`+ncol+`"> Damage taken: `+dmg+` (base: `+raid_list[raid_name].Damage[raid_difficulty]+`, type: `+raid_list[raid_name].Damage.Type.toLowerCase()+`)</td>`;
        var r2=t.insertRow(); r2.innerHTML=`<td rowspan="2">Damage</td><td colspan="`+(ncol-1)+`">Loot drops</td>`;
        var r3=t.insertRow(); r3.innerHTML=`<td>Common</td><td>Rare</td><td>Mythic</td>`;
        if(raid_list[raid_name]["Has hidden loot?"]){ r3.innerHTML=r3.innerHTML+`<td>Hidden</td>`; }
        if(raid_list[raid_name]["Has summoner loot?"]){ r3.innerHTML=r3.innerHTML+`<td>Summoner</td>`; }
        if(raid_list[raid_name]["Raid type"]=="Guild raid" && raid_difficulty!="Easy"){
            var rvt=t.insertRow();
            rvt.innerHTML=`<td colspan="`+ncol+`"><i>Hard and Legendary always drop an additional void token.</i></td>`;
        }
        for(let k=0; k<raid_list[raid_name][raid_difficulty+" tiers"].length; k++){
            let r4=t.insertRow();
            let tiers_text=raid_list[raid_name][raid_difficulty+" tiers"][k];
            if(tiers_text==raid_list[raid_name].FS[raid_difficulty]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
            r4.innerHTML=`<td>`+tiers_text+`</td><td>`+raid_list[raid_name].Common[raid_difficulty][k]+`</td><td>`+raid_list[raid_name].Rare[raid_difficulty][k]+`</td><td>`+raid_list[raid_name].Mythic[raid_difficulty][k]+`</td>`;
            if(raid_list[raid_name]["Has hidden loot?"]){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name].Hidden[raid_difficulty][k]+`</td>`; }
            if(raid_list[raid_name]["Has summoner loot?"]){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name].Summoner[raid_difficulty][k]+`</td>`; }
        }
    }
    else if(raid_list[raid_name]["Loot format"]=="Image"){
        var i=document.createElement("img");
        i.id="DotVRLT detailed table";
        i.width="400"; i.height="550"; i.style.cursor="zoom-in"; d.style.overflowY="hidden";
        i.src=raid_list[raid_name]["Loot table"];
        i.addEventListener("click",function(){ if(i.width>"400"||i.height>"550"){i.width="400"; i.height="550"; i.style.cursor="zoom-in"; d.style.overflowY="hidden";} else{i.setAttribute("width",""); i.setAttribute("height",""); i.style.cursor="zoom-out"; d.style.overflowY="auto";} });
        d.appendChild(i);
    }
    //
    set_detailed_div_state();
}

function set_detailed_div_state(){
    if(show_detailed_div&&in_raid_button_pressed){
        document.documentElement.style.setProperty("--detailed-div-display","yes");
        var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
        var T=magics_area.getBoundingClientRect().bottom-4;
        detailed_div.style.top=T+window.scrollY+"px";
        var B=document.getElementsByClassName("raid-footer")[0].getBoundingClientRect().top-15;
        document.documentElement.style.setProperty("--in-raid-table-height",Math.min(550,B-T)+"px");
        var t=document.getElementById("DotVRLT detailed table");
        if( t.getBoundingClientRect().height < detailed_div.getBoundingClientRect().height ){
            document.documentElement.style.setProperty("--in-raid-table-height",t.getBoundingClientRect().height+"px");
        }
    }
    else{ document.documentElement.style.setProperty("--detailed-div-display","none"); }
}

function in_raid_stuff(A){
    if(typeof(document.getElementsByClassName("dotv-btn dotv-btn-xl active")[0])==='object'){
        if(document.getElementsByClassName("dotv-btn dotv-btn-xl active").length>1){
            var raid_name=document.getElementsByClassName("boss-name-container")[0].firstChild.innerHTML;
            var rd0=document.getElementsByClassName("boss-name-container")[0].firstChild.className;
            var rd1=rd0.substring(5,rd0.length);
            assign_current_difficulty(rd1[0].toUpperCase()+rd1.substring(1,rd1.length));
            actualize_colours(colourless_mode);
            if(raid_name in raid_list){
                in_raid_button();
                create_detailed_div(raid_name,current_difficulty);
                create_in_raid_div(raid_name,current_difficulty);
            }
        }
    }
    else if(A){setTimeout(function(B){in_raid_stuff(B);},1000,A-1);}
}

function THE_WATCHER(){
    var targetNode = document.getElementById("game-view").firstChild;
    var config = { childList: true, subtree: true };
    var callback = (mutationList, observer) => {
        for (let mutation of mutationList) {
            if (mutation.type === 'childList') {
                for(let node of mutation.addedNodes){
                    if(node.className=="router-container"){ in_raid_stuff(10); }
                }
            }
        }
    };
    var observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

function damage_taken(base,element){ return "?"; }

function createDamageTakenTable(){
    document.getElementById("DotVRLT main title div").innerHTML="Damage taken from raids (20-hit)";
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    t.innerHTML=`<tr> <td>Name</td> <td>Damage type</td> <td colspan="2">Damage taken</td></tr>`;
    let diffsum=difficulties_to_display.Easy+difficulties_to_display.Hard+difficulties_to_display.Legendary;
    for(let k in raid_list){
        if(raid_list[k]["Loot format"]=="EHL"){
            if(diffsum>0){
                let firstdiff=1;
                for(let j of ["Easy","Hard","Legendary"]){
                    if(difficulties_to_display[j]==1){
                        let dmg=damage_taken(raid_list[k].Damage[j],raid_list[k].Damage.Type);
                        let tl=t.insertRow();
                        if(firstdiff==1){
                            tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].Damage.Type+`</td> <td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k].Damage[j]+`)</td>`;
                            firstdiff=0;
                        }
                        else{
                            tl.innerHTML=`<td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k].Damage[j]+`)</td>`;
                        }
                    }
                }
            }
        }
        else if(raid_list[k]["Loot format"]=="Image"){
            let dmg=damage_taken(raid_list[k].Damage.Legendary,raid_list[k].Damage.Type);
            let tl=t.insertRow();
            tl.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k].Damage.Type+`</td> <td colspan="2">`+dmg+" (base: "+raid_list[k].Damage.Legendary+`)</td>`;
        }
    }
}

function assign_current_difficulty(d){ current_difficulty=d; }

function actualize_colours(colourless){
    colourless ? document.documentElement.style.setProperty("--button-colour","rgb(255,555,555)") : document.documentElement.style.setProperty("--button-colour",custom_colours.Buttons);
    colourless ? document.documentElement.style.setProperty("--main-colour","rgb(255,555,555)") : document.documentElement.style.setProperty("--main-colour",custom_colours.Main);
    colourless ? document.documentElement.style.setProperty("--in-raid-colour","rgb(255,555,555)") : document.documentElement.style.setProperty("--in-raid-colour",custom_colours[current_difficulty]);
}

function actualize_corners(rounded_corners){
    rounded_corners ? document.documentElement.style.setProperty("--corner-radius","30px") : document.documentElement.style.setProperty("--corner-radius","0px");
}

function resizing_listener(){
    if(typeof(document.getElementById("DotVRLT detailed div"))!="undefined"){
        set_detailed_div_state();
    }
}

async function DotVRLT(){
    await fetch_online_raid_data();
    await initialize_saved_variables();
    create_css();
    create_main_button();
    create_main_div();
    create_options_div();
    create_options_title_div();
    create_difficulty_div();
    create_difficulty_selector();
    create_tab_buttons_div();
    create_extra_div();
    createTab(current_tab);
    actualize_colours(colourless_mode);
    actualize_corners(rounded_corners);
    THE_WATCHER();
    document.addEventListener("resize",resizing_listener);
    document.addEventListener("fullscreenchange",resizing_listener);
}

// Execution.

function timed_execution(A){
    if(typeof(document.getElementsByClassName("dotv-nav")[0])==='object'){ DotVRLT(); }
    else if(A){setTimeout(function(B){timed_execution(B);},1000,A-1);}
}
timed_execution(1000);