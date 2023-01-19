
var logo = function(p){

  var a = 0, d = 1, isOverC, mx, my;

  p.setup = function() {
   // p.createCanvas(84, 50);

  const logo = p.select('#logo2'),
  canvasWidth = logo.width,
  canvasHeight = logo.height;

  p.createCanvas(canvasWidth, canvasHeight).parent('logo2');

  }

  p.windowResized = function() {
    p.resizeCanvas(p.canvasWidth, p.canvasHeight);
  }

  p.draw = function() {

    // console.log(p.width);
    p.background('#D0434A');

    var x = p.width / 2;
    var y = p.height / 2;
    var l = (p.height + p.width) / 2 / 4;

    var dis = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);

    if(dis < 40){
        isOverC = true;
    } else {
        isOverC = false;
    }

    //find the distants between mouse and mid-point
    if (isOverC == true){
      mx = (p.mouseX - p.width / 2) / 3;
      my = (p.mouseY - p.height / 2) / 2;
    } else {
      mx = p.mouseX/150;
      my = 0;
    }

    var m = Math.sqrt(l * l - l / 2 * l / 2);
    var x1 = x - m;
    var x2 = x - mx - a;
    var x3 = x + m;
    var x4 = x + mx + a;
    var y1 = y - l + my;
    var y2 = y - l / 2;
    var y3 = y - my;
    var y4 = y + l / 2;
    var y5 = y3 + l;
    var y6 = y + my;

    p.stroke(255);
    p.strokeWeight(2);

    p.line(x1, y2, x4, y3);
    p.line(x4, y3, x4, y5);
    p.line(x4, y5, x1, y4);
    p.line(x1, y4, x1, y2);
    p.line(x1, y2, x2, y1);
    p.line(x2, y1, x2, y6);
    p.line(x2, y6, x1, y4);
    p.line(x3, y2, x2, y1);
    p.line(x2, y6, x3, y4);
    p.line(x3, y4, x3, y2);
    p.line(x4, y5, x3, y4);
    p.line(x3, y2, x4, y3);

    a += d/5;
    if (a >= p.width/3) {
        d = -d;
    }
    if (a <= p.width/-3) {
        d = -d;
    }
  }
}
var myp5 = new p5(logo, 'logo2');
