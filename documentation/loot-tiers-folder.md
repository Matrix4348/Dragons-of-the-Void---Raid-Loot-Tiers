# "Loot tiers and drop data" folder

This folder contains subfolders named after various categories of raids, each one containing folders named after raids.<br>

There are two cases that you will encounter: raids whose tiers players must figure out and raids with loot tables available as images.

# Image loot tables

If a raid has an image loot table, then you will find two types of files:
* the loot tables (any format among png, jpg, jpeg and webp - maybe even gif - would do, but I prefer png)
* a file named "Loot table.csv"

<!-- continue here with image name format and csv description -->
the images (.png, .jpg, .jpeg, .webp but I prefer .png) alongside the file "Loot table.csv", which contains two columns: "file name" and "date of first use". The second column is obvious (usual format: "January 31st, 2024") and in the first column, type the name of the image that was uploaded to the folder (only upload **new** loot tables). Preferred format for the loot table name: Raid_Name_Number with numbers starting at 1 (0 for beta only).
<br>For example: if the John Rabbit world raid is released on April 1st, 2025, then upload John_Rabbit_1.png to `community-gathered data/Loot tiers and drop data/World raids/John Rabbit/` and fill a new line in `community-gathered data/Loot tiers and drop data/World raids/John Rabbit/Loot tables.csv` the following way: 
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
