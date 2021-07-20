
var variableHUE = 0;


Blockly.Blocks['variable_declare'] = {
	init: function() {

		this.pConst_ = [
			['', ''],
			['const', 'const']
		];

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
			.appendField(new Blockly.FieldDropdown(this.pConst_), 'const')

			.appendField(new Blockly.FieldDropdown(this.pTypes_), "type")

			.appendField(new Blockly.FieldTextInput('myVar'), 'myVarDec')
			.setCheck(null);
			
			this.setInputsInline(false);
			this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(variableHUE);
		this.setTooltip("A standard variable declaration.\n\nConstant - Determines whether the variable is mutable (non constant), or if it cannot be changed after it has been declared (constant).");
		this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/variables/");
		
		//Sets the block type (default)
		this.typeName_ = this.getField('type').getText();
		
		//Sets the variable name
		this.getVar_ = this.getField('myVarDec').getText();

		this.isInitialized_ = false;
		
		this.isConst_ = false;

		//Strings are arrays, so if the type is a string, collect
		this.size_ = 0;

		//Strings are 1d arrays of characters
		this.dimensions_ = 1;
		
		this.setDataStr("isVar", true);
		
		this.varProp_ = [];
		
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		///// Default the values
		this.varProp_ = [];
		
		this.typeName_ = this.getField('type').getText();
		
		this.getVar_ = this.getField('myVarDec').getText();

		this.isInitialized_ = false;

		this.value_ = "";

		this.size_ = 0;
		
		this.isConst_ = ( this.getFieldValue('const') === 'const' );
		
		this.isNull_ = false;
		
		this.ptrLevel_ = 0;
		
		/////
		
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		//
		let ptr = this.getInputTargetBlock('valinp1');

		if(ptr){
			this.value_ = ptr.value_;
			
			//If it's null
			this.isNull_ = ptr.isNull_;
		}

		if(val1.length > 0){
			this.isInitialized_ = true;
		}
		
		if(this.typeName_ === "string"){
			this.size_ = this.value_.length;
		}
		
		//Array with variable properties
		this.varProp_[0] = this.isConst_;
		this.varProp_[1] = this.typeName_;
		this.varProp_[2] = this.ptrType_;
		this.varProp_[3] = this.getVar_;

	},

	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		let block = this.getInputTargetBlock('valinp1');
		
		//Declare a string that will aggregate all warnings and errors
		var TT = "";
		
		let C = C_Logic;
		
		if(this.getVar_.length > 0){
			
			var errors = C.logic.variable_format(this.getVar_);
			
			if(!errors[0]){
				for(var i = 1; i < errors.length; ++i){
					TT += errors[i];
				}
			}
		}
		else {
			TT += "Error, variable name required.\n";
		}
		
		if(val1.length < 1 && this.isConst_){
			TT += 'Error, const variable requires initialization.\n';
		}

		let ptr = this.getInputTargetBlock('valinp1');

		//Errors pertaining to type comparisons
		if(ptr){
			
			//Type checking
			TT += C.logic.type_check(this.typeName_, ptr.typeName_);

		}
		
		//Error section dealing with scope conflicts (such as redeclarations)
		ptr = this.parentBlock_;

		while(ptr){

			if(ptr.getDataStr() === "isVar" && ptr.getVar_ === this.getVar_){
				TT += 'Error, variable "' + this.getVar_ + '" has already been declared in this scope.\n';

				break;
			}

			ptr = ptr.parentBlock_;
		}
		
		/*
			library search start
		*/
		
		if(this.typeName_ === "string"){
			var librarySearch = C_Include;
		
			var libFound = librarySearch.search_library(this, ['include_iostream', 'include_string']);
		
			if(!libFound){
				TT += "Error, <iostream> or <string> library must be included.\n";
			}
		}
		
		/*
			Library Search end
		*/

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	},

	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		//Create the option to automate a string library creation
		if(this.typeName_ === "string" && !libFound){
			automate_library_string = {
				text: "include <string>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_string');
					let ptr = BlockScope;

					while(ptr){
						//if we're at the top
						if(!ptr.parentBlock_){
							newBlock.previousConnection.connect(ptr.previousConnection.targetConnection);
							newBlock.nextConnection.connect(ptr.previousConnection);
							newBlock.initSvg();
							newBlock.render();

							return;
						}
	
						ptr = ptr.parentBlock_;
					}
	
				}

			}
			options.push(automate_library_string);
		}

	}

};

Blockly.C['variable_declare'] = function(block) {
	let blockCheck = block.getInputTargetBlock('valinp1');
	//To check namespaces
	var C = C_Include;
	var CLogic = C_Logic;
	
	var dropdown_myvartype = this.getField('type').getText();

	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	
	var code = '';
	
	var std = '';
	var quote = '';

	if(this.isConst_){
		code += 'const ';
	}
	
	if(!C.using.std(block) && dropdown_myvartype === 'string'){
		std = 'std::';
	}
	
	code += std + dropdown_myvartype + block.ptrType_ + ' ' + block.getVar_;
	
	//If the block is connected
	if(blockCheck){
		
		//If the block is a pointer
		switch( block.ptrType_ ){
			//If the block is a pointer
			case '*':
			case '*&':
			
			if(blockCheck.isNull_){
				code += ' = ' + val1;
			}
			else {
				code += ' = new ' + std + dropdown_myvartype + '(' + quote + val1 + quote + ')';
			}
			
			
			break;
			
			case '**':
			
			if(blockCheck.isNull_){
				code += ' = ' + val1;
			}
			else {
				code += ' = new ' + std + dropdown_myvartype + '*(new ' + std + dropdown_myvartype + '(' + quote + val1 + quote + ')' + ')';
			}
			
			
			
			break;
			
			default:
			
			code += ' = ' + quote + val1 + quote;
			
			break;
		}
		
	}
	
	code += ';\n';
	
	return code;
};

//Initialize the variable. Can be of any time. The code is a string literal.
Blockly.Blocks['var_initialization'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("type: ")
			.appendField(new Blockly.FieldDropdown(
				[
				["int","int"], 
				["size_t","size_t"], 
				["double","double"], 
				["char","char"], 
				["string","string"], 
				["bool","bool"], 
				["short","short"], 
				["long", "long"], 
				["long long", "long long"]
				]), 
				"type");

		this.appendDummyInput()
			.appendField("input:")
			.appendField(new Blockly.FieldTextInput(""), "text1");

		this.setOutput(true, null);
		
		this.setInputsInline(true);
		this.setColour(variableHUE);

		this.setTooltip("A block used to initialize variables.");

		this.setHelpUrl("");
	},
	
	onchange: function(){

		//Update the type

		//Set the output type of the block
		//this.setOutput(this.typeName_);
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.value_ = this.getField('text1').getText();
		this.typeName_ = this.getField('type').getText();
		
		this.isInitialized_ = (this.value_.length > 0);

		if(this.typeName_ == 'double'){

			if( this.value_.length > 0 && !this.value_.includes('.') ){
				this.value_ += '.0';
			}
			
			if( this.value_.length > 0 && this.value_.charAt(this.value_.length - 1) == '.' ){
				this.value_ += '0';
			}

		}

	},
	
	allocateWarnings: function(){
		var inp = this.getField('text1').getText();

		var C = C_Logic;
		
		//Tooltip for warnings
		var TT = '';
		
		if(isNaN(inp) == true && inp.length > 0 && (this.typeName_ == 'int' || this.typeName_ == 'size_t' || this.typeName_ == 'short' || this.typeName_ == 'long' || this.typeName_ == 'long long')){
			
			TT += 'Error, "' + inp + '" is not a number.\n';
		}
		else {
			var x = +inp;

			if(this.typeName_ == 'int' || this.typeName_ == 'size_t'){
				if(inp.indexOf('.') > -1){
					TT += 'Error, "' + this.typeName_ + '" cannot have decimal places.\n';
				}
	
			}
			if(this.typeName_ == 'size_t'){
				if(inp.indexOf('-') > -1){
					TT += 'Error, "' + this.typeName_ + '" is unsigned and cannot be negative.\n';
				}
			}
			
			if(this.typeName_ == 'double'){
				
			}

			if(this.typeName_ == 'short'){
				if(x > 32767){
					TT += 'Warning, "' + inp + '" is above the range of "' + this.typeName_ + '" (32767). An overflow will result.\n';
				}
				if(x < -32768){
					TT += 'Warning, "' + inp + '" is below the range of "' + this.typeName_ + '" (-32768).  An underflow will result.\n';
				}
			}

			if(this.typeName_ == 'long'){
				if(x > 4294967295){
					TT += 'Warning, "' + inp + '" is above the range of "' + this.typeName_ + '" (4294967295 or 2^32). An overflow will result.\n';
				}
				if(x < -4294967296){
					TT += 'Warning, "' + inp + '" is below the range of "' + this.typeName_ + '" (-4294967296 or -2^32 - 1).  An underflow will result.\n';
				}
			}

			if(this.typeName_ == 'long long'){
				if(inp.length >= 20){
					TT += 'Warning, "' + inp + '" is approximately out of the range of "' + this.typeName_ + '" (2^64).\n';
				}
			}
		}
		
		//Non number types
		switch(this.typeName_){
			case 'char':
			
				TT += C.logic.char_format(inp);

			break;

			case 'string':
				
				TT += C.logic.string_format(inp);
				
			break;

			case 'bool':
				if(inp != 'true' && inp != 'false' && inp != '0' && inp != '1'){
					TT += 'Error, "' + inp + '" is not of type ' + this.typeName_ + '.\n';
				}
			break;
		}

		//If the type is a number
		if(C.help.is_of_type_number(this.typeName_)){
			if(isNaN(inp)){
				TT += 'Error, invalid characters found in number type.\n';
			}

			if(inp.length > 0 && isNaN( inp[inp.length - 1] ) ){
				TT += 'Error, final character for number types must be a digit.\n';
			}
		}


		if(!this.parentBlock_){
			TT += 'Block warning, this block has a return and must be connected.\n';
		}
		
		/*
			Library search start
		*/
		
		if(this.typeName_ == "string"){
			var librarySearch = C_Include;
		
			var libFound = librarySearch.search_library(this, ['include_iostream', 'include_string']);
			
			if(!libFound){
				TT += "Error, <iostream> or <string> library must be included.\n";
			}
		}
		
		/*
			Library search end
		*/

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['var_initialization'] = function(block) {
	var dropdown_drop1 = this.getField('type').getText();
	
	// TODO: Assemble C into code variable.
	var code = '';

	if(block.value_ && block.value_.length > 0){
		
		if(dropdown_drop1 == 'char'){
			code += "'" + block.value_ + "'";
		}
		else if(dropdown_drop1 == 'string'){
			code += '"' + block.value_ + '"';
		}
		else {
			code += block.value_;
		}

	}
	else if((block.value_ || !block.value_.length > 0) && dropdown_drop1 === "string"){
		code += '""';
	}

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['var_change'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("increment");
		
		this.appendValueInput("valinp2")
			.setCheck(null)
			.appendField("by");
			
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		
		this.setInputsInline(true);
		
		// this.setColour(variableHUE);
		// change color to match math color
		this.setColour(mathHUE);
		this.setTooltip("Add the variable.");
		this.setHelpUrl("");
		
		this.valinp1_;
		this.valinp2_;
		
	},
	
	onchange: function(){
		this.valinp1_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		this.valinp2_ = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let ptr = this.getSurroundParent();
		
		var condition;
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isVar':
				
				
				condition = ptr.typeName_ !== "int" ||
				ptr.typeName_ !== "size_t" ||
				ptr.typeName_ !== "short" ||
				ptr.typeName_ !== "long" ||
				ptr.typeName_ !== "long long";
				
				(ptr.getVar_ === this.getVar_ && condition) ? ( 
					TT += "Warning, you cannot increment a non-number variable.\n"
				) : (0);
				
				
				break;
			}
			
			ptr = ptr.getSurroundParent();
		}
		
		if(this.valinp1_.length < 1){
			TT += "Error, variable required for incrementation.\n";
		}
		if(this.valinp2_.length < 1){
			TT += "Error, number required for incrementation.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	

};

Blockly.C['var_change'] = function(block) {
	// TODO: Assemble C into code variable.
	var code = '';
	
	//Increments variable
	
	if(this.valinp1_ && this.valinp2_ && this.valinp1_.length > 0 && this.valinp2_.length > 0){
		code += this.valinp1_ + " = " + this.valinp1_ + " + " + this.valinp2_ + ';\n';
	}
	
	return code;
};

Blockly.Blocks['var_reinit'] = {
	init: function() {
			
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("Set");
			
		this.appendValueInput("valinp2")
			.setCheck(null)
			.appendField("to");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(variableHUE);
		this.setTooltip("Sets the variable.");
		this.setHelpUrl("");
		
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
		
		let block1 = this.getInputTargetBlock('valinp1');
		let block2 = this.getInputTargetBlock('valinp2');
	},

	allocateValues: function(){
		this.typeName_ = "";
		let block = this.getInputTargetBlock('valinp1');
		
		
		if(block){
			this.typeName_ = block.typeName_;
		}
	},

	allocateWarnings: function(){
		var TT = "";

		//Input the two input blocks in the array
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		//To compare values, the second block must have an input
		if(block[1]){

			if(block[0].typeName_ !== block[1].typeName_){
				TT += 'Error, first input is of type "' + block[0].typeName_ + '", second input is of type "' + block[1].typeName_ + '".\n';
			}

		}


		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}

	}
};

Blockly.C['var_reinit'] = function(block) {
	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var val2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';
	
	if(val1.length > 0 && val2.length > 0){
		if(val1 === val2){ code += 'this->'; }
		
		//output myVar and initialization.
		code += val1 + " = " + val2 + ';\n';
	}
	
	return code;
};











