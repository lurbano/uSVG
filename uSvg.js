class uSvgGraph{
  constructor({
    elementInfo = {}, //html element data
    axesInfo = {},
  }={}){

    let defaultElementInfo = {
      width: 400,
      height: 400,
      id:undefined,
      scale:"auto"
    }
    this.elementInfo = {...defaultElementInfo, ...elementInfo};

    let defaultAxesInfo = {
      zero: new uPoint(this.elementInfo.width/2, this.elementInfo.height/2),
      xmax: 10,
      ymax: 10,
      dTics: 1,
      tics: true,
      ticSize: 0.25,
      dTicLabels: 2,
      ticLableStart: -8,
      ticLableOffset: 0.5,
      gridlines: true,
      axisStyle: {'stroke': '#900',
                  'stroke-width': "1"},
      ticStyle: {'stroke': '#900',
                 'stroke-width': "0.5"},
      ticLabelStyle: {"text-anchor": "middle",
                      "fill" : "#777777",
                      "font-size" : "10px"},
      gridStyle: {'stroke': '#ccc',
                  'stroke-width': "0.5"}
    }
    this.axesInfo = {...defaultAxesInfo, ...axesInfo};

    if (this.elementInfo.scale === 'auto') {
     this.elementInfo.scale = Math.max(this.elementInfo.height, this.elementInfo.width) / (2*this.axesInfo.xmax);
   }
    //console.log(this.elementInfo.height);

    //console.log(this.axesInfo.zero);

    this.setScale(this.elementInfo.scale);

    this.createElement();
    this.drawAxes();
  }

  setScale(scale){
    this.scale = scale;
  }

  drawAxes({axesInfo = undefined} = {}){
    axesInfo = (axesInfo === undefined) ? this.axesInfo : axesInfo;

    this.axisElements = [];
    let xmin = -axesInfo.xmax;
    let xmax = axesInfo.xmax;
    let ymin = -axesInfo.ymax;
    let ymax = axesInfo.ymax;
    [this.xmin, this.xmax, this.ymin, this.ymax] = [xmin, xmax, ymin, ymax];

    //x axis
    let p1 = new uPoint(xmin,0);
    let p2 = new uPoint(xmax,0);
    this.axisElements.push(this.addLine(p1, p2, {style: axesInfo.axisStyle}));

    //y axis
    p1 = new uPoint(0, ymin);
    p2 = new uPoint(0, ymax);
    this.axisElements.push(this.addLine(p1, p2, {style: axesInfo.axisStyle}));

    //grid lines
    for (let x=xmin; x<=xmax; x+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(x, ymin), new uPoint(x,ymax), {style:axesInfo.gridStyle}));
    }
    for (let y=ymin; y<=ymax; y+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(xmin,y), new uPoint(xmax,y), {style: axesInfo.gridStyle}));
    }

    //tic marks
    for (let x=xmin; x<=xmax; x+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(x, axesInfo.ticSize), new uPoint(x,-axesInfo.ticSize), {style: axesInfo.ticStyle}));
    }
    for (let y=ymin; y<=ymax; y+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(axesInfo.ticSize,y), new uPoint(-axesInfo.ticSize,y), {style:axesInfo.ticStyle}));
    }
    // tic labels
    for (let x = axesInfo.ticLableStart; x <= -axesInfo.ticLableStart; x += axesInfo.dTicLabels){
      if (x != 0) this.axisElements.push(this.addText(x, new uPoint(x, -axesInfo.ticSize*3.5), {style: axesInfo.ticLabelStyle}));
    }
    for (let y = axesInfo.ticLableStart; y <= -axesInfo.ticLableStart; y += axesInfo.dTicLabels){
      if (y != 0) this.axisElements.push(this.addText(y, new uPoint(axesInfo.ticSize*-2.5,y-.25), {style: axesInfo.ticLabelStyle}));
    }

  }

  addText(txt, p, {style = {}} = {}){
    let defaultStyle = {
      //"font-size": "10px",
      "text-anchor": "middle"
    }
    style = {...defaultStyle, ...style};

    let t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    p = this.elemCoords(p);
    t.setAttribute("x", p.x);
    t.setAttribute("y", p.y);
    this.setAttributes(t, style);
    t.textContent = txt;
    this.svg.appendChild(t);
  }

  setAttributes(element, style){
    for (const [key, value] of Object.entries(style)){
      //console.log(`${key} | ${value}`);
      element.setAttribute(key, value);
    }
  }

  addLine(p1, p2, {style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", "stroke-width":"4"
    };
    style = {...defaultStyle, ...style};
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    p1 = this.elemCoords(p1);
    p2 = this.elemCoords(p2);
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    // line.setAttribute("stroke", stroke);
    // line.setAttribute("stroke-width", stroke_width);
    this.setAttributes(line, style);

    this.svg.appendChild(line);
    return line;
  }

  addCircle(p = new uPoint(0,0), {style={}} = {}){
    let defaultStyle = {
      r:4, fill:"none", stroke:"#000000",
      "stroke-width": 1
    };
    style = {...defaultStyle, ...style};

    let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    p = this.elemCoords(p);

    circ.setAttribute("cx", p.x);
    circ.setAttribute("cy", p.y);
    // circ.setAttribute("r", style.r);
    this.setAttributes(circ, style);

    this.svg.appendChild(circ);
    return circ;
  }

  elemCoords(p){ //convert from graph coordinates to element coordinates
    let pn = new uPoint(0,0);
    pn.x = p.x * this.scale + this.axesInfo.zero.x;
    pn.y = -p.y * this.scale + this.axesInfo.zero.y;
    //console.log(p, pn);
    return pn;
  }

  elemScale(x){
    return x * this.scale;
  }

  createElement({elementInfo = undefined} = {}){
    elementInfo = (elementInfo === undefined) ? this.elementInfo : elementInfo;
    elementInfo = {...this.elementInfo, ...elementInfo};

    elementInfo.id = (elementInfo.id === undefined) ? "svg_" + Math.random().toString(36).substr(2, 5) : id;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // this.svg.setAttribute("width", elementInfo.width);
    // this.svg.setAttribute("height", elementInfo.height);
    // this.svg.setAttribute("id", elementInfo.id);
    this.setAttributes(this.svg, elementInfo);

    let scriptElement = document.currentScript;
    let parentElement = scriptElement.parentNode;
    parentElement.insertBefore(this.svg, scriptElement);
    return elementInfo.id;
  }

  drawLinearFunction(f = new uLine(), {style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", "stroke-width":"2"
    }
    style = {...defaultStyle, ...style};

    //let [xm, ym] = [this.xmin, this.ymin];
    let p1 = new uPoint(this.xmin, f.y(this.xmin));
    let p2 = new uPoint(this.xmax, f.y(this.xmax));

    if (p1.y > this.ymax) {
      p1.y = this.ymax;
    }
    if (p1.y < this.ymin){
      p1.y = this.ymin;
    }
    p1.x = f.x(p1.y);
    if (p2.y > this.ymax) {
      p2.y = this.ymax;
    }
    if (p2.y < this.ymin){
      p2.y = this.ymin;
    }
    p2.x = f.x(p2.y);

    let newLine = this.addLine(p1, p2, {style: style});
    if (this.lineList === undefined){this.lineList = []};
    this.lineList.push(newLine);

  }

  labelLinearFunction(f = new uLine(), x = 0, offset= new uPoint(0.25,0.25), {style = {}} = {}){
    let defaultStyle = {
      "text-anchor": "start",
      "font-size": "10px",
      fill: "red"
    }
    style = {...defaultStyle, ...style};

    let loc = new uPoint(x, f.y(x));
    loc = loc.add(offset);

    let txt = f.eqnAsText();

    let t = this.addText(txt, loc, {style: style})

    if (this.pointLabelsList === undefined){this.pointLabelsList = []};
    this.pointLabelsList.push(t);
    return t;

  }

  labelPoint(p = new uPoint(), offset= new uPoint(0.25,0.25), {style = {}} = {}){
    let defaultStyle = {
      "text-anchor": "start",
      "font-size": "10px",
      fill: "red"
    }
    style = {...defaultStyle, ...style}

    let loc = p.add(offset);

    let txt = `(${p.x},${p.y})`;

    let t = this.addText(txt, loc, {style: style})

    if (this.pointLabelsList === undefined){this.pointLabelsList = []};
    this.pointLabelsList.push(t);
    return t;
  }

  drawPoint(p = new uPoint(), {style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", "stroke-width":"2", r:0.2
    }
    style = {...defaultStyle, ...style}

    style.r = this.elemScale(style.r);
    // style.r = r;
    if (this.pointsList === undefined){this.pointsList = []};
    let c = this.addCircle(p, {style});
    this.pointsList.push(c);
  }
  drawPoints(pts = [new uPoint()], { style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", "stroke-width":"2", r:0.2
    }
    style = {...defaultStyle, ...style}

    style.r = this.elemScale(style.r);
    // style.r = r;

    if (this.pointsList === undefined){this.pointsList = []};
    for (const p of pts){
      let c = this.addCircle(p, {style});
      this.pointsList.push(c);
    }

  }

  get_uLine_from_two_points(p1, p2, drawPoints= true, drawLine=true){
    let line = get_uLine_from_two_points(p1, p2);
    if (drawPoints) {this.drawPoints([p1, p2])}
    if (drawLine) {this.drawLinearFunction(line)}
    return line;
  }

  get_intersection_of_two_uLines(l1, l2, drawPoint=true, { style = {}} = {}){
    //let p = get_intersection_of_two_uLines(l1, l2);
    let p = l1.intersectWith(l2);
    if (drawPoint) {this.drawPoints([p], {style:style});}
    return p;
  }

  get_uLine_from_slope_and_point(m = 1, pt = new uPoint(1,1), drawPoint=true, drawLine=true){
    let line = get_uLine_from_slope_and_point(m, pt);
    if (drawPoint) {this.drawPoints([pt])}
    if (drawLine) {this.drawLinearFunction(line)}
    return line;
  }

}


class uPoint{
  constructor(x=0, y=0) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
  }
  distanceTo(p = new uPoint()){
    let d = ((this.x-p.x)**2 + (this.y-p.y)**2)**0.5
    return d;
  }
  flip(ymax){
    this.y = ymax - this.y;
  }
  add(p = new uPoint()){
    let x = this.x + p.x;
    let y = this.y + p.y;
    return new uPoint(x,y);
  }
}

class uLine{
  constructor(m=1, b=0){
    this.generalForm = "y=mx+b";
    this.slope = this.m = m;
    this.intercept = this.b = b;
  }
  y(x){
    let y = this.m * x + this.b;
    //console.log(x, y);
    return y;
  }
  x(y){ return (y - this.b) / this.m; }
  perpSlope(){ return -(1/this.slope);}

  eqnAsText(){
    let txt = 'y =';

    if (this.m != 0){
      if (this.m == 1) {       txt += " x" ;         }
      else if (this.m == -1) { txt += " -x";         }
      else {                   txt += ` ${this.m}x`; }
    }

    if (this.b != 0) {
      if (this.b < 0) { txt += " -"; }
      else { if (this.m != 0) {txt += " +";}}
      txt += ` ${Math.abs(this.b)}` ;
    }
    return txt;
  }
  intersectWith(line = new uLine()){
    let l1 = line; let l2 = this;
    let x = (l2.b - l1.b) / (l1.m - l2.m);
    let y = l1.m * x + l1.b;
    return new uPoint(x, y);
  }
}
function get_uLine_from_two_points(p1 = new uPoint(), p2 = new uPoint(1,1)){
  let m = (p2.y - p1.y) / (p2.x - p1.x);
  let b = p1.y - m * p1.x;
  return new uLine(m, b);
}
function get_uLine_from_slope_and_point(m = 1, pt = new uPoint(1,1)){
  let b = pt.y - m * pt.x;
  return new uLine(m, b);
}
// function get_intersection_of_two_uLines(l1, l2){
//   let x = (l2.b - l1.b) / (l1.m - l2.m);
//   let y = l1.m * x + l1.b;
//   return new uPoint(x, y);
// }
