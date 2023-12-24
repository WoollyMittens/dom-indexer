class DomIndex {
	constructor(props) {
		// establish the root
		this.rootIdentifier = props.root;
		this.rootElement = document.querySelector(props.root);
		this.rootMap = {};
		// store the allowed attributes
		this.allowedAttributes = props.attributes;
		// parse every node in the root
		for (let childNode of this.rootElement.childNodes) {
			if (!/#text|#comment|script/i.test(childNode.nodeName)) {
				this.parse(childNode, this.rootMap);
			}
		}
		// publish the map
		console.log(this.rootIdentifier, JSON.stringify(this.rootMap, null, '\t').replace(/"|,|:/g, "").replace(/\\/g, "\""));
	}

	isValid(className) {
		try { this.rootElement.querySelectorAll(className); return true; }
		catch (e) { return false }
	}

	addAttributes(element, classes) {
		let attributes = [...element.attributes];
		// for every allowed attribute
		for (let attribute of attributes) {
			if (this.allowedAttributes.test(attribute.name)) {
				// add it like a class name
				classes.push(attribute.value ? `[${attribute.name}="${attribute.value}"]` : `[${attribute.name}]`);
			}
		}
		return classes;
	}

	parse(element, parent, deepest) {
		let nextParent = null;
		// if it has an id
		if (element.hasAttribute('id') && !/^[A-Z0-9]*$/.test(element.getAttribute('id'))) {
			const elementId = '#' + element.getAttribute('id');
			// if the id is unique
			if (this.rootElement.querySelectorAll(elementId).length === 1) {
				// store it in the root
				if (!this.rootMap[elementId]) this.rootMap[elementId] = {};
				// assume the parent role
				if (!nextParent) nextParent = this.rootMap[elementId];
			}
			// else
			else {
				// store it in the parent
				if (!parent[elementId]) parent[elementId] = {};
			}
		}
		
		// if it has a attributes
		let firstClass = null;
		let elementClasses = (element.hasAttribute('class')) ? element.getAttribute('class').replace(/\t|\n/g, ' ').trim().split(' ') : [];
		elementClasses = elementClasses.map(className => "." + className);
		elementClasses = this.addAttributes(element, elementClasses);
		if (elementClasses.length > 0) {
			// for every seperate attribute
			for (let elementClass of elementClasses) {
				// validate the class name
				if (elementClass && !/ /.test(elementClass) && this.isValid(elementClass)) {
					let className = elementClass;
					// if this is the primary class name
					if(elementClasses.indexOf(elementClass) <= 0) {
						// if the class name is unique
						if (this.rootElement.querySelectorAll(className).length === 1) {
							// store it in the root
							if (!this.rootMap[className]) this.rootMap[className] = {};
							// assume the parent role
							if (!nextParent) nextParent = this.rootMap[className];
							// store the first class
							firstClass = this.rootMap[className];
						} 
						// else
						else {
							// add it to the parent
							if (!parent[className]) parent[className] = {}
							// store the first class
							firstClass = parent[className];
						}
					}
					// else
					else {
						// store if as a secondary class name
						if (firstClass && !firstClass['&' + className]) firstClass['&' + className] = {};
					}
				}
			}
		}

		// or if it has none
		else {
			// store the tag name in the parent
			let container = deepest || nextParent || parent;
			let tagName = element.nodeName.toLowerCase();
			if (!container[tagName]) container[tagName] = {};
		}

		// parse the child nodes
		for (let childNode of element.childNodes) {
			if (!/#text|#comment|script/i.test(childNode.nodeName)) {
				this.parse(childNode, nextParent || parent, firstClass);
			}
		}
	}
}

new DomIndex({
	root: '.common-container',
	attributes: /data-active|data-unavailable/
});
