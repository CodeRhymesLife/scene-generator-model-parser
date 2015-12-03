Object.size = function(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};




var ArrayUtils = {
    shuffle: function (o)
    {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
};




var callAsyncFunctionChain = function (chain, data)
{
    if (! chain || ! chain instanceof Array || chain.length == 0)
        return;
    else
    {
        // Grab first item to call
        var fn = chain[0];

        // Remove first item
        _.pullAt(chain, 0);

        // Call first function, with recursive callback to here for next link in chain
        fn(function(data) { callAsyncFunctionChain(chain, data); }, data);
    }
};
