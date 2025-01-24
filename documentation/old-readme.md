Version of 2024, before it gets divided into multiple files. Keeping it just in case.

# Dragons of the Void - Raid Loot Tiers

This repository was created to develop my [Dragons of the Void - Raid Loot Tiers](https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers) user script, that I wrote for players of the game *Dragons of the Void*. To install the script, go to Greasyfork.

## How to contribute?

First, if you do not have write access, then to modify files you will need to create a fork (click the "Fork" button at the top of the page), edit the files and create a pull request. Once approved, the pull request will be merged and your changes will be applied.<br>
If you have write access, you can either create a branch, then a pull request or update the files directly.<br>

## I) Contributing to the community-gathered data
All the relevant files are in the csv format and located in the "community-gathered data" folder (more details about each of them down below):
* "Basic data" folder
* "Base damage taken" folder
* "Loot tiers and drop data" folder
* "On-hit drops" folder

It is absolutely not necessary to update everything at once. Usually, the loot tiers will come a lot later than the rest. Once the files have been modified, raid_list.json will automatically be updated and be made available to the users of my script within a minute or two.

### 1) What are csv files?

"csv" stands for "comma-separated values". A csv file is just lines of characters (anything) separated by commas and can be read as a table. GitHub may display then as tables in preview mode, so look at the "code" tab instead if you need the syntax of the file.<br>
If the content of a cell contains a comma, then put the whole cell between quotes but, otherwise, quotes are not needed. Please, write numbers with comma separators (1,000,000 instead of 1000000 or 1 000 000).<br>
For an empty cell, simply do not put anything between the commas.<br>
To end a line, just go to a new line (no character is needed to end a row).

<u>Example:</u>

* csv:
```
Column 1,Column 2,Column 3,Column 4
A,12,"I love cats, dogs and birds",
"B","1,300,752",,1/2
```
* Result:

|Column 1|Column 2|Column 3|Column 4|
|-|-|-|-|
|A|12|I love cats, dogs and birds||
|B|1,300,752||1/2|

### 2) "Basic data" folder

These files contain basic information about raids. It is important to know that only raids added here will appear in the script.<br>
As a general rule, leave an empty cell or a question mark if you do not know what to put (use the option that seems the most relevant; read the rest of the file if needed).<br>

About a few columns:
* Raid name: Type the exact same name that is displayed in the game
* Health on X: it is the health of the raid on X difficulty (obviously...)
* "On-hit drops?", "Loot expansion?"...: "Yes", "No" or "?"

### 3) "Base damage taken" folder

These files contain damage type and damage values for each raid on each difficulty. <br>
If a raid does not exist on all difficulties while there is a column for another difficulty, then leave the cells for the missing difficulties empty.

### 4) "Loot tiers and drop data" folder

This folder contains subfolders named after various categories of raids, each one containing folders named after raids.<br>

There are two cases that you will encounter:<br>

* If a raid has an image loot table, then you will find the images (.png, .jpg, .jpeg, .webp but I prefer .png) alongside the file "Loot table.csv", which contains two columns: "file name" and "date of first use". The second column is obvious (usual format: "January 31st, 2024") and in the first column, type the name of the image that was uploaded to the folder (only upload **new** loot tables). Preferred format for the loot table name: Raid_Name_Number with numbers starting at 1 (0 for beta only).
<br>For example: if the John Rabbit world raid is released on April 1st, 2025, then upload John_Rabbit_1.png in community-gathered data/Loot tiers and drop data/World raids/John Rabbit/ and fill new line in community-gathered data/Loot tiers and drop data/World raids/John Rabbit/Loot tables.csv the following way: 
```
File Name,Date of first use
John_Rabbit_1.png,"April 1st, 2025"
```

* Else, you will find files named after each difficulty the raid is available in: Easy.csv, Hard.csv, Legendary.csv.<br>
You should input a question mark in drop rarity cells (common, rare...) if you ignore the answer.<br>
In the extra drops ones (remove these columns if not needed), input the skill level(s) like studious inspector does (for example, "DV3, DV7") if known, 0 or leave empty if nothing drops, and input a question mark if you do not know. If you do not know which tiers benefit from the skills, you can add the skills to the maximum tier only.<br>
If a raid is affected by a bonus tiers skill (discerning vision, astute observation, precise inspection), then add a line at the end with skill reference in the "damage" column (for example, "DV1") and in the following columns, add 0 if no bonus or +y if the skill adds y more drops from that column.<br>
No need to bother with these files if you do not know any tier.<br>
**Quest bosses and minibosses are special**: generally they follow the patterns found in the associated `_Example_` folders so only create files for the exceptions.

**If the folder does not exist**, then:
* you will find templates for each file in the `_Example_` folder; some columns being optionnal
* to create a folder on GitHub, you must create a file by adding both names in the file name: if you want to create new_folder containing new_file in existing_folder, then when you name your file type "new_folder/new_file" instead of just "new_file"

### 5) "On-hit drops" folder

These files contain keen eye levels required for each raid on each difficulty. Input them like studious inspector does ("KE3, KE7", for example) if something drops, leave empty or add 0 if nothing drops. Only add raids that have at least one on-hit drop in one difficulty.<br>
If a raid does not exist on all difficulties while there is a column for another difficulty, then leave the cells for the missing difficulties empty.

### 6) Notes.csv

Notes.csv contains messages to display above loot tables and giving additional information, for example if there is a guaranteed drop.
* In the first column, input a condition in Python that raids must verify for a message to appear.
You can use the following variable names (everything is case sensitive and none is mandatory): name (name of the raid), type (what is being displayed as raid type by the user script, like '' for regular raids, 'Guild raid', 'World raid'...), size ('Large'...), loot_format ('Image' if the loot table is available as an image, like world raids, else 'EHL'), difficulty and mode ("questing" for quests, "healthless" for raids without a health bar and "raiding" for the rest).
* In the second column, type the text to display. Add the name of the raid (or, in case of a group of raids, the name of said "group"), because the notes are also displayed on the full list of raids so people must know what they refer to.

Example: ```type == 'Guild raid' and difficulty == 'Hard',Hard guild raids always drop an additional void token.```
This note applies to guild raids on hard difficulty. The words "and" and "or" can be used, alongside parenthesis, for conditions involving several criteria.
Also, note that in csv files, GitHub does not like double quotation marks for anything other than surrounding a whole cell. Hence why I used single ones for the two character strings ('Guild raid' and 'Hard').

## II) Contributing to the user script code

The "user script" folder contains:
* an "All versions" folder with... all versions of the script and which is automatically updated with each new release
* "latest.user.js", the latest version of the script that should **not** be touched directly and that is exported to Greasyfork
* "development.user.js", the file that you must update to change the script (everything is then automated)
* "greasyfork_extended_description.md", the description on the Greasyfork script page (any modification here is instantly sent there)

**Important:**
* Changelogs on Greasyfork are created based on commits' messages here, so if you make script updates, only (and always) write user script-related changes in the commit messages or the pull request message.
* Be careful with lines starting with expressions such as `/* MARKER X */`: they are changed between development.user.js and latest.user.js and I would prefer that you leave them as is (mostly for readability reasons)
* Remember to increment the version number when making a new version...
