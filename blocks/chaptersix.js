Blockly.Blocks['array'] = {
  init: function() {
    this.appendDummyInput();
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/arrays/");
  }
};

Blockly.JavaScript['array'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};