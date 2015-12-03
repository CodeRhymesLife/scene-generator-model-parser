/**************************************************************************
    Class - CGA_InteractionManager

    - Listens for and propogates all mouse and keyboard events
    - Fires events:
        - handleKeyDown, handleKeyUp     - key presses
        - handleMouseDown, handleMouseUp - mouse clicks
        - handleMouseLeave               - mouse leaves canvas
        - handleMouseMove                - mouse moves
        - handleMouseScroll              - mouse scroll wheel moves
        - handleObjectClicked            - mouse clicked on object
        - handleObjectHovered            - mouse is over object (called each mouse time mouse moves)

    Potential extensions:
    - Detect double clicks
    - Handle object hover changes when scene, not mouse moves (so hovering updates as scene rotates)

**************************************************************************/
// Constructor
CGA_InteractionManager = function (gfxEngine, interactionConfig)
{
    this.gfxEngine = gfxEngine;

    // Enable picking by default
    this.flag_pickingOnHoverEnabled =
        interactionConfig.hasOwnProperty("pickingOnHoverEnabled") ? interactionConfig.pickingOnHoverEnabled : true;

    this.flag_pickingOnClickEnabled =
        interactionConfig.hasOwnProperty("pickingOnClickEnabled") ? interactionConfig.pickingOnClickEnabled : true;

    // Initialize state
    this.listeners = {};
    this.mousePosition = {x : 0, y: 0};

    // Register for interaction events
    var that = this;
    this.gfxEngine.renderer.domElement.addEventListener( 'mousemove',  function(e)  { that.onMouseMove(e); }, false );
    this.gfxEngine.renderer.domElement.addEventListener( 'mousedown',  function(e)  { that.onMouseDown(e); }, false );
    this.gfxEngine.renderer.domElement.addEventListener( 'mouseup',  function(e)    { that.onMouseUp(e); }, false );
    this.gfxEngine.renderer.domElement.addEventListener( 'mouseleave', function (e) { that.onMouseLeaveCanvas(e); },  false );

    // Register key events for when form elements are not focused
    $(document).keydown(function (e) {
        var tag = $(':focus').prop('tagName');
        if (tag != "INPUT" && tag != "TEXTAREA" && tag != "SELECT")
            that.onKeyDown(e);
    });
    $(document).keyup(function (e) {
        var tag = $(':focus').prop('tagName');
        if (tag != "INPUT" && tag != "TEXTAREA" && tag != "SELECT")
            that.onKeyUp(e);
    });

    // Register listener for mouse wheel over 3D canvas
    $(this.gfxEngine.renderer.domElement).mousewheel(
        function(e, delta) {
            that.onMouseScroll(e, delta);
        }
    );

    // Register listener for hierarchy events (keyboard in outer frames)
    document.receiveHierarchyEvent = function (e)
    {
        if (e.type == 'keydown')
            that.interactionManager.onKeyDown(e);
    };

    window.addEventListener( 'resize', function(e) { that.onWindowResize(e); }, false );
};


// Add a listener
CGA_InteractionManager.prototype.addListener = function (name, listener)
{
    this.listeners[name] = listener;
};


// Remove all instances of this listener
CGA_InteractionManager.prototype.removeListener = function (name)
{
    delete this.listeners[name];
};


// Event - Key has been pressed while web browser has focus
CGA_InteractionManager.prototype.onKeyDown = function (e)
{
    // Notify listeners
    for (var i in this.listeners)
        if (this.listeners[i].handleKeyDown)
            this.listeners[i].handleKeyDown(e);
};


// Event - Key has been released while web browser has focus
CGA_InteractionManager.prototype.onKeyUp = function (e)
{
    // Notify listeners
    for (var i in this.listeners)
        if (this.listeners[i].handleKeyUp)
            this.listeners[i].handleKeyUp(e);
};


// Event - mouse has been clicked within webGL canvas
CGA_InteractionManager.prototype.onMouseDown = function(event)
{
    event.preventDefault();
    this.gfxEngine.renderer.domElement.focus();

    // Handle picking
    if (this.flag_pickingOnClickEnabled && event.button == 0)
    {
        // Pick
        var pickResult = this.gfxEngine.objectAtPoint(event.pageX, event.pageY);

        // Call controller
        if (pickResult.obj)
        {
            for (var i in this.listeners)
                if (this.listeners[i].handleObjectClicked)
                    this.listeners[i].handleObjectClicked(pickResult.obj.cgaObj);
        }
        else
        {
            for (var i in this.listeners)
                if (this.listeners[i].handleObjectClicked)
                    this.listeners[i].handleObjectClicked(null);
        }
    }

    for (var i in this.listeners)
        if (this.listeners[i].handleMouseDown)
            this.listeners[i].handleMouseDown(event.button);
};


// Event - mouse has left webGL canvas
CGA_InteractionManager.prototype.onMouseLeaveCanvas = function(event)
{
    for (var i in this.listeners)
        if (this.listeners[i].handleMouseLeave)
            this.listeners[i].handleMouseLeave();
};


// Event - mouse has moved within webGL canvas
CGA_InteractionManager.prototype.onMouseMove = function(event)
{
    // Self-reference
    var that = this;

    // Prevent default actions
    event.preventDefault();

    // Trigger picking handler
    // Pick only when stationary for 30 milliseconds or more
    if (this.flag_pickingOnHoverEnabled) window.setTimeout(function () {

        if (that.mousePosition.x == event.pageX && that.mousePosition.y == event.pageY)
        {
            var pickResult = that.gfxEngine.objectAtPoint(event.pageX, event.pageY);

            // Call controller
            if (pickResult.obj)
            {
                for (var i in that.listeners)
                    if (that.listeners[i].handleObjectHovered)
                        that.listeners[i].handleObjectHovered(pickResult.obj.cgaObj);
            }
            else
            {
                for (var i in that.listeners)
                    if (that.listeners[i].handleObjectHovered)
                        that.listeners[i].handleObjectHovered(null);
            }
        }
    }, 100);
    this.mousePosition.x = event.pageX;
    this.mousePosition.y = event.pageY;

    // Notify listeners of mouse motion
    for (var i in this.listeners)
        if (this.listeners[i].handleMouseMove)
            this.listeners[i].handleMouseMove(event.pageX, event.pageY);
};


// Event - mouse wheel has been scrolled within webGL canvas
CGA_InteractionManager.prototype.onMouseScroll = function(event, delta)
{
    event.preventDefault();

    // Notify listeners
    for (var i in this.listeners)
        if (this.listeners[i].handleMouseScroll)
    	   this.listeners[i].handleMouseScroll(delta);
};


// Event - mouse has been released within webGL canvas
CGA_InteractionManager.prototype.onMouseUp = function(event)
{
    event.preventDefault();

    for (var i in this.listeners)
        if (this.listeners[i].handleMouseUp)
            this.listeners[i].handleMouseUp(event.button);
};


CGA_InteractionManager.prototype.onWindowResize = function(event)
{
    this.gfxEngine.resize();
};




// Constants
CGA_InteractionState = {};
CGA_InteractionState.KEY_DOWN   = 201;
CGA_InteractionState.KEY_UP     = 202;
CGA_InteractionState.MOUSE_DOWN = 101;
CGA_InteractionState.MOUSE_UP   = 102;

CGA_KeyCodes = {};
CGA_KeyCodes.KEY_SHIFT          = 16;
CGA_KeyCodes.KEY_CTRL           = 17;
CGA_KeyCodes.KEY_ALT            = 18;
CGA_KeyCodes.KEY_LEFT           = 37;
CGA_KeyCodes.KEY_UP             = 38;
CGA_KeyCodes.KEY_RIGHT          = 39;
CGA_KeyCodes.KEY_DOWN           = 40;
CGA_KeyCodes.KEY_A              = 65;
CGA_KeyCodes.KEY_B              = 66;
CGA_KeyCodes.KEY_C              = 67;
CGA_KeyCodes.KEY_D              = 68;
CGA_KeyCodes.KEY_E              = 69;
CGA_KeyCodes.KEY_F              = 70;
CGA_KeyCodes.KEY_G              = 71;
CGA_KeyCodes.KEY_H              = 72;
CGA_KeyCodes.KEY_I              = 73;
CGA_KeyCodes.KEY_J              = 74;
CGA_KeyCodes.KEY_K              = 75;
CGA_KeyCodes.KEY_L              = 76;
CGA_KeyCodes.KEY_M              = 77;
CGA_KeyCodes.KEY_N              = 78;
CGA_KeyCodes.KEY_O              = 79;
CGA_KeyCodes.KEY_P              = 80;
CGA_KeyCodes.KEY_Q              = 81;
CGA_KeyCodes.KEY_R              = 82;
CGA_KeyCodes.KEY_S              = 83;
CGA_KeyCodes.KEY_T              = 84;
CGA_KeyCodes.KEY_U              = 85;
CGA_KeyCodes.KEY_V              = 86;
CGA_KeyCodes.KEY_W              = 87;
CGA_KeyCodes.KEY_X              = 88;
CGA_KeyCodes.KEY_Y              = 89;
CGA_KeyCodes.KEY_Z              = 90;
CGA_KeyCodes.KEY_QUESTION_MARK  = 191;

CGA_MouseCodes = {};
CGA_MouseCodes.LEFT_BUTTON      = 0;
CGA_MouseCodes.MIDDLE_BUTTON    = 1;
CGA_MouseCodes.RIGHT_BUTTON     = 2;
