function is_object(x){
	return (typeof x == 'object') && !Array.isArray(x) && !(x instanceof RegExp);
}
function is_function(x){
	return typeof x == 'function';
}
function is_array(x){
	return Array.isArray(x);
}
function is_primitive(x){
	return typeof x == 'string' || typeof x == 'number' || typeof x == 'undefined' || typeof x == 'boolean'; 
}
function is_number(x){
	return typeof x == 'number';
}
function is_boolean(x){
	return typeof x == 'boolean';
}
function is_undefined(x){
	return typeof x == 'undefined';
}
function is_null(x){
	return x === null;
}
function is_string(x){
	return typeof x == 'string';
}


function is_regexp(x){
	return x instanceof RegExp;
}
function optional(pattern){
	return function (x){
		return typeof x == 'undefined' ||  match(x, pattern);
	};
}
function and(...patterns){
	return function(x){
		return patterns.reduce((a,c)=>a && match(x, c), true);
	};
}
function or(...patterns){
	return function(x){
		return patterns.reduce((a,c)=>a || match(x, c), false);
	};
}
function not(...patterns){
	let or_func = or(...patterns);
	return function(x){
		return !or_func(x);
	};
}

function type_of(x){
	if(is_primitive(x)){
		return 'primitive';
	} else if(is_array(x)){
		return 'array';
	} else if(is_regexp(x)){
		return 'regexp';
	} else if(typeof x == 'object'){
		return 'object';
	} else if(is_function(x)){
		return 'function';
	} else {
		return 'unknown';
	}
}
const dispatch_table = {
	primitive:{
		primitive: function(x, ptn){
			return x == ptn;
		},
		array: function(x, ptn){
			return false;
		},
		regexp: function(x, ptn){
			return ptn.test(x.toString());
		},
		object: function(x, ptn){
			return false;
		}
	},
	array:{
		primitive: function(x, ptn){
			return false;
		},
		array: function(x, ptn){
			function match_array(u){
				for(var j=0; j < ptn.length; ++j){
					if(match(u, ptn[j]))
						return true;
				}
				return false;
			}
			if(ptn.length > 0){
				for(var i=0; i < x.length; ++i){
					if(!match_array(x[i])){
						return false;
					}
				}	
			}
			return true;
		},
		regexp: function(x, ptn){
			return ptn.test(x.toString());
		},
		object: function(x, ptn){
			return false;
		}
	},
	regexp:{
		primitive: function(x, ptn){
			return x.toString() == ptn;
		},
		array: function(x, ptn){
			return false;
		},
		regexp: function(x, ptn){
			return x.toString() == ptn.toString();
		},
		object: function(x, ptn){
			return false;
		}
	},
	object:{
		primitive: function(x, ptn){
			return false;
		},
		array: function(x, ptn){
			return false;
		},
		regexp: function(x, ptn){
			return ptn.test(x.toString());
		},
		object: function(x, ptn){
			if(x && ptn){
				const ks = Object.keys(ptn);
				for(var i = 0; i< ks.length; ++i){
					if(!match(x[ks[i]], ptn[ks[i]])){
						return false;
					}
				}
				return true;    
			}
			return !(x || ptn);
		}
	}    
};

function match(x, ptn){
	const x_type = type_of(x);
	const ptn_type = type_of(ptn);
	if(x_type == 'unknown' || ptn_type == 'unknown'){
		return false;
	}
	if(x_type == 'function' && ptn_type == 'function'){
		return x.toString() == ptn.toString();
	}
	if(ptn_type == 'function'){
		return ptn(x);
	}
	if(x_type == 'function'){
		return false;
	}
	return dispatch_table[x_type][ptn_type](x, ptn);
}
match.is_primitive = is_primitive;
match.is_array = is_array;
match.is_function = is_function;
match.is_object = is_object;
match.is_regexp = is_regexp;
match.is_number = is_number;
match.is_boolean = is_boolean;
match.is_undefined = is_undefined;
match.is_null = is_null;
match.is_string = is_string;
match.optional = optional;
match.and = and;
match.all = and;
match.or = or;
match.any = or;
match.none = not;
match.not = not;
match.is_empty = x => (is_array(x) && x.length == 0) || (is_object(x) && Object.keys(x).length == 0) || (is_string(x) && x.length == 0);
module.exports = match;
