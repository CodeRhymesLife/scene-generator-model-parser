/**************************************************************************
    Class - AVA Picking Panel

    Shows name and links for currently hovered and selected objects
    Highlights these objects

**************************************************************************/
var AVA_PickingPanel = function (container)
{
    this.container = container;
    
    // Embellish object as UI panel
    UI_Panel.embellish(this, "AVA_PickingPanel");
    
    this.buildUI([]);
};




// Create the UI for the picking panel
AVA_PickingPanel.prototype.buildUI = function ()
{
    // Configure - Container
    this.container.style.display = "block";
	this.container.innerHTML = "";

	// Components - Links
    this.aHovered = document.createElement("a");
    this.aSelected = document.createElement("a");

    // Assemble
    this.container.appendChild(document.createTextNode("Pointing at: "));
    this.container.appendChild(this.aHovered);
    this.container.appendChild(document.createElement("br"));
    this.container.appendChild(document.createTextNode("Selected: "));
    this.container.appendChild(this.aSelected);
};




// Clear the hovered label in the picking panel
AVA_PickingPanel.prototype.clearHoveredLink = function ()
{
    this.aHovered.href = "";
    this.aHovered.innerHTML = "";
};




// Clear the selected label in the picking panel
AVA_PickingPanel.prototype.clearSelectedLink = function ()
{
    this.aSelected.hred = "";
    this.aSelected.innerHTML = "";
};




// Set the hovered label in the picking panel
AVA_PickingPanel.prototype.setHoveredLink = function (url, name)
{
    this.aHovered.href = url;
    this.aHovered.innerHTML = name;
};




// Set the selected label in the picking panel
AVA_PickingPanel.prototype.setSelectedLink = function (url, name)
{
    this.aSelected.href = url;
    this.aSelected.innerHTML = name;
};