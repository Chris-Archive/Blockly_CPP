
Blockly.Blocks['array_2D'] = {
	init: function(){

		this.appendValueInput("valinp0")
			.setCheck(null)
			.appendField(new Blockly.FieldDropdown([["int","INT"], ["size_t","SIZE_T"], ["double","DOUBLE"], ["char","CHAR"], ["string","STRING"], ["bool","BOOL"]]), "myArrType")
			.appendField(new Blockly.FieldTextInput("myMatrix"), "myArrDef")
			.appendField('[');

		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField('][');

		this.appendDummyInput()
			.appendField(']')
			.appendField('', 'init');

		this.appendStatementInput('stateinp0');

		this.appendDummyInput()
			.appendField('', 'init2');

		this.setInputsInline(true);

		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(arrayHUE);
		this.setTooltip('');

		this.typeName_ = "";
		this.getVar_ = "";

		//array[y][x]
		this.y_ = 1;
		this.x_ = 1;

		this.yInput_ = "";
		this.xInput_ = "";

		this.size_ = 1;

		this.allocatedSize_ = 0;

		//The elements of the array
		this.arrayElements_ = [];
		//the values of the elements
		this.arrayElementsValue_ = [];


		//variable to check the number of dimensions
		this.dimensions_ = 2;
		
		//set data structure as an array
		this.setDataStr("isArr", true);

	},
	onchange: function(){

		this.allocateValues();
		this.allocateVariables();
		this.allocateBlock();
		this.allocateArray();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.yInput_ = Blockly.C.valueToCode(this, 'valinp0', Blockly.C.ORDER_NONE);
		this.xInput_ = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);

		this.size_ = (this.y_ * this.x_);

		this.typeName_ = this.getField('myArrType').getText();
		this.getVar_ = this.getField('myArrDef').getText();

		this.allocatedSize_ = this.arrayElements_.length;
		
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
	},

	allocateVariables: function(){
		let y_block = this.getInputTargetBlock('valinp1');
		let x_block = this.getInputTargetBlock('valinp2');

		if(y_block && (typeof( y_block.onchange() !== "undefined" ) )  ){
			y_block.onchange();
		}
		if( x_block && (typeof( x_block.onchange() !== "undefined" ) )  ){
			x_block.onchange();
		}

		//get value from the first block
		if(y_block && y_block.value_){
			this.y_ = parseInt( y_block.value_, 10 );
		}
		else {
			//if it's a number
			if( !isNaN( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ) ) ){
				this.y_ = parseInt( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ), 10 );
			}
			else {
				this.y_ = 1
			}
		}

		//get value from the second block
		if( x_block && x_block.value_ ){
			this.x_ = parseInt( x_block.value_, 10 );
		}
		else {
			if( x_block && x_block.value_ ){
				//if it's a number
				if( !isNaN( Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE ) ) ){
					this.x_ = parseInt( Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE ), 10 );
				}
				else {
					this.x_ = 1
				}
			}
		}
	},

	/**
	 * Update the first input
	 */
	allocateBlock: function(){

		for(var i = 0; i <= 1; ++i){
			let block = this.getInputTargetBlock('valinp' + i);

			if(block && block.type === "get_num"){
				block.setColour( this.getColour() );
				block.getField('NUM').setPrecision(1);
				block.getField('NUM').setMin(1);
			}

		}
		

	},

	allocateArray: function(){
		let ptr = this.getInputTargetBlock('stateinp0');

		var i = 0;
		var j = 0;

		//Traverse through the array_init
		while(ptr){
			if(ptr.input_ && ptr.input_.length > 0){
				ptr.setFieldValue('[' + j.toString() + '][' + i.toString() + ']', 'init');

				//Get the inputs
				this.arrayElements_.push(ptr.input_);
				this.arrayElementsValue_.push(ptr.value_);

				i++;
				if(i >= this.x_){
					i -= this.x_;
					j++;
				}

			}
			else {
				ptr.setFieldValue('', 'init');
			}

			ptr = ptr.nextConnection && ptr.nextConnection.targetBlock();
		}


	},

	/**
	 * Function to generate warnings 
	 */
	allocateWarnings: function(){
		var TT = "";

		//Size checking section
		{
			if(this.y_ < 1){
				TT += 'Error, first element size cannot be below 1.\n';
			}

			if(this.x_ < 1){
				TT += 'Error, second element size cannot be below 1.\n';
			}

			if(this.size_ > 0 && this.allocatedSize_ > this.size_){
				TT += "Error, array size is " + this.size_ + " but there are " + this.allocatedSize_ + " elements.\n";
			}
		}
		
		//type checking elements
		{
			let ptr = this.getInputTargetBlock('stateinp0');

			var i = 0;
			while(ptr){

				if(ptr.type !== "array_1D_initialization"){
					TT += "Block error, element #" + i.toString() + "requires a proper initialization block.\n";
				}

				//If the array init block is initialized and the two types are not the same
				if(ptr && this.typeName_ !== ptr.typeName_ && ptr.input_.length > 0){
					
					TT += 'Error, element #' + i.toString() + ' is of type "' + ptr.typeName_ + '", array is of type "' + this.typeName_ + '".\n';
				}
				
				i++;
				ptr = ptr.nextConnection && ptr.nextConnection.targetBlock();
			}
		}
		
		{
			if(this.typeName_ === "string"){
				
				var librarySearch = C_Include;
				
				var libFound = librarySearch.search_library(this, ['include_string']);
				
				if(!libFound){
					TT += "Error, <string> library must be included.\n";
				}
			}
		}

		//Enable for constant checking
		//disabled as of 6/8/20
		/*
		if(y_block && !y_block.sourceBlock_.con){
			TT += 'Error, first element size must be a constant\n';
		}

		if(x_block && !x_block.sourceBlock_.con){
			TT += 'Error, second element size must be a constant\n';
		}
		*/
		


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

		display_elements = {
			text: "Display Matrix Data",
			enabled: true, 
	
			callback: function(){


				{
					var temp = "";
					var i = 0;
					var j = 0;
					var k = 0;

					while(BlockScope.arrayElementsValue_[k]){
						temp += "[" + j + "][" + i++ + "] = " + BlockScope.arrayElementsValue_[k] + "\n";

						if(i >= BlockScope.x_){
							i -= BlockScope.x_;
							j++;
						}

						k++;
					}

				}
				
				{

					

				}



				alert(
					"Array type: " + BlockScope.typeName_ + "\n" + 
					"name: " + BlockScope.getVar_ + "\n" + 
					"size: " + BlockScope.size_ + "\n" + 
					"elements: " + BlockScope.allocatedSize_ + "\n" + 
					temp
				);
			}
		};

		options.push(display_elements);
	}
};


Blockly.C['array_2D'] = function(block){
	var y_block = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);
	var x_block = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_NONE);
	var type = block.getField('myArrType').getText();
	
	C = C_Include;
	
	var code = '';
	var std = '';
	
	if(!C.using.std(block)){
		std = 'std::';
	}

	if(block.typeName_ === "string"){
		code += std;
	}

	code += type + ' ' + block.getVar_;
	
	code += '[';

	if(y_block.length > 0 || block.y_ > 0){
		code += y_block;
	}

	code += '][';
	
	if(x_block.length > 0 || block.x_ > 0){
		code += x_block;
	}
	
	code += ']';

	if(block.arrayElements_.length > 0){
		code += ' = {';
		
		var k = 0;
		
		for(var i = 0; i < block.y_ && block.arrayElements_[k]; ++i){
			
			code += '\n  ';
			
			for(var j = 0; j < block.x_ && block.arrayElements_[k]; ++j){
				
				if(j === 0){
					code += '{ ';
				}
				
				code += block.arrayElements_[k++];
				
				
				if( ( j < block.x_ - 1 ) && (block.arrayElements_[k]) ){
					code += ", ";
				}
				else {
					code += ' }';
					
					if( ( k < block.allocatedSize_ - 1 ) && ( k < (block.y_ * block.x_) ) ){
						code += ',';
					}
					
				}
				
			}
			
			
		}
		
		if(block.arrayElements_.length > 0){
			code += '\n}';
		}
		
	}

	code += ';\n';
	
	
	
	return code;
};

Blockly.Blocks['array_2D_element'] = {
	init: function() {
		
		this.appendValueInput("valinp0")
			.setCheck(null);

		this.appendValueInput("valinp1")
			.appendField("[");

		this.appendDummyInput()
			.appendField("]");

		this.appendValueInput("valinp2")
			.appendField("[");
	
		this.appendDummyInput()
			.appendField("]");
			
			
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		
		this.setOutput(true, null);
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		this.getVar_ = "";

		this.typeName_ = "";
		
		//myArr[y][x]
		//size of the array
		this.size_ = 1;
		this.allocatedSize_ = 0;
		
		//current position of y
		this.y_ = 0;
		
		//current position of x
		this.x_ = 0;
		
		//The limit for the element index
		this.allocatedY_ = 0;
		this.allocatedX_ = 0;

		//2D Array
		this.dimensions_ = 2;
		
		//If this block gets a non-literal
		this.isGetter_ = true;

	},
	
	onchange: function(){
		this.allocateBlock();
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateBlock: function(){
		var block = this.getInputTargetBlock('valinp0');

		if(block){
			block.setColour(this.getColour());
			block.setDeletable(false);
			block.setMovable(false);
		}

		for(var i = 1; i <= 2; ++i){
			block = this.getInputTargetBlock('valinp' + i)

			if( block && block.type === "get_num" ){
				block.setColour( this.getColour() );
				block.setMovable(false);
				block.setDeletable(false);
				block.getField('NUM').setPrecision(1);
				block.getField('NUM').setMin(0);
			}
			
		}

	},

	allocateValues: function(){
		
		this.getVar_ = Blockly.C.valueToCode(this, 'valinp0', Blockly.C.ORDER_NONE);

		//if it's a number
		if( !isNaN( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ) ) ){
			this.y_ = parseInt( Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE ), 10 );
		}
		else {
			this.y_ = 1
		}

		//if it's a number
		if( !isNaN( Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE ) ) ){
			this.x_ = parseInt( Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE ), 10 );
		}
		else {
			this.x_ = 1
		}
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isArr" && this.getVar_ === ptr.getVar_){
				
				this.size_ = ptr.size_;

				this.allocatedSize_ = ptr.allocatedSize_;

				this.typeName_ = ptr.typeName_;

				this.dimensions_ = ptr.dimensions_;
				
				this.allocatedY_ = ptr.y_;
				this.allocatedX_ = ptr.x_;
				
			}
			
			else if (ptr.getDataStr() === "isVar" && this.getVar_ === ptr.getVar_) {
				this.size_ = ptr.size_;

				this.allocatedSize_ = ptr.size_;

				this.typeName_ = ptr.typeName_;

				this.dimensions_ = ptr.dimensions_;

				this.value_ = ptr.value_;

			}
			
			ptr = ptr.parentBlock_;
		}
	},

	allocateWarnings: function(){
		var TT = "";

		if(this.getVar_.length > 0){
			if(this.y_ >= this.allocatedY_){
				//TT += 'Error, first subscript has an element of ' + this.y_ + ', but has a size of ' + this.allocatedY_ + '.\n';
			}

			if( (this.x_ >= this.allocatedX_) || (this.y_ >= this.allocatedY_) ){
				//TT += 'Error, attempting to get element [' + this.x_ + '][' + this.y_ + '] from array "' + this.getVar_+ '", which has an allocated size of [' + this.allocatedX_ + '][' + this.allocatedY_ + ']\n';

				//TT += 'Warning, attempting to get uninitialized element [' + this.y_ + '], from array "' + this.getVar_ + '".\n';
			}

			if(this.x_ >= this.allocatedX_){
				//TT += 'Error, second subscript has an element of ' + this.x_ + ', but has a size of ' + this.allocatedX_ + '.\n';
			}

			if(this.dimensions_ !== 2){
				//TT += 'Error, array "' + this.getVar_ + '" is not compatible with a 2D element getter.\n';
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

Blockly.C['array_2D_element'] = function(block) {
	var code = '';
	
	if(this.getVar_){
		code += this.getVar_ + '[' + this.y_ + ']' + '[' + this.x_ + ']';
	}
	
	return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.Blocks['array_2D_setter'] = {
	init: function() {

		this.appendValueInput("valinp0")
			.setCheck(null);

		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField("[");

		this.appendDummyInput()
			.appendField("][");
			
		this.appendValueInput("valinp2")
			.setCheck(null);

		this.appendValueInput("valinp3")
			.appendField("] = ")
			.setCheck();

		this.setInputsInline(true);
			
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
			
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		this.getVar_ = "";
		this.typeName_ = "";
		this.size_ = 0;
		
		//The current element index
		this.y_ = 0; //y
		this.x_ = 0; //x
		
		//The limit for the element index
		this.allocatedY_ = 0; //y
		this.allocatedX_ = 0; //x

		//How many dimensions
		this.dimensions_ = 2;

	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateBlock();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.getVar_ = Blockly.C.valueToCode( this, 'valinp0', Blockly.C.ORDER_NONE );
		
		let block = this.getInputTargetBlock('valinp1');
		
		var val1 = Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE );
		var val2 = Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE );
		
		//Get the size from the value block if it's not a number
		if( block && block.type !== "get_num" && block.value_ && isNaN( val1 ) ){
			this.y_ = parseInt( block.value_ );
		}
		else{
			this.y_ = parseInt( val1 );
		}
		
		//Get the size from the value block if it's not a number
		if( block && block.type !== "get_num" && block.value_ && isNaN( val2 ) ){
			this.x_ = parseInt( block.value_ );
		}
		else{
			this.x_ = parseInt( val2 );
		}
				
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(ptr.getDataStr() === "isArr" && this.getVar_ === ptr.getVar_){
				this.typeName_ = ptr.typeName_;
				this.size_ = ptr.size_;
				
				this.allocatedY_ = ptr.y_;
				this.allocatedX_ = ptr.x_;
				
				this.dimensions_ = ptr.dimensions_;
				
			}
			
			ptr = ptr.parentBlock_;
		}
	},
	
	allocateBlock: function(){
		//The variable block
		let block = this.getInputTargetBlock('valinp0');

		//set the variable blocks' properties
		if(block){
			block.setColour( this.getColour() );
			block.setDeletable(false);
			block.setMovable(false);
		}
		
		//set the two number blocks' properties
		for(var i = 1; i <= 2; ++i){
			block = this.getInputTargetBlock('valinp' + i);
			
			if(block && block.type === "get_num"){
				block.setColour( this.getColour() );
				block.getField('NUM').setPrecision(1);
				block.getField('NUM').setMin(0);
			}
		}
		
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let block = this.getInputTargetBlock('valinp3');
		
		//Errors if there is an array
		if(this.getVar_.length > 0){
			
			if(this.y_ >= this.allocatedY_){
				//TT += 'Error, first subscript has an element of ' + this.y_ + ', but has a size of ' + this.allocatedY_ + '.\n';
			}
			
			if(this.x_ >= this.allocatedX_){
				//TT += 'Error, second subscript has an element of ' + this.x_ + ', but has a size of ' + this.allocatedX_ + '.\n';
			}
			
			if( isNaN(this.y_) ){
				//TT += 'Error, first subscript value cannot be deduced.\n';
			}
			
			if( isNaN(this.y_) ){
				//TT += 'Error, second subscript value cannot be deduced.\n';
			}
			
			if(!block){
				//TT += 'Error, setting an element requires an input.\n';
			}
			
			if(block && block.typeName_ && this.typeName_ !== block.typeName_){
				TT += 'Error, array "' + this.getVar_ + '" is of type "' + this.typeName_ + '", input is of type "' + block.typeName_ + '".\n';
			}
			
			if(this.dimensions_ !== 2){
				TT += 'Error, array "' + this.getVar_ + '" is not compatible with a 2D element setter.\n';
			}
			
		}
		//If there is no array
		else {
			//
			TT += 'Error, array element setter requires an array.\n';
		}
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
}

Blockly.C['array_2D_setter'] = function(block) {
	//First element
	var val1 = Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE );
	//Second element
	var val2 = Blockly.C.valueToCode( this, 'valinp2', Blockly.C.ORDER_NONE );
	//Input
	var val3 = Blockly.C.valueToCode( this, 'valinp3', Blockly.C.ORDER_NONE );
	
	var code = '';
	
	
	if(block.getVar_.length > 0 && val1 && val2 && val3){
		code += block.getVar_ + '[' + val1 + '][' + val2 + '] = ' + val3 + ';\n';
	}
	
	
	return code;
};

