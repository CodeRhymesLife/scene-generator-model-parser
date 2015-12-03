/**************************************************************************
    Class - Anatomy Object
**************************************************************************/

// Declare object
var CGA_GeometryObject = function(cgaObjDescriptor, geometry)
{
    // Validate
    if (! cgaObjDescriptor || cgaObjDescriptor.className != "CGA_ObjectDescriptor")
        throw "Cannot create CGA_GeometryObject - Descriptor not valid";
    if (! geometry) throw "Cannot create CGA_GeometryObject - Geometry not defined";

    // Store values
    this.id = cgaObjDescriptor.id;
    this.name = cgaObjDescriptor.name;
    this.data = cgaObjDescriptor.data;

    // Compute object statistics - minimum / maximum
    geometry.computeBoundingBox();
    this.stats = {};
    this.stats.max = geometry.boundingBox.max.clone();
    this.stats.min = geometry.boundingBox.min.clone();

    // Compute centroid
    // var sum = new THREE.Vector3( 0, 0, 0 );
    // var count = 0;
    // for ( var i = 1, il = geometry.vertices.length; i < il; i ++ )
    // {
    //     var p = geometry.vertices[i];
    //     sum.x += p.x;
    //     sum.y += p.y;
    //     sum.z += p.z;
    //     count ++;
    // }
    // sum.x = sum.x / count;
    // sum.y = sum.y / count;
    // sum.z = sum.z / count;
    // this.stats.centroid = sum.clone();

    // Compute vertex normals to enable smooth shading
    geometry.computeVertexNormals();

    // Create mesh and material for this CGA_GeometryObject
    this.initialMtl =
    {
        ambient: new THREE.Color(cgaObjDescriptor.style.ambient),
        diffuse: new THREE.Color(cgaObjDescriptor.style.diffuse),
        specular: new THREE.Color(cgaObjDescriptor.style.specular),
        emissive: new THREE.Color(cgaObjDescriptor.style.emissive),
        shininess: cgaObjDescriptor.style.shininess,
        alpha: cgaObjDescriptor.style.alpha,
    };

    this.mtl = new THREE.MeshPhongMaterial(
    {
        ambient: this.initialMtl.ambient,
        color: this.initialMtl.diffuse,
        specular: this.initialMtl.specular,
        emissive: this.initialMtl.emissive,
        shininess: this.initialMtl.shininess,
        blending: THREE.AdditiveBlending,
        transparent: this.initialMtl.alpha != 1,
        opacity: this.initialMtl.alpha,
    });

    // Create object 3D to wrap mesh
    this.object3D = new THREE.Mesh(geometry, this.mtl);
    this.object3D.cgaObj = this;

    // Set visiblity
    this.setVisibility(cgaObjDescriptor.visible);
};
CGA_GeometryObject.prototype.getId     = function () { return this.id; };
CGA_GeometryObject.prototype.getName   = function () { return this.name; };
CGA_GeometryObject.prototype.isVisible = function () { return this.object3D.visible; };




CGA_GeometryObject.prototype.getVisibility = function()
{
    if (this.object3D)
		return this.object3D.visible;

	return false;
};




CGA_GeometryObject.prototype.resetMaterial = function()
{
    this.mtl.ambient = this.initialMtl.ambient;
    this.mtl.color = this.initialMtl.diffuse;
    this.mtl.specular = this.initialMtl.specular;
    this.mtl.emissive = this.initialMtl.emissive;
    this.mtl.shininess = this.initialMtl.shininess;
    this.mtl.transparent = this.initialMtl.alpha != 1;
    this.mtl.opacity = this.initialMtl.alpha;
};




CGA_GeometryObject.prototype.setInitialMaterial = function(mtl)
{
    this.initialMtl.ambient = new THREE.Color(mtl.ambient);
    this.initialMtl.diffuse = new THREE.Color(mtl.diffuse);
    this.initialMtl.emissive = new THREE.Color(mtl.emissive);
    this.initialMtl.specular = new THREE.Color(mtl.specular);
    this.initialMtl.shininess = mtl.shininess;
    this.initialMtl.alpha = mtl.alpha;
};




CGA_GeometryObject.prototype.setMaterial = function(mtl)
{
    if (mtl.opacity)
        throw "Dev Error - received material with opacity set (instead of alpha). Locate and fix";

    this.mtl.ambient = new THREE.Color(mtl.ambient);
    this.mtl.color = new THREE.Color(mtl.diffuse);
    this.mtl.emissive = new THREE.Color(mtl.emissive);
    this.mtl.specular = new THREE.Color(mtl.specular);
    this.mtl.shininess = mtl.shininess;
    if (mtl.alpha)
    {
        this.mtl.transparent = mtl.alpha != 1;
        this.mtl.opacity = mtl.alpha;
    }
};




CGA_GeometryObject.prototype.setOpacity = function(opacity)
{
    this.mtl.transparent = opacity != 1;
    this.mtl.opacity = opacity;
};




CGA_GeometryObject.prototype.setPosition = function(x, y, z)
{
	if (this.object3D)
	{
		this.object3D.position.set(x, y, z);
	}
};




CGA_GeometryObject.prototype.setScale = function(x, y, z)
{
	if (this.object3D)
	{
		this.object3D.scale.set(x, y, z);
	}
};




CGA_GeometryObject.prototype.setVisibility = function(visible)
{
	if (this.object3D)
		this.object3D.visible = visible;
};




CGA_GeometryObject.prototype.toggleVisibility = function ()
{
    if (this.object3D)
		this.object3D.visible = ! this.object3D.visible;
};

