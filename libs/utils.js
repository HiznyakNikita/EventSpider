var isExistsInArray = function(arr,val){
	for (var i=0;i<arr.length;i++) { 
		if (arr[i]==val) { 
			return true;
		}
	}
	return false;
};
	
var pushNewItemsToArray = function(arr) {
	a = [];
	l = arr.length;
		
	for (var i=0; i<l; i++) {
		for (var j=i+1; j<l; j++) {
			if (arr[i] === arr[j]) {
				j = ++i;
			}
		}
		a.push(arr[i]);
	}
	return a;
};

module.exports.isExistsInArray = isExistsInArray;
module.exports.pushNewItemsToArray = pushNewItemsToArray;