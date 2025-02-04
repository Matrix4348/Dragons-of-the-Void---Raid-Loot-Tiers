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
> [Changelogs on Greasyfork](https://greasyfork.org/en/scripts/450685-dragons-of-the-void-raid-loot-tiers/versions) are created based on commits' messages here, so if you make script updates, only (and always) write user script-related changes in the commit messages or the pull request message (this includes both the message header/title and the optional commit description/body).
> * Greasyfork reads those commit messages as if they were Markdown files, so you can add some (not all, I believe) Markdown and HTML formatting.
> * For line breaks, you will need to add blank lines or <br> HTML tags between what you want to be different lines (as you would do with any Markdown file on GitHub, anyway).
> * **DO NOT** use quotation marks. This is due to how I coded the export to Greasyfork... and I ~~will~~ ~~may~~ might (?) fix that, someday.
> * If you merge a pull request with changes to the user script, **please choose the "squash and merge" option!** Otherwise, Greasyfork changelogs for that version will be based on the first commit message in the pull request, which may be either incomplete, not formatted, or even completely out of topic. This is due to how I coded the export to Greasyfork.
> 
> Greasyfork does not allow changelogs edition, which make messing up very annoying... You can see by yourself (changelogs are updated from GitHub since version 4.5.2 and were manual prior to it) that I did fail sometimes: no line breaks, wrong or incomplete changelogs (relting in the need to re-upload the same version...).

> [!WARNING]
> Be careful with lines starting with expressions such as `/* MARKER X */`: they are changed between development.user.js and latest.user.js and I would prefer that you leave them as is (mostly for readability reasons).

> [!Tip]
> Remember to increment the version number when making a new version...

<hr>

<div align="center">
  
  [< Notes.csv](notes-csv.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [The .github folder >](github-folder.md)
  
</div>
