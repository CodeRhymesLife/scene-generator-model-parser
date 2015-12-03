CGA_GroupObject = function()
{
	this.object3D = new THREE.Object3D();
	this.children = [];
};


// Add/remove children
CGA_GroupObject.prototype.addChild = function(child)
{
	this.children.push(child);
	
	// If this is a renderable object, add its object3D as a child of mine
	if (child.object3D)
		this.object3D.add(child.object3D);
};


CGA_GroupObject.prototype.removeChild = function(child)
{
	var index = this.children.indexOf(child);
	if (index != -1)
	{
		this.children.splice(index, 1);
		
		// If this is a renderable object, remove its object3D as a child of mine
		if (child.object3D)
			this.object3D.remove(child.object3D);
	}
};


CGA_GroupObject.prototype.setPosition = function(x, y, z)
{
    this.object3D.position.set(x, y, z);
};


CGA_GroupObject.prototype.setScale = function(x, y, z)
{
    this.object3D.scale.set(x, y, z);
};


CGA_GroupObject.prototype.setVisible = function(visible)
{
    this.object3D.visible = visible;
	
    for (var i = 0; i < obj.children.length; i++)
        obj.children[i].setVisible(visible);
};


CGA_GroupObject.prototype.update = function()
{
	this.updateChildren();
};


// updateChildren - update all child objects
CGA_GroupObject.prototype.updateChildren = function()
{
	for (var i = 0; i < this.children.length; i++)
		this.children[i].update();
};
