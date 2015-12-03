/**************************************************************************
    Class - CGA_MeshManager

    Handles a collection of Scene Object Loaders to provide parallel loading of scene object mesh files

    Events generated:
    - loadFinished - all models have been loaded
      * no attributes
    - objectLoadFinished - a single model file has been loaded
      * loaderId: ID of loader (range 0 to loaderCount - 1)
      * descriptor: descriptor of scene object just loaded
      * mesh: mesh data just loaded
      * loaded: # of scene objects loaded
      * total: # of scene objects to load
    - objectLoadStarted
      * loaderId: ID of loader (range 0 to loaderCount - 1)
      * descriptor: descriptor of scene object just started
    - objectLoadProgress
      * loaderId: ID of loader (range 0 to loaderCount - 1)
      * loaded: # bytes loaded
      * total: # bytes to load


    Configurable variables:
      * CGA_MeshManager.LOADER_COUNT - the number of simultaneous load engines to employ

**************************************************************************/


// Note that the mesh manager is configured on instantiation, and cannot be reused. This is by design.
// Applications should create a new CGA_MeshManager each time Scene Contents need to be loaded
var CGA_MeshManager = function()
{
    THREE.EventDispatcher.call( this );

    // Initialize
    this.active = false;

    // Initialize loaders
    this.loaders = new Array(CGA_MeshManager.LOADER_COUNT);
    for (var i = 0 ; i < this.loaders.length ; i++)
        this.loaders[i] = new CGA_MeshLoader(i, this);

    // Initialize storage
    this.requests = [];
    this.loadListeners = [];
    this.meshes = {};
};
CGA_MeshManager.prototype = Object.create(THREE.EventDispatcher.prototype);
CGA_MeshManager.MESH_NOT_YET_LOADED = 1;
CGA_MeshManager.MESH_LOADING = 2;
CGA_MeshManager.MESH_LOADED = 3;
CGA_MeshManager.LOADER_COUNT = 4;



// Add a listener for load events
CGA_MeshManager.prototype.addLoadListener = function (listener)
{
    this.loadListeners.push(listener);
};




CGA_MeshManager.prototype.getMesh = function (filename)
{
    if (! this.meshes[filename])
        throw "Failed attempt to retrieve mesh for file named " + filename;

    return this.meshes[filename];
};




// Count the number of meshes with MESH_LOADED status
CGA_MeshManager.prototype.getNumberMeshesLoaded = function()
{
    var count = 0;

    for (var key in this.requests)
    {
        if (this.requests[key].loadStatus == CGA_MeshManager.MESH_LOADED)
            count ++;
    }

    return count;
};




CGA_MeshManager.prototype.loadFromDescriptors = function(descriptors, callback)
{
    // ROUTE - Fail if already active
    if (this.active)
        throw "Cannot commence load - mesh manager already working";

    // ROUTE - Trivial exit if no descriptors passed
    else if (descriptors.length == 0)
    {
        if (callback)
            callback();
    }

    // ROUTE - Normal circumstance
    else
    {
        // Create requests
        this.requests = {};
        this.requestCount = 0;
        for (var i = 0 ; i < descriptors.length ; i ++)
        {
            if (!this.requests[descriptors[i].filename] && ! this.meshes[descriptors[i].filename])
            {
                this.requests[descriptors[i].filename] = {
                    filename: descriptors[i].filename,
                    name: descriptors[i].name,
                    loadStatus: CGA_MeshManager.MESH_NOT_YET_LOADED,
                };

                this.requestCount ++;
            }
        }

        // Save callback
        this.callback = callback;

        // Notify load listeners
        for (var i = 0 ; i < this.loadListeners.length ; i ++)
            if (this.loadListeners[i].loadStarted)
                this.loadListeners[i].loadStarted(this.loaders.length, this.requestCount);

        this.startOrContinueLoading();
    }
};




CGA_MeshManager.prototype.meshLoaded = function (loaderId, descriptor, mesh)
{
    for (var i = 0 ; i < this.loadListeners.length ; i ++)
        if (this.loadListeners[i].objectLoadFinished)
            this.loadListeners[i].objectLoadFinished(loaderId, descriptor);

    this.meshes[descriptor.filename] = mesh;

    this.startOrContinueLoading();
};




CGA_MeshManager.prototype.meshProgress = function (loaderId, loaded, total)
{
    for (var i = 0 ; i < this.loadListeners.length ; i ++)
        if (this.loadListeners[i].objectLoadProgress)
            this.loadListeners[i].objectLoadProgress(loaderId, loaded, total);
};




// Remove a listener for load events
CGA_MeshManager.prototype.removeLoadListener = function (listener)
{
    var index = this.loadListeners.indexOf(listener);
	if (index != -1)
		this.loadListeners.splice(listener, 1);
};




CGA_MeshManager.prototype.startOrContinueLoading = function ()
{
    // Flag that scene content loader is running
    this.active = true;

    // Find the next inactive loader, and start it loading the next file not yet loaded
    for (var i = 0 ; i < this.loaders.length ; i++)
    {
        if (!this.loaders[i].active)
        {
            for (var key in this.requests)
            {
                if (this.requests[key].loadStatus == CGA_MeshManager.MESH_NOT_YET_LOADED)
                {
                    console.log("Loader " + i + " - loading  " + this.requests[key].name);

                    // Notify listeners
                    for (var k = 0 ; k < this.loadListeners.length ; k ++)
                        if (this.loadListeners[k].objectLoadStarted)
                            this.loadListeners[k].objectLoadStarted(this.loaders[i].id, this.requests[key]);

                    // Load the next scene object
                    this.loaders[i].loadSceneObject(this.requests[key]);

                    break;
                }
            }
        }
    }

    // If load is finished, notify listeners and trigger callback
    if (this.requestCount == this.getNumberMeshesLoaded())
    {
        this.active = false;

        // Notify listeners
        for (var i = 0 ; i < this.loadListeners.length ; i ++)
            if (this.loadListeners[i].loadFinished)
                this.loadListeners[i].loadFinished();

        // Activate callback
        this.callback();
    }
};
