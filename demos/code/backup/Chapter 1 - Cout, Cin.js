var coutHUE = 25;

Blockly.Blocks['output_cout'] = {
  init: function() {
    this.appendValueInput("NAME")
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
		for(var i = 1; i <= this.coutStreamCount_; i++){
			this.appendValueInput('valinp' + i).setCheck(null).appendField('');
		}
	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('cout_stream_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInputTargetBlock('STACK');
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
						.setCheck(null).appendField('');

					if(clauseBlock.valueConnection_){
						printInput.connection.connect(clauseBlock.valueConnection_);
					}
				break;

				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}


	},

	saveConnections: function(containerBlock){
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		var i = 1;
		while(clauseBlock){
			switch(clauseBlock.type){
				case 'cout_stream_add':
					var inputPrint = this.getInput('valinp' + i);
					clauseBlock.valueCOnnection_ = inputPrint && inputPrint.connection.targetConnection;
					clauseBlock.statementConnection_ = i++;
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock.clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}
	},

	onchange: Blockly.Blocks.requireInFunction

};

Blockly.C['output_cout'] = function(block) {
	var value_name = Blockly.C.valueToCode(block, 'NAME', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.

	var code = '';

	if(usingSTD === true){
		if(value_name.length < 1){
			code += 'cout << endl;\n';
		}
		else {
			code += 'cout << ' + value_name + ";\n";
		}
	}
	else {
		if(value_name.length < 1){
			code += 'std::cout << std::endl;\n';
		}
		else {
			code += 'std::cout << ' + value_name + ";\n";
		}
	}

	return code;
};

Blockly.Blocks['cout_output'] = {
  init: function() {
    this.appendValueInput("NAME")
        .setCheck(null)
		.appendField("(cout)")
        .appendField(new Blockly.FieldTextInput("input"), "inp");
    this.setOutput(true, null);
    this.setColour(coutHUE);
 this.setTooltip("Inserts a custom string into the cout stream.\nReturns - Cout\nRequires - <iostream>\nInput - Anything");
 this.setHelpUrl("");
  }
};

Blockly.C['cout_output'] = function(block) {
	var text_inp = block.getFieldValue('inp');
	var value_name = Blockly.C.valueToCode(block, 'NAME', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	// TODO: Change ORDER_NONE to the correct strength.
	var code = '"';
	code += text_inp;
	code += '"';

	if(value_name){
		code += " << " + value_name + "";
	}

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cout_endl'] = {
  init: function() {
    this.appendValueInput("valinp1")
        .appendField("(cout) endl")
        .setCheck(null)
    this.setOutput(true, "Cout");
    this.setColour(coutHUE);
 this.setTooltip("Moves the output of cout to a new line.");
 this.setHelpUrl("http://www.cplusplus.com/reference/ostream/endl");
  }
};

Blockly.C['cout_endl'] = function(block) {
	// TODO: Assemble C into code variable.
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	var code = '';

	if(usingSTD === false){
		code += 'std::endl';
	}
	else {
		var code = 'endl';
	}

	if(value_valinp1.length > 0){
		code += " << " + value_valinp1;
	}


	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cout_var'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("(cout)")
			.appendField(new Blockly.FieldVariable("myVar"), "varDef");
		this.setOutput(true, null);
		this.setColour(coutHUE);
		this.setTooltip("Inserts a variable into a cout stream.");
		this.setHelpUrl("");
	}
};

Blockly.C['cout_var'] = function(block) {
	var variable_vardef = Blockly.C.variableDB_.getName(block.getFieldValue('varDef'), Blockly.Variables.NAME_TYPE);
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(variable_vardef.length > 0){
		code += variable_vardef;
	}


	if(value_valinp1.length > 0){
		code += ' << ' + value_valinp1;
	}




	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
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

		this.type = "cout_stream_add";
	}
};
