window.isUndefined = function(obj) { return obj === void 0; };
window.htmlEncode = function(value) { return $('<div/>').text(value).html(); };

window.printStackTrace = function() {
	var e = new Error('dummy');
	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		.replace(/^\s+at\s+/gm, '')
		.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
	console.debug(stack);
};

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

if (typeof String.prototype.string != 'function') {
	String.prototype.insert = function(idx, value) {
		return (this.slice(0, idx) + value + this.slice(idx));
	};
}

if (typeof String.prototype.string != 'function') {
	String.prototype.contains = function(value) {
		return this.indexOf(value) !== -1;
	};
}

if (window.isUndefined(window.location.query)) {
	new function () {
	  // This function is anonymous, is executed immediately and 
	  // the return value is assigned to QueryString!
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]], pair[1] ];
		  query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
		  query_string[pair[0]].push(pair[1]);
		}
	  } 
	  
	  window.location.query = query_string;
	}();
}