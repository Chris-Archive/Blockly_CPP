Blockly.Blocks["io_printf_mutator"] = {
	init: function(){
		this.appendDummyInput()
			.appendField("printf");

		this.appendStatementInput("STACK");
		
		
	}
};

Blockly.Blocks['io_printf_add'] = {
	init: function(){
		this.appendDummyInput()
			.appendField("add");

		this.setPreviousStatement(true);
		this.setNextStatement(true);
	}
};

Blockly.Blocks["io_printf"] = {
	init: function(){

		this.appendValueInput("v_inp0")
			.appendField("printf(");


		this.setPreviousStatement(true);
		this.setNextStatement(true);
		
		this.setMutator(new Blockly.Mutator(["io_printf_add"]));
		this.printfCount_ = 0;
	},

	mutationToDom: function(){
		var container = document.createElement('mutation');

		container.setAttribute('printadd', this.printfCount_);

		return container;
	},

	domToMutation: function(xmlElement){
		this.printfCount_ = parseInt(xmlElement.getAttribute("printadd"));

		for(var i = 1; i <= this.printfCount_; ++i){
			this.appendValueInput('v_inp' + i).setAlign(Blockly.ALIGN_RIGHT);
		}
	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock("io_printf_mutator");
		containerBlock.initSvg();

		var connection = containerBlock.getInput("STACK").connection;

		for(var i = 1; i <= this.printfCount_; ++i){
			var add = workspace.newBlock("io_printf_add");
			add.initSvg();

			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		return containerBlock;
	},

	compose: function(containerBlock){
		for(var i = this.printfCount_; i > 0; --i){
			this.removeInput("v_inp" + i);
		}

		this.printfCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock("STACK");

		while(clauseBlock){
			this.printfCount_++;
			
			var printInput = this.appendValueInput('v_inp' + this.printfCount_).setAlign(Blockly.ALIGN_RIGHT);
				
			if(clauseBlock.valueConnection_){
				printInput.connection.connect(clauseBlock.valueCOnnection_);
			}
			
			clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}
	},

	saveConnection: function(containerBlock){
		var clauseBlock = containerBlock.getInputTargetBlock("STACK");

		var i = 1;

		while(clauseBlock){
			var inputPrint = this.getInput("v_inp" + i);

			clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;

			clauseBlock.statementConnection_ = i++;
		
			clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}
	},

	onchange: function(){

	},

	getFormat: function(type){
		switch(type){
			case "int": case "bool": return "%d";
			
			case "size_t": return "%u";
			case "double": return "%f";
			case "char": return "%c";
			case "string": return "%s";
			case "short": return "%i";
			case "long": return "%ld";
			case "long long": return "%lld";
			
			default: return "";
		}
	},

	setWarnings: function(){

	},

	customContextMenu: function(options){
		let blockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ["library_iostream"]);

		if(!libFound){
			automate_library_iostream = {
				text: "include <iostream>", 
				enabled: true,
				
				callback: function(){
					var newBlock = blockScope.workspace.newBlock("library_iostream");

					let ptr = blockScope;

					while(ptr){
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
	}

};

Blockly.C["io_printf"] = function(){
	var code = "";
	//%s, %d
	var str = [];
	//code in the format section
	var format = [];
	var formattedCode = [];

	code += 'printf("';

	for(var i = 0; i <= this.printfCount_; ++i){
		var arg = Blockly.C.valueToCode(this, "v_inp" + i, Blockly.C.ORDER_NONE);

		let ptr = this.getInputTargetBlock("v_inp" + i);

		if(arg.length > 0){
			str.push(this.getFormat(ptr.typeName_));
			formattedCode.push(this.getFormat(ptr.typeName_));
			format.push(arg);
		}
		else {
			formattedCode.push(arg);
		}
	}
	
	for(var i = 0; i < formattedCode.length; ++i){
		code += formattedCode[i];

		if(formattedCode[i].length < 1){
			code += "\\n";
		}
	}

	code += '"';

	if(format.length > 0){
		code += ", ";

		for(var i = 0; i < format.length; ++i){
			code += format[i];
				
			if(i < format.length - 1){
				code += ", ";
			}
		}

	}

	code += ");\n";

	return code;
};