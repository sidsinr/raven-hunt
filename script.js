const start = document.getElementById("start");
const tryAgain = document.getElementById("tryAgain");
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
const clouds = new Image();
clouds.src = "layer-3.png";

let ravens = [];
let explosions = [];
let timeToNextRaven = 0;
let ravenInterval = 500; // 500ms
let lastTime = 0;  // timestamp from the previous loop
let score = 0;
let gameOver = false;

ctx.font = "50px Impact";

class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.4 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        this.color = "rgb("+this.randomColors[0] + ","+ this.randomColors[1]+ "," + this.randomColors[2] + ")";
    }
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
        }
        if(this.x < 0 - this.width) gameOver = true;
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = "boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.sound = new Audio();
        this.sound.src = "boom.wav";
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
    }
    update(deltaTime){
        if(this.frame == 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size);
    }
}

function drawScore(){
    ctx.textAlign = "left";
    ctx.fillStyle = "brown";
    ctx.fillText("Score: " + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 53, 78);
}

function drawGameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "black"; 
    ctx.fillText("GAME OVER!", canvas.width*0.5, canvas.height*0.5 - 50);
    ctx.fillText("Your Score: "+score, canvas.width * 0.5, canvas.height * 0.5 + 50);
    ctx.fillStyle = "white"; 
    ctx.fillText("GAME OVER!", canvas.width*0.5+3, canvas.height*0.5 - 47);
    ctx.fillText("Your Score: " + score, canvas.width * 0.5 + 3, canvas.height * 0.5 + 53);
    tryAgain.style.display = "block";
}

canvas.addEventListener("click", (e)=>{
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if(object.randomColors[0] == pc[0] && object.randomColors[1] == pc[1] && object.randomColors[2] == pc[2]){
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });
});

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(clouds , 0, 100);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
    }
    drawScore();
    [...ravens, ...explosions].forEach(object => {
        object.update(deltaTime);
        object.draw();
    });
    
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => object.frame < 5);

    if(!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

start.addEventListener("click", ()=>{
    start.style.display = "none";
    animate(0);
});

tryAgain.addEventListener("click", ()=>{
    ravens = [];
    explosions = [];
    gameOver = false;
    timeToNextRaven = 0;
    lastTime = 0;
    score = 0;
    tryAgain.style.display = "none";
    animate(0);
});