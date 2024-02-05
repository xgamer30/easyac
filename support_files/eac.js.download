function eac(target) {
	this.target = target;
}

eac.array = {
	hasItems: function(source) {
		return !isUndefined(source) && source.length > 0;
	},
	first: function(source, filter) {
		return eac.array.select(source, null, filter)[0];
	},
	select: function(source, selector, filter) {
		if (!selector) selector = function(v) { return v; };
		if (!filter) filter = function(v) { return true; };

		var result = [];
		$.each(source, function(i, value) {
				if (filter(value)) {
					result.push(selector(value));
				}
		});

		return result;
	},
	insert: function (source, item, index) {
    return source.splice(index, 0, item);
	},
	all: function(source, filter) {
		var result = true;
		$.each(source, function(i, el) {
			result = result && filter(el);
		});

		return result;
	}
};

eac.format = {
	milliseconds: function(value) {
		if (isUndefined(value)) {
			return '';
		}

		var milliseconds = value % 1000;
		value = (value - milliseconds) / 1000;
		var seconds = value % 60;
		value = (value - seconds) / 60;
		var minutes = value % 60;
		var hours = (value - minutes) / 60;
		return hours + 'h ' + minutes + 'm ' + seconds + 's';
	},
	number: function(num) {
		return num
			? ('' + num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, function($1) { return $1 + "." })
			: '-' ;
	}
};

eac.reflection = {
	/**
	 * Sets an attribute value in a given object based on a string defined object tree path.
	 * @param options
	 *  target
	 *    path    The path in options.value to set target.value to.
	 *    value   The object to set the attribute value on.
	 *  value     The value to set to the target value.
	 */
	setObjectAttribute: function(options) {
		var root = options.target.value || {};
		var currElement = root;
		var resourcePath = options.target.path.split('.');
		$.each(resourcePath, function(i, rsrcName) {
			if (i === resourcePath.length - 1) {  // Found the right depth, write the value.
				currElement[rsrcName] = options.value;
				return;
			}

			if (isUndefined(currElement[rsrcName])) {
				currElement[rsrcName] = {};
			}

			currElement = currElement[rsrcName];
		});

		return root;
	}
};

eac.string = {
	repeat: function(value, num ) {
		return new Array(num + 1).join(value);
	}
};

eac.url = {
	bindNavigation: function(options) {
    $(options.container).find('a').click(function(navArgs) {
      navArgs.preventDefault();
      eac.url.navigate({url: navArgs.currentTarget.href});
	    options.onNavigated();
    });
	},
	navigate: function(options) {
		var path = options.url;
		if (options.relative) {
			var relativePath = options.url.split('/');
			var upNavCount = 0;
			for (upNavCount; upNavCount < relativePath.length; ++upNavCount) {
				if (relativePath[upNavCount] != '..') break;
			}

			var url = eac.url.parse();
			path = url.path.slice(0, upNavCount);
			path = '/' + path.join('/') + (path.length ? '/' : '') + '?' + url.args.join('&') + (url.hash.length ? '#' + url.hash : '');
		}

		history.pushState(null, window.document.title, path);
	},
	setArg: function(key, value) {
		var url = eac.url.parse();
		key = key + "=";
		value = value === '' || value === null ? undefined : encodeURIComponent(value);

		var overwritten = false;
		for (var i = 0; i < url.args.length; ++i) {
			if (url.args[i].startsWith(key)) {
				if (isUndefined(value)) {
					url.args.splice(i, 1);
				} else {
					url.args[i] = key + value;
				}
				overwritten = true;
				break;
			}
		}

		if (!overwritten && !isUndefined(value)) {
			url.args[url.args.length] = key + value;
		}

		var result = url.location + '?' + url.args.join('&') + (url.hash.length ? '#' + url.hash : '');
		history.pushState(null, window.document.title, result);
	},
	setHash: function(value) {
		window.location.hash = '#' + encodeURIComponent(value);
	},
	parse: function() {
		var url = {
			location: window.location.pathname,
			path: window.location.pathname.match(/[^/]+/g),
			args: window.location.search.length ? window.location.search.split('&') : [],
			hash: window.location.hash.length ? window.location.hash.substring(1) : ''
		};

		if (url.args.length) { url.args[0] = url.args[0].substring(1); }
		for (var i = 0; i < url.args.length; ++i) {
			var keyValuePair = url.args[i].split('=');
			url.args[keyValuePair[0]] = decodeURIComponent(keyValuePair[1]);
		}

		return url;
	}
};

/**
 * Avoid browser caching when doing ajax calls.
 */
eac.ajax = function(args) {
	var doCleanup = function() {};
	if (args.loadTarget) {
		var el = $(args.loadTarget);
		var content = el.html();
		el.html('<span class="font-icon-loader"></span>');
		doCleanup = function() {
			el.html(content);
		};
	}

	var errorHandler = args.error;
	args.error = function(data) {
		console.debug("AJAX error data", data);
		doCleanup();
		if (!isUndefined(errorHandler)) {
			errorHandler(data);
		}
	};

	var successHandler = args.success;
	args.success = function(data) {
		doCleanup();
		if (!isUndefined(successHandler)) {
			successHandler(data);
		}
	};

	if (isUndefined(args.data)) { args.data = {} }
	if (isUndefined(args.dataType)) { args.dataType = "json" }
	if (isUndefined(args.type)) { args.type = "GET" }
	args.data["cache"] = new Date().getTime();
	
	$.ajax(args);
};