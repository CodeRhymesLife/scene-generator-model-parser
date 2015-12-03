/**************************************************************************
    Abstract class for a simple div based UI component.
    Provides basic show / hide features so it can be controlled
*/


var UI_Panel = function()
{};




// Attach UI_Panel's members (mostly utility methods) to the attached object.
UI_Panel.embellish = function (object, type)
{
    // Validate arguments
    if (! type)
        throw "Cannot embellish object without type";

    // Log embellishment
    console.log("Embellishing " + type + " as UI panel");

    // Perform embellishment
    object.clear = this.clear;
    object.hide = this.hide;
    object.isVisible = this.isVisible;
    object.show = this.show;
    object.toggleVisibility = this.toggleVisibility;

    // Determine visibility change speed
    if (! object.VISIBILITY_SPEED)
    	object.VISIBILITY_SPEED = "slow";
};



UI_Panel.clear = function ()
{
    // Remove elements from container
    while (this.container.firstChild)
        this.container.removeChild(this.container.firstChild);

    // Remove stored elements
    if (this.htmlElements)
        this.htmlElements = {};
    if (this.uiElements)
        this.uiElements = {};
};




// Hide this UI Panel.
// - If given, run postFn when transition is complete
UI_Panel.hide = function (postFn)
{
    $(this.container)
        .fadeOut( this.VISIBILITY_SPEED )
        .promise()
        .done( function () { if (typeof postFn === 'function') postFn(); });
};




// Test whether this panel is currently visible
UI_Panel.isVisible = function ()
{
    return $(this.container).is(":visible");
};




// Show this UI Panel.
// - If given, run postFn when transition is complete
UI_Panel.show = function (postFn)
{
    $(this.container)
        .fadeIn( this.VISIBILITY_SPEED )
        .promise()
        .done( function () { if (typeof postFn === 'function') postFn(); });
};




// Toggle visibility of this UI Panel
// - If given, run postFn when transition is complete
UI_Panel.toggleVisibility = function (postFn)
{
    $(this.container)
        .fadeToggle( this.VISIBILITY_SPEED )
        .promise()
        .done( function () { if (typeof postFn === 'function') postFn(); });
};

