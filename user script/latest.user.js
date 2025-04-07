// ==UserScript==
// @name         Dragons of the Void - Raid Loot Tiers
// @version      7.4.1
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
        /* MARKER 1 */ raid_list=raid_list||{"Abominacion Macabra": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Dark", "Legendary": "14"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Abominacion_Macabra_1.png", "release_date": "October 21st, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Barren Foliage": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Nature", "Legendary": "14"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Barren_Foliage_1.png", "release_date": "September 12th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Basiliscus": {"raiding": {"Raid size": "Medium", "Raid type": "Guild raid", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": true, "Hard": true, "Legendary": true}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Poison", "Easy": "24", "Hard": "70", "Legendary": "260"}, "Health": {"Easy": "3,200,000", "Hard": "9,600,000", "Legendary": "28,800,000"}, "FS": {"Easy": "320,000", "Hard": "960,000", "Legendary": "2,880,000"}, "Loot tables": {}, "Tiers": {"Easy": ["12,000", "40,000", "75,000", "120,000", "180,000", "320,000", "425,000", "530,000", "640,000", "PI2"], "Hard": ["35,000", "120,000", "320,000", "480,000", "720,000", "960,000", "1,360,000", "1,760,000", "2,160,000", "PI3"], "Legendary": ["2,880,000", "???", "7,200,000", "PI4"]}, "Tiers as string": {"Easy": "12,000 | 40,000 | 75,000 | 120,000 | 180,000 | <b>320,000=FS</b> | 425,000 | 530,000 | 640,000 | PI2", "Hard": "35,000 | 120,000 | 320,000 | 480,000 | 720,000 | <b>960,000=FS</b> | 1,360,000 | 1,760,000 | 2,160,000 | PI3", "Legendary": "<b>2,880,000=FS</b> | ??? | 7,200,000 | PI4"}, "Drops": {"Common": {"Easy": ["1", "1", "2", "2", "2", "3", "3", "3", "4", "?"], "Hard": ["1", "1", "2", "2", "2", "3", "3", "3", "4", "?"], "Legendary": ["?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "1", "1", "2", "2", "2", "3", "3", "3", "?"], "Hard": ["0", "1", "1", "2", "2", "2", "3", "3", "3", "?"], "Legendary": ["?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "1", "1", "1", "2", "2", "?"], "Hard": ["0", "0", "0", "0", "1", "1", "1", "2", "2", "?"], "Legendary": ["?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-"]}, "Hidden": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "SK1", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "SK2", "-"], "Legendary": ["?", "?", "SK3", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "PI2", "PI2"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "PI3", "PI3"], "Legendary": ["?", "?", "PI4", "PI4"]}}, "Average stat points": {"Easy": [], "Hard": ["1.62", "4.03", "5.65", "8.06", "11.22", "12.84", "15.25", "18.41", "20.03", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": ["4.63", "3.36", "1.77", "1.68", "1.56", "1.34", "1.12", "1.05", "0.93", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": ["Hard guild raids always drop an additional void token. Must reach Minimum tier."], "Legendary": ["Legendary guild raids always drop an additional void token. Must reach Minimum tier."]}}}, "Bira Biuyom": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Dark", "Legendary": "16"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Bira_Biuyom_1.png", "release_date": "August 23rd, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Bone Dragon": {"raiding": {"Raid size": "Immense", "Raid type": "", "Maximum number of participants": 250, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "KE2, KE6", "Hard": "KE3, KE7", "Legendary": "KE4, KE8"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Dark", "Easy": "42", "Hard": "65", "Legendary": "280"}, "Health": {"Easy": "90,000,000", "Hard": "270,000,000", "Legendary": "810,000,000"}, "FS": {"Easy": "360,000", "Hard": "1,080,000", "Legendary": "3,240,000"}, "Loot tables": {}, "Tiers": {"Easy": ["25,000", "55,000", "95,000", "133,000", "158,000", "180,000", "265,000", "360,000", "640,000", "800,000", "1,280,000", "1,815,000", "2,400,000", "2,950,000", "3,600,000", "DV4"], "Hard": ["65,000", "125,000", "190,000", "275,000", "400,000", "540,000", "780,000", "1,080,000", "1,875,000", "2,850,000", "4,020,000", "5,360,000", "6,840,000", "8,280,000", "10,800,000", "DV4", "DV7"], "Legendary": ["???", "3,240,000", "???", "32,400,000", "DV4", "DV7"]}, "Tiers as string": {"Easy": "25,000 | 55,000 | 95,000 | 133,000 | 158,000 | 180,000 | 265,000 | <b>360,000=FS</b> | 640,000 | 800,000 | 1,280,000 | 1,815,000 | 2,400,000 | 2,950,000 | 3,600,000 | DV4", "Hard": "65,000 | 125,000 | 190,000 | 275,000 | 400,000 | 540,000 | 780,000 | <b>1,080,000=FS</b> | 1,875,000 | 2,850,000 | 4,020,000 | 5,360,000 | 6,840,000 | 8,280,000 | 10,800,000 | DV4 | DV7", "Legendary": "??? | <b>3,240,000=FS</b> | ??? | 32,400,000 | DV4 | DV7"}, "Drops": {"Common": {"Easy": ["1", "2", "3", "4", "4", "4", "4", "5", "5", "5", "6", "7", "7", "7", "7", "+0"], "Hard": ["1", "2", "3", "4", "4", "4", "5", "5", "5", "5", "6", "7", "7", "7", "7", "+0", "+0"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "0", "0", "1", "1", "2", "2", "3", "3", "3", "3", "4", "4", "5", "+1"], "Hard": ["0", "0", "0", "0", "1", "1", "1", "2", "3", "3", "3", "3", "4", "4", "5", "+1", "+0"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "1", "1", "1", "1", "2", "2", "2", "2", "3", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "1", "1", "1", "1", "2", "2", "2", "2", "3", "3", "+0", "+1"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4", "DV4"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4, DV7", "DV4", "DV7"], "Legendary": ["?", "?", "?", "DV4, DV7", "DV4", "DV7"]}}, "Average stat points": {"Easy": ["1.68", "2.36", "3.04", "3.72", "5.12", "9.93", "10.61", "12.01", "13.41", "18.22", "18.90", "19.58", "20.98", "25.79", "27.19", "+1.4"], "Hard": ["3.08", "4.16", "5.24", "6.32", "8.84", "14.56", "15.64", "18.16", "20.68", "26.4", "27.84", "28.56", "31.08", "36.08", "39.32", "+2.52", "+5.72"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["6.72", "4.29", "3.2", "2.8", "3.24", "5.52", "4.0", "3.34", "2.1", "2.28", "1.48", "1.08", "0.87", "0.87", "0.76", ""], "Hard": ["4.74", "3.33", "2.76", "2.3", "2.21", "2.7", "2.01", "1.68", "1.1", "0.93", "0.69", "0.53", "0.45", "0.44", "0.36", "", ""], "Legendary": []}, "notes": {"Easy": [" Easy Bone Dragon always drops 1 stat point. Must reach Minimum tier."], "Hard": [" Hard Bone Dragon always drops 2 stat points. Must reach Minimum tier."], "Legendary": [" Legendary Bone Dragon always drops 4 stat points. Must reach Minimum tier."]}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE2, KE6", "Hard": "KE4, KE8", "Legendary": "KE4, KE8"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Dark", "Easy": "60", "Hard": "80", "Legendary": "260"}, "Health": {"Easy": 32000, "Hard": 475000, "Legendary": 1425000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["32,000"], "Hard": ["475,000", "AO4"], "Legendary": ["1,425,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "32,000", "Hard": "475,000 | AO4", "Legendary": "1,425,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Corrupted Golem": {"raiding": {"Raid size": "Medium", "Raid type": "", "Maximum number of participants": 50, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": true, "Hard": true, "Legendary": true}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "15", "Hard": "25", "Legendary": "105"}, "Health": {"Easy": "12,000,000", "Hard": "36,000,000", "Legendary": "108,000,000"}, "FS": {"Easy": "240,000", "Hard": "720,000", "Legendary": "2,160,000"}, "Loot tables": {}, "Tiers": {"Easy": ["2,000", "10,000", "20,000", "40,000", "80,000", "120,000", "180,000", "240,000", "300,000", "360,000", "480,000", "600,000", "DV3"], "Hard": ["10,000", "30,000", "60,000", "120,000", "180,000", "250,000", "350,000", "450,000", "600,000", "720,000", "1,100,000", "1,500,000", "2,200,000", "DV3", "DV5"], "Legendary": ["???", "2,160,000", "???", "6,000,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "2,000 | 10,000 | 20,000 | 40,000 | 80,000 | 120,000 | 180,000 | <b>240,000=FS</b> | 300,000 | 360,000 | 480,000 | 600,000 | DV3", "Hard": "10,000 | 30,000 | 60,000 | 120,000 | 180,000 | 250,000 | 350,000 | 450,000 | 600,000 | <b>720,000=FS</b> | 1,100,000 | 1,500,000 | 2,200,000 | DV3 | DV5", "Legendary": "??? | <b>2,160,000=FS</b> | ??? | 6,000,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "SL1", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "SL1", "SL1", "SL1", "SL1", "-", "-"], "Legendary": ["?", "?", "?", "SL1", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.49", "0.98", "1.58", "2.18", "2.67", "3.16", "4.28", "5.4", "6.00", "6.49", "7.09", "8.21", "+0.60"], "Hard": ["0.29", "0.58", "1.80", "2.09", "3.31", "3.6", "3.89", "6.21", "7.43", "7.72", "10.04", "11.26", "13.58", "+", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["24.5", "9.8", "7.9", "5.45", "3.34", "2.63", "2.38", "2.25", "2.0", "1.8", "1.48", "1.37", ""], "Hard": ["2.9", "1.93", "3.0", "1.74", "1.84", "1.44", "1.11", "1.38", "1.24", "1.07", "0.91", "0.75", "0.62", "", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "20", "Hard": "30", "Legendary": "105"}, "Health": {"Easy": 18000, "Hard": 260000, "Legendary": 720000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["18,000"], "Hard": ["260,000", "AO3"], "Legendary": ["720,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "18,000", "Hard": "260,000 | AO3", "Legendary": "720,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Elven Drills": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Physical", "Legendary": "10"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Elven_Drills_1.png", "release_date": "August 7th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Elven Fever Dreams": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Physical", "Legendary": "9"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Elven_Fever_Dreams_1.png", "release_date": "April 6th, 2025"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Elven Rangers": {"raiding": {"Raid size": "Small", "Raid type": "", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "12", "Hard": "35", "Legendary": "190"}, "Health": {"Easy": "1,000,000", "Hard": "3,000,000", "Legendary": "9,000,000"}, "FS": {"Easy": "100,000", "Hard": "300,000", "Legendary": "900,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1", "4,000", "10,000", "20,000", "40,000", "60,000", "80,000", "100,000", "120,000", "150,000", "180,000", "240,000", "DV3"], "Hard": ["1,000", "10,000", "20,000", "40,000", "80,000", "100,000", "150,000", "200,000", "250,000", "300,000", "400,000", "550,000", "750,000", "DV3", "DV5"], "Legendary": ["5,000", "20,000", "75,00", "150,000", "300,000", "450,000", "600,000", "900,000", "1,000,000", "1,200,000", "1,500,000", "1,800,000", "2,000,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1 | 4,000 | 10,000 | 20,000 | 40,000 | 60,000 | 80,000 | <b>100,000=FS</b> | 120,000 | 150,000 | 180,000 | 240,000 | DV3", "Hard": "1,000 | 10,000 | 20,000 | 40,000 | 80,000 | 100,000 | 150,000 | 200,000 | 250,000 | <b>300,000=FS</b> | 400,000 | 550,000 | 750,000 | DV3 | DV5", "Legendary": "5,000 | 20,000 | 75,00 | 150,000 | 300,000 | 450,000 | 600,000 | <b>900,000=FS</b> | 1,000,000 | 1,200,000 | 1,500,000 | 1,800,000 | 2,000,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["1", "2", "2", "3", "3", "4", "4", "5", "5", "5", "5", "6", "6", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "4", "4", "4", "5", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "1", "2", "2", "3", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "15", "Hard": "40", "Legendary": "190"}, "Health": {"Easy": 10000, "Hard": 120000, "Legendary": 360000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["10,000"], "Hard": ["120,000", "AO3"], "Legendary": ["360,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "10,000", "Hard": "120,000 | AO3", "Legendary": "360,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Fachin": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": true}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "KE1, KE4, KE5"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Physical", "Legendary": "11"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Fachin_1.png", "release_date": "February 14th, 2025"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Fallen Naga Subedar": {"raiding": {"Raid size": "Large", "Raid type": "", "Maximum number of participants": 100, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": true, "Hard": true, "Legendary": true}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Poison", "Easy": "34", "Hard": "60", "Legendary": "250"}, "Health": {"Easy": "28,000,000", "Hard": "84,000,000", "Legendary": "252,000,000"}, "FS": {"Easy": "280,000", "Hard": "840,000", "Legendary": "2,520,000"}, "Loot tables": {}, "Tiers": {"Easy": ["10,000", "50,000", "65,000", "80,000", "105,000", "140,000", "200,000", "280,000", "600,000", "1,020,000", "1,440,000", "1,715,000", "1,990,000", "2,240,000", "DV4"], "Hard": ["55,000", "125,000", "205,000", "325,000", "470,000", "620,000", "725,000", "840,000", "1,725,000", "2,650,000", "3,505,000", "4,575,000", "5,650,000", "6,720,000", "DV4", "DV7"], "Legendary": ["???", "2,520,000", "???", "20,160,000", "DV4", "DV7"]}, "Tiers as string": {"Easy": "10,000 | 50,000 | 65,000 | 80,000 | 105,000 | 140,000 | 200,000 | <b>280,000=FS</b> | 600,000 | 1,020,000 | 1,440,000 | 1,715,000 | 1,990,000 | 2,240,000 | DV4", "Hard": "55,000 | 125,000 | 205,000 | 325,000 | 470,000 | 620,000 | 725,000 | <b>840,000=FS</b> | 1,725,000 | 2,650,000 | 3,505,000 | 4,575,000 | 5,650,000 | 6,720,000 | DV4 | DV7", "Legendary": "??? | <b>2,520,000=FS</b> | ??? | 20,160,000 | DV4 | DV7"}, "Drops": {"Common": {"Easy": ["1", "2", "3", "4", "4", "4", "4", "4", "5", "5", "6", "7", "7", "7", "?"], "Hard": ["1", "2", "3", "4", "4", "4", "4", "4", "5", "5", "6", "7", "7", "7", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "0", "0", "1", "2", "2", "3", "3", "3", "3", "3", "4", "4", "?"], "Hard": ["0", "0", "0", "0", "1", "2", "2", "3", "3", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "2", "3", "?"], "Hard": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "2", "3", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "-", "-"], "Legendary": ["-", "SK1", "SK1", "SK1", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4", "DV4"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4, DV7", "DV4", "DV7"], "Legendary": ["?", "?", "?", "DV4, DV7", "DV4", "DV7"]}}, "Average stat points": {"Easy": ["0.43", "0.86", "1.29", "1.72", "2.97", "4.22", "7.81", "9.06", "9.49", "13.08", "13.51", "13.94", "15.19", "18.78", "+"], "Hard": ["0.56", "1.12", "1.68", "2.24", "4.47", "6.70", "11.39", "13.62", "14.18", "18.87", "19.43", "19.99", "22.22", "26.91", "+", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["4.3", "1.72", "1.98", "2.15", "2.83", "3.01", "3.91", "3.24", "1.58", "1.28", "0.94", "0.81", "0.76", "0.84", ""], "Hard": ["1.02", "0.9", "0.82", "0.69", "0.95", "1.08", "1.57", "1.62", "0.82", "0.71", "0.55", "0.44", "0.39", "0.4", "", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Poison", "Easy": "50", "Hard": "70", "Legendary": "230"}, "Health": {"Easy": 26000, "Hard": 380000, "Legendary": 1140000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["26,000"], "Hard": ["380,000", "AO4"], "Legendary": ["1,140,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "26,000", "Hard": "380,000 | AO4", "Legendary": "1,140,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Feast Fixings": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Nature", "Legendary": "18"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Feast_Fixings_1.png", "release_date": "November 7th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Frigidara": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": true}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "KE1, KE3, KE5"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Ice", "Legendary": "12"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Frigidara_1.png", "release_date": "December 18th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Fungal Fiend": {"raiding": {"Raid size": "Small", "Raid type": "Guild raid", "Maximum number of participants": 5, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "6", "Hard": "30", "Legendary": "140"}, "Health": {"Easy": "100,000", "Hard": "300,000", "Legendary": "900,000"}, "FS": {"Easy": "20,000", "Hard": "60,000", "Legendary": "180,000"}, "Loot tables": {}, "Tiers": {"Easy": ["500", "1,000", "5,000", "10,000", "20,000", "25,000", "30,000", "40,000", "50,000", "PI1"], "Hard": ["2,000", "5,000", "10,000", "20,000", "30,000", "60,000", "75,000", "90,000", "120,000", "150,000", "PI2"], "Legendary": ["10,000", "30,000", "60,000", "90,000", "130,000", "180,000", "240,000", "300,000", "360,000", "450,000", "PI3", "PI5"]}, "Tiers as string": {"Easy": "500 | 1,000 | 5,000 | 10,000 | <b>20,000=FS</b> | 25,000 | 30,000 | 40,000 | 50,000 | PI1", "Hard": "2,000 | 5,000 | 10,000 | 20,000 | 30,000 | <b>60,000=FS</b> | 75,000 | 90,000 | 120,000 | 150,000 | PI2", "Legendary": "10,000 | 30,000 | 60,000 | 90,000 | 130,000 | <b>180,000=FS</b> | 240,000 | 300,000 | 360,000 | 450,000 | PI3 | PI5"}, "Drops": {"Common": {"Easy": ["1", "2", "3", "3", "3", "3", "4", "4", "4", "+1"], "Hard": ["1", "2", "2", "2", "3", "3", "4", "4", "4", "5", "?"], "Legendary": ["1", "2", "2", "2", "3", "3", "4", "4", "4", "5", "?", "?"]}, "Rare": {"Easy": ["0", "0", "0", "1", "1", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "1", "2", "2", "2", "2", "3", "3", "3", "?"], "Legendary": ["0", "0", "1", "2", "2", "2", "2", "3", "3", "3", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "1", "1", "1", "2", "2", "+0"], "Hard": ["0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "?"], "Legendary": ["0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "PI1", "PI1"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI2", "PI2"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI3, PI5", "PI3", "PI5"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": ["Hard guild raids always drop an additional void token. Must reach Minimum tier."], "Legendary": ["Legendary guild raids always drop an additional void token. Must reach Minimum tier."]}}}, "Galeohog": {"raiding": {"Raid size": "Large", "Raid type": "", "Maximum number of participants": 100, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": true, "Hard": true, "Legendary": true}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Poison", "Easy": "25", "Hard": "44", "Legendary": "220"}, "Health": {"Easy": "22,000,000", "Hard": "66,000,000", "Legendary": "198,000,000"}, "FS": {"Easy": "220,000", "Hard": "660,000", "Legendary": "1,980,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1", "10,000", "20,000", "40,000", "80,000", "110,000", "150,000", "175,000", "220,000", "330,000", "440,000", "750,000", "1,200,000", "1,760,000"], "Hard": ["2,500", "20,000", "60,000", "120,000", "240,000", "330,000", "480,000", "660,000", "1,200,000", "2,400,000", "3,300,000", "4,400,000", "5,280,000", "DV3", "DV5"], "Legendary": ["90,000", "170,000", "435,000", "780,000", "1,100,000", "1,620,000", "1,980,000", "3,150,000", "4,250,000", "6,520,000", "10,100,000", "12,200,000", "15,800,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1 | 10,000 | 20,000 | 40,000 | 80,000 | 110,000 | 150,000 | 175,000 | <b>220,000=FS</b> | 330,000 | 440,000 | 750,000 | 1,200,000 | 1,760,000", "Hard": "2,500 | 20,000 | 60,000 | 120,000 | 240,000 | 330,000 | 480,000 | <b>660,000=FS</b> | 1,200,000 | 2,400,000 | 3,300,000 | 4,400,000 | 5,280,000 | DV3 | DV5", "Legendary": "90,000 | 170,000 | 435,000 | 780,000 | 1,100,000 | 1,620,000 | <b>1,980,000=FS</b> | 3,150,000 | 4,250,000 | 6,520,000 | 10,100,000 | 12,200,000 | 15,800,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "3", "3", "4", "4", "5", "5", "6", "7", "7"], "Hard": ["1", "2", "2", "2", "3", "3", "3", "4", "4", "5", "5", "6", "6", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "3", "3", "3", "4", "4", "5", "5", "5"], "Hard": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "3", "3", "4", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "3", "3", "4"], "Hard": ["0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "3", "3", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.62", "1.24", "1.68", "2.12", "2.74", "4.00", "4.44", "5.06", "6.32", "7.38", "8.64", "9.70", "10.32", "11.58"], "Hard": ["0.26", "0.52", "2.70", "4.88", "5.14", "8.04", "10.94", "11.2", "13.38", "13.64", "16.54", "16.8", "18.98", "+", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["62,000", "12.4", "8.4", "5.3", "3.43", "3.64", "2.96", "2.89", "2.87", "2.24", "1.96", "1.29", "0.86", "0.66"], "Hard": ["10.4", "2.6", "4.5", "4.07", "2.14", "2.44", "2.28", "1.7", "1.11", "0.57", "0.5", "0.38", "0.36", "", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Poison", "Easy": "30", "Hard": "60", "Legendary": "220"}, "Health": {"Easy": 18000, "Hard": 260000, "Legendary": 720000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["18,000"], "Hard": ["260,000", "AO3"], "Legendary": ["720,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "18,000", "Hard": "260,000 | AO3", "Legendary": "720,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Greater Ent": {"raiding": {"Raid size": "Medium", "Raid type": "", "Maximum number of participants": 50, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "16", "Hard": "38", "Legendary": "200"}, "Health": {"Easy": "8,000,000", "Hard": "24,000,000", "Legendary": "72,000,000"}, "FS": {"Easy": "160,000", "Hard": "480,000", "Legendary": "1,440,000"}, "Loot tables": {}, "Tiers": {"Easy": ["500", "4,000", "8,000", "20,000", "40,000", "80,000", "120,000", "160,000", "200,000", "240,000", "300,000", "350,000", "DV3"], "Hard": ["2,000", "15,000", "30,000", "60,000", "120,000", "180,000", "240,000", "300,000", "400,000", "480,000", "640,000", "960,000", "1,200,000", "DV3", "DV5"], "Legendary": ["???", "1,440,000", "???", "3,600,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "500 | 4,000 | 8,000 | 20,000 | 40,000 | 80,000 | 120,000 | <b>160,000=FS</b> | 200,000 | 240,000 | 300,000 | 350,000 | DV3", "Hard": "2,000 | 15,000 | 30,000 | 60,000 | 120,000 | 180,000 | 240,000 | 300,000 | 400,000 | <b>480,000=FS</b> | 640,000 | 960,000 | 1,200,000 | DV3 | DV5", "Legendary": "??? | <b>1,440,000=FS</b> | ??? | 3,600,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["?", "?", "?", "6", "+0", "+0"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["?", "?", "?", "5", "+1", "+0"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "?", "?"], "Legendary": ["?", "?", "?", "3", "+0", "+1"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.65", "1.30", "1.92", "2.54", "3.19", "3.84", "4.38", "4.92", "5.54", "6.19", "6.81", "7.35", "+0.62"], "Hard": ["0.47", "0.94", "1.63", "2.10", "2.79", "3.26", "3.73", "5.54", "6.23", "6.70", "8.51", "9.20", "11.01", "+", "+"], "Legendary": ["?", "?", "?", "33.93", "+1.63", "+5.26"]}, "Average stat points per 100,000 damage": {"Easy": ["130", "32.5", "24.0", "12.7", "7.97", "4.8", "3.65", "3.08", "2.77", "2.58", "2.27", "2.1", ""], "Hard": ["23.5", "6.27", "5.43", "3.5", "2.32", "1.81", "1.55", "1.85", "1.56", "1.4", "1.33", "0.96", "0.92", "", ""], "Legendary": ["", "", "", "0.94", "", ""]}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "25", "Hard": "50", "Legendary": "200"}, "Health": {"Easy": 15000, "Hard": 200000, "Legendary": 600000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["15,000"], "Hard": ["200,000", "AO3"], "Legendary": ["600,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "15,000", "Hard": "200,000 | AO3", "Legendary": "600,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Hill Troll": {"questing": {"Raid type": "Quest miniboss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "24", "Hard": "40", "Legendary": "180"}, "Health": {"Easy": 12000, "Hard": 140000, "Legendary": 420000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["12,000", "AO1"], "Hard": ["140,000", "AO4"], "Legendary": ["420,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "12,000 | AO1", "Hard": "140,000 | AO4", "Legendary": "420,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["1", "+1"], "Hard": ["2", "+1"], "Legendary": ["3", "+1", "?"]}, "Rare": {"Easy": ["0", "-"], "Hard": ["0", "-"], "Legendary": ["0", "-", "-"]}, "Mythic": {"Easy": ["0", "-"], "Hard": ["0", "-"], "Legendary": ["0", "-", "-"]}, "Summoner": {"Easy": ["-", "-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-", "-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["AO1", "AO1"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Jagar the Red": {"raiding": {"Raid size": "Immense", "Raid type": "", "Maximum number of participants": 250, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": true}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "KE2, KE6", "Hard": "KE3, KE7", "Legendary": "KE4, KE8"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Fire", "Easy": "35", "Hard": "60", "Legendary": "260"}, "Health": {"Easy": "80,000,000", "Hard": "240,000,000", "Legendary": "720,000,000"}, "FS": {"Easy": "320,000", "Hard": "960,000", "Legendary": "2,880,000"}, "Loot tables": {}, "Tiers": {"Easy": ["15,000", "30,000", "50,000", "80,000", "120,000", "160,000", "200,000", "260,000", "320,000", "480,000", "640,000", "1,280,000", "1,920,000", "2,560,000", "3,200,000"], "Hard": ["80,000", "137,000", "226,000", "252,000", "468,000", "?", "?", "?", "768,000", "960,000", "1,680,000", "2,360,000", "4,135,000", "6,190,000", "7,910,000", "9,600,000", "DV4", "DV6"], "Legendary": ["???", "2,880,000", "4,400,000", "5,800,000", "11,600,000", "17,400,000", "23,400,000", "28,800,000", "DV4", "DV7"]}, "Tiers as string": {"Easy": "15,000 | 30,000 | 50,000 | 80,000 | 120,000 | 160,000 | 200,000 | 260,000 | <b>320,000=FS</b> | 480,000 | 640,000 | 1,280,000 | 1,920,000 | 2,560,000 | 3,200,000", "Hard": "80,000 | 137,000 | 226,000 | 252,000 | 468,000 | ? | ? | ? | 768,000 | <b>960,000=FS</b> | 1,680,000 | 2,360,000 | 4,135,000 | 6,190,000 | 7,910,000 | 9,600,000 | DV4 | DV6", "Legendary": "??? | <b>2,880,000=FS</b> | 4,400,000 | 5,800,000 | 11,600,000 | 17,400,000 | 23,400,000 | 28,800,000 | DV4 | DV7"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "5", "5", "5", "6", "6", "6", "6", "6"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "3", "3", "4", "5", "5"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "3", "3", "4"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "SL2", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4, DV6", "DV4", "DV6"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "DV4, DV7", "DV4", "DV7"]}}, "Average stat points": {"Easy": ["0.47", "0.94", "1.63", "2.32", "2.79", "3.26", "5.07", "5.54", "6.23", "8.04", "8.51", "10.32", "11.01", "11.7", "13.51"], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["3.13", "3.13", "3.26", "2.9", "2.32", "2.04", "2.54", "2.13", "1.95", "1.67", "1.33", "0.81", "0.57", "0.46", "0.42"], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Fire", "Easy": "50", "Hard": "70", "Legendary": "240"}, "Health": {"Easy": 25000, "Hard": 375000, "Legendary": 1125000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["25,000"], "Hard": ["375,000", "AO4"], "Legendary": ["1,125,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "25,000", "Hard": "375,000 | AO4", "Legendary": "1,125,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Jolly Gelatin": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": true}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "KE1, KE3, KE5"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Acid", "Legendary": "12"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Jolly_Gelatin_1.png", "release_date": "December 6th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Judah Jingse": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Nature", "Legendary": "14"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Judah_Jingse_1.png", "release_date": "March 6th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Lesser Tree Ent": {"raiding": {"Raid size": "Small", "Raid type": "", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "4", "Hard": "30", "Legendary": "120"}, "Health": {"Easy": "200,000", "Hard": "600,000", "Legendary": "1,800,000"}, "FS": {"Easy": "20,000", "Hard": "60,000", "Legendary": "180,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1", "1,000", "2,000", "5,000", "10,000", "20,000", "30,000", "50,000", "DV1"], "Hard": ["200?", "5,000", "10,000", "20,000", "30,000", "60,000", "87,000", "90,000", "120,000", "DV3", "DV5"], "Legendary": ["1,000", "10,000", "30,000", "60,000", "90,000", "120,000", "180,000", "200,000", "240,000", "300,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1 | 1,000 | 2,000 | 5,000 | 10,000 | <b>20,000=FS</b> | 30,000 | 50,000 | DV1", "Hard": "200? | 5,000 | 10,000 | 20,000 | 30,000 | <b>60,000=FS</b> | 87,000 | 90,000 | 120,000 | DV3 | DV5", "Legendary": "1,000 | 10,000 | 30,000 | 60,000 | 90,000 | 120,000 | <b>180,000=FS</b> | 200,000 | 240,000 | 300,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["2", "2", "3", "4", "4", "4", "4", "5", "+0"], "Hard": ["1", "2", "3", "3", "3", "3", "4", "4", "5", "?", "?"], "Legendary": ["2", "2", "3", "4", "4", "4", "4", "5", "6", "6", "?", "?"]}, "Rare": {"Easy": ["0", "1", "2", "2", "2", "2", "3", "3", "+1"], "Hard": ["0", "1", "1", "2", "2", "3", "3", "4", "4", "?", "?"], "Legendary": ["0", "1", "2", "2", "2", "3", "4", "4", "4", "4", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "1", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "1", "2", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["0", "0", "0", "0", "0", "0", "0", "DV1", "DV1"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "6", "Hard": "30", "Legendary": "120"}, "Health": {"Easy": 5000, "Hard": 90000, "Legendary": 270000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["5,000"], "Hard": ["90,000", "AO3"], "Legendary": ["270,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "5,000", "Hard": "90,000 | AO3", "Legendary": "270,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["0-2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Lubid": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": true}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "KE1, KE3, KE5"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Magic", "Legendary": "12"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Lubid_1.png", "release_date": "February 6th, 2025"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Minor Watcher": {"questing": {"Raid type": "Quest miniboss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": false, "Legendary": false}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Magic", "Easy": "4", "Hard": "20", "Legendary": "80"}, "Health": {"Easy": 3000, "Hard": 35000, "Legendary": 160000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["3,000"], "Hard": ["35,000"], "Legendary": ["160,000"]}, "Tiers as string": {"Easy": "3,000", "Hard": "35,000", "Legendary": "160,000"}, "Drops": {"Common": {"Easy": ["0-1"], "Hard": ["1-2"], "Legendary": ["2"]}, "Rare": {"Easy": ["0"], "Hard": ["0"], "Legendary": ["0"]}, "Mythic": {"Easy": ["0"], "Hard": ["0"], "Legendary": ["0"]}, "Summoner": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}, "Bonus": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Naga Karamati": {"raiding": {"Raid size": "Large", "Raid type": "", "Maximum number of participants": 100, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Lightning", "Easy": "26", "Hard": "50", "Legendary": "230"}, "Health": {"Easy": "24,000,000", "Hard": "72,000,000", "Legendary": "216,000,000"}, "FS": {"Easy": "240,000", "Hard": "720,000", "Legendary": "2,160,000"}, "Loot tables": {}, "Tiers": {"Easy": ["2,000", "10,000", "20,000", "40,000", "80,000", "120,000", "175,000", "240,000", "320,000", "450,000", "580,000", "840,000", "1,350,000", "1,920,000", "DV3"], "Hard": ["15,000", "50,000", "120,000", "180,000", "240,000", "400,000", "600,000", "720,000", "1,120,000", "1,600,000", "2,400,000", "3,200,000", "4,400,000", "5,760,000", "DV3", "DV5"], "Legendary": ["???", "2,160,000", "???", "17,280,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "2,000 | 10,000 | 20,000 | 40,000 | 80,000 | 120,000 | 175,000 | <b>240,000=FS</b> | 320,000 | 450,000 | 580,000 | 840,000 | 1,350,000 | 1,920,000 | DV3", "Hard": "15,000 | 50,000 | 120,000 | 180,000 | 240,000 | 400,000 | 600,000 | <b>720,000=FS</b> | 1,120,000 | 1,600,000 | 2,400,000 | 3,200,000 | 4,400,000 | 5,760,000 | DV3 | DV5", "Legendary": "??? | <b>2,160,000=FS</b> | ??? | 17,280,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "6", "7", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "7", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "4", "4", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "5", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "3", "4", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "3", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.57", "1.14", "1.86", "2.58", "3.15", "3.72", "4.34", "4.96", "5.68", "6.25", "6.97", "7.59", "8.16", "9.35", "+0.72"], "Hard": ["0.39", "0.78", "2.71", "3.10", "5.03", "5.42", "5.81", "7.26", "9.19", "9.58", "11.03", "12.96", "14.41", "16.73", "+", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["28.5", "11.4", "9.3", "6.45", "3.94", "3.1", "2.48", "2.07", "1.77", "1.39", "1.2", "0.9", "0.6", "0.49", ""], "Hard": ["2.6", "1.56", "2.26", "1.72", "2.1", "1.35", "0.97", "1.01", "0.82", "0.6", "0.46", "0.41", "0.33", "0.29", "", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": true, "Hard": true, "Legendary": true}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "KE1, KE5", "Hard": "KE2, KE6", "Legendary": "KE3, KE7"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Lightning", "Easy": "40", "Hard": "65", "Legendary": "220"}, "Health": {"Easy": 20000, "Hard": 300000, "Legendary": 900000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["20,000"], "Hard": ["300,000", "AO3"], "Legendary": ["900,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "20,000", "Hard": "300,000 | AO3", "Legendary": "900,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Naga Risaldar": {"raiding": {"Raid size": "Large", "Raid type": "", "Maximum number of participants": 100, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Poison", "Easy": "10", "Hard": "38", "Legendary": "220"}, "Health": {"Easy": "15,000,000", "Hard": "45,000,000", "Legendary": "135,000,000"}, "FS": {"Easy": "150,000", "Hard": "450,000", "Legendary": "1,350,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1", "5,000", "15,000", "30,000", "75,000", "100,000", "120,000", "150,000", "180,000", "200,000", "300,000", "400,000", "600,000", "800,000", "1,200,000", "DV3"], "Hard": ["1,000", "10,000", "50,000", "100,000", "225,000", "350,000", "450,000", "600,000", "900,000", "1,200,000", "2,000,000", "2,750,000", "3,600,000", "DV3", "DV5"], "Legendary": ["???", "1,350,000", "???", "10,800,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1 | 5,000 | 15,000 | 30,000 | 75,000 | 100,000 | 120,000 | <b>150,000=FS</b> | 180,000 | 200,000 | 300,000 | 400,000 | 600,000 | 800,000 | 1,200,000 | DV3", "Hard": "1,000 | 10,000 | 50,000 | 100,000 | 225,000 | 350,000 | <b>450,000=FS</b> | 600,000 | 900,000 | 1,200,000 | 2,000,000 | 2,750,000 | 3,600,000 | DV3 | DV5", "Legendary": "??? | <b>1,350,000=FS</b> | ??? | 10,800,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "3", "3", "3", "4", "5", "5", "5", "6", "7", "7", "+0"], "Hard": ["1", "2", "2", "2", "3", "3", "3", "3", "4", "5", "5", "5", "6", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "3", "3", "3", "3", "4", "4", "5", "5", "5", "+1"], "Hard": ["0", "0", "1", "2", "2", "2", "3", "3", "3", "3", "4", "4", "4", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "+0"], "Hard": ["0", "0", "0", "0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "?", "?"], "Legendary": ["?", "?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.47", "0.94", "1.43", "1.92", "2.39", "3.20", "3.69", "4.50", "4.97", "5.44", "5.93", "6.74", "7.70", "8.17", "8.98", "+0.49"], "Hard": ["0.97", "1.94", "4.11", "6.28", "7.25", "8.16", "10.33", "11.24", "12.21", "13.18", "15.35", "16.26", "17.23", "+", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["47,000", "18.8", "9.53", "6.4", "3.19", "3.2", "3.08", "3.0", "2.76", "2.72", "1.98", "1.69", "1.28", "1.02", "0.75", ""], "Hard": ["97.0", "19.4", "8.22", "6.28", "3.22", "2.33", "2.3", "1.87", "1.36", "1.1", "0.77", "0.59", "0.48", "", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Poison", "Easy": "12", "Hard": "50", "Legendary": "220"}, "Health": {"Easy": 12000, "Hard": 150000, "Legendary": 450000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["12,000"], "Hard": ["150,000", "AO3"], "Legendary": ["450,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "12,000", "Hard": "150,000 | AO3", "Legendary": "450,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Nitroglycergnat": {"raiding": {"Raid size": "Medium", "Raid type": "Guild raid", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "16", "Hard": "45", "Legendary": "240"}, "Health": {"Easy": "750,000", "Hard": "2,250,000", "Legendary": "6,750,000"}, "FS": {"Easy": "75,000", "Hard": "225,000", "Legendary": "675,000"}, "Loot tables": {}, "Tiers": {"Easy": ["500", "2,000", "5,000", "15,000", "30,000", "50,000", "75,000", "100,000", "125,000", "150,000", "PI2"], "Hard": ["4,000", "20,000", "45,000", "75,000", "115,000", "150,000", "225,000", "270,000", "330,000", "450,000", "PI3"], "Legendary": ["???", "675,000", "???", "1,350,000", "PI4"]}, "Tiers as string": {"Easy": "500 | 2,000 | 5,000 | 15,000 | 30,000 | 50,000 | <b>75,000=FS</b> | 100,000 | 125,000 | 150,000 | PI2", "Hard": "4,000 | 20,000 | 45,000 | 75,000 | 115,000 | 150,000 | <b>225,000=FS</b> | 270,000 | 330,000 | 450,000 | PI3", "Legendary": "??? | <b>675,000=FS</b> | ??? | 1,350,000 | PI4"}, "Drops": {"Common": {"Easy": ["1", "2", "3", "4", "6", "8", "11", "13", "14", "15", "?"], "Hard": ["2", "5", "10", "15", "16", "22", "33", "38", "43", "46", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["1", "2", "3", "4", "6", "8", "11", "13", "14", "15", "?"], "Hard": ["2", "5", "10", "15", "16", "22", "33", "38", "43", "46", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "1", "2", "2", "2", "3", "?"], "Hard": ["0", "0", "0", "0", "1", "1", "2", "2", "2", "3", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI2", "PI2"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI3", "PI3"], "Legendary": ["?", "?", "?", "PI4", "PI4"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": ["Hard guild raids always drop an additional void token. Must reach Minimum tier."], "Legendary": ["Legendary guild raids always drop an additional void token. Must reach Minimum tier."]}}}, "Paeknisar": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Physical", "Legendary": "14"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Paeknisar_1.png", "release_date": "June 7th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Rogue Slime": {"raiding": {"Raid size": "Small", "Raid type": "Guild raid", "Maximum number of participants": 5, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Acid", "Easy": "15", "Hard": "40", "Legendary": "160"}, "Health": {"Easy": "750,000", "Hard": "2,250,000", "Legendary": "6,750,000"}, "FS": {"Easy": "150,000", "Hard": "450,000", "Legendary": "1,350,000"}, "Loot tables": {}, "Tiers": {"Easy": ["5,000", "15,000", "50,000", "80,000", "120,000", "150,000", "180,000", "210,000", "250,000", "300,000", "PI2"], "Hard": ["10,000", "40,000", "80,000", "150,000", "250,000", "350,000", "450,000", "600,000", "800,000", "1,000,000", "PI3"], "Legendary": ["???", "1,350,000", "???", "3,000,000", "PI4"]}, "Tiers as string": {"Easy": "5,000 | 15,000 | 50,000 | 80,000 | 120,000 | <b>150,000=FS</b> | 180,000 | 210,000 | 250,000 | 300,000 | PI2", "Hard": "10,000 | 40,000 | 80,000 | 150,000 | 250,000 | 350,000 | <b>450,000=FS</b> | 600,000 | 800,000 | 1,000,000 | PI3", "Legendary": "??? | <b>1,350,000=FS</b> | ??? | 3,000,000 | PI4"}, "Drops": {"Common": {"Easy": ["1", "2", "7", "10", "15", "18", "21", "24", "26", "28", "?"], "Hard": ["2", "5", "9", "17", "27", "40", "49", "60", "72", "77", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["1", "2", "7", "10", "15", "18", "21", "24", "26", "28", "?"], "Hard": ["2", "5", "9", "17", "27", "40", "49", "60", "72", "77", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "1", "1", "2", "2", "2", "3", "4", "?"], "Hard": ["0", "0", "0", "0", "1", "1", "2", "2", "3", "4", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI2", "PI2"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "PI3", "PI3"], "Legendary": ["?", "?", "?", "PI4", "PI4"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": ["Hard guild raids always drop an additional void token. Must reach Minimum tier."], "Legendary": ["Legendary guild raids always drop an additional void token. Must reach Minimum tier."]}}}, "Rotting Fen Lure": {"raiding": {"Raid size": "Small", "Raid type": "", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": true, "Legendary": true}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "25", "Hard": "45", "Legendary": "210"}, "Health": {"Easy": "3,000,000", "Hard": "9,000,000", "Legendary": "27,000,000"}, "FS": {"Easy": "300,000", "Hard": "900,000", "Legendary": "2,700,000"}, "Loot tables": {}, "Tiers": {"Easy": ["5,000", "15,000", "40,000", "75,000", "145,000", "225,000", "300,000", "380,000", "475,000", "575,000", "650,000", "DV3"], "Hard": ["10,000", "35,000", "95,000", "150,000", "250,000", "350,000", "450,000", "600,000", "750,000", "900,000", "1,200,000", "1,600,000", "2,050,000", "2,500,000", "DV3", "DV5"], "Legendary": ["45,000", "165,000", "390,000", "675,000", "1,050,000", "1,350,000", "2,000,000", "2,700,000", "3,350,000", "4,200,000", "4,950,000", "5,675,000", "6,500,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "5,000 | 15,000 | 40,000 | 75,000 | 145,000 | 225,000 | <b>300,000=FS</b> | 380,000 | 475,000 | 575,000 | 650,000 | DV3", "Hard": "10,000 | 35,000 | 95,000 | 150,000 | 250,000 | 350,000 | 450,000 | 600,000 | 750,000 | <b>900,000=FS</b> | 1,200,000 | 1,600,000 | 2,050,000 | 2,500,000 | DV3 | DV5", "Legendary": "45,000 | 165,000 | 390,000 | 675,000 | 1,050,000 | 1,350,000 | 2,000,000 | <b>2,700,000=FS</b> | 3,350,000 | 4,200,000 | 4,950,000 | 5,675,000 | 6,500,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "3", "3", "3", "4", "4", "4", "5", "5", "+0"], "Hard": ["1", "2", "3", "3", "4", "4", "4", "4", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["1", "2", "3", "3", "4", "4", "4", "4", "5", "5", "5", "6", "6", "+0", "+0"]}, "Rare": {"Easy": ["0", "0", "1", "1", "2", "2", "2", "3", "3", "3", "3", "+1"], "Hard": ["0", "0", "0", "1", "1", "2", "3", "3", "3", "3", "3", "4", "5", "5", "?", "?"], "Legendary": ["0", "0", "0", "1", "1", "2", "2", "3", "3", "3", "4", "4", "4", "+1", "+1"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "2", "2", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "3", "+0", "+0"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "SL1", "SL1", "-", "-"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "SL1", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": [], "Hard": ["0.73", "1.46", "2.19", "3.86", "4.59", "6.26", "7.93", "11.71", "12.44", "16.22", "16.95", "18.62", "20.29", "24.07", "+", "+"], "Legendary": ["3.13", "6.26", "9.39", "14.18", "17.31", "22.10", "30.01", "34.8", "37.93", "45.84", "50.63", "53.76", "61.67", "+4.79", "+4.79"]}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": ["7.3", "4.17", "2.31", "2.57", "1.84", "1.79", "1.76", "1.95", "1.66", "1.8", "1.41", "1.16", "0.99", "0.96", "", ""], "Legendary": ["6.96", "3.79", "2.41", "2.1", "1.65", "1.64", "1.5", "1.29", "1.13", "1.09", "1.02", "0.95", "0.95", "", ""]}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Nature", "Easy": "35", "Hard": "60", "Legendary": "210"}, "Health": {"Easy": 16000, "Hard": 250000, "Legendary": 750000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["16,000"], "Hard": ["250,000", "AO4"], "Legendary": ["750,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "16,000", "Hard": "250,000 | AO4", "Legendary": "750,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Sand Wyrm": {"raiding": {"Raid size": "Small", "Raid type": "", "Maximum number of participants": 10, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": true, "Hard": true, "Legendary": true}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "20", "Hard": "40", "Legendary": "200"}, "Health": {"Easy": "2,500,000", "Hard": "7,500,000", "Legendary": "22,500,000"}, "FS": {"Easy": "250,000", "Hard": "750,000", "Legendary": "2,250,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1,000", "10,000", "25,000", "50,000", "100,000", "150,000", "200,000", "250,000", "300,000", "380,000", "450,000", "525,000", "DV3"], "Hard": ["15,000", "35,000", "75,000", "150,000", "225,000", "300,000", "400,000", "500,000", "625,000", "750,000", "1,000,000", "1,500,000", "2,000,000", "DV3", "DV5"], "Legendary": ["100,000", "250,000", "500,000", "800,000", "1,100,000", "1,500,000", "1,750,000", "2,250,000", "2,750,000", "3,250,000", "4,000,000", "4,750,000", "5,500,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1,000 | 10,000 | 25,000 | 50,000 | 100,000 | 150,000 | 200,000 | <b>250,000=FS</b> | 300,000 | 380,000 | 450,000 | 525,000 | DV3", "Hard": "15,000 | 35,000 | 75,000 | 150,000 | 225,000 | 300,000 | 400,000 | 500,000 | 625,000 | <b>750,000=FS</b> | 1,000,000 | 1,500,000 | 2,000,000 | DV3 | DV5", "Legendary": "100,000 | 250,000 | 500,000 | 800,000 | 1,100,000 | 1,500,000 | 1,750,000 | <b>2,250,000=FS</b> | 2,750,000 | 3,250,000 | 4,000,000 | 4,750,000 | 5,500,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["1", "2", "2", "3", "3", "4", "4", "4", "5", "5", "5", "6", "6", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "1", "1", "2", "2", "2", "3", "3", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["0", "0", "1", "1", "2", "2", "2", "3", "3", "4", "4", "4", "5", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "1", "2", "3", "3", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "SK1", "SK1", "SK1", "SK1", "SK1", "SK1", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV3", "DV3", "DV3", "DV3", "DV3"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": [], "Hard": ["0.37", "0.74", "2.05", "2.42", "3.73", "4.10", "4.47", "7.10", "8.41", "8.78", "11.41", "12.72", "15.35", "+", "+"], "Legendary": ["2.73", "5.46", "7.24", "9.97", "11.75", "14.48", "16.83", "18.61", "21.34", "23.12", "25.47", "30.55", "32.33", "+", "+"]}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": ["2.47", "2.11", "2.73", "1.61", "1.66", "1.37", "1.12", "1.42", "1.35", "1.17", "1.14", "0.85", "0.77", "", ""], "Legendary": ["2.73", "2.18", "1.45", "1.25", "1.07", "0.97", "0.96", "0.83", "0.78", "0.71", "0.64", "0.64", "0.59", "", ""]}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "25", "Hard": "50", "Legendary": "200"}, "Health": {"Easy": 12000, "Hard": 150000, "Legendary": 450000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["12,000"], "Hard": ["150,000", "AO3"], "Legendary": ["450,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "12,000", "Hard": "150,000 | AO3", "Legendary": "450,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Secutor": {"healthless": {"Raid type": "Timed raid", "Raid size": "World", "Maximum number of participants": 2000, "Loot format": "EHL", "Available difficulties": ["Easy"], "Has extra drops": {"Summoner": {"Easy": false}, "Hidden": {"Easy": false}, "Bonus": {"Easy": true}, "On-hit drops": {"Easy": false}, "Loot expansion": {"Easy": false}}, "Extra drops": {"On-hit drops": {"Easy": "no"}, "Loot expansion": {"Easy": "no"}}, "Damage": {"Type": "Physical", "Easy": "26"}, "Health": {"Easy": ""}, "FS": {"Easy": 0}, "Loot tables": {}, "Tiers": {"Easy": ["100,000", "350,000", "1,000,000", "10,000,000", "DV5"]}, "Tiers as string": {"Easy": "100,000 | 350,000 | 1,000,000 | 10,000,000 | DV5"}, "Drops": {"Common": {"Easy": ["1", "1", "2", "2", "?"]}, "Rare": {"Easy": ["0", "1", "1", "1", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "1", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "DV5", "DV5"]}}, "Average stat points": {"Easy": []}, "Average stat points per 100,000 damage": {"Easy": []}, "notes": {"Easy": ["Secutor always drops 1 Thiadoran Fig. Must reach Minimum tier."]}}}, "Sentry Ghoul": {"raiding": {"Raid size": "Medium", "Raid type": "", "Maximum number of participants": 50, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "35", "Hard": "55", "Legendary": "230"}, "Health": {"Easy": "13,000,000", "Hard": "39,000,000", "Legendary": "117,000,000"}, "FS": {"Easy": "260,000", "Hard": "780,000", "Legendary": "2,340,000"}, "Loot tables": {}, "Tiers": {"Easy": ["7,500", "25,000", "55,000", "80,000", "105,000", "130,000", "190,000", "260,000", "330,000", "400,000", "480,000", "560,000", "650,000", "DV4"], "Hard": ["15,000", "45,000", "75,000", "180,000", "280,000", "390,000", "575,000", "780,000", "1,025,000", "1,275,000", "1,550,000", "1,875,000", "2,250,000", "DV4", "DV7"], "Legendary": ["55,000", "190,000", "350,000", "620,000", "900,000", "1,200,000", "1,750,000", "2,340,000", "3,150,000", "4,080,000", "4,950,000", "6,100,000", "6,950,000", "DV4", "DV7"]}, "Tiers as string": {"Easy": "7,500 | 25,000 | 55,000 | 80,000 | 105,000 | 130,000 | 190,000 | <b>260,000=FS</b> | 330,000 | 400,000 | 480,000 | 560,000 | 650,000 | DV4", "Hard": "15,000 | 45,000 | 75,000 | 180,000 | 280,000 | 390,000 | 575,000 | <b>780,000=FS</b> | 1,025,000 | 1,275,000 | 1,550,000 | 1,875,000 | 2,250,000 | DV4 | DV7", "Legendary": "55,000 | 190,000 | 350,000 | 620,000 | 900,000 | 1,200,000 | 1,750,000 | <b>2,340,000=FS</b> | 3,150,000 | 4,080,000 | 4,950,000 | 6,100,000 | 6,950,000 | DV4 | DV7"}, "Drops": {"Common": {"Easy": ["1", "2", "3", "3", "4", "4", "4", "4", "5", "5", "6", "6", "6", "?"], "Hard": ["1", "2", "3", "3", "4", "4", "4", "4", "5", "5", "6", "6", "6", "?", "?"], "Legendary": ["1", "2", "3", "3", "4", "4", "4", "4", "5", "5", "6", "6", "6", "+0", "+0"]}, "Rare": {"Easy": ["0", "0", "0", "1", "1", "2", "2", "3", "3", "3", "3", "4", "4", "?"], "Hard": ["0", "0", "0", "1", "1", "2", "2", "3", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["0", "0", "0", "1", "1", "2", "2", "3", "3", "3", "3", "4", "4", "+1", "+0"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "3", "?"], "Hard": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "3", "+0", "+1"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4", "DV4"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4, DV7", "DV4", "DV7"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV4, DV7", "DV4", "DV7"]}}, "Average stat points": {"Easy": [], "Hard": ["0.57", "1.14", "1.71", "3.14", "3.71", "5.14", "11.39", "12.82", "13.39", "19.64", "20.21", "21.64", "27.89", "+", "+"], "Legendary": ["1.07", "2.14", "3.21", "7.52", "8.59", "12.90", "24.21", "28.52", "29.59", "40.90", "41.97", "46.28", "57.59", "+4.31", "+11.31"]}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": ["3.8", "2.53", "2.28", "1.74", "1.32", "1.32", "1.98", "1.64", "1.31", "1.54", "1.3", "1.15", "1.24", "", ""], "Legendary": ["1.95", "1.13", "0.92", "1.21", "0.95", "1.07", "1.38", "1.22", "0.94", "1.0", "0.85", "0.76", "0.83", "", ""]}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Physical", "Easy": "45", "Hard": "65", "Legendary": "220"}, "Health": {"Easy": 21000, "Hard": 320000, "Legendary": 960000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["21,000"], "Hard": ["320,000", "AO4"], "Legendary": ["960,000", "AO4", "AO7"]}, "Tiers as string": {"Easy": "21,000", "Hard": "320,000 | AO4", "Legendary": "960,000 | AO4 | AO7"}, "Drops": {"Common": {"Easy": ["2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO4", "AO4"], "Legendary": ["AO4, AO7", "AO4", "AO7"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Serpent Soldier": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Poison", "Legendary": "14"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Serpent_Soldier_1.png", "release_date": "July 10th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Skliros": {"healthless": {"Raid type": "World raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Dark", "Legendary": "10"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Skliros_0.png", "release_date": "Beta"}, {"URL": "https://matrix4348.github.io/loot-tables/Skliros_1.png", "release_date": "January 31st, 2024"}, {"URL": "https://matrix4348.github.io/loot-tables/Skliros_2.png", "release_date": "January 18th, 2025"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Sluagh": {"healthless": {"Raid type": "Timed raid", "Raid size": "World", "Maximum number of participants": 2000, "Loot format": "EHL", "Available difficulties": ["Easy"], "Has extra drops": {"Summoner": {"Easy": false}, "Hidden": {"Easy": false}, "Bonus": {"Easy": true}, "On-hit drops": {"Easy": false}, "Loot expansion": {"Easy": false}}, "Extra drops": {"On-hit drops": {"Easy": "no"}, "Loot expansion": {"Easy": "no"}}, "Damage": {"Type": "Magic", "Easy": "18"}, "Health": {"Easy": ""}, "FS": {"Easy": 0}, "Loot tables": {}, "Tiers": {"Easy": ["100,000", "2,100,000", "5.59m~", "8.75m~", "12,500,000", "20,000,000", "DV4", "DV8"]}, "Tiers as string": {"Easy": "100,000 | 2,100,000 | 5.59m~ | 8.75m~ | 12,500,000 | 20,000,000 | DV4 | DV8"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "3", "+0", "+0"]}, "Rare": {"Easy": ["0", "0", "1", "1", "1", "2", "+1", "+0"]}, "Mythic": {"Easy": ["0", "0", "0", "1", "1", "1", "+0", "+1"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "DV4, DV8", "DV4", "DV8"]}}, "Average stat points": {"Easy": []}, "Average stat points per 100,000 damage": {"Easy": []}, "notes": {"Easy": []}}}, "Spiderling": {"questing": {"Raid type": "Quest miniboss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": false, "Legendary": false}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Poison", "Easy": "15", "Hard": "25", "Legendary": "120"}, "Health": {"Easy": 6000, "Hard": 70000, "Legendary": 210000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["6,000"], "Hard": ["70,000"], "Legendary": ["210,000"]}, "Tiers as string": {"Easy": "6,000", "Hard": "70,000", "Legendary": "210,000"}, "Drops": {"Common": {"Easy": ["0-1"], "Hard": ["1-2"], "Legendary": ["3"]}, "Rare": {"Easy": ["0"], "Hard": ["0"], "Legendary": ["0"]}, "Mythic": {"Easy": ["0"], "Hard": ["0"], "Legendary": ["0"]}, "Summoner": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}, "Bonus": {"Easy": ["-"], "Hard": ["-"], "Legendary": ["-"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Spooky Ghouls": {"healthless": {"Raid type": "Event raid", "Raid size": "World", "Maximum number of participants": 10000, "Loot format": "Image", "Available difficulties": ["Legendary"], "Has extra drops": {"Summoner": {"Legendary": false}, "Hidden": {"Legendary": false}, "Bonus": {"Legendary": false}, "On-hit drops": {"Legendary": false}, "Loot expansion": {"Legendary": false}}, "Extra drops": {"On-hit drops": {"Legendary": "no"}, "Loot expansion": {"Legendary": "no"}}, "Damage": {"Type": "Physical", "Legendary": "12"}, "Health": {"Legendary": ""}, "FS": {"Legendary": 0}, "Loot tables": {"Legendary": [{"URL": "https://matrix4348.github.io/loot-tables/Spooky_Ghouls_1.png", "release_date": "October 8th, 2024"}]}, "Tiers": {}, "Tiers as string": {}, "Drops": {}, "Average stat points": {"Legendary": []}, "Average stat points per 100,000 damage": {"Legendary": []}, "notes": {"Legendary": []}}}, "Superior Watcher": {"raiding": {"Raid size": "Medium", "Raid type": "", "Maximum number of participants": 50, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Magic", "Easy": "6", "Hard": "32", "Legendary": "180"}, "Health": {"Easy": "4,000,000", "Hard": "12,000,000", "Legendary": "36,000,000"}, "FS": {"Easy": "80,000", "Hard": "240,000", "Legendary": "720,000"}, "Loot tables": {}, "Tiers": {"Easy": ["1", "2,000", "5,000", "10,000", "20,000", "40,000", "60,000", "80,000", "110,000", "140,000", "160,000", "200,000", "DV2"], "Hard": ["200?", "5,000", "10,000", "20,000", "40,000", "80,000", "120,000", "160,000", "200,000", "240,000", "300,000", "400,000", "480,000", "DV3", "DV5"], "Legendary": ["5,000", "20,000", "60,000", "120,000", "240,000", "360,000", "480,000", "720,000", "840,000", "960,000", "1,080,000", "1,200,000", "1,440,000", "DV3", "DV6"]}, "Tiers as string": {"Easy": "1 | 2,000 | 5,000 | 10,000 | 20,000 | 40,000 | 60,000 | <b>80,000=FS</b> | 110,000 | 140,000 | 160,000 | 200,000 | DV2", "Hard": "200? | 5,000 | 10,000 | 20,000 | 40,000 | 80,000 | 120,000 | 160,000 | 200,000 | <b>240,000=FS</b> | 300,000 | 400,000 | 480,000 | DV3 | DV5", "Legendary": "5,000 | 20,000 | 60,000 | 120,000 | 240,000 | 360,000 | 480,000 | <b>720,000=FS</b> | 840,000 | 960,000 | 1,080,000 | 1,200,000 | 1,440,000 | DV3 | DV6"}, "Drops": {"Common": {"Easy": ["1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "5", "5", "+0"], "Hard": ["1", "2", "2", "3", "3", "4", "5", "5", "5", "6", "6", "6", "6", "?", "?"], "Legendary": ["1", "2", "2", "3", "3", "4", "4", "5", "5", "5", "5", "6", "6", "?", "?"]}, "Rare": {"Easy": ["0", "0", "1", "2", "2", "2", "2", "2", "3", "3", "4", "4", "+1"], "Hard": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "3", "3", "4", "4", "?", "?"], "Legendary": ["0", "0", "1", "1", "2", "2", "2", "2", "3", "4", "4", "4", "5", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "0", "0", "1", "2", "2", "2", "2", "3", "+0"], "Hard": ["0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "2", "3", "?", "?"], "Legendary": ["0", "0", "0", "0", "0", "0", "1", "1", "1", "1", "2", "3", "3", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "DV2", "DV2", "DV2", "DV2", "DV2"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV5", "DV3", "DV5"], "Legendary": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "DV3, DV6", "DV3", "DV6"]}}, "Average stat points": {"Easy": ["0.43", "0.86", "1.24", "1.62", "2.05", "2.48", "3.12", "3.76", "4.14", "4.57", "4.95", "5.59", "+0.38"], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": ["43,000", "43.0", "24.8", "16.2", "10.25", "6.2", "5.2", "4.7", "3.76", "3.26", "3.09", "2.79", ""], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}, "questing": {"Raid type": "Quest boss", "Raid size": "Quest", "Maximum number of participants": 1, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": false, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": false, "Hard": false, "Legendary": false}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "no", "Hard": "no", "Legendary": "no"}}, "Damage": {"Type": "Magic", "Easy": "8", "Hard": "40", "Legendary": "190"}, "Health": {"Easy": 10000, "Hard": 120000, "Legendary": 360000}, "FS": {"Easy": 0, "Hard": 0, "Legendary": 0}, "Loot tables": {}, "Tiers": {"Easy": ["10,000"], "Hard": ["120,000", "AO3"], "Legendary": ["360,000", "AO3", "AO6"]}, "Tiers as string": {"Easy": "10,000", "Hard": "120,000 | AO3", "Legendary": "360,000 | AO3 | AO6"}, "Drops": {"Common": {"Easy": ["0-2"], "Hard": ["2", "+0"], "Legendary": ["2", "+0", "?"]}, "Rare": {"Easy": ["0"], "Hard": ["1", "+1"], "Legendary": ["1", "+1", "?"]}, "Mythic": {"Easy": ["0"], "Hard": ["0", "+0"], "Legendary": ["1", "+0", "?"]}, "Summoner": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Hidden": {"Easy": ["-"], "Hard": ["-", "-"], "Legendary": ["-", "-", "-"]}, "Bonus": {"Easy": ["-"], "Hard": ["AO3", "AO3"], "Legendary": ["AO3, AO6", "AO3", "AO6"]}}, "Average stat points": {"Easy": [], "Hard": [], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": [], "Legendary": []}, "notes": {"Easy": [], "Hard": [], "Legendary": []}}}, "Tunnanu": {"raiding": {"Raid size": "Large", "Raid type": "Guild raid", "Maximum number of participants": 20, "Loot format": "EHL", "Available difficulties": ["Easy", "Hard", "Legendary"], "Has extra drops": {"Summoner": {"Easy": false, "Hard": false, "Legendary": false}, "Hidden": {"Easy": false, "Hard": false, "Legendary": false}, "Bonus": {"Easy": true, "Hard": true, "Legendary": true}, "On-hit drops": {"Easy": false, "Hard": false, "Legendary": false}, "Loot expansion": {"Easy": true, "Hard": true, "Legendary": true}}, "Extra drops": {"On-hit drops": {"Easy": "no", "Hard": "no", "Legendary": "no"}, "Loot expansion": {"Easy": "yes", "Hard": "yes", "Legendary": "yes"}}, "Damage": {"Type": "Physical", "Easy": "12", "Hard": "22", "Legendary": "56"}, "Health": {"Easy": "4,600,000", "Hard": "13,800,000", "Legendary": "41,400,000"}, "FS": {"Easy": "230,000", "Hard": "690,000", "Legendary": "2,070,000"}, "Loot tables": {}, "Tiers": {"Easy": ["2,500", "10,000", "25,000", "75,000", "120,000", "230,000", "390,000", "575,000", "770,000", "950,000", "1,150,000", "PI2"], "Hard": ["15,000", "50,000", "120,000", "200,000", "350,000", "690,000", "1,175,000", "1,775,000", "2,350,000", "3,000,000", "3,550,000", "4,200,000", "PI3"], "Legendary": ["???", "2,070,000", "???", "14,500,000", "PI4"]}, "Tiers as string": {"Easy": "2,500 | 10,000 | 25,000 | 75,000 | 120,000 | <b>230,000=FS</b> | 390,000 | 575,000 | 770,000 | 950,000 | 1,150,000 | PI2", "Hard": "15,000 | 50,000 | 120,000 | 200,000 | 350,000 | <b>690,000=FS</b> | 1,175,000 | 1,775,000 | 2,350,000 | 3,000,000 | 3,550,000 | 4,200,000 | PI3", "Legendary": "??? | <b>2,070,000=FS</b> | ??? | 14,500,000 | PI4"}, "Drops": {"Common": {"Easy": ["1", "1", "2", "2", "2", "3", "4", "4", "4", "4", "5", "?"], "Hard": ["1", "1", "2", "2", "2", "3", "3", "3", "3", "3", "3", "4", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Rare": {"Easy": ["0", "1", "1", "2", "2", "2", "2", "3", "3", "4", "5", "?"], "Hard": ["0", "1", "1", "2", "2", "2", "3", "3", "4", "5", "5", "5", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Mythic": {"Easy": ["0", "0", "0", "0", "1", "1", "1", "1", "2", "2", "2", "?"], "Hard": ["0", "0", "0", "0", "1", "1", "1", "2", "2", "2", "3", "3", "?"], "Legendary": ["?", "?", "?", "?", "?"]}, "Summoner": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Hidden": {"Easy": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Hard": ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], "Legendary": ["-", "-", "-", "-", "-"]}, "Bonus": {"Easy": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "PI2", "PI2"], "Hard": ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "PI3", "PI3"], "Legendary": ["?", "?", "?", "PI4", "PI4"]}}, "Average stat points": {"Easy": [], "Hard": ["0.99", "2.07", "3.06", "4.14", "6.00", "6.99", "8.07", "9.93", "11.01", "12.09", "13.95", "14.94", "+"], "Legendary": []}, "Average stat points per 100,000 damage": {"Easy": [], "Hard": ["6.6", "4.14", "2.55", "2.07", "1.71", "1.01", "0.69", "0.56", "0.47", "0.4", "0.39", "0.36", ""], "Legendary": []}, "notes": {"Easy": [], "Hard": ["Hard guild raids always drop an additional void token. Must reach Minimum tier."], "Legendary": ["Legendary guild raids always drop an additional void token. Must reach Minimum tier."]}}}}; /* MARKER 1 */
    }
    setTimeout(fetch_online_raid_data,3600000); // Update raid data every hour, for long sessions.
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
            --in-raid-table-body-max-height: 520px;
            --in-raid-table-max-width: 420px;
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
            top: 25px;
        }
        .dotvrlt_fixed_row_3 {
            position: sticky;
            top: 55px;
        }
        .dotvrlt_table_container {
            overflow-y: hidden;
            height: auto;
        }
        .dotvrlt_sortable_header {
            cursor: pointer;
        }
        .dotvrlt_corners div, .dotvrlt_corners table, .dotvrlt_corners tbody, .dotvrlt_corners tr, .dotvrlt_corners td {
            background-color: inherit;
        }
        .dotvrlt_question_mark {
            position: absolute;
            right: 2%;
            top: 2%;
            cursor: pointer;
            border-radius: 20px;
            border: 1px solid black;
            background-color: rgb(240,240,240) !important;
            color: rgb(10,10,10);
        }
        .dotvrlt_hover_message {
            background-color: white;
            z-index: 100000;
            position: fixed;
            width: 500px;
            padding: 5px;
            font-size: 14px;
            border: 1px solid black;
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
            width: 500px;
            max-height: 130px;
            display: var(--in-raid-display);
            border: 1px solid black;
            overflow: auto;
            position: absolute;
            z-index: 0;
        }
        #DotVRLT\\ in-raid\\ table\\ div {
            width: 100%;
            max-height: 90px;
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
        #DotVRLT\\ detailed\\ table tbody {
            display: block;
            overflow-y: auto;
            max-height: var(--in-raid-table-body-max-height);
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
    create_question_mark(document.getElementById("DotVRLT main title div"));
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
        <tr class="dotvrlt_fixed_row_2"> <td>Difficulty</td> <td>Damage</td> <td colspan="3">Common | rare | mythic</td> <td colspan="3">Summoner | hidden | bonus</td> <td>Average stat points</td> </tr>`;
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
    else if(name=="Timed"){ createTable("Timed raids",["raiding","healthless"],"All","Timed raid",["Type","Size"]); }
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
    createTabButton(t2,"Timed");
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

async function create_in_raid_div(raid_name,mode,raid_difficulty){
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
        t.innerHTML=`<td class="dotvrlt_corners_top" style="padding-left: 7px; padding-right: 7px;">`+raid_list[raid_name][mode]["Tiers as string"][raid_difficulty]+`</td>`;
    }
    else if(raid_list[raid_name][mode]["Loot format"]=="Image"){
        let on_hit_text = raid_list[raid_name][mode]["Has extra drops"]["On-hit drops"][raid_difficulty] ? "<br><b>On-hit drops: "+raid_list[raid_name][mode]["Extra drops"]["On-hit drops"][raid_difficulty]+"</b>" : "";
        var ver=get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL.match(/_[0-9]*\.png/g);
        var ver2= ver>1 ? "_v"+ver : "",
            ver3= ver>0 ? "_v"+(Number(ver)+1) : "";
        var url1="https://files.dragonsofthevoid.com/images/raid/loot-tables/"+raid_name.toLowerCase().replaceAll(/\W/g,"_")+ver2+".png",
            url2="https://files.dragonsofthevoid.com/images/raid/loot-tables/"+raid_name.toLowerCase().replaceAll(/\W/g,"_")+ver3+".png";
        var official_url=check_several_url([url1,url2]);
        // Note: I do not know if raid loot tables will always be named the same way, nor how they would be name when containing something like 's. Until then, I am assuming that "'" is treated like " ".
        if(official_url){
            t.innerHTML=`<td class="dotvrlt_corners_top" style="word-break:break-all">Current loot table: <br><i>`+official_url+on_hit_text+`</td>`;
        }
        else{
            t.innerHTML=`<td class="dotvrlt_corners_top" style="word-break:break-all">Latest loot table known by the script (date of first use: `+get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).release_date+`): <br><i>`+get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL+`</i><br>For guaranteed up-to-date one: click "Loot", then "Expanded Loot".`+on_hit_text+`</td>`;
        }
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

async function create_detailed_div(raid_name,mode,raid_difficulty){
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
        var ncol=4+raid_list[raid_name][mode]["Has extra drops"].Hidden[raid_difficulty]+raid_list[raid_name][mode]["Has extra drops"].Summoner[raid_difficulty]+raid_list[raid_name][mode]["Has extra drops"].Bonus[raid_difficulty]+(raid_list[raid_name][mode]["Average stat points"][raid_difficulty].length>0);
        var t=document.createElement("table");
        t.id="DotVRLT detailed table";
        t.classList.add("dotvrlt_table");
        t.border=1;
        t.innerHTML=`<thead> <tr> <td class="dotvrlt_corners_top" colspan="`+ncol+`" style="font-size:18px;">`+raid_name+" ("+raid_difficulty.toLowerCase()+`)</td> </tr> </thead> <tbody></tbody>`;
        var table_container=document.createElement("div");
        table_container.classList.add("dotvrlt_table_container");
        d.appendChild(table_container);
        table_container.appendChild(t);
        create_question_mark(t.getElementsByTagName("TD")[0]);
        t=t.tBodies[0];
        var l1=Math.ceil(ncol/2), l2=Math.floor(ncol/2);
        var r0=t.insertRow();
        if(raid_list[raid_name][mode]["Raid type"]!=""){ r0.innerHTML=`<td colspan="`+l1+`">`+raid_list[raid_name][mode]["Raid type"]+`</td> <td colspan="`+l2+`"> Size: `+raid_list[raid_name][mode]["Raid size"]+`</td>`; }
        else{ r0.innerHTML=`<td colspan="`+ncol+`"> Size: `+raid_list[raid_name][mode]["Raid size"]+`</td>`; }
        var r1=t.insertRow();
        var dmg=damage_taken(raid_list[raid_name][mode].Damage[raid_difficulty],raid_list[raid_name][mode].Damage.Type);
        r1.innerHTML=`<td colspan="`+ncol+`"> Damage taken: `+dmg+` (base: `+raid_list[raid_name][mode].Damage[raid_difficulty]+`, type: `+raid_list[raid_name][mode].Damage.Type.toLowerCase()+`)</td>`;
        var r1b=t.insertRow();
        r1b.innerHTML=`<td colspan="`+l1+`"> On-hit drops: `+raid_list[raid_name][mode]["Extra drops"]["On-hit drops"][raid_difficulty]+`</td> <td colspan="`+l2+`"> Loot expansion: `+raid_list[raid_name][mode]["Extra drops"]["Loot expansion"][raid_difficulty]+`</td>`;
        var r2=t.insertRow(); r2.classList.add("dotvrlt_fixed_row"); r2.innerHTML=`<td class="dotvrlt_first_column" rowspan="2">Damage</td><td colspan="`+(ncol-1)+`">Loot drops</td>`;
        var r3=t.insertRow(); r3.classList.add("dotvrlt_fixed_row_2"); r3.innerHTML=`<td>Common</td><td>Rare</td><td>Mythic</td>`;
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
        var ver=get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL.match(/_[0-9]*\.png/g);
        var ver2= ver>1 ? "_v"+ver : "",
            ver3= ver>0 ? "_v"+(Number(ver)+1) : "";
        var url1="https://files.dragonsofthevoid.com/images/raid/loot-tables/"+raid_name.toLowerCase().replaceAll(/\W/g,"_")+ver2+".png",
            url2="https://files.dragonsofthevoid.com/images/raid/loot-tables/"+raid_name.toLowerCase().replaceAll(/\W/g,"_")+ver3+".png";
        var official_url=check_several_url([url1,url2]);
        // Note: I do not know if raid loot tables will always be named the same way, nor how they would be name when containing something like 's. Until then, I am assuming that "'" is treated like " ".
        if(official_url){ i.src=official_url; } else{ i.src=get_last(raid_list[raid_name][mode]["Loot tables"][raid_difficulty]).URL; }
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
    var raid_name=document.getElementsByClassName("boss-name-container")[0].firstChild.innerHTML;
    if( !(raid_name in raid_list) || raid_list[raid_name]?.[current_fighting_mode()]["Loot format"]=="Image" ){ H=Math.min(550,H); }
    document.documentElement.style.setProperty("--in-raid-table-max-height",H+"px");
    if(show_detailed_div&&in_raid_button_pressed){ document.documentElement.style.setProperty("--detailed-div-display","flex"); }
    else{ document.documentElement.style.setProperty("--detailed-div-display","none"); }
    var Hhead=(detailed_div.getElementsByTagName("THEAD")?.[0]||document.createElement("div")).getBoundingClientRect().height;
    document.documentElement.style.setProperty("--in-raid-table-body-max-height",(H-Hhead-5)+"px");
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
        else{ bring_stuff_for_some_unknown_raids(raid_name,mode,current_difficulty); }
    }
    else if(A){setTimeout(function(B){in_raid_stuff(B);},1000,A-1);}
}

async function bring_stuff_for_some_unknown_raids(raid_name,mode,current_difficulty){
    if(mode=="healthless"){
        var official_url="https://files.dragonsofthevoid.com/images/raid/loot-tables/"+raid_name.toLowerCase().replaceAll(/\W/g,"_")+".png";
        // Note: I do not know if raid loot tables will always be named the same way, nor how they would be name when containing something like 's. Until then, I am assuming that "'" is treated like " ".
        var found_official_loot_table = await does_this_file_exist(official_url);
        if(found_official_loot_table){
            check_existence_of_area_for_button();
            in_raid_button();

            // Loot table:
            let d=document.createElement("div");
            d.id="DotVRLT detailed div";
            d.classList.add("dotvrlt_corners");
            let magics_area=document.getElementsByClassName("raid-effects")[0]||document.createElement("div");
            d.style.top=magics_area.getBoundingClientRect().bottom+6+window.scrollY+"px";
            document.getElementsByClassName("raid-container")[0].appendChild(d);
            detailed_div=d;
            set_detailed_div_state();
            // Table creation.
            let i=document.createElement("img");
            i.id="DotVRLT detailed table";
            i.style.margin="auto"; i.style.cursor="zoom-in";
            i.addEventListener("load",
                               function(){
                let I=document.getElementById("DotVRLT detailed table");
                I.height=Math.min(I.naturalHeight,document.documentElement.style.getPropertyValue("--in-raid-table-max-height").replace("px","")).toString();
                I.width=Math.min(I.naturalWidth,"400").toString(); // --in-raid-table-max-width cannot be used because it has not been set using document.documentElement.style.setProperty
            });
            i.src=official_url;
            let z=0;
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

            // Loot table address:
            var d2=document.createElement("div");
            d2.id="DotVRLT in-raid div";
            d2.classList.add("dotvrlt_corners");
            document.getElementsByClassName("broadcast-damage-container")[0].style.zIndex="1"; // Normal value is 0, but then the above z-index should be set to -1 and this would make the checkboxes unclickable.
            var button_boundaries=document.getElementById("DotVRLT in-raid button").getBoundingClientRect();
            d2.style.left=button_boundaries.x+window.scrollX+"px";
            d2.style.top=button_boundaries.y+button_boundaries.height+5+window.scrollY+"px";
            document.getElementsByClassName("raid-container")[0].appendChild(d2);
            in_raid_div=d2;
            // Creation of the three subdivs.
            var td=document.createElement("div"); td.id="DotVRLT in-raid table div"; d2.appendChild(td);
            var tt=document.createElement("div"); tt.id="DotVRLT in-raid settings div"; tt.classList.add("dotvrlt_in_raid_settings_div"); d2.appendChild(tt);
            var tt2=document.createElement("div"); tt2.id="DotVRLT detailed settings div"; tt2.classList.add("dotvrlt_in_raid_settings_div"); d2.appendChild(tt2);
            // Table creation.
            var t=document.createElement("table");
            t.classList.add("dotvrlt_table");
            t.border=1;
            t.innerHTML=`<td class="dotvrlt_corners_top" style="word-break:break-all">Current loot table: <br><i>`+official_url+`</td>`;
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
    }
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
    create_question_mark(document.getElementById("DotVRLT main title div"));
    var counters={Easy:0, Hard:0, Legendary:0};
    var t=document.createElement("table");
    t.border="1";
    t.classList.add("dotvrlt_table");
    document.getElementById("DotVRLT main table div").appendChild(t);
    t.innerHTML=`<tr class="dotvrlt_fixed_row">
                     <td class="dotvrlt_first_column dotvrlt_sortable_header default_ascending current_ascending">Name</td>
                     <td class="dotvrlt_sortable_header default_ascending current_ascending">Type</td>
                     <td class="dotvrlt_sortable_header default_ascending current_ascending">Size</td>
                     <td class="dotvrlt_sortable_header default_ascending current_ascending">Difficulty</td>
                     <td class="dotvrlt_sortable_header default_ascending current_ascending">Loot tiers</td>
                     <td class="dotvrlt_sortable_header default_descending current_descending">Average stat points</td>
                 </tr>`;
    /* Make various headers clickable for ascending and descending sorting: */
    const headers=t.getElementsByClassName("dotvrlt_fixed_row")[0];
    for(let h of [0,1,2,3,4,5]){
        headers.getElementsByTagName("TD")[h].addEventListener("click",function(){ sortTable(t,h); });
    }
    /* ----- */
    for(let k in raid_list){
        for(let mode in raid_list[k]){
            let D=raid_list[k][mode]["Available difficulties"];
            for(let j of D){
                if(difficulties_to_display[j]==1){
                    if(raid_list[k][mode]["Average stat points"][j]!=[]){
                        var increment_counter=0;
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
                                increment_counter=increment_counter+1;
                            }
                        }
                        counters[j]=counters[j]+(increment_counter>0)*1;
                    }
                }
            }
        }
    }
    update_counters(counters);
    t.getElementsByClassName("dotvrlt_first_column")[t.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    t.getElementsByTagName("tr")[t.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");
}

function create_question_mark(div){
    var text = document.getElementsByClassName("dotvrlt_hover_message")?.[0]
    if(!text){
        text = document.createElement("div");
        text.style.display="none";
        text.classList.add("dotvrlt_hover_message");
        text.innerHTML = `
        <p>"FS" stands for "fair share". This is simply the health of the raid divided by the maximum number of participants. This is only meaningful in the way that, if everyone's damage exceeds this
        threshold, then nobody would need to overhit a full raid.</p>

        <p>"Summoner" and "hidden" columns: they display the level of the related skill (summoner's leftovers and secret keeper) that is needed for the extra loot to have <u>a chance</u> to drop,
        when they exist.</p>

        <p>"Bonus" column: it displays the level(s) of the relevant skill (discerning vision, astute observation, precise inspection) needed for each tier to give extra loot.
        You will also find, at the end of each tier list and for each level of said skill, a line detailing the bonus that this level grants. If you are eligible for several bonuses, then you will
        have to sum these lines up.</p>

        <p>Loot expansion: Visible inside raids only, this cell indicates weither or not a raid is affected by the loot expansion skills.</p>

        <p>On-hit drops: Visible inside raids only, this cell indicates the levels of keen eyes that unlock on-hit drops pools.</p>

        <p>Average stat points: Unless stated otherwise, this columns indicates the average number of stat points per tier.<br>
        Either way, average stat points take, into consideration, the direct drops and, if this is non-negligeable, the craftable stat points.</p>
        `;
        document.body.appendChild(text);
    }
    var q=document.createElement("div");
    q.innerHTML="&ensp;?&ensp;";
    q.classList.add("dotvrlt_question_mark");
    q.addEventListener("mouseenter",function(e){ text.style.display = ""; text.style.left = e.clientX-20-500+"px"; text.style.top = e.clientY+"px"; });
    q.addEventListener("mouseleave",function(e){ text.style.display = "none"; });
    div.appendChild(q);
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
    return a[a.length-1];
}

function sortTable(table,n) { // Taken (and adapted) from https://daext.com/blog/how-to-create-an-html-table-with-sorting-and-filtering/

    // Get the sorting order
    let headers = table.getElementsByClassName("dotvrlt_fixed_row")[0];
    let current_header = headers.getElementsByTagName("TD")[n];
    let ascending = current_header.classList.contains("current_ascending");

    // Get the table rows and remove the header.
    let rows = Array.from(table.rows).slice(1);

    // Generate the sorted rows.
    let sortedRows = rows.sort((a, b) => {
        let c = compareCells(a.cells[n].innerText,b.cells[n].innerText);
        if(c == 0){ c = compareCells(a.cells[0].innerText,b.cells[0].innerText); }
        if(ascending) { return c; }
        else{ return -c; }
    });

    // Update the table data.
    sortedRows.forEach(row => table.tBodies[0].appendChild(row));

    // Change the sorting order of column n for next click, and reset the one of the others
    current_header.classList.toggle("current_ascending");
    current_header.classList.toggle("current_descending");
    let sortable_headers = table.getElementsByClassName("dotvrlt_sortable_header");
    for(let h of sortable_headers){
        if (h != current_header){
            let default_order = h.classList.contains("default_ascending") ? "ascending" : "descending";
            h.classList.add("current_"+default_order);
            h.classList.remove("current_"+["ascending","descending"][(default_order=="ascending")*1]);
        }
    }

    // Remove rounded corners styling to the previous last row and apply it to the new one:
    table.getElementsByClassName("dotvrlt_corners_bottom_left")[0].classList.remove("dotvrlt_corners_bottom_left");
    table.getElementsByClassName("dotvrlt_corners_bottom_right")[0].classList.remove("dotvrlt_corners_bottom_right");
    table.getElementsByClassName("dotvrlt_first_column")[table.getElementsByClassName("dotvrlt_first_column").length-1].classList.add("dotvrlt_corners_bottom_left");
    table.getElementsByTagName("tr")[table.getElementsByTagName("tr").length-1].lastElementChild.classList.add("dotvrlt_corners_bottom_right");

}

function compareCells(A,B){ // Compares numerically and alphabetically two characters strings, and returns -1 if A<B, 0 if A=B and 1 if A>B
    var a = Number(parseFloat(A.replaceAll(",","").replaceAll("FS: ",""))), b = Number(parseFloat(B.replaceAll(",","").replaceAll("FS: ","")));
    if( isNaN(a) || isNaN(b) ){ a = A; b = B; }
    if(a > b){ return 1; } else if(a == b){ return 0; } else{ return -1; }
}

async function does_this_file_exist(url){
    try{
        var r = await makeRequest("GET", url);
        return true;
    }
    catch(e){
        return false;
    }
}

async function check_several_url(U){ // Returns the last element of the array U that is a working URL, or undefined
    var url=undefined;
    for(let u of U){
        var b = await does_this_file_exist(u);
        if(b){ url=u; }
    }
    return url;
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
