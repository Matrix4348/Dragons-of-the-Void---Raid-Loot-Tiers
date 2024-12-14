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

# Notes.csv

</div>

Notes.csv contains messages to display above loot tables and giving additional information, for example if there is a guaranteed drop.

In the first column, input a condition in Python that raids must verify for a message to appear.<br>
You can use the following variable names (everything is case sensitive and nothing is mandatory): name (name of the raid), type (what is being displayed as raid type by the user script, like '' (an empty character string) for regular raids, 'Guild raid', 'World raid'...), size ('Large'...), loot_format ('Image' if the loot table is available as an image, like world raids, else 'EHL'), difficulty and mode ("questing" for quests, "healthless" for raids without a health bar and "raiding" for the rest).

[To elaborate] Mode is important when a uest boss exists


In the second column, type the text to display. Add the name of the raid (or, in case of a group of raids, the name of said "group"), because the notes are also displayed on the full list of raids so people must know what they refer to.

> [!Note]
> The words "and" and "or" can be used, alongside parenthesis, for conditions involving several criteria.

> [!Warning]
> In csv files, GitHub does not like double quotation marks for anything other than surrounding a whole cell. You will therefore have to use single ones for character strings in the conditions of the first column.

Example: ```type == 'Guild raid' and difficulty == 'Hard',Hard guild raids always drop an additional void token.```<br>
This note applies to guild raids on hard difficulty.

<hr>

<div align="center">
  
  [< On-hit drops](on-hit-drops-folder.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [Updating the user script >](updating-user-script.md)
  
</div>