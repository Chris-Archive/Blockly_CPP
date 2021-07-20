var coutHUE = 25;
var cinHUE = 50;

Blockly.Blocks['cout'] = {
	init: function() {
		this.appendValueInput("valinp0")
			.setCheck(null)
			.appendField("cout <<");
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(coutHUE);
		this.setTooltip("Outputs the input into the output stream. \nRequires - <iostream>");
		this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/basic_io/");
		
		this.setMutator(new Blockly.Mutator(['cout_stream_add']));
	
		//count of added couts in the stream
		this.coutStreamCount_ = 0;
	},
	
	mutationToDom: function(){
		if(!this.coutStreamCount_){
			return null;
		}
		var container = document.createElement('mutation');

		if(this.coutStreamCount_){
			container.setAttribute('printadd', this.coutStreamCount_);
		}
		
		return container;
	},

	domToMutation: function(xmlElement){
		this.coutStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
		for(var i = 1; i <= this.coutStreamCount_;  ++i){
			this.appendValueInput('valinp' + i).setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);
		}
	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('cout_stream_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;
		for(var i = 1; i <= this.coutStreamCount_; ++i){
			var add = workspace.newBlock('cout_stream_add');
			add.initSvg();
			
			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		return containerBlock;
	},

	compose: function(containerBlock){
		for(var i = this.coutStreamCount_; i > 0; i--){
			this.removeInput('valinp' + i);
		}
		this.coutStreamCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'cout_stream_add':
					this.coutStreamCount_++;
					
					var printInput = this.appendValueInput('valinp' + this.coutStreamCount_)
						.setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);

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
				case 'cout_stream_add':
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
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//Cout type check
		
		//Library Check
		let librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_iostream']);
		
		if(!libFound){
			TT += "Error, <iostream> library must be included.\n";
		}
		
		//Libary check end
		
		//Check if this block is in a proper scope

		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//Proper scope end
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	},
	//Add iostream for cin
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_iostream']);
		
		//create an initialization block
		if(!libFound){
			
			automate_library_string= {
				text: "include <iostream>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_iostream');
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

Blockly.C['cout'] = function(block) {
	var code = '';
	var std = '';

	C = C_Include;
	
	if(!C.using.std(block)){
		std = 'std::';
	}

	code += std + 'cout';

	for(var i = 0; i <= block.coutStreamCount_; ++i){
		var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);

		if(arg.length > 0){
			code += ' << ' + arg;
		}
		else {
			code += ' << ' + std + 'endl';
		}

	}
	
	
	code += ';\n';
	return code;
};

Blockly.Blocks['cout_setprecision'] = {
	init: function() {
		this.appendValueInput('valinp1')
			.appendField("setprecision(");
			
		this.appendDummyInput()
			.appendField(')');
			
		this.setOutput(true);
		this.setColour(coutHUE);
		this.setTooltip("Sets floating point precision in the cout stream.");
		this.setHelpUrl("http://www.cplusplus.com/reference/iomanip/setprecision/");
	},
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var C = C_Logic;
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(!this.parentBlock_ || (this.parentBlock_ && this.parentBlock_.type !== "cout")){
			TT += 'Error, "setprecision()" must proceed a "cout".\n';
		}
		
		//Search Library start
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_iomanip']);
		
		if(!libFound){
			TT += "Error, <iomanip> library must be included.\n";
		}
		
		//Search Library end
		
		if(block){
			if(!C.help.is_of_type_integer(block.typeName_)){
				TT += 'Error, parameter must be of type "int", "size_t", "short", "long", "long long", current type: "' + block.typeName_ + '.\n';
			}
		}
		
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
		// call from code.js
		autoInclude('iomanip', BlockScope, options);
		
	}
};

Blockly.C['cout_setprecision'] = function(block) {
	var C = C_Include;
	
	let val = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	
	var code = '';
	var std = '';

	
	if(!C.using.std(block)){
		std = 'std::';
	}
	
	if(val.length > 0){
		code = std + 'setprecision(' + val + ')';
	}

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cin_input'] = {
	init: function() {

		this.appendValueInput("valinp0")
			.setCheck(this.setCinCheck)
			.appendField("cin >>")
			.setAlign(Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(cinHUE);
		this.setTooltip("Grabs input from the console.\nRequires - <iostream>");
		this.setHelpUrl("http://www.cplusplus.com/reference/iostream/cin/");
	
		this.setMutator(new Blockly.Mutator(['cin_stream_add']));

		this.cinStreamCount_ = 0;

		this.setCinCheck = 'Variable';
		
	},

	mutationToDom: function(){
		if(!this.cinStreamCount_){
			return null;
		}
		var container = document.createElement('mutation');

		if(this.cinStreamCount_){
			container.setAttribute('printadd', this.cinStreamCount_);
		}

		return container;
	},

	domToMutation: function(xmlElement){
		this.cinStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
		for(var i = 1; i <= this.cinStreamCount_; i++){
			this.appendValueInput('valinp' + i).setCheck(this.setCinCheck).appendField('cin >> ').setAlign(Blockly.ALIGN_RIGHT);
		}
	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('cin_stream_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;

		for(var i = 1; i <= this.cinStreamCount_; ++i){
			var add = workspace.newBlock('cin_stream_add');
			add.initSvg();

			console.log(this.cinStreamCount_);
			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}
		return containerBlock;
	},

	compose: function(containerBlock){
		for(var i = this.cinStreamCount_; i > 0; i--){
			this.removeInput('valinp' + i);
		}
		this.cinStreamCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		while(clauseBlock){
			
			switch(clauseBlock.type){

				case 'cin_stream_add':
					this.cinStreamCount_++;
					var printInput = this.appendValueInput('valinp' + this.cinStreamCount_)
						.setCheck(this.setCinCheck).appendField('cin >> ').setAlign(Blockly.ALIGN_RIGHT);

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

				case 'cin_stream_add':
					var inputPrint = this.getInput('valinp' + i);
					clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;
					clauseBlock.statementConnection_ = i++;
				break;

				default:
					throw 'Unknown block type.';	
			}
			clauseBlock = clauseBlock.nextConnection &&
			clauseBlock.nextConnection.targetBlock();
		}
	},

	onchange: Blockly.Blocks.requireInFunction,
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_iostream']);
		
		if(!libFound){
			TT += "Error, <iostream> library must be included.\n";
		}
		
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
		
		//create an initialization block
		if(!libFound){
			
			automate_library_string= {
				text: "include <iostream>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_iostream');
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

Blockly.C['cin_input'] = function(block) {
	var val = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);
	// TODO: Assemble C into code variable.
	var code = '';
	var std = '';
	var WT = false;
	//tooltip for warning text

	C = C_Include;
	if( !C.using.std(block) ){
		std = 'std::';
	}

	if(this.cinStreamCount_ < 1 && !val){
		WT = true;
	}
	else if(this.cinStreamCount_ < 1 && val){
		code += std + 'cin >> ' + val;
	}
	else if(this.cinStreamCount_ > 0 && !val){
		WT = true;
	}
	else{

		code += std + 'cin >> ' + val;

		for(var i = 1; i <= this.cinStreamCount_; ++i){
			var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);
			var childConnection = this.inputList[i].connection;
			var childBlock = childConnection.targetBlock();


			if(childBlock){
				code += ' >> ' + arg;
			}
			else { 
				WT = true;
			}
		}
	}

	this.setWarningText(null);
	if(WT == true){
		this.setWarningText("Block warning: all cin inputs must be attached to a variable block.");
	}
	
	if(code.length > 0){
		code += ';\n';
	}
	
	return code;
};


Blockly.Blocks['cin_parse'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck("Cin")
			.appendField("(cin stream)")
			.appendField(new Blockly.FieldVariable("myVar"), "myVarDef");
		this.setOutput(true, "Cin");
		this.setColour(cinHUE);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};

Blockly.C['cin_parse'] = function(block) {
	var variable_name = Blockly.C.variableDB_.getName(block.getFieldValue('myVarDef'), Blockly.Variables.NAME_TYPE);
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += variable_name;

	if(value_valinp1.length > 0){
		code += " >> " + value_valinp1;
	}
	else {

	}

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cin_getline'] = {
	init: function() {
		this.appendValueInput('valinp1')
			.appendField("getline(cin, ");
		
		this.appendDummyInput('duminp1')
			.appendField(")");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(cinHUE);
		this.setTooltip("Grabs an entire line as a string.");
		this.setHelpUrl("http://www.cplusplus.com/reference/string/string/getline/");
	},
	
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		var librarySearch = C_Include;
		
		var libFoundIostream = librarySearch.search_library(this, ['include_iostream']);
		var libFoundString = librarySearch.search_library(this, ['include_string']);
		
		if(!libFoundIostream){
			TT += "Error, <iostream> library must be included.\n";
		}
		if(!libFoundString){
			TT += "Error, <string> library must be included.\n";
		}
		
		//Check if this block is in a proper scope
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		if(block && block.getVar_.length > 0){
			
			if(block.typeName_ !== "string"){
				TT += 'Error, variable must be a string.\n';
			}
			
		}
		else {
			TT += "Error, getline requires a variable.\n";
		}
		
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
		var libFoundIostream = librarySearch.search_library(this, ['include_iostream']);
		var libFoundString = librarySearch.search_library(this, ['include_string']);
		
		//Create the option to automate a string library creation
		if(!libFoundIostream){
			automate_library_iostream = {
				text: "include <iostream>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_iostream');
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
			options.push(automate_library_iostream);
		}
		
		//Create the option to automate a string library creation
		if(!libFoundString){
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

Blockly.C['cin_getline'] = function(block) {
	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';
	var std = '';

	C = C_Include;
	if( !C.using.std(block) ){
		std = 'std::';
	}

	code += std + 'getline(' + std + 'cin, ' + val1 + ');\n';


	return code;
};



// Mutator blocks for the mutator
Blockly.Blocks['cout_stream_mutator'] = {
	init: function(){
		this.setColour(coutHUE);
		this.appendDummyInput().appendField('print');
		this.appendStatementInput('STACK');

		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setTooltip('');
		this.contextMenu = false;
	}
};


Blockly.Blocks['cout_stream_add'] = {
	init: function(){
		this.setColour(coutHUE);
		this.appendDummyInput().appendField('add');
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
		this.contextMenu = false;
	}
};



// Mutator blocks for the mutator
Blockly.Blocks['cin_stream_mutator'] = {
	init: function(){
		this.setColour(cinHUE);
		this.appendDummyInput().appendField('print');
		this.appendStatementInput('STACK');

		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setTooltip('');
		this.contextMenu = false;
	}
};


Blockly.Blocks['cin_stream_add'] = {
	init: function(){
		this.setColour(cinHUE);
		this.appendDummyInput().appendField('add');
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
		this.contextMenu = false;
	}
};