// ==UserScript==
// @name         Dragons of the Void - Raid Loot Tiers
// @version      6.1
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

var raid_list;
var options_div, main_div, in_raid_div, detailed_div;
var button_pressed=false, in_raid_button_pressed=false;
var difficulties_to_display_default={"Easy":1,"Hard":1,"Legendary":1};
var automatically_show_in_raid_div_default=1, show_detailed_div_default=true, show_advanced_view_default=false;
var current_tab_default="About";
var difficulties_to_display, automatically_show_in_raid_div, current_tab, show_detailed_div, show_advanced_view;
var custom_colours={"Easy":"rgb(0,255,0)","Hard":"rgb(255,165,0)","Legendary":"rgb(238,130,238)","Main":"rgb(153,255,170)","Buttons":"rgb(153,187,255)"};
var colourless_mode_default=0, colourless_mode, rounded_corners_default=1, rounded_corners, current_difficulty;
var player_stats={};

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
        var r = await makeRequest("GET", "https://matrix4348.github.io/dragons-of-the-void/raid-list.json");
        raid_list=sanitized_object(JSON.parse(r));
    }
    catch(e){
        // Fall back to the data known as of last update. DO NOT TOUCH THE LINE BELOW!
        /* MARKER 1 */ raid_list={}; /* MARKER 1 */
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
            --in-raid-table-max-height: 550px;
            --in-raid-table-max-width: 400px;
        }

        .dotvrlt_corners {
            border-radius: var(--corner-radius);
        }
        .dotvrlt_corners_top {
            border-top-left-radius: var(--corner-radius);
            border-top-right-radius: var(--corner-radius);
        }
        .dotvrlt_corners_bottom_left {
            border-bottom-left-radius: var(--corner-radius);
        }
        .dotvrlt_corners_bottom_right {
            border-bottom-right-radius: var(--corner-radius);
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
            margin-right: 3px;
            margin-bottom: 5px;
            font-size: 14px;
            width: auto;
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
            height: 55px;
            text-align: left;
        }
        .dotvrlt_row_of_buttons_3 {
            font-size: 15px;
            width: 100%;
            height: 25px;
            text-align: center;
        }
        .dotvrlt_notes_container {
            max-height: 100px;
            overflow-y: auto;
            margin: 0px 2px 4px 2px;
            border: black 1px solid;
            padding: 3px;
        }
        .dotvrlt_in_raid_settings_div {
            width: 100%;
            max-height: 25px;
            font-size: 14px;
            text-align: center;
        }
        .dotvrlt_fixed_row {
            position: sticky;
            top: 0;
        }
        .dotvrlt_fixed_row_2 {
            position: sticky;
            top: 30px;
        }
        .dotvrlt_fixed_row_3 {
            position: sticky;
            top: 55px;
        }
        .dotvrlt_fixed_row_2_bis {
            position: sticky;
            top: 25px;
        }
        .dotvrlt_sortable_header {
            cursor: pointer;
        }
        .dotvrlt_corners div, .dotvrlt_corners table, .dotvrlt_corners tbody, .dotvrlt_corners tr, .dotvrlt_corners td {
            background-color: inherit;
        }

        .studious-inspector-container {
            z-index: 1;
        }

        #DotVRLT\\ main\\ button {
            width: 55px;
            height: 50px;
        }
        #DotVRLT\\ main\\ div {
            width: 601px;
            max-height: 500px;
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
            max-height: 450px;
            overflow: auto;
        }
        #DotVRLT\\ options\\ div {
            width: 550px;
            height: 220px;
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
            height: 120px;
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
            max-height: 130px;
            display: var(--in-raid-display);
            border: 1px solid black;
            overflow: auto;
            position: absolute;
            z-index: 0;
        }
        #DotVRLT\\ in-raid\\ table\\ div {
            width: 100%;
            max-height: 80px;
        }
        #DotVRLT\\ detailed\\ div {
            background-color: var(--in-raid-colour);
            max-width: var(--in-raid-table-max-width);
            max-height: var(--in-raid-table-max-height);
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

function create_scrollbars_css(){
    var css=document.createElement("style");
    css.id="DotVRLT css default scrollbars";
    css.innerHTML=`
/* How to revert custom scrollbars (in browsers supporting those) to something close enough to default ones, but only for elements related to the "Dragons of the Void - Raid Loot tiers" user script. */

        .dotvrlt_corners::-webkit-scrollbar, .dotvrlt_corners ::-webkit-scrollbar {
            all:unset;
        }

        .dotvrlt_corners::-webkit-scrollbar-thumb, .dotvrlt_corners ::-webkit-scrollbar-thumb {
            background-color: #b0b0b0;
            border: 0.05em solid #eeeeee;
            background-image: unset;
        }
        .dotvrlt_corners::-webkit-scrollbar-thumb:hover, .dotvrlt_corners ::-webkit-scrollbar-thumb:hover {
            box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.5);
        }
        .dotvrlt_corners::-webkit-scrollbar-thumb:active, .dotvrlt_corners ::-webkit-scrollbar-thumb:active {
            box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.7);
        }

        .dotvrlt_corners::-webkit-scrollbar-track, .dotvrlt_corners ::-webkit-scrollbar-track {
            background-color:ButtonFace;
            background-image: unset;
            box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }

        /* Buttons */

        .dotvrlt_corners::-webkit-scrollbar-button:single-button, .dotvrlt_corners ::-webkit-scrollbar-button:single-button {
            background-color:ButtonFace;
            display: block;
            height: auto;
            width: initial;
            background-size: 10px;
            background-repeat: no-repeat;
        }
        .dotvrlt_corners::-webkit-scrollbar-button:hover, .dotvrlt_corners ::-webkit-scrollbar-button:hover {
            box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.5);
        }
        .dotvrlt_corners::-webkit-scrollbar-button:active, .dotvrlt_corners ::-webkit-scrollbar-button:active {
            box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.7);
        }

        /* Up */
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:decrement, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:decrement {
          background-position: center 4px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(96, 96, 96)'><polygon points='50,00 0,50 100,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:decrement:hover, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:decrement:hover {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(112, 112, 112)'><polygon points='50,00 0,50 100,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:decrement:active, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:decrement:active {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(128, 128, 128)'><polygon points='50,00 0,50 100,50'/></svg>");
        }

        /* Down */
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:increment, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:increment {
          background-position: center 4px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(96, 96, 96)'><polygon points='0,0 100,0 50,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:increment:hover, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:increment:hover {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(112, 112, 112)'><polygon points='0,0 100,0 50,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:vertical:increment:active, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:vertical:increment:active {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(128, 128, 128)'><polygon points='0,0 100,0 50,50'/></svg>");
        }

        /* Left */
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:decrement, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:decrement {
          background-position: center 4px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(96, 96, 96)'><polygon points='0,50 50,100 50,0'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:decrement:hover, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:decrement:hover {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(112, 112, 112)'><polygon points='0,50 50,100 50,0'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:decrement:active, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:decrement:active {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(128, 128, 128)'><polygon points='0,50 50,100 50,0'/></svg>");
        }

        /* Right */
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:increment, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:increment {
          //background-position: center 4px;
          background-position: center;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(96, 96, 96)'><polygon points='0,0 0,100 50,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:increment:hover, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:increment:hover {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(112, 112, 112)'><polygon points='0,0 0,100 50,50'/></svg>");
        }
        .dotvrlt_corners::-webkit-scrollbar-button:single-button:horizontal:increment:active, .dotvrlt_corners ::-webkit-scrollbar-button:single-button:horizontal:increment:active {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(128, 128, 128)'><polygon points='0,0 0,100 50,50'/></svg>");
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
    player_stats.defense=await GM_getValue("defense_stored",0);
    player_stats.Physical=0;
    player_stats.Magic=await GM_getValue("Magic_stored",0);
    player_stats.Psychic=await GM_getValue("Psychic_stored",0);
    player_stats.Ice=await GM_getValue("Ice_stored",0);
    player_stats.Fire=await GM_getValue("Fire_stored",0);
    player_stats.Poison=await GM_getValue("Poison_stored",0);
    player_stats.Acid=await GM_getValue("Acid_stored",0);
    player_stats.Nature=await GM_getValue("Nature_stored",0);
    player_stats.Lightning=await GM_getValue("Lightning_stored",0);
    player_stats.Holy=await GM_getValue("Holy_stored",0);
    player_stats.Dark=await GM_getValue("Dark_stored",0);
}

function pressButton(){
    if(button_pressed==true){ document.documentElement.style.setProperty("--options-and-main-divs-display","none"); button_pressed=false; }
    else{
        document.documentElement.style.setProperty("--options-and-main-divs-display","yes");
        button_pressed=true;
        main_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x+window.scrollX-100+"px";
        options_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x-options_div.getBoundingClientRect().width-110+window.scrollX+"px";
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
    d.style.left=button_boundaries.x+window.scrollX-100+"px";
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
    d.style.left=button_boundaries.x-660+window.scrollX+"px";
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
    var all=createNewCheckbox(d, "DotVRLT show all checkbox", " All <span id='dotvrlt_counter_All'></span>");
    var easy=createNewCheckbox(d, "DotVRLT show easy checkbox", " Easy <span id='dotvrlt_counter_Easy'></span>");
    var hard=createNewCheckbox(d, "DotVRLT show hard checkbox", " Hard <span id='dotvrlt_counter_Hard'></span>");
    var legendary=createNewCheckbox(d, "DotVRLT show legendary checkbox", " Legendary <span id='dotvrlt_counter_Legendary'></span>");
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

function createTable(name,Modes,sizes,types,ColumnsToRemove){ // Modes, sizes, types and ColumnsToRemove can be either a string or an array.
    var modes,size,type,columns_to_remove;
    typeof(Modes)=="string" ? modes=[Modes] : modes=Modes;
    typeof(sizes)=="string" ? size=[sizes] : size=sizes;
    typeof(types)=="string" ? type=[types] : type=types;
    typeof(ColumnsToRemove)=="string" ? columns_to_remove=[ColumnsToRemove] : columns_to_remove=ColumnsToRemove;
    var counters={Easy:0,Hard:0,Legendary:0};
    document.getElementById("DotVRLT main title div").innerHTML=name;
    var nc=document.createElement("div");
    nc.id="DotVRLT notes container";
    nc.classList.add("dotvrlt_notes_container");
    document.getElementById("DotVRLT main table div").appendChild(nc);
    var ita=document.createElement("i");
    ita.style.fontSize="14px";
    document.getElementById("DotVRLT notes container").appendChild(ita);
    var Notes=[];
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    if(show_advanced_view==false){
        t.innerHTML=`<tr class="dotvrlt_fixed_row"> <td class="dotvrlt_first_column">Name</td> <td>Type</td> <td>Size</td> <td colspan="2">Loot tiers</td> </tr>`;
        for(let k in raid_list){
            for(let mode of modes){
                if(mode in raid_list[k]){
                    if( ( size == "All" || size.includes(raid_list[k][mode]["Raid size"]) ) && ( type=="All" || type.includes(raid_list[k][mode]["Raid type"]) ) ){
                        let D=raid_list[k][mode]["Available difficulties"];
                        let diffsum=difficulties_to_display.Easy*D.includes("Easy")+difficulties_to_display.Hard*D.includes("Hard")+difficulties_to_display.Legendary*D.includes("Legendary");
                        let firstdiff=1;
                        for(let j of D){
                            if(diffsum>0){
                                if(difficulties_to_display[j]==1){
                                    let notes=raid_list[k][mode].notes[j];
                                    if(notes!=[]){
                                        for(let n of notes){
                                            if( !Notes.includes(n) ){ Notes[Notes.length]=n; }
                                        }
                                    }
                                    if(raid_list[k][mode]["Loot format"]=="EHL"){
                                        let tl=t.insertRow();
                                        if(firstdiff==1){
                                            tl.innerHTML=`<td class="dotvrlt_first_column" rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid size"]+`</td> <td>`+j+`</td> <td>`+raid_list[k][mode]["Tiers as string"][j]+`</td>`;
                                            firstdiff=0;
                                        }
                                        else{
                                            tl.innerHTML=`<td>`+j+`</td> <td>`+raid_list[k][mode]["Tiers as string"][j]+`</td>`;
                                        }
                                    }
                                    else if(raid_list[k][mode]["Loot format"]=="Image"){
                                        let tllt=t.insertRow();
                                        if(firstdiff==1){
                                            tllt.innerHTML=`<td class="dotvrlt_first_column" rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid size"]+`</td> <td>`+j+`</td> <td style="word-break:break-all"><i>`+get_last(raid_list[k][mode]["Loot tables"][j]).URL+`</i></td>`;
                                            firstdiff=0;
                                        }
                                        else{
                                            tllt.innerHTML=`<td>`+j+`</td> <td style="word-break:break-all"><i>`+get_last(raid_list[k][mode]["Loot tables"][j]).URL+`</i></td>`;
                                        }
                                    }
                                }
                            }
                            counters[j]=counters[j]+1;
                        }
                    }
                }
            }
        }
    }
    else{
        t.innerHTML=`<tr class="dotvrlt_fixed_row"> <td class="dotvrlt_first_column" rowspan="2">Name</td> <td rowspan="2">Type</td> <td rowspan="2">Size</td> <td colspan="9">Loot tiers</td> </tr>
        <tr class="dotvrlt_fixed_row_2_bis"> <td>Difficulty</td> <td>Damage</td> <td colspan="3">Common | rare | mythic</td> <td colspan="3">Summoner | hidden | bonus</td> <td>Average stat points</td> </tr>`;
        for(let k in raid_list){
            for(let mode of modes){
                if(mode in raid_list[k]){
                    if( ( size == "All" || size.includes(raid_list[k][mode]["Raid size"]) ) && ( type=="All" || type.includes(raid_list[k][mode]["Raid type"]) ) ){
                        let D=raid_list[k][mode]["Available difficulties"];
                        let e=raid_list[k][mode]?.Tiers?.Easy?.length||(raid_list[k][mode]["Loot tables"]?.Easy?.length!=undefined)*1||0,
                            h=raid_list[k][mode]?.Tiers?.Hard?.length||(raid_list[k][mode]["Loot tables"]?.Hard?.length!=undefined)*1||0,
                            l=raid_list[k][mode]?.Tiers?.Legendary?.length||(raid_list[k][mode]["Loot tables"]?.Legendary?.length!=undefined)*1||0;
                        let diffsum=difficulties_to_display.Easy*D.includes("Easy")*e+difficulties_to_display.Hard*D.includes("Hard")*h+difficulties_to_display.Legendary*D.includes("Legendary")*l;
                        let firstdiff=1;
                        for(let j of D){
                            if(diffsum>0){
                                if(difficulties_to_display[j]==1){
                                    let notes=raid_list[k][mode].notes[j];
                                    if(notes!=[]){
                                        for(let n of notes){
                                            if( !Notes.includes(n) ){ Notes[Notes.length]=n; }
                                        }
                                    }
                                    if(raid_list[k][mode]["Loot format"]=="EHL"){
                                        let tl=t.insertRow();
                                        var tiers0_text=raid_list[k][mode].Tiers[j][0];
                                        if(tiers0_text==raid_list[k][mode].FS[j]){ tiers0_text="<b>FS: "+tiers0_text+"</b>"; }
                                        if(firstdiff==1){
                                            tl.innerHTML=`<td class="dotvrlt_first_column" rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid size"]+`</td> <td rowspan="`+raid_list[k][mode].Tiers[j].length+`">`+j+`</td> <td>`+tiers0_text+`</td> <td>`+raid_list[k][mode].Drops.Common[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Rare[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Mythic[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Summoner[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Hidden[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Bonus[j][0]+`</td> <td>`+(raid_list[k][mode]["Average stat points"][j]?.[0] ?? "?")+`</td>`;
                                            firstdiff=0;
                                        }
                                        else{
                                            tl.innerHTML=`<td rowspan="`+raid_list[k][mode].Tiers[j].length+`">`+j+`</td> <td>`+tiers0_text+`</td> <td>`+raid_list[k][mode].Drops.Common[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Rare[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Mythic[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Summoner[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Hidden[j][0]+`</td> <td>`+raid_list[k][mode].Drops.Bonus[j][0]+`</td> <td>`+(raid_list[k][mode]["Average stat points"][j]?.[0] ?? "?")+`</td>`;
                                        }
                                        for(let v=1; v<raid_list[k][mode].Tiers[j].length; v++){
                                            let tlv=t.insertRow();
                                            var tiers_text=raid_list[k][mode].Tiers[j][v];
                                            if(tiers_text==raid_list[k][mode].FS[j]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
                                            tlv.innerHTML=`<td>`+tiers_text+`</td> <td>`+raid_list[k][mode].Drops.Common[j][v]+`</td> <td>`+raid_list[k][mode].Drops.Rare[j][v]+`</td> <td>`+raid_list[k][mode].Drops.Mythic[j][v]+`</td> <td>`+raid_list[k][mode].Drops.Summoner[j][v]+`</td> <td>`+raid_list[k][mode].Drops.Hidden[j][v]+`</td> <td>`+raid_list[k][mode].Drops.Bonus[j][v]+`</td> <td>`+(raid_list[k][mode]["Average stat points"][j]?.[v] ?? "?")+`</td>`;
                                        }

                                    }
                                    else if(raid_list[k][mode]["Loot format"]=="Image"){
                                        let tllt=t.insertRow();
                                        if(firstdiff==1){
                                            tllt.innerHTML=`<td class="dotvrlt_first_column" rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid type"]+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode]["Raid size"]+`</td> <td>`+j+`</td> <td colspan="8" style="word-break:break-all"><i>`+get_last(raid_list[k][mode]["Loot tables"][j]).URL+`</i></td>`;
                                            firstdiff=0;
                                        }
                                        else{
                                            tllt.innerHTML=`<td>`+j+`</td> <td colspan="8" style="word-break:break-all"><i>`+get_last(raid_list[k][mode]["Loot tables"][j]).URL+`</i></td>`;
                                        }
                                    }
                                }
                            }
                            counters[j]=counters[j]+1;
                        }
                    }
                }
            }
        }
    }
    t.getElementsByClassName("dotvrlt_first_column")[t.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    t.getElementsByTagName("tr")[t.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");
    nc.style.display = Notes.length == 0 ? "none" : "";
    add_notes(Notes,ita);
    for(let c of (columns_to_remove || [])){ delete_column(t,c); }
    update_counters(counters);
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
    <p>The data that I use was originally being taken from <a href='https://docs.google.com/spreadsheets/d/1wSilYulbp3M3f2eHHhPmDlM5AiCHFQPbNvYJU2jWYZE/edit#gid=581592972'>
    this spreadsheet</a> (which I am not related to) or from another of the community documents gathered
    <a href='https://docs.google.com/document/d/1rU5HoUzPvDm_RpM9gpY0pBJBz55OVY-VcNF1ukT2ySA/edit'>on this page</a> but is now being gathered on my dedicated
    <a href='https://github.com/Matrix4348/Dragons-of-the-Void---Raid-Loot-Tiers'>GitHub repository</a>. Anyone can submit their findings there, should they have any.</p>
    <br>
    <p>I do not take any credit for this data; at best all I do is gathering it. Credits for the drop distribution (common, rare, mythic...) and almost every tiers go to Black Flame.<br>
    Studious inspector data has been summarized by TAMS <a href='https://docs.google.com/spreadsheets/d/e/2PACX-1vS1C0_DiI1Qax4rE3n_Gf_w9QhHyO2jH_KAMwoF60p4pi5cJnsc-hnzRuuTOFyMu1tceFuTbF0ZlZ72/pubhtml'>here</a>.</p>
    <br>
    <p>Please, report any bugs you may encounter and make any suggestion that you might have, either on <a href='https://github.com/Matrix4348/Dragons-of-the-Void---Raid-Loot-Tiers'>GitHub</a>
    (where one can even directly submit their changes), <a href='https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/feedback'>Greasyfork</a>,
    <a href='https://www.kongregate.com/accounts/Matrix4348'>Kongregate</a> or anywhere else you might find me.</p>
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
    update_counters();
    document.getElementById("DotVRLT main title div").innerHTML="";
    document.getElementById("DotVRLT main table div").innerHTML="";
    if(name=="About"){ createAboutTab(); }
    else if(name=="Small"){ createTable("Small raids",["raiding","healthless"],"Small","All","Size"); }
    else if(name=="Medium"){ createTable("Medium raids",["raiding","healthless"],"Medium","All","Size"); }
    else if(name=="Large"){ createTable("Large raids",["raiding","healthless"],"Large","All","Size"); }
    else if(name=="Immense"){ createTable("Immense raids",["raiding","healthless"],"Immense","All","Size"); }
    else if(name=="World"){ createTable("World-size raids",["raiding","healthless"],"World","All","Size"); }
    else if(name=="Regular"){ createTable("Regular raids","raiding","All","","Type"); }
    else if(name=="Guild"){ createTable("Guild raids",["raiding","healthless"],"All","Guild raid","Type"); }
    else if(name=="Event"){ createTable("Event raids",["raiding","healthless"],"All","Event raid",["Type","Size"]); }
    else if(name=="World "){ createTable("World raids",["raiding","healthless"],"All","World raid",["Type","Size"]); }
    else if(name=="Special"){ createTable("Special raids",["raiding","healthless"],"All","Special raid",["Type","Size"]); }
    else if(name=="Questing"){ createTable("Quests","questing","All",["Quest boss","Quest miniboss"],["Size"]); }
    else if(name=="All"){ createTable("All raids",["raiding","healthless"],"All","All"); }
    else if(name=="Damage taken (raids)"){ createDamageTakenTable(["raiding","healthless"]); }
    else if(name=="Damage taken (quests)"){ createDamageTakenTable("questing"); }
    else if(name=="Your stats"){ createStatsTab(); }
    else if(name=="Stat points gain comparison"){ createAverageStatsPointsTab(); }
    current_tab=name;
    await GM_setValue("current_tab_stored",current_tab);
}

function createTabButton(div,bname){
    var b=document.createElement("button");
    b.innerHTML=bname;
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
    createTabButton(t2,"Event");
    createTabButton(t2,"World ");
    createTabButton(t2,"Special");
    createTabButton(t2,"All");
    createTabButton(t2,"Questing");
    // Other buttons
    createTabButton(t3,"Damage taken (raids)");
    createTabButton(t3,"Damage taken (quests)");
    //createTabButton(t3,"Your stats"); /* ACTIVATE WHEN DAMAGE TAKEN FORMULA IS DISCOVERED */
    createTabButton(t3,"Stat points gain comparison");
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

function create_in_raid_div(raid_name,mode,raid_difficulty){
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
    if(raid_list[raid_name][mode]["Loot format"]=="EHL"){
        t.innerHTML=`<td class="dotvrlt_corners_top">`+raid_list[raid_name][mode]["Tiers as string"][raid_difficulty]+`</td>`;
    }
    else if(raid_list[raid_name][mode]["Loot format"]=="Image"){
        t.innerHTML=`<td class="dotvrlt_corners_top" style="word-break:break-all">Latest loot table known by the script (date of first use: `+get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).release_date+`): <br><i>`+get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL+`</i><br>For guaranteed up-to-date one: click "Loot", then "Expanded Loot".</td>`;
    }
    td.appendChild(t);
    // In-raid settings creation.
    var cb=createNewCheckbox(tt, "", " Automatically display relevant raid tiers when entering a raid");
    cb.defaultChecked=automatically_show_in_raid_div;
    cb.onclick=async function(){ automatically_show_in_raid_div=cb.checked; await GM_setValue("automatically_show_in_raid_div_stored",automatically_show_in_raid_div); };
    if(automatically_show_in_raid_div){ press_in_raid_button(); } else{ document.documentElement.style.setProperty("--in-raid-display","none"); }
    var cb2=createNewCheckbox(tt2, "", " Display drop data (and more)");
    cb2.defaultChecked=show_detailed_div;
    cb2.onclick=async function(){ show_detailed_div=cb2.checked; await GM_setValue("show_detailed_div_stored",show_detailed_div); set_detailed_div_state(); };
}

function create_detailed_div(raid_name,mode,raid_difficulty){
    var d=document.createElement("div");
    d.id="DotVRLT detailed div";
    d.classList.add("dotvrlt_corners");
    var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
    d.style.top=magics_area.getBoundingClientRect().bottom+6+window.scrollY+"px";
    document.getElementsByClassName("raid-container")[0].appendChild(d);
    detailed_div=d;
    set_detailed_div_state();
    // Table creation.
    if(raid_list[raid_name][mode]["Loot format"]=="EHL"){
        var ncol=5+raid_list[raid_name][mode]["Has extra drops"].Hidden[raid_difficulty]+raid_list[raid_name][mode]["Has extra drops"].Summoner[raid_difficulty]+raid_list[raid_name][mode]["Has extra drops"].Bonus[raid_difficulty];
        var t=document.createElement("table");
        t.id="DotVRLT detailed table";
        t.classList.add("dotvrlt_table");
        t.border=1;
        t.innerHTML=`<td class="dotvrlt_fixed_row dotvrlt_corners_top" colspan="`+ncol+`" style="font-size:18px;">`+raid_name+" ("+raid_difficulty.toLowerCase()+`)</td>`;
        d.appendChild(t);
        var l1=2+raid_list[raid_name][mode]["Has extra drops"].Hidden[raid_difficulty]+(raid_list[raid_name][mode]?.["Average stat points"]?.[raid_difficulty]!=undefined);
        var l2=2+raid_list[raid_name][mode]["Has extra drops"].Summoner[raid_difficulty]+raid_list[raid_name][mode]["Has extra drops"].Bonus[raid_difficulty];
        var r0=t.insertRow();
        if(raid_list[raid_name][mode]["Raid type"]!=""){ r0.innerHTML=`<td colspan="`+l1+`">`+raid_list[raid_name][mode]["Raid type"]+`</td> <td colspan="`+l2+`"> Size: `+raid_list[raid_name][mode]["Raid size"]+`</td>`; }
        else{ r0.innerHTML=`<td colspan="`+ncol+`"> Size: `+raid_list[raid_name][mode]["Raid size"]+`</td>`; }
        var r1=t.insertRow();
        var dmg=damage_taken(raid_list[raid_name][mode].Damage[raid_difficulty],raid_list[raid_name][mode].Damage.Type);
        r1.innerHTML=`<td colspan="`+ncol+`"> Damage taken: `+dmg+` (base: `+raid_list[raid_name][mode].Damage[raid_difficulty]+`, type: `+raid_list[raid_name][mode].Damage.Type.toLowerCase()+`)</td>`;
        if ( raid_list[raid_name][mode]["Has extra drops"]["On-hit drops"][raid_difficulty] || raid_list[raid_name][mode]["Has extra drops"]["Loot expansion"][raid_difficulty] ){
            var r1b=t.insertRow();
            var x1=raid_list[raid_name][mode]["Has extra drops"]["On-hit drops"][raid_difficulty], x2=raid_list[raid_name][mode]["Has extra drops"]["Loot expansion"][raid_difficulty];
            var x3 = raid_list[raid_name][mode]["Extra drops"]["On-hit drops"][raid_difficulty], x4 = raid_list[raid_name][mode]["Extra drops"]["Loot expansion"][raid_difficulty] ? "yes" : "no";
            if(x1*x2){ r1b.innerHTML=`<td colspan="`+l1+`"> On-hit drops: `+x3+`</td> <td colspan="`+l2+`"> Loot expansion: `+x4+`</td>`; }
            else if(x1){ r1b.innerHTML=`<td colspan="`+(l1+l2)+`"> On-hit drops: `+x3+`</td>`; }
            else{ r1b.innerHTML=`<td colspan="`+(l1+l2)+`"> Loot expansion: `+x4+`</td>`; }
        }
        var r2=t.insertRow(); r2.classList.add("dotvrlt_fixed_row_2"); r2.innerHTML=`<td class="dotvrlt_first_column" rowspan="2">Damage</td><td colspan="`+(ncol-1)+`">Loot drops</td>`;
        var r3=t.insertRow(); r3.classList.add("dotvrlt_fixed_row_3"); r3.innerHTML=`<td>Common</td><td>Rare</td><td>Mythic</td>`;
        if(raid_list[raid_name][mode]["Has extra drops"].Hidden[raid_difficulty]){ r3.innerHTML=r3.innerHTML+`<td>Hidden</td>`; }
        if(raid_list[raid_name][mode]["Has extra drops"].Summoner[raid_difficulty]){ r3.innerHTML=r3.innerHTML+`<td>Summoner</td>`; }
        if(raid_list[raid_name][mode]["Has extra drops"].Bonus[raid_difficulty]){ r3.innerHTML=r3.innerHTML+`<td>Bonus</td>`; }
        if(raid_list[raid_name][mode]["Average stat points"][raid_difficulty].length){ r3.innerHTML=r3.innerHTML+`<td>Average stat points</td>`; }
        var rnotes=t.insertRow();
        rnotes.innerHTML=`<td class="dotvrlt_first_column" colspan="`+ncol+`"><i id="dotvrlt_notes_raid"></i></td>`;
        var Notes=raid_list[raid_name][mode].notes[raid_difficulty];
        rnotes.style.display = Notes.length == 0 ? "none" : "";
        add_notes(Notes,document.getElementById("dotvrlt_notes_raid"));
        for(let k=0; k<raid_list[raid_name][mode].Tiers[raid_difficulty].length; k++){
            let r4=t.insertRow();
            let tiers_text=raid_list[raid_name][mode].Tiers[raid_difficulty][k];
            if(tiers_text==raid_list[raid_name][mode].FS[raid_difficulty]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
            r4.innerHTML=`<td class="dotvrlt_first_column">`+tiers_text+`</td><td>`+raid_list[raid_name][mode].Drops.Common[raid_difficulty][k]+`</td><td>`+raid_list[raid_name][mode].Drops.Rare[raid_difficulty][k]+`</td><td>`+raid_list[raid_name][mode].Drops.Mythic[raid_difficulty][k]+`</td>`;
            if(raid_list[raid_name][mode]["Has extra drops"].Hidden[raid_difficulty]){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name][mode].Drops.Hidden[raid_difficulty][k]+`</td>`; }
            if(raid_list[raid_name][mode]["Has extra drops"].Summoner[raid_difficulty]){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name][mode].Drops.Summoner[raid_difficulty][k]+`</td>`; }
            if(raid_list[raid_name][mode]["Has extra drops"].Bonus[raid_difficulty]){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name][mode].Drops.Bonus[raid_difficulty][k]+`</td>`; }
            if(raid_list[raid_name][mode]["Average stat points"][raid_difficulty].length>k){ r4.innerHTML=r4.innerHTML+`<td>`+raid_list[raid_name][mode]["Average stat points"][raid_difficulty][k]+`</td>`; }
        }
        t.getElementsByClassName("dotvrlt_first_column")[t.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
        t.getElementsByTagName("tr")[t.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");
    }
    else if(raid_list[raid_name][mode]["Loot format"]=="Image"){
        var i=document.createElement("img");
        i.id="DotVRLT detailed table";
        i.style.margin="auto"; i.style.cursor="zoom-in";
        i.addEventListener("load",
                           function(){
            let I=document.getElementById("DotVRLT detailed table");
            I.height=Math.min(I.naturalHeight,document.documentElement.style.getPropertyValue("--in-raid-table-max-height").replace("px","")).toString();
            I.width=Math.min(I.naturalWidth,"400").toString(); // --in-raid-table-max-width cannot be used because it has not been set using document.documentElement.style.setProperty
        });
        i.src=get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL;
        var z=0;
        i.addEventListener("click",
                           function(){
            var h0=document.documentElement.style.getPropertyValue("--in-raid-table-max-height").replace("px",""),
                w0=(document.documentElement.style.getPropertyValue("--in-raid-table-max-width")||"400").replace("px","");
            var h = Math.min(i.naturalHeight,h0).toString(), w = Math.min(i.naturalWidth,w0).toString();
            var H = Math.max(i.naturalHeight,h0).toString(), W = Math.max(i.naturalWidth,w0).toString();
            if(z){i.width=w; i.height=h; i.style.cursor="zoom-in";}
            else{i.width=W; i.height=H; i.style.cursor="zoom-out";}
            z=1-z;
        });
        d.appendChild(i);
    }
}

function set_detailed_div_state(){
    var magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
    var T=magics_area.getBoundingClientRect().bottom+6;
    detailed_div.style.top=T+window.scrollY+"px";
    var B=document.getElementsByClassName("raid-footer")[0].getBoundingClientRect().top-15;
    var H=B-T;
    if( raid_list[document.getElementsByClassName("boss-name-container")[0].firstChild.innerHTML][current_fighting_mode()]["Loot format"]=="Image" ){ H=Math.min(550,H); }
    document.documentElement.style.setProperty("--in-raid-table-max-height",H+"px");
    if(show_detailed_div&&in_raid_button_pressed){ document.documentElement.style.setProperty("--detailed-div-display","flex"); }
    else{ document.documentElement.style.setProperty("--detailed-div-display","none"); }
}

function current_fighting_mode(){
    if( document.getElementsByClassName("raid-header-center")[0].innerHTML.search("https://files.dragonsofthevoid.com/ui/bars/health-line.jpg")==-1 ){ return "healthless"; }
    else if( document.getElementsByClassName("dotv-btn dotv-btn-xl active").length<2 ){ return "questing"; }
    else { return "raiding"; }
}

function check_existence_of_area_for_button(){
    if(document.getElementsByClassName("leader-board").length==0){ // I noticed on July 11th, 2024 that there is (now) always a "leader-board" area. I am keeping that in case it changes in the future.
        var d=document.createElement("div");
        d.classList.add("leader-board");
        d.setAttribute("data-v-6fbb6b33",""); // Check weither or not the name of this attribute changes overtime.
        document.getElementsByClassName("raid-header-center")[0].appendChild(d);
    }
    if (document.getElementsByClassName("dotv-btn dotv-btn-xl active").length==0){
        var d2=document.createElement("div");
        d2.style.marginTop="100px";
        document.getElementsByClassName("leader-board")[0].appendChild(d2);
    }
}

function in_raid_stuff(A){
    if( document.getElementsByClassName("raid-header-center").length>0 && document.getElementById("DotVRLT in-raid button")==null ){
        var mode=current_fighting_mode();
        var raid_name=document.getElementsByClassName("boss-name-container")[0].firstChild.innerHTML;
        var rd0=document.getElementsByClassName("boss-name-container")[0].firstChild.className;
        var rd1=rd0.substring(5,rd0.length);
        assign_current_difficulty(rd1[0].toUpperCase()+rd1.substring(1,rd1.length));
        actualize_colours(colourless_mode);
        if(raid_name in raid_list){
            check_existence_of_area_for_button();
            in_raid_button();
            create_detailed_div(raid_name,mode,current_difficulty);
            create_in_raid_div(raid_name,mode,current_difficulty);
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

function createDamageTakenTable(M){
    var modes = typeof(M)=="string" ? modes=[M] : modes=M;
    var tx= modes.includes("questing") ? "quest bosses" : "raids"; // To update if more damage taken tables are ever made.
    document.getElementById("DotVRLT main title div").innerHTML="Damage taken from "+tx+" (20-hit)";
    var counters={Easy:0, Hard:0, Legendary:0};
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    t.innerHTML=`<tr class="dotvrlt_fixed_row"> <td class="dotvrlt_first_column">Name</td> <td>Damage type</td> <td colspan="2">Damage taken</td></tr>`;
    for(let k in raid_list){
        for(let mode in raid_list[k]){
            if(modes.includes(mode)){
                var D=raid_list[k][mode]["Available difficulties"];
                let diffsum=difficulties_to_display.Easy*D.includes("Easy")+difficulties_to_display.Hard*D.includes("Hard")+difficulties_to_display.Legendary*D.includes("Legendary");
                let firstdiff=1;
                for(let j of D){
                    if(diffsum>0){
                        if(difficulties_to_display[j]==1){
                            let dmg=damage_taken(raid_list[k][mode].Damage[j],raid_list[k][mode].Damage.Type);
                            let tl=t.insertRow();
                            if(firstdiff==1){
                                tl.innerHTML=`<td class="dotvrlt_first_column" rowspan="`+diffsum+`">`+k+`</td> <td rowspan="`+diffsum+`">`+raid_list[k][mode].Damage.Type+`</td> <td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k][mode].Damage[j]+`)</td>`;
                                firstdiff=0;
                            }
                            else{
                                tl.innerHTML=`<td>`+j+`</td> <td>`+dmg+" (base: "+raid_list[k][mode].Damage[j]+`)</td>`;
                            }
                        }
                    }
                    counters[j]=counters[j]+1;
                }
            }
        }
    }
    update_counters(counters);
    t.getElementsByClassName("dotvrlt_first_column")[t.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    t.getElementsByTagName("tr")[t.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");
}

function create_input_span(div,t,stat,t_end){
    if(!t_end){ t_end=""; }
    var d=document.createElement("div"); d.style.width="100%"; d.style.height="25px"; d.style.marginLeft="5%";
    var s=document.createElement("span"); s.innerHTML=t; d.appendChild(s);
    var i=document.createElement("input");
    i.type="text"; i.style.width="max-content"; i.style.textAlign="right"; i.value=player_stats[stat];
    i.oninput=async function(){ player_stats[stat]=i.value; await GM_setValue(stat+"_stored",i.value); }
    d.appendChild(i);
    var a=document.createElement("span"); a.innerHTML=t_end; d.appendChild(a);
    div.appendChild(d);
}

function createStatsTab(){
    document.getElementById("DotVRLT main title div").innerHTML="Your defense and elemental resistances";
    var d=document.getElementById("DotVRLT main table div"); d.style.fontSize="14px";
    create_input_span(d,"Defense: ","defense");
    create_input_span(d,"Magic resistance: ","Magic","%");
    create_input_span(d,"Psychic resistance: ","Psychic","%");
    create_input_span(d,"Ice resistance: ","Ice","%");
    create_input_span(d,"Fire resistance: ","Fire","%");
    create_input_span(d,"Poison resistance: ","Poison","%");
    create_input_span(d,"Acid resistance: ","Acid","%");
    create_input_span(d,"Nature resistance: ","Nature","%");
    create_input_span(d,"Lightning resistance: ","Lightning","%");
    create_input_span(d,"Holy resistance: ","Holy","%");
    create_input_span(d,"Dark resistance: ","Dark","%");
    var info=document.createElement("div");
    info.style.marginLeft="2%"; info.style.marginRight="2%"; info.style.marginTop="2%";
    info.innerHTML=`
    Input your defense and elemental resistances and you will be able to know how hard raids should hit you, either in the "Damage taken" tab or in the in-raid detailed table.
    <br>
    <b>Note: </b>only the above stats will be taken into account, so additional sources (magics, damage-neglecting generals or weapons...) may reduce it even further, while raid abilities
    may increase it, instead.
    `;
    d.appendChild(info);
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
    main_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x+window.scrollX-100+"px";
    options_div.style.left=document.getElementById("DotVRLT main button").getBoundingClientRect().x-options_div.getBoundingClientRect().width-110+window.scrollX+"px";
}

function add_notes(Notes,d){
    for(let n of Notes){
        var N=document.createElement("span");
        N.innerHTML=n+"<br>";
        d.appendChild(N);
    }
}

function update_counters(counters){
    var L=["All","Easy","Hard","Legendary"];
    if (counters==undefined){
        for(let l of L){ document.getElementById("dotvrlt_counter_"+l).style.display="none"; }
    }
    else{
        var a=0;
        for(let c in counters){
            a=a+counters[c];
            document.getElementById("dotvrlt_counter_"+c).style.display="";
            document.getElementById("dotvrlt_counter_"+c).innerHTML="<i>("+counters[c]+") </i>";
        }
        document.getElementById("dotvrlt_counter_All").style.display="";
        document.getElementById("dotvrlt_counter_All").innerHTML="<i>("+a+") </i>";
    }
}

function createAverageStatsPointsTab(){
    document.getElementById("DotVRLT main title div").innerHTML="Average stat points per 100,000 damage";
    var counters={Easy:0, Hard:0, Legendary:0};
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    t.innerHTML=`<tr class="dotvrlt_fixed_row">
                     <td class="dotvrlt_first_column dotvrlt_sortable_header">Name</td>
                     <td class="dotvrlt_sortable_header">Type</td>
                     <td class="dotvrlt_sortable_header">Size</td>
                     <td class="dotvrlt_sortable_header">Difficulty</td>
                     <td>Loot tiers</td>
                     <td class="dotvrlt_sortable_header">Average stat points</td>
                 </tr>`;
    /* Make various headers clickable for ascending and descending sorting: */
    const headers=t.getElementsByClassName("dotvrlt_fixed_row")[0];
    for(let h of [0,1,2,3,5]){
        //headers.getElementsByTagName("TD")[h].addEventListener("click",function(){ sortTable(t,h); }); // Disabled until sortTable no longer make the page crash...
    }
    /* ----- */
    for(let k in raid_list){
        for(let mode in raid_list[k]){
            let D=raid_list[k][mode]["Available difficulties"];
            for(let j of D){
                if(difficulties_to_display[j]==1){
                    if(raid_list[k][mode]["Average stat points"][j]!=[]){
                        let tl=t.insertRow();
                        let len=( raid_list[k][mode].Tiers[j] || [] ).length; // Reminder: for raids with an image loot table, raid_list[k][mode].Tiers is, by default, an empty object.
                        for(let v=0; v<len; v++){
                            if(![undefined,""].includes(raid_list[k][mode]["Average stat points per 100,000 damage"][j]?.[v])){
                                let tl=t.insertRow();
                                var tiers_text=raid_list[k][mode].Tiers[j][v];
                                if(tiers_text==raid_list[k][mode].FS[j]){ tiers_text="<b>FS: "+tiers_text+"</b>"; }
                                tl.innerHTML=`<td class="dotvrlt_first_column">`+k+`</td>
                                <td>`+raid_list[k][mode]["Raid type"]+`</td>
                                <td>`+raid_list[k][mode]["Raid size"]+`</td>
                                <td>`+j+`</td>
                                <td>`+tiers_text+`</td>
                                <td>`+raid_list[k][mode]["Average stat points per 100,000 damage"][j][v]+`</td>`;
                            }
                        }
                        if(tl.innerHTML==""){ t.tBodies[0].removeChild(tl); };
                    }
                }
                counters[j]=counters[j]+1;
            }
        }
    }
    update_counters(counters);
    t.getElementsByClassName("dotvrlt_first_column")[t.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    t.getElementsByTagName("tr")[t.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");
}

function sanitized_string(t){
    var bounding_profanity = [ ["<script>","</script>"] ];
    var obscenity = ["<script>","</script>"];
    for(let B of bounding_profanity){
        let P = B[0]+"(.*?)"+B[1];
        while(t.match(P)!=null){
            let p = t.match(P)[0];
            t=t.replace(p,"***");
        }
    }
    for(let o of obscenity){
        while(t.search(o) > -1){
            t=t.replace(o,"***");
        }
    }
    return t
}

function sanitized_object(o){
    var sane_object;
    if( typeof(o) == "string" ){ sane_object = sanitized_string(o); }
    else if( typeof(o) == "object" ){
        if( o == null ){ sane_object = null; }
        else if( Array.isArray(o) ){
            sane_object = [];
            for(let k in o){ sane_object[k] = sanitized_object(o[k]); }
        }
        else{
            sane_object = {};
            for(let k in o){ sane_object[sanitized_object(k)] = sanitized_object(o[k]); }
        }
    }
    else{ sane_object = o; }
    return sane_object;
}

function get_last(a){ // Returns last element of an array
    return a[a.length-1]
}

function sortTable(table,n) { // Taken from https://www.w3schools.com/howto/howto_js_sort_table.asp


    //TERRIBLE PERFORMANCE
    // solution?
    var parent = table.parentNode;
    var placeholder = document.createElement('table');
    parent.replaceChild(placeholder, table);

    var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    // Set the sorting direction to descending:
    dir = "desc";
    // Make a loop that will continue until no switching has been done:
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        // Loop through all table rows (except the first, which contains table headers):
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            // Get the two elements you want to compare, one from current row and one from the next:
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            // Check if we are comparing numbers or strings:
            var xt = x.innerHTML.toLowerCase(), yt = y.innerHTML.toLowerCase();
            var are_numbers = !( isNaN(Number(parseFloat(xt.replaceAll(",","")))) || isNaN(Number(parseFloat(yt.replaceAll(",","")))) );
            if(are_numbers){ xt = Number(parseFloat(xt.replaceAll(",",""))); yt = Number(parseFloat(yt.replaceAll(",",""))); }
            // Check if the two rows should switch place, based on the direction, asc or desc:
            if (dir == "asc") {
                if (xt > yt) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (xt < yt) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            // If a switch has been marked, make the switch and mark that a switch has been done:
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount ++;
        } else {
            // If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again.
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    // Remove rounded corners styling to the previous last row and apply it to the new one:
    table.getElementsByClassName("dotvrlt_corners_bottom_left")[0].classList.remove("dotvrlt_corners_bottom_left");
    table.getElementsByClassName("dotvrlt_corners_bottom_right")[0].classList.remove("dotvrlt_corners_bottom_right");
    table.getElementsByClassName("dotvrlt_first_column")[table.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    table.getElementsByTagName("tr")[table.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");

    parent.replaceChild(table, placeholder); // solution to performance issues?
}

async function DotVRLT(){
    await fetch_online_raid_data();
    await initialize_saved_variables();
    create_css();
    create_scrollbars_css()
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
