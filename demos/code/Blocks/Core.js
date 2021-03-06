
Blockly.Blocks["main"] = {
	init: function(){
		
		this.appendDummyInput()
			.appendField("int main()");

		this.appendStatementInput("statement");

		this.setPreviousStatement(true);
		this.setNextStatement(true);
	}
};

Blockly.C["main"] = function(){
	var s_input = Blockly.C.statementToCode(this, "statement");
	var code = "";
	
	code += "int main(){\n";
	code += s_input;
	code += "}\n";

	return code;
};