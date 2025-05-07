<div align="left">
  
  [<< Contributing](/CONTRIBUTING.md)
  
</div>

<div align="right">
  
  [Table of content >>](table-of-content.md)
  
</div>

<div align="left">
  
  [< Community-gathered data](community-gathered-data.md)
  
</div>

<div align="right">

  [Updating the user script >](updating-user-script.md)
  
</div>

<hr>

<div align="center">

# Loot tiers and drop data

</div>

This folder contains subfolders named after various categories of raids, each one containing folders named after raids.<br>

> [!Note]
> If the folder does not exist for a given raid, then you will find templates for each file in the `_Example_` subfolder of the associated raid type folder; some columns being optional.

> [!Tip]
> To create a folder on GitHub, you must create a file by adding both names in the file name. For example, if you want to create new_folder containing new_file in existing_folder, then when you name your file, type "new_folder/new_file" instead of just "new_file".

There are two cases that you will encounter: raids whose tiers players must figure out and raids with loot tables available as images.

## Image loot tables

If a raid has an image loot table, then you will find two types of files:
* the loot tables (any format among png, jpg, jpeg and webp - maybe even gif - would do, but I prefer png)
* a file named "Loot table.csv"

For convenience reasons and in order to navigate easily between them (especially if they get updated over time), loot tables should be named as such: Raid_Name_Number, with "Number" starting at 1 and incrementing by one every time the loot table gets modified ("0" is reserved for beta).<br>

`Loot table.csv` contains two mandatory columns: "file name" and "date of first use". The second column is obvious (usual format: "January 31st, 2024") and in the first column, type the name of the image that was uploaded to the folder (case sensitive, and do not forget the file extension).<br>

#### <ins>For example:</ins> 
If the John Rabbit world raid was released on April 1st, 2024 and if it was summoned again on April 1st, 2025 with a new loot table, then we would have John_Rabbit_1.png and John_Rabbit_2.png in `community-gathered data/Loot tiers and drop data/World raids/John Rabbit/`, alongside `community-gathered data/Loot tiers and drop data/World raids/John Rabbit/Loot tables.csv`, which would look the following way: 
```
File Name,Date of first use
John_Rabbit_1.png,"April 1st, 2024"
John_Rabbit_2.png,"April 1st, 2025"
```

A third column, "Hidden loot" can be added if the raid has hidden loot. If so, add the related loot skill levels and the first affected tiers the following way: ```"SK1[tier 1], SK2[tier 2]"```, or just ```"SK1, SK2"``` if you ignore the tiers. If some raid versions do not have hidden loot, then input a "-" for them.

## Raid tiers we have to determine

For raids without given loot tables, you will find, in `community-gathered data/Loot tiers and drop data/Raid Type/Raid Name/`, files named after each difficulty the raid is available in: Easy.csv, Hard.csv, Legendary.csv.<br>

You should input a question mark in drop rarity cells if you ignore the answer.<br>

Only the "damage", "common", "rare" and "mythic" columns are always mandatory. Others must only be present when they are relevant.<br>

In the extra drops ones, input:
* the skill level(s) shortened like studious inspector does (for example, "DV3, DV7") if known
* 0 or leave empty if nothing drops
* input a question mark if you do not know

> [!Tip]
> If you do not know which tiers are affected by the skills, you can add the skills to the highest tier only.

<br>
  
If a raid is affected by a bonus tiers skill (discerning vision, astute observation, precise inspection), then add a line at the end with:
* in both the "Damage" and "Bonus" columns: skill reference (for example, "DV1")
* in the "Common", "Rare" and "Mythic" columns: add +y where y is how many drops the skill adds for that rarity
* in the "Hidden" and "summoner" columns (when present): add -, assuming that those loots will never be affected
  
Here is what such line would look like; `DV1,+0,+0,+y,DV1`.<br>

The "average stat points" columns contains the average number of stat points that each tier gives. That one should definitely only be added when it can be filled.

<hr>

<div align="center">
  
  [< Base damage taken](base-damage-taken-folder.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [On-hit drops >](on-hit-drops-folder.md)
  
</div>
