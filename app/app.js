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
      game.load.image('barrel', 'assets/barrelshape.png');
      game.load.image('ball', 'assets/ballshape.png');
      game.load.image('bg', 'assets/skybg.gif');

  },
  create: function(){
    this.blockFire = false;
    this.playerActiveBody = false;
    this.skybg = game.add.tileSprite(0, 0, 320, 480, 'bg');
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;


    this.ball = game.add.sprite(this.game.world.centerX, game.world.height - 100, 'ball');
    this.players = game.add.group();
    this.players.createMultiple(8, 'barrel');
    game.physics.arcade.enable(this.players);
    game.physics.arcade.gravity.y = 600;
    this.players.forEach(function(player) {
        player.anchor.setTo(0.5, 0.5);
        player.body.allowGravity = false;
        player.enableBody = true;
        player.body.setSize(30, 35, 0, 0);
        player.checkWorldBounds = true;
    }, this);
    //game.physics.p2.enable(this.players);

    this.playerActive = this.players.getFirstDead();
    //this.playerActive.body.setZeroDamping();
    this.playerActive.reset(this.game.world.centerX, game.world.height - 100 );
    //game.physics.p2.removeBody(this.playerActive);
    //this.player = game.add.sprite((game.world.width / 2 ), game.world.height - 100, this.barrel);
    // BALL //

    this.ball.checkWorldBounds = true;


    this.ball.anchor.setTo(0.5, 0.5);
    this.ball.physicsBodyType = Phaser.Physics.ARCADE;
    //this.playerActive.rotation = game.math.degToRad(2)

    this.ball.events.onOutOfBounds.add(this.die, this);

    //  We need to enable physics on the this.player

    // this.tweens.playerRotation = this.add.tween(this.player)
    //   .to({angle: 359}, 3000, null, true, 0, Infinity);
    // this.tweens.player2Rotation = this.add.tween(this.player2)
    //   .to({angle: 359}, 2000, null, true, 0, Infinity);

    //  this.Player physics properties. Give the little guy a slight bounce
    game.input.onDown.add(this.boom, this);

    // Score
    this.score = 0
    this.labelScore = game.add.text(20, 20, 0, { font: "16px 'Press Start 2P'"});
    this.labelScore.stroke = '#000000';
    this.labelScore.strokeThickness = 4;
    this.labelScore.fill = '#ffffff';
    // Carrega primeiro nivel
    this.level(1);
  },
  boom: function(){
    if (this.blockFire) return false;

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
    this.blockFire = true;
  },


  update: function(){
    this.skybg.tilePosition.x += 0.05;
    if(this.playerActiveBody){
      game.physics.arcade.overlap(this.ball, this.players, this.collisionHandler, null, this);
    }
    if(this.touched){
      this.ball.position.x = this.playerActive.position.x;
      this.ball.position.y = this.playerActive.position.y;
    }
    if(this.rotateActive){
      this.rotatePlayer(this.lastPlayer)
    }
    this.checkLevel(this.lastPlayer)
  },

  collisionHandler: function(ball, player) {
      this.playerActive = player;
      this.playerActiveBody = false
      ball.body.allowGravity = false;
      ball.body.velocity.x = 0
      ball.body.velocity.y = 0
      this.blockFire = false
      //console.log(ball)
      //this.ballMagnet = this.add.tween(ball).to({x: this.playerActive.position.x, y:this.playerActive.position.y}, 50, null, true, 0, 0);
      //this.ballMagnet.onComplete.add(function(data){
        this.touched = true;
      //}, this)
  },
  render: function(){
    //game.debug.spriteInfo(this.ball, 32, 32);
    //game.debug.body(this.playerActive);
  },

  /*******************
  //     SHAPES     //
  *******************/
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
    this.lastPlayer = null
    if(num = 1){
      player = this.players.getFirstDead();
      player.reset(50, 100 );
      player.rotation = game.math.degToRad(-180)
      this.add.tween(player).to({x: game.world.width - 50}, 2000, Phaser.Easing.Cubic.InOut, true, 0, Infinity, true);
      this.rotateActive = true
      this.lastPlayer = player
    }
  },
  rotatePlayer: function(player){
    game.physics.arcade.overlap(this.ball, player, function(ball, player){
      //player.body.rotation = game.math.degToRad(-180);
      this.add.tween(player).to({rotation: game.math.degToRad(1)}, 80, Phaser.Easing.Linear.InOut, true, 1, 1, false);
    }, null, this);
  },
  checkLevel: function(player){
    game.physics.arcade.overlap(this.ball, player, function(ball, player){
      this.loadNext();
      this.blockFire = true;
      _this = this;
      this.players.forEachAlive(function(_player){
        game.add.tween(_player).to({y: _player.position.y + 280}, 300, Phaser.Easing.Linear.InOut, true).onComplete.add(function(data){
          this.cleanStage()
          this.blockFire = false;
        }, _this)
      })
      this.score++
      this.labelScore.text = this.score;
    }, null, this);
  },
  loadNext: function(){
    var nextPlayer, rndX;
    nextPlayer = this.players.getFirstDead();
    rndX = game.rnd.between(50, game.world.width - 50)
    nextPlayer.reset(50, -180);
    this.add.tween(nextPlayer).to({x: game.world.width - 50}, 2000 - (this.score * 10), Phaser.Easing.Cubic.InOut, true, 0, Infinity, true);
    this.lastPlayer = nextPlayer
  },
  cleanStage: function(){
    this.players.forEachAlive(function(_player){
      if(_player.y > game.world.height + _player.height){
        game.tweens.removeFrom(_player);
        _player.kill();
      }
    })
  }
}

// Launcher do jogoZ
game.state.add('main', mainState);
game.state.start('main');