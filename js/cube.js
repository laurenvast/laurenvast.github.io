var cube = function(p){

  var a = 0, d = 1;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // p.canvas.id('cube');
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = function() {
    p.background(255);

    var x, y, l, m, mx, my, x1, x2, x3, x4, y1, y2, y3, y4, y5, y6;

    x = p.width / 7 * 5;
    y = p.height / 1.9;
    l = (p.height + p.width) / 2 / 4;

    //find the distants between mouse and mid-point
    mx = (p.mouseX - p.width / 2) / 3;
    my = (p.mouseY - p.height / 2) / 2;

    m = Math.sqrt(l * l - l / 2 * l / 2);
    x1 = x - m * .9;
    x2 = x - mx - a;
    x3 = x + m * .9;
    x4 = x + mx + a;
    y1 = y - l + my;
    y2 = y - l / 2;
    y3 = y - my;
    y4 = y + l / 2;
    y5 = y3 + l;
    y6 = y + my;
    // fill(255, 0);

    // p.stroke(212, 72, 37);
    p.stroke(240, 212, 212);
        // p.stroke(208, 67, 74);
    // p.stroke(246, 214, 206);
    p.strokeWeight(l/16);

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
    
    a += d;

    if (a >= (p.height + p.width) / 2/2) {
      d = -d;
    }
    if (a <= 0) {
      d = -d;
    }
  }
}

var myp5 = new p5(cube, 'cube');
