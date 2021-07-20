
let C_Logic = {
	
	logic: {},
	help: {}
	
};

C_Logic.logic = {
	
	/**
	 * A function to regulate the syntax of a user inputted variable
	 * @param {variable} - The string to check
	 * 
	 * @return - An array of errors:
	 * [0] is boolean, 
	 * if [0] is false, all other elements will be error messages.
	 */
	variable_format: function(variable){
		var correctSyntax = [true];
		
		//If there is no variable declaration
		if(variable.length < 1){
			correctSyntax[0] = false;
			correctSyntax.push("Error, variable name is required.\n");

		}
		else {
			var le = variable.charAt(0);

			if( !( ( le >= 'a' && le <= 'z' ) || ( le >= 'A' && le <= 'Z') || (le === '_')) ){
				correctSyntax[0] = false;
				correctSyntax.push("Error, invalid variable name.\n");
			}

		}

		return correctSyntax;
	},
	
	
	/**
	 * A function to regulate the syntax of a user inputted variable
	 * @param {ch} - The string to check
	 * 
	 * @return - A string of errors
	 */
	char_format: function(ch){
		var TT = "";
		
		//If ch[0] is a blackslash
		if(ch[0] === '\\'){
			
			if(ch.length === 1){
				TT += 'Error, a blackslash cannot be used this way in a char quote, use \\\\ instead.';
			}
			
			else if(ch.length === 2){
				switch(ch[1]){
					case "'":
					case '"':
					case '0':
					case '?':
					case 'a':
					case 'b':
					case 'f':
					case 'n':
					case 'r':
					case 't':
					case 'v':
					case '\\':
					
					break;
					
					default:
						TT += 'Warning, unrecognized escape sequence.\n';
					break;
				}
			}
			//If ch[0] === '\\' and ch.length > 1
			else if(ch.length > 1){
				TT += 'Error, a char cannot have more than one character.\n';
			}
		
			//If ch[0] === '\\' and ch.length < 1
			else if(ch.length < 1){
				TT += 'Error, a char cannot have less than one character.\n';
			}
		}
			
		else if(ch.length === 1){
			switch(ch[0]){
				case "'":
					TT += 'Error, a single quote cannot be used this way, use \\\' instead.\n';
				break;
			}
			
		}

		//If ch[0] !== '\\' and ch.length > 1
		else if(ch.length > 1){
			TT += 'Error, a char cannot have more than one character.\n';
		}
		
		//If ch[0] !== '\\' and ch.length < 1
		else if(ch.length < 1){
			TT += 'Error, a char cannot have less than one character.\n';
		}
		
		return TT;
	},
	
	
	/**
	 * A function to regulate the syntax of a user inputted string
	 * @param {str} - The string to check
	 * 
	 * @return - A string of errors
	 */
	string_format: function(str){
		var TT = "";
		
		for(var i = 0; i < str.length; ++i){
			//If str[i] is a blackslash
			if(str[i] === '\\'){
				switch(str[i + 1]){
					case "'":
					case '"':
					case '0':
					case '?':
					case 'a':
					case 'b':
					case 'f':
					case 'n':
					case 'r':
					case 't':
					case 'v':
					case '\\':
					i++;
					break;
					
					default:
						TT += 'Warning, recognized escape sequence.\n';
					break;
				}
			} 
			//If str[i] is a quote...
			else if(str[i] === '"'){
				
				//The letter before that must be a blackslash
				switch(str[i - 1]){
					//If it is
					case '\\':
					break;
					
					//If it isn't
					default:
						TT += 'Warning, a quote cannot be used this way in a string quote, use \\" instead.\n';
					break;
				}
				
			}
			
			
			
		}
		return TT;
	},
	
	
	/**
	 * A function to regulate the syntax of a user inputted variable
	 * @param {root} - This type
	 * @param {from} - The type of the other block
	 * 
	 * @return - A string of errors
	 */
	
	type_check: function(root, from){
		if(!root || !from){
			return "";
		}
		
		let C = C_Logic;
		
		//Variable used to aggregate the list of errors, used for allocateWarning
		var TT = "";
		
		if(root !== from){
			
			if(C.help.is_of_type_number(root) && C.help.is_of_type_number(from)){
				TT += "Warning, " + root + ' to ' + from + ' is a type mismatch, data may be lost.\n';
			}
			else {
				TT += "Error, " + root + " is incompatible with " + from + ".\n";
			}
			
		}
		
		return TT;
	},
	
	
	
	
	/**
	 * A function to regulate the syntax of a user inputted pointer
	 * @param {Blockly.Block} - The block
	 * 
	 * @return - A string of errors:
	 * [0] is boolean, 
	 * if [0] is false, all other elements will be error messages.
	 */
	ptr_warnings: function(node1, node2){
		//Assume there are no errors yet
		var correctPointer = [true];
		
		C = C_Logic;
		
		if(node1 && node2){
			
			if( C.help.ptr_is_deref(this.ptrType_) && !C.help.ptr_is_compat(node1.ptrType_, node2.ptrTypes_) ){
				console.log('test');
			}
		
		}
		
	},
	
	
	
};

//List of helper functions
C_Logic.help = {
    
    /**
     * Checks if an array has an element that occurs 
     * more than once.
     * If uni is undefined, the function checks
     * the given array to see if there are any
     * repeating elements. If uni is defined,
     * 
     * @param {*} arr - The array that we're checking.
     * @param {*} uni - An element that we're specifically
     * looking for.
	 * @return True if found, false if not 
     */
	is_element_unique: function(arr, uni){
		
		if((!arr && !uni) || !arr){
			throw 'Invalid';
		}
		
		if(arr && !uni){
			for(var i = 0; i < arr.length; ++i){
				for(var j = 0; j < arr.length; ++j){
					if((i != j) && (arr[i] == arr[j])){
						return true;
					}
				}
			}
			
			return false;
		}
		
		else {
			return (arr.includes(uni));
		}
		
	},
	
    /**
     * Checks the array for positions if repeating elements
	 * 
     * 
     * @param {*} arr - The array that we're checking.
	 * @return array of integers representing the 
	 * elements of repeating elements
     */
	repeating_element_pos: function(arr){
		
		//elements to store the position of found elements
		var found = [];
		if(arr){
			
			for(var i = 0; i < arr.length; ++i){
				
				for(var j = 0; j < arr.length; ++j){
					
					if((i != j) && (arr[i] == arr[j])){
						found.push(i);
					}
					
				}
				
			}
		}
		
		return found;
	},
	
	
	
    /**
     * Checks a type to see if it is a number
     * 
     * @param {string} type - The string that we're checking
	 * @return True if a number, false if not
     */
	is_of_type_number: function(type){
		
		if(type === undefined){
			throw "Error, @param type is null or undefined.\n";
		}

		var temp = type.toLowerCase();
		
		switch(temp){
			case 'int':
			case 'size_t':
			case 'double':
			case 'short':
			case 'long':
			case 'long long':
			return true;

			default:
			return false;
		}
	},

    /**
     * Checks a type to see if it is an integer
     * 
     * @param {string} type - The string that we're checking
	 * @return True if a number, false if not
     */
	is_of_type_integer: function(type){
		
		if(type === undefined){
			throw "Error, @param type is null or undefined.\n";
		}

		var temp = type.toLowerCase();
		
		switch(temp){
			case 'int':
			case 'size_t':
			case 'char':
			case 'short':
			case 'long':
			case 'long long':
			return true;

			default:
			return false;
		}
	},

    /**
     * Checks a type to see if it is an integer (includes char and bool, but not double)
     * 
     * @param {string} type - The string that we're checking
	 * @return True if a number, false if not
     */
	is_of_type_numeral: function(type){
		
		if(type === undefined){
			throw "Error, @param type is null or undefined.\n";
		}
		
		switch(type){
			case 'int':
			case 'size_t':
			case 'char':
			case 'short':
			case 'bool':
			case 'long':
			case 'long long':
			
			return true;

			default:
			return false;
		}
	},



    /**
     * Checks a type to see if it is an integer
     * 
     * @param {string} type - The string that we're checking
	 * @return True if a number, false if not
     */
	is_of_standard_type: function(type){
		
		if(type === undefined){
			throw "Error, @param type is null or undefined.\n";
		}

		var temp = type.toLowerCase();
		
		switch(temp){
			case 'int':
			case 'size_t':
			case 'double':
			case 'char':
			case 'string':
			case 'bool':
			case 'short':
			case 'long':
			case 'long long':
			return true;

			default:
			return false;
		}
	},

    /**
     * Checks a type to see if it is numeric (holds any form of number)
     * 
     * @param {string} type - The string that we're checking
	 * @return True if a number, false if not
     */
	is_of_type_numeric: function(type){
		if(type === undefined){
			throw "Error, @param type is null or undefined.\n";
		}

		var temp = type.toLowerCase();

		switch(temp){
			case 'int':
			case 'size_t':
			case 'double':
			case 'char':
			case 'bool':
			case 'short':
			case 'long':
			case 'long long':
			return true;

			default:
			return false;
		}
	},
	
	/**
	 * Checks a pointer to see if it is a dereference type
	 * 
	 * @param {string} ptr - The string we're checking
	 * @return True if it's a dereference pointer,
	 * false if not
	 */
	ptr_is_deref: function(ptr){
		switch(ptr){
			case '*':
			case '*&':
			case '**':
			case '***':
			return true;
			
			default:
			return false;
		}
	},
	
	
	/**
	 * Checks a pointer to see if it is an address type
	 * 
	 * @param {string} ptr - The string we're checking
	 * @return True if it's an address pointer,
	 * false if not
	 */
	ptr_is_address: function(ptr){
		switch(ptr){
			case '&':
			case '*&':
			return true;
			
			default:
			return false;
		}
	},
	
	/**
	 * Checks the compatibility between two pointers
	 * 
	 * @param {string} ptr1 - The first pointer
	 * @param {string} ptr2 - The second pointer
	 * @return True if they're compatible,
	 * false if they're not
	 */
	ptr_is_compat: function(ptr1, ptr2){
		
		switch(ptr1){
			//No pointer or dereference
			case '':
			
			// '' is only compatible with &
			switch(ptr2){
				case '':
				case '&':
				return true;
				
				default:
				return false;
			}
			
			case '*':
			
			switch(ptr2){
				case '*':
				case '*&':
				return true;
				
				default:
				return false;
			}
			
			case '*&':
			
			switch(ptr2){
				case '*':
				return true;
				
				default:
				return false;
			}
			
			case '**':
			
			switch(ptr2){
				case '**':
				return true;
				
				default:
				return false;
			}
		}
	},
	
	calc_ptr_level: function(ptr){
		if(!ptr && ptr === undefined){
			throw 'invalid';
		}
		
		var ptrCount = 0;
		
		for(var i = 0; i < ptr.length; ++i){
			if(ptr.charAt(i) === '*'){
				ptrCount++;
			}
		}
		
		return ptrCount;
	}
	
};
