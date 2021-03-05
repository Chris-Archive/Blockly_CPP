/**
 * @license
 * Copyright 2014 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating C for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.C.procedures');

goog.require('Blockly.C');


Blockly.C['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.C.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var xfix1 = '';
  if (Blockly.C.STATEMENT_PREFIX) {
    xfix1 += Blockly.C.injectId(Blockly.C.STATEMENT_PREFIX, block);
  }
  if (Blockly.C.STATEMENT_SUFFIX) {
    xfix1 += Blockly.C.injectId(Blockly.C.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.C.prefixLines(xfix1, Blockly.C.INDENT);
  }
  var loopTrap = '';
  if (Blockly.C.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.C.prefixLines(
        Blockly.C.injectId(Blockly.C.INFINITE_LOOP_TRAP, block),
        Blockly.C.INDENT);
  }
  var branch = Blockly.C.statementToCode(block, 'STACK');
  var returnValue = Blockly.C.valueToCode(block, 'RETURN',
      Blockly.C.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.C.INDENT + 'return ' + returnValue + ';\n';
  }
  var returnType = returnValue ? 'auto' : 'void';
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.C.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.C.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.C.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.C['procedures_defnoreturn'] = Blockly.C['procedures_defreturn'];

Blockly.C['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.C.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.C.valueToCode(block, 'ARG' + i,
        Blockly.C.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.C['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Blockly.C['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.C.valueToCode(block, 'CONDITION',
      Blockly.C.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.C.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.C.prefixLines(
        Blockly.C.injectId(Blockly.C.STATEMENT_SUFFIX, block),
        Blockly.C.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.C.valueToCode(block, 'VALUE',
        Blockly.C.ORDER_NONE) || 'null';
    code += Blockly.C.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.C.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
