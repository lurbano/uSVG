# uSVG
Classes for creating svg images using vanilla Javascript.

## Classes

### `uSvgGraph`
 Creates svg element with axes, tic marks with labels, and gridlines.
 Defaults to 400x400 dimensions

e.g. A window with 300x300 px dimensions:
```javascript
svg = new uSvgGraph({elementInfo:{width:300,height:300}});
```

Graphing Methods:
* `drawLinearFunction(f = new uLine(), {style})`: draw y=mx+b line where f is a `uLine(m,b)` class instance.
* `drawPoints(pts = [new uPoint()], r=0.1, {style})`: draw an array of uPoints on the graph (uses `drawPoint` method)
* `drawPoint(p = new uPoint(), r=0.2, {style})`: draw a circle at the given point's (x,y) coordinates (using p as `uPoint(x,y)`)
* `labelPoint(p = new uPoint(), offset = new uPoint(0.25,0.25), {style})`: add a "(x,y)" label to a point (p and offset are `uPoints`)
* `get_uLine_from_two_points(p1, p2, drawPoints= true, drawLine=true)`: creates a `uLine` from two `uPoint`s, and, optionally, draws the line and points. (returns the uLine)
* `get_intersection_of_two_uLines(l1, l2, drawPoint=true)`: Finds and (optionally) draws the intersection point between two uLines (returns the uPoint).

Base Methods:
* `addText(txt, p, {style})`: add text (txt) at position (p: uPoint)
* `addLine(p1, p2, {style})`
* `addCircle(p, {style})`


### `uPoint(x,y)`
Creates an object to hold (x,y) coordinates to make them easier to work with.

Methods:
* `add(p = new uPoint())`: add uPoint p to the current uPoint.

### `uLine(m=1, b=0)`
Object for working with straight lines (y = mx + b).

Methods:
* `y(x)`: returns y for a given x.
* `x(y)`: returns x for a given y.
* `eqnAsText()`: returns a nice, printable version of the equation.
* `intersectWith(line = new uLine())`: returns the point of intersection (as a uPoint) between this line and the passed line.

Helper Functions:
* `get_uLine_from_two_points(p1, p2)`: returns the `uLine` from the given two points.
