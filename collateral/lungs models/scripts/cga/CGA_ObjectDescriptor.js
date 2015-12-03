var CGA_ObjectDescriptor = function (id, name, filename, style, visible, data)
{
    // Validate / Set default values
    if (! id)       throw "Cannot create CGA_GeometryObject - ID not defined";
    if (! filename) throw "Cannot create CGA_GeometryObject - File name not defined";
    name = name || "Nameless";
    visible = (visible === false) ? false : true;

    // Store state
    this.id = id;
    this.name = name;
    this.style = style;
    this.filename = filename;
    this.visible = visible;
    this.data = data;

    // Store material. If no material given, use default
    this.style = {};
    if (style)
    {
        this.style.ambient   = style.ambient;
        this.style.diffuse   = style.diffuse;
        this.style.emissive  = style.emissive;
        this.style.specular  = style.specular;
        this.style.shininess = style.shininess;
        this.style.alpha     = style.alpha;
    }
    else
    {
        this.style.ambient   = "#808080";
        this.style.diffuse   = "#808080";
        this.style.emissive  = "#000000";
        this.style.specular  = "#ffffff";
        this.style.shininess = 20;
        this.style.alpha     = 1;
    }

    // Class name
    this.className = "CGA_ObjectDescriptor";
};

