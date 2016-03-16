// cria o objeto com o phaser
docWidth = document.body.offsetWidth;
docHeight = document.body.offsetHeight;
muted = JSON.parse(localStorage.muted || false);
var game = new Phaser.Game(docWidth, docHeight, Phaser.AUTO, 'space');

// objeto contento todos os metodos do jogo
var mainState = {
  // helper functions
  cloneObject: function(obj){
    return JSON.parse(JSON.stringify(obj));
  },
  preload: function() {
      // IMAGES //
      game.load.image('barrel', 'assets/images/barrelshape.png');
      game.load.image('ball', 'assets/images/ballshape.png');
      game.load.image('bg', 'assets/images/skybg'+game.rnd.between(1,3)+'.jpg');
      game.load.image('gameoverimg', 'assets/images/gameover.png');
      game.load.image('playagainBtn', 'assets/images/playagain.png');
      game.load.image('sound-icon', 'assets/images/mute.png');

      // sounds
      game.load.audio('inBarrel', ['assets/sounds/Go_in_barrel.ogg', 'assets/sounds/Go_in_barrel.mp3']);
      game.load.audio('blastBarrel', ['assets/sounds/Barrel_blast_barrel.ogg', 'assets/sounds/Barrel_blast_barrel.mp3']);
      game.load.audio('gameover', ['assets/sounds/game_over.ogg', 'assets/sounds/game_over.mp3'], 0.5);

  },
  toggleMute: function(_this) {
    if (!muted) {
        _this.game.sound.mute = true;
        muted = true;
        localStorage.muted = true;
        if(_this.soundButton)
          _this.soundButton.alpha = 0.2;
    } else {
        muted = false;
        localStorage.muted = false;
        _this.game.sound.mute = false;
        if(_this.soundButton)
          _this.soundButton.alpha = 1;
    }
  },
  create: function(){
    if(typeof localStorage.barrelScore == "undefined"){
      localStorage.barrelScore = 0;
    }
    this.toggleMute(this);
    this.blockFire = false;
    this.playerActiveBody = false;
    this.skybg = game.add.tileSprite(0, 0, docWidth, docHeight, 'bg');

    // Sounds
    this.blast = game.add.audio('blastBarrel');
    this.goIn = game.add.audio('inBarrel');
    this.gameover = game.add.audio('gameover');

    this.soundButton = game.add.sprite(26, 22, 'sound-icon');
    this.soundButton.reset(docWidth - 36, 20);
    this.soundButton.anchor.setTo(0, 0);
    this.soundButton.inputEnabled = true;
    this.soundButton.events.onInputDown.add(function(){
      this.toggleMute(this);
    }, this);

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
    this.score = 0;
    this.labelScore = game.add.text(20, 20, 0, { font: "16px 'Press Start 2P'"});
    this.labelScore.stroke = '#000000';
    this.labelScore.strokeThickness = 4;
    this.labelScore.fill = '#ffffff';
    // Carrega primeiro nivel
    this.level(1);

    this.gameoverState = game.add.sprite(this.game.world.centerX, -180, 'gameoverimg');
    this.gameoverState.anchor.setTo(0.5, 0.5);

    this.bestScore = game.make.text(0, 30,'HIGH SCORE: 10',{ font: "10px 'Press Start 2P'"});
    this.bestScore.anchor.setTo(0.5, 0);
    this.bestScore.stroke = '#000000';
    this.bestScore.strokeThickness = 2;
    this.bestScore.fill = '#ffffff';

    this.playAgain = game.make.sprite(0, 80, 'playagainBtn');
    this.playAgain.anchor.setTo(0.5, 0);

    // this.gameoverState.addChild(this.bestScore);
    this.gameoverState.addChild(this.playAgain);

    this.playAgain.inputEnabled = true;
    this.playAgain.events.onInputDown.add(function(){
      game.state.restart('main');
      console.log('again');
    }, this);
    this.lastPlayerRotaing = false;
  },
  boom: function(){
    if (this.blockFire) return false;

    //console.log("boom")
    this.touched = false;
    game.physics.arcade.enable(this.ball);
      this.ball.body.allowGravity = true;
    this.ball.body.collideWorldBounds = true;
    this.ball.body.bounce.set(0.6);

    game.time.events.add(Phaser.Timer.QUARTER - 100, function(){
      this.playerActiveBody = true;
      this.playerActive = null;
    }, this).autoDestroy = true;

    //this.ball.body.setCircle(10);
    //this.tweens.playerRotation.stop()

    this.ball.body.rotation = this.playerActive.rotation + game.math.degToRad(-180);

    var magnitude = 680 + ((docHeight / 100) * 10);
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
      this.ball.alpha = 0;
    }else{
      this.ball.alpha = 1;
    }
    if(this.rotateActive){
      this.rotatePlayer(this.lastPlayer);
    }
    this.checkLevel(this.lastPlayer);
  },

  collisionHandler: function(ball, player) {
      this.playerActive = player;
      this.playerActiveBody = false;
      ball.body.allowGravity = false;
      ball.body.velocity.x = 0;
      ball.body.velocity.y = 0;
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
    //console.log('Die :(')
      if(this.ball.position.y < game.world.height - 100) return false;
      this.gameover.volume = 0.2;
      this.gameover.play();
      this.bestScore.text = 'HIGH SCORE:'+localStorage.barrelScore;
      this.tweenAgain = this.add.tween(this.gameoverState).to({y: (docHeight / 2) - 80}, 750, Phaser.Easing.Back.Out, false, 0);
      this.tweenAgain.start();
      var _this = this;
      this.tweenAgain.onComplete.add(function(){
        if(localStorage.barrelScore < this.score){
          //this.updateLeaderBoard();
        }
      });

  },

  /*******************
  //    LEVELS      //
  *******************/
  level: function(num){
    var player;
    this.lastPlayer = null;
    if(num == 1){
      player = this.players.getFirstDead();
      player.reset(50, 100 );
      player.rotation = game.math.degToRad(-180);
      this.add.tween(player).to({x: game.world.width - 50}, 2000, Phaser.Easing.Cubic.InOut, true, 0, Infinity, true);
      this.rotateActive = true;
      this.lastPlayer = player;
    }
  },
  rotatePlayer: function(player){
    game.physics.arcade.overlap(this.ball, player, function(ball, player){
      //player.body.rotation = game.math.degToRad(-180);
      if(!this.lastPlayerRotaing){
        this.add.tween(player).to({rotation: game.math.degToRad(1)}, 80, Phaser.Easing.Linear.InOut, true, 1, 1, false);
      }
    }, null, this);
  },
  checkLevel: function(player){
    game.physics.arcade.overlap(this.ball, player, function(ball, player){
      this.loadNext();
      this.blockFire = true;
      _this = this;
      this.players.forEachAlive(function(_player){
        game.add.tween(_player).to({y: _player.position.y +  game.rnd.between(280, 380)}, 300, Phaser.Easing.Linear.InOut, true).onComplete.add(function(data){
          this.cleanStage();
          this.blockFire = false;
        }, _this);
      });
      this.score++;
      this.updateHighScore();
      this.labelScore.text = this.score;
    }, null, this);
  },
  loadNext: function(){
    var nextPlayer, rndX;
    var reverse = game.rnd.between(0, 1) ? true : false;
    var isRotating = game.rnd.between(0, 5) == 3 ? true : false;

    var time = 2000 - (this.score * 15);
    if(time < 1000) time = 1000;
    nextPlayer = this.players.getFirstDead();
    rndX = game.rnd.between(50, game.world.width - 50);

    var timeFix = this.setTime(rndX, time);
    nextPlayer.reset(rndX, -180);
    nextPlayer.rotation = game.math.degToRad(-180);

    var tweenA = this.add.tween(nextPlayer).to({x: reverse ? 50 : game.world.width - 50}, timeFix, Phaser.Easing.Sinusoidal.Out, false, 0);
    var tweenB = this.add.tween(nextPlayer).to({x: reverse ? game.world.width - 50 : 50}, time, Phaser.Easing.Sinusoidal.InOut, false, 0, -1, true);
    this.lastPlayerRotaing = false;
    if(isRotating){
      this.lastPlayerRotaing = true;
      var rotateTime = 1500;
      if(this.score > 30){
        rotateTime = rotateTime * 20 / this.score;
        if(rotateTime < 600) rotateTime = 600;
      }
      var tweenRotate = this.add.tween(nextPlayer).to({angle: reverse ? '+360' : '-360'}, rotateTime, Phaser.Easing.Linear.None, true, 100, -1);
    }

    tweenA.chain(tweenB);
    tweenA.start();
    this.lastPlayer = nextPlayer;
  },
  cleanStage: function(){
    this.players.forEachAlive(function(_player){
      if(_player.y > game.world.height + _player.height){
        game.tweens.removeFrom(_player);
        _player.kill();
      }
    });
  },
  // Altera o tempo do tween para o barril não
  // desacelar no yoyo
  setTime: function(rnd, time){
    var w = game.world.width - 100;
    var perc = Math.round(((rnd - 50) / w) * 100);
    var result = (time / 100 ) * perc;
    return result;
  },
  // Atualiza o high score em local storage
  updateHighScore: function(){
    var savedScore = localStorage.barrelScore || 0;
    if(savedScore < this.score){
      localStorage.barrelScore = this.score;
    }
  },

  updateLeaderBoard: function(){
    $.get($('body').data('url')+'/api/').success(function(data){
      console.log(data);
      var scores = data;
      var numbers = [];
      $.each(scores, function(index, val){
        numbers.push(val.score);
      });
      var high = Math.min.apply(Math,numbers);
      if(localStorage.barrelScore > high || numbers.length < 50){
        $(".leader-form").addClass('show').find("input[name='name']").focus();
        $('.leader-form p').text('NEW HIGH SCORE! Submit your name to the leader board :]');
        $('.leader-form form').show();
      }
    }).error(function(err){

      console.log(err);
    });
  }
};
// ************************ //
//       Tela inicial
// ************************ //
var startState = {
  preload: function(){
    // IMAGES //
    //> entities
    game.load.image('logo', 'assets/images/logo.png');
    game.load.image('bg', 'assets/images/skybg1.jpg');
    game.load.image('ball', 'assets/images/ballshape.png');
    //> buttons
    game.load.image('startBtn', 'assets/images/start-button.png');
    game.load.image('rankingBtn', 'assets/images/ranking-button.png');

    // SOUNDS //
    game.load.audio('theme', ['assets/sounds/open_theme.ogg', 'assets/sounds/open_theme.mp3'],1,true);
  },
  create: function(){

    this.skybg = game.add.tileSprite(0, 0, docWidth, docHeight, 'bg');
    this.theme = game.add.audio('theme');
    this.theme.loopFull();
    this.theme.volume = 0.5;
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
        ball.body.bounce.x = 0.6;
    }, this);

    // High Score
    if(typeof localStorage.barrelScore != "undefined" ){
      this.labelScore = game.add.text(20, 20, 'HIGH SCORE:'+localStorage.barrelScore, { font: "11px 'Press Start 2P'"});
      this.labelScore.stroke = '#000000';
      this.labelScore.strokeThickness = 4;
      this.labelScore.fill = '#ffffff';
    }

    this.logo = game.add.sprite(this.game.world.centerX + 7, - 140, 'logo');
    this.logo.anchor.setTo(0.5, 0);

    this.btn = game.make.sprite(0, 164, 'startBtn');
    this.btn.anchor.setTo(0.5, 0);

    //this.ranking = game.make.sprite(60, 164, 'rankingBtn');
    //this.ranking.anchor.setTo(0.5, 0);

    this.logo.addChild(this.btn);
    //this.logo.addChild(this.ranking);

    this.tweenA = this.add.tween(this.logo).to({y: (docHeight / 2) - 150 }, 2000, Phaser.Easing.Bounce.Out, false, 0);
    this.tweenA.start();
    var _this = this;
    this.tweenA.onComplete.add(function(){
      _this.ballsFire(_this.balls);
    });
    //game.physics.enable([this.logo], Phaser.Physics.ARCADE);
    this.btn.inputEnabled = true;
    this.btn.events.onInputDown.add(function(){
      game.state.start('main');
      console.log('teste');
      this.theme.stop();
    }, this);

    // this.ranking.inputEnabled = true;
    // this.ranking.events.onInputDown.add(function(){
    //   $('.leader-board').addClass("show");
    //   $.get($('body').data('url')+'/api/').success(function(data){
    //     console.log(data);
    //     var scores = data;
    //     var output = '';
    //     if(scores.length === 0){
    //       output = '<li>Nobody play this yet :(</li>';
    //       $('.leader-board ul').html(output);
    //       return false;
    //     }
    //     $.each(scores, function(index, val){
    //         output += '<li>'+val.name+'<span>'+val.score+'</span>'+'</li>';
    //     });
    //     $('.leader-board ul').html(output);
    //   }).error(function(err){
    //
    //     console.log(err);
    //   });
    //   //$.post('http://localhost/dk/api/', {name: 'Teste 2', score: 11}).sucess(function(){})
    // }, this);


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
        _this.shootBall(ball);
    });
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
};


// ************************ //
//          boot
// ************************ //
var boot = {
  preload: function(){
    game.load.image('logo', 'assets/images/boss.png');
    game.load.audio('audio', ['assets/sounds/boot.ogg', 'assets/sounds/boot.mp3']);
  },
  create: function(){


    game.stage.backgroundColor = "#000000";
    this.logo = game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.anchor.setTo(0.5, 0.5);
    this.logo.alpha = 0;
    this.audio = game.add.audio('audio');
    this.audio.play();
    this.add.tween(this.logo).to({alpha: 1}, 1500).start().onComplete.add(function(){
      game.time.events.add(Phaser.Timer.SECOND * 3, function(){
        game.state.start('start');
      }, this).autoDestroy = true;
    });

  }
};
game.state.add('boot', boot);
game.state.add('main', mainState);
game.state.add('start', startState);
