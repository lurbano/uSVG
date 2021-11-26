# uSVG
Classes for creating svg images using vanilla Javascript.

## Classes

* uSvgGraph: Creates svg element with axes, tic marks with labels, and gridlines.
** Defaults to 400x400 dimensions

e.g. A window with 300x300 px dimensions:
```javascript
svg = new uSvgGraph({elementInfo:{width:300,height:300}});
```
