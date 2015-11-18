param([string] $Folder)

# Include functions to execute javascript
. ((Split-Path $MyInvocation.MyCommand.Path) + "\execJavaScript.ps1")

# The scene's index.html file creates a javascript object that holds information about the name of each file
# We need to open the index.html file and get the information we need from that javascript object
# This function opens the html file and runs a snippet of javascript that extracts the information we need
$json = OpenUrlAndRunScript -Url "$Folder/index.html" -Script @'
    var nameAndFile = [];
    sceneObjectDescriptors.forEach(function (obj) {
        nameAndFile.push({ name: obj.name, file: obj.filename })
    });
    return JSON.stringify(nameAndFile);
'@

# Parse the json
$nameAndFile = "$json" | ConvertFrom-Json

# Create a new folder for our model files
$namedModelsFolder = "namedModels"
New-Item $Folder/$namedModelsFolder -ItemType directory -Force

$nameAndFile | ForEach {
    $sourcePath = "$Folder/" + $_.file
    $targetPath = "$Folder/$namedModelsFolder/" + $_.name + ".obj"
    Copy-Item $sourcePath $targetPath
}