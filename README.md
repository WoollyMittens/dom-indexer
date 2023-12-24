# DOM Indexer

A dev-tools snippet to find all unique id's and classnames in a container.

```javascript
new DomIndex({
	root: '.common-container',
	attributes: /data-active|data-unavailable/
});
```

**root: {CSS Selector}** - The CSS selector of a container on the page.

**attributes: {Regexp}** - Which attributes to also use as selectors.

Paste the contents of "dom-indexer.js" into the browser's dev-tools and it will output [LESS](https://lesscss.org/) for all the elements inside a container.
