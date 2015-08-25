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
    this.shooted = false;
    this.playerActiveBody = false;
    game.world.height = 480;
    game.stage.backgroundColor = '#2d2d2d';
    game.world.setBounds(0,0,game.world.width,game.world.height + 20);
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    // The player and its settings

    game.physics.p2.gravity.y = 450;
    game.physics.p2.restitution = 0.8;
    game.physics.p2.friction = 0.1;

    this.players = game.add.group();
    this.players.createMultiple(8, this.barrel);

    this.players.forEach(function(player) {
        player.anchor.setTo(0.5, 0.5);
    }, this);
    //game.physics.p2.enable(this.players);

    this.playerActive = this.players.getFirstDead();
    //this.playerActive.body.setZeroDamping();
    this.playerActive.reset(game.world.width / 2, game.world.height - 100 );
    //game.physics.p2.removeBody(this.playerActive);
    //this.player = game.add.sprite((game.world.width / 2 ), game.world.height - 100, this.barrel);
    // BALL //
    this.ball = game.add.sprite(this.playerActive.position.x, this.playerActive.position.y, this.ballShape);




    //  We need to enable physics on the this.player
    this.ball.anchor.setTo(0.5, 0.5);




    //  We need to enable physics on the this.player

    // this.tweens.playerRotation = this.add.tween(this.player)
    //   .to({angle: 359}, 3000, null, true, 0, Infinity);
    // this.tweens.player2Rotation = this.add.tween(this.player2)
    //   .to({angle: 359}, 2000, null, true, 0, Infinity);

    //  this.Player physics properties. Give the little guy a slight bounce
    game.input.onDown.add(this.boom, this);
  },
  boom: function(){
    if (this.shooted) return false;

    console.log("boom")
    game.physics.p2.enable(this.ball);
    game.time.events.add(Phaser.Timer.QUARTER, function(){
      game.physics.p2.enable(this.playerActive);
      this.playerActiveBody = true;
    }, this).autoDestroy = true;

    this.ball.body.setCircle(10);
    //this.tweens.playerRotation.stop()

    this.ball.body.rotation = this.playerActive.rotation + game.math.degToRad(-180);

    var magnitude = 600;
    var angle = this.ball.body.rotation + Math.PI / 2;

    this.ball.body.velocity.x = magnitude * Math.cos(angle);
    this.ball.body.velocity.y = magnitude * Math.sin(angle);
    //this.ball.body.velocity.y = -300
    this.shooted = true;
  },
  update: function(){
    if(this.playerActiveBody){
      this.playerActive.body.kinematic = true;
      this.playerActive.body.setZeroVelocity();
    }
    //sthis.ball.body.velocity.y = 100
    //this.playerActive.body.setZeroVelocity();
    if(this.ball.y > game.world.height - 20) return this.die();
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

  },

  /*******************
  //      DIE       //
  *******************/
  die: function(){
    console.log('Die :(')
    game.state.restart('main');
  }
}

// Launcher do jogoZ
game.state.add('main', mainState);
game.state.start('main');