function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on('think', this.think.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-run');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.think();
  this.actuate();

  // setTimeout(() => {
    var tileContainer = document.querySelectorAll('.grid-cell')
    for (let i = 0; i < tileContainer.length; i++) {
      tileContainer[i].addEventListener("click", this.spawn.bind(this));
    }
    // console.log(tileContainer)

  // }, animationDelay);
};

GameManager.prototype.think = function() {
  this.ai.best = this.ai.getBest();
  this.actuator.showHint(this.ai.best.move);
}

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });

  var self = this
  function repeat(){
    // animation
    console.log(this)
    var tileContainer = document.querySelectorAll('.tile')
    for (let i = 0; i < tileContainer.length; i++) {
      tileContainer[i].addEventListener("click", self.spawn.bind(self));
    }
    console.log("hello")
  }
  
  requestAnimationFrame(repeat)
  
  // setTimeout(() => {
  //   var tileContainer = document.querySelectorAll('.tile')
  //   for (let i = 0; i < tileContainer.length; i++) {
  //     tileContainer[i].addEventListener("click", this.spawn.bind(this));
  //   }
  // }, animationDelay);


};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;
  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
  this.think();
}


// moves continuously until game is over
GameManager.prototype.run = function() {
  var best = this.ai.getBest();
  this.move(best.move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}

// get location of click event, run ai best move, spawn block into location of click event
// event: click event
GameManager.prototype.spawn = function(event) {
  // var best = this.ai.getBest();

  // get event target element, get arr of classes of el
  var target = event.target.classList
  var coord = {}
  for(let i = 0;i<target.length;i++){
    if(target[i].includes("tile-position")){
      // remove all characters but numbers
      var res = target[i].replace(/\D/g, "");

      // css coords start at 1,1
      // subtract 1 to match array start
      coord = {x: parseInt(res[0]),y:parseInt(res[1])}
      coord.x -= 1
      coord.y -= 1
    } 
  }

  // get ai best move, do move
  var result = this.grid.move(parseInt(this.ai.best.move));

  this.score += result.score;
  if (!result.won) {
    if (result.moved) {
      // run playermove on coord
      this.grid.playerMove(coord);
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
  this.think();
}