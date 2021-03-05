C_Include = {
	
	/**
	 * @param {Blockly.Block} node - The block we're looking at
	 * @param {array<String>} incArr - An array of libraries we need to check
	 * @returns {Boolean} Returns boolean
	 */
	search_library: function(node, incArr){
		//Looking at first node
		let ptr = node;

		//do while for node traversal
		while(ptr){
			ptr = ptr.parentBlock_;
			//if node is not null
			if(ptr){
				//traverse through the array to find
				//the include block
				for(var i = 0; i < incArr.length; ++i){
					//if the name of the block
					//is an element in the array
					if(ptr.type == incArr[i]){
						//it is found, return true
						return true;
					}
				}
			}

		}

		//If it was not found, return false
		return false;
	}
};

C_Include.using = {
	std: function(node){
		let ptr = node;
		
		while(ptr){
			ptr = ptr.parentBlock_;
			
			if(ptr && ptr.type == "using_namespace_std"){
				return true;
			}
			
		}
		return false;
	}
}
















