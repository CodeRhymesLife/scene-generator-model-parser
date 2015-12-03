/**************************************************************************
    Class - Anatomy Viewer App Controller

    Handles basic interaction functionality
    - Hover & Selection info panel
    - Object Contents Panel

**************************************************************************/

var AVA_Controller = function(mainApp)
{
    // Store for later calls
    this.mainApp = mainApp;

    // Create state variables
    this.hoveredObj = null;
    this.selectedObj = null;

    // Create UI Elements
    this.htmlElements =
    {
        pickingPanel: document.getElementById("ava_picking"),
        contentsPanel: document.getElementById("ava_contents"),
    };
    this.uiElements = {};
    this.uiElements.pickingPanel = new AVA_PickingPanel(this.htmlElements.pickingPanel);
    this.uiElements.contentsPanel = new AVA_ContentsPanel(this.htmlElements.contentsPanel, this);
};




// Constant
// Colors for hover and selection highlight
AVA_Controller.HOVERED_EMISSIVE = new THREE.Color(0xffff00);
AVA_Controller.SELECTED_EMISSIVE = new THREE.Color(0xff6000);




// Help Item configuration
AVA_Controller.prototype.helpConfig =
{
    "ui":
    {
        items:
        {
            "C": "Toggle visibility of scene contents panel",
        },
    },
    "scene":
    {
        name: "Scene Controls",
        description: "Controls that allow you to modify the currently visible scene",
        items:
        {
            "V": "Toggle visibility of selected structure",
        },
    }
};



// Handle keyboard down events
AVA_Controller.prototype.handleKeyDown = function (e, state)
{
    // V - Toggle visibility of selected object
    if (e.keyCode == CGA_KeyCodes.KEY_V)
    {
        if (this.selectedObj)
        {
            this.selectedObj.toggleVisibility();
            this.uiElements.contentsPanel.updateRowForObject(this.selectedObj);
        }
    }

    // C - Toggle visibility of contents panel
    if (e.keyCode == CGA_KeyCodes.KEY_C)
        this.uiElements.contentsPanel.toggleVisibility();
};




// Mouse has been clicked while hovering over an object
AVA_Controller.prototype.handleObjectClicked = function(obj)
{
    // Clear old selected object highlight
    if (this.selectedObj)
        this.selectedObj.resetMaterial();
    this.uiElements.pickingPanel.clearSelectedLink();
    this.uiElements.contentsPanel.clearHighlightedLink();
    this.selectedObj = null;

    // Select new object
    if (obj)
    {
        // Save new selected object
        this.selectedObj = obj;

        // Update visual indicators
        this.selectedObj.mtl.emissive = AVA_Controller.SELECTED_EMISSIVE;
        this.uiElements.pickingPanel.setSelectedLink("", obj.name);
        this.uiElements.contentsPanel.highlightRowWithObject(obj);
    }
};




// Mouse has stopped hovering over an object
AVA_Controller.prototype.handleObjectHovered = function(obj)
{
    // If changed, clear old hovered object
    if (this.hoveredObj && this.hoveredObj != obj)
    {
        if (this.hoveredObj == this.selectedObj)
            this.hoveredObj.mtl.emissive = AVA_Controller.SELECTED_EMISSIVE;
        else
            this.hoveredObj.resetMaterial();

        this.uiElements.pickingPanel.clearHoveredLink();
    }

    // Set new hovered object
    this.hoveredObj = obj;

    // Display object hover highlight / label
    if (this.hoveredObj)
    {
        this.hoveredObj.mtl.emissive = AVA_Controller.HOVERED_EMISSIVE;
        this.uiElements.pickingPanel.setHoveredLink("", obj.name);
    }
};
