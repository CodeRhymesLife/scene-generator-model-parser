import sys
import argparse
parser = argparse.ArgumentParser(description='Process arguments')
parser.add_argument("--folder")
parser.add_argument("--newModelName")

# parse all args after "--"
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])


folder = args.folder
completeObjName = args.newModelName
print(folder)
print(completeObjName)

import os
completeModelPath = folder + "\_complete"
if not os.path.exists(completeModelPath):
    os.makedirs(completeModelPath)

import bpy		

# Remove all objects from the scene
# NOTE:
#	An exception is thrown if no objets exist
#	In that case just ignore the exception
try:
	bpy.ops.object.mode_set(mode='OBJECT')
	bpy.ops.object.select_by_type(type='MESH')
	bpy.ops.object.delete(use_global=False)
	for item in bpy.data.meshes:
		bpy.data.meshes.remove(item)
except:
	pass

# get list of all files in directory
file_list = os.listdir(folder)

# reduce the list to files ending in 'obj'
# using 'list comprehensions'
obj_list = [item for item in file_list if item[-3:] == 'obj']

# loop through the strings in obj_list.
for item in obj_list:
    full_path_to_file = os.path.join(folder, item)
    bpy.ops.import_scene.obj(filepath=full_path_to_file)

completeModelFileName = completeModelPath + "\\" + completeObjName + ".obj"
bpy.ops.export_scene.obj(filepath=completeModelFileName)