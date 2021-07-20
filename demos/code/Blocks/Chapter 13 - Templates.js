var templateHUE = 115

Blockly.Blocks['template'] = {
	init: function(){

		this.appendDummyInput()
			.appendField('template<typename ')
			.appendField(new Blockly.FieldTextInput('T'), 'T')
			.appendField('>');


		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(templateHUE);
		
	},

	onchange: function(){
		
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){

	},

	allocateWarnings: function(){
		var TT = "";

		var template = this.getField('T').getText();

		if(template.length < 1){
			TT += 'Error, must include a template type.\n';
		}
		
		if( !this.childBlocks_[0] || 
		( 
		this.childBlocks_[0].getDataStr() !== 'isFunc' && 
		this.childBlocks_[0].getDataStr() !== 'isStruct' && 
		this.childBlocks_[0].getDataStr() !== 'isClass' )
		){
			TT += "Error, template must directly proceed a function, struct or class.\n";
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};

Blockly.C['template'] = function(block){
	var code = "";

	code += "template <typename " + block.getField('T').getText() + '>\n';

	return code;
};