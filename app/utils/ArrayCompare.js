module.exports = (
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
)();

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function test() {
    var testArray1 = [ 1, 2, 3, 4 ];
    var testArray2 = [ 1, 2, 3, 4 ];
    var ta3 = [ 'June07', 'ansible-dynamic-inventory', '' ];
    var ta4 = [ 'June07', 'ansible-dynamic-inventory', '' ];
    console.log("testArray1 equals testArray2: " + testArray1.equals(testArray2));
    console.log("ta3 equals ta4: " + ta3.equals(ta4));
}