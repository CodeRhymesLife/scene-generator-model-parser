
/**************************************************************************
    Class - Mesh Loader

    Reusable OBJ loader class.

    Notifies manager on
    - load completion
    - load progress updated
*/
var CGA_MeshLoader = function(id, manager)
{
    THREE.OBJLoader.call(this);

    this.active = false;
    this.descriptor = null;
    this.id = id;
    this.manager = manager;

    this.addEventListener('load', this.onLoad);
    this.addEventListener('error', this.onError);
    this.addEventListener( 'progress', this.onProgress);
};
CGA_MeshLoader.prototype = Object.create(THREE.OBJLoader.prototype);




CGA_MeshLoader.prototype.loadSceneObject = function (descriptor)
{
    this.active = true;

    this.descriptor = descriptor;
    this.descriptor.loadStatus = CGA_MeshManager.MESH_LOADING;

    this.load(this.descriptor.filename);
};




CGA_MeshLoader.prototype.onError = function (e)
{
    console.log("Error occurred: " + e.message);
};




CGA_MeshLoader.prototype.onLoad = function (e)
{
    console.log("Loader " + this.id + " - finished " + this.descriptor.name);

    // Update state
    this.descriptor.loadStatus = CGA_MeshManager.MESH_LOADED;
    this.active = false;

    // Notify manager of completed load
    this.manager.meshLoaded(this.id, this.descriptor, e.content);
};




CGA_MeshLoader.prototype.onProgress = function (e)
{
    this.manager.meshProgress(this.id, e.loaded, e.total);
};
