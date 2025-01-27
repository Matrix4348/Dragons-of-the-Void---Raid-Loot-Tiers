<div align="left">
  
  [<< Contributing](/CONTRIBUTING.md)
  
</div>

<div align="right">
  
  [Table of content >>](table-of-content.md)
  
</div>

<div align="left">
  
  [< Updating the user script](updating-user-script.md)
  
</div>

<hr>

<div align="center">

# The .github folder

</div>

The .github folder has everything (file-wise) that manages the repository, especially its automation.

## GitHub actions

GitHub actions are lines of code that run on specific events, like when a file is modified. You will find them in `.github/workflows`. Learn more about workflows [here](https://docs.github.com/en/actions/writing-workflows/about-workflows).  
They often run scripts, which you will find in `.github/scripts`. I write mines in Python but they can be written in many programming languages.

If you are new to GitHub actions but need to update or create one, you should carefully read the GitHub documentation about them.   


## `.gitignore`

`.gitignore` is a list of paths that should be ignored by the automation processes.

Right now, only csv files and images in `community-gathered data` could relevantly be added to `.gitignore`. If for some reason you want to prevent such files to be added to `raid-list.json`, then feel free to tell GitHub to ignore them.

<hr>

<div align="center">
  
  [< Updating the user script](updating-user-script.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [Table of content >](table-of-content.md)
  
</div>
