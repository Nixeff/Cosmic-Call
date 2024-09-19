"use strict";
// context skit
let canvas;
let context;
let canvasWidth = 960;
let canvasHeight = 560;

// För mus hittning
let xm = 0;
let ym = 0;
let isDrawing = false;

// Död eller levande
let safe = false;
let safeCheck = false;
let alive = true;
let alerted = false;
let respawnTimer = 0;

//Grab
let grabbing = false;

// Ljud
let mute = false;

//Fan
let fanRange = 3;

// Level
let next = true;
let level = 0;

let kortIntro = false;

// Grid
let grid_w = 80;
let grid_h = 80;
let grid_l = 12;
let grid_lh = 7;

let tiles = [];

class grid{
    constructor(x,y,width,height,gridx,gridy){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gridx = gridx;
        this.gridy = gridy;
        this.wind_facing = 0;
        this.wind = false;
        this.danger = false;
        this.block = false;
        this.fan = false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        
    }

    draw(){
        if(this.danger && !this.fan){
            if(this.currentFrame == 0){
                context.drawImage(wineRunFrames[0],this.x+5,this.y+5,this.width,this.height);
            }
            if(this.currentFrame == 1){
                context.drawImage(wineRunFrames[1],this.x+5,this.y+5,this.width,this.height);
            }
            if(this.currentFrame == 2){
                context.drawImage(wineRunFrames[2],this.x+5,this.y+5,this.width,this.height);
            }
            if(this.frameTimer == 25){
                this.frameTimer = 0;
                if(this.currentFrame == 2){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.fan && this.wind_facing == 0){
            context.drawImage(floorImg,this.x,this.y,this.width,this.height);
        }
        if(this.fan && this.wind_facing == 2){
            flipVerticly(floorImg,this.x,this.y,this.width);
        }
        if(!this.fan && !this.danger){
            context.drawImage(floorImg,this.x,this.y);
        }
    }
}

// Skapar griden
function createGrid() {
    for (let l = 0; l < grid_lh; l++) {
        for (let i = 0; i < grid_l; i++) {
            let tile = new grid((i)*grid_w ,(l)*grid_h ,grid_w ,grid_h ,i ,l);
            tiles.push(tile);
        }
    }
}

// Flippar bilder
function flipVerticly(img,x,y,height){
    // move to x + img's width
    context.translate(x,y+height);

    // scaleX by -1; this "trick" flips Verticly
    context.scale(1,-1);
    
    // draw the img
    // no need for x,y since we've already translated
    context.drawImage(img,0,0);
    
    // always clean up -- reset transformations to default
    context.setTransform(1,0,0,1,0,0);
}

function flipHorizontally(img,x,y,width,height){
    // move to x + img's width
    context.translate(x+width,y);

    // scaleX by -1; this "trick" flips Horizontally
    context.scale(-1,1);
    
    // draw the img
    // no need for x,y since we've already translated
    context.drawImage(img,0,0,width,height);
    
    // always clean up -- reset transformations to default
    context.setTransform(1,0,0,1,0,0);
}

//Bilder
let spelare_img = new Image;
spelare_img.src = "bilder/spelare/springer/nyaom.png";
let floorImg = new Image;
floorImg.src = "bilder/wine/floor.png";
let dangerImg = new Image;
dangerImg.src = "bilder/wine/golv-farlig.png";
let wallImg = new Image;
wallImg.src = "bilder/wine/vägg-deafult.png";
let overlayImg = new Image;
overlayImg.src = "bilder/ljus_overlay1.png";
let barrelImg = new Image;
barrelImg.src = "bilder/wine/tunna2.png";
let highlightImg = new Image;
highlightImg.src = "bilder/highlight2.png";
let shadeImg = new Image;
shadeImg.src = "bilder/shades/skugga1.png";
let shadePlankImg = new Image;
shadePlankImg.src = "bilder/shades/skugga2.png";
let pedistalImg = new Image;
pedistalImg.src = "bilder/wine/pedistal.png";
let playImg = new Image;
playImg.src = "bilder/menu/MenyPlay2.png";
let plankaImg = new Image;
plankaImg.src = "bilder/wine/planka.png";
let dialogImg = new Image;
dialogImg.src = "bilder/dialogruta.png";

// Vin animationer
let wineRunFrames = [
    new Image,
    new Image,
    new Image
]
wineRunFrames[0].src = "bilder/wine/golv-farlig-1.png";
wineRunFrames[1].src = "bilder/wine/golv-farlig-2.png";
wineRunFrames[2].src = "bilder/wine/golv-farlig-3.png";

//Fläkt animationer
let fanRunFrames = [
    new Image,
    new Image,
    new Image,
]
fanRunFrames[0].src = "bilder/wine/flakt-1.png";
fanRunFrames[1].src = "bilder/wine/flakt-2.png";
fanRunFrames[2].src = "bilder/wine/flakt-3.png";

// Spelar animationer
let playerRunFrames = [
    new Image,
    new Image,
    new Image
];
let playerRunUpFrames = [
    new Image,
    new Image,
    new Image,
    new Image
]
let playerRunDownFrames = [
    new Image,
    new Image,
    new Image,
    new Image
]
let playerDeathFrames = [
    new Image,
    new Image,
    new Image,
    new Image,
    new Image,
    new Image,
    new Image
]
let playerAirbornFrames = [
    new Image,
    new Image
]
let playerDedImg = new Image;

playerDedImg.src = "bilder/spelare/ded.png";

playerRunFrames[0].src = "bilder/spelare/springer/vertikalt/run-f-1.png";
playerRunFrames[1].src = "bilder/spelare/springer/vertikalt/run-f-2.png";
playerRunFrames[2].src = "bilder/spelare/springer/vertikalt/run-f-3.png";

playerRunUpFrames[0].src = "bilder/spelare/springer/up/running-up-1.png";
playerRunUpFrames[1].src = "bilder/spelare/springer/up/running-up-2.png";
playerRunUpFrames[2].src = "bilder/spelare/springer/up/running-up-3.png";
playerRunUpFrames[3].src = "bilder/spelare/springer/up/running-up-4.png";

playerRunDownFrames[0].src = "bilder/spelare/springer/down/running-down-1.png";
playerRunDownFrames[1].src = "bilder/spelare/springer/down/running-down-2.png";
playerRunDownFrames[2].src = "bilder/spelare/springer/down/running-down-3.png";

playerDeathFrames[0].src = "bilder/spelare/teleport/tp-1.png";
playerDeathFrames[1].src = "bilder/spelare/teleport/tp-2.png";
playerDeathFrames[2].src = "bilder/spelare/teleport/tp-3.png";
playerDeathFrames[3].src = "bilder/spelare/teleport/tp-4.png";
playerDeathFrames[4].src = "bilder/spelare/teleport/tp-5.png";
playerDeathFrames[5].src = "bilder/spelare/teleport/tp-6.png";
playerDeathFrames[6].src = "bilder/spelare/teleport/tp-7.png";

playerAirbornFrames[0].src = "bilder/spelare/airborn/airb-1.png";
playerAirbornFrames[1].src = "bilder/spelare/airborn/airb-2.png";

// audio
let stoneSound  = new sound("audio/Random_8_1.wav");
let walkSound = new sound("audio/Ga_ljud.wav");
let deathSound = new sound("audio/Teleport__1.wav");
// Source "https://youtu.be/6PB8xldyhxs"
let backSound = new sound("audio/Future Rennaisance - Godmode.mp3");

// Initiatar skit
function init(){
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    createGrid();
    window.requestAnimationFrame(gameloop);
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

// Klickar du på mus knappen??????
document.getElementById('canvas').addEventListener('mousedown', e => {
    isDrawing = true;
});
document.getElementById('canvas').addEventListener('mouseup', e => {
    isDrawing = false;
});

// Vart tog musen vägen?
function possition(event){
    xm = event.offsetX;
    ym = event.offsetY;
}

// Object class
class obj{
    constructor(x,y,width,height,type,facing){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.facing = facing;
        this.grab = false;
        this.gridx = 0;
        this.gridy = 0;
        this.iPos = 0;
        this.oldIPos = 0;
        this.frameTimer = 0;
        this.currentFrame = 0;
    }
    // Måla obj
    draw(){
        if(this.type==0){
            context.drawImage(plankaImg,this.x,this.y);
            if(this.grab){
                context.drawImage(shadePlankImg,this.x+15,this.y+20,220,80);
            }
        }
        if(this.type == 2){
            if(this.currentFrame == 0){
                context.drawImage(fanRunFrames[2],this.x,this.y,this.width,this.height);
            }
            if(this.currentFrame == 1){
                context.drawImage(fanRunFrames[1],this.x,this.y,this.width,this.height);
            }
            if(this.currentFrame == 2){
                context.drawImage(fanRunFrames[0],this.x,this.y,this.width,this.height);
            }
            if(this.frameTimer == 2){
                this.frameTimer = 0;
                if(this.currentFrame == 2){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.type == 3){
            if(this.grab){
                context.drawImage(shadeImg,this.x+15,this.y+50,50,50);
            }
            context.drawImage(barrelImg,this.x,this.y,this.width,this.height);

        }
        if(this.type == 4){
            context.drawImage(pedistalImg,this.x,this.y);
        }
    }
    // Skapar döds zoner
    createDanger(){
        if(this.type == 1){
            for (let i = 0; i < tiles.length; i++) {
                if((this.y + this.height >= tiles[i].y+tiles[i].height/2 && this.y <= tiles[i].y + tiles[i].height/2) &&
                (this.x+this.width >= tiles[i].x + tiles[i].width/2 && this.x <= tiles[i].x+tiles[i].width/2 ) ){
                    tiles[i].danger = true;
                }
            }
        }
    }
    update(){

        // Platform
        if(this.type == -1){
            tiles[this.iPos].danger = false;
        }

        // Bro
        if(this.type == 0){
            if(!safeCheck){
                if(this.facing == 1 || this.facing == 3){
                    if(!this.grab && spelare.gridx <= this.gridx+1 && spelare.gridx >= this.gridx-1 &&  spelare.gridy == this.gridy ){
                        safe = true;
                        safeCheck = true;
                    } else{
                        safe = false;
                    }
                }
                if(this.facing == 0 || this.facing == 2){
                    if(spelare.gridx == this.gridx && spelare.gridy >= this.gridy-1 && spelare.gridy <= this.gridy+1){
                        safe = true;
                        safeCheck = true;
                    } else{
                        safe = false;
                    }
                }
            }
            if(!grabbing && isDrawing && xm >= this.x && xm <= this.x + this.width && ym >= this.y && ym <= this.y + this.height){
                if(!this.grab){
                    grabbing = true;
                }
                this.grab = true;

            }
            if(!isDrawing && this.grab){
                this.grab = false;
                grabbing = false;
                stoneSound.play();
            }
            if(this.grab){
                this.x = xm-(this.width/2);
                this.y = ym-(this.height/2);
            }
        }
        //danger
        if(this.type == 1){

        }
        //Vind
        if(this.type == 2){
            tiles[this.iPos].fan = true;
            if(this.facing == 0){
                tiles[this.iPos].wind = false;
                tiles[this.iPos+12].wind = false;
                tiles[this.iPos+24].wind = false;
                tiles[this.iPos+36].wind = false;
                if(!tiles[this.iPos+12].block){
                    tiles[this.iPos+12].wind = true;
                    tiles[this.iPos+12].wind_facing = this.facing;
                    if(!tiles[this.iPos+24].block){
                        tiles[this.iPos+24].wind = true;
                        tiles[this.iPos+24].wind_facing = this.facing;
                        if(!tiles[this.iPos+36].block){
                            tiles[this.iPos+36].wind = true;
                            tiles[this.iPos+36].wind_facing = this.facing;
                        }
                    }
                }
            }
            if(this.facing == 1){
                if(!tiles[this.iPos].block){
                    tiles[this.iPos].wind = true;
                    tiles[this.iPos].wind_facing = this.facing;
                    if(!tiles[this.iPos+1].block){
                        tiles[this.iPos+1].wind = true;
                        tiles[this.iPos+1].wind_facing = this.facing;
                        if(!tiles[this.iPos+2].block){
                            tiles[this.iPos+2].wind = true;
                            tiles[this.iPos+2].wind_facing = this.facing;
                        }
                    }
                }
            }
            if(this.facing == 2){
                tiles[this.iPos].wind = false;
                tiles[this.iPos-12].wind = false;
                tiles[this.iPos-24].wind = false;
                if(!tiles[this.iPos-36].wind_facing==0){
                    tiles[this.iPos-36].wind = false;
                }
                
                if(!tiles[this.iPos].block){
                    tiles[this.iPos].wind = true;
                    tiles[this.iPos].wind_facing = this.facing;
                    if(!tiles[this.iPos-12].block){
                        tiles[this.iPos-12].wind = true;
                        tiles[this.iPos-12].wind_facing = this.facing;
                        if(!tiles[this.iPos-24].block){
                            tiles[this.iPos-24].wind = true;
                            tiles[this.iPos-24].wind_facing = this.facing;
                            if(!tiles[this.iPos-36].block){
                                tiles[this.iPos-36].wind = true;
                                tiles[this.iPos-36].wind_facing = this.facing;
                            }
                        }
                    }
                }
            }
            if(this.facing == 3){
                if(!tiles[this.iPos].block){
                    tiles[this.iPos].wind = true;
                    tiles[this.iPos].wind_facing = this.facing;
                    if(!tiles[this.iPos-1].block){
                        tiles[this.iPos-1].wind = true;
                        tiles[this.iPos-1].wind_facing = this.facing;
                        if(!tiles[this.iPos-2].block){
                            tiles[this.iPos-2].wind = true;
                            tiles[this.iPos-2].wind_facing = this.facing;
                        }
                    }
                }
            }
        }
        // Sten
        if(this.type == 3){
            if(!grabbing && isDrawing && xm >= this.x && xm <= this.x + this.width && ym >= this.y && ym <= this.y + this.height){
                if(!this.grab){
                    tiles[this.iPos].block = false;
                    this.oldIPos = this.iPos;
                    grabbing = true
                }
                this.grab = true;
            }
            if(!isDrawing && this.grab){
                this.grab = false;
                grabbing = false;
                stoneSound.play();
                if(tiles[this.iPos].danger){
                    console.log(this.x);
                    this.x = tiles[this.oldIPos].x;
                    this.y = tiles[this.oldIPos].y;
                    this.iPos = this.oldIPos;
                    stoneSound.play();
                }
                
        }
            if(this.grab){
                this.x = xm-(this.width/2);
                this.y = ym-(this.height/2);
            }
        }

        // Sätt till grid
        if(!this.grab){
            if(this.facing == 1 || this.facing == 3){
                if(this.type == 0){
                    this.x = tiles[this.iPos].x - grid_w;
                    this.y = tiles[this.iPos].y;
                }
                if(this.type == 3){
                    this.x = tiles[this.iPos].x;
                    this.y = tiles[this.iPos].y;
                    tiles[this.oldIPos].block = false;
                    tiles[this.iPos].block = true;
                }
            }
            if(this.facing == 0 || this.facing == 2){
                if(this.type == 0){
                    this.x = tiles[this.iPos].x;
                    this.y = tiles[this.iPos].y-grid_h;
                }
                if(this.type == 3){
                    this.x = tiles[this.iPos].x;
                    this.y = tiles[this.iPos].y;
                    tiles[this.oldIPos].block = false;
                    tiles[this.iPos].block = true;
                    
                }
            }
        }
    }
}


// Spelare
class player{
    constructor(x,y,gridx,gridy,height,width,speed){
        this.x = x;
        this.y = y;
        this.gridx = gridx;
        this.gridy = gridy;
        this.height = height;
        this.width = width;
        this.speed = speed;
        this.airborn = false;
        this.wasAirborn = false;
        this.iPos = 0;
        this.facing = 1;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.collided = false;
        this.prone = false;
    }
    // Måla spelare
    draw() {
        if(this.facing == 1 && !this.airborn && !this.prone){
            if(this.currentFrame == 0){
                flipHorizontally(playerRunFrames[0],this.x,this.y,this.width,this.height);
            }
            if(this.currentFrame == 1){
                flipHorizontally(playerRunFrames[1],this.x,this.y,this.width,this.height);
            }
            if(this.currentFrame == 2){
                flipHorizontally(playerRunFrames[2],this.x,this.y,this.width,this.height);
            }
            if(this.currentFrame == 3){
                flipHorizontally(playerRunFrames[1],this.x,this.y,this.width,this.height);
            }
            if(this.frameTimer == 10){
                this.frameTimer = 0;
                if(this.currentFrame == 3){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
            
        }
        if(this.facing == 3 && !this.airborn && !this.prone){
            if(this.currentFrame == 0){
                context.drawImage(playerRunFrames[0],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 1){
                context.drawImage(playerRunFrames[1],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 2){
                context.drawImage(playerRunFrames[2],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 3){
                context.drawImage(playerRunFrames[3],this.x,this.y,this.height,this.width);
            }
            if(this.frameTimer == 10){
                this.frameTimer = 0;
                if(this.currentFrame == 2){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.facing == 2 && !this.airborn && !this.prone){
            if(this.currentFrame == 0){
                context.drawImage(playerRunUpFrames[0],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 1){
                context.drawImage(playerRunUpFrames[1],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 2){
                context.drawImage(playerRunUpFrames[2],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 3){
                context.drawImage(playerRunUpFrames[3],this.x,this.y,this.height,this.width);
            }
            if(this.frameTimer == 10){
                this.frameTimer = 0;
                if(this.currentFrame == 3){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.facing == 0 && !this.airborn && !this.prone){
            if(this.currentFrame == 0){
                context.drawImage(playerRunDownFrames[0],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 1){
                context.drawImage(playerRunDownFrames[1],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 2){
                context.drawImage(playerRunDownFrames[2],this.x,this.y,this.height,this.width);
            }
            if(this.frameTimer == 10){
                this.frameTimer = 0;
                if(this.currentFrame == 2){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.airborn && !this.prone){
            if(this.currentFrame == 0){
                context.drawImage(playerAirbornFrames[0],this.x,this.y,this.height,this.width);
            }
            if(this.currentFrame == 1){
                context.drawImage(playerAirbornFrames[1],this.x,this.y,this.height,this.width);
            }
            if(this.frameTimer == 2){
                this.frameTimer = 0;
                if(this.currentFrame >= 1){
                    this.currentFrame = 0;
                } else{
                    this.currentFrame ++;
                }
            } else{
                this.frameTimer ++;
            }
        }
        if(this.prone){
            flipHorizontally(playerDedImg,this.x,this.y,this.width,this.height);
        }
        
        
    }
    death(){
        context.clearRect(0,0,1920,1080);
        backSound.stop();
        deathSound.play();
       
        if(this.facing == 3 || this.facing == 2){
                if(this.currentFrame == 0){
                    context.drawImage(playerDeathFrames[0],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 1){
                    context.drawImage(playerDeathFrames[1],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 2){
                    context.drawImage(playerDeathFrames[2],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 3){
                    context.drawImage(playerDeathFrames[3],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 4){
                    context.drawImage(playerDeathFrames[4],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 5){
                    context.drawImage(playerDeathFrames[5],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.currentFrame == 6){
                    context.drawImage(playerDeathFrames[6],this.x,this.y-this.height,this.height,this.width+100);
                }
                if(this.frameTimer == 10){
                    this.currentFrame ++;
                    this.frameTimer = 0;
                } else{
                    this.frameTimer ++;
                }
            if(this.currentFrame == 7){
                this.currentFrame = 0;
                spelare.x = 0;
                spelare.y = 240;
                spelare.facing = 1;
                alive = true;
            }
        }
        if(this.facing == 1 || this.facing == 0){
            if(this.currentFrame == 0){
                flipHorizontally(playerDeathFrames[0],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 1){
                flipHorizontally(playerDeathFrames[1],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 2){
                flipHorizontally(playerDeathFrames[2],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 3){
                flipHorizontally(playerDeathFrames[3],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 4){
                flipHorizontally(playerDeathFrames[4],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 5){
                flipHorizontally(playerDeathFrames[5],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.currentFrame == 6){
                flipHorizontally(playerDeathFrames[6],this.x,this.y-this.height,this.height,this.width+100);
            }
            if(this.frameTimer == 10){
                this.currentFrame ++;
                this.frameTimer = 0;
            } else{
                this.frameTimer ++;
            }
        if(this.currentFrame == 7){
            this.currentFrame = 0;
            backSound.play();
            spelare.x = 0;
            spelare.y = 240;
            spelare.facing = 1;
            alive = true;
        }
    }

    }
    //Rör på dig
    move() {
        if(!this.wasAirborn){
            if(this.facing == 0){
                this.y += this.speed;
            }
            if(this.facing == 1){
                this.x += this.speed;
            }
            if(this.facing == 2){
                this.y -= this.speed;
            }
            if(this.facing == 3){
                this.x -= this.speed;
            }
                
        }
    }

    // "Kolliderings" koll
    collision(){
        console.log("hej");
            // VInd
            if(this.gridx == tiles[this.iPos].gridx && this.gridy == tiles[this.iPos].gridy && tiles[this.iPos].wind){
                if (tiles[this.iPos].wind_facing == 0){
                    this.y += 5;
                    this.airborn = true;
                }
                if (tiles[this.iPos].wind_facing == 1){
                    this.x += 5;
                    this.airborn = true;
                }
                if (tiles[this.iPos].wind_facing == 2){
                    this.y -= 5;
                    this.airborn = true;
                }
                if (tiles[this.iPos].wind_facing == 3){
                    this.x -= 5;
                    this.airborn = true;
                }
            }
            // DANGER
            if(tiles[this.iPos].danger == true && !safe){
                console.log("test");
                alive = false;
            }
            // Sten
            if(tiles[this.iPos].block == true){
                if(this.facing==3 && !this.collided){
                    this.x = tiles[this.iPos+1].x;;
                    this.facing = 0;
                    this.collided = true;
                }
                if(this.facing==2 && !this.collided){
                    this.y = tiles[this.iPos+12].y;
                    this.facing = 3;
                    this.collided = true;
                }
                if(this.facing==1 && !this.collided){
                    this.x = tiles[this.iPos-1].x;
                    this.facing = 2;
                    this.collided = true;
                }
                if(this.facing==0 && !this.collided){
                    this.y = tiles[this.iPos-12].y;
                    this.facing = 1;
                    this.collided = true;
                }
                this.collided = false;
            }
        if(this.airborn){
            this.wasAirborn = true;
        }
        if (!this.airborn && this.wasAirborn){
            this.y = tiles[this.iPos].y;
            this.airborn = false;
            this.wasAirborn = false;
        } else{
            this.airborn = false;
        }
        if(this.gridx == 11 && this.facing == 1){
            next = true;
            level++;
        }
    }
}

// Meny knappar
class menu{
    constructor(img,x,y,width,height,action){
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.action = action;
        this.originalWidth = width;
        this.originalHeight = height;
        this.hoverWidth = width+5;
        this.hoverHeight = height+5;
    }

    draw(){
        context.drawImage(this.img,this.x,this.y,this.width,this.height);
    }

    update(){
        if(isDrawing && xm > this.x && xm < this.x + this.width && ym > this.y && ym < this.y + this.height){
            if(this.action == 0){
                next = true;
                level = 1;
            }
        }
        if(xm > this.x && xm < this.x + this.width && ym > this.y && ym < this.y + this.height){
            this.width = this.hoverWidth;
            this.height = this.hoverHeight;
        } else{
            this.width = this.originalWidth;
            this.height = this.originalHeight;
        }
    }
}

// Byter nivå
function changeLevel(){
    if(level == 0){
        currentLevel = [];
        level0.forEach(element => {
            currentLevel.push(element);
        });
    }
    if(next){
        if(level == 1){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level1.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
        if(level == 2){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level2.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
        if(level == 3){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level3.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
        if(level == 4){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level4.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
        if(level == 5){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level5.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
        if(level == 8){
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].wind_facing = 0;
                tiles[i].wind = false;
                tiles[i].danger = false;
                tiles[i].fan = false;
                tiles[i].block = false;
            }
            safe = false;
            currentLevel = [];
            spelare.x = 0;
            spelare.y = 240;
            spelare.speed = 1.5;
            spelare.facing = 1;
            level8.forEach(element => {
                currentLevel.push(element);
            });
            for (let i = 0; i < currentLevel.length; i++) {
                currentLevel[i].createDanger();
            }
            next = false;
        }
    }
    if(level == 9){
        alert("Du gjorde det! Woho! Grattis!");
    }
}

// Startar om nivån
function resetLevel(){
    if(level == 1){
        currentLevel[0].x = 80;
        currentLevel[0].y = 80;
    }
    if(level == 2){
        tiles[currentLevel[9].iPos].block = false;
        currentLevel[9].x = 320;
        currentLevel[9].y = 160;
    }
    if(level == 8){
        tiles[currentLevel[11].iPos].block = false;
        currentLevel[11].x = 160;
        currentLevel[11].y = 80;
        currentLevel[12].x = 80;
        currentLevel[12].y = 240;
        currentLevel[13].x = 320;
        currentLevel[13].y = 240;
    }
    if(level == 3){
        tiles[currentLevel[15].iPos].block = false;
        currentLevel[15].x = 240;
        currentLevel[15].y = 160;
    }
    if(level == 4){
        tiles[currentLevel[15].iPos].block = false;
        currentLevel[15].x = 160;
        currentLevel[15].y = 240;
        currentLevel[16].x = 640;
        currentLevel[16].y = 320;
    }
    if(level == 5){
        tiles[currentLevel[8].iPos].block = false;
        currentLevel[8].x = 560;
        currentLevel[8].y = 240;
    }
}
let currentText = 0;
let currentTextCD = 0;
function intro(){
    context.clearRect(0,0,1920,1080);
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].draw();   
    }
    spelare.draw();
    context.drawImage(dialogImg,160,320,640,160);

    if(currentText == 0){
        context.fillStyle = "white";
        context.font = "bold 32px Determination";
        context.fillText("*ugh*", 320, 400);
    }
    if(currentText == 1){
        context.fillStyle = "white";
        context.font = "bold 32px Determination";
        context.fillText("Wh-where am I...?", 320, 400);
    }
    if(currentText == 2){
        context.fillStyle = "white";
        context.font = "bold 32px Determination";
        context.fillText("Looks like some sort of cellar.", 320, 400);
    }
    if(currentText == 3){
        context.fillStyle = "white";
        context.font = "bold 32px Determination";
        context.fillText("Better keep moving!", 320, 400);
    }
    if(currentTextCD == 120){
        currentTextCD = 0;
        currentText ++;
    } else{
        currentTextCD ++;
    }
    if(currentText == 3){
        spelare.prone = false;
    }
    if(currentText == 4){
        spelare.prone = false;
        kortIntro = true;
    }
    context.drawImage(overlayImg,0,0,canvas.width,canvas.height);
    
}


// Nivåer

let currentLevel = [];

let spelare = new player(400,240,1,1,80,80,0);

let level0 = [
    new menu(playImg,400,100,160,160,0),
]
let level1 = [
    new obj(80,80,240,80,0,1),
    new obj(480,0,80,1000,1,0)
]
let level2 = [
    new obj(160,0,160,240,1,0),
    new obj(320,0,480,160,1,0),
    new obj(400,0,240,240,1,0),
    new obj(160,320,320,240,1,0),
    new obj(480,400,320,160,1,0),
    new obj(560,320,160,240,1,0),
    new obj(320,0,80,80,2,0),
    new obj(640,0,80,80,2,0),
    new obj(480,480,80,80,2,2),
    new obj(320,160,80,80,3,0)
]
let level3 = [
    new obj(160,0,640,560,1,0),
    new obj(160,240,80,80,-1,0),
    new obj(240,240,80,80,-1,0),
    new obj(240,320,80,80,-1,0),
    new obj(320,320,80,80,-1,0),
    new obj(400,320,80,80,-1,0),
    new obj(480,320,80,80,-1,0),
    new obj(560,320,80,80,-1,0),
    new obj(640,320,80,80,-1,0),
    new obj(640,240,80,80,-1,0),
    new obj(640,160,80,80,-1,0),
    new obj(720,160,80,80,-1,0),
    new obj(240,160,80,80,-1,0),
    new obj(640,400,80,80,-1,0),
    new obj(480,240,80,80,-1,0),
    new obj(240,160,80,80,3,0),
    new obj(240,0,80,80,2,0),
    new obj(640,480,80,80,2,2),
    new obj(480,160,80,80,2,0),
]
let level4 = [
    new obj(80,0,800,560,1,0),
    new obj(80,240,80,80,-1,0),
    new obj(160,240,80,80,-1,0),
    new obj(160,160,80,80,-1,0),
    new obj(240,160,80,80,-1,0),
    new obj(320,160,80,80,-1,0),
    new obj(720,160,80,80,-1,0),
    new obj(800,160,80,80,-1,0),
    new obj(160,320,80,80,-1,0),
    new obj(240,320,80,80,-1,0),
    new obj(160,0,80,80,2,0),
    new obj(160,480,80,80,2,2),
    new obj(160,80,80,80,-1,0),
    new obj(160,400,80,80,-1,0),
    new obj(560,320,80,80,-1,0),
    new obj(160,240,80,80,3,0),
    new obj(640,320,240,80,0,1),

]
let level5 = [
    new obj(80,0,800,560,1,0),
    new obj(80,240,80,80,-1,0),
    new obj(160,240,80,80,-1,0),
    new obj(240,240,80,80,-1,0),
    new obj(320,240,80,80,-1,0),
    new obj(400,240,80,80,-1,0),
    new obj(480,240,80,80,-1,0),
    new obj(560,240,80,80,-1,0),
    new obj(560,240,80,80,3,0),
    new obj(480,160,80,80,-1,0),
    new obj(480,80,80,80,-1,0),
    new obj(400,160,80,80,-1,0),
    new obj(320,160,80,80,-1,0),
    new obj(240,160,80,80,-1,0),
    new obj(160,160,80,80,-1,0),
    new obj(320,320,80,80,-1,0),
    new obj(320,400,80,80,-1,0),
    new obj(400,320,80,80,-1,0),
    new obj(480,320,80,80,-1,0),
    new obj(560,320,80,80,-1,0),
    new obj(640,320,80,80,-1,0),
    new obj(720,320,80,80,-1,0),
    new obj(800,320,80,80,-1,0),
]
let level8 = [
    new obj(80,0,800,560,1,0),
    new obj(160,0,80,80,2,0),
    new obj(160,80,80,80,-1,0),
    new obj(320,480,80,80,2,2),
    new obj(320,400,80,80,-1,0),
    new obj(480,0,80,80,2,0),
    new obj(480,80,80,80,-1,0),
    new obj(640,480,80,80,2,2),
    new obj(640,400,80,80,-1,0),
    new obj(800,0,80,80,2,0),
    new obj(800,80,80,80,-1,0),
    new obj(160,80,80,80,3,0),
    new obj(80,240,240,80,0,1),
    new obj(320,240,240,80,0,1),
]
let wasDead = false;
let proned = false;
// LOOPLOOPLOOP
function gameloop(){
    if(kortIntro){
        if(alive && !wasDead){    
            update();
            draw();
        } 
        if(alive && wasDead){
            resetLevel();
            wasDead = false;
        }
        if(!alive){
                spelare.deaths = false;
                wasDead = true;
                spelare.death();
        }
    } else{
        if(!proned){
            spelare.prone = true;
            spelare.proned = true;
        }
        intro();
    }
    window.requestAnimationFrame(gameloop);
}

// Måla allt
function draw(){
    context.clearRect(0,0,1920,1080);
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].draw();   
    }
    
    for (let i = 0; i < currentLevel.length; i++) {
        currentLevel[i].draw();
    }
    
    if(spelare.gridx == tiles[spelare.iPos].gridx && spelare.gridy == tiles[spelare.iPos].gridy ){
        context.drawImage(highlightImg,tiles[spelare.iPos].x,tiles[spelare.iPos].y,tiles[spelare.iPos].width,tiles[spelare.iPos].height);
    }
    context.fillStyle = "#000000";
    spelare.draw();
    context.drawImage(overlayImg,0,0,canvas.width,canvas.height);
}
// Updatera skit
function update(){
    spelare.move();
    safeCheck = false;
    for (let i = 0; i < tiles.length; i++) {
        for (let l = 0; l < currentLevel.length; l++) {
            if((currentLevel[l].y+currentLevel[l].height/2 >= tiles[i].y && currentLevel[l].y+currentLevel[l].height/2 <= tiles[i].y + tiles[i].height) &&
            (currentLevel[l].x+currentLevel[l].width/2 >= tiles[i].x && currentLevel[l].x+currentLevel[l].width/2 <= tiles[i].x+tiles[i].width ) ){
                currentLevel[l].gridx = tiles[i].gridx;
                currentLevel[l].gridy = tiles[i].gridy;
                currentLevel[l].iPos = i;
            }
        }
        if((spelare.y+spelare.height/2 >= tiles[i].y && spelare.y+spelare.height/2 <= tiles[i].y + tiles[i].height) &&
        (spelare.x+spelare.width/2 >= tiles[i].x && spelare.x+spelare.width/2 <= tiles[i].x+tiles[i].width ) ){
            spelare.gridx = tiles[i].gridx;
            spelare.gridy = tiles[i].gridy;
            spelare.iPos = i;
        }
    }
    for (let i = 0; i < currentLevel.length; i++) {
        currentLevel[i].update();
    }
    if(spelare.speed > 0){
        walkSound.play();
    }
    if(!mute){
        backSound.play();
    } else{
        backSound.stop();
    }
    spelare.collision();
    changeLevel();

}

document.addEventListener('keydown', function(event){
    if(event.key === 'r'){
        spelare.x = 0;
        spelare.y = 240;
        next = true;
        resetLevel();
        alive = true;
        alerted = false;
    }
    if(event.key === 'm'){
        mute = true;
    }
});

window.onload = init();