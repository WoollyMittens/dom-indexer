# DOM Indexer

Convert HTML components into CSS boilerplate.

## Example

https://woollymittens.github.io/dom-indexer/

## Instructions

```javascript
var outputCss = new DomIndex({
    rootElement: document.querySelector(YOUR_ROOT_SELECTOR),
    allowedAttributes: /type|data-/
}).convert();
```

**rootElement: {DOM element}** - The CSS selector of a container on the page.

**allowedAttributes: {Regexp}** - Which attributes to also use as selectors.

## License

&copy; Maurice van Creij. Licensed under [The MIT License](https://opensource.org/licenses/MIT).
