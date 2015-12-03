/**************************************************************************
    Class - CGA_UI_LoadProgressPanel

    Implements LoadListener (see CGA_GraphicsEngine)

    Provides a graphical UI to indicate progress during object load

*/
var CGA_UI_LoadProgressPanel = function(container)
{
    // Initialize member fields
    this.container = container;
    this.fileCount = 0;

    // Validate
    if (this.container == null)
        alert("Cannot create CGA_UI_LoadProgressPanel - missing div");

    // Embellish object as UI panel
    this.VISIBILITY_SPEED = "fast";
    UI_Panel.embellish(this, "CGA_UI_LoadProgressPanel");
};



// Create user interface elements for this load progress panel.
// Called at the beginning of any load sequence to create the panel
CGA_UI_LoadProgressPanel.prototype.buildUI = function ()
{
    // UI Parts
    this.bars = new Array(this.loaderCount);
    this.bars_left = new Array(this.loaderCount);
    this.bars_right = new Array(this.loaderCount);
    this.bars_label = new Array(this.loaderCount);
    this.bar_summ_left = null;      // Green part of summary bar
    this.bar_summ_right = null;     // Red part of summary bar
    this.bar_summ_label = null;     // Text label for summary bar

    // Clear out DIV
    this.container.innerHTML = "";

    // Text header
    this.container.appendChild(document.createTextNode("Progress:"));

    // Wrapper for all bar contents
    var div_wrapper = DOMUtils.div("gen_autoMargins","","");
    this.container.appendChild(div_wrapper);

    // Summary bar - elements
    this.bar_summ_left = DOMUtils.div("bar_left","","");
    this.bar_summ_right = DOMUtils.div("bar_right","","");
    this.bar_summ_label = DOMUtils.div("bar_summ_label","", "Loaded 0 of " + this.objectCount);
    this.bar_summ_left.style.width = "0%";
    this.bar_summ_right.style.width = "100%";

    // Summary bar - assemble
    var div_bar_summ_wrapper = DOMUtils.div("bar_wrapper", "", "");
    div_bar_summ_wrapper.appendChild(this.bar_summ_left);
    div_bar_summ_wrapper.appendChild(this.bar_summ_right);
    div_wrapper.appendChild(div_bar_summ_wrapper);
    div_wrapper.appendChild(this.bar_summ_label);

    for (var i = 0 ; i < this.loaderCount ; i ++)
    {
        // Single bar - elements
        this.bars_left[i] = DOMUtils.div("bar_left","","");
        this.bars_right[i] = DOMUtils.div("bar_right","","");
        this.bars_label[i] = DOMUtils.div("bar_sub_label","","Content");

        // Single bar - assemble
        this.bars[i] = DOMUtils.div("bar_wrapper", "", "");
        this.bars[i].appendChild(this.bars_left[i]);
        this.bars[i].appendChild(this.bars_right[i]);
        div_wrapper.appendChild(this.bars[i]);
        div_wrapper.appendChild(this.bars_label[i]);
    }
};




// >> Interface - LoadListener
// Indicates that a load sequence has ended
CGA_UI_LoadProgressPanel.prototype.loadFinished = function()
{
    this.hide();
};




// >> Interface - LoadListener
// Indicates that a new load sequence has begun
// Note - does not check to see if previous load sequence has ended. This fail state should be handled by caller
CGA_UI_LoadProgressPanel.prototype.loadStarted = function (loaderCount, objectCount)
{
    this.objectCount = objectCount;
    this.objectLoadCount = 0;
    this.loaderCount = loaderCount;
    this.buildUI();
    this.show();
};



// >> Interface - LoadListener
// Indicates that an object within a load sequence has been loaded
CGA_UI_LoadProgressPanel.prototype.objectLoadFinished = function (loaderId, descriptor)
{
    this.objectLoadCount ++;

    // Update summary label
    this.bar_summ_label.innerHTML = "Loaded " + this.objectLoadCount + " of " + this.objectCount;

    // Update summary bar
    var percent = (this.objectLoadCount / this.objectCount).toFixed(2) * 100;
    this.bar_summ_left.style.width = (percent + "%");
    this.bar_summ_right.style.width = (100 - percent) + "%";

    // Hide loader bar & label
    this.bars[loaderId].style.display = 'none';
    this.bars_label[loaderId].style.display = 'none';
};




// >> Interface - LoadListener
// Indicates progress on an object within a load sequence
// Note - the may be an issue with this being triggered and rendering correctly.
// Hard to check, as progress events don't occur frequently
CGA_UI_LoadProgressPanel.prototype.objectLoadProgress = function (loaderId, loaded, total)
{
    console.log("Progress: " + loaded + " / " + total);
    var percent = (loaded / total).toFixed(2) * 100;
    this.bars_left[loaderId].style.width = percent + "%";
    this.bars_right[loaderId].style.width = (100 - percent) + "%";
};




// >> Interface - LoadListener
// Indicates that a new object within a load sequence has begun loading
CGA_UI_LoadProgressPanel.prototype.objectLoadStarted = function (loaderId, descriptor)
{
    // Update loader label
    this.bars_label[loaderId].innerHTML = loaderId + " - " + descriptor.name;

    // Show loader bar
    this.bars[loaderId].style.display = 'table';
    this.bars_label[loaderId].style.display = 'block';

    // Set loader bar to 0
    this.bars_left[loaderId].style.width = "0%";
    this.bars_right[loaderId].style.width = "100%";
};
