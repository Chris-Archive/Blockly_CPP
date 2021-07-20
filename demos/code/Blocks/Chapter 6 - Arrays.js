
var arrayHUE = 195;

Blockly.Blocks['arr_dynamic'] = {
	init: function() {
		this.appendDummyInput()
			  .appendField("dynamic?")
			  .appendField(new Blockly.FieldCheckbox("FALSE"), "check1");
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
	},
	
	onchange: function(){
		
	}
	
};

Blockly.Blocks['array_1D'] = {
	init: function(){

		this.appendValueInput("valinp0")
			.setCheck(null)
			.appendField(new Blockly.FieldDropdown([["int","INT"], ["size_t","SIZE_T"], ["double","DOUBLE"], ["char","CHAR"], ["string","STRING"], ["bool","BOOL"]]), "myArrType")
			.appendField(new Blockly.FieldTextInput("myArr"), "myArrDef")
			.appendField('[')
		
		this.appendDummyInput()
			.appendField(']')
			.appendField('', 'init');

		this.appendStatementInput('stateinp0')
			.setCheck(['array_initialization']);

		this.appendDummyInput()
			.appendField('', 'init2');

		this.setInputsInline(true);

		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(arrayHUE);
		this.setTooltip('');

		this.typeName_ = "";
		this.getVar_ = "";

		//size of the array
		this.size_ = 1;
		//how many elements actually exist in the array
		this.allocatedSize_ = 0;

		//variable to check the number of dimensions
		this.dimensions_ = 1;

		this.arrayElements_ = [];
		this.arrayElementsValue_ = [];

		//is constant
		this.isConst_ = false;

		//set data structure as an array
		this.setDataStr("isArr", true);

		this.varProp_ = [];
	},

	onchange: function(){

		//this.setFieldValue(' = { ', 'init');

		this.allocateBlock();
		this.allocateValues();
		this.allocateArray();
		this.allocateWarnings();
	},
	
	/**
	 * Change the get_num block to align to the logic of arrays
	 */
	allocateBlock: function(){
		let block = this.getInputTargetBlock('valinp0');

		if(block && block.type === "get_num"){
			block.setColour( this.getColour() );
			block.getField('NUM').setPrecision(1);
			block.getField('NUM').setMin(1);
		}
	},

	allocateValues: function(){
		var val0 = Blockly.C.valueToCode( this, 'valinp0', Blockly.C.ORDER_NONE )
		let block = this.inputList[0].connection.targetConnection;

		this.typeName_ = this.getField('myArrType').getText();
		this.getVar_ = this.getField('myArrDef').getText();
		
		//Get the size from the value block if it's not a number
		if( block && block.sourceBlock_.type !== "get_num" && block.sourceBlock_.value_ && isNaN( val0 ) ){
			this.size_ = parseInt( block.sourceBlock_.value_ );
		}
		else{
			this.size_ = parseInt( val0 );
		}

		if(this.size_ < this.allocatedSize_){
			this.inputList[0].connection.targetConnection.sourceBlock_.setFieldValue(this.allocatedSize_, 'NUM');
		}

		//The number of elements that is currently initialized
		this.allocatedSize_ = this.arrayElements_.length;

		//If there exists at least one initialized element, at the array formatting
		if(this.allocatedSize_ > 0){
			this.setFieldValue('= {', 'init');
			this.setFieldValue('};', 'init2');
		}
		else {
			this.setFieldValue('', 'init');
			this.setFieldValue('', 'init2');
		}
		
		//clear the list
		this.arrayElements_ = [];
		this.arrayElementsValue_ = [];
		
		this.varProp_[0] = false;
		this.varProp_[1] = this.typeName_;
		this.varProp_[2] = "";
		this.varProp_[3] = this.getVar_;

	},

	allocateArray: function(){
		let ptr = this.getInputTargetBlock('stateinp0');

		var i = 0;
		while(ptr){

			if(ptr.type !== "array_1D_initialization"){ break };

			if(ptr.input_ && ptr.input_.length > 0){
				ptr.setFieldValue('[' + i.toString() + ']', 'init');

				this.arrayElements_[i] = ptr.input_;
				this.arrayElementsValue_[i] = ptr.value_;

				i++;
			}
			else {
				ptr.setFieldValue('', 'init');
			}

			ptr = ptr.nextConnection && ptr.nextConnection.targetBlock();
		}

	},
	
	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		display_elements = {
			text: "Display Array Data",
			enabled: true, 
	
			callback: function(){

				var temp = "";

				for(var i = 0; i < BlockScope.arrayElements_.length; ++i){
					temp += "[" + i + "] = " + BlockScope.arrayElementsValue_[i] + "\n";
				}

				alert(
					"Array type: " + BlockScope.typeName_ + "\n" + 
					"name: " + BlockScope.getVar_ + "\n" + 
					"size: " + BlockScope.size_ + "\n" + 
					"elements: \n" + temp
				);
			}
		};
		
		//Auto size array
		allocate_elements = {
			text: "Auto Allocate Array",
			enabled: true, 
	
			callback: function(){

			}
		};

		options.push(display_elements);
		//options.push(allocate_elements);
	},

	allocateWarnings: function(){
		var TT = "";

		//Size comparison section
		{
			let block = this.inputList[0].connection.targetConnection;

			if(block && block.sourceBlock_.type !== "get_num" && block.sourceBlock_.value_ && block.sourceBlock_.value_ < 1){
				TT += "Error, a variable size cannot be less than 1.\n";
			}
		
			if(this.size_ === 0 && this.arrayElements_.length === 0){
				TT += "Error, an array's size must be defined if it is not initialized.\n";
			}

			else if(this.size_ > 0 && this.arrayElements_.length > this.size_){
				TT += "Error, array size is " + this.size_ + " but there are " + this.arrayElements_.length + " elements.\n";
			}
		}

		//type checking size
		{
			var allowedTypes = ["int", "size_t", "short", "long", "long long"];
			//get the next block
			let block = this.inputList[0].connection.targetConnection;
			let blockExtended = "";

			//get the name of the variable
			if(block && block.sourceBlock_.typeName_){
				blockExtended = block.sourceBlock_.typeName_;
			}


			if(blockExtended.length > 0 && blockExtended !== allowedTypes[0] && blockExtended !== allowedTypes[1] && blockExtended !== allowedTypes[2] && blockExtended !== allowedTypes[3] && blockExtended !== allowedTypes[4] ){

				TT += 'Error, size type must be an Int, Size_t, Short, Long or Long long, current type: "' + blockExtended + '".\n';

			}
			
		}

		//type checking elements
		{
			let ptr = this.getInputTargetBlock('stateinp0');

			var i = 0;
			while(ptr){

				if(ptr.type !== "array_1D_initialization"){
					TT += "Block error, element #" + i.toString() + " requires a proper initialization block.\n";
				}

				//If the array init block is initialized and the two types are not the same
				else if(ptr && this.typeName_ !== ptr.typeName_ && ptr.input_.length > 0){
					
					TT += 'Error, element #' + i.toString() + ' is of type "' + ptr.typeName_ + '", array is of type "' + this.typeName_ + '".\n';
				}
				
				i++;
				ptr = ptr.nextConnection && ptr.nextConnection.targetBlock();
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

Blockly.C['array_1D'] = function(block){
	var val0 = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);

	var type = this.getField('myArrType').getText();

	C = C_Include;
	
	var code = '';
	var std = '';
	
	if(!C.using.std(block)){
		std = 'std::';
	}
	
	//if data type requires std::
	if(type === 'string'){
		code += std;
	}

	code += type + ' ' + this.getVar_;
	
	code += '[';

	if(val0.length > 0 || this.size_ > 0){
		code += val0;
	}

	code += ']';

	if(block.arrayElements_.length > 0){
		code += ' = { ';
		
		for(var i = 0; i < block.arrayElements_.length; ++i){
			code += block.arrayElements_[i];

			if(i < this.arrayElements_.length - 1){
				code += ", ";
			}

		}
		
		code += ' }';
	}

	code += ';\n';
	
	return code;
};


Blockly.Blocks['array_1D_initialization'] = {
	init: function() {
		this.appendValueInput("valinp0")
			.setCheck(null)
			.appendField("", "init");
		this.setColour(arrayHUE);

		this.setOutput(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);

		this.setTooltip("");
		this.setHelpUrl("");

		//the input code (in C++)
		this.input_ = "";

		//the value of the input (such as variables)
		this.value_ = "";

		//type
		this.typeName_ = "";
	},
	
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.input_ = Blockly.C.valueToCode(this, 'valinp0', Blockly.C.ORDER_ATOMIC);

		this.value_ = "";
		this.typeName_ = "";

		let block = this.getInputTargetBlock('valinp0');
		if(block){
			this.value_ = block.value_;
			this.typeName_ = block.typeName_;
		}

		//if the surround parent (array block)
		//does not exist, auto change the subscript
		if(!this.getSurroundParent()){
			this.setFieldValue('', 'init');
		}

		
	},

	allocateWarnings: function(){
		var TT = "";

		let ptr = this.getSurroundParent();

		var found = false;
		while(ptr){

			if(ptr.getDataStr() === "isArr"){
				found = true;
				break;
			}

			ptr = ptr.getSurroundParent();
		}

		if(!found){
			TT += 'Block Warning, this block must be in an array.\n';
		}

		if(TT.length > 0){
			this.setWarningText(TT)
		}
		else {
			this.setWarningText(null);
		}


	}
	
};

Blockly.C['array_1D_initialization'] = function(block){
	var code = "";
	
	if(block.input_.length > 0){
		code += block.input_;
	}

	return code;
};

Blockly.Blocks['array_1D_element'] = {
	init: function() {
		
		this.appendValueInput("valinp0")
			.setCheck(null);

		this.appendValueInput("valinp1")
			.appendField("[");

		this.appendDummyInput()
			.appendField("]");
			
			
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		
		this.setOutput(true, null);
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		//size of the array
		this.size_ = 0;

		//array elements
		this.allocatedSize_ = 0;

		//the current inputted size
		this.element_ = 0;

		this.dimensions_ = 1;
		
		//If this block gets a variable
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateBlock();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode( this, 'valinp0', Blockly.C.ORDER_NONE );
		this.element_ = parseInt( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ) );

		let ptr = this.parentBlock_;

		while(ptr){

			if(ptr.getDataStr() === "isArr" && this.getVar_ === ptr.getVar_){
				this.size_ = ptr.size_;

				this.allocatedSize_ = ptr.allocatedSize_;

				this.typeName_ = ptr.typeName_;
				
				this.dimensions_ = ptr.dimensions_;

				if(ptr.arrayElementsValue_[this.element_]){
					this.value_ = ptr.arrayElementsValue_[this.element_];
				}
			}
			else if (ptr.getDataStr() === "isVar" && this.getVar_ === ptr.getVar_) {
				this.size_ = ptr.size_;

				this.allocatedSize_ = ptr.size_;
				
				if(ptr.typeName_ === "string"){
					this.typeName_ = "char";
				}
				else{
					this.typeName_ = ptr.typeName_;
				}

				this.dimensions_ = ptr.dimensions_;

				this.value_ = ptr.value_;

			}

			ptr = ptr.parentBlock_;
		}

	},
	
	allocateBlock: function(){
		var block = this.getInputTargetBlock('valinp0');

		if(block){
			block.setColour( this.getColour() );
			block.setDeletable(false);
			block.setMovable(false);
		}

		block = this.getInputTargetBlock('valinp1');

		if(block && block.type === "get_num"){
			block.setColour( this.getColour() );
			block.getField('NUM').setPrecision(1);
			block.getField('NUM').setMin(0);
		}

	},

	allocateWarnings: function(){
		var TT = "";
		if(this.getVar_.length > 0){

			if(this.element_ >= this.size_){
				//TT += 'Error, attempting to get element [' + this.element_ + '] from array "' + this.getVar_ + '", which has a size of ' + this.size_ + '.\n';
			}

			if(this.element_ >= this.allocatedSize_ && !( this.element_ >= this.size_ ) ){
				//TT += 'Warning, attempting to get uninitialized element [' + this.element_ + '], from array "' + this.getVar_ + '".\n';
			}

			if(this.dimensions_ !== 1){
				TT += 'Error, array "' + this.getVar_ + '" is not compatible with a 1D element setter.\n';
			}

		}
		else {
			TT += "Error, array variable is required.\n";
		}

		if(!this.parentBlock_){
			TT += "Block Error, this block has a return and must be connected.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
	}
};

Blockly.C['array_1D_element'] = function(block) {
	var code = '';
	
	if(this.getVar_.length > 0){
		code += this.getVar_ + '[' + this.element_ + ']';
	}
	
	return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.Blocks['array_1D_setter'] = {
	init: function() {

		this.appendValueInput("valinp0")
			.setCheck(null);

		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("[");

		this.appendDummyInput()
			.appendField("]");

		this.appendValueInput("valinp2")
			.appendField(" = ")
			.setCheck(null);

		this.setInputsInline(true);
			
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
			
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		this.element_ = 0;
		this.size_ = 0;

		//is this an array block?
		this.isArr_ = false;

		this.dimensions_ = 1;

	},

	onchange: function(){

		this.allocateValues();
		this.allocateBlock();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode( this, 'valinp0', Blockly.C.ORDER_NONE );
		this.element_ = parseInt( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ) );
		
		let ptr = this.parentBlock_;

		this.typeName_ = "";

		while(ptr){
			
			if(this.getVar_ === ptr.getVar_){

				this.typeName_ = ptr.typeName_;

				this.size_ = ptr.size_;

				this.isArr_ = (ptr.getDataStr() === "isArr");
				
				this.dimensions_ = ptr.dimensions_;

				return;
			}
			
			ptr = ptr.parentBlock_;
		}


	},

	allocateBlock: function(){
		let block = this.getInputTargetBlock('valinp0');

		if(block && block.type === "get_num"){
			block.setColour( this.getColour() );
			block.setMovable(false);
			block.setDeletable(false);
			block.getField('NUM').setPrecision(1);
			block.getField('NUM').setMin(0);
		}

		block = this.getInputTargetBlock('valinp1');

		if(block && block.type === "get_num"){
			block.setColour( this.getColour() );
			block.setMovable(false);
			block.setDeletable(false);
			block.getField('NUM').setPrecision(1);
			block.getField('NUM').setMin(0);
		}


	},

	allocateWarnings: function(){
		var TT = "";
		
		let block = this.getInputTargetBlock('valinp2');
		
		//Errors if there is a proper type

		//if a block has been inserted, and its type is known
		if(block && this.typeName_.length > 0){

			//If the array is of type String and requires Char
			if(this.typeName_ === "string" && block.typeName_ !== "char" && !this.isArr_){
				TT += 'Error, "' + this.getVar_ + '" is of type String, which is an array of characters. Insertion must be of type "Char", currently is of type "' + block.typeName_ + '".\n';
			}
			
			//if the two types are incompatible
			else if (this.typeName_ !== block.typeName_){
				//If the array is of type String and requires String
				if(this.typeName_ === "string" && this.isArr_){
					TT += 'Error, array "' + this.getVar_ + '" is of type "' + this.typeName_ + '", input is of type "' + block.typeName_ + '".\n';
				}
	
				//
				else if (this.typeName_ !== block.typeName_ && this.typeName_ !== "string"){
					TT += 'Error, array "' + this.getVar_ + '" is of type "' + this.typeName_ + '", input is of type "' + block.typeName_ + '".\n';
				}
				
			}
			
		}

		//If a variable is known
		if(this.getVar_.length > 0){

			if(this.element_ >= this.size_){
				//TT += 'Error, attempting to get element [' + this.element_ + '] from array "' + this.getVar_ + '", which has a size of ' + this.size_ + '.\n';
			}

			if(this.dimensions_ !== 1){
				//TT += 'Error, array "' + this.getVar_ + '" is not compatible with a 1D element setter.\n';
			}


		}
		else {
			TT += 'Block error, this block requires an array variable.\n';
		}
		
		if(this.typeName_ === "string"){
			
			var librarySearch = C_Include;
			
			var libFound = librarySearch.search_library(this, ['include_string']);
			
			if(!libFound){
				TT += "Error, <string> library must be included.\n";
			}
		}


		if( !this.getInputTargetBlock('valinp2' ) ){
			TT += 'Block error, setting an element requires an input.\n';
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};
  
Blockly.C['array_1D_setter'] = function(block) {
	var val2 = Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE );
	var code = "";

	if( block.getVar_.length > 0 && val2){
		code += block.getVar_ + '[' + block.element_ + '] = ' + val2 + ';\n';
	}

	return code;
};