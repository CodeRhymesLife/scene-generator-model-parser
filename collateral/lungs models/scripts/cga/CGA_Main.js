/**************************************************************************
Class - Configurable Graphics Application - Main Class

    - Main application.
    - Handles main loop
    - Registers and holds together controllers and view components

    Uses Interface Controller:
      - method frame ()
      - method handleKeyDown (e, state)
      - method handleKeyUp (e, state)
      - method handleMouseDown (state)
      - method handleMouseLeave ()
      - method handleMouseMove (state)
      - method handleMouseScroll (delta)
      - method handleMouseUp (state)
      - method handleObjectClicked (object)
      - method handleObjectHovered (object)

**************************************************************************/

// Create and Initialize Application
//
// Configuration
//   - elements - list of HTML Elements for use by application.
//     - container - HTML element to house application. If missing, an alert is shown
//   - gfx - Configuration for graphics engine. If missing, defaults will be used
var CGA_Main = function(config)
{
    // Store configuration
    this.config = config;
    this.elements = config.elements;

    // Create graphics engine
    this.gfxEngine = new CGA_GraphicsEngine(config.elements.gfx_container, this.config.gfx);

    // Set up interaction management
    this.interactionManager = new CGA_InteractionManager(this.gfxEngine, this.config.interaction);
    this.controllers = {};

    this.mainLoop();
};




// Add a controller
CGA_Main.prototype.addController = function (name, controller)
{
    if (this.controllers[name])
        console.log("Overriding controller " + name);

    this.controllers[name] = controller;
    this.interactionManager.addListener(name, controller);
};




// Collate help configurations from all registered controllers
CGA_Main.prototype.getControllerHelpConfigs = function ()
{
    var configs = [];

    for (var i in this.controllers)
        if (this.controllers[i].helpConfig)
            configs.push(this.controllers[i].helpConfig);

    return configs;
};




// Main loop
CGA_Main.prototype.mainLoop = function()
{
    for (var i in this.controllers)
        if (this.controllers[i].frame)
            this.controllers[i].frame();

	// Render scene
	this.gfxEngine.render();

	// Proceed to next frame
	var that = this;
	requestAnimationFrame(function()
    {
        that.mainLoop();
    });
};



CGA_Main.prototype.removeController = function (name)
{
    delete this.controllers[name];

    this.interactionManager.removeListener(name);
};
