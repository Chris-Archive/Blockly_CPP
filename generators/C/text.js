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
 * @fileoverview Generating C for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.C.texts');

goog.require('Blockly.C');


Blockly.C.addReservedWords('Html,Math');

Blockly.C['text'] = function(block) {
  // Text value.
  var code = block.getFieldValue('TEXT');
  return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.C['text_multiline'] = function(block) {
  // Text value.
  var code = Blockly.C.multiline_quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.C['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.C.ORDER_ATOMIC];
    case 1:
      var element = Blockly.C.valueToCode(block, 'ADD0',
              Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
      var code = element + '.toString()';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
    default:
      var elements = new Array(block.itemCount_);
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.C.valueToCode(block, 'ADD' + i,
                Blockly.C.ORDER_NONE) || '\'\'';
      }
      var code = '[' + elements.join(',') + '].join()';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
  }
};

Blockly.C['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.C.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var value = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_NONE) || '\'\'';
  return varName + ' = [' + varName + ', ' + value + '].join();\n';
};

Blockly.C['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.C.valueToCode(block, 'VALUE',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  return [text + '.length', Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.C.valueToCode(block, 'VALUE',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  return [text + '.isEmpty', Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substring = Blockly.C.valueToCode(block, 'FIND',
      Blockly.C.ORDER_NONE) || '\'\'';
  var text = Blockly.C.valueToCode(block, 'VALUE',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.C.ORDER_ADDITIVE];
  }
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.C.valueToCode(block, 'VALUE',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
    case 'FROM_START':
      var at = Blockly.C.getAdjusted(block, 'AT');
      var code = text + '[' + at + ']';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
    case 'LAST':
      at = 1;
      // Fall through.
    case 'FROM_END':
      var at = Blockly.C.getAdjusted(block, 'AT', 1);
      var functionName = Blockly.C.provideFunction_(
          'text_get_from_end',
          ['String ' + Blockly.C.FUNCTION_NAME_PLACEHOLDER_ +
              '(String text, num x) {',
           '  return text[text.length - x];',
           '}']);
      code = functionName + '(' + text + ', ' + at + ')';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
    case 'RANDOM':
      Blockly.C.definitions_['import_dart_math'] =
          'import \'C:math\' as Math;';
      var functionName = Blockly.C.provideFunction_(
          'text_random_letter',
          ['String ' + Blockly.C.FUNCTION_NAME_PLACEHOLDER_ +
              '(String text) {',
           '  int x = new Math.Random().nextInt(text.length);',
           '  return text[x];',
           '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.C.ORDER_UNARY_POSTFIX];
  }
  throw Error('Unhandled option (text_charAt).');
};

Blockly.C['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.C.valueToCode(block, 'STRING',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else if (text.match(/^'?\w+'?$/) ||
      (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.C.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.C.getAdjusted(block, 'AT1', 1, false,
            Blockly.C.ORDER_ADDITIVE);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.C.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.C.getAdjusted(block, 'AT2', 0, false,
            Blockly.C.ORDER_ADDITIVE);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    if (where2 == 'LAST') {
      var code = text + '.substring(' + at1 + ')';
    } else {
      var code = text + '.substring(' + at1 + ', ' + at2 + ')';
    }
  } else {
    var at1 = Blockly.C.getAdjusted(block, 'AT1');
    var at2 = Blockly.C.getAdjusted(block, 'AT2');
    var functionName = Blockly.C.provideFunction_(
        'text_get_substring',
        ['String ' + Blockly.C.FUNCTION_NAME_PLACEHOLDER_ +
            '(String text, String where1, num at1, String where2, num at2) {',
         '  int getAt(String where, num at) {',
         '    if (where == \'FROM_END\') {',
         '      at = text.length - 1 - at;',
         '    } else if (where == \'FIRST\') {',
         '      at = 0;',
         '    } else if (where == \'LAST\') {',
         '      at = text.length - 1;',
         '    } else if (where != \'FROM_START\') {',
         '      throw \'Unhandled option (text_getSubstring).\';',
         '    }',
         '    return at;',
         '  }',
         '  at1 = getAt(where1, at1);',
         '  at2 = getAt(where2, at2) + 1;',
         '  return text.substring(at1, at2);',
         '}']);
    var code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var textOrder = operator ? Blockly.C.ORDER_UNARY_POSTFIX :
      Blockly.C.ORDER_NONE;
  var text = Blockly.C.valueToCode(block, 'TEXT', textOrder) || '\'\'';
  if (operator) {
    // Upper and lower case are functions built into C.
    var code = text + operator;
  } else {
    // Title case is not a native C function.  Define one.
    var functionName = Blockly.C.provideFunction_(
        'text_toTitleCase',
        ['String ' + Blockly.C.FUNCTION_NAME_PLACEHOLDER_ +
            '(String str) {',
         '  RegExp exp = new RegExp(r\'\\b\');',
         '  List<String> list = str.split(exp);',
         '  final title = new StringBuffer();',
         '  for (String part in list) {',
         '    if (part.length > 0) {',
         '      title.write(part[0].toUpperCase());',
         '      if (part.length > 0) {',
         '        title.write(part.substring(1).toLowerCase());',
         '      }',
         '    }',
         '  }',
         '  return title.toString();',
         '}']);
    var code = functionName + '(' + text + ')';
  }
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.replaceFirst(new RegExp(r\'^\\s+\'), \'\')',
    'RIGHT': '.replaceFirst(new RegExp(r\'\\s+$\'), \'\')',
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_UNARY_POSTFIX) || '';
  return [text + operator, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_NONE) || '""';
  return 'printf(\" + msg + \");\n';
};

Blockly.C['text_prompt_ext'] = function(block) {
  // Prompt function.
  Blockly.C.definitions_['import_dart_html'] =
      'import \'C:html\' as Html;';
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.C.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.C.valueToCode(block, 'TEXT',
        Blockly.C.ORDER_NONE) || '\'\'';
  }
  var code = 'Html.window.prompt(' + msg + ', \'\')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    Blockly.C.definitions_['import_dart_math'] =
        'import \'C:math\' as Math;';
    code = 'Math.parseDouble(' + code + ')';
  }
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_prompt'] = Blockly.C['text_prompt_ext'];

Blockly.C['text_count'] = function(block) {
  var text = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  var sub = Blockly.C.valueToCode(block, 'SUB',
      Blockly.C.ORDER_NONE) || '\'\'';
  // Substring count is not a native C function.  Define one.
  var functionName = Blockly.C.provideFunction_(
      'text_count',
      ['int ' + Blockly.C.FUNCTION_NAME_PLACEHOLDER_ +
        '(String haystack, String needle) {',
        '  if (needle.length == 0) {',
        '    return haystack.length + 1;',
        '  }',
        '  int index = 0;',
        '  int count = 0;',
        '  while (index != -1) {',
        '    index = haystack.indexOf(needle, index);',
        '    if (index != -1) {',
        '      count++;',
        '     index += needle.length;',
        '    }',
        '  }',
        '  return count;',
        '}']);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_replace'] = function(block) {
  var text = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  var from = Blockly.C.valueToCode(block, 'FROM',
      Blockly.C.ORDER_NONE) || '\'\'';
  var to = Blockly.C.valueToCode(block, 'TO',
      Blockly.C.ORDER_NONE) || '\'\'';
  var code = text + '.replaceAll(' + from + ', ' + to + ')';
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};

Blockly.C['text_reverse'] = function(block) {
  // There isn't a sensible way to do this in C. See:
  // http://stackoverflow.com/a/21613700/3529104
  // Implementing something is possibly better than not implementing anything?
  var text = Blockly.C.valueToCode(block, 'TEXT',
      Blockly.C.ORDER_UNARY_POSTFIX) || '\'\'';
  var code = 'new String.fromCharCodes(' + text + '.runes.toList().reversed)';
  // XXX What should the operator precedence be for a `new`?
  return [code, Blockly.C.ORDER_UNARY_POSTFIX];
};
