
var cctypeHUE = 175;

Blockly.Blocks['cctype_isalpha'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("isalpha(");
		
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		this.setOutput(true);
		
		this.setColour(cctypeHUE);
		this.setTooltip("Checks if the inputted character is alphabetic.\nReturns - Bool\nRequires - <cctype>\nInput - Char");
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/isalpha/");
		
		this.typeName_ = "bool";
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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
		
	}};

Blockly.C['cctype_isalpha'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "'a'"
	}

	code += "isalpha(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cctype_isdigit'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("isdigit(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		
		this.setColour(cctypeHUE);

		this.setTooltip("Checks if the inputted character is alphabetic.\nReturns - Bool\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/isdigit/");
		
		this.typeName_ = "bool";
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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
		
	}};

Blockly.C['cctype_isdigit'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "'0'";
	}

	code += "isdigit(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cctype_isspace'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("isspace(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		this.setColour(cctypeHUE);

		this.setTooltip("Checks if the inputted character is a whitespace.\nReturns - Bool\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/isspace/");

		
		this.typeName_ = "bool";
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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

Blockly.C['cctype_isspace'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "' '";
	}

	code += "isspace(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cctype_isupper'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("isupper(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		this.setColour(cctypeHUE);
		
		this.setTooltip("Checks if the inputted character is an uppercase letter.\nReturns - Bool\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/isupper/");
		
		this.typeName_ = "bool";
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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

Blockly.C['cctype_isupper'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "'A'";
	}

	code += "isupper(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};


Blockly.Blocks['cctype_islower'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("islower(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		this.setColour(cctypeHUE);

		this.setTooltip("Checks if the inputted character is a lowercase letter.\nReturns - Bool\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/islower/");
		
		this.typeName_ = "bool";
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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

Blockly.C['cctype_islower'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "'a'";
	}

	code += "islower(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cctype_toupper'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("toupper(");
		this.appendDummyInput()
			.appendField(")");
		this.setInputsInline(true);
		
		this.setOutput(true);
		
		this.setColour(cctypeHUE);
		
		this.setTooltip("Convert a lowercase letter to uppercase.\nReturns - Char\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/toupper/");

		this.typeName_ = "char";

		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateWarnings();
	},
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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
		
	}};

Blockly.C['cctype_toupper'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length < 1){
		value_valinp1 = "'a'";
	}

	code += "toupper(" + value_valinp1 + ")";

	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['cctype_tolower'] = {
	init: function() {
		
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("tolower(");
			
		this.appendDummyInput()
			.appendField(")");
			
		this.setInputsInline(true);
		
		this.setOutput(true);
		
		this.setColour(cctypeHUE);
		
		this.setTooltip("Convert an uppercase letter to lowercase.\nReturns - Char\nRequires - <cctype>\nInput - Char");
		
		this.setHelpUrl("http://www.cplusplus.com/reference/cctype/tolower/");

		this.typeName_ = "char";

		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateWarnings();
	},
	
	allocateWarnings: function(){
		var val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
		
		let block = this.getInputTargetBlock('valinp1');
		
		var TT = "";
		
		if(block){
			if(block.typeName_ !== "char"){
				TT += 'Error, parameter requires type "char", currently is type "' + block.typeName_ + '" .\n';
			}
			
			if(val1.length > 0){
				
			}
			else {
				TT += 'Error, input required.\n';
			}
		}
		else{
			TT += 'Error, parameter requires an input.\n';
		}
		
		
		//create an instance of C_Include
		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_cctype']);
		
		if(!libFound){
			TT += "Error, <cctype> library must be included.\n";
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

Blockly.C['cctype_tolower'] = function(block) {
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';

	if(value_valinp1.length > 0){
		code += "tolower(" + value_valinp1 + ")";
	}


	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};