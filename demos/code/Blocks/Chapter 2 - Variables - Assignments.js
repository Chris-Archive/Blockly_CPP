var mathHUE = 230;



Blockly.Blocks['math_parenthesis'] = {
	init: function() {
		this.appendDummyInput()
			  .appendField("paranthesis?")
			  .appendField(new Blockly.FieldCheckbox("FALSE"), "check1");
		this.setColour(mathHUE);
		this.setTooltip('');
		this.setHelpUrl('');
	}
	
};

Blockly.Blocks['math_arith'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.appendField("", "paren1")
			.setCheck(null);

		this.appendValueInput("valinp2")
			.setCheck(null)
			.appendField(new Blockly.FieldDropdown([["+","math_add"], ["-","math_min"], ["*","math_mul"], ["/","math_div"], ["%", "math_mod"]]), "arith_op");

		this.appendDummyInput()
			.appendField("", "paren2")
			.appendField(new Blockly.FieldDropdown([["", ""], ["()", "()"]]), "parenthesis");

		this.setInputsInline(true);
		this.setOutput(true, null);
		this.setColour(mathHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.parenthesis = false;

		this.typeName_ = "int";
		
		this.value_ = 0;
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateType();
		this.allocateWarnings();
		this.allocateTooltip();
	},

	allocateValues: function(){
		this.parenthesis = (this.getFieldValue('parenthesis') === "()");
		
		if(this.parenthesis){
			this.setFieldValue("(", "paren1");
			this.setFieldValue(")", "paren2");
		}
		else {
			this.setFieldValue("", "paren1");
			this.setFieldValue("", "paren2");
		}
		
		
		var operator = this.getField('arith_op').getText();

		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];

		if( (block[0] && block[0].typeName_ === 'double') || ( block[1] && block[1].typeName_ === 'double') ) {
			this.typeName_ = "double";
		}
		else {
			this.typeName_ = "int";
		}


		//An array to store the code of the two value inputs
		//[0] = valinp1
		//[1] = valinp2
		var val = [0, 0];

		if(block[0]){
			val[0] = parseFloat(block[0].value_);
		} 

		if(block[1]){
			val[1] = parseFloat(block[1].value_);
		} 
		

		switch(operator){
			case '+':

				this.value_ = val[0] + val[1];

			break;

			case '-':

				this.value_ = val[0] - val[1];

			break;

			case '*':

				this.value_ = val[0] * val[1];

			break;

			case '/':

				if(val[1] != 0){
					this.value_ = val[0] / val[1];
				}
				else {
					this.value_ = 0;
				}

			break;

			case '%':

				if(val[1] != 0 && this.typeName_ !== "double"){
					this.value_ = val[0] % val[1];
				}
				else {
					this.value_ = 0;
				}

			break;
		}

		if(isNaN(this.value_)){
			this.value_ = 0;
		}

	},

	allocateType: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);

		var val2 = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);




	},
	
	allocateWarnings: function(){

		var operator = this.getField('arith_op').getText();

		//An array to store the code of the two value inputs
		//[0] = valinp1
		//[1] = valinp2
		var val = [
			Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),

			Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC)
		];

		var TT = "";
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//

		switch(operator){
			case '+':

			break;

			case '-':
				
			break;


			case '*':
				
			break;

			case '/':
				
			if(val[1] == 0){
				TT += 'Error, division by zero.\n';
			}
			else {

			}
			
			break;

			case '%':
				
				if(val[1] < 1){
					TT += 'Error, right modulo value must be at or greater than 1.\n';
				}

				if(this.typeName_ === "double"){
					TT += 'Error, modulo cannot be a double.\n'
				}

			break;
		}

		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	},
	
	allocateTooltip: function(){
		var TT = "";
		
		TT += "Value of this block is: " + this.value_ + ".\n";
		
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	}
};

Blockly.C['math_arith'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	var dropdown_arith_op = this.getField('arith_op').getText();

	var value_valinp2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);

	// TODO: Assemble C into code variable.
	var code = '';

	if(this.parenthesis){
		code += '(';
	}

	if(value_valinp1.length < 1){
		value_valinp1 = 0;
	}

	if(value_valinp2.length < 1){
		value_valinp2 = 0;
	}

	code += value_valinp1 + ' ' + dropdown_arith_op + ' ' + value_valinp2;

	if(this.parenthesis){
		code += ')';
	}

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['math_unary'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("negative -");

		this.setInputsInline(true);

		this.setOutput(true, null);

		this.setColour(mathHUE);

		this.setTooltip("");

		this.setHelpUrl("");
	},
  
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
		this.allocateTooltip();
	},

	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			this.getVar_ = block.getVar_;
			this.typeName_ = block.typeName_;
			this.value_ = -parseFloat( block.value_ );
		}

	},
	
	allocateWarnings: function(){
		let block = this.getInputTargetBlock('valinp1');
		var TT = "";

		C = C_Logic;
	
		if(block){

			if(!C.help.is_of_type_number( this.typeName_ ) ){
				TT += 'Error, this block requires a number type.\n';
			}

			if(this.typeName_ === "size_t"){
				TT += 'Error, a minus operator cannot be applied to an unsigned type.\n';
			}

		}
		else {
			TT += 'Error, must negate a number.\n';
		}
	
		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n"
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
	
	allocateTooltip: function(){
		var TT = "Returns the negative of the number or variable.\nReturns - Number or Variable\n\nInput - Number or Variable\n";
		
		if(!isNaN(this.value_)){
			TT += "The value of this block is: " + this.value_ + ".\n";
		}
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	}
};

Blockly.C['math_unary'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = "";

	if(value_valinp1.length > 0){
		code += '-' + value_valinp1;
	}

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['math_sqrt'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("Square Root (");
		this.appendValueInput("valinp1")
			.setCheck(null);
		this.appendDummyInput()
			.appendField(")");
		this.setOutput(true);
		this.setColour(mathHUE);
		this.setTooltip("");
		this.setHelpUrl("http://www.cplusplus.com/reference/cmath/sqrt/");

		this.typeName_ = "double";
		
		this.value_ = 0;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
		this.allocateTooltip();
	},
	
	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			this.value_ = Math.sqrt(parseFloat(block.value_));
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var cMathFound = librarySearch.search_library(this, ['include_math']);
		
		if(!cMathFound){
			TT += "Error, <cmath> library must be included.\n";
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
	
	allocateTooltip: function(){
		var TT = "Returns the square root of the inputted number.\nReturns - Double or Float\nRequires - <cmath>\nInput - Number\n";
		
		if(!isNaN(this.value_)){
			TT += "Current value - " + this.value_ + ".\n";
		}
		
		
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	},
	//Add iostream for cin
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_math']);
		
		//create an initialization block
		if(!libFound){
			
			automate_library_string= {
				text: "include <cmath>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_math');
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

Blockly.C['math_sqrt'] = function(block) {
	var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.

	var code = '';

	if(value_name.length > 0){
		code = 'sqrt(' + value_name + ')';
	}


	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['number_rand'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("rand() %");
		this.appendValueInput("valinp2")
			.setCheck(null)
			.appendField("+");
		this.appendDummyInput();
		this.setOutput(true, ["Number", "Int"]);
		this.setColour(mathHUE);
		this.setTooltip("");
		this.setHelpUrl("http://www.cplusplus.com/reference/cstdlib/rand/");
		
		this.value1_ = 0;
		this.value2_ = 0;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
		this.allocateTooltip();
	},
	
	allocateValues: function(){
		let C = C_Logic;
		this.typeName_ = "int";
		
		
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		var val = [0, 0];
		
		if(block[0]){
			val[0] = parseInt(block[0].value_);
		}
		
		if(block[1]){ 
			val[1] = parseInt(block[1].value_);
			
			if(block[1].typeName_ !== "int" && C.help.is_of_type_number(block[1].typeName_)){
				this.typeName_ = block[1].typeName_;
			}
			
		}
		
		this.value1_ = val[0];
		this.value2_ = val[1];
	},
	
	
	allocateWarnings: function(){
				console.log(this.typeName_);
		let C = C_Logic;
		
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;

		var libFound = librarySearch.search_library(this, ['include_iostream', 'include_cstdlib']);
		
		if(!libFound){
			TT += "Error, <iostream> or <cstdlib> library must be included.\n";
		}
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		if(block[0]){
			
			if(!C.help.is_of_type_integer(block[0].typeName_)){
				TT += "Error, modulo can only be used with a whole number.\n";
			}
			
			if(block[0].value_ <= 0){
				TT += "Error, cannot do modulo < 1 .\n";
			}
			
		}
		
		if(block[1]){
			
			if(!C.help.is_of_type_number(block[1].typeName_)){
				TT += 'Error, input #2 must of an "int", "size_t", "double", "short", "long", "long long", current type: "' + block[1].typeName_ + '".\n';
			}
		}
		
		//
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	},
	
	allocateTooltip: function(){
		var TT = "Generates a pseudo-random number between zero and the first number (including), added by the second (excluding).\nReturns - int\nRequires - <iostream> or <cstdlib>\nInput(s) - Number";
		
		
		TT += "\nWill generate a number between " + this.value2_ + " and " + (this.value1_ + this.value2_) + ".\n";
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	},

	//Add cstdlib for rand
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_iostream', 'include_cstdlib']);
		
		
		//create an initialization block
		if(!libFound){
			
			automate_library_string= {
				text: '#include cstdlib',
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

Blockly.C['number_rand'] = function(block) {
	var value_name1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var value_name2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.

	var binInp1 = '';
	var binInp2 = '';

	if(value_name1.length < 1){ binInp1 = 10; }
	else {binInp1 = value_name1; }
	if(value_name2.length < 1){ binInp2 = 1; }
	else {binInp2 = value_name2; }

  	var code = 'rand() % ' + binInp1 + ' + ' + binInp2;

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['number_srand'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("srand(");
		this.appendValueInput("valinp1")
			.setCheck(["Number", "Time_t", "Null"]);
		this.appendDummyInput()
			.appendField(")");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(mathHUE);
		this.setTooltip("Determines the seed for rand. Different seeds will result in a different succession of numbers for rand().\nRequires - <ctime>\nInput - unsigned or NULL");
		this.setHelpUrl("http://www.cplusplus.com/reference/cstdlib/srand/");
	},
	
	onchange: function(){
		this.allocateBlock();
		this.allocateWarnings();
	},
	
	allocateBlock: function(){
		let block = this.childBlocks_[0];
		
		if(block){
			block.setMovable(false);
			block.setDeletable(false);
			
			//get the connection after that
			block = block.childBlocks_[0];
			
			if(block){
				block.setColour(this.getColour());
				block.setMovable(false);
				block.setDeletable(false);
			}
		}
	},
			
	allocateWarnings: function(){
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		

		var cMathFound = librarySearch.search_library(this, ['include_ctime','include_cstdlib']);
		
		if(!cMathFound){
			TT += "Error, <ctime> and/or <cstdlib> library must be included.\n";
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

	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;		
		// call from code.js
		autoInclude('ctime', BlockScope, options);
		autoInclude('cstdlib', BlockScope, options);
	}
};



Blockly.C['number_srand'] = function(block) {
	var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_name.length > 0){
		code += 'srand(' + value_name + ')';
	}
	else {
		code += 'srand(1)';
	}

	code += ';\n';

	return code;
};

Blockly.Blocks['time_time'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("time(");
		this.appendValueInput("valinp1")
			.setCheck(null);
		this.appendDummyInput()
			.appendField(")");
		this.setOutput(true);
		this.setColour(mathHUE);
		this.setTooltip("Returns the number of seconds since January 1, 1970 at 00:00:00 GMT.\nReturns - time_t\nRequires - <ctime>\nInput - time_t or NULL");
		this.setHelpUrl("https://www.programiz.com/cpp-programming/library-function/ctime/time");

		this.typeName_ = "Time_t";
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		

		var cMathFound = librarySearch.search_library(this, ['include_ctime']);
		
		if(!cMathFound){
			TT += "Error, <ctime> library must be included.\n";
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
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;		
		// call from code.js
		autoInclude('ctime', BlockScope, options);
		
	}
};

Blockly.C['time_time'] = function(block) {
	var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_name.length > 0){
		code = 'time(' + value_name + ')';
	}
	else {
		code = 'time(NULL)';
	}

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['math_fabs'] = {
	init: function() {

		this.appendValueInput("valinp1")
			.setCheck("Number")
			.appendField("fabs(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		
		this.setColour(mathHUE);
		this.setTooltip("");
		this.setHelpUrl("http://www.cplusplus.com/reference/cmath/fabs/");

		this.typeName_ = "int";
		
		this.value_ = 0;
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
		this.allocateTooltip();
	},

	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			this.getVar_ = block.getVar_;
			this.typeName_ = block.typeName_;
			this.value_ = Math.abs( parseFloat( block.value_ ) );
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		
		var cMathFound = librarySearch.search_library(this, ['include_math']);
		
		if(!cMathFound){
			TT += "Error, <cmath> library must be included.\n";
		}

		C = C_Logic;
		if(!C.help.is_of_type_number( this.typeName_ )){
			TT += "Error, input must be a number.\n";
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
	
	allocateTooltip: function(){
		var TT = "Returns the absolute value of the inputted number.\nReturns - Number\nRequires - <cmath>\nInput - Number\n";
		
		if(!isNaN(this.value_)){
			TT += "This block currently generates " + this.value_ + "\n";
		}
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	},
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;		
		// call from code.js
		autoInclude('cmath', BlockScope, options);
		
	}
};

Blockly.C['math_fabs'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'fabs(' + value_valinp1 + ')';


	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['math_pow'] = {
	init: function() {

		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("pow(");

		this.appendValueInput("valinp2")
			.setCheck(null)
			.appendField(",");

		this.appendDummyInput()
			.appendField(")");

		this.setInputsInline(true);
		this.setOutput(true);
		this.setColour(mathHUE);
		this.setTooltip("");
		this.setHelpUrl("http://www.cplusplus.com/reference/cmath/pow/");

		this.typeName_ = "double";
		
		this.value_ = 0;
		this.value1_ = 0;
		this.value2_ = 0;
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
		this.allocateTooltip();
	},

	allocateValues: function(){
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		var val = [0, 0];
		
		if(block[0]) { val[0] = parseFloat(block[0].value_); }
		if(block[1]) { val[1] = parseFloat(block[1].value_); }
		
		this.value_ = Math.pow(val[0], val[1]);
		
		this.value1_ = val[0];
		this.value2_ = val[1];
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		

		var cMathFound = librarySearch.search_library(this, ['include_math']);
		
		if(!cMathFound){
			TT += "Error, <cmath> library must be included.\n";
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
	
	allocateTooltip: function(){
		var TT = "Raise the first number to the power of the second number.\nReturns - Number\nRequires - <cmath>\nInput(s) - Number\n";
		
		if(!isNaN(this.value_)){
			TT += "This block generates: " + this.value1_ + "^" + this.value2_ + " = " + this.value_ + "\n";
		}
		
		if(TT.length > 0){
			this.setTooltip(TT);
		}
		else {
			this.setTooltip(null);
		}
	},
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;		
		// call from code.js
		autoInclude('cmath', BlockScope, options);
		
	}
};

Blockly.C['math_pow'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var value_valinp2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'pow(' + value_valinp1 + ', ' + value_valinp2 + ')';

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['static_cast'] = {
	init: function() {
	this.appendValueInput("valinp1")
		.appendField("static_cast<")
		.appendField(new Blockly.FieldDropdown([["int","int"], ["size_t","size_t"], ["double","double"]]), "myType")

		.appendField(">(")
		.setCheck(null);

	this.appendDummyInput()
		.appendField(")");
	this.setOutput(true, null);
	this.setColour(mathHUE);
	this.setTooltip("Changes the type of the inputted number.\nReturns - static_cast type\nInput - Number");
	this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/typecasting/");
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		let block = this.getInputTargetBlock('valinp1');

		this.typeName_ = this.getField('myType').getText();

		if(block){
			this.value_ = block.value_;
		}
		else {
			this.value_ = "";
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//Check if the block is within a scope
		
		let Scope = C_Scope;

		if(!Scope.node.is_in_scope(this, ['isFunc'])){
			TT += "Error, this block must be inside of a function or main.\n";
		}
		
		//end scope check

		let block = this.getInputTargetBlock('valinp1');

		if(block){
			C = C_Logic;

			if(!C.help.is_of_type_number(block.typeName_) && block.typeName_ !== "bool" ){
				TT += "Error, static_cast parameter must be a number.\n";
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

Blockly.C['static_cast'] = function(block) {
	var dropdown_mytype = this.getField('myType').getText();
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'static_cast<' + dropdown_mytype + '>(' + value_valinp1 + ')';


	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['math_pi'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("const double")
			.appendField(new Blockly.FieldVariable("PI_VAL"), "valinp1");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(mathHUE);
		this.setTooltip("Defines the constant PI.");
		this.setHelpUrl("");
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

Blockly.C['math_pi'] = function(block) {
	var variable_valinp1 = Blockly.C.variableDB_.getName(block.getFieldValue('valinp1'), Blockly.Variables.NAME_TYPE);
	// TODO: Assemble C into code variable.
	var code = '';

	code += 'const double ' + variable_valinp1 + '  = 3.14159265;\n';

	return code;
};

Blockly.Blocks['math_scinum'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, -Infinity, Infinity, 1), "num1")
			.appendField("e")
			.appendField(new Blockly.FieldNumber(2, -Infinity, 20, 1), "num2");
		this.setOutput(true);
		this.setColour(mathHUE);
		this.setTooltip("Defines an exponential number.\nReturns - Double");
		this.setHelpUrl("http://www.cplusplus.com/reference/ios/scientific/");

		this.typeName_ = "double";
	},
  
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		



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

Blockly.C['math_scinum'] = function(block) {
	var number_num1 = block.getFieldValue('num1');
	var number_num2 = block.getFieldValue('num2');
	// TODO: Assemble C into code variable.
	var code = '';

	code += number_num1 + 'e' + number_num2;

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['math_compound'] = {
	init: function() {
		
		this.operators_ = [
			["+", "+"],
			["-", "-"],
			["*", "*"],
			["/", "/"],
			["%", "%"]
		];
		
		this.appendValueInput("valinp1")
			.setCheck(null);
		
		this.appendValueInput("valinp2")
			.appendField(new Blockly.FieldDropdown(this.operators_), "op")
			.appendField("=")
			.setCheck(null);
		
		this.setInputsInline(true);
		this.setColour(mathHUE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setTooltip("Compound assignment for variables.");
		this.setHelpUrl("https://www.tutorialspoint.com/Compound-Assignment-Operators-in-Cplusplus");
	},
  
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	},
	
	allocateWarnings: function(){
		let C = C_Logic;
		
		var TT = "";
		
		let block = [
			this.getInputTargetBlock('valinp1'),
			this.getInputTargetBlock('valinp2')
		];
		
		let val = [
			Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC),
			Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC)
		];
		
		if(block[0]){
			
			if(!block[0].isGetter_){
				TT += "Error, a literal cannot be used here.\n";
			}
			
			if(val[0].length < 1){
				TT += 'Error, a variable is required.\n';
			}
			
			if(!C.help.is_of_type_number(block[0].typeName_)){
				TT += 'Error, a number is required.\n';
			}
			
		}
		else {
			TT += 'Error, a variable is required.\n';
		}
		
		if(block[1]){
			
			if(val[1] && val[1].length < 1){
				TT += 'Error, a number is required.\n';
			}
			
		}
		else {
			TT += 'Error, a variable is required.\n';
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

Blockly.C['math_compound'] = function(block) {
	var val = Blockly.C.valueToCode(this, 'valinp2', Blockly.C.ORDER_ATOMIC);
	
	var code = "";
	
	if(this.getVar_.length > 0 && val.length > 0){
		code += this.getVar_ + ' ' + this.getFieldValue('op') + '= ' + val + ';\n';
	}
	
	return code;
};

Blockly.Blocks['math_pi'] = {
	init: function(){
		this.appendDummyInput()
			.appendField("const double PI = 3.1415926535");

		this.setColour(mathHUE);

		this.setTooltip("");
		this.setHelpUrl("");

		this.setPreviousStatement(true);
		this.setNextStatement(true);

		this.getVar_ = "PI";
		this.typeName_ = "double";
		this.isConst_ = true;

		this.setDataStr("isVar", true);

		this.setTooltip("Defines PI as a variable.\n");
		this.setHelpUrl("");
	},

	onchange: function(){
		this.allocateWarnings();
	},

	allocateWarnings: function(){
		var TT = "";

		//Error section dealing with scope conflicts (such as redeclarations)
		let ptr = this.parentBlock_;

		while(ptr){

			if(ptr.getDataStr() === "isVar" && ptr.getVar_ === this.getVar_){
				TT += 'Error, variable "' + this.getVar_ + '" has already been declared in this scope.\n';

				break;
			}

			ptr = ptr.parentBlock_;
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C["math_pi"] = function(){
	var code = "";

	code += "const double PI = 3.1415926535;\n";

	return code;
};










