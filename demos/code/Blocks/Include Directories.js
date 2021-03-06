
Blockly.Blocks["library_iostream"] = {
    init: function(){

        this.appendDummyInput()
            .appendField("#include <iostream>");

        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.C["library_iostream"] = function(){
    var code = "#include <iostream>\n";
    return code;
};
