/**************************************************************************
    Class - CGA_UI_HelpPanel

    Provides help information in a popup panel. Used by CGA_BaseController

    Builds content from .helpItems on controllers attached CGA_Main.
*/
var CGA_UI_HelpPanel = function(container)
{

    // Initialize member fields
    this.container = container;

    // Validate
    if (this.container == null)
        alert("Cannot create CGA_UI_HelpPanel - missing div");

    // Embellish object as UI panel
    UI_Panel.embellish(this, "CGA_UI_HelpPanel");
};




// Create user interface elements for this load progress panel.
// Called at the beginning of any load sequence to create the panel
CGA_UI_HelpPanel.prototype.buildUI = function (configs)
{
    // Merge help configs.
    var finalConfig = {};
    for (var i = 0 ; i < configs.length ; i ++)
    {
        for (var groupKey in configs[i])
        {
            // Grab group
            var grp = configs[i][groupKey];

            // Copy values / initialize group in final config
            if (! finalConfig[groupKey])        finalConfig[groupKey] = {};
            if (grp.name)                       finalConfig[groupKey].name = grp.name;
            if (grp.description)                finalConfig[groupKey].description = grp.description;
            if (! finalConfig[groupKey].items)  finalConfig[groupKey].items = {};

            for (var itemKey in grp.items)
                finalConfig[groupKey].items[itemKey] = grp.items[itemKey];
        }
    }
    console.log(finalConfig);

    // Clear out DIV
    this.clear();

    // Element - Header
    this.container.appendChild(DOMUtils.header(1, "Help"));

    for (var groupKey in finalConfig)
    {
        var cfg = finalConfig[groupKey];

        // Element - Header
        if (cfg.name)
            this.container.appendChild(DOMUtils.header(2, cfg.name));
        else
            this.container.appendChild(DOMUtils.header(2, "Un-named help group - fix in help config code"));

        // Element - Description text
        if (cfg.description)
            this.container.appendChild(DOMUtils.text(cfg.description, false, false));

        // Element - Item list
        var ul = document.createElement("ul");
        for (var itemKey in cfg.items)
        {
            var li = document.createElement("li");
            li.appendChild(DOMUtils.text(itemKey, true, false));
            li.appendChild(DOMUtils.text(" - " + cfg.items[itemKey], false, false));
            ul.appendChild(li);
        }
        this.container.appendChild(ul);
    }
};