var AVA_ContentsPanel = function (container, controller)
{
    this.container = container;
    this.controller = controller;

    // Embellish object as UI panel
    UI_Panel.embellish(this, "AVA_ContentsPanel");

    this.buildUI([]);
};




// Generate the contents of this panel from the current set of scene objects
AVA_ContentsPanel.prototype.buildUI = function (sceneObjects)
{
    var that = this;

    // Sort scene objects into new array
    sceneObjects.sort(function (a, b) { return a.name > b.name ? 1 : -1; } );

    // Clear existing UI
	this.clear();

    // Create show all button
    var div_showAll = DOMUtils.div("control_button", "", "Show all");
    div_showAll.onclick = function()
    {
        for (var i = 0 ; i < that.rows.length ; i++)
        {
            that.rows[i].sceneObj.setVisibility(true);
            that.updateRow(that.rows[i]);
        }
    };
    this.container.appendChild(div_showAll);

    // Create hide all button
    var div_hideAll = DOMUtils.div("control_button", "", "Hide all");
    div_hideAll.onclick = function()
    {
        for (var i = 0 ; i < that.rows.length ; i++)
        {
            that.rows[i].sceneObj.setVisibility(false);
            that.updateRow(that.rows[i]);
        }
    };
    this.container.appendChild(div_hideAll);

    // Create panel title
    this.container.appendChild(DOMUtils.header(1, "Contents"));

    // Add content rows
    var div_list = DOMUtils.div("object_list");
    this.rows = new Array();
    for (var i = 0 ; i < sceneObjects.length ; i++)
    {
        // Create row div
        var div_row = DOMUtils.div("object");
        if (i % 2) div_row.className += " odd";
        else       div_row.className += " even";

        // Create text label div
        var div_text = DOMUtils.div("label", "", sceneObjects[i].name);
        div_row.appendChild(div_text);
        div_row.div_text = div_text;

        // Create visibility toggle button
        var div_button = DOMUtils.div("button");
        div_button.onclick = function ()
        {
            // Toggle visiblity of object
            this.parentNode.sceneObj.toggleVisibility();

            // Toggle visiblity of button
            that.updateRow(this.parentNode);
        };
        div_row.appendChild(div_button);
        div_row.div_button = div_button;

        // Create blocking div
        var div_blocker = document.createElement("div");
        div_blocker.style.clear = "both";
        div_row.appendChild(div_blocker);

        // Add 'selection' event
        div_text.onclick = function ()
        {
            console.log(this.parentNode.sceneObj);
            that.controller.handleObjectClicked(this.parentNode.sceneObj);
        };

        // Store row div
        div_row.sceneObj = sceneObjects[i];
        this.rows[i] = div_row;
        div_list.appendChild(div_row);

        // Set visibility indication on row
        this.updateRow(div_row);
    }
    this.container.appendChild(div_list);

};




AVA_ContentsPanel.prototype.clearHighlightedLink = function ()
{
    // Clear old highlighted row
    for (var i = 0 ; i < this.rows.length ; i ++)
    {
        if (this.rows[i].highlighted)
        {
            this.rows[i].highlighted = false;
            this.updateRow(this.rows[i]);
        }
    }
};




AVA_ContentsPanel.prototype.highlightRowWithObject = function (object)
{
    // Highlight the row corresponding to this object.
    if (object != null)
    {
        for (var i = 0 ; i < this.rows.length ; i ++)
        {
            if (this.rows[i].sceneObj == object)
            {
                this.rows[i].highlighted = true;
                this.updateRow(this.rows[i]);
            }
        }
    }
};




// Set the show / hide button state for a given row.
AVA_ContentsPanel.prototype.updateRow = function(row)
{
    // Set button label
    if (row.sceneObj.isVisible())
    {
        row.div_button.innerHTML = "Hide";
        $(row.div_button).removeClass("show");
        $(row.div_button).addClass("hide");
    }
    else
    {
        row.div_button.innerHTML = "Show";
        $(row.div_button).removeClass("hide");
        $(row.div_button).addClass("show");
    }

    // Set row class
    if (row.highlighted)
        $(row).addClass("selected");
    else
    {
        $(row).removeClass("selected");

        if (row.sceneObj.isVisible())
            $(row).removeClass("invisible");
        else
            $(row).addClass("invisible");
    }
};




// Given an object, find the relevant row and set the visibility indicator
AVA_ContentsPanel.prototype.updateRowForObject = function (sceneObj)
{
    // Find the row corresponding to this object.
    for (var i = 0 ; i < this.rows.length ; i ++)
        if (this.rows[i].sceneObj == sceneObj)
            this.updateRow(this.rows[i]);
};