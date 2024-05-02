# Dragons of the Void - Raid Loot Tiers

This repository is for gathering the data displayed by my [Dragons of the Void - Raid Loot Tiers](https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers) user script, that I wrote for players of the game *Dragons of the Void*. To install the script itself, go to Greasyfork (even though I will probably update it using GitHub, at some point).

## How to contribute?

First, if you do not have write access, then to modify files you will need to create a branch (click the "main" button above, then "find or create a branch), edit the files and create a pull request. Once approved, the pull request will be merged and your changes will be applied.
All the relevant files are in the csv format and located in the "community-gathered data" folder (more details about each of them down below):
* Basic raid data.csv
* Base damage taken.csv
* "Loot tiers and drop data" folder

Once the files have been modified, raid_list.json will automatically and immediately be updated and exported to Filestack, the site from which the script will fetch it.

## What are csv files?

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

##  Basic raid data.csv

This file contains basic information about raids. It is important to know that only raids added here will appear in the script.
As a general rule, leave an empty cell or a question mark if you do not know what to put (use the option that seems the most relevant; read the rest of the file if needed).
About a few columns:
* Raid type: for regular raids, use an empty cell
* Health on easy: it is the health of the raid on easy difficulty (obviously...); put 0 for raids without health
* Loot format: "EHL" for raids with raids to be found, and "Image" for raids with a pre-existing loot table (like world raids)
* Has summoner loot? and Has hidden loot?: "Yes", "No" or "?"

## Base damage taken.csv

This file contains damage type and damage values for each raid on each difficulty. <br>
If a raid does not exist on every difficulties, then leave the cells for the missing difficulties empty.

## "Loot tiers and drop data" folder

This folder contains folder named after raids.<br>
If a raid has an image loot table, then you will find the file "Loot table.csv" with the URL and dates of first use of each image (the loot table could be updated over time, hence why there could be several rows).<br>
Else, you will find files named after each difficulty the raid is available in: Easy.csv, Hard.csv, Legendary.csv. Nothing more to explain about the columns, besides maybe that you should input a question mark in drop rarity cells (common, rare...) if you ignore the answer. Do not bother with these files if you do not know any tier.

**If the folder does not exist**, then:
* you will find templates for each file in ./community-gathered data/Loot tiers and drop data/Example/
* to create a folder on GitHub, you must create a file by adding both names in the file name: if you want to create new_folder containing new_file in existing_folder, then when you name your file type "new_folder/new_file" instead of just "new_file"
