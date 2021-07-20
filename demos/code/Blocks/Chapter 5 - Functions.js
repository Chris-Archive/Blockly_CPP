
var funcHUE = 90;


Blockly.Blocks['func_parameters'] = {
	init: function() {
		
		this.pTypes_ = [
			["int", "int"], 
			["size_t", "size_t"],
			["double", "double"], 
			["char", "char"],
			["string", "string"], 
			["bool", "bool"],
			["short", "short"],
			["long", "long"],
			["long long", "long long"]
		];
		
		this.pPtrs_ = [
			["", ""], 
			["&", "&"]
		];
		
		this.appendValueInput('valinp1')
			.appendField(new Blockly.FieldDropdown([['', ''], ['const', 'const']]), 'const')
			.appendField(new Blockly.FieldDropdown(this.pTypes_), 'type')
			.appendField(new Blockly.FieldDropdown(this.pPtrs_), 'ptr')
			.appendField(new Blockly.FieldTextInput('param'), 'var');
		
    	this.setInputsInline(false);

		this.setPreviousStatement(false);
		this.setNextStatement(false);

    	this.setOutput(true);
    	this.setColour(funcHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		/**
		 * Parameter properties
		 * 
		 * [0] = constant | boolean
		 * 
		 * [1] = type | string
		 * 
		 * [2] = pointers/dereferences | string
		 * 
		 * [3] = name | string
		 * 
		 * [4] = is initialized | boolean
		 */
		this.paramProp_ = [false, "", "" ,"", true];
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.isConst_ = (this.getFieldValue('const') === 'const')
		this.typeName_ = this.getField('type').getText();
		this.addPtr_ = this.getField('ptr').getText();
		this.getVar_ = this.getField('var').getText();

		this.paramProp_[0] = this.isConst_;
		this.paramProp_[1] = this.typeName_;
		this.paramProp_[2] = this.addPtr_;
		this.paramProp_[3] = this.getVar_;
		//Default initialization to true
		this.paramProp_[4] = true;

	},

	allocateWarnings: function(){
		var TT = "";
		
		let ptr = this.getSurroundParent();
		
		if(!this.parentBlock_){
			TT += 'Error, this block has a return and must be connected.\n';
		}
		else if(ptr.type !== "func_parameters" && ptr.type !== "user_function"){
			TT += 'Error, parameter block must be connected to a parameter block or a function block.\n';
		}

		
		
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else{
			this.setWarningText(null);
		}
	}

};

Blockly.C['func_parameters'] = function(block){
	var val = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
	var code = "";
	
	var std = '';
	
	var C = C_Include;
	if(!C.using.std(this) && this.typeName_ === 'string'){
		std = 'std::';
	}
	
	if(this.getVar_.length > 0){
		
		if(this.isConst_){
			code += 'const ';
		}
		
		code += std + this.typeName_ + this.addPtr_ + ' ' + this.getVar_;
	}
	
	if(val.length > 0){
		code += ', ' + val;
	}

	return [code, Blockly.C.ORDER_NONE];
};



Blockly.Blocks['user_function'] = {
	init: function() {
		
		this.pTypes_ = [
			["int", "int"], 
			["size_t", "size_t"],
			["double", "double"], 
			["char", "char"],
			["string", "string"], 
			["bool", "bool"],
			["short", "short"],
			["long", "long"],
			["long long", "long long"]
		];

		this.appendValueInput("valinp1")
			.appendField(new Blockly.FieldDropdown([["", ""], ["const", "const"]]), 'const')
			.appendField(
				new Blockly.FieldDropdown(
					[
					["void","void"],
					["int", "int"], 
					["size_t", "size_t"],
					["double", "double"], 
					["char", "char"],
					["string", "string"], 
					["bool", "bool"],
					["short", "short"],
					["long", "long"],
					["long long", "long long"]
					]
				), 
				"myFuncReturn"
			)
			
			.appendField(new Blockly.FieldTextInput("myFunction"), "myFuncVar")
			.appendField('(');

		this.appendDummyInput()
			.appendField(')');



		this.appendStatementInput("stateinp1").setCheck(null);

		this.appendDummyInput()
			.appendField('}');

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(funcHUE);
		this.setTooltip("Creates a new function.\nLeft const - The value of this function will be constant.\nType - Choose the return type of the function. Non voids must return this data type. Voids do not return values.\nInput - The parameters of the function.)");
		this.setHelpUrl("");
		
		//Set this data type
		//to a function
		this.setDataStr('isFunc', true);

		this.setInputsInline(true);

		//Counter to count the
		//default parameter names
		this.paramCount_ = 0;

		/**
		 * Function Properties
		 * 
		 * The properties relating to the function
		 * 
		 * [0] - left constant | boolean
		 * 
		 * [1] - return type | string
		 * 
		 * [2] - pointer | string
		 * 
		 * [3] - function name | string
		 * 
		 * [4] - right constant | boolean
		 */
		this.funcProp_ = [false, "", "", "", false];

		/**
		 * Function Parameters
		 * 
		 * A 2D array used to store the information of the parameters
		 * 
		 * Example:
		 * 
		 * [0] = ["int", "*", "myParam1", true]
		 * 
		 * [1] = ["string", "&", "myParam2", false]
		 */
		this.funcParam_ = [];
		
		this.isConstructor_ = false;
		
	},

	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.typeName_ = this.getFieldValue('myFuncReturn');
		this.getVar_ = this.getFieldValue('myFuncVar');
		this.isConst_ = ( this.getFieldValue('const') == "const" );
		this.isConstructor_ = false;

		//Allocate function properties
		this.funcProp_[0] = this.isConst_;
		this.funcProp_[1] = this.typeName_;
		this.funcProp_[2] = "";
		this.funcProp_[3] = this.getVar_;
		this.funcProp_[4] = false;
		
		//Allocate function parameters
		let ptr = this.getInputTargetBlock('valinp1');
		
		this.funcParam_ = [];
		//Loop through the parameters
		while(ptr){
			//If an incorrect block is asserted
			if(ptr.type !== "func_parameters"){
				return;
			}

			//Push into the this.paramProp array
			if(ptr.paramProp_){
				this.funcParam_.push(ptr.paramProp_);
			}

			//Get the next block after that
			ptr = ptr.childBlocks_[0];
			
		}
		
		//Check whether this function is a constructor
		
		ptr = this.getSurroundParent();
		
		while(ptr){
			switch(ptr.getDataStr()){
				case 'isStruct':
				case 'isClass':
				
				if(this.getVar_ === ptr.getVar_){
					this.isConstructor_ = true;
				}
				
				break;
			}
			ptr = ptr.parentBlock_;
		}
		
	},

	allocateParameters: function(){

	},

	allocateWarnings: function(){
		var TT = '';
		let C = C_Logic;
		let Scope = C_Scope;

		var tempParam = [];

		for(var i = 0; i < this.funcParam_.length; ++i){
			tempParam.push(this.funcParam_[i][3]);
		}

		if( C.help.is_element_unique(tempParam) ){
			TT += 'Error, redeclaration of variable in parameter.\n';
		}
		
		//check if function requires return
		
		
		
		let ptr = null;
		
		//Check if a function requires a return
		if(this.typeName_ !== "void"){
			
			var returnFound = false;
			
			ptr = this.getInputTargetBlock('stateinp1');
			
			
			if(ptr){
				Scope.recursion_log(ptr, true);
				
				var checkForReturn = Scope.getBlockName();
				
				for(var i = 0; i < checkForReturn.length; ++i){

					if(checkForReturn[i] === "func_return"){
						returnFound = true;
						break;
					}

				}
			}
			
			if(!returnFound){
				TT += "Error, non-void function requires a return.\n";
			}
		}
		
		//Dealing with scope issues
		
		//Check if a function is nested
		ptr = this.getSurroundParent();
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isFunc':
				
				TT += 'Error, you cannot nest functions.\n';
				
				break;
			}
			
			
			ptr = ptr.getSurroundParent();
		}
		

		//If a function name is already taken
		ptr = this.parentBlock_;
		
		while(ptr){
			
			if(this.getVar_ === ptr.getVar_){
				
				//TT += 'Error, "' + this.getVar_ + '" has been previously declared in this scope.\n';
				
				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		
		//Check if a function has been redeclared
		
		//Check function parameter blocks
		ptr = this.getInputTargetBlock('valinp1');
		
		while(ptr){
			
			if(ptr.type !== "func_parameters"){
				TT += 'Error, only the function parameter block is allowed in the function parameter.\n';
				break;
			}
			
			ptr = ptr.childBlocks_[0];
		}
		
		//Function parameter block end
		
		//Check string Library
		
		if(this.typeName_ == "string"){
				
			//create an instance of C_Include
			var librarySearch = C_Include;
			
			var libFound = librarySearch.search_library(this, ['include_string']);
			
			if(!libFound){
				TT += "Error, <string> library must be included.\n";
			}
		}
		
		//Check if a function requires a return
		
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	},
};

Blockly.C['user_function'] = function(block) {
	var stateinp1 = Blockly.C.statementToCode(block, 'stateinp1');
	
	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	C = C_Include;
	
	// TODO: Assemble C into code variable.
	var code = '';
	var std = '';
	
	if(block.funcProp_[1] === 'string' && !C.using.std(block)){
		std += 'std::';
	}
	
	//If it's not a constructor
	if(!block.isConstructor_){
		if(block.funcProp_[0]){
			code += block.getField('const').getText() + ' ';
		}
		
		code += std + block.funcProp_[1] + block.funcProp_[2] + ' ';
	}

	//Simple name formatting
	code += block.funcProp_[3] + '(';

	code += val1;

	code += ')';
	
	code += '{\n';

	code += stateinp1;

	code += '}\n';

	code += name;

	return code;
};


Blockly.Blocks['func_parameters_call'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([["","myPtrNone"], ["&","myPtrAdd"], ["*&","myPtrAddPtr"], ["*","myPtrAdd1"], ["**","myPtrAdd2"], ["***","myPtrAdd3"]]), "myPtr")
			.appendField("Name:")
			.appendField(new Blockly.FieldVariable("myParam1"), "myParamName");

		this.setInputsInline(false);
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setColour(funcHUE);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};

Blockly.C['func_parameters_call'] = function(block) {
	var variable_myparamname = Blockly.C.variableDB_.getName(block.getFieldValue('myParamName'), Blockly.Variables.NAME_TYPE);
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var dropdown_myptr = this.getField('myPtr').getText();

	// TODO: Assemble C into code variable.
	var code = '';


	code += dropdown_myptr + ' ' + variable_myparamname;

	if(value_valinp1.length > 0){
		code += ', ' + value_valinp1;
	}

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['func_call_return'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField(new Blockly.FieldVariable("myFunction"), "myFunc");

		this.setInputsInline(false);

		this.setOutput(true, null);

		this.setColour(funcHUE);
		this.setTooltip("Calls a user defined function.\nInput - Parameters defined");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_functions.htm");
		
		this.setMutator(new Blockly.Mutator(['func_var_init_literal', 'func_parameters_call']));

	},

	mutationToDom: function(){
		var container = document.createElement('mutation');
		return container;
	},

	domToMutation: function(xmlElement){

	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock(['function_mutator']);
		containerBlock.initSvg();
		return containerBlock;
	},

	compose: function(containerBlock){
		
	}
};

Blockly.C['func_call_return'] = function(block) {
	var variable_myfunc = Blockly.C.variableDB_.getName(block.getFieldValue('myFunc'), Blockly.Variables.NAME_TYPE);
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.

	code = '';

	code += variable_myfunc;

	if(value_valinp1.length < 1){
		code += '()';
	}
	else {
		code += '(' + value_valinp1 + ')';
	}

	return [code, Blockly.C.ORDER_NONE];
};



Blockly.Blocks['func_call'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldVariable("myFunction"), "myFunc");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setColour(funcHUE);
		this.setTooltip("Calls a user defined function.\nInput - Parameters defined");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_functions.htm");
		
		this.setMutator(new Blockly.Mutator(['func_var_init_literal', 'func_parameters_call']));

	},
	
	onchange: function(){
		
		this.allocateVariables();
		this.allocateWarnings();
	},
	
	allocateVariables: function(){
		
	},
	
	allocateDropdown: function(){
		
	},
	
	allocateWarnings: function(){
		
	}
};

Blockly.C['func_call'] = function(block) {
	var variable_myfunc = Blockly.C.variableDB_.getName(block.getFieldValue('myFunc'), Blockly.Variables.NAME_TYPE);
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.

	code = '';

	code += variable_myfunc;

	if(value_valinp1.length < 1){
		code += '();\n';
	}
	else {
		code += '(' + value_valinp1 + ');\n';
	}

	return code;
};

Blockly.Blocks['func_return'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("return")
			.appendField("");
			
		this.setPreviousStatement(true, null);
		
		this.setColour(funcHUE);
		
		this.setTooltip("");
		this.setHelpUrl("");

		//the input code (in C++)
		this.input_ = "";
		this.ptrType_ = "";
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.input_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		this.getVar_ = "";
		this.isConst_ = false;
		this.ptrType_ = "";
		this.typeName_ = "";

		//Stream from and/or into the child block
		var block = this.getInputTargetBlock('valinp1');

		if(block){
			this.value_ = block.value_;
		}

		//Stream from and/or into the function surround block
		
		let ptr = this.getSurroundParent();

		while(ptr){

			if(ptr.getDataStr() === "isFunc"){
				//ptr.funcProp_ refers to the function properties in the main function block
				
				//constant value
				this.isConst_ = ptr.funcProp_[0];
				
				//Stream the type from function declaration
				this.typeName_ = ptr.funcProp_[1];
				
				//Stream the pointer from function declaration
				this.ptrType_ = ptr.funcProp_[2];
				
				//variable name
				this.getVar_ = ptr.funcProp_[3];
				
				//Stream the value to function declaration
				ptr.input_ = this.input_;
				ptr.value_ = this.value_;
			}

			ptr = ptr.getSurroundParent();
		}
		
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let block = this.getInputTargetBlock('valinp1');

		let ptr = this.getSurroundParent();

		var found = false;
		while(ptr){
			
			//check if there is a function
			if( ptr.getDataStr() === "isFunc" ){
				found = true;
			}
			
			ptr = ptr.getSurroundParent();
		}
		
		if(!found){
			TT += "Error, return must be within a function.\n";
		}

		//Warnings related to block connection

		if( block ){
			
			if(this.typeName_ === "void"){
				TT += 'Error, attempting to return data in a void function.\n';
			}
			else if(this.typeName_ !== block.typeName_){
				
				TT += 'Error, function must return type "' + this.typeName_ + '", currently returning type "' + block.typeName_ + '".\n';
				
				if(this.input_.length < 1){
					TT += 'Error, no data is being returned.\n ';
				}
				
			}
			
			
			if(this.isConst_ !== block.isConst_){
				//TT += "Error, function const and return const must be the same.\n";
			}
			
		}
		else {
			
			if( this.typeName_ !== "void" ){
				TT += 'Error, a non-void return must return a "' + this.typeName_ + this.ptrType_ + '".\n';
			}
		}
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else{
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['func_return'] = function(block) {
	var code = '';
	
	code += 'return';
	
	if(block.input_.length > 0){
		code += ' ';
		
		for(var i = 0; i < block.ptrLevel_; ++i){
			code += '*';
		}
		
		code += block.input_;
	}

	code += ';\n';

	return code;
};























