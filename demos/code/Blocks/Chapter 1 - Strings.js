
var stringHUE = 160;

Blockly.Blocks['printf_mutator'] = {
	init: function(){

		this.appendDummyInput()
			.appendField('printf');

		this.appendStatementInput('STACK')
			.setCheck(null);
		
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		
		this.setColour(stringHUE);
		this.setTooltip('');
		
	},
	
	onchange: function(){
		
	}
};


//Block to add a string literal
Blockly.Blocks['printf_add'] = {
	init: function(){
		
		this.appendDummyInput('duminp1')
			.appendField('add');
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		
		this.setInputsInline(true);
		
		this.setColour(stringHUE);
		this.setTooltip('');
		
	}
};

Blockly.Blocks['printf'] = {
	init: function() {
		this.appendValueInput("valinp0")
			.setCheck(null)
			.appendField("printf");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(stringHUE);
		this.setTooltip("Outputs the input into the output stream. \nRequires - <iostream>");
		this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/basic_io/");
		
		this.setMutator(new Blockly.Mutator(['printf_add']));
	
		//count of added couts in the stream
		this.printfCount_ = 0;
	},
	
	mutationToDom: function(){
		if(!this.printfCount_){
			return null;
		}
		var container = document.createElement('mutation');

		if(this.printfCount_){
			container.setAttribute('printadd', this.printfCount_);
		}
		
		return container;
	},

	domToMutation: function(xmlElement){
		this.printfCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);

		for(var i = 1; i <= this.printfCount_;  ++i){
			this.appendValueInput('valinp' + i).setCheck(null).appendField('').setAlign(Blockly.ALIGN_RIGHT);
		}

	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('printf_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;

		for(var i = 1; i <= this.printfCount_; ++i){
			var add = workspace.newBlock('printf_add');
			add.initSvg();
			
			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		return containerBlock;
	},

	compose: function(containerBlock){
		for(var i = this.printfCount_; i > 0; i--){
			this.removeInput('valinp' + i);
		}

		this.printfCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'printf_add':
					this.printfCount_++;
					
					var printInput = this.appendValueInput('valinp' + this.printfCount_)
						.setCheck(null).appendField('').setAlign(Blockly.ALIGN_RIGHT);

					if(clauseBlock.valueConnection_){
						printInput.connection.connect(clauseBlock.valueConnection_);
					}
				break;

				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection 
			&& clauseBlock.nextConnection.targetBlock();
		}
	},

	saveConnections: function(containerBlock){
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		var i = 1;
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'printf_add':
					var inputPrint = this.getInput('valinp' + i);

					clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;

					clauseBlock.statementConnection_ = i++;

					break;

				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection 
			&& clauseBlock.nextConnection.targetBlock();
		}
	},

	onchange: Blockly.Blocks.requireInFunction,
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateFormat: function(type){
		
		switch(type){
			
			case 'int':
			case 'bool':
				return "%d";
				
			
			case 'size_t':
				return "%u";
				
			
			case 'double':
				return "%f";
				
			
			case 'char':
				return "%c";
				
			
			case 'string':
				return "%s";
				
			
			case 'short':
				return "%i";
				
			
			case 'long':
			case 'time_t':
				return "%ld";
				
			
			case 'long long':
				return "%lld";
				
			default:
				return '%d';
			break;
		}
		
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_iostream']);
		
		if(!libFound){
			TT += "Error, <iostream> library must be included.\n";
		}
		
		//Check all the input types connected to printf
		for(var i = 0; i <= this.printfCount_; ++i){
			let block = this.getInputTargetBlock('valinp' + i);

			if(block){
				
				switch(block.typeName_){
					case 'Time_t':
						TT += 'Warning, "Time_t" is not compatible with printf, using "unsigned long" instead.\n';
					break;
				}

			}
		}



		//Check if this block is in a proper scope

		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//End block scope check
		
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
		var libFound = librarySearch.search_library(this, ['include_iostream']);
		
		//Create the option to automate a string library creation
		if(!libFound){
			automate_library_iostream= {
				text: "include <iostream>",
				enabled: true,
				
				callback: function(){
					//Create the iostream block
					var newBlock = BlockScope.workspace.newBlock('include_iostream');

					//ptr is now this block
					let ptr = BlockScope;

					//Loop through the block tree, so we can include all the way at the top
					while(ptr){

						//if we're at the top
						if(!ptr.parentBlock_){
							//Attach block to tree
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
			options.push(automate_library_iostream);
		}

	}
};

Blockly.C['printf'] = function(block) {
	var code = "";

	//The code representing %s, %d, etc
	var str = [];
	//The code in the format section
	var format = [];
	//
	var formattedCode = [];

	code += 'printf("';


	for(var i = 0; i <= block.printfCount_; ++i){
		var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);

		let ptr = block.getInputTargetBlock('valinp' + i);

		if( ptr && ptr.type !== "get_input"){
			
			if(arg.length > 0){
				str.push(block.allocateFormat(ptr.typeName_));
				formattedCode.push(block.allocateFormat(ptr.typeName_))
				format.push(arg);
			}
			
		}
		else {
			formattedCode.push(arg);
		}

	}
	
	for(var i = 0; i < formattedCode.length; ++i){
		code += formattedCode[i];
		
		if(formattedCode[i].length < 1){
			code += '\\n';
		}

	}
	
	code += '"';
	
	
	if(format.length > 0){
		code += ', ';

		for(var i = 0; i < format.length; ++i){
			if(str[i] === "%s"){
				var arg = this.getInputTargetBlock('valinp' + (i + 0) );
				
				if(arg && arg.isGetter_){
					format[i] += ".c_str()";
				}
				
			}
			
			code += format[i];

			if(i < format.length - 1){
				code += ', ';
			}

		}

	}

	code += ');\n';
	
	return code;
};

Blockly.Blocks['to_string'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("to_string(");

		this.appendDummyInput()
			.appendField(")");

		this.setInputsInline(true);
		this.setOutput(true);
		this.setColour(stringHUE);

		this.setTooltip("Turns any number type into a string. \nAccepted number types: int, long, float, double, unsigned\nRequires - <string>\nNote - to_string can accept characters.");

		this.setHelpUrl("http://www.cplusplus.com/reference/string/to_string/");
		
		this.typeName_ = "string";
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			this.value_ = block.value_;
		}
	},

	allocateWarnings: function(){
		var TT = "";
		
		//Check library starts
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		if(!libFound){
			TT += "Error, <string> library must be included.\n";
		}
		//Check library end
		
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			C = C_Logic;

			if( !C.help.is_of_type_number(block.typeName_) && block.typeName_ !== "bool"){
				TT += 'Error, to_string parameter requires a number\n';
			}
		}
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}

		//scope check end
		
		


		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['to_string'] = function(block) {
	var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';
	var std = '';

	C = C_Include;
	if(!C.using.std(block)){
		std += 'std::';
	}

	code += std + 'to_string(' + value_name + ')';

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['string_size'] = {
	init: function() {
		
		this.appendValueInput('valinp1')
			.setCheck(null);

		this.appendDummyInput()
			.appendField(".size()", "size");
			
		this.setOutput(true, null);
		this.setColour(stringHUE);
		this.setTooltip("Returns the amount of characters in a string.\nReturns - Int or Size_t\nRequires - <string>\nInput - String");
		this.setHelpUrl("http://www.cplusplus.com/reference/string/string/size/");
		
		this.isInitialized_ = false;
		
		this.typeName_ = "size_t";
		
		this.isGetter_ = true;
		
	},

	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		let C = C_Logic;
		var block = this.getInputTargetBlock('valinp1');
		
		this.getVar_ = "";
		this.ptrType_ = "";
		this.isInitialized_ = "";
		this.ptrLevel_ = 0;
		
		if(block){
			this.getVar_ = block.getVar_;
			this.ptrType_ = block.ptrType_;
			this.isInitialized_ = block.isInitialized_;
		}
		
		if(this.ptrLevel_ < 1){
			this.setFieldValue(".size()", "size");
		}
		else {
			this.setFieldValue("->size()", "size");
		}

	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		let block = this.getInputTargetBlock('valinp1');
		var TT = "";	
		
		if(val1.length > 0){

			if(!this.isInitialized_){
				//TT += "Warning, returning the size of an uninitialized variable may produce undefined results.\n";
			}
			if(block){
				if(block.typeName_ !== "string"){
					TT += 'Error, variable "' + val1 + '" must be a string.\n';
				}
			}
			
			if(!block.isGetter_){
				TT += "Error, a literal cannot be used here.\n";
			}
		}
		else {
			TT += "Error, .size() requires a string variable.\n";
		}

		
		//include library string
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		if(!libFound){
			TT += "Error, <string> library must be included.\n";
		}
		//include library end
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}

		//scope check end

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['string_size'] = function(block) {
	var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
	var code = '';

	if(val1.length > 0){
		code += val1;
		
		if(this.ptrLevel_ > 0){
			code += '->';
		}
		else {
			code += '.';
		}
		
		code += 'size()';
	}

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['concat_mutator'] = {
	init: function(){

		this.appendDummyInput()
			.appendField('stack');

		this.appendStatementInput('STACK')
			.setCheck(null);

		
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(stringHUE);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};

Blockly.Blocks['concat_add'] = {
	init: function(){
		this.appendDummyInput()
			.appendField('add');

		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(stringHUE);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};

Blockly.Blocks['var_concatenate'] = {
	init: function() {
		this.appendValueInput("value0")
			.appendField('(concatenate string)')
			.setCheck(null);

		this.appendValueInput("valinp0")
			.appendField("+=")
			.setAlign(Blockly.ALIGN_RIGHT)
			.setCheck(null);

		this.setInputsInline(true);
		this.setOutput(false);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(stringHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		this.setMutator(new Blockly.Mutator(['concat_add']));

		this.concatCount_ = 0;

		this.isInitialized_ = false;
	},
	
	mutationToDom: function(){
		if(!this.concatCount_){
			return null;
		}
		var container = document.createElement('mutation');

		if(this.concatCount_){
			container.setAttribute('concatadd', this.concatCount_);
		}
		
		return container;
	},

	domToMutation: function(xmlElement){
		this.concatCount_ = parseInt(xmlElement.getAttribute('concatadd'), 10);

		for(var i = 1; i <= this.concatCount_;  ++i){
			this.appendValueInput('valinp' + i)
				.setCheck(null)
				.appendField('+')
				.setAlign(Blockly.ALIGN_RIGHT);
		}
	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('concat_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;

		for(var i = 1; i <= this.concatCount_; ++i){
			var add = workspace.newBlock('concat_add');
			add.initSvg();
			
			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		return containerBlock;
	},

	compose: function(containerBlock){

		for(var i = this.concatCount_; i > 0; i--){
			this.removeInput('valinp' + i);
		}

		this.concatCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'concat_add':
						this.concatCount_++;
					
						var concatInput = this.appendValueInput('valinp' + this.concatCount_)
							.setCheck().appendField('+').setAlign(Blockly.ALIGN_RIGHT);

						if(clauseBlock.valueConnection_){
							concatInput.connection.connect(clauseBlock.valueConnection_);
						}

				break;

				default:
						throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection 
			&& clauseBlock.nextConnection.targetBlock();
		}
	},

	saveConnections: function(containerBlock){
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		var i = 1;
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'concat_add':
					var inputPrint = this.getInput('valinp' + i);
					clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;
					clauseBlock.statementConnection_ = i++;
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection 
			&& clauseBlock.nextConnection.targetBlock();
		}
	},
	
	onchange: function(){

		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode(this, 'value0', Blockly.C.ORDER_NONE);
		this.ptrLevel_ = 0;
		this.isNull_ = false;
		
		let block = this.getInputTargetBlock('value0');
		
		
		if(block){
			this.typeName_ = block.typeName_;
		}
	},

	allocateWarnings: function(){
		let block = this.getInputTargetBlock('value0');
		
		var TT = "";
		
		for(var i = 0; i < this.concatCount_.length; ++i){
			//Since there is already 1 default input, start with 1
			if(this.inputList[1 + i].connection.targetConnection && this.inputList[1 + i].connection.targetConnection.sourceBlock.typeName_ !== "string"){

				TT += "Error, concatenate #" + (i + 1) + "must be a string.\n";

			}
		}
		
		//If there is an invalid variable
		if(this.getVar_ && !this.getVar_.length > 0){
			TT += "Error, you must concatenate a variable.\n";
		}
		
		//If the type is not a string
		if(this.typeName_ !== "string" && this.typeName_.length > 0){
			TT += 'Error, you must concatenate a string type, current type: "' + this.typeName_ + '". \n';
		}

		//check to make sure the block is in a function
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		if(block){
		
			if(block.isConst_){
				TT += 'Error, cannot modify a constant.\n';
			}

			
		}

		// Check concatenation type
		for(var i = 1; i <= this.concatCount_ + 1; ++i){
			var blockCheck = this.inputList[i].connection.targetConnection;

			if(blockCheck && blockCheck.sourceBlock_.typeName_ !== "string"){
				TT += 'Error, concatenate input #' + i + ' is of type "' + blockCheck.sourceBlock_.typeName_ + '", must be of type "String".\n';
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

Blockly.C['var_concatenate'] = function(block) {
	var code = '';

	//generate code if the base variable exists
	if(block.getVar_.length > 0){
		
		//generate indirection if we need it
		for(var i = 0; i < block.ptrLevel_; ++i){
			code += '*';
		}

		code += block.getVar_;
		
		code += " += ";
		
		//generate the code format 
		for(var i = 0; i <= block.concatCount_; ++i){
			var temp = Blockly.C.valueToCode(block, 'valinp' + i.toString(), Blockly.C.ORDER_NONE);
			
			if(!temp.length > 0){
				code += '""';
			}
			else {
				code += temp;
			}


			if(i < block.concatCount_){
				code += " + ";
			}
			
		}

		code += ";\n";
	}

	// TODO: Change ORDER_NONE to the correct strength.
	return code;
};

Blockly.Blocks['string_at'] = {
	init: function(){
		
		this.appendValueInput('valinp1')
			.setCheck(null);
		
		this.appendValueInput('valinp2')
			.setCheck(null)
			.appendField('.at(');
			
		this.appendDummyInput('duminp1')
			.appendField(')');
		
		this.setOutput(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(stringHUE);
		
		this.typeName_ = "char";
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	},
	
	allocateWarnings: function(){
		//Helper functions to deal with C logic
		let C = C_Logic;
		
		//The parameter block
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		var TT = "";
		
		//If the block does not have a left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable input
		if(this.getVar_.length > 0){
			
			if(block[0].typeName_ !== "string"){
				TT += 'Error, a string variable is required, current type: "' + block[0].typeName_ + '".\n';
			}
			
			if(!block[0].isGetter_){
				TT += "Error, a literal cannot be used here.\n";
			}
			
		}
		//If there is not a variable
		else {
			TT += 'Error, .at() requires a variable.\n';
		}
		
		//If .at() has a block inside of its parameter
		if(block[1]){
			if(!C.help.is_of_type_number(block[1].typeName_)){
				TT += 'Error, .at() parameter requires a number, current type: "' + block.typeName_ + '".\n'
			}
		}
		else {
			TT += 'Error, a parameter input is required.\n';
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['string_at'] = function(block){
	var val2 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	var code = "";
	
	if(this.getVar_.length > 0){
		code += this.getVar_ + '.at(' + val2 + ')';
	}
	
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['string_pushback'] = {
	init: function(){
		
		this.appendValueInput('valinp1')
			.setCheck(null);
		
		this.appendValueInput('valinp2')
			.setCheck(null)
			.appendField('.push_back(');
			
		this.appendDummyInput('duminp1')
			.appendField(')');
		
		this.setOutput(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(stringHUE);
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			this.typeName_ = block.typeName_;
		}
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
		
		//Helper functions to deal with C logic
		var C = C_Logic;
		
		//The parameter block
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		var TT = "";
		
		//If the block does not have a left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable input
		if(this.getVar_.length > 0){
			
			if(block[0]){
				if(!block[0].isGetter_){
					TT += "Error, a literal cannot be used here.\n";
				}
			}
			
			//If .push_back() has a block inside of its parameter
			if(block[1]){
				if(block[0].typeName_ !== "string"){
					TT += 'Error, variable type must be a "string".\n';
				}
			
				if(block[1].typeName_ !== "char"){
					TT += 'Error, parameter requires a char type, current type: "' + block[1].typeName_ + '".\n';
				}
				if(val1.length < 1){
					TT += 'Error, input is required.\n';
				}
			}
			else {
				TT += 'Error, a parameter input is required.\n';
			}
		}
		else {
			TT += 'Error, a variable is required.\n';
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};	



Blockly.C['string_pushback'] = function(block){
	var val2 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	
	var code = "";
	
	if(this.getVar_.length > 0 && val2.length > 0){
		code += this.getVar_ + '.push_back(' + val2 + ');\n';
	}
	
	return code;
};


Blockly.Blocks["string_substr"] = {
	init: function(){
		
		this.appendValueInput('valinp1');
		
		this.appendValueInput('valinp2')
			.appendField(".substr(");
		
		this.appendValueInput('valinp3')
			.appendField(", ");
			
		this.appendDummyInput('duminp1')
			.appendField(")");
		
		this.setOutput(1);
		this.setPreviousStatement(0);
		this.setNextStatement(0);
		this.setColour(stringHUE);
		
		this.isGetter_ = true;
		this.typeName_ = "string";
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode(this, "valinp1", Blockly.C.ORDER_ATOMIC);
	},
	
	allocateWarnings: function(){
		var TT = "";
		let C = C_Logic;
		
		//The parameter block
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2'),
			this.getInputTargetBlock('valinp3')
		];
		
		//If the block does not have a left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable input
		if(this.getVar_.length > 0){
			
			if(block[0]){
				
				if(block[0].typeName_ !== "string"){
					TT += 'Error, a string variable is required, current type: "' + block[0].typeName_ + '".\n';
				}
				
				if(!block[0].isGetter_){
					TT += "Error, a literal cannot be used here.\n";
				}
				
			}
			
			if(block[1]){
				if(!C.help.is_of_type_integer(block[1].typeName_)){
					TT += 'Error, first parameter must be a whole number, including "int", "size_t", "short", "long", "long long", current type: "' + block[1].typeName_ + '".\n';
				}
			}
			
			if(block[2]){
				if(!C.help.is_of_type_integer(block[2].typeName_)){
					TT += 'Error, second parameter must be a whole number, including "int", "size_t", "short", "long", "long long", current type: "' + block[2].typeName_ + '".\n';
				}
			}
			
			//if(){
				
			//}
		}
		//If there is not a variable
		else {
			TT += 'Error, .substr() requires a variable.\n';
		}
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C["string_substr"] = function(){
	let val = [
		Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp3', Blockly.C.ORDER_ATOMIC)
	];
	
	var code = "";
	
	if(this.getVar_.length > 0){
		code += this.getVar_ + ".substr(" + val[0] + ", " + val[1] + ")";
	}
	
	return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.Blocks["string_replace"] = {
	init: function(){
		
		this.appendValueInput('valinp1');
		
		this.appendValueInput('valinp2')
			.appendField(".replace(");
		
		this.appendValueInput('valinp3')
			.appendField(", ");
		
		this.appendValueInput('valinp4')
			.appendField(", ");
			
		this.appendDummyInput('duminp1')
			.appendField(")");
		
			
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(stringHUE);

		this.setTooltip("Replaces the string, from the first parameter, to the second parameter, into the third parameter.\n\nRequires - <string>");
		this.setHelpUrl("https://www.cplusplus.com/reference/string/string/replace/");
	},

	onchange: function(){
		this.allocateWarnings();
	},

	allocateWarnings: function(){
		var TT = "";
		let C = C_Logic;

		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2'),
			this.getInputTargetBlock('valinp3'),
			this.getInputTargetBlock('valinp4')
		];

		let val = [
			Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp3', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp4', Blockly.C.ORDER_ATOMIC)
		];

		if(val[0].length > 0){
			if(block[0] && block[0].typeName_ !== "string"){
				TT += "Error, replace requires a string.\n";
			}
			if(block[1] && !C.help.is_of_type_integer(block[1].typeName_)){
				TT += "Error, first parameter requires an integer.\n";
			}
			if(block[2] && !C.help.is_of_type_integer(block[2].typeName_)){
				TT += "Error, second parameter requires an integer.\n";
			}
			if(block[3] && block[3].typeName_ !== "string"){
				TT += "Error, third parameter requires a string.\n";
			}

			if(val[1].length < 1){
				TT += "Error, first parameter requires an input.\n";
			}
			if(val[2].length < 1){
				TT += "Error, second parameter requires an input.\n";
			}
			if(val[3].length < 1){
				TT += "Error, third parameter requires an input.\n";
			}

		}
		else {
			TT += "Error, replace requires a variable.\n";
		}
		
		//Check library starts
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		if(!libFound){
			TT += "Error, <string> library must be included.\n";
		}
		//Check library end

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
		if(!libFound){
			automate_library_string = {
				text: "include <string>",
				enabled: true,
				
				callback: function(){
					//Create the iostream block
					var newBlock = BlockScope.workspace.newBlock('include_string');

					//ptr is now this block
					let ptr = BlockScope;

					//Loop through the block tree, so we can include all the way at the top
					while(ptr){

						//if we're at the top
						if(!ptr.parentBlock_){
							//Attach block to tree
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


Blockly.C["string_replace"] = function(){
	var code = "";

	let val = [
		Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp3', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp4', Blockly.C.ORDER_ATOMIC)
	];
	
	if(val[0].length > 0){
		code += val[0] + ".replace(" + val[1] + ", " + val[2] + ", " + val[3] + ");\n";
	}
	
	return code;
};



Blockly.Blocks["string_insert"] = {
	init: function(){
		
		this.appendValueInput('valinp1');
		
		this.appendValueInput('valinp2')
			.appendField(".insert(");
		
		this.appendValueInput('valinp3')
			.appendField(", ");
			
		this.appendDummyInput('duminp1')
			.appendField(")");
		
			
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(stringHUE);

		this.setTooltip("\n\nRequires - <string>");
		this.setHelpUrl("https://www.cplusplus.com/reference/string/string/insert/");
	},

	onchange: function(){
		this.allocateWarnings();
	},

	allocateWarnings: function(){
		var TT = "";
		let C = C_Logic;

		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2'),
			this.getInputTargetBlock('valinp3')
		];

		let val = [
			Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp3', Blockly.C.ORDER_ATOMIC)
		];

		if(val[0].length > 0){
			if(block[0] && block[0].typeName_ !== "string"){
				TT += "Error, insert requires a string.\n";
			}

			if(block[1] && !C.help.is_of_type_integer(block[1].typeName_)){
				TT += "Error, first parameter requires an integer.\n";
			}

			if(block[2] && block[2].typeName_ !== "string"){
				TT += "Error, third parameter requires a string.\n";
			}

			if(val[1].length < 1){
				TT += "Error, first parameter requires an input.\n";
			}

			if(val[2].length < 1){
				TT += "Error, second parameter requires an input.\n";
			}

		}
		else {
			TT += "Error, insert requires a variable.\n";
		}
		
		//Check library starts
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		if(!libFound){
			TT += "Error, <string> library must be included.\n";
		}
		//Check library end

		
		//Check if the block is within a scope
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//
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
		if(!libFound){
			automate_library_string = {
				text: "include <string>",
				enabled: true,
				
				callback: function(){
					//Create the iostream block
					var newBlock = BlockScope.workspace.newBlock('include_string');

					//ptr is now this block
					let ptr = BlockScope;

					//Loop through the block tree, so we can include all the way at the top
					while(ptr){

						//if we're at the top
						if(!ptr.parentBlock_){
							//Attach block to tree
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

Blockly.C["string_insert"] = function(){
	var code = "";

	let val = [
		Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC),
		Blockly.C.valueToCode(this, 'valinp3', Blockly.C.ORDER_ATOMIC)
	];

	if(val[0].length > 0){
		code += val[0] + ".insert(" + val[1] + ", " + val[2] + ");\n";
	}

	return code;
};


Blockly.Blocks["string_find"] = {
	init: function(){
		this.appendValueInput("valinp1");

		this.appendValueInput("valinp2")
			.appendField(".find(");

		this.appendValueInput("valinp3")
			.appendField("", ",");

		this.appendDummyInput()
			.appendField(")");

		this.setInputsInline(true);
		this.setOutput(true);
		this.setColour(stringHUE);
		
		this.typeName_ = "size_t";
	},

	onchange: function(){
		this.allocateFormat();
		this.allocateWarnings();
	},

	allocateFormat: function(){
		if(Blockly.C.valueToCode(this, "valinp3", Blockly.C.ORDER_NONE).length > 0){
			this.setFieldValue(",", ",")
		}
		else {
			this.setFieldValue("", ",");
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		let C = C_Logic;

		let block = [
			this.getInputTargetBlock("valinp1"),
			this.getInputTargetBlock("valinp2"),
			this.getInputTargetBlock("valinp3")
		];

		let val = [
			Blockly.C.valueToCode(this, "valinp1", Blockly.C.ORDER_NONE),
			Blockly.C.valueToCode(this, "valinp2", Blockly.C.ORDER_NONE),
			Blockly.C.valueToCode(this, "valinp3", Blockly.C.ORDER_NONE)
		];

		if(val[0].length > 0){
			if(block[0] && block[0].typeName_ !== "string"){
				TT += "Error, a string variable is required.\n";
			}

			if(block[1] && (block[1].typeName_ !== "string" && block[1].typeName_ !== "char")){
				TT += "Error, first parameter requires a string or char.\n";
			}

			if(block[2] && !C.help.is_of_type_integer(block[2].typeName_)){
				TT += "Error, second parameter requires a size_t.\n";
			}

			if(val[1].length < 1){
				TT += "Error, first parameter requires an input.\n";
			}

			//Parameter 2 is an optional variable
			if(block[2] && val[2].length < 1){
				TT += "Error, second parameter requires an input.\n";
			}
		}
		else {
			TT += "Error, a variable is required.\n";
		}
		
		//Check if the block is within a scope
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//

		if(TT.length > 0) {
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
		if(!libFound){
			automate_library_string = {
				text: "include <string>",
				enabled: true,
				
				callback: function(){
					//Create the iostream block
					var newBlock = BlockScope.workspace.newBlock('include_string');

					//ptr is now this block
					let ptr = BlockScope;

					//Loop through the block tree, so we can include all the way at the top
					while(ptr){

						//if we're at the top
						if(!ptr.parentBlock_){
							//Attach block to tree
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


Blockly.C["string_find"] = function(){
	var code = "";

	let val = [
		Blockly.C.valueToCode(this, "valinp1", Blockly.C.ORDER_NONE),
		Blockly.C.valueToCode(this, "valinp2", Blockly.C.ORDER_NONE),
		Blockly.C.valueToCode(this, "valinp3", Blockly.C.ORDER_NONE)
	];

	if(val[0].length > 0){
		code += val[0] + ".find(" + val[1];
		if(val[2].length > 0){
			code += ", " + val[2];
		}

		code += ")";
	}

	return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.Blocks["string_npos"] = {
	init: function(){
		this.appendDummyInput()
			.appendField("string::npos");

		this.setOutput(true);
		this.setColour(stringHUE);

		this.typeName_ = "size_t";
		this.isConst_ = true;

		this.setTooltip("A variable from the string library that equals -1. It is used with string::find() in an if statement to check if a char or another string exists.\nIncludes - <string>\nFirst Parameter - char / string\nSecond Parameter (optional) offset to start checking.\nNote - \"npos\" means \"not position\".");
		this.setHelpUrl("https://www.cplusplus.com/reference/string/string/npos/");
	},

	onchange: function(){
		this.allocateWarnings();
	},

	allocateFormat: function(){

	},

	allocateWarnings: function(){
		var TT = "";

		//Check library starts
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_string']);
		
		if(!libFound){
			TT += "Error, <string> library must be included.\n";
		}
		//Check library end

		
		//Check if the block is within a scope
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C["string_npos"] = function(){
	var code = "";
	var std = '';

	let C = C_Include;
	if(!C.using.std(this)){
		std += 'std::';
	}

	code += std + "string::npos";

	return [code, Blockly.C.ORDER_ATOMIC];
};	

