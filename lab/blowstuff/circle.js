function tri(w, h, ed){
  this.color = round(random(c.length-1));
  this.w = w;
  this.h = h;
  this.ed = ed;
  this.sw = this.ed;
  this.targetX = random(width);
  this.targetY = random(height);
  this.rot = 300;

  this.display = function(){
    push();
    translate(this.w, this.h);
    rotate(frameCount / this.rot);

    stroke(c[this.color]);
    strokeWeight(this.sw);
    noFill();
    // ellipse(this.w, this.h, this.ed, this.ed);

    
    polygon(0, 0, this.ed, 3); 
    pop();
  };

  this.move = function(){
    this.w = lerp(this.w, this.targetX, random(.01, .05));
    this.h = lerp(this.h, this.targetY, random(.01, .05));
    this.sw = lerp(this.sw, 0, random(.01, .07));
  };  

  this.isFinished = function() {
    if (this.sw < .5) {
      return true;
    } else {
      return false;
    }
  };
}

function strokeline(x, y) {
  this.color = round(random(c.length-1));
  this.x = x;
  this.y = y;
  this.targetX = random(width*-.3, width*.3);
  this.targetY = random(height*-.3, height*.3);
  this.sp = random(.05, .1);
  this.history = [];
  
  this.update = function() {
    // this.x += random(-10, 10);
    // this.y += random(-10, 10);
    
    for (var i = 0; i < this.history.length; i++) {
      this.x += this.targetX*this.sp;
      this.y += this.targetY*this.sp;
      this.history[i].x += random(-3, 3);
      this.history[i].y += random(-3, 3);
    }

    var v = createVector(this.x, this.y);
    this.history.push(v); 
    if (this.history.length > random(5, 15)) {
      this.history.splice(0, 1);
    }
  }
  
  this.show = function() {
    stroke(c[this.color]);
    strokeWeight(3);
    // fill(0, 150);
    // ellipse(this.x, this.y, 24, 24);
    
    noFill();
    beginShape();
    for (var i = 0; i < this.history.length; i++) {
      var pos = this.history[i];
      // fill(c[this.color]);
      // ellipse(pos.x, pos.y, i, i);
      vertex(pos.x, pos.y);
    }
    endShape();    
  };

  this.isFinished = function(){
      if (this.history[0].x >= width || this.history[0].x <=0) {
      return true;
    } else if (this.history[0].y >= height || this.history[0].y <=0){
      return true;
    } else {
      return false;
    }
  }
}

function Circle(x, y, d) {
  this.color = round(random(c.length-1));
  this.x = x;
  this.y = y;
  this.d = d;
  this.targetX = random(width);
  this.targetY = random(height);
  this.h = random(1, 100);

  this.display = function() {
    noStroke();
    fill(c[this.color]);
    ellipse(this.x, this.y, this.d, this.d);
  };

  this.isFinished = function() {
    if (this.d <= 1) {
      return true;
    } else {
      return false;
    }
  };

  this.move = function() {
    this.sp = random(.01, .1);
    this.x = lerp(this.x, this.targetX, this.sp);
    this.y = lerp(this.y, this.targetY, this.sp);
    this.d = lerp(this.d, 0, random(.02, .07));
  };
}

function BgCircle(d) {
  this.color = round(random(c.length-1));
  this.d = d;
  this.s = 50;

  this.display = function() {
    stroke(c[this.color]);
    strokeWeight(this.s);
    noFill();
    ellipse(width / 2, height / 2, this.d, this.d);
  };

  this.isFinished = function() {
    if (this.s < 1) {
      return true;
    } else {
      return false;
    }
  };
 
  this.move = function() {
    this.targetD = random(height*2, width);
    this.d = lerp(this.d, this.targetD, random(.01, .05));
    this.s = lerp(this.s, 0, random(.02, .08)); 
  };
}

function stripe(num){
  this.num = num;
  this.color = round(random(c.length-1));
  this.d = 0;
  this.h = height / 2 / (this.num*1.5);
  this.leading = (height/2 - this.h * this.num) / (this.num - 1);
  this.dspeed = width/40;

  this.display = function() {
    for (var i = 0; i < this.num; i++) {
      var h = (height - i * this.h - this.leading * i*5)/2;
      // console.log(this.d);
      noStroke();
      fill(c[this.color]);
      // fill(200, 100);
      rect(this.d, h+200, this.d*2, this.h);   
    }
  };

  this.isFinished = function() {
    if (this.d < 1) {
      return true;
    } else {
      return false;
    }
  };

  this.move = function() {
    // this.targetD = random(height*2, width);
    // this.d = lerp(this.d, 0, random(.01, .05));
    this.d += this.dspeed;
    if (this.d > width*1.2){
      this.dspeed = -this.dspeed;  
    };

  };
}

function polygon(x, y, radius, npoints) {
  var angle = TWO_PI / npoints;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
