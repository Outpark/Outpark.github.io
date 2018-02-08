var ghost;
var sunset;
var main_bgm;
var main_bgm2;
var drop1;
var drop2;
var drop3;
var colorDrops = [];
var blackDrops = [];
var ghostSize = 40;
var ghostX;
var ghostY;
var mode = 0;
var colorDropCount;
var blackDropCount;
var mountain1;
var mountain2;
var collectedDrop = 0;

var move = true;
var playing_bgm;
var flag = 1;
var ready = false;
var readyReady = false;

var myFont;
var overYes = false;
var overNo = false;

var clickedNo = false;

function preload() {
  main_bgm = loadSound('./static/melodyloop.mp3');
  main_bgm2 = loadSound('./static/inspiring_technology.mp3');
  main_bgm3 = loadSound('./static/step_into_the_sun.mp3');
  drop1 = loadSound('./static/drop1.mp3');
  drop2 = loadSound('./static/pin_drop.mp3');
  drop3 = loadSound('./static/drop3.mp3');
  mountain1 = loadImage('./static/mountain1.png');
  mountain2 = loadImage('./static/mountain2.png');

  myFont = loadFont('./static/IndieFlower.ttf');


}

function setup() {
  createCanvas(1000,600);
  playing_bgm = main_bgm;
  playing_bgm.loop();

  sunset = new SUNSET();
  noStroke();
  ghost = new Ghost();

  collectedDrop = 0;

  colorDropCount = 40;
  blackDropCount = 20;

  for(let i=0;i<colorDropCount;i++){
    colorDrops[i] = new ColorDrop();
  }
  for(let i=0;i<blackDropCount;i++){
    blackDrops[i] = new BlackDrop();
  }
}

function draw() {
  textFont(myFont);

  if(!ready){
    getReady();
  }else if(!readyReady){
    gettingReady();
  }else{
    text("RESCUED: "+collectedDrop, 50, 30);
    background(sunset.colors[0], sunset.colors[1], sunset.colors[2], 10);
    image(mountain1,200,300,50);
    image(mountain2,700,150,90);
    sunset.setting();
    ghost.display();
    if(move)
      ghost.bounce();
    ghost.control();

    handleDrops();
  }

}

function handleDrops(){
  if(mode === 0) {
    colorDrops.forEach(drop => {
        drop.display();
        // drop.bounce();
    });

    for(let drop of blackDrops) {
      drop.display();
      if(move)
        drop.bounce();
    }
  }else{
    for(let i = 0;i<colorDropCount/2;i++){
      colorDrops[i].display();
    }
    for(let i = 0;i<blackDropCount/2;i++){
      blackDrops[i].display();
      if(move)
        blackDrops[i].bounce();
    }
  }

}

function getReady() {
  background(10,10,10);
  textSize(32);
  fill(255);
  text("Are you ready to rescue?", 250,250);
  answerColor(overYes);
  text("Yes", 350, 320);
  answerColor(overNo);
  text("No", 500, 320);

  if(clickedNo){
    fill(255)
    textSize(20);
    text("Please, try again :)", 500, 420);
  }

}

function gettingReady(){
  background(10,10,10);
  textSize(32);
  fill(255);
  text("How Many?", 250,250);
  answerColor(overYes);
  text("A few", 350, 320);
  answerColor(overNo);
  text("A lot", 500, 320);
  fill(255)
  textSize(22);
  text("Tip: move using W,A,S,D", 350, 380);
}

function answerColor(over){
  if(over)
    return fill(50);
  else
    return fill(255)
}

function mouseMoved(){
  if(!ready){
    if(mouseX >=340 && mouseX <= 400){
      if(mouseY >=300 && mouseY <= 340){
        overYes = true;
        // text("Yes", 350, 320);
      }else{
        overYes = false;
      }
    }else{
      overYes = false;
    }
    if(mouseX >=498 && mouseX <= 540){
      if(mouseY >=300 && mouseY <= 340){
        overNo = true;
        // text("Yes", 350, 320);
      }else
        overNo = false;
    }else{
      overNo = false;
    }
  }else if(!readyReady){
    if(mouseX >=340 && mouseX <= 412){
      if(mouseY >=300 && mouseY <= 340){
        overYes = true;
        // text("Yes", 350, 320);
      }else{
        overYes = false;
      }
    }else{
      overYes = false;
    }
    if(mouseX >=498 && mouseX <= 580){
      if(mouseY >=300 && mouseY <= 340){
        overNo = true;
        // text("Yes", 350, 320);
      }else{
        overNo = false;
      }
    }else{
      overNo = false;
    }
  }
}

function mouseClicked(){
  if(!ready){
    if(mouseX >=340 && mouseX <= 400){
      if(mouseY >=300 && mouseY <= 340){
        console.log("YES!");
        ready = true;
        overYes = false;
        clickedNo = false;
      }
    }else if(mouseX >=498 && mouseX <= 540){
      if(mouseY >=300 && mouseY <= 340){
        clickedNo = true;
        console.log("NO!");
      }
        
    }
  }else if(!readyReady){
    if(mouseX >=340 && mouseX <= 412){
      if(mouseY >=300 && mouseY <= 340){
        console.log("YES!");
        readyReady = true;
        overYes = false;
        mode = 1;
      }
    }else if(mouseX >=498 && mouseX <= 580){
      if(mouseY >=300 && mouseY <= 340){
        readyReady = true;
        overNo = false;
        mode = 0;
      }
    }
  }

}

function SUNSET(){
  this.R = 255;
  this.G = 254;
  this.B = 253;


  this.current = 0;

  this.stage = {
    first: [255,254,253],
    second: [255,241,223],
    thrid: [255,224,157],
    fourth: [232,193,150],
    fifth: [222,219,200]
  };
  // Initialize background colors with first satge of sunsetting
  this.colors = [...this.stage.first];

  //color correction logic - emulates sunsetting
  this.setting = function() {
    var nextSet;
    switch(this.current){
      case 0:
        nextSet = this.stage.second;
        if(this.colors[1] > nextSet[1])
          this.colors[1] -= 0.2;
        if(this.colors[2] > nextSet[2])
          this.colors[2] -= 0.2;

        break;
      case 1:
        nextSet = this.stage.thrid;
        if(this.colors[1] > nextSet[1])
          this.colors[1] -= 0.2;
        if(this.colors[2] > nextSet[2])
          this.colors[2] -= 0.2;

        break;
      case 2:
        nextSet = this.stage.fourth;
        if(this.colors[0] > nextSet[0]){
          this.colors[0] -= 0.2;
        }
        if(this.colors[1] > nextSet[1])
          this.colors[1] -= 0.2;
        if(this.colors[2] > nextSet[2])
          this.colors[2] -= 0.2;


        break;
      case 3:
        nextSet = this.stage.fifth;
        if(this.colors[0] > nextSet[0]){
          this.colors[0] -= 0.2;
        }
        if(this.colors[1] < nextSet[1])
          this.colors[1] += 0.2;
        if(this.colors[2] < nextSet[2])
          this.colors[2] += 0.2;

        break;
      case 4:
        nextSet = this.stage.first;

        if(this.colors[0] < nextSet[0]){
          this.colors[0] += 0.2;
        }
        if(this.colors[1] < nextSet[1])
          this.colors[1] += 0.2;
        if(this.colors[2] < nextSet[2])
          this.colors[2] += 0.2;

        break;
    }

    if(Math.round(this.colors[0]) === nextSet[0] && Math.round(this.colors[1]) === nextSet[1]&& Math.round(this.colors[2]) === nextSet[2]){
      if(this.current === 4){
        this.current = 0;
      }else
        this.current++;
    }

  }

}
function Ghost(){
 this.color = [66, 75, 84];
 this.ripples = [];
 this.rippleCount = 0;

 ghostX = random(200,500);
 ghostY = random(200,500);

 this.xMove = 0.5;
 this.yMove = 0.5;

 this.display = function() {
  fill(this.color[0],this.color[1],this.color[2]);
  ellipse(ghostX, ghostY, ghostSize, ghostSize);

  //display ripples if any
  this.ripples.forEach(ripple => {
    ripple.display();
  })
 }
 this.control = function() {
  if(keyIsDown(65)){
    if(ghostX > 10)
      ghostX -= 3;
  }
  if(keyIsDown(68)){
    if(ghostX < width)
      ghostX += 3;
  }

  if(keyIsDown(87)){
    if(ghostY > 0)
      ghostY -= 3;
  }
  if(keyIsDown(83)){
    if(ghostY < height)
      ghostY += 3;
  }
 }
 this.bounce = function() {
  let mask  = Math.floor(Math.random()*2) == 1 ? 1 : -1
  if(ghostX < width && ghostX > 0){
    ghostX += (random(3)*mask);
  }
  if(ghostY < height && ghostY > 0){
    ghostY += (random(3)*mask)
  }
 }

 this.hitDrop = function(otherColors) {
  //create a ripple
  collectedDrop++;
  if(this.rippleCount < 10){
    let ripple = new Ripple(ghostX, ghostY, otherColors);
    ripple.display();
    this.ripples[this.rippleCount++] = ripple;
  }else {
    this.rippleCount = 0;
  }

  // mix ghost's color with the drop's
  this.color[0] += otherColors[0]/4;
  this.color[1] += otherColors[1]/4;
  this.color[2] += otherColors[2]/4;
}

this.hitBlackDrop = function(blackColors) {
  let blackRipple = new Ripple(ghostX,ghostY,[0,0,0]);
  blackRipple.display();

  this.color[0] -= 80;
  this.color[1] -= 80;
  this.color[2] -= 80;
}

}

function Ripple(x, y, colors){
  this.size = random(50,90);
  this.colors = [...colors];
  this.xPos = x;
  this.yPos = y;

  this.display = function() {

    fill(this.colors,255);
    ellipse(this.xPos, this.yPos, this.size, this.size);
    noStroke();

    if(this.size > 40){
      this.size += random(5);
    }
    if(this.size > 90){
      this.size = 0;
    }

  }
}

function updateSize(size){
  ghostSize = size.value;
}

function ColorDrop(){
  this.colors = [random(20,255), random(20,255), random(20,255)];
  this.xPos = random(1000);
  this.yPos = random(600);
  this.speed = random(5);
  this.size = random(10,50);

  this.display = function() {
    fill(this.colors);
    ellipse(this.xPos,this.yPos,this.size,this.size);

    //detect hit with the ghost
    if(dist(ghostX,ghostY,this.xPos,this.yPos) < 30){
      ghost.hitDrop(this.colors);
      drop1.play();
      drop2.play();
      this.reset();
    }
  }

  this.reset = function() {
    this.colors = [random(20,255), random(20,255), random(20,255)];
    this.xPos = random(1000);
    this.yPos = random(600);
    this.speed = random(5);
    this.size = random(10,50);
  }


}

function BlackDrop(){
  this.colors = [0, 0, 0];
  this.xPos = random(50,950);
  this.yPos = random(50, 550);
  this.speed = random(5);
  this.size = random(10,50);

  this.display = function() {
    fill(this.colors);
    ellipse(this.xPos,this.yPos,this.size,this.size);

    //detect hit with the ghost
    if(dist(ghostX,ghostY,this.xPos,this.yPos) < 30){
      ghost.hitBlackDrop(this.colors);
      drop3.play();
      this.reset();
    }
  }

  this.reset = function() {
    this.colors = [0,0,0];
    this.xPos = random(1000);
    this.yPos = random(600);
    this.speed = random(5);
    this.size = random(10,50);
  }

  this.bounce = function() {
    let mask  = Math.floor(Math.random()*2) == 1 ? 1 : -1
    if(this.yPos < height && this.yPos > 0){
      this.yPos += (random(3)*mask)
    }
    if(this.xPos < width && this.xPos > 0){
      this.xPos += (random(3)*mask);
    }
   }

}

function modeSet(){

}

function clickstop() {
  move = false;
}

function clickmove(){
  move = true;
}

function clickchange() {
  playing_bgm.stop();
  if(flag === 1){
    playing_bgm = main_bgm2;
    flag = 2;
  }else if(flag === 2) {
    playing_bgm = main_bgm3;
    flag = 3;
  }else if(flag === 3) {
    playing_bgm = main_bgm;
    flag = 1;
  }
  playing_bgm.loop();

}