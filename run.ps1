param([string] $Folder, [string] $ModelFileName)

# Add the correct name to each model file
. ((Split-Path $MyInvocation.MyCommand.Path) + "\parseNameAndFile.ps1")
$namedModelFolder = "$Folder\models\namedModels"
AddNamesToModels -Folder $Folder -NamedModelFolder $namedModelFolder

# Start Blender in the background
# And run the script that loads all objects and places them at origin
Start-Process -FilePath "C:\Program Files\Blender Foundation\Blender\blender.exe" -ArgumentList "--background --python centerObjectsInBlender.py -- --folder `"$namedModelFolder`" --newModelName `"$ModelFileName`""