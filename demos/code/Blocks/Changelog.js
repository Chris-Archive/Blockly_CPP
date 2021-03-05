'use strict';

//Function for readme button
function updateLog(){
	var code = Blockly.C.workspaceToCode(Blockly.getMainWorkspace());
	document.getElementById('code').value = code;
}


//Function to download code
function downloadCode() {
	var code = Blockly.C.workspaceToCode();
	var codeArray = [];
	codeArray.push(code);
	
	var codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
	saveAs(codeBlob, "main.cpp");
}


//function to load
function readFile(input){

	let file = input.files[0];
	
	let reader = new FileReader();
	
	reader.readAsText(file);
	
	reader.onload = function(){
		Blockly.mainWorkspace.clear();
		
		let saveXML = reader.result;

		let textToDom = Blockly.Xml.textToDom(saveXML);
		Blockly.Xml.domToWorkspace(textToDom, Blockly.mainWorkspace);
	};
	
	reader.onerror = function() {
		console.log(reader.error);
	};
	
}



//Function to save
function downloadXML() {
	//Grab the workspace XML
	let codeXML = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	
	//Prettify the XML
	let saveXML = Blockly.Xml.domToPrettyText(codeXML);
	
	var codeArray = [];
	codeArray.push(saveXML);

	console.log(Blockly.mainWorkspace);

	console.log(saveXML);
	
	//Get current date, used to make sure no save file with overwrite another
	
	var today = new Date();
	
	var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
	
	var codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
	saveAs(codeBlob, "blockly save " + time + ".txt");
}










