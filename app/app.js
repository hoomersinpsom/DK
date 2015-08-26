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
    game.stage.backgroundColor = '#2d2d2d';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;


    this.players = game.add.group();
    this.players.createMultiple(8, this.barrel);
    game.physics.arcade.enable(this.players);
    game.physics.arcade.gravity.y = 600;
    this.players.forEach(function(player) {
        player.anchor.setTo(0.5, 0.5);
        player.body.allowGravity = false;
        player.enableBody = true;
        player.body.setSize(30, 35, 0, 0);
    }, this);
    //game.physics.p2.enable(this.players);

    this.playerActive = this.players.getFirstDead();
    //this.playerActive.body.setZeroDamping();
    this.playerActive.reset(this.game.world.centerX, game.world.height - 100 );
    //game.physics.p2.removeBody(this.playerActive);
    //this.player = game.add.sprite((game.world.width / 2 ), game.world.height - 100, this.barrel);
    // BALL //
    this.ball = game.add.sprite(this.playerActive.position.x, this.playerActive.position.y, this.ballShape);

    this.ball.checkWorldBounds = true;


    this.ball.anchor.setTo(0.5, 0.5);
    this.ball.physicsBodyType = Phaser.Physics.ARCADE;
    this.playerActive.rotation = game.math.degToRad(2)

    this.ball.events.onOutOfBounds.add(this.die, this);

    //  We need to enable physics on the this.player

    // this.tweens.playerRotation = this.add.tween(this.player)
    //   .to({angle: 359}, 3000, null, true, 0, Infinity);
    // this.tweens.player2Rotation = this.add.tween(this.player2)
    //   .to({angle: 359}, 2000, null, true, 0, Infinity);

    //  this.Player physics properties. Give the little guy a slight bounce
    game.input.onDown.add(this.boom, this);
    this.level(1);
  },
  boom: function(){
    if (this.shooted) return false;

    console.log("boom")
    this.touched = false;
    game.physics.arcade.enable(this.ball);
      this.ball.body.allowGravity = true;
    this.ball.body.collideWorldBounds = true;
    this.ball.body.bounce.set(0.4);

    game.time.events.add(Phaser.Timer.QUARTER - 100, function(){
      
      this.playerActiveBody = true;
      this.playerActive = null;
    }, this).autoDestroy = true;

    //this.ball.body.setCircle(10);
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
      //this.playerActive.body.kinematic = true;
      //this.playerActive.body.setZeroVelocity();
      game.physics.arcade.overlap(this.ball, this.players, this.collisionHandler, null, this);
    }
    if(this.touched){
      this.ball.position.x = this.playerActive.position.x;
    }
    //if(this.ball.y > game.world.height - 20) return this.die();
  },

  collisionHandler: function(ball, player) {
      this.playerActive = player;
      this.playerActiveBody = false
      ball.body.allowGravity = false;
      ball.body.velocity.x = 0
      ball.body.velocity.y = 0
      this.shooted = false
      //console.log(ball)
      this.ballMagnet = this.add.tween(ball).to({x: this.playerActive.position.x, y:this.playerActive.position.y}, 50, null, true, 0, 0);
      this.ballMagnet.onComplete.add(function(data){
        this.touched = true;
      }, this)
  },
  render: function(){
    //game.debug.spriteInfo(this.ball, 32, 32);
    //game.debug.body(this.playerActive);
  },

  /*******************
  //     SHAPES     //
  *******************/
  // formas geometricas dos quadrados e sprites em geral
  shapes:function(){

    this.barrel = game.add.bitmapData(40,50);

    // draw to the canvas context like normal
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,40,50);
    this.barrel.ctx.fillStyle = '#991111';
    this.barrel.ctx.fill();
    this.barrel.ctx.beginPath();
    this.barrel.ctx.rect(0,0,40,4);
    this.barrel.ctx.fillStyle = '#119911';
    this.barrel.ctx.fill();


    this.ballShape = game.add.bitmapData(35,35);

    // draw to the canvas context like normal

    this.ballShape.ctx.beginPath();
    this.ballShape.ctx.arc(17.5, 17.5, 17.5, 0, 2 * Math.PI, false);
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
  },

  /*******************
  //    LEVELS      //
  *******************/
  level: function(num){
    var player;
    if(num = 1){
      player = this.players.getFirstDead();
      player.reset(50, 100 );
      player.rotation = game.math.degToRad(-180)
      this.add.tween(player).to({x: game.world.width - 50}, 2000, Phaser.Easing.Cubic.InOut, true, 0, Infinity, true);
    }
  }
}

// Launcher do jogoZ
game.state.add('main', mainState);
game.state.start('main');