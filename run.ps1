Param(
  [switch]$Rename,
  [switch]$ShowCommands
)

if($ShowCommands) {
    Set-PSDebug -Trace 1
}

Function Select-SceneFolder() {

    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null     

    [System.Windows.Forms.FolderBrowserDialog] $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = "Select unziped model folder"

    if ($dialog.ShowDialog() -eq "OK") {
        return $dialog.SelectedPath
    }
    else {
        Write-Error "Operation cancelled by user."
        return $null
    }
}

# Get the scene folder
$sceneFolder = Select-SceneFolder;
if([string]::IsNullOrEmpty($sceneFolder)) {
    Write-Error "Please select a valid scene folder"
    exit
}

$modelName = Read-Host "What does this scene model? (e.g. Brain, Heart, ect)"

$modelsFolder = "$sceneFolder\models"
if($Rename) {
    # Add the correct name to each model file
    . ((Split-Path $MyInvocation.MyCommand.Path) + "\parseNameAndFile.ps1")
    $modelsFolder = "$sceneFolder\models\namedModels"
    AddNamesToModels -Folder $sceneFolder -NamedModelFolder $modelsFolder
}

# Start Blender in the background
# And run the script that loads all objects and places them at origin
Start-Process -FilePath "C:\Program Files\Blender Foundation\Blender\blender.exe" -ArgumentList "--background --python centerObjectsInBlender.py -- --folder `"$modelsFolder`" --newModelName `"$modelName`""

Start $modelsFolder

if($ShowCommands) {
    Set-PSDebug -Trace 0
}