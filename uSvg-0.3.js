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
    return t;
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
    angle_label = "use_angle", angle_label_f = 0.25, angle_label_rounding = 1,
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

      if (angle_label === 'use_angle'){
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



  addAngle({arc_r = 1,
    vertex = new uVertex(),
    angle_label = "use_angle",
    angle_label_f = 0.25,
    angle_label_rounding = 1,
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

    //let v = vertex;
    let [s1, s2] = vertex.getArcPoints(arc_r);

    let p1 = vertex.p1;
    let c = vertex.center;
    let p2 = vertex.p2;


    // convert to graph coordinates
    let cg = this.elemCoords(c);
    let s1g = this.elemCoords(s1);
    let s2g = this.elemCoords(s2);

    let rg = this.elemScale(arc_r);

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

      if (angle_label === 'use_angle'){
        angle_label = vertex.getAngle().toFixed(angle_label_rounding) + '°';
      }
      else if (angle_label === 'theta') { angle_label = 'θ'}
      else if (angle_label === 'alpha') { angle_label = 'α'}
      else if (angle_label === 'beta') { angle_label = 'β'}

      this.addText(angle_label, mp, {style: angleLabelStyle});
    }

    //arc.vertices = [s1, c, s2];

    return arc;

  }

  addAngleArc({arc_r = 1,
    vertex = new uVertex(),
    style={}} = {}){

    let defaultStyle = {
      r:4, fill:"none", stroke:"#000000",
      "stroke-width": 1
    };
    style = {...defaultStyle, ...style};

    let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");

    //let v = vertex;
    let [s1, s2] = vertex.getArcPoints(arc_r);

    let p1 = vertex.p1;
    let c = vertex.center;
    let p2 = vertex.p2;


    // convert to graph coordinates
    let cg = this.elemCoords(c);
    let s1g = this.elemCoords(s1);
    let s2g = this.elemCoords(s2);

    let rg = this.elemScale(arc_r);

    if (vertex.getAngle().toPrecision(5) != 90){
      style.d = `M ${s1g.x} ${s1g.y} `;
      style.d += `A ${rg} ${rg} 0 0 0 ${s2g.x} ${s2g.y}`;
    }
    else{
      let p90 = cg.deltaP(s2g).rotate(45).scale(-(2**0.5));
      p90 = cg.add(p90);
      style.d = `M ${s1g.x} ${s1g.y} `;
      style.d += `L ${p90.x} ${p90.y} L ${s2g.x} ${s2g.y}`;
    }

    this.setAttributes(arc, style);
    this.svg.appendChild(arc);

    return arc;

  }

  addAngleLabel({arc_r = 1,
    vertex = new uVertex(),
    angle_label = "use_angle",
    angle_label_f = 0.25,
    angle_label_rounding = 1,
    style={}} = {}){

    let defaultStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      'font-style': 'italic'
    };
    style = {...defaultStyle, ...style};

    let [s1, s2] = vertex.getArcPoints(arc_r);

    let p1 = vertex.p1;
    let c = vertex.center;
    let p2 = vertex.p2;

    //add label
    let f = angle_label_f;
    let mx = 0.5*s1.x + 0.5*s2.x;
    mx = f*c.x + (1-f)*mx;
    let my = 0.5*s1.y + 0.5*s2.y;
    my = f*c.y + (1-f)* my;
    let mp = new uPoint(mx, my);

    if (angle_label === 'use_angle'){
      let a = vertex.getAngle().toFixed(angle_label_rounding);
      if (a == 90) {
        angle_label = "";
      }
      else {
        angle_label = a + '°';
      }
    }
    else if (angle_label === 'theta') { angle_label = 'θ'}
    else if (angle_label === 'alpha') { angle_label = 'α'}
    else if (angle_label === 'beta') { angle_label = 'β'}

    let label = this.addText(angle_label, mp, {style: style});


    //arc.vertices = [s1, c, s2];

    return label;

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


  labelLineSegment(
                    segment = new uLineSegment(),
                    {
                      label="use_length",
                      placement = 0.5,
                      offset = 1,
                      label_rounding = 1,
                      style={}
                    } = {}
                  ){

    if (label === 'use_length'){
      let n = segment.length().toFixed(label_rounding);
      label = n%1 ? n : Math.round(n) ;
    }

    let lp = segment.perpTo({offset:offset});

    let txt = this.addText(label, lp.p1, {style:style});


    return txt;

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
  mag(){
    return this.distanceTo();
  }
  scale(f=1){
    return new uPoint(this.x*f, this.y*f);
  }
  deltaP(p = new uPoint()){
    let dx = this.x - p.x;
    let dy = this.y - p.y;
    return new uPoint(dx, dy);
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
  midpoint(p = new uPoint(), weight=0.5){
    let x = weight * this.x + (1-weight)*p.x;
    let y = weight * this.y + (1-weight)*p.y;
    return new uPoint(x,y);
  }
  rotate(angle=0, axis = new uPoint()){ //rotate about the origin
    angle = angle * Math.PI / 180;
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let x = this.x * c - this.y * s;
    let y = this.y * c + this.x * s;

    return new uPoint(x,y);
  }
  rotateAxis(angle=0, axis = new uPoint()){ //rotate about an axis
    angle = angle * Math.PI / 180;
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    let dx = this.x - axis.x  ;
    let dy = this.y -axis.y  ;
    let x = dx * c - dy * s;
    let y = dy * c + dx * s;

    let newPt = axis.add(new uPoint(x,y))
    return newPt;
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


class uVector{
  constructor(pos = new uPoint(), v = new uPoint(1,1)){
    this.pos = pos; this.v = v;
    this.endpt = this.pos.add(this.v);
  }
}


class uVertex{
  constructor(vertex = [new uPoint(1,0), new uPoint(0,0), new uPoint(0,1)]){
    this.vertex = vertex;
    this.p1 = vertex[0];
    this.p0 = this.center = vertex[1];
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

    //get interior angle:
    if (a < 0) {
		    a += (2*Math.PI);
  	}
  	if (a > Math.PI) {
  		a = 2*Math.PI - a;
  	}

    //console.log("angle (radians)", a);
    a = deg ? a * 180 / Math.PI : a;
    //console.log("angle (deg?)", a);

    return a;
  }

}

class uPolyLine{
  constructor({
                pts = [], //uPoints array
                segs = [], //uLineSegments array
              }){
    this.pts = pts;
    this.segs = segs;
  }
  draw(svg, {
              style = {}
            } = {}){

    this.svg = svg;
    this.drawArguments = arguments[1];
    let defaultStyle = {
      fill:"none",
      stroke:"#000000",
      "stroke-width": 1,
    };
    style = {...defaultStyle, ...style};

    svg.addPolyline(this.pts, {style:style});

  }
  rotate(angle=0, axis=new uPoint()){
    let pts = []
    for (let i=0; i<this.pts.length; i++){
      pts.push(this.pts[i].rotateAxis(angle, axis));
    }
    return new uPolyLine({pts:pts});
  }
  translate(x,y){
    let pts = []
    for (let i=0; i<this.pts.length; i++){
      pts.push(this.pts[i].addxy(x,y));
    }
    return new uPolyLine({pts:pts});
  }
  add(p = new uPolyLine()){
    let pts = [...this.pts, ...p.pts];
    return new uPolyLine({pts:pts});
  }
  moveStartTo(x,y){
    let dx = x - this.pts[0].x;
    let dy = y - this.pts[0].y;
    return this.translate(x, y);
  }
  reverse(){
    let pts = [];
    let n = this.pts.length;
    for (let i=0; i<this.pts.length; i++){
      pts.push(this.pts[n-1-i]);
    }
    return new uPolyLine({pts:pts})
  }
}

class uLineSegment{
  constructor(
              p0 = new uPoint(),
              p1 = new uPoint(1, 0)
            ){
    [this.p0, this.p1] = [p0, p1];
    this.midpoint = this.p0.midpoint(this.p1);
  }
  length(){
    return this.p0.distanceTo(this.p1);
  }
  // midpoint(){
  //   return this.p0.midpoint(this.p1);
  // }
  delta(){
    let dx = (this.p1.x - this.p0.x);
    let dy = (this.p1.y - this.p0.y);
    return new uPoint(dx, dy);
  }
  pointAlong(f=0.5){ // f is a fraction of the distance from p0
    let v = this.delta();
    let dx = f * v.x;
    let dy = f * v.y;
    return this.p0.addxy(dx, dy);
  }
  distanceAlong(d=1){
    let len = this.length();
    let f = d / this.length();
    return this.pointAlong(f);
  }
  // reverse(){
  //   [this.p0, this.p1] = [this.p1, this.p0];
  // }
  perpTo({f=0.5, offset=1}={}){
    //todo: location for a label
    let halfSeg = new uLineSegment(this.midpoint, this.p1);
    let pOff = halfSeg.distanceAlong(offset);
    pOff = pOff.rotateAxis(90, this.midpoint);
    let smallSeg = new uLineSegment(this.midpoint, pOff);
    return smallSeg;
  }
}





class uTriangle{
  constructor(p0 = new uPoint(),
              p1 = new uPoint(1,0),
              p2 = new uPoint(0,1)
            ){
    this.setPoints(p0, p1, p2);

  }

  setPoints(p0 = new uPoint(),
              p1 = new uPoint(1,0),
              p2 = new uPoint(0,1)){
    [this.p0, this.p1, this.p2] = [p0, p1, p2];
    this.pts = [this.p0, this.p1, this.p2];
    this.setVertices();
    this.setLineSegments();
  }

  setVertices(){
    this.v0 = new uVertex([this.p2, this.p0, this.p1]);
    this.v1 = new uVertex([this.p0, this.p1, this.p2]);
    this.v2 = new uVertex([this.p1, this.p2, this.p0]);
    this.vertices = [this.v0, this.v1, this.v2];
    this.angles = [this.v0.getAngle(), this.v1.getAngle(), this.v2.getAngle()];
  }

  setLineSegments(){
    this.s0 = new uLineSegment(this.p0, this.p1);
    this.s1 = new uLineSegment(this.p1, this.p2);
    this.s2 = new uLineSegment(this.p2, this.p0);
    this.lineSegments = [this.s0, this.s1, this.s2];
    this.lengths = [this.s0.length(), this.s1.length(), this.s2.length()];
  }

  translate(p = new uPoint(), draw = true){
    let p0 = this.p0.add(p);
    let p1 = this.p1.add(p);
    let p2 = this.p2.add(p);

    this.setPoints(p0, p1, p2);

    if (draw){ this.draw(this.svg, this.drawArguments)};
  }

  rotate(angle = 0, {axis = new uPoint(), draw = true} = {}){
    //angle in degrees
    let p0 = this.p0.rotateAxis(angle, axis);
    let p1 = this.p1.rotateAxis(angle, axis);
    let p2 = this.p2.rotateAxis(angle, axis);

    this.setPoints(p0, p1, p2);

    if (draw){ this.draw(this.svg, this.drawArguments)};
  }

  draw( svg,
        {
          showAngleLabels = [false, false, false],
          angleLabels = ["use_angle", "use_angle", "use_angle"],
          angleLabelRounding = [0, 0, 0],
          showAngleArcs = [false, false, false],
          angle_arc_r = [3, 3, 3],
          angleFontStyle = {},
          labelSides = [false, false, false],
          sideLabels = ["use_length", "use_length", "use_length"],
          sideLabelOffset = [1, 1, 1],
          sideLabelRounding = [1, 1, 1],
          sideLabelPlacement = [0.5, 0.5, 0.5],
          sideLabelStyle = {},
          style={}
        } = {}
      ){

    //store passed arguments
    this.svg = svg;
    this.drawArguments = arguments[1];

    let defaultStyle = {
      fill:"none",
      stroke:"#000000",
      "stroke-width": 1,
    };
    style = {...defaultStyle, ...style};

    let defaultAngleFontStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      "font-size": '0.75em'
    };
    angleFontStyle = {...defaultAngleFontStyle, ...angleFontStyle};

    let defaultSideLabelStyle = {
      "text-anchor": "middle",
      "dominant-baseline":"central",
      //"font-size": '0.75em'
    };
    sideLabelStyle = {...defaultSideLabelStyle, ...sideLabelStyle};

    //remove old triangle
    this.undraw();

    //draw polygon
    let pts = this.pts;
    pts.push(this.p0);
    this.polyline = svg.addPolyline(pts, {style:style});

    //draw angles
    //this.setVertices();
    this.arcs = [];
    for (let i = 0; i < showAngleArcs.length; i++){
      if (showAngleArcs[i]){
        this.arcs.push(
          svg.addAngleArc({
            arc_r: angle_arc_r[i],
            vertex: this.vertices[i]
          })
        );
      }
    }

    this.labels = [];
    for (let i = 0; i < showAngleLabels.length; i++){
      if (showAngleLabels[i]){

        let label = svg.addAngleLabel({
          arc_r: angle_arc_r[i],
          vertex: this.vertices[i],
          angle_label: angleLabels[i],
          angle_label_rounding: angleLabelRounding[i],
          style: angleFontStyle
        });
        this.labels.push(label);
      }
    }

    //label sides
    //this.setLineSegments();
    this.sideLabels = [];
    for (let i=0; i < labelSides.length; i++){
      if (labelSides[i]){
        let sLab = svg.labelLineSegment(
          this.lineSegments[i],
          {
            label: sideLabels[i],
            placement: sideLabelPlacement[i],
            offset: sideLabelOffset[i],
            label_rounding: sideLabelRounding[i],
            style: sideLabelStyle
          }
        );
        this.sideLabels.push(sLab);
      }
    }

  }

  undraw(){
    if (this.polyline !== undefined){
      this.polyline.remove();
    }
    if (this.arcs !== undefined){
      for (let i=0; i<this.arcs.length; i++){
        this.arcs[i].remove();
      }
    }
    if (this.labels !== undefined){
      for (let i=0; i<this.labels.length; i++){
        this.labels[i].remove();
      }
    }
    if (this.sideLabels !== undefined){
      for (let i=0; i<this.sideLabels.length; i++){
        this.sideLabels[i].remove();
      }
    }
  }

}



class uRightTriangle extends uTriangle{
  constructor(a = 1, b = 1, pos = new uPoint()){

    super();

    this.a = a;
    this.b = b;
    this.c = this.h = (a**2 + b**2)**0.5;
    this.pos = pos;

    //local coordinates of triangle
    let p1 = pos; // the right angle
    let p2 = p1.addxy(0, this.a);
    let p3 = p1.addxy( this.b, 0);

    this.setPoints(p1, p2, p3);

    this.alpha = this.angles[1];
    this.theta = this.angles[2];

  }

}

function uRad(deg){ return deg * Math.PI / 180; }
function uDeg(rad){ return rad * 180 / Math.PI; }

function getRightTriangle({
          a = undefined,
          b = undefined,
          c = undefined,
          alpha = undefined,
          theta = undefined,
          pos = new uPoint()
        } = {}){
  console.log("arguments", arguments);

  if (alpha !== undefined && a !== undefined){
    b = a * Math.tan(uRad(alpha));
    return new uRightTriangle(a, b, pos);
  }
  if (alpha !== undefined && b !== undefined){
    a = b / Math.tan(uRad(alpha));
    return new uRightTriangle(a, b, pos);
  }
  if (alpha !== undefined && c !== undefined){
    a = c * Math.cos(uRad(alpha));
    b = c * Math.sin(uRad(alpha));
    return new uRightTriangle(a, b, pos);
  }
  if (theta !== undefined && a !== undefined){
    b = a / Math.tan(uRad(theta));
    return new uRightTriangle(a, b, pos);
  }
  if (theta !== undefined && b !== undefined){
    a = b * Math.tan(uRad(theta));
    return new uRightTriangle(a, b, pos);
  }
  if (theta !== undefined && c !== undefined){
    a = c * Math.sin(uRad(theta));
    b = c * Math.cos(uRad(theta));
    return new uRightTriangle(a, b, pos);
  }

  if (a !== undefined && b !== undefined){
    return new uRightTriangle(a, b, pos);
  }
  if (a !== undefined && c !== undefined){
    let b = (c**2 - a**2)**0.5;
    return new uRightTriangle(a, b, pos);
  }
  if (b !== undefined && c !== undefined){
    let a = (c**2 - b**2)**0.5;
    return new uRightTriangle(a, b, pos);
  }

}



class uQuadratic{
  constructor(a=1, b=0, c=0){
    this.a = a; this.b = b; this.c = c;
  }
  y(x){
    return this.a * x**2 + this.b*x + this.c;
  }
  getPoint(x){
    return new uPoint(x, this.y(x));
  }
  tangentLine(x){
    let m = this.dydx(x);
    let b = this.y(x) - m * x;
    return new uLine(m, b);
  }
  dydx(x){
    return 2*this.a*x + this.b;
  }
  zeros(){
    let det = this.b**2 - 4*this.a*this.c;
    let x1 = (-this.b + det**0.5)/(2*this.a);
    let x2 = (-this.b - det**0.5)/(2*this.a);
    console.log('zeros', det, x1, x2)
    return [new uPoint(x1, 0), new uPoint(x2, 0)];
  }
  vertex(){
    let x = -this.b / (2 * this.a);
    return new uPoint(x, this.y(x));
  }
  critPointType(){
    let txt = this.a > 0 ? "minimum" : "maximum";
    return txt;
  }
}

class uRegularPolygon{
  //ref: https://www.nagwa.com/en/explainers/189136430432/

  constructor({nsides=6, sideLength=1, pos=new uPoint(), rotate=0} = {}){
    this.nsides = nsides;
    this.sideLength = sideLength;
    this.pos = pos;
    this.rotate = rotate;
    this.interiorAngle = 180 - 360/this.nsides; //interior angle
    this.centralAngle = 360/this.nsides;

    this.setPoints();

  }

  setPoints(){
    this.pts = [];
    for (let i=0; i<this.nsides; i++){
      let p = new uPoint(this.sideLength, 0);
      p = p.rotate(this.centralAngle*i+this.rotate);
      p.move(this.pos);
      this.pts.push(p);
    }
    this.setVertices();

  }

  setVertices(){
    this.vertices = [];

    //first vertex
    let v = new uVertex([ this.pts[1],
                          this.pts[0],
                          this.pts[this.pts.length-1]
                       ] );
    this.vertices.push(v)

    //middle vertices
    for (let i=1; i<this.nsides-1; i++){
      let v = new uVertex([this.pts[i+1], this.pts[i], this.pts[i-1]]);
      this.vertices.push(v);
    }

    //last vertex
    v = new uVertex([ this.pts[0],
                      this.pts[this.pts.length-1],
                      this.pts[this.pts.length-2]
                    ] );
    this.vertices.push(v)

  }

  drawPoints(svg, {style={}} = {}){

    this.svg = svg;

    let defaultStyle = {
      fill:"none",
      stroke:"#000000",
      "stroke-width": 1,
    };
    style = {...defaultStyle, ...style};

    //remove old points
    //this.undrawPts(svg);

    // add point symbols
    for (let i=0; i<this.pts.length; i++){
      this.pts[i].symbol = svg.drawPoint(this.pts[i], {style:style});
    }

  }

  undrawPts(svg){
    for (let i=0; i<this.pts; i++){
      if (this.pts[i].symbol !== undefined){
        this.pts[i].symbol.remove();
      }
    }
  }

  drawPolygon(svg, {style={}} = {}){
    //remove old line
    if (this.polyline !== undefined){this.polyline.remove()};
    //draw line
    this.polyline = svg.addPolyline([...this.pts, ...[this.pts[0]]], {style:style});
  }

  drawAngleArc({n=0, r=3, style={}} = {}){
    //remove old arc
    if (this.vertices[n].arc !== undefined){ this.vertices[n].arc.remove()};
    //add new arc
    this.vertices[n].arc = svg.addAngleArc({arc_r:r, vertex:this.vertices[n]});
  }

  drawAngleLabel({ n=0, angleLabel='use_angle', angleLabelRounding=0, style={}
                 } = {}){


  }


}
