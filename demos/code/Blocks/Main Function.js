Blockly.Blocks['pointer_null'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("NULL");
		this.setOutput(true);
		this.setColour(0);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.isNull_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		
	},
	
	allocateWarnings(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block as a return and must be connected.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
		
	}
};

Blockly.C['pointer_null'] = function(block) {
  // TODO: Assemble C into code variable.
  var code = 'NULL';
  
  return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['main'] = {
	init: function() {
		this.appendDummyInput().appendField('int main()');
		this.appendStatementInput("NAME").setCheck(null);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(0);
		this.setTooltip("");
		this.setHelpUrl("https://en.cppreference.com/w/cpp/language/main_function");
		
		//Array to keep track of the names (member names)
		this.mNames_ = [];
		//Array to keep track of the types (member names)
		this.mTypes_ = [];
		//data structure types
		this.dTypes_ = [];
		
		this.setDataStr("isFunc", true);
		
		this.typeName_ = "int";
	},

	onchange: function(){

		let Scope = C_Scope;

		this.mNames_ = [];
		this.mTypes_ = [];
		this.dTypes_ = [];

		var ptr = null;
		
		if(this.inputList[1].connection.targetConnection){
			
			ptr = this.inputList[1].connection.targetConnection.sourceBlock_;
			
			Scope.recursion_log(ptr, true);
	
			this.mNames_ = Scope.getBlockName();
			this.mTypes_ = Scope.getVarName();
			this.dTypes_ = Scope.getDataStr();

		}
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = '';

		if(this.dTypes_){

			for(var i = 0; i < this.dTypes_.length; ++i){

				switch(this.dTypes_[i]){

					case 'isFunc':
						TT += 'Error, you cannot declare a function inside of a main.\n';
					break;

					case 'isStruct':
						TT += 'Error, you cannot declare a struct inside of a main.\n';
					break;

					case 'isClass':
						TT += 'Error, you cannot declare a class inside of a main.\n';
					break;

				}

			}

		}
		
		let ptr = this.getSurroundParent();
		
		if(ptr){
			TT += "Error, main cannot be inside of a function or class.\n";
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};



Blockly.C['main'] = function(block) {	
	
	var code = 'int main(){\n';
	
	code += Blockly.C.statementToCode(block, 'NAME');
	
	return code + '  return 0;\n}\n';
	
};



//Shifts a code for a line, allows for user to format code
Blockly.Blocks['format_newLine'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("(Format Lines)")
			.appendField(new Blockly.FieldNumber(1, 1, 10), "newLines");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip("How many lines you'd like to seperate between code blocks. Used for blockly only and does not generate code.");
		this.setHelpUrl("");
	}
};

Blockly.C['format_newLine'] = function(block) {
	var num = this.getField('newLines').getText();
	var code = '';
	
	for(var i = 0; i < num; ++i){
	code += '\n';
	}
	
	return code;
};

//
Blockly.Blocks['system_pause'] = {
	init: function() {
		this.appendDummyInput()
			.appendField('system("pause")');
			
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		
		this.setColour(0);
		this.setTooltip("Used to pause the system console until a key has been pressed.\nOnly works on a Windows OS.");
		this.setHelpUrl("https://www.journaldev.com/41740/system-pause-command-c-plus-plus");
	},
	
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = '';
		
		//Check library starts
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var libFound = librarySearch.search_library(this, ['include_cstdlib']);
		
		if(!libFound){
			TT += "Error, <cstdlib> library must be included.\n";
		}
		
		//Check library end
		
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
	},
	//add cstdlib
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cstdlib']);
		
		//create an initialization block
		if(!libFound){
			
			automate_library_string= {
				text: "include <cstdlib>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_cstdlib');
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

Blockly.C['system_pause'] = function(block) {
	var code = '';
	
	code += 'system("pause");\n';
	
	return code;
};







