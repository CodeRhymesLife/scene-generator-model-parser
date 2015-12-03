/**************************************************************************
    Class - Configurable Graphics Application - Graphics Engine

    - Handles Rendering
    - Manages Scene Graph

    Uses Interface LoadListener
    Class
      - method loadFinished()
      - method loadStarted(loaderCount, objectCount)
      - method objectLoadFinished(loaderId, descriptor)
      - method objectLoadProgress(loaderId, loaded, total)
      - method objectLoadStarted(loaderId, descriptor)

**************************************************************************/

var CGA_GraphicsEngine = function(container, config)
{
    // Create mesh manager
    this.meshManager = new CGA_MeshManager();

    // Create and configure container
    this.container = container;
    if (! this.container)
    	throw "Cannot create graphics context - container is null";
	this.container.setAttribute("tabindex", 1);

    // Check that WebGL is supported
    if (! this.testWebGLSupport(this.container))
        return;

    // Create the Three.js renderer, add it to our div
    this.renderer = new THREE.WebGLRenderer( { antialias: true, canvas: undefined } );
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute("tabindex", 1);

    // Disable right mouse click on canvas
    this.renderer.domElement.oncontextmenu = function () { return false; };

    // Create Scene
    this.scene = new CGA_Scene();

    // Create camera and place in default location
    this.camera = new CGA_ExamineCamera( 45, this.container.offsetWidth / this.container.offsetHeight, 1, 10000 );
    this.scene.add(this.camera);
    if (config.camera)
    {
        this.camera.setStoredConfiguration(config.camera);
        this.camera.applyStoredConfiguration();
    }

    // Create a projector to handle picking
    this.projector = new THREE.Projector();
};




// Add a set of objects to the scene. Do not change existing objects
// - Does not begin adding objects until any current scene loading operation has finished.
// - Returns immediately.
// - On completion of operation, callback is called.
CGA_GraphicsEngine.prototype.addSceneObjects = function (cgaObjectDescriptors, callback)
{
    var that = this;

    // If scene loader is active, re-call addSceneObjects after a delay
    if (this.meshManager.active)
    {
        window.setTimeout(function () { that.addSceneObjects(cgaObjectDescriptors, callback); }, 200);
    }

    // Add the scene objects
    else
    {
        // Find objects in new scene that need to be loaded
        var filteredObjectDescriptors = [];
        for (var i = 0 ; i < cgaObjectDescriptors.length ; i ++)
        {
            // Fail if ID is missing
            if (! cgaObjectDescriptors[i].id)
                throw "Cannot add scene object with descriptor missing ID";

            // Ignore duplicate descriptors
            if (this.scene.hasObjectWithId(cgaObjectDescriptors[i].id))
                console.log("GFXEngine - addSceneObjects - skipping CGA descriptor "
                    + cgaObjectDescriptors[i].name + " (" + cgaObjectDescriptors[i].id + ") - already exists");

            // Store for addition
            if (! this.scene.hasObjectWithId(cgaObjectDescriptors[i].id))
            {
                console.log("GFXEngine - addSceneObjects - adding CGA descriptor "
                    + cgaObjectDescriptors[i].name + " (" + cgaObjectDescriptors[i].id + ")");

                filteredObjectDescriptors.push(cgaObjectDescriptors[i]);
            }
        }

        // Add new objects
        this.loadSceneObjects(filteredObjectDescriptors, callback);
    }
};




CGA_GraphicsEngine.prototype.configureCameraBasic = function ()
{
    this.camera.setCurrentDistance(this.scene.stats.extent * CGA_ExamineCamera.DISTANCE_EXTENT_RATIO);
    this.camera.applyBasicConfiguration();
};




CGA_GraphicsEngine.prototype.getSceneObjectById = function (id)
{
    return this.scene.getObjectById(id);
};




// Load a set of scene objects from a set of scene object descriptors.
// When finished, add these to the scene.
CGA_GraphicsEngine.prototype.loadSceneObjects = function (cgaObjectDescriptors, outerCallback)
{
    // Register event to occur when meshes are fully loaded
    var that = this;

    var objects = [];

    // Create Load Listener events
    var myCallback = function ( event )
    {
        for (var i = 0 ; i < cgaObjectDescriptors.length ; i ++)
        {
            console.log("Creating CGA object from descriptor for " + cgaObjectDescriptors[i].name);
            objects.push(new CGA_GeometryObject(
                cgaObjectDescriptors[i],
                that.meshManager.getMesh(cgaObjectDescriptors[i].filename).children[0].geometry));
        }

        that.scene.addObjects(objects);

        // Notify caller of completion of load
        if (outerCallback)
            outerCallback();
    };

    // Initialize and load meshes
    this.meshManager.loadFromDescriptors(cgaObjectDescriptors, myCallback);
};




// Pick the first object under coordinates given
CGA_GraphicsEngine.prototype.objectAtPoint = function(x,y)
{
	// Translate page coords to element coords
	var offset = $(this.renderer.domElement).offset();
	var eltx = x - offset.left;
	var elty = y - offset.top;

	// Translate client coords into viewport x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;

    // Calculate vector pick vector
    var vector = new THREE.Vector3( vpx, vpy, 1.0 );
    this.projector.unprojectVector( vector, this.camera , 0, Infinity);
    vector.sub( this.camera.position );
    vector.normalize();

    // Cast ray to find intersects
    var raycaster = new THREE.Raycaster( this.camera.position, vector );
    var targets = [ this.scene ];
    var intersects = raycaster.intersectObjects( targets, true );

    // Find first visible object
    for (var i = 0 ; i < intersects.length ; i ++)
    {
        if (intersects[i].object != null && intersects[i].object.visible)
        {
            // Calculate point of intersection in world coordinates
            var worldPoint = new THREE.Vector3();
            worldPoint.copy(intersects[i].point);

            // Calculate point of intersection in object coordinates
            var objectPoint = new THREE.Vector3();
            objectPoint.copy(intersects[i].point);
            objectPoint.applyMatrix4(new THREE.Matrix4().getInverse(intersects[i].object.matrixWorld));

            // Return results
            return (
            {
                obj: intersects[i].object,
                worldPoint: worldPoint,
                objectPoint: objectPoint,
            });
        }
    }

    // If none found, return empty pick
    return {"obj":null, "point":null};
};




// Render a single frame
//
// Called by main loop
CGA_GraphicsEngine.prototype.render = function()
{
    this.renderer.render( this.scene, this.camera );
};




// Replace scene with objects based on given descriptors.
// - Remove objects not in given list
// - Add objects not in current scene
// - Do not change objects in given list and in current scene
//
// - Does not begin replacing objects until any current scene loading operation has finished.
// - Returns immediately.
// - On completion of operation, callback is called.
CGA_GraphicsEngine.prototype.replaceSceneObjects = function (cgaObjectDescriptors, callback)
{
    // Self reference
    var that = this;

    // If scene loader is active, re-call after a delay
    if (this.meshManager.active)
    {
        window.setTimeout(function () { that.replaceSceneObjects(cgaObjectDescriptors, callback); }, 200);
    }

    // Add the scene objects
    else
    {
        console.log("Replacing scene objects");

        // Obtain maps of new and old scene objects / descriptors
        var currentObjectMap = this.scene.getObjectMap();
        var newObjectDescriptorMap = _.indexBy(cgaObjectDescriptors, "id");

        // Organize objects into three lists
        // - To remove - Object in current scene only
        // - To update - Object in current and requested scene
        // - To add - Object in requested scene only
        var toRemove = [];
        var toUpdate = [];
        var toAdd = [];

        // Look through current objects for matches in new objects
        for (var key in currentObjectMap)
            if (newObjectDescriptorMap[currentObjectMap[key].getId()])
                toUpdate.push(key);
            else
                toRemove.push(currentObjectMap[key]);
        for (var key in newObjectDescriptorMap)
            if (! currentObjectMap[newObjectDescriptorMap[key].id])
                toAdd.push(newObjectDescriptorMap[key]);

        // Remove objects
        for (var i = 0 ; i < toRemove.length ; i++)
        {
            console.log("Removing " + toRemove[i].getName());
            this.scene.removeObject(toRemove[i]);
        }

        // Update objects
        for (var i = 0 ; i < toUpdate.length ; i++)
        {
            var key = toUpdate[i];
            console.log("Updating " + currentObjectMap[key].getName());
            currentObjectMap[key].setInitialMaterial(newObjectDescriptorMap[key].style);
            currentObjectMap[key].setMaterial(newObjectDescriptorMap[key].style);
        }

        // Add new objects
        for (var i = 0 ; i < toAdd.length ; i++)
            console.log("Adding " + toAdd[i].name);
        this.loadSceneObjects(toAdd, callback);
    }
};




// Resize the renderer and camera frustum according to current container size
CGA_GraphicsEngine.prototype.resize = function()
{
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
	this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;

	// Apply camera offsets, if set
	if (this.camera.offsets)
	{
        var width = this.container.offsetWidth + Math.abs(this.camera.offsets.x);
        var height = this.container.offsetHeight + Math.abs(this.camera.offsets.y);
        var x_off = this.camera.offsets.x < 0 ? -this.camera.offsets.x : 0;
        var y_off = this.camera.offsetsy < 0 ? -this.camera.offsets.y : 0;
        this.camera.setViewOffset(width, height, x_off, y_off, this.container.offsetWidth, this.container.offsetHeight);
    }

	this.camera.updateProjectionMatrix();
};




CGA_GraphicsEngine.prototype.setCameraOffsets = function(x, y)
{
    this.camera.offsets =
    {
        x: x,
        y: y,
    };

    var width = this.container.offsetWidth + Math.abs(x);
    var height = this.container.offsetHeight + Math.abs(y);
    var x_off = x < 0 ? -x : 0;
    var y_off = y < 0 ? -y : 0;

    this.camera.setViewOffset(width, height, x_off, y_off, this.container.offsetWidth, this.container.offsetHeight);
};




// Test whether WebGL is supported in this browser
//
// If not supported, display an appropriate error message and return false
// If supported, return true
CGA_GraphicsEngine.prototype.testWebGLSupport = function(container)
{

    // Test to see if browser understands Web GL.
    if (!window.WebGLRenderingContext)
    {
        container.style.padding = "8px";
        container.innerHTML = '<h1>Your browser does not support 3D graphics</h1>';
        container.innerHTML += '<p>Unfortunately, your browser does not support Web GL. We suggest you try a recent version of Chrome, Firefox, or Safari.</p>';
        container.innerHTML += '<p>Internet Explorer does not support 3D graphics in any form, and Opera supports it only partially.</p>';
        return false;
    }
    else
    {
        // Attempt to create a Web GL environment
        var canvas = document.createElement("canvas");
        gl = canvas.getContext("webgl");

        // If that failed, try an experimental web GL environment
        if (!gl)
            gl = canvas.getContext("experimental-webgl");

        // If that failed, show fail message
        if (!gl)
        {
            container.style.padding = "8px";
            container.innerHTML = "<h1>Your browser is having problems starting 3D graphics</h1>";
            container.innerHTML += "<p>Most likely, this is because Web GL support is disabled, as this is the default for some browsers. It is also possible that your computer is running old video drivers that do not support browser-based 3D graphics.</p>";
            container.innerHTML += "<p>To solve this problem, try the following:</p>";
            container.innerHTML += "<ul>";
            container.innerHTML += "<li>Visit <a href=\"http://get.webgl.org\">http://get.webgl.org</a>. They link to help files for a number of browsers.</li>";
            container.innerHTML += "<li>Google \"enable webgl [browser]\" to find instructions on how to enable WebGL in your browser</li>";
            container.innerHTML += "<li>If you're confident that Web GL is enabled and you're still unable to see 3D graphics, try updating your graphics card drivers.</li>";
            container.innerHTML += "</ul>";

            return false;
        }
        else
            return true;
    }
};


