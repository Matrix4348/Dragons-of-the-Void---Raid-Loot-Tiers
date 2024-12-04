<header>
  
  [<< Contributing](../CONTRIBUTING.md)<br>
  
[< Updating a file](updating-a-file.md)

<div align="right">
  
  [The community-gathered data folder >](community-gathered-data.md)
  
</div>

<div align="center">
  
  [< Updating a file](updating-a-file.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [The community-gathered data folder >](community-gathered-data.md)
  
</div>
</header>
<hr>

<div align="center">
  
|[<< Contributing](../CONTRIBUTING.md)|||
|-|-------------------------------------|-|
|[< Updating a file](updating-a-file.md)|          ---        |<div align="right">[The community-gathered data folder >](community-gathered-data.md)</div>|

</div>

<!--Note to self: `divs` break Markdown if there are not enough blank lines...-->

# What is a csv file?

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
