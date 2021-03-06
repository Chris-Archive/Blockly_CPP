

Blockly.Blocks["variable_getter"] = {
    init: function(){
        this.varNames_ = [
            ["", ""]
        ];

        this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.getVars.bind(this)), "var");

        this.setOutput(true);

    },

    onchange: function(){
		this.setProps();
		this.getVars();
    },


	setProps: function(){
		this.getVar_ = this.getField("var").getText();

		let ptr = this.parentBlock_;
		while(ptr){
			switch(ptr.getDataStr()){
				case 'isVar':
					if(this.getVar_ === ptr.getVar_){
						this.typeName_ = ptr.typeName_;
						this.ptrType_ = ptr.ptrType_;
					}
				break;
			}

			ptr = ptr.parentBlock_;
		}
	},

    //Get variables
    getVars: function(){
		var options = [["", ""]]
		let ptr = this.parentBlock_;

		while(ptr){
			switch(ptr.getDataStr()){
				case 'isVar':
					options.push([ptr.getVar_, ptr.getVar_]);
				break;
			}
			
			ptr = ptr.parentBlock_;
		}

		this.varNames_ = options;
		return this.varNames_;
    }
};

Blockly.C["variable_getter"] = function(){
    var code = "";

    code += this.getVar_;

    return [code, Blockly.C.ORDER_ATOMIC];
}