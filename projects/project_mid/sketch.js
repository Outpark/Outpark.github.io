var accessKey = "e9232280b82d4ac2888c9a4596f9bf09";
var endPoint = "https://eastus2.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment";

var voice;
var speaker;
var index = 0;
var sentiment;
var recorded = "";
var volHistroy = [];
let amp; let mic;
var ready = "no";
var processing = false;

let myFont;

let keywords = [];
let anger = ['angry','hate','anger','stress'];
let sadness = ['sad', 'gloomy', 'melancholy', 'cry', 'tear','worst'];
let happiness = ['happy','joy','sunny','glad','good','best'];
let curse = ['fuc','retard','kill you'];

// for fireworks
var particleList = [];
let firelocs = [[104,84],[259,160],[419,76],[631,170],[715,68],[923,61]];
let timer = 140;
let fIndex = 0;
let fireworksSound;
// for rain
let drops = [];
let rainSound;
// for angers
let angerList = [];
let noiseSound;
// for interactive elements for general vibe
var ecount = 2;
var offsetAngle = 0
var elements = [];
var elmColors = ['#FE64A3','#F6839C','#7FD1B9','#F5E0B7','#FFC9B5','#FE5F55','#BCD39C','#F0B67F','#C7EFCF','#EEF5DB'];
let flower = {};
let overLeft = false;
let overRight = false;
let selectedVibe;
var yoff = 0.0;        // 2nd dimension of perlin noise
var offLevel = 0.01;

var colorsky;
var bgColors = [204, 215, 228];

function preload() {
	myFont = loadFont('./static/ArchitectsDaughter-Regular.ttf');
	rainSound = loadSound('./static/rain.mp3');
	fireworksSound = loadSound('./static/fireworks.mp3');
	noiseSound = loadSound('./static/noise.mp3');
}

function setup() {
  createCanvas(1000,600);
  colorsky = new COLORSKY();
  // create our voice object
  speaker = new p5.Speech();
  voice = new p5.SpeechRec();
  mic = new p5.AudioIn();
  voice.continuous = true;
  // voice.interimResults = true;
  voice.onResult = parseResult;
  voice.start();

  mic.start();
  // amp = new p5.Amplitude();
  for (var i=0;i<200;i++) {
    drops[i] = new Drop();
  }
  for(var j=0;j<50;j++){
  	angerList[j] = new Anger();
  }

  flower = new Flower();
  flower.setup();
}

function draw() {
	textFont(myFont);
	console.log("X:"+mouseX);
		console.log("Y:"+mouseY);
	if(ready === "no"){
		preRecord();
		// vitalize();
	}else if(ready === "getting"){
		gettingReady();
	}else{
		vitalize();
		detectMouse();
		
	}
}

function preRecord(){
	background(10,10,10);
	textSize(32);
	fill(255);
	text("Can you tell me your story?", (width/2) - 150,(height/2));
	text("SKIP", (width/2),(height/2) + 200);
}
function mouseClicked() {
	if(mouseX >= 500 && mouseX <= 565)
		if(mouseY < 500 && mouseY > 480){
			ready = true;
			voice.resultString = "happy happy";
		}
}
function gettingReady(){
	background(10,10,10, 10);
	text("Processing. . .", (width/2) - 150,height/2);
}
// the core visualization logic
// mainly depends on the sentiment score and the feelings dictionary
function vitalize(){
	background(bgColors,90);

	textSize(32);
	let speech = voice.resultString.toLowerCase();

	if(sentiment >= 50){
		selectedVibe = new generalVibe();
		happiness.forEach((word) => {
			if(speech.includes(word))
				selectedVibe = new happyVibe();
		});
	}else{
		selectedVibe = new badVibe();
		sadness.forEach((word) => {
			if(speech.includes(word))
				selectedVibe = new sadVibe();
		});
		anger.forEach((word) => {
			if(speech.includes(word))
				selectedVibe = new angryVibe();
		});
	}
	// selectedVibe = new generalVibe();
	Landscape()
	flower.display();
	if(selectedVibe instanceof sadVibe){
		makitRain();
		if(!rainSound.isPlaying())
			rainSound.loop();
		fireworksSound.stop();
		noiseSound.stop();
		bgColors = [130,138,149];
		offLevel = 0.005;
	}else if(selectedVibe instanceof happyVibe){
		fireworks();
		if(!fireworksSound.isPlaying())
			fireworksSound.loop();
		rainSound.stop();
		noiseSound.stop();
		offLevel = 0.02;
		bgColors = [255,133,82];
	}else if(selectedVibe instanceof angryVibe){
		offLevel = 0.2;
		showAngers();
		rainSound.stop();
		fireworksSound.stop();
		bgColors = [250, 162, 117];
		if(!noiseSound.isPlaying())
			noiseSound.loop();
	}else if(selectedVibe instanceof badVibe){
		bgColors = [colorsky.colors[0],colorsky.colors[1],colorsky.colors[2]];
		colorsky.setting();
		offLevel = 0.02;
		fireworksSound.stop();
		noiseSound.stop();
		rainSound.stop();
		fireworksSound.stop();
	}else if(selectedVibe instanceof generalVibe){
		bgColors = [198, 226, 233];
		fireworksSound.stop();
		noiseSound.stop();
		rainSound.stop();
		fireworksSound.stop();
		offLevel = 0.01;
		offsetAngle += 0.05;
		generateElements();
		showElememts();
	}
}

function makitRain(){
	for (var i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show();
  }
}

function fireworks() {
	// crack fireworks at given locations
	if(timer === 140){
		fIndex = Math.floor(random(0,6));
	}
	var tempParticle = new Particle(firelocs[fIndex][0], firelocs[fIndex][1], Math.floor(random(0,10)));
  particleList.push( tempParticle );

  for (var i = 0; i < particleList.length; i++) {
    particleList[i].moveAndDisplay();

    if (particleList[i].isOffScreen() == true || particleList.length > 50) {
      particleList.splice(i, 1);
    }
  }
  if(timer > 0)
  	timer--;
  else{
  	timer = 140;
  }
}

function Particle(x, y, c) {
  this.x = x;
  this.y = y;
  
  this.colors = ['#73E1D1','#FFFFFF','#FFC1CF','#DEC5E3','#E56399','#C29CBE','#E5A3B9','#FBC6B7','#FDFBB7','#C3E1E6'];

  if (random(0,100) > 50) {
    this.type = 0;
  }
  else {
    this.type = 1;
  }
  
  // randomize speed
  this.speedX = random(-1, 1);
  this.speedY = random(-1, 1);
  
  // randomize our color
  this.r = random(30, 255);
  this.g = random(30, 255);
  this.b = random(30, 255);
  
  // randomize our rotation
  this.rotation = random(0, 360);
  
  // move and display function
  this.moveAndDisplay = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // draw this particle
    push();
    translate(this.x, this.y);
    rotate(radians(this.rotation));
    
    fill(this.colors[c]);
    noStroke();
    
    if (this.type == 0) {
      ellipse(-25, 0, 10, 10);
      ellipse(25, 0, 10, 10);
    }
    else {
      rect(-25, 0, 3, 10);
      rect(25, 0, 3, 10);
    }
    
    pop();
    
    this.rotation += 1;
  }
  
  // see if we are off screen
  this.isOffScreen = function() {
    if (this.x > width || this.x < 0 || this.y > height || this.y < 0) {
      return true;
    }
    return false;
  }
}

function showAngers() {
	angerList.forEach((ang)=>{
		ang.display();
	})
}

function Anger() {
	// inspiration https://codepen.io/renatorena/pen/aBbXBy
	this.x = random(width);
	this.y = random(height);
	this.size = random(20,40);
	this.stroke = random(1,10);
	this.colors = [ "#220901", "#621708", "#941B0C", "#BC3908", "#F6AA1C"];
	this.timer = random(10,20);

	this.color = this.colors[round(random(4))];
	this.stColor = this.colors[round(random(4))];

	this.display = function() {
    strokeWeight(this.stroke);
    stroke(this.stColor);
    fill(this.color); //set fill color
    rect(this.x, this.y, this.size, this.size, 5);
    smooth();

    this.timer--;
    if(this.timer <= 0){
    	this.reset();
    }

	}

	this.reset = function() {
		this.x = random(width);
		this.y = random(height);
		this.size = random(20,40);
		this.stroke = random(1,10);
		this.timer = random(10,20);;
		this.color = this.colors[round(random(4))];
		this.stColor = this.colors[round(random(4))];
	}
}

function Landscape() {
	// this is p5.js perlin noise sample snippet
	fill(235,235,235);
  beginShape();

  var xoff = 0;       // Option #1: 2D Noise
  // var xoff = yoff; // Option #2: 1D Noise

  // Iterate over horizontal pixels
  for (var x = 0; x <= width; x += 10) {
    // Calculate a y value according to noise, map to

    // Option #1: 2D Noise
    var y = map(noise(xoff, yoff), 0, 1, 300,400);

    // Option #2: 1D Noise
    // var y = map(noise(xoff), 0, 1, 200,300);

    // Set the vertex
    vertex(x, y);
    // Increment x dimension for noise
    xoff += 0.05;
  }
  // increment y dimension for noise
  yoff += offLevel;
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

}

function Flower() {
	this.o = [width/2, height-50];
	this.h = 65;
	this.level = 5;
	this.branch = 3;
	this.s = 20;
	this.drawn = false;
	this.wind = 1.0;
	this.velocity = 0.5;

	this.lines = [];
	// assign randomly calculated values
	this.opacities = [];
	this.sizes = [];
	this.yLocs = [];

	this.setup = function() {
		// starting position recorded at each level
		let prevX = {1:[this.o[0]]};
		let prevY = {1:[this.o[1]]};
		// let prevY = [this.o[1],this.o[1],this.o[1]];
		let bCount = 1;
		for(let i=1;i<=this.level;i++){
			for(let b=1;b<=Math.pow(this.branch,i);b++){
				bCount++;
				this.opacities.push(random(60,200));
				this.sizes.push(random(15,25));
				this.yLocs.push(random(-15,15));
				let separation = this.s*(i/2) + random(-10,20);
				let xStart = prevX[i][Math.floor((b-1)/3)];
				// let yStart = this.o[1]-(this.h*i);
				let yStart = prevY[i][Math.floor((b-1)/3)];
				let xEnd;
				let yEnd;

				// controll separation of each branch from left to right
				if((b-1)%3 === 0){
					// first left branch
					separation *= -1;
					// xStart -= this.s*i;
					yStart -= random(-15,15);
				}else if((b-1)%3 === 1){
					// middle branch is taller than others
					separation = random(-5, 5);
					yStart -= random(1,30);
				}else if((b-1)%3 === 2){
					// last right branch
					separation *= 1;
					// xStart += this.s*i;
					yStart -= random(1,15);
				}
				// end position for each line
				xEnd = xStart + separation;
				yEnd = yStart - this.h;

				// debugger;
				this.lines.push([xStart, yStart, xEnd, yEnd]);
				if(b===1){
					prevX[i+1] = [];
					prevY[i+1] = [];
				}
					prevX[i+1].push(xEnd);
					prevY[i+1].push(yEnd);
			}
		}
	}

	this.display = function() {
		if(this.wind <= -30){
			this.velocity = 0.5;
		}else if(this.wind >= 30){
			this.velocity = -0.5;
		}

		if(overRight && this.wind >= -30){
			this.wind -= 0.4;
		}
		else if(overLeft && this.wind <= 30){
			this.wind += 0.4;
		}else{
			this.wind += this.velocity;
		}


		let count = 0;
		let level = 0;
		let down = 0;
		let colorIndex = 0;
		this.lines.forEach((data) => {

			count++;
			level = Math.cbrt(count);

			if(count % 3 === 0 || count % 3 === 1){
				strokeWeight(0.1);
			}else{
				strokeWeight(0.2);
			}

			down = map(level-1, 1, 5, 0.1, 1.0);
			level = map(level, 1, 5, 0.1, 1.0);

			noStroke();
				let c = selectedVibe.colors[(colorIndex++)%5];
				fill(c[0],c[1],c[2], this.opacities[count-1]);
				ellipse(data[2]+this.wind*level,data[3] + this.yLocs[count-1],this.sizes[count-1],this.sizes[count-1]);
			stroke(40,40,40);
				line(data[0]+this.wind*down,data[1],data[2]+this.wind*level,data[3]);

		})
	}
}

function detectMouse() {
	// to give some interaction with the flower

	// left area of the flower
	if(mouseY <= 300 && mouseY >= 165) {
		if(mouseX >= 350 && mouseX <= 500){
			overLeft = true;
			overRight = false;
		}else if(mouseX > 500 && mouseX <= 650){ // right area of the flower
			overLeft = false;
			overRight = true;
		}else{
			overLeft = false;
			overRight = false;
		}
	}else{
			overLeft = false;
			overRight = false;
	}

}
// elements system credit to https://codepen.io/valhead/pen/NABYow
function showElememts() {
	elements.forEach((elm)=> {
		elm.display();
		elm.update();
	});
	while(elements.length > 100) elements.shift();
}
function generateElements() {
 for(var i=0; i<ecount;i++) {
   var p = new Element(mouseX, mouseY);
   
   var angle = PI + random(-PI,PI);
   var speed = random(4,8);
   
   p.velX = sin(angle)*speed;
   p.velY = cos(angle)*speed;
   
   p.size = random(8,18);
   
   elements.push(p);
 }
}

function Element(x,y) {
	this.posX = x; 
	this.posY = y; 
	this.velX = 0; 
	this.velY = 0; 
	this.shrink = .95; 
	this.size = 1; 	
	this.drag = 0.9; 
	this.gravity = 0.2; 
  this.color = round(random(0,9));

  this.update = function() {
     this.velX *= this.drag; 
     this.velY *= this.drag;

     this.velY += this.gravity; 

     this.posX += this.velX;
     this.posY += this.velY; 

     this.size *= this.shrink;
     // this.alpha -= this.fade;
    };

    this.display = function() {
      fill(elmColors[this.color]);
      ellipse(this.posX, this.posY, this.size);
	};
}

function generalVibe() {
	this.colors = [[235,235,235],[247,247,200],[178,247,239],[204,217,255],[232,197,237]];
}

function happyVibe(){
	this.colors = [[183,230,87],[248,252,185],[250,203,157],[255,169,169],[209,185,204]];
}

function sadVibe(){
	this.colors = [[135,137,192],[69,75,239],[194,196,232],[126,128,181],[17,18,73]];
}

function angryVibe() {
	this.colors = [[0,20,8],[56,56,56],[228,69, 13],[255, 76, 58],[244,255,293]];
}

function badVibe() {
	this.colors = [[13,19,33],[29,45,68],[62,92,118],[147,163,177],[247,247,242]];
}

function parseResult() {
  background(255);

  text(voice.resultString, 25, 25);
  ready = "getting";
  fetchSentiment(voice.resultString);
  console.log(voice.resultString);

}

function COLORSKY(){
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


function fetchSentiment(recorded) {
	console.log(recorded);
	recorded = recorded.replace(/['"]+/g, '')
	  $.ajax({
        url: "https://eastus2.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment",
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",accessKey);
        },
        type: "POST",
        // Request body
        data: "{ 'documents':[{'language':'en','id': '1','text':'"+recorded+"'}]}"
    })
    .done(function(data) {
       sentiment = map(data.documents[0].score,0,1,0,100);
       console.log(sentiment);
       ready = true;
    })
    .fail(function(err) {
        console.log(err);
    });

  $.ajax({
      url: "https://eastus2.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",accessKey);
      },
      type: "POST",
      // Request body
      data: "{ 'documents':[{'language':'en','id': '1','text':'"+recorded+"'}]}"
  })
  .done(function(data) {
      // console.log(data);
      keywords = data.documents[0].keyPhrases;
      console.log(keywords);
  })
  .fail(function() {
      alert("error");
  });
}
