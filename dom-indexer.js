export class DomIndex {
	constructor(props) {
		// establish the root
		this.rootElement = props.rootElement;
		this.rootMap = {};
		// store the allowed attributes
		this.ignoreIds = props.ignoreIds;
		this.allowedAttributes = props.allowedAttributes;
	}

	convert() {
		// parse every node in the root
		for (let childNode of this.rootElement.childNodes) {
			if (!/#text|#comment|script/i.test(childNode.nodeName)) {
				this.parse(childNode, this.rootMap);
			}
		}
		// publish the map
		const rootIdentifier = this.rootElement.id ? '#' + this.rootElement.id : '.' + this.rootElement.className.split(' ')[0];
		return rootIdentifier + ' ' + JSON.stringify(this.rootMap, null, '\t').replace(/"|,|:/g, "").replace(/\\/g, "\"");
	}

	isValid(className) {
		try { this.rootElement.querySelectorAll(className); return true; }
		catch (e) { return false }
	}

	getClassNames(element) {
		let elementSelectors = [];
		// get the classNames from the element
		let elementClasses = (element.hasAttribute('class')) ? element.getAttribute('class').replace(/\t|\n/g, ' ').trim().split(' ') : [];
		// for each class
		for (let elementClass of elementClasses) {
			// format as a selector
			elementSelectors.push("." + elementClass);
		}
		// return the formatted list of css selectors
		return elementSelectors;
	}

	getAttributes(element) {
		const elementSelectors = [];
		// get the attributes from the element
		let elementAttributes = [...element.attributes];
		// for each attribute
		for (let elementAttribute of elementAttributes) {
			// if the attribute is on the allowed list
			if (this.allowedAttributes.test(elementAttribute.name)) {
				// format as a selector
				elementSelectors.push(elementAttribute.value ? `[${elementAttribute.name}="${elementAttribute.value}"]` : `[${elementAttribute.name}]`);
			}
		}
		// return the formatted list of css selectors
		return elementSelectors;
	}

	parse(element, parent, deepest) {
		let nextParent = null;
		// if it has an id
		if (!this.ignoreIds && element.hasAttribute('id')) {
			const elementId = '#' + element.getAttribute('id');
			// if the id is unique
            let hasValidId;
            try { hasValidId = (this.rootElement.querySelectorAll(elementId).length === 1) } 
			catch (e) { hasValidId = false }
			if (hasValidId) {
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
		
		let firstClass = null;
		let elementClasses = [...this.getClassNames(element), ...this.getAttributes(element)];
		// if it has attributes
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

window.DomIndex = DomIndex;
