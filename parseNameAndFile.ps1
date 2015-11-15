param([string] $Folder)

# Parse the json
$nameAndFile = Get-Content -Raw -Path $Folder/nameAndFile.json | ConvertFrom-Json
# ConvertTo-Json $nameAndFile | Write-Output

# Create a new folder for our model files
$namedModelsFolder = "namedModels"
New-Item $Folder/$namedModelsFolder -ItemType directory -Force

$nameAndFile | ForEach {
    $sourcePath = "$Folder/" + $_.file
    $targetPath = "$Folder/$namedModelsFolder/" + $_.name + ".obj"
    Copy-Item $sourcePath $targetPath
}