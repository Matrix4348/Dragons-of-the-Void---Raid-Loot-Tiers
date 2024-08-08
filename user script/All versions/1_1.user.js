// ==UserScript==
// @name         Dragons of the Void - Raid Loot Tiers
// @version      1.1
// @author       Matrix4348
// @description  Look at raid loot tiers in-game.
// @license      MIT
// @namespace    https://greasyfork.org/users/4818
// @match        https://play.dragonsofthevoid.com/*
// @grant        GM_info
// ==/UserScript==

// Global variables. Raid tiers are taken from: https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972

class raid {
    constructor(a,b,c,d,e,f,g) {
        this.raid_size=a||"";     // "Small", "Medium", "Large", "Immense" or ???
        this.raid_type=b||"" ;    // "", "Guild raid" or "World raid"
        this.loot_format=c||"";   // "EHL" or "image"
        this.Easy=d||"";          // easy loot tiers if this difficulty exists
        this.Hard=e||"";          // hard loot tiers if this difficulty exists
        this.Legendary=f||"";     // legendary loot tiers if this difficulty exists
        this["Loot table"]=g||""; // link to the loot table if it exists
    }
}

var raid_list={
    "Corrupted Golem":new raid("Medium","","EHL","2,000 | 10,000 | 20,000 | 80,000 | 120,000 | 180,000 | <b>240,000=FS</b> | 300,000 | 360,000 | 480,000 | 600,000","10,000 | 30,000 | 60,000 | 120,000 | 180,000 | 250,000 | 350,000 | 450,000 | 600,000 | <b>720,000=FS</b> | 1,100,000 | 1,500,000 | 2,200,000","??? | <b>2,160,000=FS</b> | ??? | 6,000,000?",""),
    "Elven Rangers":new raid("Small","","EHL","90? | 4,000 | 10,000 | 20,000 | 40,000 | 60,000 | 80,000 | <b>100,000=FS</b> | 120,000 | 150,000 | 180,000 | 240,000","1,000 | 10,000 | 20,000 | 40,000 | 80,000 | 100,000 | 150,000 | 200,000 | 250,000 | <b>300,000=FS</b> | 400,000 | 550,000 | 750,000","5,000 | 20,000 | 75,000 | 150,000 | 300,000 | 450,000 | 600,000 | <b>900,000=FS</b> | 1,000,000 | 1,200,000 | 1,500,000 | 1,800,000 | 2,000,000",""),
    "Galeohog":new raid("Large","","EHL","2,500 | 10,000 | 20,000 | 40,000 | 80,000 | 110,000 | 150,000 | 175,000 | <b>220,000=FS</b> | 330,000 | 440,000 | 750,000 | 1,200,000 | 1,760,000","??? | <b>660,000=FS</b> | ??? | 3,300,000 | 4,400,000 | 5,280,000","90,000 | 170,000 | 435,000 | 780,000 | 1,100,000 | 1,620,000 | <b>1,980,000=FS</b> | 3,150,000 | 4,250,000 | 6,520,000 | 10,100,000 | 12,200,000 | 15,840,000",""),
    "Greater Ent":new raid("Medium","","EHL","500 | 4,000 | 8,000 | 20,000 | 40,000 | 80,000 | 120,000 | <b>160,000=FS</b> | 200,000 | 240,000 | 300,000 | 370,000","2,000 | 15,000 | 30,000 | 60,000 | 120,000 | 180,000 | 240,000 | 300,000 | 400,000 | <b>480,000=FS</b> | 640,000 | 960,000 | 1,200,000","??? | <b>1,440,000=FS</b> | ??? | 3,600,000?",""),
    "Jagar the Red":new raid("Immense","","EHL","40,000 | 58,000 | 85,000 | 120,000 | 160,000 | 220,000 | 260,000 | <b>320,000=FS</b> | 540,000 | 800,000 | 1,280,000 | 1,940,000 | 2,500,000 | 3,200,000","80,000 | 137,000 | 226,000 | 252,000 | 468,000 | ? | ? | ? | 768,000 | <b>960,000=FS</b> | 1,680,000 | 2,360,000 | 4,135,000 | 6,190,000 | 7,910,000 | 9,600,000","??? | <b>2,880,000=FS</b> | 4,400,000 | 5,800,000 | 11,600,000 | 17,400,000 | 23,400,000 | 28,800,000",""),
    "Lesser Tree Ent":new raid("Small","","EHL","100? | 1,000 | 2,000 | 5,000 | 10,000 | <b>20,000=FS</b> | 30,000 | 50,000","200? | 5,000 | 10,000 | 20,000 | 30,000 | <b>60,000=FS</b> | 90,000 | 120,000","1,000 | 10,000 | 30,000 | 60,000 | 90,000 | 120,000 | <b>180,000=FS</b> | 200,000 | 240,000 | 300,000",""),
    "Naga Karamati":new raid("Large","","EHL","2,000 | 10,000 | 20,000 | 80,000 | 120,000 | 175,000 | <b>240,000=FS</b> | 320,000 | 450,000 | 580,000 | 840,000 | 1,350,000 | 1,920,000","15,000 | 50,000 | 120,000 | 180,000 | 240,000 | 400,000 | 600,000 | <b>720,000=FS</b> | 1,120,000 | 1,600,000 | 2,400,000 | 3,200,000 | 4,400,000 | 5,760,000","??? | <b>2,160,000=FS</b> | ??? | 17,280,000?",""),
    "Naga Risaldar":new raid("Large","","EHL","2,500 | 5,000 | 15,000 | 30,000 | 75,000 | 100,000 | 120,000 | <b>150,000=FS</b> | 180,000 | 200,000 | 300,000 | 400,000 | 600,000 | 800,000 | 1,200,000","??? | <b>450,000=FS</b> | ??? | 3,600,000?","??? | <b>1,350,000=FS</b> | ??? | 10,800,000?",""),
    "Sand Wyrm":new raid("Small","","EHL","1,000 | 10,000 | 25,000 | 50,000 | 100,000 | <b>150,000=FS</b> | 200,000 | 250,000 | 300,000 | 380,000 | 450,000 | 530,000","15,000 | 35,000 | 75,000 | 150,000 | 225,000 | 300,000 | 400,000 | 500,000 | 625,000 | <b>750,000=FS</b> | 1,000,000 | 1,500,000 | 2,000,000","100,000 | 250,000 | 500,000 | 800,000 | 1,100,000 | 1,500,000 | 1,750,000 | <b>2,250,000=FS</b> | 2,750,000 | 3,250,000 | 4,000,000 | 4,750,000 | 5,500,000",""),
    "Skliros, the General of Cruelty":new raid("???","World raid","image","","","https://cdn.discordapp.com/attachments/830113306399604826/922193128134426704/Skliros.png","https://cdn.discordapp.com/attachments/830113306399604826/922193128134426704/Skliros.png"),
    "Superior Watcher":new raid("Medium","","EHL","200? | 2,000 | 5,000 | 10,000 | 20,000 | 40,000 | 60,000 | <b>80,000=FS</b> | 110,000 | 140,000 | 160,000 | 200,000","200? | 5,000 | 10,000 | 20,000 | 40,000 | 80,000 | 120,000 | 160,000 | 200,000 | <b>240,000=FS</b> | 300,000 | 400,000 | 480,000","5,000 | 20,000 | 60,000 | 120,000 | 240,000 | 360,000 | 480,000 | <b>720,000=FS</b> | 840,000 | 960,000 | 1,080,000 | 1,200,000 | 1,440,000",""),
};

var options_div, main_div;
var button_pressed=false;
var difficulties_to_display={"Easy":1,"Hard":1,"Legendary":1};
var current_tab="All raids";

// Functions.

function pressButton(){
    if(button_pressed==true){ options_div.style.display="none"; main_div.style.display="none"; button_pressed=false; }
    else{ options_div.style.display=""; main_div.style.display=""; button_pressed=true; }
}

function create_main_button(){
    var b=document.createElement("button");
    b.id="DotVRLT main button";
    b.innerHTML="Raid tiers";
    b.style.fontSize="18px";
    b.style.width="50px";
    b.style.height="50px";
    b.onclick=pressButton;
    document.getElementsByClassName("dotv-nav")[0].appendChild(b);
}

function create_main_div(){
    var d=document.createElement("div");
    d.id="DotVRLT main div";
    d.style.width="500px";
    d.style.height="500px";
    d.style.display="none";
    d.style.backgroundColor="#ffffff";
    d.style.border="1px solid black";
    d.style.position="fixed";
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
    d.style.height="165px";
    d.style.display="none";
    d.style.backgroundColor="#ffffff";
    d.style.border="1px solid black";
    d.style.position="fixed";
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
    d.style.height="40px";
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
    easy.onclick=function(){
        difficulties_to_display.Easy=easy.checked;
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    hard.defaultChecked=difficulties_to_display.Hard;
    hard.onclick=function(){
        difficulties_to_display.Hard=hard.checked;
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    legendary.defaultChecked=difficulties_to_display.Legendary;
    legendary.onclick=function(){
        difficulties_to_display.Legendary=legendary.checked;
        if(difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary){ all.checked=true; }
        else{ all.checked=false; }
        createTab(current_tab);
    };
    all.defaultChecked=difficulties_to_display.Easy&difficulties_to_display.Hard&difficulties_to_display.Legendary;
    all.onclick=function(){
        difficulties_to_display.Easy=all.checked;
        easy.checked=all.checked;
        difficulties_to_display.Hard=all.checked;
        hard.checked=all.checked;
        difficulties_to_display.Legendary=all.checked;
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
    t.innerHTML=`<tr> <td>Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> </tr>`;
    document.getElementById("DotVRLT main table div").appendChild(t);
    var diffsum=difficulties_to_display.Easy+difficulties_to_display.Hard+difficulties_to_display.Legendary;
    for(var k in raid_list){
        if( ((size=="All")||(raid_list[k].raid_size==size))&&((type=="All")||(raid_list[k].raid_type==type)) ){
            if(raid_list[k].loot_format=="EHL"){
                if(diffsum>0){
                    var firstdiff=1;
                    var diff={0:"Easy", 1:"Hard", 2:"Legendary"};
                    for(let j=0; j<3; j++){
                        if(difficulties_to_display[diff[j]]==1){
                            var tl=t.insertRow();
                            if(firstdiff==1){
                                tl.innerHTML=`<td rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_type+`</td> <td rowspan="`+diffsum+`">`+raid_list[k].raid_size+`</td> <td>`+diff[j]+`</td> <td>`+raid_list[k][diff[j]]+`</td>`;
                                firstdiff=0;
                            }
                            else{
                                tl.innerHTML=`<td>`+diff[j]+`</td> <td>`+raid_list[k][diff[j]]+`</td>`;
                            }
                        }
                    }
                }
            }
            else if(raid_list[k].loot_format=="image"){
                var tllt=t.insertRow();
                tllt.innerHTML=`<td>`+k+`</td> <td>`+raid_list[k].raid_type+`</td> <td>`+raid_list[k].raid_size+`</td> <td colspan="2">`+raid_list[k]["Loot table"]+`</td>`;
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
    <p>Most of the data is taken from <a href='https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972'>
    this spreadsheet</a> (which I am not related to), so if there are holes there, then there will likely be holes here, too.</p>
    <br>
    <p>If I forgot anything or if you find any bugs, do not forget to report them to me, either on
    <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/feedback'>Greasyfork</a> (if you have an account) or anywhere else you might find me.
    I am also always open to suggestions.</p>`;
}

function createTab(name){
    document.getElementById("DotVRLT main title div").innerHTML="";
    document.getElementById("DotVRLT main table div").innerHTML="";
    if(name=="About"){ createAboutTab(); }
    else if(name=="Small"){ createTable("Small raids","Small","All"); }
    else if(name=="Medium"){ createTable("Medium raids","Medium","All"); }
    else if(name=="Large"){ createTable("Large raids","Large","All"); }
    else if(name=="Immense"){ createTable("Immense raids","Immense","All"); }
    else if(name=="Guild raids"){ createTable("Guild raids","All","Guild raid"); }
    else if(name=="World raids"){ createTable("World raids","All","World raid"); }
    else if(name=="All raids"){ createTable("All raids","All","All"); }
    else{}
    current_tab=name;
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
    t.id="DotVRLT tab buttons div"; t.style.width="100%"; t.style.height="80px"; t.style.textAlign="center"; options_div.appendChild(t);
    var t1=document.createElement("div");
    t1.innerHTML="Raid size: "; t1.style.fontSize="15px"; t1.style.width="100%"; t1.style.height="45px"; t1.style.textAlign="left"; t.appendChild(t1);
    var t2=document.createElement("div");
    t2.innerHTML="Raid type: "; t2.style.fontSize="15px"; t2.style.width="100%"; t2.style.height="40px"; t2.style.textAlign="left"; t.appendChild(t2);
    createTabButton(t1,"Small");
    createTabButton(t1,"Medium");
    createTabButton(t1,"Large");
    createTabButton(t1,"Immense");
    createTabButton(t2,"Guild raids");
    createTabButton(t2,"World raids");
    createTabButton(t2,"All raids");
    createTabButton(t2,"About");
}

function DotVRLT(){
    create_main_button();
    create_main_div();
    set_main_div();
    create_options_div();
    create_options_title_div();
    create_difficulty_div();
    create_difficulty_selector();
    create_tab_buttons_div();
    createTab(current_tab);
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