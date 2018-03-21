
Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        var R = [];
        for (var i = 0; i < this.length; i += chunkSize)
            R.push(this.slice(i, i + chunkSize));
        return R;
    }
});

if (typeof Object.values !== 'function') {
    Object.values = function(obj){
        obj = obj || this;
        return this.keys(obj).map(function(k){
            return obj[k];
        });
    };
};

if (typeof Object.getIDs !== 'function') {
    Object.getIDs = function(obj){
        return this.keys(obj).map(function(k){
            return +obj[k].id;
        });
    };
};