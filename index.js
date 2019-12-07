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
	const type = typeof x;
	return type == 'string' || type == 'number' || type == 'undefined' || type == 'boolean'; 
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

function is_instanceof(...Classes){
	return function(x, ...acc){
		return Classes.reduce((a, c)=>{
			return a || (x instanceof c);
		}, false);
	};
}
function is_empty(x){
	return (is_array(x) && x.length == 0) || (is_object(x) && Object.keys(x).length == 0) || (is_string(x) && x.length == 0);
}

function optional(pattern){
	return function (x, ...acc){
		return (typeof x == 'undefined') || match(x, pattern, ...acc);
	};
}
function and(...patterns){
	return function(x, ...acc){
		return patterns.reduce((a,c)=>a && match(x, c, ...acc), true);
	};
}
function or(...patterns){
	return function(x, ...acc){
		return patterns.reduce((a,c)=>a || match(x, c, ...acc), false);
	};
}
function not(...patterns){
	let or_func = or(...patterns);
	return function(x, ...acc){
		return !or_func(x, ...acc);
	};
}
function object_object(x, ptn, ...acc){
	if(x && ptn){
		const ks = Object.keys(ptn);
		for(var i = 0; i< ks.length; ++i){
			if(false === match(x[ks[i]], ptn[ks[i]], ...acc)){
				// console.log(ks[i],'mismatch');
				// console.log(x[ks[i]], '*****', ptn[ks[i]]);
				return false;
			}
		}
		return true;    
	}
	return !(x || ptn);
}

function funobj(obj){
	return function(x, ...acc){
		return object_object(x, obj, ...acc);
	};
}
function yes(){
	return true;
}
function no(){
	return false;
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
		throw Error(`Unknown type of express: ${x}`);
	}
}
const dispatch_table = {
	primitive:{
		primitive: function(x, ptn, strict){
			return strict ? x === ptn : x == ptn;
		},
		regexp: function(x, ptn, ...acc){
			return is_string(x) && ptn.test(x.toString());
		}
	},
	array:{
		array: function(x, ptn, ...acc){
			function match_array(u){
				for(var j=0; j < ptn.length; ++j){
					if(true === match(u, ptn[j], ...acc))
						return true;
				}
				return false;
			}
			if(ptn.length > 0){
				for(var i=0; i < x.length; ++i){
					if(false === match_array(x[i])){
						// console.log(x, ptn, x[i]);
						return false;
					}
				}	
			}
			return true;
		}
	},
	regexp:{
		primitive: function(x, ptn, ...acc){
			return x.toString() == ptn;
		},
		regexp: function(x, ptn, ...acc){
			return x.toString() == ptn.toString();
		}
	},
	object:{
		object: object_object
	},
	function:{
	}
};

function match(x, ptn, ...acc){
	let ptn_type = type_of(ptn);
	if(ptn_type == 'function'){
		return ptn(x, ...acc);
	}
	let f = dispatch_table[type_of(x)][ptn_type];
	return f ? f(x, ptn, ...acc) : false;
}
match.primitive 	= match.is_primitive 	= is_primitive;
match.array 		= match.is_array 		= is_array;
match.function 		= match.is_function 	= is_function;
match.object 		= match.is_object 		= is_object;
match.regexp 		= match.is_regexp	 	= is_regexp;
match.number 		= match.is_number 		= is_number;
match.boolean 		= match.is_boolean 		= is_boolean;
match.undefined 	= match.is_undefined 	= is_undefined;
match.null 			= match.is_null 		= is_null;
match.string		= match.is_string 		= is_string;
match.instanceof   	= match.is_instanceof	= is_instanceof;
match.empty			= match.is_empty 		= is_empty;
match.and 			= match.all				= and;
match.or 			= match.any				= or;
match.not 			= match.none			= not;
match.no			= no;
match.yes			= yes;
match.optional 		= optional;
match.funobj		= funobj;

module.exports		= match;

