class uSvg{
  constructor({
    divId = undefined,
    elementInfo = {}, //html element data
    axesInfo = {} //coordinate system information
  }={}){

    let defaultElementInfo = {
      width: 400,
      height: 400,
      id:undefined,
      scale:"auto",
      dt: 10    //in milliseconds for animation
    }
    this.elementInfo = {...defaultElementInfo, ...elementInfo};

    this.divId = divId;
    let defaultAxesInfo = {
      zero: new uPoint(0, this.elementInfo.height),
      xmax: 10,
      ymax: 10
    }
    this.axesInfo = {...defaultAxesInfo, ...axesInfo};

    if (this.elementInfo.scale === 'auto') {
     this.elementInfo.scale = Math.max(this.elementInfo.height, this.elementInfo.width) / (2*this.axesInfo.xmax);
    }

    this.dt = this.elementInfo.dt;
    this.movements = [];  // element, uVec

    this.namespaceURI = 'http://www.w3.org/2000/svg';
    this.arrows = [];
    this.setScale(this.elementInfo.scale);

    this.elementInfo.id = this.createElement();

    //return this.elementInfo.id;
  }

  remove(){
    this.svg.remove();
  }

  setScale(scale){
    this.scale = scale;
  }

  addText(txt, p=new uPoint(), {style = {}} = {}){
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

  addArcToVertex({r = 1,
    vertex = [new uPoint(1,0), new uPoint(0,0), new uPoint(0,1)],
    angle_label = "angle", angle_label_f = 0.25, angle_label_rounding = 1,
    angleLabelStyle = {},
    style={}} = {}){

    let defaultStyle = {
      r:4, fill:"none", stroke:"#000000",
      "stroke-width": 1
    };
    style = {...defaultStyle, ...style};

    let defaultAngleLabelStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      'font-style': 'italic'
    };
    angleLabelStyle = {...defaultAngleLabelStyle, ...angleLabelStyle};

    let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");

    let v = new uVertex(vertex);
    let [s1, s2] = v.getArcPoints(r);

    let p1 = v.p1;
    let c = v.center;
    let p2 = v.p2;


    // convert to graph coordinates
    let cg = this.elemCoords(c);
    let s1g = this.elemCoords(s1);
    let s2g = this.elemCoords(s2);

    let rg = this.elemScale(r);

    style.d = `M ${s1g.x} ${s1g.y} `;
    style.d += `A ${rg} ${rg} 0 0 0 ${s2g.x} ${s2g.y}`;

    this.setAttributes(arc, style);
    this.svg.appendChild(arc);

    //add label
    let f = angle_label_f;
    if (angle_label !== ""){
      let mx = 0.5*s1.x + 0.5*s2.x;
      mx = f*c.x + (1-f)*mx;
      let my = 0.5*s1.y + 0.5*s2.y;
      my = f*c.y + (1-f)* my;
      let mp = new uPoint(mx, my);

      if (angle_label === 'angle'){
        angle_label = v.getAngle().toFixed(angle_label_rounding) + '°';
      }
      else if (angle_label === 'theta') { angle_label = 'θ'}
      else if (angle_label === 'alpha') { angle_label = 'α'}
      else if (angle_label === 'beta') { angle_label = 'β'}

      this.addText(angle_label, mp, {style: angleLabelStyle});
    }

    //arc.vertices = [s1, c, s2];

    return arc;

  }


  setMove(element, v = new uPoint(1,1)){
    console.log(element.tagName === 'circle', v);

    let id = this.movements.length;
    let m = new svgMovement({
      element: element,
      v: v,
      id: id
    });
    this.movements.push(m);
    console.log(m);
    return id;
  }

  animate(dt){
    for (let i=0; i<this.movements.length; i++){
      this.movements[i].animate(dt);
    }
  }

  setArrowHeadMarker({markerStyle = {}, pathStyle={}} = {}){

    let newMarker = isEmpty(markerStyle) ? false : true;

    let defaultMarkerStyle = {
      id:"arrow_0", viewBox:"0 -5 10 10", refX:"5", refY:"0", markerWidth:"4", markerHeight:"4", orient:"auto"
    };
    markerStyle = {...defaultMarkerStyle, ...markerStyle};

    let defaultPathStyle = {
      d:"M0,-5L10,0L0,5", class:"arrowHead"
    }
    pathStyle = {...defaultPathStyle, ...pathStyle};

    let arrowHeadPath = document.createElementNS(this.namespaceURI, "path");
    this.setAttributes(arrowHeadPath, pathStyle);

    let markerNum = 0;

    // set default arrowhead if necessary (arrowHeads[0])
    if (this.arrowHeads === undefined){ // set initial arrowhead
      this.arrowHeads = [document.createElementNS(this.namespaceURI, "marker")];
      //markerStyle.id = "arrow_0";
      this.setAttributes(this.arrowHeads[0], markerStyle);

      this.arrowHeads[0].appendChild(arrowHeadPath);
      this.svg.appendChild(this.arrowHeads[0]);
    }

    if (newMarker) { // add a new marker
      this.arrowHeads.push(document.createElementNS(this.namespaceURI, "marker"));
      markerNum = this.arrowHeads.length-1;
      markerStyle.id = "arrow_"+markerNum;
      this.setAttributes(this.arrowHeads[markerNum], markerStyle);
      this.arrowHeads[markerNum].appendChild(arrowHeadPath);
      this.svg.appendChild(this.arrowHeads[markerNum]);
    }



    return markerStyle.id;
  }

  addArrow(v = new uVector(), {markerStyle = {}, style = {}} = {}){

    let defaultStyle = {
      stroke:"#0000ff", "stroke-width":"2"
    };
    style = {...defaultStyle, ...style};

    let arrowHeadId = this.setArrowHeadMarker({markerStyle});

    style["marker-end"] = `url(#${arrowHeadId})`;
    let arrow = this.addLine(v.pos, v.endpt, {style});
    //arrow.setAttribute("marker-end", `url(#${arrowHeadId})`);
    this.arrows.push(arrow);



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
    this.setAttributes(this.svg, elementInfo);

    if (this.divId === undefined) {
      let scriptElement = document.currentScript;
      let parentElement = scriptElement.parentNode;
      parentElement.insertBefore(this.svg, scriptElement);
      }
    else {
      let parentElement = document.getElementById(this.divId);
      parentElement.appendChild(this.svg);
    }

    return elementInfo.id;
  }

  addPolyline(pts=[new uPoint(0,0), new uPoint(2,3)], {style={}}={}){
    // pts is an array of uPoints

    let defaultStyle = {
      fill:"none", stroke:"#000000",
      "stroke-width": 2, points: ""
    };
    style = {...defaultStyle, ...style};


    for (let n=0; n<pts.length; n++){
      let p = this.elemCoords(pts[n]);
      style.points += `${p.x.toFixed(4)},${p.y.toFixed(4)} `;
    }

    let line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    this.setAttributes(line, style);
    this.svg.appendChild(line);

    return line;

  }

  addRightTriangle({pos = new uPoint(), a = 1, b = 1,
    flip = "",
    rotate = 0, //degrees
    arc_r = 2,
    show_A_angle=true,
    show_B_angle=true,
    A_angle_label= 'angle', // "α",
    B_angle_label= 'angle', // "β",
    angleLabelStyle = {},
    show_a_side = true,
    show_b_side = true,
    show_c_side = true,  //hypothenuse
    a_side_offset = 0.5,
    b_side_offset = 0.5,
    c_side_offset = 0.5,
    a_side_label = "length",
    b_side_label = "length",
    sideLabelStyle = {},
    style={}} = {}){
    //a is the vertical side length
    //rotate is counterclockwise
    // flip can be vertical ("v"), horizontal ("h"), or both ("vh")


    let defaultStyle = {
      fill:"none", stroke:"#000000",
      "stroke-width": 2, points: "",
      //"transform-origin": `${p.x} ${p.y}`
    };
    style = {...defaultStyle, ...style};

    let defaultAngleLabelStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      "font-size": '0.75em'
    };
    angleLabelStyle = {...defaultAngleLabelStyle, ...angleLabelStyle};

    let defaultSideLabelStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      "font-size": '0.75em'
    };
    sideLabelStyle = {...defaultSideLabelStyle, ...sideLabelStyle};

    //flip vertically or horizontally
    a = /v/.test(flip) ? -a : a;
    b = /h/.test(flip) ? -b : b;

    let p = this.elemCoords(pos);
    if (rotate != 0){
      let t = `rotate(${-rotate}, ${p.x}, ${p.y})`;
      style.transform = style.transform === undefined ? t : `${t} ${style.transform}`;
    }

    let p1 = pos;
    let p2 = pos.addxy(0, a);
    let p3 = pos.addxy(b, 0);

    // draw triangle
    let pts = [p1, p2, p3, p1];
    let line = this.addPolyline(pts, {style});

    let tri = new uRightTriangle(a, b);
    tri.line = line;
    //tri.vertices = [p1, p2, p3];

    if (show_A_angle){
      let arcA = this.addArcToVertex({
        r: arc_r,
        vertex: [p1, p2, p3],
        angle_label: A_angle_label,
        angleLabelStyle: angleLabelStyle
      })
    }
    if (show_B_angle){
      let arcB = this.addArcToVertex({
        r: arc_r,
        vertex: [p2, p3, p1],
        angle_label: B_angle_label,
        angleLabelStyle: angleLabelStyle
      })
    }

    if (show_a_side){
      //this.labelLineSegment(p1, p2, "a");
    }

    return tri;

  }

  addCylinder({pos= new uPoint(), r = 1, h = 1, rLabel = r, hLabel = h, style={}} = {}){

    let defaultStyle = {
      fill:"none", stroke:"#000000",
      "stroke-width": 2, points: "",
      //"transform-origin": `${p.x} ${p.y}`
    };
    style = {...defaultStyle, ...style};

    let p1 = pos;
    let p = this.elemCoords(p1);
    this.addCircle(pos, {style:{
      r: this.elemScale(r),
      transform: "scale(1, 0.25)",
      "transform-origin": `${p.x} ${p.y}`
    }});

    let p2 = pos.addxy(0,h);
    p = this.elemCoords(p2);
    this.addCircle(pos.addxy(0, h), {style:{
      r: this.elemScale(r),
      transform: "scale(1, 0.25)",
      "transform-origin": `${p.x} ${p.y}`
    }});

    this.addLine(p1.addxy(r,0), p2.addxy(r,0), {style});
    this.addLine(p1.addxy(-r,0), p2.addxy(-r,0), {style});

    //radius
    this.addLine(p1, p1.addxy(r,0), {style});
    this.addText(rLabel, p1.addxy(r/2, 0.5));

    //height
    this.addText(hLabel, p1.addxy(r+0.5, h/2));

  }

}











class uSvgGraph extends uSvg {
  constructor({
    divId = undefined,
    elementInfo = {}, //html element data
    axesInfo = {},
  }={}){

    let defaultElementInfo = {
      width: 400,
      height: 400,
      id:undefined,
      scale:"auto"
    }
    elementInfo = {...defaultElementInfo, ...elementInfo};

    super({divId:divId, elementInfo:elementInfo});
    this.elementInfo = elementInfo;

    let defaultAxesInfo = {
      showAxes:true,
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

    this.divId = divId;

    if (this.elementInfo.scale === 'auto') {
     this.elementInfo.scale = Math.max(this.elementInfo.height, this.elementInfo.width) / (2*this.axesInfo.xmax);
   }

    this.setScale(this.elementInfo.scale);

    if (this.axesInfo.showAxes) {this.drawAxes();}

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
      p1.x = f.x(p1.y);
    }
    if (p1.y < this.ymin){
      p1.y = this.ymin;
      p1.x = f.x(p1.y);
    }

    if (p2.y > this.ymax) {
      p2.y = this.ymax;
      p2.x = f.x(p2.y);
    }
    if (p2.y < this.ymin){
      p2.y = this.ymin;
      p2.x = f.x(p2.y);
    }

    let newLine = this.addLine(p1, p2, {style: style});
    if (this.lineList === undefined){this.lineList = []};
    this.lineList.push(newLine);

  }

  labelLinearFunction(f = new uLine(), {x = 0, offset= new uPoint(0.25,0.25), style = {}} = {}){
    let defaultStyle = {
      "text-anchor": "start",
      "font-size": "10px",
      fill: "red"
    }
    style = {...defaultStyle, ...style};
    //console.log("x", x);
    let loc = new uPoint(x, f.y(x));
    loc = loc.add(offset);

    let txt = f.eqnAsText();

    let t = this.addText(txt, loc, {style: style})

    if (this.pointLabelsList === undefined){this.pointLabelsList = []};
    this.pointLabelsList.push(t);
    return t;

  }

  labelPoint(p = new uPoint(), {offset= new uPoint(0.25,0.25), style = {}} = {}){
    let defaultStyle = {
      "text-anchor": "start",
      "font-size": "10px",
      fill: "red"
    }
    style = {...defaultStyle, ...style}

    let loc = p.add(offset);

    //let txt = `(${p.x},${p.y})`;
    let txt = p.asText();

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

  get_uLine_from_two_points(p1, p2, {drawPoints= true, drawLine=true}={}){
    let line = get_uLine_from_two_points(p1, p2);
    if (drawPoints) {this.drawPoints([p1, p2])}
    if (drawLine) {this.drawLinearFunction(line)}
    return line;
  }

  get_intersection_of_two_uLines(l1, l2, {drawPoint=true, style = {}} = {}){
    //let p = get_intersection_of_two_uLines(l1, l2);
    let p = l1.intersectWith(l2);
    if (drawPoint) {this.drawPoints([p], {style:style});}
    return p;
  }

  get_uLine_from_slope_and_point(m = 1, pt = new uPoint(1,1), {drawPoint=true, drawLine=true, pointStyle={}, lineStyle={}}={}){
    let line = get_uLine_from_slope_and_point(m, pt);
    if (drawPoint) {this.drawPoints([pt], {style:pointStyle})}
    if (drawLine) {this.drawLinearFunction(line, {style:lineStyle})}
    return line;
  }

  drawQuadratic(q = new uQuadratic(), {dx = 0.1, style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", "stroke-width":"2", fill:'none', points:''
    }
    style = {...defaultStyle, ...style};

    let pts = [];

    for (let x=this.xmin; x<=this.xmax; x+=dx){

      let y = q.y(x);

      if (y < this.ymax && y > this.ymin){
        pts.push(new uPoint(x,y));
      }
    }

    q = this.addPolyline(pts, {style});

  }

}







function isEmpty(obj) {
   for (var x in obj) { console.log(x); return false; }
   return true;
}


function moveCircle({c=null, v=new uVec(), dt = 10}){

  x = parseFloat(c.getAttribute("cx"));
  y = parseFloat(c.getAttribute("cy"));
  x += v.x * dt / 1000;
  y += v.y * dt / 1000;
  c.setAttribute("cx", x);
  c.setAttribute("cy", y);
  //console.log(x,y);
}

class svgMovement{
  constructor({
    element = null,
    v = new uVec(),
    id = null,
    intervalId = null
  } = {}){
    this.element = element;
    this.v = v;
    this.id = id;
    this.intervalId = intervalId;
  }
  animate(dt = 1000){
    if (this.element.tagName === 'circle'){
      this.intervalId = setInterval(moveCircle, dt, {
        c: this.element,
        v: this.v,
        dt: this.dt
      });
    }
    //
    console.log("interval set:", this.intervalId);
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
  addxy(x,y){
    x = this.x + x;
    y = this.y + y;
    return new uPoint(x,y);
  }
  move(p = new uPoint()){
    this.x += p.x;
    this.y += p.y;
  }
  movexy(x,y){
    this.x += x;
    this.y += y;
  }
  asText({round=1}={}){
    if (round <= 1){
      let n = this.x.toFixed(1).toString();
      let tenth = parseInt(n[n.length-1]);
      if (tenth == 0) {round = 0;}
    }
    return `(${this.x.toFixed(round)}, ${this.y.toFixed(round)})`;
  }
  rotate(angle=0){ //rotate about the origin
    angle = angle * Math.PI / 180;
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let x = this.x * c - this.y * s;
    let y = this.y * c - this.x * s;
    return new uPoint(x,y);
  }
}

class uVec extends uPoint {
  constructor(x=0, y=0) {
    super(x, y);
  }
}

class uLine{
  constructor(m=1, b=0){
    this.generalForm = "y=mx+b";
    this.slope = this.m = m;
    this.intercept = this.b = b;
    this.vertical = isFinite(m) ? false : true;
  }
  y(x){
    let y = this.vertical ? undefined : this.m * x + this.b;
    //console.log(x, y);
    return y;
  }
  x(y){
    let x = this.vertical ? undefined : (y - this.b) / this.m;
    return x;
  }

  perpSlope(){
    let mp = -(1/this.slope);
    if (isFinite(mp) === false){
      console.log("uLine.perpSlope is vertical");
      mp = undefined;
    }
    return mp;
  }

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

    if (this.m == 0 && this.b == 0){
      txt += " 0";
    }
    return txt;
  }
  asText({round=2}={}){
    return this.eqnAsText();
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

class uQuadratic{
  constructor(a=1, b=0, c=0){
    this.a = a; this.b = b; this.c = c;
  }
  y(x){
    return this.a * x**2 + this.b*x + this.c;
  }
}

class uVector{
  constructor(pos = new uPoint(), v = new uPoint(1,1)){
    this.pos = pos; this.v = v;
    this.endpt = this.pos.add(this.v);
  }
}

class uRightTriangle{
  constructor(a, b){
    this.a = a; this.b = b;
    this.c = (a**2 + b**2)**0.5;

    //local coordinates of triangle
    this.C = new uPoint();
    this.A = this.C.addxy(0, this.a);
    this.B = this.C.addxy( this.b, 0);
    this.vertexC = [this.A, this.C, this.B];
    this.vertexA = [this.C, this.A, this.B];
    this.vertexB = [this.C, this.B, this.A];
  }
  angle_a(deg=false){
    let a = Math.asin(this.b/this.c);
    if (deg){a = a * 180/Math.PI;}
    return a;
  }
  angle_b(deg=false){
    let b = Math.asin(this.a/this.c);
    if (deg){b = b * 180/Math.PI;}
    return b;
  }
  rotate(angle=90){ //all in local coordinates
    this.A = this.A.rotate(angle);
    this.B = this.B.rotate(angle);

  }
}

class uVertex{
  constructor(vertex = [new uPoint(1,0), new uPoint(0,0), new uPoint(0,1)]){
    this.vertex = vertex;
    this.p1 = vertex[0];
    this.center = vertex[1];
    this.p2 = vertex[2];
  }
  getArcPoints(r=1){
    // get coordinates of the points along the arms
    //   of the vertex that are r units away from the
    //   vertex.
    let p1 = this.p1;
    let c = this.center;
    let p2 = this.p2;

    // do first arm
    let dx = p1.x - c.x;
    let dy = p1.y - c.y;
    let m = (dx**2 + dy**2)**0.5;
    let dxp = dx * r/m;
    let dyp = dy * r/m;
    let s1 = c.addxy(dxp, dyp);

    // do second arm
    dx = p2.x - c.x;
    dy = p2.y - c.y;
    m = (dx**2 + dy**2)**0.5;
    dxp = dx * r/m;
    dyp = dy * r/m;
    let s2 = c.addxy(dxp, dyp);

    return [s1, s2];

  }
  getAngle(deg=true){
    let a1 = Math.atan2(this.p1.y - this.center.y, this.p1.x - this.center.x);
    let a2 = Math.atan2(this.p2.y - this.center.y, this.p2.x - this.center.x);
    let a = a2 - a1;
    a = deg ? a * 180 / Math.PI : a;
    return a;
  }

}
