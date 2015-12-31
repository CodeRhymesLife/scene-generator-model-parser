Param(
  [switch]$Rename,
  [switch]$ShowCommands,
  [switch]$ShowBlender,
  [String]$SceneFolder,
  [String]$OrganName
)

if($ShowCommands) {
    Set-PSDebug -Trace 1
}

Function Select-Folder($Description) {

    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null     

    [System.Windows.Forms.FolderBrowserDialog] $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = $Description

    if ($dialog.ShowDialog() -eq "OK") {
        return $dialog.SelectedPath
    }
    else {
        Write-Error "Operation cancelled by user."
        return $null
    }
}

# Get the scene folder
if([string]::IsNullOrEmpty($SceneFolder)) {
	$SceneFolder = Select-Folder -Description "Select unzipped model folder";
	if([string]::IsNullOrEmpty($SceneFolder)) {
		Write-Error "Please select a valid scene folder"
		exit
	}
}

# Get the organ's name
if([string]::IsNullOrEmpty($OrganName)) {
    $OrganName = Read-Host "What does this scene model? (e.g. Brain, Heart, ect)"
	if([string]::IsNullOrEmpty($OrganName)) {
		Write-Error "Please enter a valid organ name"
		exit
	}
}


$modelsFolder = "$SceneFolder\models"
if($Rename) {
    # Add the correct name to each model file
    . ((Split-Path $MyInvocation.MyCommand.Path) + "\parseNameAndFile.ps1")
    $modelsFolder = "$SceneFolder\models\namedModels"
    AddNamesToModels -Folder $SceneFolder -NamedModelFolder $modelsFolder
}

# Ensure the blender path is set properly
if(!$Env:BlenderLocation -or !(Test-Path $Env:BlenderLocation)) {
    Write-Warning "This script requires Blender. Please show me where it lives"

    $blenderFolder = Select-Folder -Description "Please select folder containing blender.exe (e.g. ...\Blender Foundation\Blender\)";

    if([string]::IsNullOrEmpty($blenderFolder)) {
        Write-Error "Please select a valid folder"
        exit
    }

    if(!(Test-Path $blenderFolder)) {
        Write-Error "Blender folder invalid"
        exit
    }

    $Env:BlenderLocation = $blenderFolder
}

# Start Blender in the background
# And run the script that loads all objects and places them at origin
$backgroundFlag = "";
if(!$ShowBlender) {
    $backgroundFlag = "--background"
}
Start-Process -FilePath "$Env:BlenderLocation\blender.exe" -ArgumentList "$backgroundFlag --python centerObjectsInBlender.py -- --folder `"$modelsFolder`" --newModelName `"$OrganName`""

Start $modelsFolder

if($ShowCommands) {
    Set-PSDebug -Trace 0
}