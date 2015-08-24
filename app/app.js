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

    game.stage.backgroundColor = '#2d2d2d';
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    // The player and its settings

    game.physics.p2.gravity.y = 450;
    game.physics.p2.restitution = 0.8;
    game.physics.p2.friction = 0.1;

    this.player2 = game.add.sprite((game.world.width / 2 ), 100, this.barrel);

    this.player = game.add.sprite((game.world.width / 2 ), game.world.height - 100, this.barrel);
    // BALL //
    this.ball = game.add.sprite(this.player.position.x, this.player.position.y, this.ballShape);


    this.player.anchor.setTo(0.5, 0.5);
    this.player2.anchor.setTo(0.5, 0.5);

    //  We need to enable physics on the this.player
    this.ball.anchor.setTo(0.5, 0.5);



    //  We need to enable physics on the this.player

    this.tweens.playerRotation = this.add.tween(this.player)
      .to({angle: 359}, 3000, null, true, 0, Infinity);
    this.tweens.player2Rotation = this.add.tween(this.player2)
      .to({angle: 359}, 2000, null, true, 0, Infinity);

    //  this.Player physics properties. Give the little guy a slight bounce
    game.input.onDown.add(this.boom, this);
  },
  boom: function(){
    console.log("boom")
    game.physics.p2.enable(this.ball);
    this.tweens.playerRotation.stop()

    this.ball.body.rotation = this.player.rotation + game.math.degToRad(-180);

    var magnitude = 600;
    var angle = this.ball.body.rotation + Math.PI / 2;

    this.ball.body.velocity.x = magnitude * Math.cos(angle);
    this.ball.body.velocity.y = magnitude * Math.sin(angle);
    //this.ball.body.velocity.y = -300
  },
  update: function(){
    //sthis.ball.body.velocity.y = 100
  },
  render: function(){
    //game.debug.spriteInfo(this.ball, 32, 32);
  },
  /*******************
  //     SHAPES     //
  *******************/
  // formas geometricas dos quadrados e sprites em geral
  shapes:function(){

    this.barrel = game.add.bitmapData(30,50);

    // draw to the canvas context like normal
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,30,50);
    this.barrel.ctx.fillStyle = '#991111';
    this.barrel.ctx.fill();
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,30,4);
    this.barrel.ctx.fillStyle = '#119911';
    this.barrel.ctx.fill();


    this.ballShape = game.add.bitmapData(20,20);

    // draw to the canvas context like normal

    this.ballShape.ctx.beginPath();
    this.ballShape.ctx.arc(10, 10, 10, 0, 2 * Math.PI, false);
    this.ballShape.ctx.fillStyle = 'green';
    this.ballShape.ctx.fill();
    this.ballShape.ctx.stroke();
    this.ballShape.ctx.beginPath();
    this.ballShape.ctx.rect(7,5,3,3);
    this.ballShape.ctx.fillStyle = 'tomato';
    this.ballShape.ctx.fill();

  }
}

// Launcher do jogoZ
game.state.add('main', mainState);
game.state.start('main');