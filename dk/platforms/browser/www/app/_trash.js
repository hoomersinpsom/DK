
function checkPattern(block){
    var vizinhos = getVizinhos(block);
    //console.log(":", vizinhos.length , vizinhos)
    if(vizinhos.length == 1){
        var x = 0;
  
        vizinhos.forEach(function(index){
            var ind = index;

            
            
                splitPattern = true; 

                //console.log("dir:",dir," Vizinhos:", x, index, " Vizinhos len:", vizinhos.length);                
                snake.push(index)
            

            blocks.children[ind].checked = true;

            if(alt){
                blocks.children[ind].loadTexture(filledRed, 0); 
            }else{
                blocks.children[ind].loadTexture(filledBlue, 0); 
            }

            setTimeout(function() {
                checkPattern(blocks.children[ind]);
            }, 10);

            x++;
        });

    }
    if(vizinhos.length == 2){
        var ind = vizinhos[0];
        cross = vizinhos;

        console.log(ind,getVizinhos(blocks.children[ind]));
        snake.push(ind)
        blocks.children[ind].checked = true;
        if(alt){
            blocks.children[ind].loadTexture(filledRed, 0); 
        }else{
            blocks.children[ind].loadTexture(filledBlue, 0); 
        }

            setTimeout(function() {
                checkPattern(blocks.children[ind]);
            }, 10);
    }  
    if(vizinhos.length == 0 && cross.length > 0){

    }

}

foo = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,1,1,0,0,0],
	[0,0,0,0,1,0,1,0,0,0],
	[0,0,0,0,1,1,1,0,0,0],
	[0,0,1,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,1,0,0,0],
	[0,0,1,0,1,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
]

/// estruturado 
function preload() {
 
    // add the shapes of the squares
    shapes();

}
var blocks, blockWidth, blockHeight, border, filled, text,labelScore;
var blocksAlive = [];
var viz = 0;
var score = 0;
var snake = [];
var cross;
var alt = false;
var loop = [];    
var splitPattern;
var map = [];
var pipe;
var rows = 10;
var columns = 10;

function create() {
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    text = game.add.text(250, 16, '', { fill: '#ffffff' });
   
    pipes = game.add.group(); // Create a group  
    pipes.enableBody = true;  // Add physics to the group  
    pipes.createMultiple(8, pipe); // Create 8 pipes 

    blocks = game.add.group();
    blocks.enableBody = true;
    for(var y = 0; y < rows; y++){       
        for(var x = 0; x < columns; x++){  
            var block = blocks.create(x * 32, y * 32 + 80, border);            
            block.inputEnabled=true;           
            block.alive = false
            block.events.onInputDown.add(swapColor, this);

        }
    }   

    labelScore = game.add.text(10, 10, "0", { font: "16px 'Press Start 2P'", fill: "#ffffff" }); 
 
   addRowOfPipes() 
}

function update() {

}
function swapColor(block) {     
    var totalPipes = pipes

    if(block.alive) return false;
    if(!hasPipes()){
        robotTurn();
        return false;
    }
    killPipe();

    if(pipes.countLiving() == 0){
        robotTurn();;
    }

    block.alive = true;
    block.checked = true;
    block.loadTexture(filled, 0);
    //cleanChecked(block)
    map = [];
    makeMap();

    if(validLoop()){
        console.log('Wow, such loop!');
        setTimeout(function() {
         removeLoop(loop);
        }, 100);
    }
}

// verfica se contem pipes
function hasPipes(){
    if(pipes.countLiving() == 0) return false;
    return true;
}

function killPipe(){
    pipes.getFirstAlive().kill();
}

// cria o mapa binario com os blocos acessos
function makeMap(){    
    for(var i = 0; i < rows; i++){
        map.push([])
        for(var j = 0; j < columns; j++){
            var ind  = i*columns+j;
            var point = 0;
            
            if(blocks.children[ind].alive > 0) point = 1;
            
            map[i].push(point)
        }
    }
}

//verifica se existe um loop na tela
function numTouching1(x, y) {
    return ((x > 0) ? map[x - 1][y] : 0) + ((x < rows-1) ? map[x + 1][y] : 0) + ((y > 0) ? map[x][y - 1] : 0) + ((y < columns-1) ? map[x][y + 1] : 0);
}
function extractLoop() {
    var one = false
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var touch = numTouching1(i, j);
            if (map[i][j] === 1 && (touch === 1 || touch === 0)) {
                map[i][j] = 0;
                one = true;                
            }
        }
    }

    if(one){
        extractLoop();
    }
}

function validLoop(){
  extractLoop();  
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < columns; j++){
      if(map[i][j] === 1 && numTouching1(i,j) == 2) {
        loop.push(i+""+j)
       
        return true
      }
    }
  }
  return false;
}

function makeChoices(){   
    var quantity = Math.round(Math.random() * 8);

    return quantity;
}         
function addOnePipe(x, y) {  
    // Get the first dead pipe of our group
    var pipe = pipes.getFirstDead();

    // Set the new position of the pipe
    pipe.reset(x, y);
}
function addRowOfPipes() {  
    var quantity = makeChoices();

   var  x =  (320 / 2) - ((quantity * 16) / 2);
    for (var i = 0; i < quantity; i++){        
        addOnePipe(i * 16 + x , 416 );
    }  

}

function render() {
    // call renderGroup on each of the alive members
    //blocks.forEachAlive(renderGroup, this);
}
function renderGroup(member) {
    //game.debug.body(member);
}


/*function checkDistance(atual, proximo) {       
    if (game.physics.arcade.distanceBetween(atual, proximo) < 50) {
        if(atual.position.x == proximo.position.x || atual.position.y == proximo.position.y){
            return true
        }
    }
    return false;        
}*/

function getVizinhos(block){
    var i = 0;
    var inds = []
    blocks.forEach(function(el){
       // if(el.alive && el.z != block.z && !el.checked)  console.log(el.z, block.z, checkDistance(block, el));
        if(el.alive && el.z != block.z && checkDistance(block, el) && !el.checked){
            inds.push(el.z - 1);
            //console.log(el.z, block.z)
            //console.log("check", el.checked)
        }
        i++;
    });
    return inds;
}

function cleanChecked(block){
    var ind = block.z ; 
    blocks.forEach(function(el){
        //console.log(el.z == ind);
        if(el.z != ind){
            el.checked = false;
        }
    })
}

// remove o loop encontrado
function removeLoop(nums){
    var total = 0;
    var increment = 0;
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
          if(map[i][j] === 1) {          
            var ind  = i*columns+j;  
            increment = increment + 2;
            total++;          
            blocks.children[ind].alive = false;
            blocks.children[ind].loadTexture(border, 0);
            
          }
        }
    }
    score = score + (total + increment)
    labelScore.text = score;
}

// formas geometricas dos quadrados
function shapes(){
    border = game.add.bitmapData(32,32);

    // draw to the canvas context like normal
    border.ctx.beginPath();
    border.ctx.lineWidth="1";
    border.ctx.strokeStyle="#666666";
    border.ctx.rect(0,0,32,32);
    border.ctx.stroke();

    filled = game.add.bitmapData(32,32);

    // draw to the canvas context like normal
    filled.ctx.beginPath();
    filled.ctx.rect(0,0,32,32);
    filled.ctx.fillStyle = '#ffffff';
    filled.ctx.fill();
    filled.ctx.strokeStyle="#666666"
    filled.ctx.stroke();

    pipe = game.add.bitmapData(16,16);

    // draw to the canvas context like normal
    pipe.ctx.beginPath();
    pipe.ctx.rect(0,0,16,16);
    pipe.ctx.fillStyle = '#ffffff';
    pipe.ctx.fill();
    pipe.ctx.strokeStyle="#000000"
    pipe.ctx.stroke();


    filledRed = game.add.bitmapData(32,32);

    // draw to the canvas context like normal
    filledRed.ctx.beginPath();
    filledRed.ctx.rect(0,0,32,32);
    filledRed.ctx.fillStyle = '#ff0000';
    filledRed.ctx.fill();
    filledRed.ctx.strokeStyle="#666666"
    filledRed.ctx.stroke();


    filledBlue = game.add.bitmapData(32,32);

    // draw to the canvas context like normal
    filledBlue.ctx.beginPath();
    filledBlue.ctx.rect(0,0,32,32);
    filledBlue.ctx.fillStyle = '#0000ff';
    filledBlue.ctx.fill();
    filledBlue.ctx.strokeStyle="#666666"
    filledBlue.ctx.stroke();
}


// Robot
function robotTurn(){
    console.log('Bot turn !');
}