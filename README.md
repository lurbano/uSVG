# uSVG
Classes for creating svg images using vanilla Javascript.

## Classes

### uSvgGraph
 Creates svg element with axes, tic marks with labels, and gridlines.
 Defaults to 400x400 dimensions

e.g. A window with 300x300 px dimensions:
```javascript
svg = new uSvgGraph({elementInfo:{width:300,height:300}});
```

Methods:
* drawLinearFunction(f, {style}): draw y=mx+b line where f is a `uLine(m,b)` class instance.
* labelPoint(p, offset, {style}): add a "(x,y)" label to a point (p and offset are `uPoints`)
* addText(txt, p, {style}): add text (txt) at position (p: uPoint)
* addLine(p1, p2, {style})
* addCircle(p, {style})
###
