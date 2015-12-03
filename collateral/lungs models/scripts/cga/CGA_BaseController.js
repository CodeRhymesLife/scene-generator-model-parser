/**************************************************************************
    Class - CGA Base Controller

    Handles basic interaction functionality
    - Hover & selection of objects
    - Basic camera control
    - Help dialog

**************************************************************************/

var CGA_BaseController = function(mainApp)
{
    // Store objects for later calls
    this.mainApp = mainApp;

    // Set initial change variables
    this.keyState = []; for (var i = 0 ; i < 256 ; i ++) this.keyState[i] = false;
    this.lastUpdateTime = 0;
    this.mouseButtonState = [ 0, 0 , 0];
    this.mouseMotion = { x : 0, y: 0 };
    this.mousePosition = { x : null, y: null };
    this.mouseScrollMotion = 0;

    // Create UI Elements
    this.htmlElements =
    {
        loadProgressPanel: document.getElementById("cga_lpp"),
        helpPanel: document.getElementById("cga_help"),
        helpButton: document.getElementById("cga_help_button"),
    };
    this.uiElements = {};

    // Create Load Progress Panel
    this.uiElements.loadProgressPanel = new CGA_UI_LoadProgressPanel(this.htmlElements.loadProgressPanel);
    this.mainApp.gfxEngine.meshManager.addLoadListener(this.uiElements.loadProgressPanel);

    // Create Help Panel & Button
    this.uiElements.helpPanel = new CGA_UI_HelpPanel(this.htmlElements.helpPanel);
    var that = this;
    this.htmlElements.helpButton.onclick = function ()
    {
        // Re-build help before showing
        if (!that.uiElements.helpPanel.isVisible())
        {
            var helpConfigs = that.mainApp.getControllerHelpConfigs();
            that.uiElements.helpPanel.buildUI(helpConfigs);
        }

        that.uiElements.helpPanel.toggleVisibility();
    };
};




// Help Item configuration
CGA_BaseController.prototype.helpConfig =
{
    "camera":
    {
        name: "Camera Controls",
        description: "The following controls allow you to control the camera viewpoint and move around the scene",
        items:
        {
            "R": "Reset viewpoint",
            "Left mouse button": "Click to select structure",
            "Left mouse button + Shift": "Re-center",
            "Right mouse button": "Hold and drag to rotate scene",
            "Left / Right Arrow": "Rotate scene around Z axis",
        }
    },
    "ui":
    {
        name: "UI Controls",
        description: "The following controls allow you to manage the user interface",
        items:
        {
            "?": "Show / hide this help dialog",
        }
    },
};




// Perform any necessary computation for the next frame
//
// Apply updates to camera
CGA_BaseController.prototype.frame = function ()
{
    // Calculate time delta
    // If last update time is null, assume no time has passed
    var time = (new Date()).getTime();
    if (this.lastUpdateTime == null)
        this.lastUpdateTime = time;
    var dt = time - this.lastUpdateTime;
    this.lastUpdateTime = time;

    // Create camera command object
    var update =
    {
        rotate: { x: 0, y: 0, z: 0 },
        target: null,
        zoom: 0,
    };

    // Handle rotation
    if (this.mouseButtonState[CGA_MouseCodes.RIGHT_BUTTON])
    {
        update.rotate.x = this.mouseMotion.x;
        update.rotate.y = this.mouseMotion.y;
    }
    update.rotate.z = ((this.keyState[CGA_KeyCodes.KEY_RIGHT] ? 1 : 0) - (this.keyState[CGA_KeyCodes.KEY_LEFT] ? 1 : 0)) * dt;

    // Handle zoom
    if (this.mouseScrollMotion != NaN && this.mouseScrollMotion != undefined && this.mouseScrollMotion != 0)
    {
        update.zoom = this.mouseScrollMotion * 0.03;
        this.mouseScrollMotion = 0;
    }

    // Handle target change once per mouse down event - TODO - a better method of consuming presses would be nice
    if (this.mouseButtonState[CGA_MouseCodes.LEFT_BUTTON] && this.keyState[CGA_KeyCodes.KEY_SHIFT])
    {
        if (! this.targetUpdated)
        {
            var pick = this.mainApp.gfxEngine.objectAtPoint(this.mousePosition.x, this.mousePosition.y);
            if (pick.worldPoint != null)
            {
                update.target = pick.worldPoint;
            }
        }
        this.targetUpdated = true;
    }
    else
        this.targetUpdated = false;

    // Apply update to camera
    this.mainApp.gfxEngine.camera.update(update);

    // Clear mouse motion
    this.mouseMotion.x = 0;
    this.mouseMotion.y = 0;
};




// Handle keyboard down events
CGA_BaseController.prototype.handleKeyDown = function (e)
{
    // R - Reset scene
    if (e.keyCode == CGA_KeyCodes.KEY_R)
        this.mainApp.gfxEngine.camera.applyStoredConfiguration();

    // ? - Show help
    if (e.keyCode == CGA_KeyCodes.KEY_QUESTION_MARK)
    {
        if (!this.uiElements.helpPanel.isVisible())
        {
            var helpConfigs = this.mainApp.getControllerHelpConfigs();
            this.uiElements.helpPanel.buildUI(helpConfigs);
        }

        this.uiElements.helpPanel.toggleVisibility();
    }

    // Update key hold state
    this.keyState[e.keyCode] = true;
};




// Handle keyboard up events
CGA_BaseController.prototype.handleKeyUp = function (e)
{
    // Update key hold state
    this.keyState[e.keyCode] = false;
};




// Handle mouse down event
CGA_BaseController.prototype.handleMouseDown = function (button)
{
    // Update mouse button hold state
    this.mouseButtonState[button] = true;
};




// Handle mouse leaving canvas - stop panning and rotating
CGA_BaseController.prototype.handleMouseLeave = function ()
{
    this.mouseButtonState[CGA_MouseCodes.LEFT_BUTTON]   = false;
    this.mouseButtonState[CGA_MouseCodes.MIDDLE_BUTTON] = false;
    this.mouseButtonState[CGA_MouseCodes.RIGHT_BUTTON]  = false;
};




// Handle mouse motion - rotate if right
CGA_BaseController.prototype.handleMouseMove = function (x, y)
{
    // If mouse position is null, use given position
    if (this.mousePosition.x == null)
        this.mousePosition.x = x;
    if (this.mousePosition.y == null)
        this.mousePosition.y = x;

    // Update mouse motion
    this.mouseMotion.x += x - this.mousePosition.x;
    this.mouseMotion.y += y - this.mousePosition.y;

    // Update mouse position
    this.mousePosition.x = x;
    this.mousePosition.y = y;
};




// Handle mouse wheel - zoom
CGA_BaseController.prototype.handleMouseScroll = function (delta)
{
    this.mouseScrollMotion += delta;
};




// Handle mouse release - check if we should stop panning and rotating
CGA_BaseController.prototype.handleMouseUp = function (button)
{
    this.mouseButtonState[button] = false;
};
