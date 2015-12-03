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

def get_object_global_location(obj):
	v = obj.data.vertices[0].co
	mat = obj.matrix_world

	# Multiply matrix by vertex
	loc = mat * v
	print(loc)
	return loc

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

# Select all objects then center the entire model

# gather list of items of interest and select only them
candidate_list = [item.name for item in bpy.data.objects if item.type == "MESH"]
for object_name in candidate_list:
	bpy.data.objects[object_name].select = True

# Use the last object in the list to calculate the models relative position in the body
objectUsedToCalculateRelativeModelPosition = bpy.data.objects[candidate_list[-1]]
objectUsedToCalculateRelativeModelPosition_oldLocation = get_object_global_location(objectUsedToCalculateRelativeModelPosition)

# Move the origin to the center of the object
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')

# Center the whole model by:
#	1) Snap the cursor to the center
#	2) Snap the selected objects to the cursor
for area in bpy.context.screen.areas:
	if area.type == 'VIEW_3D':
		override = bpy.context.copy()
		override['area'] = area
		bpy.ops.view3d.snap_cursor_to_center(override)
		bpy.ops.view3d.snap_selected_to_cursor(override, use_offset=True)
		break

# Now that the model have moved calculate its old origin by measuring the displacement of the measuring object
objectUsedToCalculateRelativeModelPosition_newLocation = get_object_global_location(objectUsedToCalculateRelativeModelPosition)
relativeModelPosition = objectUsedToCalculateRelativeModelPosition_oldLocation - objectUsedToCalculateRelativeModelPosition_newLocation

completeModelFileName = completeModelPath + "\\" + completeObjName + ".obj"
bpy.ops.export_scene.obj(filepath=completeModelFileName, use_selection=True)

# Add the original position to the .obj file as a comment
file = open(completeModelFileName,'r')
data = file.read()
file.close()

file = open(completeModelFileName, 'w')
positionStr = ', '.join(str(val) for val in relativeModelPosition)
file.write("# relative position: [" + positionStr + "]\n" + data)

file.write(data)
file.close()