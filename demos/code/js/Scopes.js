
C_Scope = {
	
	
	/**
	 * An array to log the IDs
	 * of blocks that have
	 * already been counted.
	 * Information from Blockly.Block.id
	 * @type {array<String>}
	 */
	log: [],

	/**
	 * Names of the blocks
	 * that have been counted
	 * @type {array<String>}
	 */
	blockName: [],

	/**
	 * Names of variables if
	 * the block is a creator block
	 * such as declaring a variable
	 * or a function.
	 * 
	 * @type {array<String>}
	 */
	varName: [],

	/**
	 * List of variable declarations
	 * within this scope
	 * @type {array<String>}
	 */
	objVar: [],

	/**
	 * List of function declarations
	 * within this scope
	 * @type {array<String>}
	 */
	objFunc: [],

	/**
	 * List of data structures that
	 * have been looked at.
	 * @type {array<String>}
	 */
	dataStr: [],

	/**
	 * The variable or function declaration
	 * that is a part of an error,
	 * e.g. a redeclaration.
	 * @type {String}
	 */
	errorDef: "",

	/**
	 * Getter for log
	 * @returns {?array<String>}
	 */
	getLog: function(){
		if(this.log.length < 1){
			return null;
		}
		else {
			return this.log;
		}
	},

	/**
	 * Getter for blockName
	 * @returns {?array<String>}
	 */
	getBlockName: function(){
		if(this.blockName.length < 1){
			return null;
		}
		else {
			return this.blockName;
		}
	},

	/**
	 * Getter for varName
	 * @returns {?array<String>}
	 */
	getVarName: function(){
		if(this.varName.length < 1){
			return null;
		}
		else {
			return this.varName;
		}
	},

	/**
	 * Getter for objVar
	 * @returns {?array<String>}
	 */
	getObjVar: function(){
		if(this.objVar.length < 1){
			return null;
		}
		else {
			return this.objVar;
		}
	},

	/**
	 * Getter for objFunc
	 * @returns {?array<String>}
	 */
	getObjFunc: function(){
		if(this.objFunc.length < 1){
			return null;
		}
		else {
			return this.objFunc;
		}

	},

	/**
	 * Getter for dataStr
	 * @returns {?array<String>}
	 */
	getDataStr: function(){
		if(this.dataStr.length < 1){
			return null;
		}
		else {
			return this.dataStr;
		}
	},

	/**
	 * Getter for error
	 * @returns {?String}
	 */
	getError: function(){
		if(this.errorDef.length < 1){
			return null;
		}
		else {
			return this.errorDef;
		}
	},
	
	/**
	 * Function to push the information
	 * we need from any block during the
	 * traversal. Calls validate_node_log
	 * to check if this node has already 
	 * been checked. If it has, it pushes
	 * the information we require.
	 * @param {Blockly.Block} node - The block
	 * in the workspace that we're currently looking at.
	 * @throws Will throw an error if node is null.
	 */
	create_node_log: function(node){
		if(!node){
			throw 'Invalid';
		}
		
		if(!this.validate_node_log(node)){

			this.log.push(node.id);

			this.blockName.push(node.type);
			
			this.obj_type_log(node);

			if(node.getVar_ != undefined){
				this.varName.push(node.getVar_);
			}
		}
	},

	/**
	 * Checks the list of IDs to see if it exists.
	 * If it does, then it is checking a node
	 * that has already been checked.
	 * @param {Blockly.Block} node - The block
	 * in the workspace that we're currently looking at.
	 * @throws Will throw an error if node is null.
	 */
	validate_node_log: function(node){
		if(!node){
			throw 'Invalid';
		}
		
		if(this.log){
			return (this.log.includes(node.id));
		}
	},
	
	/**
	 * The central function that traverses
	 * through the tree of blocks using recursion.
	 * This is likely the first function used 
	 * in C_Scope.
	 * @param {*} node  - The root node to start.
	 * @param {*} end  - The node to stop
	 * @param {*} clear  - If the data arrays should be cleared.
	 */
	recursion_log: function(node, clear, end){
		
		if(!node){
			return;
		}
		
		if(node === end){
			return;
		}

		if(clear === true){
			this.log = [];
			this.blockName = [];
			this.objVar = [];
			this.objFunc = [];
			this.varName = [];
			this.dataStr = [];
		}


		if(node) {
			this.create_node_log(node);
			this.data_str_log(node);

			var i = 0;
			while(node.childBlocks_[i] != undefined){
				this.recursion_log(node.childBlocks_[i++], false);
			}
		}

	},
	
	/**
	 * Checks if the block we’re looking at is defining
	 *  the data we want, e.g. a function declaration or
	 *  a variable declaration. If it is, it pushes the 
	 * data into their respective arrays. Used to count 
	 * the variable/function declarations in the scope.
	 * @param {*} node - The block in the workspace that
	 *  we’re currently looking at.
	 */
	obj_type_log: function(node){

		if(node.getDataStr() != null){
			switch(node.getDataStr()){
				case 'isVar':
					this.objVar.push(node.getVar_);
				break;
	
				case 'isFunc':
					this.objFunc.push(node.getVar_);
				break;

			}
		}


	},

	/**
	 * Function to get the data structure type, 
	 * e.g. if this block declares a function/variable etc.
	 * @param {*} node - The block in the workspace that
	 *  we’re currently looking at.
	 */
	data_str_log: function(node){
		if(node.getDataStr() != null){
			this.dataStr.push(node.getDataStr());
		}
	},

	/**
	 * Checks to see if there are repeating declarations in 
	 * a given scope.
	 * @returns {array<Boolean, Number>} The first element is whether
	 * there exists an error. If [0] is true, [1] returns the first
	 * location of the declared variable/function etc. [2] returns the second
	 * location in this tree scope. If [0] is false, [1] and [2]
	 * both return -1.
	 */
	check_unique_array: function(){
		
		for(var i = 0; i < this.varName.length; ++i){
	
			for(var j = 0; j < this.varName.length; ++j){
				if(this.varName[i] == this.varName[j] && (i !== j)){

					this.errorDef = this.varName[i];

					return [true, i, j];
				}
			}
	
		}
	
		return [false, -1, -1];
	}
};

C_Scope.node = {
	
	/**
	 * checks if a given node block is with a scope.
	 * @param {Blockly.Blocks} node - starting node
	 * @param {!array<String>} allowedScopes - array of strings to check
	 * e.g ['isVar', 'isVec']
	 * 
	 * 
	*/
	is_in_scope: function(node, allowedScopes){
		
		let ptr = node.getSurroundParent();
		var arr = allowedScopes;
		var i = 0;
		
		while(ptr){
			switch(ptr.getDataStr()){
				case 'isFunc':
				
				return true;
			}
			
			i++;
			ptr = ptr.getSurroundParent();
		}
		
		return false;

	}
	
};





















