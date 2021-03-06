
Blockly.Blocks["declare_variable"] = {
    init: function(){

		console.log(C_Prop.constant);

        this.appendValueInput("initialization")
            .appendField(new Blockly.FieldDropdown(C_Prop.FieldDropdown.constant), "const")
            .appendField(new Blockly.FieldDropdown(C_Prop.FieldDropdown.types), "type")
			.appendField(new Blockly.FieldDropdown(C_Prop.FieldDropdown.memory), "ptr")
			.appendField(new Blockly.FieldTextInput("var"), "var");

        this.setPreviousStatement(true);
        this.setNextStatement(true);
		this.setDataStr("isVar", true);

    },

	onchange: function(){
		this.setProps();
	},

	setProps: function(){
		this.isConst_ = this.getField("const").getText() === "const";
		this.typeName_ = this.getField("type").getText();
		this.ptrType_ = this.getField("ptr").getText();
		this.getVar_ = this.getField("var").getText();
	}
};

Blockly.C["declare_variable"] = function(){
    var v_input = Blockly.C.valueToCode(this, "initialization", Blockly.C.ORDER_ATOMIC);
    var code = "";

	if(this.isConst_){ code += "const "; }
	
	code += this.typeName_ + this.ptrType_ + " " + this.getVar_;

	if(v_input.length > 0){ code += " = " + v_input; }

	code += ";\n";

    return code;
};
