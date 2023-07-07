const app = new PIXI.Application({ width: 600, height: 800, backgroundColor: 0xEEEEEE });
document.body.appendChild(app.view);

const colors = ['0xFF0000', '0x00FF00', '0x0000FF', '0xFF00FF', '0x00FFFF', '0x800080', '0xFFA500', '0x008080'];

const balls = [];
let level = 0;
let number = 4;
let score = 0;
const scoreText = new PIXI.Text(`Score: ${score}`, { fontSize: 24, fill: 0x000000 });
scoreText.anchor.set(1, 0);
scoreText.position.set(app.renderer.width - 10, 10);
app.stage.addChild(scoreText);

// 碰撞检测
function checkCollision(ball1, ball2) {
  const dx = ball1.x - ball2.x;
  const dy = ball1.y - ball2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ball1.width / 2 + ball2.width / 2;
}

// 合并小球
function mergeBalls(ball1, ball2) {
  score += 10;
  scoreText.text = `Score: ${score}`;
  const x = ball2.x;
  const y = ball2.y;
  balls.splice(balls.findIndex(g => g.name === ball1.name),1)
  balls.splice(balls.findIndex(g => g.name === ball2.name),1)
  app.stage.removeChild(ball1);
  app.stage.removeChild(ball2);
  //原地再生成一个新的颜色球
  if(balls.length>0){
    const newball = createMasterBall(balls[0].tint);
    newball.name = Math.round(newball.x+newball.y);
    newball.x = x
    newball.y = y
    balls.push(newball);
    app.stage.addChild(newball);
  }
}

// 拖动小球
function onDragStart(event) {
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd() {
  this.alpha = 1;
  this.dragging = false;
  this.data = null;
  // 检查游戏是否结束
  if (app.stage.children.length === 0) {
      gameover();
  }
}

function onDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
    // 检查小球碰撞
    for (let i = 0; i < app.stage.children.length; i++) {
      const otherBall = app.stage.children[i];
      if (this !== otherBall && checkCollision(this, otherBall)) {
        if (this.tint === otherBall.tint || this.name === "masterball") {
          mergeBalls(this, otherBall);//相同颜色小球合并
        } else {
          gameover();
        }
      }
    }
  }
}

function gameover(){
  console.log("游戏结束!!!");
}


function start(number){
  // 创建主小球
  const masterball = createMasterBall("#FFFFFF");
  masterball.name = "masterball";
  balls.push(masterball);
  app.stage.addChild(masterball);

  // 创建其他小球
  while (balls.length <= number) {
    let color = colors[Math.floor(Math.random() * colors.length)];
    const ball = createBall(color);
    // 检查小球位置是否重叠
    let overlap = false;
    for (let i = 0; i < balls.length; i++) {
      const otherBall = balls[i];
      //判断新生成的小球和其他任意球没有碰撞
      const distance = Math.sqrt((ball.x - otherBall.x) ** 2 + (ball.y - otherBall.y) ** 2);
      if (distance < (ball.width + otherBall.width)/2) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      ball.name = Math.round(ball.x+ball.y);
      balls.push(ball);
      app.stage.addChild(ball);
    }
  }
}

// 生成随机颜色和大小的小球
function createBall(color) {
  const radius = 30 + Math.random() * 20;
  const ball = new PIXI.Graphics();
  ball.beginFill(color);
  ball.drawCircle(0, 0, radius);
  ball.endFill();
  ball.tint = color;
  ball.x = Math.random() * (app.renderer.width - radius * 2) + radius;
  ball.y = Math.random() * (app.renderer.height - radius * 2) + radius;
  ball.vx = 0;
  ball.vy = 0;
  ball.interactive = false;
  ball.buttonMode = true;
  ball.on("pointerdown", onDragStart);
  ball.on("pointerup", onDragEnd);
  ball.on("pointerupoutside", onDragEnd);
  ball.on("pointermove", onDragMove);
  return ball;
}

function createMasterBall(ballcolor) {
  const color = ballcolor
  const radius = 30;
  const ball = new PIXI.Graphics();
  ball.beginFill(color);
  ball.drawCircle(0, 0, radius);
  ball.endFill();
  ball.tint = color;
  ball.x = Math.random() * (app.renderer.width - radius * 2) + radius;
  ball.y = Math.random() * (app.renderer.height - radius * 2) + radius;
  ball.vx = 0;
  ball.vy = 0;
  ball.interactive = true;
  ball.buttonMode = true;
  ball.on("pointerdown", onDragStart);
  ball.on("pointerup", onDragEnd);
  ball.on("pointerupoutside", onDragEnd);
  ball.on("pointermove", onDragMove);
  return ball;
}

// 下一关
function nextLevel(){
  level = level + 1 ;
  number = number * 2;
  start(number);
}

// 在每帧更新时检查小球碰撞
function update() {
  if (app.stage.children.length === 1) {
    nextLevel();
  }
}

//开始游戏
start(number);
// 添加游戏循环
app.ticker.add(update);
