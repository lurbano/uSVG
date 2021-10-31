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

    //set xy zero
    this.setZero(zero);

    //draw axes
    this.axisDefaults = {w : width, h : height,
                dxTic: 10, dyTic: 10};
    //  merge axis properties
    drawAxes = {...this.axisDefaults, ...drawAxes};
    this.axisLines = [];
    this.axisTics = [];
    if (drawAxes) this.drawAxes(drawAxes);

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

    let axisStyle = {'stroke': '#900',
                 'stroke_width': "1"};
    let ticStyle = {'stroke': '#900',
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
  }
  removeAxes(){
    this.axisLines.forEach(item => item.remove());
    this.axisLines = [];
    this.axisTics.forEach(item => item.remove());
    this.axisTics = [];
  }

  addVector({pos=new uPoint(0,0), vx=undefined, vy=undefined, magnitude=undefined, angle=undefined} = {}){
    var v = new vector({'pos': pos,
                        'vx': vx, 'vy': vy,
                        'magnitude': magnitude,
                        'angle': angle})
    v.arrow = this.addArrow(v.pos, v.endpt);
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
    this.x = x;
    this.y = y;
  }
  flip(ymax){
    this.y = ymax - this.y;
  }
}


class vector{
  constructor({pos=new uPoint(0,0), vx=undefined, vy=undefined, magnitude=undefined, angle=undefined} = {}){
    this.pos = pos;
    if (vx && vy){
      this.vx = vx; this.vy = vy;
    }
    else if(magnitude && angle){
      this.vx = magnitude * Math.cos(Math.radians(angle));
      this.vy = magnitude * Math.sin(Math.radians(angle));
    }
    this.endpt = new uPoint(this.pos.x+this.vx, this.pos.y+this.vy);
  }
}
