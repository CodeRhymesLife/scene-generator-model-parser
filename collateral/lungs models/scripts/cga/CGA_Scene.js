/**************************************************************************
    Class - Configurable Graphics Application - Scene class

    Extends base three.js scene with scene management logic specific to
    the CGA


**************************************************************************/

var CGA_Scene = function()
{
    THREE.Scene.call(this);

    // Create storage for objects
    this.objectMap = {};

    // Create a new Three.js scene
    this.add( new THREE.AmbientLight( 0x505050 ) );

    // Create main groups (for rotation and centroid)
    this.mainTranslationGroup = new CGA_GroupObject();
    this.add(this.mainTranslationGroup.object3D);

    // Create light source
    this.lightSource_ENO = new THREE.PointLight (0xffffff, 0.5, 0);
    this.lightSource_ENO.position.set(0, 0, 0);
    this.add(this.lightSource_ENO);
    this.lightSource_SWI = new THREE.PointLight (0xffffff, 0.5, 0);
    this.lightSource_SWI.position.set(0, 0, 0);
    this.add(this.lightSource_SWI);

    this.stats =
    {
        extent: 1,
        origin: new THREE.Vector3(0, 0, 0),
    };
};
CGA_Scene.prototype = new THREE.Scene();




// Add an object to the scene
CGA_Scene.prototype.addObject = function(object)
{
    // Add object to map
    this.objectMap[object.getId()] = object;

    // Add object to scene graph
    this.mainTranslationGroup.addChild(object);

    // Update scene statistics
    this.computeStatistics();

    // Re-position scene contents
    this.adjustToCentroid();

    // Place lights in correct positions for new scene configuration
    this.placeLightSources();
};




// Add a set of objects to the scene
CGA_Scene.prototype.addObjects = function (objects)
{
    for (var i = 0 ; i < objects.length ; i ++)
    {
        // Add object to map
        this.objectMap[objects[i].getId()] = objects[i];

        // Add object to scene graph
        this.mainTranslationGroup.addChild(objects[i]);
    }

    // Update scene statistics
    this.computeStatistics();

    // Re-position scene contents
    this.adjustToCentroid();

    // Place lights in correct positions for new scene configuration
    this.placeLightSources();
};




CGA_Scene.prototype.adjustToCentroid = function ()
{
    this.mainTranslationGroup.object3D.position.set(-this.stats.origin.x, -this.stats.origin.y, -this.stats.origin.z);
};




CGA_Scene.prototype.computeStatistics = function ()
{
    // Get objects from scene
    var objects = this.getObjects();

    // Recalculate geometric parameters from the full list of scene objects
    if (objects.length > 0)
    {
        // Initialize
        var centroid = new THREE.Vector3(0, 0, 0);
        var max = new THREE.Vector3( -Infinity, -Infinity, -Infinity );
        var min = new THREE.Vector3( Infinity, Infinity, Infinity );

        // Gather data from objects
        for (var i = 0 ; i < objects.length ; i++)
        {
            var omax = objects[i].stats.max;
            var omin = objects[i].stats.min;

            centroid.x += (omax.x + omin.x) / 2;
            centroid.y += (omax.y + omin.y) / 2;
            centroid.z += (omax.z + omin.z) / 2;

            if (omax.x > max.x) max.x = omax.x;
            if (omax.y > max.y) max.y = omax.y;
            if (omax.z > max.z) max.z = omax.z;

            if (omin.x < min.x) min.x = omin.x;
            if (omin.y < min.y) min.y = omin.y;
            if (omin.z < min.z) min.z = omin.z;
        }

        // Calculate centroid (average sum)
        centroid.x = centroid.x / objects.length;
        centroid.y = centroid.y / objects.length;
        centroid.z = centroid.z / objects.length;

        // Recalculate max / min as distance from centroid
        max.x = max.x - centroid.x;
        max.y = max.y - centroid.y;
        max.z = max.z - centroid.z;
        min.x = centroid.x - min.x;
        min.y = centroid.y - min.y;
        min.z = centroid.z - min.z;

        // Calculate extent
        var extent = max.x;
        if (max.y > extent) extent = max.y;
        if (max.z > extent) extent = max.z;
        if (min.x > extent) extent = min.x;
        if (min.y > extent) extent = min.y;
        if (min.z > extent) extent = min.z;
        if (extent < 1)
            extent = 1;

        this.stats.extent = extent;
        this.stats.origin.set(centroid.x, centroid.y, centroid.z);
    }
};




// Retrieve the object with the given ID.
// Return null if no such object found
CGA_Scene.prototype.getObjectById = function (id)
{
    return this.objectMap[id];
};




CGA_Scene.prototype.getObjectMap = function ()
{
    return this.objectMap;
};



// Get array of all objects in scene
CGA_Scene.prototype.getObjects = function ()
{
    var objects = [];

    for (var key in this.objectMap)
        objects.push(this.objectMap[key]);

    return objects;
};




// Determine whether an object with the given ID exists in this scene
CGA_Scene.prototype.hasObjectWithId = function (id)
{
    if (this.objectMap[id])
        return true;
    else
        return false;
};




CGA_Scene.prototype.placeLightSources = function ()
{
    this.lightSource_ENO.position.set( this.stats.extent * 3,  this.stats.extent * 3,  this.stats.extent * 3);
    this.lightSource_SWI.position.set(-this.stats.extent * 3, -this.stats.extent * 3, -this.stats.extent * 3);
};




// Remove an object from the scene
CGA_Scene.prototype.removeObject = function(object)
{
    if (object)
    {
        // Remove object from map
        delete this.objectMap[object.getId()];

        // Remove object from scene graph
        this.mainTranslationGroup.removeChild(object);

        // Update scene statistics
        this.computeStatistics();

        // Re-position scene contents
        this.adjustToCentroid();

        // Place lights in correct positions for new scene configuration
        this.placeLightSources();
    }
};
