
var vectorHUE = 320;

// Mutator blocks for the mutator
Blockly.Blocks['vector_mutator'] = {
	init: function(){
		this.setColour(vectorHUE);

		this.appendDummyInput().appendField('vector');

		this.appendStatementInput('STACK');

		this.setPreviousStatement(false);
		this.setNextStatement(false);

		this.setTooltip('');
		this.contextMenu = false;
	}
};


Blockly.Blocks['vector_add'] = {
	init: function(){
		this.setColour(vectorHUE);
		this.appendDummyInput().appendField('add');
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
		this.contextMenu = false;
	}
};

Blockly.Blocks['vector'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("vector<")
			.appendField(new Blockly.FieldDropdown([["int","int"], ["size_t","size_t"], ["double","double"], ["char","char"], ["string","string"], ["bool","bool"]]), "myVecType")
			.appendField(">")
			.appendField(new Blockly.FieldTextInput("myVec"), "myVecDef")
			.appendField('', 'init');


		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(vectorHUE);
		this.setTooltip("A vector is like an array; it can store and access data. Unlike an array, its size can change.");
		this.setHelpUrl("http://www.cplusplus.com/reference/vector/vector/");
		
		this.typeName_ = this.getField('myVecType').getText();
		this.getVar_ = this.getField('myVecDef').getText();
		
		this.size_ = 0;
		
		this.isInitialized_ = false;

		this.setMutator(new Blockly.Mutator(['vector_add']));
		
		//set data structure as a vector
		this.setDataStr("isVec", true);
		
		this.varProp_ = [];

	},
	
	mutationToDom: function(){
	  if(!this.size_){
		return null;
	  }
	  var container = document.createElement('mutation');

	  if(this.size_){
		container.setAttribute('printadd', this.size_);
	  }
	  
	  return container;
	},

	domToMutation: function(xmlElement){
		this.size_ = parseInt(xmlElement.getAttribute('printadd'), 10);

		for(var i = 1; i <= this.size_;  ++i){
			this.appendValueInput('valinp' + i)
				.setCheck(null)
				.setAlign(Blockly.ALIGN_RIGHT);
		}

	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('vector_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;
		for(var i = 1; i <= this.size_; ++i){
			var add = workspace.newBlock('vector_add');
			add.initSvg();

			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		return containerBlock;
	},

	compose: function(containerBlock){

		for(var i = this.size_; i > 0; i--){
			this.removeInput('valinp' + i);
		}

		this.size_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');

		while(clauseBlock){
			switch(clauseBlock.type){
				case 'vector_add':

					this.size_++;

					var printInput = this.appendValueInput('valinp' + this.size_)
						.setCheck(null)
						.setAlign(Blockly.ALIGN_RIGHT);

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
				case 'vector_add':
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
		this.typeName_ = this.getField('myVecType').getText();
		this.getVar_ = this.getField('myVecDef').getText();

		if(this.size_ > 0){
			this.isInitialized_ = true;
		}
		else {
			this.isInitialized_ = false;
		}

		if(this.isInitialized_){
			this.setFieldValue('= {', 'init');
		}
		else {
			this.setFieldValue('', 'init');
		}
		
		//constant
		this.varProp_[0] = false;
		//type
		this.varProp_[1] = this.typeName_;
		//pointer
		this.varProp_[2] = "";
		//variable
		this.varProp_[3] = this.getVar_;

	},
	
	allocateWarnings: function(){
		var TT = "";
		
		for(var i = 1; i <= this.size_; ++i){
			let block = this.getInputTargetBlock('valinp' + i);
			
			if(block){
				if(this.typeName_ !== block.typeName_){
					TT += 'Error, input #' + i + ' is of type "' + block.typeName_ + '", must be of type: "' + this.typeName_ + '".\n';
				}
			}
		}
		
		//Section to check library functions (string and vector)
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFoundVector = librarySearch.search_library(this, ['include_vector']);
		var libFoundString = librarySearch.search_library(this, ['include_string']);
		
		if(!libFoundVector){
			TT += "Error, <vector> library must be included.\n";
		}
		
		if(this.typeName_ === "string" && !libFoundString){
			TT += "Error, <string> library must be included.\n";
		}
		
		//End library check section

		
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
		var libFoundVector = librarySearch.search_library(this, ['include_vector']);
		var libFoundString = librarySearch.search_library(this, ['include_string']);
		
		//Create the option to automate a string library creation
		if(!libFoundVector){
			automate_library_vector = {
				text: "include <vector>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_vector');
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
			options.push(automate_library_vector);
		}
		//Create the option to automate a string library creation
		if(this.typeName_ === "string" && !libFoundString){
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

Blockly.C['vector'] = function(block) {
	var val0 = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_ATOMIC);
	var type = this.getField('myVecType').getText();
	
	C = C_Include;
	
	var code = '';
	var std = '';
	
	if(!C.using.std(block)){
		std = 'std::';
	}
	
	code += std + 'vector<';
	
	//if data type requires std::
	if(type === 'string'){
		code += std;
	}
	
	code += type + '> ' + this.getVar_;
	if(this.size_ > 0){
		code += ' = {';
		
		if(val0.length > 0){
			code += val0;
		}
		
		for(var i = 1; i <= this.size_; ++i){
			
			var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);
			var childBlock = this.getInputTargetBlock('valinp' + i);
			
			if(childBlock){
				code += arg;
				
				if(i < this.size_){
					code += ", ";
				}
	
			}
		}
		code += '}';
	}
	
	code += ';\n';

	return code;
};

// Vector Size
Blockly.Blocks['vector_size'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);

		this.appendDummyInput()
			.appendField(".size()");

		this.setOutput(true);
		this.setColour(vectorHUE);
		
		this.setTooltip("Returns the number of elements in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/size/");
		
		this.typeName_ = "size_t";
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
	},

	allocateWarnings: function(){
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_size'] = function(block) {
	var code = "";

	if(this.getVar_.length > 0){
		code += this.getVar_ + ".size()";
	}

	return [code, Blockly.C.ORDER_ATOMIC];
};

// Vector at
Blockly.Blocks['vector_at'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);

		this.appendValueInput('valinp2')
			.appendField(".at(");
			
		this.appendDummyInput()
			.appendField(')');

		this.setOutput(true);
		this.setColour(vectorHUE);
		this.setTooltip("Returns the nth position in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/at/");
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		this.typeName_ = "";
		
		//Traverse the block tree to find the type of the vector
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isVec" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		let C = C_Logic;
		
		//Parameter 
		var val2 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
		//Parameter block
		let block = this.getInputTargetBlock('valinp2');
		
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//If a block is connected
		if(block){
			
			//check types
			if(!C.help.is_of_type_integer(block.typeName_)){
				TT += 'Error, parameter must be a whole number, current type: "' + block.typeName_ + '".\n';
			}
		}
		else {
			TT += 'Error,.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_at'] = function(block) {
	var val1 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	var code = "";

	if(this.getVar_.length > 0 && val1.length > 0){
		code += this.getVar_ + ".at(" + val1 + ")";
	}

	return [code, Blockly.C.ORDER_ATOMIC];
};

// Vector Size
Blockly.Blocks['vector_front'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);
			
		this.appendDummyInput()
			.appendField(".front()");

		this.setOutput(true);
		this.setColour(vectorHUE);
		this.setTooltip("Returns the nth position in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/at/");

		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		this.typeName_ = "";
		
		//Traverse the block tree to find the type of the vector
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isVec" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		let C = C_Logic;
		
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_front'] = function(block) {
	var code = "";

	if(this.getVar_.length > 0){
		code += this.getVar_ + ".front()";
	}

	return [code, Blockly.C.ORDER_ATOMIC];
};

// Vector Size
Blockly.Blocks['vector_back'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);
			
		this.appendDummyInput()
			.appendField(".back()");

		this.setOutput(true);
		this.setColour(vectorHUE);
		this.setTooltip("Returns the nth position in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/at/");
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		this.typeName_ = "";
		
		//Traverse the block tree to find the type of the vector
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isVec" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		let C = C_Logic;
		
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_back'] = function(block) {
	var code = "";

	if(this.getVar_.length > 0){
		code += this.getVar_ + ".back()";
	}

	return [code, Blockly.C.ORDER_ATOMIC];
};



// Vector push_back
Blockly.Blocks['vector_push_back'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);

		this.appendValueInput('valinp2')
			.appendField(".push_back(");
			
		this.appendDummyInput()
			.appendField(')');

		this.setOutput(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(vectorHUE);
		this.setTooltip("Returns the nth position in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/push_back/");
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		this.typeName_ = "";
		
		//Traverse the block tree to find the type of the vector
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isVec" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		let C = C_Logic;
		
		//Parameter 
		var val2 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
		//Parameter block
		let block = this.getInputTargetBlock('valinp2');
		
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			//If a block is connected
			if(block){
				
				//check types
				if(this.typeName_ !== block.typeName_){
					TT += 'Error, parameter must be a type "' + this.typeName_ + '", current type: "' + block.typeName_ + '".\n';
				}
				
				if(val2.length < 1){
					TT += 'Error, input is required.\n';
				}
			}
			else {
				TT += 'Error, parameter requires an input.\n';
			}
		
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_push_back'] = function(block) {
	var val1 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	var code = "";

	if(this.getVar_.length > 0 && val1.length > 0){
		code += this.getVar_ + ".push_back(" + val1 + ");\n";
	}

	return code;
};

// Vector Size
Blockly.Blocks['vector_pop_back'] = {
	init: function() {

		this.appendValueInput('valinp1')
			.setCheck(null);

		this.appendDummyInput()
			.appendField(".pop_back()");
			

		this.setOutput(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(vectorHUE);
		this.setTooltip("Removes the last element in the vector.");
		this.setHelpUrl("https://www.cplusplus.com/reference/vector/vector/pop_back/");
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	//Initialize variables
	allocateValues: function(){
		//Set variable to left input
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
		this.typeName_ = "";
		
		//Traverse the block tree to find the type of the vector
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isVec" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		let C = C_Logic;
		
		var TT = "";
		
		//If there is no left connection
		if(!this.parentBlock_){
			TT += 'Block Error, this block has a return and must be connected.\n';
		}
		
		//If there is a variable
		if(this.getVar_.length > 0){
			//If a block is connected
		
		}
		//If there is not a variable
		else {
			TT += 'Error, a vector variable is required.\n';
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;
		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		//End Scope check
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['vector_pop_back'] = function(block) {
	var val1 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	var code = "";

	if(this.getVar_.length > 0){
		code += this.getVar_ + ".pop_back();\n";
	}
	
	return code;
};







