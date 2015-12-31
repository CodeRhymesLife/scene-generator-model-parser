import sys
import argparse
parser = argparse.ArgumentParser(description='Process arguments')
parser.add_argument("--folder")
parser.add_argument("--newModelName")

# parse all args after "--"
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])

import os

# Define constants
organ_name = args.newModelName
folder = args.folder
new_model_files_dir = os.path.join(folder, "_complete")
metadata_filename = os.path.join(new_model_files_dir, "organ_metadata.json")
organ_model_filename = os.path.join(new_model_files_dir, organ_name + ".obj")

print(organ_name)
print(folder)
print(new_model_files_dir)
print(metadata_filename)
print(organ_model_filename)

if not os.path.exists(new_model_files_dir):
    os.makedirs(new_model_files_dir)

def location_to_json (location):
    return {
        "x": location.x,
        "y": location.y,
        "z": location.z,
    }

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

    # Give the object it's name
    imported_objects = [obj for obj in bpy.context.selected_objects[:]]
    for imported_obj in imported_objects:
        imported_obj.name = item[:-4]
        imported_obj.data.name = imported_obj.name + "_MESH"

# Select all objects then center the entire model

# gather list of items of interest and select only them
organ_parts = [item.name for item in bpy.data.objects if item.type == "MESH"]
for object_name in organ_parts:
	bpy.data.objects[object_name].select = True

# Get the 3D view context so we can begin moving things around
context = None
for area in bpy.context.screen.areas:
	if area.type == 'VIEW_3D':
		context = bpy.context.copy()
		context['area'] = area
		break;

# Store metadata about this organ
organ_metadata = {};

# Move the origin to the center of the object
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')

# Move the 3D cursor to the center of the geometry and record it's position
# This is the organ's relative position in the body
bpy.ops.view3d.snap_cursor_to_selected(context)
organ_metadata["bodyOffset"] = location_to_json(bpy.context.scene.cursor_location)

# Center the whole model by:
#	1) Snap the 3D cursor to the center
#	2) Snap the selected objects to the cursor
bpy.ops.view3d.snap_cursor_to_center(context)
bpy.ops.view3d.snap_selected_to_cursor(context, use_offset=True)

# Save whole model
bpy.ops.export_scene.obj(filepath=organ_model_filename, use_selection=True)

# Save the offset of individual parts
organ_part_offsets = organ_metadata["parts"] = {};

# Loop over each part
#   1) Save it's offset within the organ
#   2) Deselect it
for object_name in organ_parts:
    organ_part = bpy.data.objects[object_name]
    organ_part_offsets[object_name] = location_to_json(organ_part.location)
    organ_part.select = False

# Save the object with it's origin at the center
for object_name in organ_parts:
    organ_part = bpy.data.objects[object_name]
    organ_part.select = True
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
    bpy.ops.view3d.snap_cursor_to_center(context)
    bpy.ops.view3d.snap_selected_to_cursor(context, use_offset=False)
    organ_part_filename = os.path.join(new_model_files_dir, object_name + ".obj")
    bpy.ops.export_scene.obj(filepath=organ_part_filename, use_selection=True)
    organ_part.select = False

# Save the organ metadata to a json file
import json
with open(metadata_filename, 'w') as outfile:
    json.dump(organ_metadata, outfile)