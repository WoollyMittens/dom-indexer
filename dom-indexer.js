class DomIndex {
	constructor(props) {
		// establish the root
		this.rootIdentifier = props.root;
		this.rootElement = document.querySelector(props.root);
		this.rootMap = {};
		// parse every node in the root
		for (let childNode of this.rootElement.childNodes) {
			if (!/#text|#comment|script/i.test(childNode.nodeName)) {
				this.parse(childNode, this.rootMap);
			}
		}
		// publish the map
		console.log(this.rootIdentifier, JSON.stringify(this.rootMap, null, '\t').replace(/"|,|:/g, ""));
	}

	isValid(className) {
		try { this.rootElement.querySelectorAll(className); return true; }
		catch (e) { return false }
	}

	parse(element, parent) {
		let nextParent = null;
		// if it has an id
		if (element.hasAttribute('id') && !/^[A-Z0-9]*$/.test(element.getAttribute('id'))) {
			const elementId = '#' + element.getAttribute('id');
			// if the id is unique
			if (this.rootElement.querySelectorAll(elementId).length === 1) {
				// store it in the root
				this.rootMap[elementId] = {};
				// assume the parent role
				if (!nextParent) nextParent = this.rootMap[elementId];
			}
			// else
			else {
				// store it in the parent
				parent[elementId] = {};
			}
		}
		
		// if it has a class name
		if (element.hasAttribute('class')) {
			// for every seperate class
			let firstClass = null;
			let elementClasses = element.getAttribute('class').replace(/\t|\n/g, ' ').trim().split(' ');
			for (let elementClass of elementClasses) {
				// validate the class name
				if (elementClass && !/ /.test(elementClass) && this.isValid('.' + elementClass)) {
					let className = '.' + elementClass;
					// if this is the primary class name
					if(elementClasses.indexOf(elementClass) <= 0) {
						// if the class name is unique
						if (this.rootElement.querySelectorAll(className).length === 1) {
							// store it in the root
							this.rootMap[className] = {};
							// assume the parent role
							if (!nextParent) nextParent = this.rootMap[className];
							// store the first class
							firstClass = this.rootMap[className];
						} 
						// else
						else {
							// add it to the parent
							parent[className] = {}
							// store the first class
							firstClass = parent[className];
						}
					}
					// else
					else {
						// store if as a secondary class name
						firstClass['&' + className] = {};
					}
				}
			}
		}
		
		// if the element has neither
		if (!element.hasAttribute('id') && !element.hasAttribute('class')) {
			// store it in the parent
			parent[element.nodeName.toLowerCase()] = {};
		}

		// parse the child nodes
		for (let childNode of element.childNodes) {
			if (!/#text|#comment|script/i.test(childNode.nodeName)) {
				this.parse(childNode, nextParent || parent);
			}
		}
	}
}

new DomIndex({
	root: 'body'
});
