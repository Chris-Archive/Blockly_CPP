
var logicHUE = 210;

Blockly.Blocks['if_mutator'] = {
	init: function(){
	  	//The Variable for the switch case
	  	this.appendDummyInput().appendField('if statements');
		
		this.appendStatementInput('STACK').setCheck(['switch_case']);
		
	  	this.setPreviousStatement(false);
	  	this.setNextStatement(false);
	  	this.setColour(logicHUE);
	  	this.setTooltip('');
	  	this.setHelpUrl('');
		
	}
};

Blockly.Blocks['if_else_if'] = {
	init: function(){
		this.appendDummyInput()
			.appendField('else if');
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(logicHUE);
		this.setTooltip('');
		this.setHelpUrl('');
	}
};

Blockly.Blocks['if_else'] = {
	init: function(){
		this.appendDummyInput()
			.appendField('else');
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(false);
		this.setColour(logicHUE);
		this.setTooltip('');
		this.setHelpUrl('');
	}
};

Blockly.Blocks['if_statement'] = {
	init: function(){
		this.appendValueInput('valinp0')
			.setCheck(null)
			.appendField('if')
			.setAlign(Blockly.ALIGN_RIGHT);
			
		this.appendStatementInput('stateinp0')
			.setCheck(null);
			
		this.setInputsInline(false);
		this.setOutput(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		
		this.setColour(logicHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.setMutator(new Blockly.Mutator(['if_else_if', 'if_else']));
		
		this.elseIfCount_ = 0;
		this.elseCount_ = 0;
	},
	
	mutationToDom: function(){
		if(!this.elseIfCount_ && !this.elseCount_){
			return null;
		}

		var container = document.createElement('mutation');

		if(!this.elseIfCount_){
			container.setAttribute('elseifadd', 0);
		}
		else {
			container.setAttribute('elseifadd', this.elseIfCount_);
		}

		if(this.elseCount_){
			container.setAttribute('else', 1);
		}

		return container;
	},
	
	domToMutation: function(xmlElement){
		this.elseIfCount_ = parseInt(xmlElement.getAttribute('elseifadd'), 10);
		this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10);

		for(var i = 1; i <= this.elseIfCount_; ++i){
			this.appendValueInput('valinp' + i).appendField('else if').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
			
			this.appendStatementInput('stateinp' + i).appendField('then').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
			
		}

		if(this.elseCount_){
			//this.appendValueInput('elseinp').appendField('else').setAlign(Blockly.ALIGN_RIGHT);
			this.appendStatementInput('else').appendField('else').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
		}

	},
	
	decompose: function(workspace){
		
		var containerBlock = workspace.newBlock('if_mutator');
		containerBlock.initSvg();

		var connection = containerBlock.getInput('STACK').connection;

		for(var i = 1; i <= this.elseIfCount_; ++i){
			var add = workspace.newBlock('if_else_if');
			add.initSvg();
			

			connection.connect(add.previousConnection);
			connection = add.nextConnection;
		}

		if(this.elseCount_){
			var defaultBlock = workspace.newBlock('if_else');
			defaultBlock.initSvg();

			connection.connect(defaultBlock.previousConnection);
		}

		return containerBlock;
	},
	
	compose: function(containerBlock){
		
		if(this.elseCount_){
			//this.removeInput('elseinp');
			this.removeInput('else');
		}

		this.elseCount_ = 0;

		for(var i = this.elseIfCount_; i > 0; --i){
			this.removeInput('valinp' + i);
			this.removeInput('stateinp' + i);
		}

		this.elseIfCount_ = 0;

		var clauseBlock = containerBlock.getInputTargetBlock('STACK');

		while(clauseBlock){
			
			switch(clauseBlock.type){

				case 'if_else_if':
					this.elseIfCount_++;

					//else if value inputs
					var caseInputVal = this.appendValueInput('valinp' + this.elseIfCount_).setCheck(null).appendField('else if').setAlign(Blockly.ALIGN_RIGHT);
					
					if(clauseBlock.valueConnection_){
						caseInputVal.connection.connect(clauseBlock.valueConnection_);
					}
					
					//else if statement inputs
					var caseInputState = this.appendStatementInput('stateinp' + this.elseIfCount_).appendField('then').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
					
					if(clauseBlock.statementConnection_){
						caseInputState.connection.connect(clauseBlock.statementConnection_);
					}

				break;
				
				case 'if_else':
					this.elseCount_++;
					
					//Else value input
					//var defaultInputDum = this.appendDummyInput('elseinp').appendField('else').setAlign(Blockly.ALIGN_RIGHT);
					
					//if(clauseBlock.valueConnection_){
					//	defaultInputDum.connection.connect(clauseBlock.valueConnection_);
					//}
					
					//Else statement input
					var defaultInputState = this.appendStatementInput('else').appendField('else').setAlign(Blockly.ALIGN_RIGHT).setCheck(null);
					
					if(clauseBlock.statementConnection_){
						defaultInputState.connection.connect(clauseBlock.statementConnection_);
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
				case 'if_else_if':
					console.log(i);
					
					var inputPrintVal = this.getInput('valinp' + i);
					
					clauseBlock.valueConnection_ = inputPrintVal && inputPrintVal.connection.targetConnection;
					
					var inputPrintState = this.getInput('stateinp' + i);
					
					clauseBlock.statementConnection_ = inputPrintState && inputPrintState.connection.targetConnection;
					
					i++;
					
				break;

				case 'if_else':

					var defaultInput = this.getInput('else');

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
	
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//End Scope check
		
		for(var i = 0; i <= this.elseIfCount_; ++i){
			let block = this.getInputTargetBlock('valinp' + i);
			
			if(block){
				if(block.typeName_ !== "bool"){
					TT += 'Error, "if" condition #' + (i + 1) + ' requires a bool current type: "' + block.typeName_ + '".\n';
				}
				
			}
			else {
				TT += 'Error, "if" condition #' + (i + 1) + ' requires an input.\n';
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

Blockly.C['if_statement'] = function(block){
	var code = '';
	
	code += 'if(';
	
	for(var i = 0; i <= this.elseIfCount_; i++){
		
		let val = [
			Blockly.C.valueToCode(this, 'valinp' + i, Blockly.C.ORDER_ATOMIC),
			Blockly.C.statementToCode(this, 'stateinp' + i, Blockly.C.ORDER_ATOMIC)
		];
		
		if(val[0].length > 0){
			code += val[0];
		}
		else {
			code += 'false';
		}
		
		code += '){\n';
		
		code += val[1];
		
		code += '}\n';
		
		if(i < this.elseIfCount_){
			code += 'else if(';
		}
	}
	
	if(this.elseCount_){
		code += 'else {\n'
		
		code += Blockly.C.statementToCode(this, 'else', Blockly.C.ORDER_ATOMIC);
		
		code += '}';
	}
	
	code += '\n';
	
	return code;
};

Blockly.Blocks['logic_comparison'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField('', 'parenthesis1');
			
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(
				[
				["==","=="],
				["!=","!="],
				[">",">"],
				[">=",">="],
				["<","<"],
				["<=","<="]
				]
			), "dropdown1");

		this.appendValueInput("valinp2")
			.setCheck(null);
			
		this.parenthesisOptions_ = [
			['', ''],
			['()', '()']
		];
			
		this.appendDummyInput()
			.appendField('', 'parenthesis2')
			.appendField(new Blockly.FieldDropdown(this.parenthesisOptions_), 'parenthesisOptions');
		
		this.setInputsInline(true);
		this.setOutput(true, null);
		this.setColour(logicHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.parenthesis_ = false;
		
		this.typeName_ = "bool";
		
	},
  
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.parenthesis_ = this.getFieldValue('parenthesisOptions') === '()';
		
		
		
		if(this.parenthesis_){
			this.setFieldValue('(', 'parenthesis1');
			this.setFieldValue(')', 'parenthesis2');
		}
		else {
			this.setFieldValue('', 'parenthesis1');
			this.setFieldValue('', 'parenthesis2');
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//Get the first and second input blocks
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		if(block[0]){
			
		}
		else{
			TT += 'Error, input left of operand is required.\n';
		}
		
		if(block[1]){
			
		}
		else{
			TT += 'Error, input right of operand is required.\n';
		}
		
		//Check if the block is within a scope
		
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

Blockly.C['logic_comparison'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var dropdown_dropdown1 = block.getField('dropdown1').getText();
	var value_valinp2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	
	// TODO: Assemble C into code variable.
	var code = '';
	
	if(this.parenthesis_){ code += '('; }
	
	if(value_valinp1.length < 1){
		code += '0';
	}
	else {
		code += value_valinp1;
	}
	
	code += ' ' + dropdown_dropdown1 + ' ';
	
	if(value_valinp2.length < 1){
		code += '0';
	}
	else {
		code += value_valinp2;
	}
	
	if(this.parenthesis_){ 
		code += ')'; 
	}
	
	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['logic_operators'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField('', 'parenthesis1');
			
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(
				[
				["&&","&&"],
				["||","||"]
				]
			), "dropdown1");

		this.appendValueInput("valinp2")
			.setCheck(null);
			
		this.parenthesisOptions_ = [
			['', ''],
			['()', '()']
		];
			
		this.appendDummyInput()
			.appendField('', 'parenthesis2')
			.appendField(new Blockly.FieldDropdown(this.parenthesisOptions_), 'parenthesisOptions');
		
		this.setInputsInline(true);
		this.setOutput(true, null);
		this.setColour(logicHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.parenthesis_ = false;
		
		this.typeName_ = "bool";
		
	},
  
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.parenthesis_ = this.getFieldValue('parenthesisOptions') === '()';
		
		
		
		if(this.parenthesis_){
			this.setFieldValue('(', 'parenthesis1');
			this.setFieldValue(')', 'parenthesis2');
		}
		else {
			this.setFieldValue('', 'parenthesis1');
			this.setFieldValue('', 'parenthesis2');
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//Get the first and second input blocks
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		if(block[0]){
			
		}
		else{
			TT += 'Error, input left of operand is required.\n';
		}
		
		if(block[1]){
			
		}
		else{
			TT += 'Error, input right of operand is required.\n';
		}
		
		//Check if the block is within a scope
		
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

Blockly.C['logic_operators'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var dropdown_dropdown1 = block.getField('dropdown1').getText();
	var value_valinp2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	
	// TODO: Assemble C into code variable.
	var code = '';
	
	if(this.parenthesis_){ code += '('; }
	
	if(value_valinp1.length < 1){
		code += 'true';
	}
	else {
		code += value_valinp1;
	}
	
	code += ' ' + dropdown_dropdown1 + ' ';
	
	if(value_valinp2.length < 1){
		code += 'true';
	}
	else {
		code += value_valinp2;
	}
	
	if(this.parenthesis_){ code += ')'; }
	
	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};






Blockly.Blocks['unary_negation'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("!");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		
		this.setColour(logicHUE);
		
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.typeName_ = "bool";
		
	},
  
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			if(block.typeName_ !== 'bool'){
				TT += 'Error, negation requires a "bool", current type is: "' + block.typeName_ + '".\n';
			}
		}
		else {
			TT += 'Error, an input is required.\n';
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

Blockly.C['unary_negation'] = function(block) {
	var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	
	// TODO: Assemble C into code variable.
	var code = '';
	
	code += '!' + val1;
	
	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};
