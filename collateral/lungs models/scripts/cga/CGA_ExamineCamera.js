var CGA_ExamineCamera = function(fov, ar, min, max)
{
    THREE.PerspectiveCamera.call(this, fov, ar, min, max);

    // Initialize state variable
    this.target = new THREE.Vector3();

    // Define standard stored configuration
    this.storedConfig = null;

    // Apply basic configuration
    this.applyBasicConfiguration();
};
CGA_ExamineCamera.prototype = new THREE.PerspectiveCamera();
CGA_ExamineCamera.DISTANCE_EXTENT_RATIO = 3;
CGA_ExamineCamera.DISTANCE_MAX_RATIO    = 50;
CGA_ExamineCamera.DISTANCE_MIN_RATIO    = 0.01;




CGA_ExamineCamera.prototype.applyBasicConfiguration = function ()
{
    // Configure camera
    this.position.set(0, 0, 1);
    this.rotation.set(0, 0, 0);
    this.target.set(0, 0, 0);
    this.up.set(0, 1, 0);

    // Apply new configuration
    this.updateNextFrame = true;
};




CGA_ExamineCamera.prototype.applyStoredConfiguration = function ()
{
    if (this.storedConfig)
    {
        // Configure camera
        this.position.copy  ( this.storedConfig.position);
        this.rotation.copy  ( this.storedConfig.rotation);
        this.target.copy    ( this.storedConfig.target);
        this.up.copy        ( this.storedConfig.up);
        this.distance       = this.storedConfig.distance;
        this.distance_max   = this.storedConfig.distance * CGA_ExamineCamera.DISTANCE_MAX_RATIO;
        this.distance_min   = this.storedConfig.distance * CGA_ExamineCamera.DISTANCE_MIN_RATIO;


        // Apply new configuration
        this.updateNextFrame = true;
    }
    else
        this.applyBasicConfiguration();
};




CGA_ExamineCamera.prototype.getCurrentConfiguration = function ()
{
    // Initialize datastructure
    var cfg = {};
    cfg.position    = new THREE.Vector3();
    cfg.rotation    = new THREE.Vector3();
    cfg.target      = new THREE.Vector3();
    cfg.up          = new THREE.Vector3();

    // Copy current configuration
    cfg.position.copy(this.position);
    cfg.rotation.copy(this.rotation);
    cfg.target.copy(this.target);
    cfg.up.copy(this.up);

    return cfg;
};




CGA_ExamineCamera.prototype.getStoredConfiguration = function ()
{
    // Initialize datastructure
    var cfg = {};
    cfg.position    = new THREE.Vector3();
    cfg.rotation    = new THREE.Vector3();
    cfg.target      = new THREE.Vector3();
    cfg.up          = new THREE.Vector3();

    // Copy current configuration
    cfg.position.copy(this.storedConfig.position);
    cfg.rotation.copy(this.storedConfig.rotation);
    cfg.target.copy(this.storedConfig.target);
    cfg.up.copy(this.storedConfig.up);

    return cfg;
};




CGA_ExamineCamera.prototype.setCurrentConfiguration = function (cfg)
{
    // Store new configuration
    if (cfg.position)
        this.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
    if (cfg.rotation)
        this.rotation.set(cfg.rotation.x, cfg.rotation.y, cfg.rotation.z);
    if (cfg.target)
        this.target.set(cfg.target.x, cfg.target.y, cfg.target.z);
    if (cfg.up)
        this.up.set(cfg.up.x, cfg.up.y, cfg.up.z);

    // Calculate new distance
    if (cfg.position || cfg.target)
    {
        var v = new THREE.Vector3();
        v.copy(this.target).sub(this.position);
        this.distance = v.length();
    }
};




CGA_ExamineCamera.prototype.setCurrentDistance = function (distance)
{
    // If distance is zero, set to minimum
    if (distance == 0)
        distance = CGA_ExamineCamera.DISTANCE_MIN_RATIO;

    // Store
    this.distance = distance;
    this.updateNextFrame = true;
};




CGA_ExamineCamera.prototype.setStoredConfiguration = function (cfg)
{
    // Create stored config structure
    if (! this.storedConfig)
    {
        this.storedConfig = {};
        this.storedConfig.position = new THREE.Vector3(0, 0, 1);
        this.storedConfig.rotation = new THREE.Vector3(0, 0, 0);
        this.storedConfig.target = new THREE.Vector3(0, 0, 0);
        this.storedConfig.up = new THREE.Vector3(0, 1, 0);
        this.storedConfig.distance = 1;
    }

    // Store new stored configuration
    if (cfg.position)
        this.storedConfig.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
    if (cfg.rotation)
        this.storedConfig.rotation.set(cfg.rotation.x, cfg.rotation.y, cfg.rotation.z);
    if (cfg.target)
        this.storedConfig.target.set(cfg.target.x, cfg.target.y, cfg.target.z);
    if (cfg.up)
        this.storedConfig.up.set(cfg.up.x, cfg.up.y, cfg.up.z);

    // Calculate new distance
    if (cfg.position || cfg.target)
    {
        // Calculate actual distance
        var v = new THREE.Vector3();
        v.copy(this.storedConfig.target).sub(this.storedConfig.position);
        var distance = v.length();

        // If distance is zero, set to minimum
        if (distance == 0)
            distance = CGA_ExamineCamera.DISTANCE_MIN_RATIO;

        // Store distance
        this.storedConfig.distance = distance;
    }
};




CGA_ExamineCamera.prototype.update = function (update)
{
    // Determine if an update is required this frame
    var proceed =
        this.updateNextFrame ||
        update.rotate.x != 0 || update.rotate.y != 0 || update.rotate.z ||
        update.target != null ||
        update.zoom != 0;

    if (proceed)
    {
        // Adjust target
        if (update.target)
        {
            this.target.copy(update.target);
            var tcVec = new THREE.Vector3(); // camera relative to target
            tcVec.copy( this.position ).sub( this.target );
            this.distance = tcVec.length();
        }

        // Adjust distance according to zoom
        this.distance *= (1 - update.zoom);

        // Calculate offset of target to camera
        var targetCameraOffset = new THREE.Vector3(); // camera relative to target
        targetCameraOffset.copy( this.position ).sub( this.target );
        targetCameraOffset.normalize();

        // Calculate camera front vector
        var cameraFront = new THREE.Vector3();
        cameraFront.copy(targetCameraOffset).negate().normalize();

        // Calculate camera up vector
        var cameraUp = this.up;
        var up_extra = new THREE.Vector3();
        up_extra.copy(cameraFront).multiplyScalar(cameraUp.dot(cameraFront));
        cameraUp.sub(up_extra).normalize();

        // Calculate camera left vector
        var cameraLeft = new THREE.Vector3();
        cameraLeft.copy(cameraUp).cross(cameraFront).normalize();

        // Perform horizontal and vertical rotation
        var q_cameraUp = new THREE.Quaternion();
        q_cameraUp.setFromAxisAngle(cameraUp, - update.rotate.x * 0.01);
        var q_cameraLeft = new THREE.Quaternion();
        q_cameraLeft.setFromAxisAngle(cameraLeft, update.rotate.y * 0.01);
        var newTargetCameraOffset = new THREE.Vector3();
        newTargetCameraOffset.copy(targetCameraOffset).applyQuaternion(q_cameraUp).applyQuaternion(q_cameraLeft);
        this.position.copy(this.target).add(newTargetCameraOffset.multiplyScalar(this.distance));

        // Calculate up
        var q_cameraFront = new THREE.Quaternion();
        q_cameraFront.setFromAxisAngle(cameraFront, -update.rotate.z * 0.0002 * Math.PI);
        cameraUp.applyQuaternion(q_cameraFront);

        // Look at the target
        this.lookAt(this.target);
    }

    // console.log("position: { x: " + this.position.x + ", y: " + this.position.y + ", z: " + this.position.z + " },");
    // console.log("rotation: { x: " + this.rotation.x + ", y: " + this.rotation.y + ", z: " + this.rotation.z + " },");
    // console.log("target: { x: " + this.target.x + ", y: " + this.target.y + ", z: " + this.target.z + " },");
    // console.log("up: { x: " + this.up.x + ", y: " + this.up.y + ", z: " + this.up.z + " },");
    // console.log("distance: " + this.distance + ",");
    // console.log("distance_min: " + this.distance_min + ",");
    // console.log("distance_max: " + this.distance_max + ",");
};

