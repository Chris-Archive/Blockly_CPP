var includeHUE = 125;

Blockly.Blocks['include_iostream'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("#include <iostream>");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Use #include <iostream> if you are using cout, cin, getline, printf, or any other input or output.");
		this.setHelpUrl("https://www.cplusplus.com/reference/iostream/");
	}
};

Blockly.C['include_iostream'] = function(block) {
  // TODO: Assemble C into code variable.
  
  var code = "#include <iostream>\n";
  return code;
};

Blockly.Blocks['include_iomanip'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("#include <iomanip>");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Use #include <iomanip> if you are using parametric manipulators .");
		this.setHelpUrl("https://www.cplusplus.com/reference/iomanip/");
	}
};

Blockly.C['include_iomanip'] = function(block) {
	// TODO: Assemble C into code variable.
	
	var code = "#include <iomanip>\n";
	return code;
};

Blockly.Blocks['include_math'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("#include <cmath>");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Use #include <cmath> if you are using the math-library related functions.");
		this.setHelpUrl("https://www.cplusplus.com/reference/cmath/");
	}
};

Blockly.C['include_math'] = function(block) {
	// TODO: Assemble C into code variable.
	
	var code = "#include <cmath>\n";
	return code;
};

Blockly.Blocks['include_ctime'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("#include <ctime>");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(includeHUE);
 this.setTooltip("Use #include <ctime> if you are using the time-library related functions.");
 this.setHelpUrl("https://www.cplusplus.com/reference/ctime/");
  }
};

Blockly.C['include_ctime'] = function(block) {
  // TODO: Assemble C into code variable.
  
  var code = "#include <ctime>\n";
  return code;
};

Blockly.Blocks['include_string'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("#include <string>");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(includeHUE);
    this.setTooltip("Use #include <string> if you are using variable type \"string\".");
    this.setHelpUrl("https://www.cplusplus.com/reference/string/string/");
  }
};

Blockly.C['include_string'] = function(block) {
  // TODO: Assemble C into code variable.
  
  var code = "#include <string>\n";
  return code;
};

Blockly.Blocks['include_cstdlib'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("#include <cstdlib>");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Includes the <cstdlib> library.");
		this.setHelpUrl("https://www.cplusplus.com/reference/cstdlib/");
	}
};

Blockly.C['include_cstdlib'] = function(block) {
	// TODO: Assemble C into code variable.
	
	var code = "#include <cstdlib>\n";
	
	return code;
};

Blockly.Blocks['include_cctype'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("#include <cctype>");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Includes the <cctype> library.");
		this.setHelpUrl("https://www.cplusplus.com/reference/cctype/");
	}
};

Blockly.C['include_cctype'] = function(block) {
	// TODO: Assemble C into code variable.
	
	var code = "#include <cctype>\n";
	
	return code;
};

Blockly.Blocks['include_vector'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("#include <vector>");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(includeHUE);
 this.setTooltip("Use #include <vector> if you are using container type \"vector\".");
 this.setHelpUrl("https://www.cplusplus.com/reference/string/string/");
  }
};

Blockly.C['include_vector'] = function(block) {
  // TODO: Assemble C into code variable.
  
  var code = "#include <vector>\n";
  return code;
};


Blockly.Blocks['using_namespace_std'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("using namespace std");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(includeHUE);
		this.setTooltip("Automatically includes the std library when calling the standard namespace. \nFor instance:\nstd::cout -> cout\nstd::endl -> endl\n std::getline(std::cin, myVar) -> getline(cin, myVar)\nstd::vector<std::string> myVar -> vector<string> myVar"); 
		this.setHelpUrl("https://en.wikipedia.org/wiki/C%2B%2B_Standard_Library");
    this.setDeletable(true);
    
	}
  
};

Blockly.C['using_namespace_std'] = function(block) {
	var code = "using namespace std;\n";
	return code;
};




