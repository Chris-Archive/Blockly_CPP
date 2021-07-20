
var classHue = 35;


Blockly.Blocks['ds_struct'] = {
	init: function() {
		this.appendDummyInput()
			.appendField('struct ')
			.appendField(new Blockly.FieldTextInput("myStruct"), "myStructDec");
		this.appendStatementInput("stateinp1")
			.setCheck(null);
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(classHue);
		this.setTooltip("");
		this.setHelpUrl("");

		//Default this to a struct
		this.setDataStr("isStruct", true);
		
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		
		//Function constructors
		this.classConProp_ = [];
		this.classConParam_ = [];
	},
	
	onchange: function(){
		this.allocateValues();
		
		this.allocateWarnings();
		console.log(this.classVar_);
	},
	
	allocateValues: function(){
		this.getVar_ = this.getField('myStructDec').getText();
		
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		this.classConProp_ = [];
		this.classConParam_ = [];
		
		//Get the first block in the statement dropdown
		let ptr = this.getInputTargetBlock('stateinp1');
		while(ptr){
			switch(ptr.getDataStr()){
				
				//If the block is a variable 
				case 'isVar':
				this.classVar_.push(ptr.varProp_);
				break;
				
				//If the block is an array 
				case 'isArr':
				this.classArr_.push(ptr.varProp_);
				break;
				
				//If the block is a vector 
				case 'isVec':
				this.classVec_.push(ptr.varProp_);
				break;
				
				//If the block is a function 
				case 'isFunc':
				//If the function is not a constructor
				if(!ptr.isConstructor_){
					this.classFuncProp_.push(ptr.funcProp_);
					this.classFuncParam_.push(ptr.funcParam_);
				}
				//If the function is a constructor
				else{
					this.classConProp_.push(ptr.funcProp_);
					this.classConParam_.push(ptr.funcParam_);
				}
				
				break;
			}
			
			//Get the next bottom block
			ptr = ptr.nextConnection.targetBlock();
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};

Blockly.C['ds_struct'] = function(block) {
	var variable_mystructdec = Blockly.C.variableDB_.getName(block.getFieldValue('myStructDec'), Blockly.Variables.NAME_TYPE);
	var statements_state1 = Blockly.C.statementToCode(block, 'stateinp1');
	// TODO: Assemble C into code variable.
	code = '';

	code += 'struct ' + variable_mystructdec + '{\n';
	
	code += statements_state1;
	
	code += '};\n';
	
	return code;
};

Blockly.Blocks['ds_object'] = {
	init: function(){
		
		this.paramNames_ = [["", ""]];
		
		this.appendValueInput('valinp1')
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "DS")
			.appendField(new Blockly.FieldDropdown([['', ''], ['*', '*']]), 'ptr')
			.appendField(new Blockly.FieldTextInput('myObj'), 'obj');
		
		this.setOutput(false);
		this.setColour(classHue);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		
		this.classConProp_ = [];
		this.classConParam_ = [];
	},
	
	onchange: function(){
		this.allocateVariables();
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateVariables: function(){
		var options = [];
		
		options.push(["", ""]);
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			switch(ptr.getDataStr()){
				case 'isStruct':
				
				options.push([ptr.getVar_, ptr.getVar_]);
				
				break;
			}
			ptr = ptr.parentBlock_;
		}
		
		this.paramNames_ = options;
	},
	
	allocateValues: function(){
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		this.classConProp_ = [];
		this.classConParam_ = [];
		
		//variable is the new object 
		this.typeName_ = this.getFieldValue('DS');
		this.getVar_ = this.getFieldValue('obj');
		this.ptrType_ = this.getFieldValue('ptr');
		
		let ptr = this.parentBlock_;
		
		//Loop through to find a struct or class
		while(ptr){
			//If the block is a struct or class, and if it is the one we want
			if( ( ptr.getDataStr() === "isStruct" || ptr.getDataStr() === "isClass" ) && this.typeName_ === ptr.getVar_){
				
				//Stream all information
				this.classVar_ = ptr.classVar_;
				this.classArr_ = ptr.classArr_;
				this.classVec_ = ptr.classVec_;
				
				this.classFuncProp_ = ptr.classFuncProp_;
				this.classFuncParam_ = ptr.classFuncParam_;
				
				this.classConProp_ = ptr.classConProp_;
				this.classConParam_ = ptr.classConParam_;
				
				
				break;
			}
			ptr = ptr.parentBlock_;
		}
		
		
	},
	
	allocateDropdown: function(){
		return this.paramNames_;
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		//If there is no option selected
		if(this.getFieldValue('DS')){
			
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['ds_object'] = function(block){
	var val1 = Blockly.C.valueToCode( block, 'valinp1', Blockly.C.ORDER_NONE );
	let nextBlock = block.getInputTargetBlock('valinp1');

	var DS = block.getFieldValue('DS');
	var ptr = block.getFieldValue('ptr');
	var obj = block.getFieldValue('obj');
	
	var code = "";
	
	if(ptr.length > 0){
		code += DS + ptr + ' ' + obj + ' = new ' + DS;
	}
	else {
		code += DS + ' ' + obj;
	}
	
	if(nextBlock && nextBlock.type === "get_func" && val1.length > 0){
		code += val1;
	}
	
	code += ';\n';
	
	return code;
};

Blockly.Blocks['ds_member'] = {
	init: function(){
		
		this.paramNames_ = [["", ""]];
		
		this.appendValueInput("valinp1")
			.appendField(new Blockly.FieldDropdown(this.allocateObjDropdown.bind(this)), 'DS')
			.appendField('', 'operator');
			
		
		this.setInputsInline(false);
		this.setOutput(true);
		this.setColour(classHue);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateVariables();
		this.allocateWarnings();
		
	},
	
	allocateValues: function(){
		var val1 = Blockly.C.valueToCode( this, 'valinp1', Blockly.C.ORDER_NONE );
		
		this.typeName_ = "";
		
		this.classVar_ = [];
		this.classArr_ = [];
		this.classVec_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			switch(ptr.type){
				case 'ds_object':
				
				if(this.getFieldValue('DS') === ptr.getVar_){
					this.typeName_ = ptr.typeName_;
					
					this.classVar_ = ptr.classVar_;
					this.classArr_ = ptr.classArr_;
					this.classVec_ = ptr.classVec_;
					
					this.classFuncProp_ = ptr.classFuncProp_;
					this.classFuncParam_ = ptr.classFuncParam_;
					
					this.ptrType_ = ptr.ptrType_;
					break;
				}
			
				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		
		console.log(this.typeName_);
		
		//Allocate pointer type
		let C = C_Logic;
		
		if(val1.length > 0){
			if(C.help.ptr_is_deref(this.ptrType_)){
				this.setFieldValue('->', 'operator');
			}
			else {
				this.setFieldValue('.', 'operator');
			}
		}
		else {
			this.setFieldValue('', 'operator');
		}
	},
	
	
	allocateVariables: function(){
		
		//Section to allocate objects for the left dropdown list
		var options = [];
		options.push(["", ""]);
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			switch(ptr.type){
				case 'ds_object':
				options.push([ptr.getVar_, ptr.getVar_]);
				break;
			}
			ptr = ptr.parentBlock_;
		}
		
		this.paramNames_ = options;
	},
	
	allocateObjDropdown: function(){
		return this.paramNames_;
	},
	
	allocateWarnings: function(){
		var TT = "";
		let block = this.getInputTargetBlock('valinp1');
			
		if(block){

		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};

Blockly.C['ds_member'] = function(block){
	var val1 = Blockly.C.valueToCode( block, 'valinp1', Blockly.C.ORDER_NONE );
	var code = "";
	
	code += block.getFieldValue('DS');
	
	if(val1.length > 0){
		code += block.getFieldValue('operator') + val1;
	}
	
	return [code, Blockly.C.ORDER_NONE];
};





