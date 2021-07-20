

Blockly.Blocks['pointer_null'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("NULL");
		this.setOutput(true);
		this.setColour(0);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.isNull_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		
	},
	
	allocateWarnings(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block as a return and must be connected.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
		
	}
};

Blockly.C['pointer_null'] = function(block) {
  // TODO: Assemble C into code variable.
  var code = 'NULL';
  
  return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_nullptr'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("nullptr");
		this.setOutput(true);
		this.setColour(0);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.isNull_ = true;
		
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		
	},
	
	allocateWarnings(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block as a return and must be connected.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
		
		
	}
};

Blockly.C['pointer_nullptr'] = function(block) {
  // TODO: Assemble C into code variable.
  var code = 'nullptr';
  
  return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_ref'] = {
  init: function() {
    this.appendValueInput("valinp1")
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([["&","myPoiRef"], ["*","myPoiDeref"]]), "myPoi");
    this.setOutput(true, "Pointer");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.C['pointer_ref'] = function(block) {
	var dropdown_mypoi = this.getField('myPoi').getText();
	var value_valinp1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	// TODO: Assemble C into code variable.
	var code = '';
	
	code += dropdown_mypoi;
	
	if(value_valinp1.length > 0){
		code += ' ' + value_valinp1;
	}
	
	
	// TODO: Change ORDER_NONE to the correct strength.
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_conv'] = {
	init: function() {
		this.appendValueInput("valinp1")
			.setCheck(null)
			.appendField(new Blockly.FieldDropdown([["",""], ["&","&"], ["*","*"], ["*&","*&"], ["**","**"]]), "ptr");
			
		this.setOutput(true, null);
		this.setColour(0);
		this.setTooltip("");
		this.setHelpUrl("");
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.typeName_ = "";
		
		
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			this.typeName_ = block.typeName_;
		}
		
		this.ptrType_ = this.getFieldValue('ptr');
		
		
		
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

Blockly.C['pointer_conv'] = function(block) {
	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var code = "";
	
	code += block.ptrType_ + val1;
	
	return [code, Blockly.C.ORDER_NONE];
};


