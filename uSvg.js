class uSvg{
  constructor(id, {width="300", height="300",
                   scale = 1,
                   zero = new uPoint(0,0),
                   drawAxes = {w : width, h : height,
                               dxTic: 10, dyTic: 10}
                  } = {}){
    //console.log(document.currentScript);
    this.id = id+"_svg";
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("id", this.id);

    let scriptElement = document.currentScript;
    let parentElement = scriptElement.parentNode;

    parentElement.insertBefore(this.svg, scriptElement);

    this.vectors = [];

    //set scale
    this.scale = scale;
    this.gridScale = 10;

    //set xy zero
    this.setZero(zero);

    //draw axes
    this.axisDefaults = {w : width, h : height,
                dxTic: 10, dyTic: 10};
    //  merge axis properties
    drawAxes = {...this.axisDefaults, ...drawAxes};
    this.axisLines = [];
    this.axisTics = [];
    this.gridLines = [];
    //if (drawAxes) this.drawAxes(drawAxes);

    //add definition area
    this.defs = document.createElementNS("http://www.w3.org/2000/svg","defs");

    this.arrowMarkerId = "arrowhead";
    var marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", this.arrowMarkerId);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "0");
    marker.setAttribute("refY", "1.75");
    marker.setAttribute("orient", "auto");

    var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", "0 0, 5 1.75, 0 3.5");

    marker.appendChild(poly);
    this.defs.appendChild(marker);

    this.svg.appendChild(this.defs);
  }

  addLine(p1, p2, {stroke="#000", stroke_width="4"} = {}){
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    p1 = this.transform(p1);
    p2 = this.transform(p2);
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", stroke_width);

    this.svg.appendChild(line);
    return line;
  }
  //
  // drawGridLines({stroke="#000", stroke_width="4",
  //           dx= 10, dy= 10} = {}){
  //
  // }

  addArrow(p1, p2, {stroke="#000", stroke_width="4"} = {}){
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    p1 = this.transform(p1);
    p2 = this.transform(p2);
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", stroke_width);

    line.setAttribute("marker-end", "url(#arrowhead)");

    this.svg.appendChild(line);
    return line;
  }

  setZero(p){
    this.zero = new uPoint(p.x*this.scale, p.y*this.scale);
  }

  flip(p){
    p.y = this.height - p.y;
    return p;
  }

  transform(p){
    //scale
    p.y *= this.scale;
    p.x *= this.scale;
    //console.log(this.height, p.y, this.zero.y);
    p.y = this.height - p.y - this.zero.y;
    p.x = p.x + this.zero.x;

    return p;
  }


  drawAxes({w="100", h="100",
            dxTic= 10, dyTic= 10} = {}){

    this.removeAxes();
    this.xmin = -w;
    this.xmax = w;
    this.ymin = -h;
    this.ymax = h;

    let axisStyle = {'stroke': '#900',
                 'stroke_width': "1"};
    let ticStyle = {'stroke': '#900',
                              'stroke_width': "0.5"};
    let gridStyle = {'stroke': '#ccc',
                              'stroke_width': "0.5"};
    let p1 = new uPoint(-w,0);
    let p2 = new uPoint(w,0);

    this.axisLines.push(this.addLine(p1, p2, axisStyle));

    p1 = new uPoint(0, -h);
    p2 = new uPoint(0, h);
    this.axisLines.push(this.addLine(p1, p2, axisStyle));

    //tic marks
    for (let x=-w; x<=w; x+=dxTic){
      this.axisTics.push(this.addLine(new uPoint(x, 5), new uPoint(x,-5), ticStyle));
    }
    for (let y=-h; y<=h; y+=dyTic){
      this.axisTics.push(this.addLine(new uPoint(5,y), new uPoint(-5,y), ticStyle));
    }

    //gridlines
    for (let x=-w; x<=w; x+=dxTic){
      this.gridLines.push(this.addLine(new uPoint(x, h), new uPoint(x,-h), gridStyle));
    }
    for (let y=-h; y<=h; y+=dyTic){
      this.gridLines.push(this.addLine(new uPoint(w,y), new uPoint(-w,y), gridStyle));
    }
  }
  removeAxes(){
    this.axisLines.forEach(item => item.remove());
    this.axisLines = [];
    this.axisTics.forEach(item => item.remove());
    this.axisTics = [];
  }

  drawVector({pos=new uPoint(0,0), vx=undefined, vy=undefined, magnitude=undefined, angle=undefined} = {}){
    var v = new vector({'pos': pos,
                        'vx': vx, 'vy': vy,
                        'magnitude': magnitude,
                        'angle': angle})
    v.arrow = this.addArrow(v.pos, v.endpt);
    this.vectors.push(v);
  }

  straightLine({line = new uLine(1,0), stroke="#000", stroke_width="4"} = {}){
    let x = this.xmin;
    let y = line.y(x) ;
    let p1 = new uPoint(x, y);

    x = this.xmax;
    y = line.y(x) ;
    let p2 = new uPoint(x,y);

    console.log(p1, p2);
    let l = this.addLine(p1, p2, {stroke:stroke, stroke_width:stroke_width});
    return l;
  }

  addVector({base=undefined, vx=undefined, vy=undefined, magnitude=undefined, angle=undefined} = {}){

    let pos = 0;
    console.log('aV', base);
    if (base) {
      console.log("create")
      pos = base;
    }
    else if (this.vectors.length > 0) {
      console.log("if", this.vectors[this.vectors.length-1].endpt)
      pos = this.vectors[this.vectors.length-1].endpt;
    }
    else {
      pos = new uPoint(0,0);
    }
    console.log('addVector', this.vectors.length, pos, vx, vy);
    var v = new vector({'pos': pos,
                        'vx': vx, 'vy': vy,
                        'magnitude': magnitude,
                        'angle': angle})
    console.log("vec a", v);
    v.arrow = this.addArrow(v.pos, v.endpt);
    console.log("vec b", v);
    this.vectors.push(v);
  }
}

// arrowDef = `
//   <defs>
//     <marker id="arrowhead" markerWidth="10" markerHeight="7"
//     refX="0" refY="1.75" orient="auto">
//       <polygon points="0 0, 5 1.75, 0 3.5" />
//     </marker>
//   </defs>
// `;

class uPoint{
  constructor(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
  }
  flip(ymax){
    this.y = ymax - this.y;
  }
}

class uLine{
  constructor(m, b) {
    this.m = parseFloat(m);
    this.b = parseFloat(b);
  }
  y(x){
    return this.m * x + this.b;
  }
}

class vector{
  constructor({pos=new uPoint(0,0), vx=undefined, vy=undefined, magnitude=undefined, angle=undefined} = {}){

    this.pos = pos;
    console.log("c vec", this.pos, this.pos.x, this.pos.y);
    if (vx && vy){
      this.vx = vx; this.vy = vy;
    }
    else if(magnitude && angle){
      this.vx = magnitude * Math.cos(Math.radians(angle));
      this.vy = magnitude * Math.sin(Math.radians(angle));
    }
    console.log('addition', this.pos.x, this.vx, this.pos.x+this.vx )
    this.endpt = new uPoint(this.pos.x+this.vx, this.pos.y+this.vy);
    console.log("c pos", this.pos);
    console.log("c endpt", this.endpt, this.endpt.x, this.endpt.y);
    console.log("c this", this);
  }
}
