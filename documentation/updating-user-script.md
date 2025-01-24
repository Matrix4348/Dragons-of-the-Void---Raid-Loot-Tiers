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

  [The .github folder >](github-folder.md)
  
</div>

<hr>

<div align="center">

# Contributing to the user script code

</div>

The "user script" folder contains:
* an "All versions" folder with... all versions of the script and which is automatically updated with each new release
* "latest.user.js", the latest version of the script that should **not** be touched directly and that is exported to Greasyfork
* "development.user.js", the file that you must update to change the script (everything is then automated)
* "greasyfork_extended_description.md", the description on the Greasyfork script page (changes are pushed to Greasyfork when the script is updated)

> [!Important]
> Changelogs on Greasyfork are created based on commits' messages here, so if you make script updates, only (and always) write user script-related changes in the commit messages or the pull request message.

> [!WARNING]
> Be careful with lines starting with expressions such as `/* MARKER X */`: they are changed between development.user.js and latest.user.js and I would prefer that you leave them as is (mostly for readability reasons).

> [!Tip]
> Remember to increment the version number when making a new version...

<hr>

<div align="center">
  
  [< Notes.csv](notes-csv.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [The .github folder >](github-folder.md)
  
</div>
