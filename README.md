# scene-generator-model-parser

Trond Nilsen created the [Scene Generator](http://ethmoid2.biostr.washington.edu:8080/SIG-SceneGen) - A platform for generating and downloading anatomical scenes. After the scenes are created these scripts can be used to do the following:

    1. Renames scene component model files so they use meaningful names, such as "Declive of vermis of cerebellum", rather than less meaningful names such as 1838.
    2. Batch imports entire scenes into Blender
    3. Removes anatomical offset by centering scenes at their geometrical center
    4. Creates a new .obj file for the scene
    5. Saves the original anatomical offset as a comment in the created .obj scene file
