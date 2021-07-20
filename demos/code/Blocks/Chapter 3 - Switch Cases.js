
var switchHUE = 60;

Blockly.Blocks['switch_statement'] = {
	init: function() {
		
		this.appendValueInput('valinp0')
			.appendField("switch block");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(switchHUE);
		this.setTooltip("The switch case statement functions similarly to an if-else statement.\nInput - int, char");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_switch_statement.htm");
		
		
		this.setMutator(new Blockly.Mutator(['switch_case_input', 'switch_case_default']));
		
		//Array to store the inputted numbers
		//of the cases
		
		this.caseValue_ = [];
		
		this.caseCount_ = 0;
		this.defaultCount_ = 0;
		
	},

	mutationToDom: function(){
		if(!this.caseCount_ && !this.defaultCount_){
		  return null;
		}

		var container = document.createElement('mutation');

		if(this.caseCount_){
			container.setAttribute('caseadd', this.caseCount_);
		}

		if(this.defaultCount_){
			container.setAttribute('default', 1);
		}

		return container;
	},

	domToMutation: function(xmlElement){
		this.caseCount_ = parseInt(xmlElement.getAttribute('caseadd'), 10);
		this.defaultCount_ = parseInt(xmlElement.getAttribute('default'), 10);

		for(var i = 1; i <= this.caseCount_; ++i){
			this.appendStatementInput('stateinp' + i).setCheck(null).appendField('case: ').setAlign(Blockly.ALIGN_RIGHT)
				.appendField(new Blockly.FieldTextInput(this.caseCount_), "text" + i);
			
		}

		if(this.defaultCount_){
			this.appendStatementInput('default')
				.appendField('default: ')
				.setAlign(Blockly.ALIGN_RIGHT)
				.setCheck(null);
		}

	},

	decompose: function(workspace){
		var containerBlock = workspace.newBlock('switch_case_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;

		for(var i = 1; i <= this.caseCount_; ++i){
			var add = workspace.newBlock('switch_case_input');
			add.initSvg();

			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		if(this.defaultCount_){
			var defaultBlock = workspace.newBlock('switch_case_default');
			defaultBlock.initSvg();

			connection.connect(defaultBlock.previousConnection);
		}

		return containerBlock;
	},

	compose: function(containerBlock){
		
		if(this.defaultCount_){
			this.removeInput('default');
		}

		this.defaultCount_ = 0;

		for(var i = this.caseCount_; i > 0; --i){
			this.removeInput('stateinp' + i);
		}

		this.caseCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');

		while(clauseBlock){
			
			switch(clauseBlock.type){

				case 'switch_case_input':
					this.caseCount_++;

					var caseInput = this.appendStatementInput('stateinp' + this.caseCount_)
						.setCheck(null).appendField('case: ').setAlign(Blockly.ALIGN_RIGHT)
						.appendField(new Blockly.FieldTextInput(this.caseCount_), "text" + this.caseCount_);


					if(clauseBlock.statementConnection_){
						caseInput.connection.connect(clauseBlock.statementConnection_);
					}

				break;
				
				case 'switch_case_default':
					this.defaultCount_++;
					
					var defaultInput = this.appendStatementInput('default');

					defaultInput.appendField('default: ').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
					
					if(clauseBlock.statementConnection_){
						defaultInput.connection.connect(clauseBlock.statementConnection_);
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
				case 'switch_case_input':
		
					var inputPrint = this.getInput('stateinp' + i);
					clauseBlock.statementConnection_ = inputPrint && inputPrint.connection.targetConnection;
					
					clauseBlock.statementConnection = i++;
				break;

				case 'switch_case_default':

					var defaultInput = this.getInput('default');

					clauseBlock.statementConnection_ = defaultInput
					&& defaultInput.connection.targetConnection;

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
		
		this.allocateValues();
		this.allocateBlock();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp0');
		
		this.caseValue_ = [];

		this.getVar_ = Blockly.C.valueToCode(this, 'valinp0', Blockly.C.ORDER_NONE);
		
		if(block){
			this.typeName_ = block.typeName_;
		}
		
		for(var i = 0; i < this.caseCount_; ++i){
			this.caseValue_.push(this.getField('text' + (i + 1)).getText());
		}
	},
	
	allocateBlock: function(){
		let block = this.getInputTargetBlock('valinp0');
		
		if(block){
			block.setColour(this.getColour());
			block.setMovable(0);
			block.setDeletable(0);
		}
		
	},

	allocateWarnings: function(){
		var TT = '';
		
		var val1 = Blockly.C.valueToCode(this, 'valinp0', Blockly.C.ORDER_ATOMIC);
		let block = this.getInputTargetBlock('valinp0');

		
		if(val1.length > 1){
			
			if(!C.help.is_of_type_numeral(this.typeName_)){
				TT += 'Error, type must be a whole number type, such as "int", "size_t", "char", "short", "bool", "long", "long long", current type: "' + block.typeName_ + '".\n';
			}
			
			for(var i = 0; i < this.caseValue_.length; ++i){
				if(this.caseValue_[i].length < 1){
					TT += 'Error, case #' + (i + 1) + ' cannot be less than one character.\n';
				}
				
				switch(this.typeName_){
					case 'char':
					
					if(this.caseValue_[i].length > 1){
						TT += 'Error, case #' + (i + 1) + ' cannot be more than one character.\n';
					}
					
					break;
					
					default:
					
					if(isNaN(this.caseValue_[i])){
						TT += 'Error, case #' + (i + 1) + ' must be a number, and not a character.\n';
					} 
					else if(!isNaN(this.caseValue_[i]) && this.caseValue_[i] % 1 !== 0){
						TT += 'Error, case #' + (i + 1) + ' cannot be a decimal.\n';
					}
					
					break;
				}
			}
			
		}
		else {
			TT += "Error, switch requires a variable.\n";
		}
		
		if(this.caseCount_ < 1 && this.defaultCount_ < 1){
			TT += "Warning, a switch case should contain at least one switch case or one default case.\n";
		}
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

Blockly.C['switch_statement'] = function(block) {
	var switchVar = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);
	var defaultText = Blockly.C.statementToCode(block, 'default', Blockly.C.ORDER_NONE);
	
	//begin code generation
	var code = '';
	var charQuote = "";
	
	if(this.typeName_ === 'char'){
		charQuote = "'";
	}
	
	code += 'switch(' + switchVar + '){\n';
	
	for(var i = 0; i < this.caseCount_; ++i){
		var statement_code = Blockly.C.statementToCode(block, 'stateinp' + (i + 1), Blockly.C.ORDER_NONE);
		
		code += '  case ' + charQuote + block.caseValue_[i] + charQuote + ':\n';
		
		if(statement_code.length > 0){
			code += statement_code;
		}
		
		code += '  break;\n';
	}
	
	//If there is a default case
	if(this.defaultCount_ > 0){
		code += '  default:\n';
		
		//If there is any input in the default case
		if(defaultText.length > 0){ code += defaultText; }
		code += '  break;\n';
	}
	

	code += '}\n';

	return code;
};


Blockly.Blocks['switch_case'] = {
	init: function() {
    	this.appendValueInput("valinp1")
    	    .setCheck(null)
    	    .appendField("switch case:");
    	this.appendStatementInput("state1")
    	    .setCheck(null);
    	this.setInputsInline(false);
    	this.setPreviousStatement(true, null);
    	this.setNextStatement(true, null);
    	this.setColour(switchHUE);
		this.setTooltip("The case statement; this functions similarly to an else if statement.\nInput - Int, Char, Variable");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_switch_statement.htm");
	}
};

Blockly.C['switch_case'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var statements_state1 = Blockly.C.statementToCode(block, 'state1');
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = '1';
	}

	code += 'case ' + value_valinp1 + ':\n';

	code += statements_state1;

	return code;
};

Blockly.Blocks['switch_default'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("default:");
    this.appendStatementInput("state1")
        .setCheck(null);
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(switchHUE);
 this.setTooltip("The default case for the switch case statement. If none of the cases are valid, this will occur instead.");
 this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_switch_statement.htm");
  }
};

Blockly.C['switch_default'] = function(block) {
	var statements_state1 = Blockly.C.statementToCode(block, 'state1');
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'default: \n';

	code += statements_state1;

	return code;
};


Blockly.Blocks['switch_break'] = {
	init: function() {
		this.appendDummyInput()
		    .appendField("break");
		this.setPreviousStatement(true, null);
		this.setColour(switchHUE);
		this.setTooltip("A break has two uses:\n1. A break is a statement that forcefully ends a control loop. It will end the loop, regardless of whether or not the loop condition itself has been met.\n2.A break is a statement that ends a case in a switch statement.");
		this.setHelpUrl("https://www.tutorialspoint.com/cpluspluscpp_break_statement.htm");
	}
};

Blockly.C['switch_break'] = function(block) {
	// TODO: Assemble C into code variable.
	var code = 'break;\n';
	return code;
};

Blockly.Blocks['switch_case_mutator'] = {
	init: function(){
	  	//The Variable for the switch case
	  	this.appendDummyInput().appendField('Switch Case: ');
		
		this.appendStatementInput('STACK').setCheck(['switch_case']);
		
	  	this.setPreviousStatement(false);
	  	this.setNextStatement(false);
	  	this.setColour(switchHUE);
	  	this.setTooltip('');
	  	this.setHelpUrl('');
		
	}
};

Blockly.Blocks['switch_case_input'] = {
	init: function(){
		this.appendDummyInput()
			.appendField('add');
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(switchHUE);
		this.setTooltip('');
		this.setHelpUrl('');
	}
}

Blockly.Blocks['switch_case_default'] = {
	init: function(){
		this.appendDummyInput()
			.appendField('default');
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(false);
		this.setColour(switchHUE);
		this.setTooltip('');
		this.setHelpUrl('');
	}
}