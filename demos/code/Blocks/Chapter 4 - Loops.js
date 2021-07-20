Blockly.Blocks['loop_whiledo'] = {
	init: function() {
		this.appendValueInput("valinp")
			.setCheck(null)
			.appendField("repeat")
			.appendField(new Blockly.FieldDropdown([["while","myLoopVarWhile"], ["until","myLoopVarUntil"]]), "myLoopVar");
		this.appendStatementInput("statement_input")
			.setCheck(null)
			.appendField("do");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(135);
		this.setTooltip("A while loop will run code as long as the set condition is true.");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_while_loop.htm");
	},
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var TT = "";

		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['loop_whiledo'] = function(block) {
	var dropdown_myloopvar = this.getField('myLoopVar').getText();
	var value_valinp = Blockly.C.valueToCode(block, 'valinp', Blockly.C.ORDER_ATOMIC);
	var statements_statement_input = Blockly.C.statementToCode(block, 'statement_input');
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'while(';

	if(dropdown_myloopvar == 'until'){
		code += '!';
	}


	if(value_valinp.length > 0){
		code += value_valinp;
	}
	else {
		code += 'true';
	}

	code += '){\n';

	if(statements_statement_input.length > 0){
		code += statements_statement_input;
	}
	else {

	}


	code += '}\n';

	return code;
};

Blockly.Blocks['loop_for'] = {
	init: function() {

		this.pTypes_ = [
			["int","myLoopVarInt"], 
			["size_t","myLoopVarSize_t"],
			["double","myLoopVarDouble"],
			["char", "char"],
			["short", "short"],
			["long", "long"],
			["long long", "long long"]
		];

		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("for (")
			.appendField(new Blockly.FieldDropdown(this.pTypes_), "myLoopVarType")
			.appendField(new Blockly.FieldTextInput('i'), 'myLoopVar1')
			.appendField("=");

		this.appendDummyInput()
			.appendField(";")
			.appendField('i', 'myLoopVar2')
			.appendField(new Blockly.FieldDropdown([["<","LESSER"], [">","GREATER"], ["<=","LEQUAL"], [">=","GEQUAL"], ["==","EQUAL"], ["!=","NEQUAL"]]), "myLoopVarComp");

		this.appendValueInput("valinp2")
			.setCheck("Number");

		this.appendDummyInput()
			.appendField(";")
			.appendField('i', 'myLoopVar3')
			.appendField(new Blockly.FieldDropdown([["++","myLoopInc"], ["--","myLoopDec"]]), "myLoopCh")
			.appendField(")");

		this.appendStatementInput("stateinp1")
			.setCheck(null);

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(135);
		this.setTooltip("A for loop is a loop that allows you to loop through a code a specific number of times.");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_for_loop.htm");

	},

	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		//variable to keep track of loop var declaration
		this.getVar_ = this.getField('myLoopVar1').getText();
		this.typeName_ = this.getField('myLoopVarType').getText();

		let block = this.getInputTargetBlock('valinp1');

		if(block){
			this.value_ = block.value_;
		}
		
		if(this.value_.length > 0){
			this.isInitialized_ = true;
		}
		else {
			this.isInitialized_ = false;
		}
		//
		this.getField('myLoopVar2').setValue(this.getVar_);
		this.getField('myLoopVar3').setValue(this.getVar_);
	},
	
	allocateWarnings: function(){
		var comparator = this.getField('myLoopVarComp').getText();
		var incrementing = (this.getField('myLoopCh').getText() === "++");
		
		var TT = '';

		C = C_Logic;
		
		//Array to store the input blocks
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];

		//Array to store the values in the input blocks
		let val = [];
		
		if(block[0]){ val[0] = parseFloat( block[0].value_ ); }
		if(block[1]){ val[1] = parseFloat( block[1].value_ ); }
		
		//if both inputs are numbers
		if( block[0] && block[1] && C.help.is_of_type_number(block[0].typeName_) && C.help.is_of_type_number(block[1].typeName_) ){
			//Warnings based on infinite loops
			

			//errors relating to the less than comparator
			if(comparator === ">=" || comparator === ">" ){

				//Infinite incrementing
				if( val[0] > val[1] && incrementing ){

					TT += 'Warning, "' + val[0]+ '" is always greater than "' + val[1] + '" while incrementing: an infinite loop will occur.\n';
				}

			}
			
			//errors relating to the greater than comparator
			if(comparator === "<=" || comparator === "<" ){
				//Infinite decrementing
				if( val[0] < val[1] && !incrementing ){
					TT += 'Warning, "' + val[0] + '" is always less than "' + val[1] + '" while decrementing: an infinite loop will occur.\n';
				}
			}
		}
		
		//Check each input for an inproper type
		for(var i = 0; i < this.childBlocks_.length; ++i){
			if(block[i]){

				//If the input types are not numeric
				if(!C.help.is_of_type_numeric(block[i].typeName_)){
					TT += 'Error, type "' + block[i].typeName_ + '" cannot be used in a loop.\n';
				}
				
			}
		}
		
		var variableCheck = C.logic.variable_format(this.getVar_);

		if(!variableCheck[0]){
			for(var i = 1; i < variableCheck.length; ++i){
				TT += variableCheck[i];
			}
		}


		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}

		//end scope checking
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
		
	}

};

Blockly.C['loop_for'] = function(block) {
	var dropdown_myloopvartype = this.getField('myLoopVarType').getText();
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	var dropdown_myloopvarcomp = this.getField('myLoopVarComp').getText();
	var value_valinp2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	var dropdown_myloopch = this.getField('myLoopCh').getText();

 	var statements_stateinp1 = Blockly.C.statementToCode(block, 'stateinp1');
	// TODO: Assemble C into code variable.
	var code = '';

	code += "for(" + dropdown_myloopvartype + " "
	+ this.getVar_ + " = " + value_valinp1 + '; '
	+ this.getVar_ + " " + dropdown_myloopvarcomp + " " + value_valinp2 + '; '
	+ this.getVar_ + dropdown_myloopch;
	
	code += '){\n';
	
	code += statements_stateinp1;
	
	code += '}\n';
	
	return code;
};

Blockly.Blocks['loop_range'] = {
	init: function() {

		this.appendDummyInput()
			.appendField("for(auto ")
			.appendField(new Blockly.FieldTextInput("x"), "myVar")
			.appendField(":")
		
		this.appendValueInput('valinp1')
			.setCheck(null)
			.appendField('');
			
		this.appendStatementInput("stateinp1")
			.setCheck(null);


		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(135);
		this.setTooltip("A for-range loop is a for loop that ranges through an array or vector. This is a useful way to easily loop through an array or vector without knowing its size.");
		this.setHelpUrl("https://docs.microsoft.com/en-us/cpp/cpp/range-based-for-statement-cpp?view=vs-2019");
		
		this.currentParam_ = "";
	
		this.isInitialized_ = true;
	},

	onchange: function(){
		
		this.allocateValues();
		this.allocateBlock();
		this.allocateWarnings();
	},

	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			this.typeName_ = block.typeName_;
		}
		
		this.getVar_ = this.getField('myVar').getText();
		this.currentParam_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
	},
	
	allocateBlock: function(){
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			block.setColour(this.getColour());
			block.setMovable(false);
			block.setDeletable(false);
		}

	},

	allocateWarnings: function(){
		var TT = "";
		
		if(this.getVar_.length < 1){
			TT += "Error, variable required in auto declaration.\n";
		}
		
		if(this.currentParam_.length < 1){
			TT += 'Error, you must have a container (vector or array) to iterate through.\n'
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
	},
	
};

Blockly.C['loop_range'] = function(block) {
	var statements_name = Blockly.C.statementToCode(block, 'stateinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += "for(auto " + this.getVar_ + " : " + this.currentParam_+ ")";

	code += "{\n";

	code += statements_name;

	code += "}\n";

	return code;
};

Blockly.Blocks['loop_dowhile'] = {
	init: function() {
		this.appendStatementInput("stateinp1")
			.setCheck(null)
			.appendField("do");
		this.appendValueInput("valinp1")
			.setCheck("Boolean")
			.appendField("repeat")
			.appendField(new Blockly.FieldDropdown([["while","myLoopVarWhile"], ["until","myLoopVarUntil"]]), "myLoopVar");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(135);
		this.setTooltip("A do-while loop functions exactly the same way as a while loop, however the conditions are checked after the loop interates; meaning the loop will always run at least once.");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_do_while_loop.htm");
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
		
		//
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['loop_dowhile'] = function(block) {
	var statements_stateinp1 = Blockly.C.statementToCode(block, 'stateinp1');
	var dropdown_myloopvar = this.getField('myLoopVar').getText();
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += "do {\n";

	code += statements_stateinp1;

	code += "\n} while(";

	if(dropdown_myloopvar === "until"){
		code += "!";
	}

	if(value_valinp1.length < 1){
		code += "true";
	}
	else {
		code += value_valinp1;
	}

	code += ");\n";

	return code;
};

Blockly.Blocks['loop_break'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("break");
		this.setPreviousStatement(true, null);
		this.setColour(135);
		this.setTooltip("A break is a statement that forcefully ends a control loop. It will end the loop, regardless of whether or not the loop condition itself has been met.");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_break_statement.htm");
	},
  
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings(){
		var TT = "";
		let ptr = this.getSurroundParent();
		
		var condition;
		
		var insideLoop = false;
		while(ptr){
			
			condition = (ptr && ptr.type == "loop_whiledo" || ptr.type == "loop_for" || ptr.type == "loop_range");
			
			if(condition){
				insideLoop = true;
				break;
			}
			
			ptr = ptr.getSurroundParent();
		}
		
		if(!insideLoop){
			TT += "Error, a break statement must be inside of a loop.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['loop_break'] = function(block) {
	// TODO: Assemble C into code variable.
	var code = 'break;\n';
	return code;
};
