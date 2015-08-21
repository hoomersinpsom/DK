// cria o objeto com o phaser
var game = new Phaser.Game(320, 480, Phaser.AUTO, 'space');

// objeto contento todos os metodos do jogo
var mainState = {
  // helper functions
  cloneObject: function(obj){
    return JSON.parse(JSON.stringify(obj))
  },
  preload: function() {
      // add the shapes of the squares
      this.shapes();

  },
  create: function(){
    this.barrelRotate = 0
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // The player and its settings

    this.player = game.add.sprite((game.world.width / 2 ), game.world.height - 100, this.barrel);
    // BALL //
    this.ball = game.add.sprite(this.player.position.x, this.player.position.y, this.ball);
    game.physics.enable([this.player,this.ball], Phaser.Physics.ARCADE);
    this.player.anchor.setTo(0.5, 0.5);

    //  We need to enable physics on the this.player
    this.ball.anchor.setTo(0.5, 0.5);

    game.physics.arcade.gravity.y = 200;
    this.ball.allowGravity = false
    this.player.allowGravity = false
    this.ball.body.collideWorldBounds = true;
    this.player.body.collideWorldBounds = true;
    this.ball.body.imovable = true;
    this.player.body.imovable = true;

    this.player.body.velocity.y = 0

    //  We need to enable physics on the this.player

    this.tweens.playerRotation = this.add.tween(this.player)
      .to({angle: 359}, 3000, null, true, 0, Infinity);
    this.tweens.ballRotation = this.add.tween(this.ball)
      .to({angle: 359}, 3000, null, true, 0, Infinity);

    //  this.Player physics properties. Give the little guy a slight bounce
    game.input.onDown.add(this.boom, this);
  },
  boom: function(){
    console.log("boom")
    this.ball.allowGravity = true
    //this.ball.body.velocity.y = -300
  },
  update: function(){
    //sthis.ball.body.velocity.y = 100
  },
  render: function(){
    game.debug.spriteInfo(this.ball, 32, 32);
  },
  /*******************
  //     SHAPES     //
  *******************/
  // formas geometricas dos quadrados e sprites em geral
  shapes:function(){

    this.barrel = game.add.bitmapData(50,70);

    // draw to the canvas context like normal
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,50,70);
    this.barrel.ctx.fillStyle = '#991111';
    this.barrel.ctx.fill();
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,50,4);
    this.barrel.ctx.fillStyle = '#119911';
    this.barrel.ctx.fill();


    this.ball = game.add.bitmapData(30,30);

    // draw to the canvas context like normal

    this.ball.ctx.beginPath();
    this.ball.ctx.arc(15, 15, 15, 0, 2 * Math.PI, false);
    this.ball.ctx.fillStyle = 'green';
    this.ball.ctx.fill();
    this.ball.ctx.stroke();
    this.ball.ctx.beginPath();
    this.ball.ctx.rect(7,5,3,3);
    this.ball.ctx.fillStyle = 'tomato';
    this.ball.ctx.fill();

  }
}

// Launcher do jogoZ
game.state.add('main', mainState);
game.state.start('main');