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
      game.load.image('barrel', 'assets/images/barrelshape.png');
      game.load.image('ball', 'assets/images/ballshape.png');
      game.load.image('bg', 'assets/images/skybg.gif');

      // sounds
      game.load.audio('inBarrel', ['assets/sounds/Go_in_barrel.ogg', 'assets/sounds/Go_in_barrel.mp3']);
      game.load.audio('blastBarrel', ['assets/sounds/Barrel_blast_barrel.ogg', 'assets/sounds/Barrel_blast_barrel.mp3']);
      game.load.audio('gameover', ['assets/sounds/game_over.ogg', 'assets/sounds/game_over.mp3'], 0.5);

  },
  create: function(){
    this.blockFire = false;
    this.playerActiveBody = false;
    this.skybg = game.add.tileSprite(0, 0, 320, 480, 'bg');

    // Sounds
    this.blast = game.add.audio('blastBarrel')
    this.goIn = game.add.audio('inBarrel')
    this.gameover = game.add.audio('gameover')

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
    this.blast.play();
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
      this.ball.alpha = 0
    }else{
      this.ball.alpha = 1
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
      this.blockFire = false;
      this.goIn.play();
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
  //      DIE       //
  *******************/
  die: function(){
    console.log('Die :(')
      this.gameover.volume = 0.2
      this.gameover.play()

    game.time.events.add(Phaser.Timer.SECOND, function(){
      game.state.start('main');
    }, this).autoDestroy = true;
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
    var reverse = game.rnd.between(0, 1) ? true : false;

    var time = 2000 - (this.score * 15);
    if(time < 400) time = 400;
    nextPlayer = this.players.getFirstDead();
    rndX = game.rnd.between(50, game.world.width - 50);

    var timeFix = this.setTime(rndX, time);
    nextPlayer.reset(rndX, -180);
    nextPlayer.rotation = game.math.degToRad(-180);

    var tweenA = this.add.tween(nextPlayer).to({x: reverse ? 50 : game.world.width - 50}, timeFix, Phaser.Easing.Sinusoidal.Out, false, 0);
    var tweenB = this.add.tween(nextPlayer).to({x: reverse ? game.world.width - 50 : 50}, time, Phaser.Easing.Sinusoidal.InOut, false, 0, -1, true);

    tweenA.chain(tweenB);
    tweenA.start();
    this.lastPlayer = nextPlayer
  },
  cleanStage: function(){
    this.players.forEachAlive(function(_player){
      if(_player.y > game.world.height + _player.height){
        game.tweens.removeFrom(_player);
        _player.kill();
      }
    })
  },
  // Altera o tempo do tween para o barril não
  // desacelar no yoyo
  setTime: function(rnd, time){
    var w = game.world.width - 100;
    var perc = Math.round(((rnd - 50) / w) * 100);
    var result = (time / 100 ) * perc;
    return result;
  }
}
// ************************ //
//       Tela inicial
// ************************ //
var startState = {
  preload: function(){
    // add the shapes of the squares
    game.load.image('logo', 'assets/images/logo.png');
    game.load.image('bg', 'assets/images/skybg.gif');
    game.load.image('startBtn', 'assets/images/start-button.png');
    game.load.image('ball', 'assets/images/ballshape.png');

    // sounds
    game.load.audio('theme', ['assets/sounds/open_theme.ogg', 'assets/sounds/open_theme.mp3'],1,true);
  },
  create: function(){
    this.skybg = game.add.tileSprite(0, 0, 320, 480, 'bg');
    this.theme = game.add.audio('theme')
    this.theme.loopFull();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;

    this.balls = game.add.group();
    this.balls.createMultiple(4, 'ball');
    game.physics.arcade.enable(this.balls);
    game.physics.arcade.gravity.y = 600;
    this.balls.forEach(function(ball) {
        ball.anchor.setTo(0.5, 0.5);
        ball.body.allowGravity = true;
        ball.enableBody = true;
        ball.checkWorldBounds = true;
        ball.body.collideWorldBounds = true;
        //ball.outOfBoundsKill = true;
        ball.events.onOutOfBounds.add(this.die, this);
        ball.body.bounce.x = 0.6
    }, this);


    this.logo = game.add.sprite(this.game.world.centerX + 7, - 140, 'logo');
    this.logo.anchor.setTo(0.5, 0);
    this.btn = game.make.sprite(0, 164, 'startBtn')
    this.btn.anchor.setTo(0.5, 0);
    this.logo.addChild(this.btn);

    this.tweenA = this.add.tween(this.logo).to({y: 100}, 2000, Phaser.Easing.Bounce.Out, false, 0);
    this.tweenA.start();
    var _this = this;
    this.tweenA.onComplete.add(function(){
      _this.ballsFire(_this.balls)
    })
    //game.physics.enable([this.logo], Phaser.Physics.ARCADE);
    this.btn.inputEnabled = true;
    this.btn.events.onInputDown.add(function(){
      game.state.start('main');
      this.theme.stop();
    }, this);


  },
  die: function(ball){
    //console.log(ball)
    this.shootBall(ball);
  },
  render: function(){
    game.debug.body(this.logo);
  },
  update: function(){
    this.skybg.tilePosition.x += 0.3;
    //game.physics.arcade.collide(this.balls);
  },
  ballsFire: function(balls){
    var _this = this;
    balls.forEach(function(ball){
        _this.shootBall(ball)
    })
  },
  shootBall: function(ball){
    ball.reset(game.world.randomX, game.world.height);
    ball.body.rotation = game.math.degToRad(game.rnd.between(-135, -225));

    var magnitude = game.rnd.between(500, 800);
    var angle = ball.body.rotation + Math.PI / 2;
    //this.blast.play();
    ball.body.velocity.x = magnitude * Math.cos(angle);
    ball.body.velocity.y = magnitude * Math.sin(angle);
  }
}
// Launcher do jogo
game.state.add('main', mainState);
game.state.add('start', startState);
game.state.start('start');