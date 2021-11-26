
class uMeme{
  constructor({ txt="Hi!", img="rain-window-450x250.png",  id = undefined,
                elementStyle={}, imageStyle={}, textStyle={} } = {} ){
    let defaultElementStyle = {
      width: 450,
      height: 250
    }
    this.elementStyle = {...defaultElementStyle, ...elementStyle};

    let defaultImageStyle = {
      href: img,
      width: this.elementStyle.width,
      height: this.elementStyle.height
    }
    this.imageStyle = {...defaultImageStyle, ...imageStyle};

    let defaultTextStyle = {
      x: this.imageStyle.width/2,
      y: this.imageStyle.height*0.25,
      'text-anchor': "middle",
      'dominant-baseline': 'middle',
      fill: '#ffffff',
      width: this.imageStyle.width*0.8
    }
    this.textStyle = {...defaultTextStyle, ...textStyle};

    this.preDefinedElement = (id === undefined) ? false : true;
    this.id = (id === undefined) ? "svg_" + Math.random().toString(36).substr(2, 5) : id;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.setAttributes(this.svg, this.elementStyle);

    //add image
    this.imageElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    this.setAttributes(this.imageElement, this.imageStyle);
    this.svg.appendChild(this.imageElement);

    //add text
    //this.txt = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty';
    this.txt = txt;
    this.textElement = this.addText(this.txt);

    //install on webpage before script element
    let scriptElement = document.currentScript;
    let parentElement = scriptElement.parentNode;
    parentElement.insertBefore(this.svg, scriptElement);

    //adjust text element
    this.lines = this.wrap();
    this.textElement.remove();




  }
  addText(txt, {style=this.textStyle}={}){
    let textElm = document.createElementNS("http://www.w3.org/2000/svg", "text");
    this.setAttributes(textElm, style);
    textElm.textContent = txt;
    this.svg.appendChild(textElm);
    return textElm;
  }

  wrap(){
    let width = this.textStyle.width;
    let t = this.txt;
    let bbox = this.textElement.getBBox();
    console.log(bbox);
    let nChars = t.length;
    let nWords = t.split(' ').length;

    console.log(nChars, nWords, width);

    //approximate number of characters in line
    let cLine = Math.floor(nChars * width / bbox.width);
    console.log(cLine);

    let lines = [];

    while (t.length >= cLine) {
    //for (let x=0; x<5; x++){
      let a = t.substring(0, cLine);
      let n = a.lastIndexOf(" ");
      lines.push(t.substring(0, n));
      t = t.substring(n+1);
      //console.log(a, "|", t);
    }
    lines.push(t);
    console.log(lines);

    // add text elements
    this.lines = lines;

    this.textElements = [];
    for (const t of this.lines){
      //console.log(t);
      let s = this.textStyle;
      s.y += bbox.height;
      //console.log(s);
      this.textElements.push(this.addText(t, s));
    }

    // adjust height
    let b1 = this.textElements[0].getBBox();
    let b2 = this.textElements[this.textElements.length-1].getBBox();
    let top = b1.y - b1.height;
    let bot = b2.y;

    let yTop = (this.elementStyle.height - (bot-top))/2;

    for (const e of this.textElements){
      e.remove();
    }

    this.textElements = [];
    this.textStyle.y = yTop;
    for (const t of this.lines){
      console.log(t);
      let s = this.textStyle;
      s.y += bbox.height;
      console.log(s);
      this.textElements.push(this.addText(t, s));
    }


  }
  setAttributes(element, style){
    for (const [key, value] of Object.entries(style)){
      //console.log(`${key} | ${value}`);
      element.setAttribute(key, value);
    }
  }
}
