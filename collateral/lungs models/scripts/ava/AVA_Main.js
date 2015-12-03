var AVA_Main = function(cgaApp, descriptors)
{
    // Create and store components
    this.cgaApp = cgaApp;
    this.controller = new AVA_Controller(cgaApp);

    // Register controller
    cgaApp.addController("ava", this.controller);

    // Load objects
    var that = this;
    cgaApp.gfxEngine.addSceneObjects(descriptors, function ()
    {
        // Configure camera, if necessary
        if (!cgaApp.config.gfx.camera)
            cgaApp.gfxEngine.configureCameraBasic();

        that.controller.uiElements.contentsPanel.buildUI(that.cgaApp.gfxEngine.scene.getObjects());
    });
};
