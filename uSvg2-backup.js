class uSvgGraph{
  constructor({
    elementInfo = {width: 400,
             height: 400,
             id:undefined,
             scale:20
            }, //html element data
    axesInfo = {zero: new uPoint(elementInfo.width/2, elementInfo.height/2),
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
                        'stroke_width': "1"},
            ticStyle: {'stroke': '#900',
                       'stroke_width': "0.5"},
            ticLabelStyle: {"text-anchor": "middle",
                            "fill" : "#777777",
                            "font-size" : "10px"},
            gridStyle: {'stroke': '#ccc',
                        'stroke_width': "0.5"}
           },

  }={}){

    this.elementInfo = elementInfo;
    this.axesInfo = axesInfo;
    console.log(this.elementInfo);

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
    this.axisElements.push(this.addLine(p1, p2, axesInfo.axisStyle));

    //y axis
    p1 = new uPoint(0, ymin);
    p2 = new uPoint(0, ymax);
    this.axisElements.push(this.addLine(p1, p2, axesInfo.axisStyle));

    //tic marks
    for (let x=xmin; x<=xmax; x+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(x, axesInfo.ticSize), new uPoint(x,-axesInfo.ticSize), axesInfo.ticStyle));
    }
    for (let y=ymin; y<=ymax; y+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(axesInfo.ticSize,y), new uPoint(-axesInfo.ticSize,y), axesInfo.ticStyle));
    }
    // tic labels
    for (let x = axesInfo.ticLableStart; x <= -axesInfo.ticLableStart; x += axesInfo.dTicLabels){
      if (x != 0) this.axisElements.push(this.addText(x, new uPoint(x, -axesInfo.ticSize*3.5), {style: axesInfo.ticLabelStyle}));
    }
    for (let y = axesInfo.ticLableStart; y <= -axesInfo.ticLableStart; y += axesInfo.dTicLabels){
      if (y != 0) this.axisElements.push(this.addText(y, new uPoint(axesInfo.ticSize*-2.5,y-.25), {style: axesInfo.ticLabelStyle}));
    }

    //grid lines
    for (let x=xmin; x<=xmax; x+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(x, ymin), new uPoint(x,ymax), axesInfo.gridStyle));
    }
    for (let y=ymin; y<=ymax; y+=axesInfo.dTics){
      this.axisElements.push(this.addLine(new uPoint(xmin,y), new uPoint(xmax,y), axesInfo.gridStyle));
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
    for (const [key, value] of Object.entries(style)){
      //console.log(`${key} | ${value}`);
      t.setAttribute(key, value);
    }
    t.textContent = txt;
    this.svg.appendChild(t);
  }

  addLine(p1, p2, {stroke="#000", stroke_width="4"} = {}){
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    console.log(p1, p2);
    p1 = this.elemCoords(p1);
    p2 = this.elemCoords(p2);
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", stroke_width);

    this.svg.appendChild(line);
    return line;
  }

  elemCoords(p){ //convert from graph coordinates to element coordinates
    let pn = new uPoint(0,0);
    pn.x = p.x * this.scale + this.axesInfo.zero.x;
    pn.y = -p.y * this.scale + this.axesInfo.zero.y;
    //console.log(p, pn);
    return pn;
  }

  createElement({elementInfo = undefined} = {}){
    elementInfo = (elementInfo === undefined) ? this.elementInfo : elementInfo;
    elementInfo = {...this.elementInfo, ...elementInfo};

    elementInfo.id = (elementInfo.id === undefined) ? "svg_" + Math.random().toString(36).substr(2, 5) : id;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", elementInfo.width);
    this.svg.setAttribute("height", elementInfo.height);
    this.svg.setAttribute("id", elementInfo.id);

    let scriptElement = document.currentScript;
    let parentElement = scriptElement.parentNode;
    parentElement.insertBefore(this.svg, scriptElement);
    return elementInfo.id;
  }

  // drawFunction(f, {style = {}} = {}){
  //   if (f.generalForm = 'y=mx+b'){
  //     this.drawLinearFunction(f, {style})
  //   }
  // }

  drawLinearFunction(f, {style = {}} = {}){
    let defaultStyle = {
      stroke:"#000", stroke_width:"2"
    }
    style = {...defaultStyle, ...style}

    let ymin = f.y(this.xmin);
    let xmin = this.xmin;
    console.log("min max", xmin, ymin);
    if (ymin < this.ymin){
      xmin = f.x(this.ymin);
      ymin = f.y(xmin);
    }
    let ymax = f.y(this.xmax);
    let xmax = this.xmax;
    if ( ymax > this.ymax){
      xmax = f.x(this.ymax);
      ymax = f.y(xmax);
    }
    let p1 = new uPoint(xmin, ymin);
    let p2 = new uPoint(xmax, ymax);
    console.log("p1,p2",p1, p2);
    let newLine = this.addLine(p1, p2, {style});
    if (this.lineFuncs === undefined){this.lineFuncs = []};
    this.lineFuncs.push(newLine);
  }

}


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
  constructor({m=1, b=0} = {}){
    this.generalForm = "y=mx+b";
    this.slope = this.m = m;
    this.intercept = this.b = b;
  }
  y(x){
    let y = this.m * x + this.b;
    console.log(x, y);
    return y;
  }
  x(y){ return (y - this.b) / this.m; }
}
