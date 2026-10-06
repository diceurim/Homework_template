// =====================================================
// Matter.js shortcut
// =====================================================

const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const MBody = Matter.Body;
const Events = Matter.Events;


// =====================================================
// 기본 변수
// =====================================================

let engine;

// 기본 Dice 이미지 6장
let diceImages = [];

// 노란 Dice 이미지 6장
let diceYellowImages = [];

// 생성된 모든 Dice
let dices = [];


// =====================================================
// 마우스 인터랙션
// =====================================================

// 마우스를 처음 누른 X 위치
let firstX = 0;

// 드래그 힘
let windForce = 0;

// 지금 클릭이 삭제 클릭인지
let isDeleting = false;


// =====================================================
// Level 2 설정
// =====================================================

const SAME_DICE_IMPACT_THRESHOLD = 1;


// =====================================================
// setup
// =====================================================

async function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  imageMode(CENTER);
  rectMode(CENTER);


  // ===================================================
  // 기본 Dice 이미지 로드
  // ===================================================

  diceImages[0] = await loadImage("./images/dice1.png");
  diceImages[1] = await loadImage("./images/dice2.png");
  diceImages[2] = await loadImage("./images/dice3.png");
  diceImages[3] = await loadImage("./images/dice4.png");
  diceImages[4] = await loadImage("./images/dice5.png");
  diceImages[5] = await loadImage("./images/dice6.png");


  // ===================================================
  // 노란 Dice 이미지 로드
  // ===================================================

  diceYellowImages[0] = await loadImage("./images/dice1_yellow.png");
  diceYellowImages[1] = await loadImage("./images/dice2_yellow.png");
  diceYellowImages[2] = await loadImage("./images/dice3_yellow.png");
  diceYellowImages[3] = await loadImage("./images/dice4_yellow.png");
  diceYellowImages[4] = await loadImage("./images/dice5_yellow.png");
  diceYellowImages[5] = await loadImage("./images/dice6_yellow.png");


  console.log("기본 Dice 이미지 6장 로드 완료");
  console.log("노란 Dice 이미지 6장 로드 완료");


  // ===================================================
  // Matter Engine
  // ===================================================

  engine = Engine.create();

  engine.gravity.x = 0;
  engine.gravity.y = 1;
  engine.gravity.scale = 0.001;


  // ===================================================
  // Walls
  // ===================================================

  let margin = 30;

  let floor = Bodies.rectangle(
    width / 2,
    height - margin / 2,
    width,
    margin,
    { isStatic: true }
  );

  let ceiling = Bodies.rectangle(
    width / 2,
    margin / 2,
    width,
    margin,
    { isStatic: true }
  );

  let leftWall = Bodies.rectangle(
    margin / 2,
    height / 2,
    margin,
    height,
    { isStatic: true }
  );

  let rightWall = Bodies.rectangle(
    width - margin / 2,
    height / 2,
    margin,
    height,
    { isStatic: true }
  );

  Composite.add(
    engine.world,
    [floor, ceiling, leftWall, rightWall]
  );


  // ===================================================
  // Collision Event
  // ===================================================

  Events.on(
    engine,
    "collisionStart",
    function (event) {

      for (let pair of event.pairs) {

        let bodyA = pair.bodyA;
        let bodyB = pair.bodyB;

        let diceA = bodyA.diceRef;
        let diceB = bodyB.diceRef;


        // 벽과의 충돌 무시
        if (
          diceA === undefined ||
          diceB === undefined
        ) {
          continue;
        }


        // 이미 merge 중이면 무시
        if (
          diceA.isMerging === true ||
          diceB.isMerging === true ||
          diceA.dead === true ||
          diceB.dead === true
        ) {
          continue;
        }


        // 같은 숫자일 때만 반응
        if (
          diceA.value !== diceB.value
        ) {
          continue;
        }


        // 상대 속도로 충돌 세기 계산
        let relativeVX =
          bodyA.velocity.x - bodyB.velocity.x;

        let relativeVY =
          bodyA.velocity.y - bodyB.velocity.y;

        let impactSpeed =
          Math.sqrt(
            relativeVX * relativeVX +
            relativeVY * relativeVY
          );

        console.log(
          "같은 Dice 충돌:",
          diceA.value,
          "/ 충돌 세기:",
          impactSpeed.toFixed(2)
        );


        if (
          impactSpeed >= SAME_DICE_IMPACT_THRESHOLD
        ) {

          let targetX =
            (bodyA.position.x + bodyB.position.x) / 2;

          let targetY =
            (bodyA.position.y + bodyB.position.y) / 2;

          let targetAngle =
            (bodyA.angle + bodyB.angle) / 2;

          let targetSize =
            (diceA.size + diceB.size) / 2;


          console.log(
            "노란색 Merge 시작 / Dice:",
            diceA.value
          );


          diceA.startMerging(
            targetX,
            targetY,
            targetAngle,
            targetSize,
            "leader"
          );

          diceB.startMerging(
            targetX,
            targetY,
            targetAngle,
            targetSize,
            "follower"
          );

        }

      }

    }
  );

}


// =====================================================
// draw
// =====================================================

function draw() {

  background(0);

  if (!engine) {
    return;
  }

  Engine.update(engine);


  // 모든 Dice update + display
  for (let d of dices) {
    d.update();
    d.display();
  }


  // dead Dice 제거
  for (let i = dices.length - 1; i >= 0; i--) {

    let d = dices[i];

    if (d.dead === true) {

      Composite.remove(
        engine.world,
        d.body
      );

      dices.splice(i, 1);
    }
  }


  // 누르고 있는 동안 Dice 계속 생성
  if (
    mouseIsPressed === true &&
    isDeleting === false
  ) {
    dices.push(
      new Dice(
        mouseX,
        mouseY,
        random(70, 110)
      )
    );
  }

}


// =====================================================
// mousePressed
// =====================================================

function mousePressed() {

  if (!engine) {
    return;
  }

  firstX = mouseX;
  isDeleting = false;


  // 기존 Dice 클릭 시 삭제
  for (let i = dices.length - 1; i >= 0; i--) {

    let d = dices[i];

    if (d.isMerging === true) {
      continue;
    }

    if (d.containsPoint(mouseX, mouseY)) {

      Composite.remove(
        engine.world,
        d.body
      );

      dices.splice(i, 1);

      isDeleting = true;

      console.log("Level 1 → 클릭 삭제");

      break;
    }
  }


  // 삭제 클릭이면 새 주사위 생성 안 함
  if (isDeleting === true) {
    return;
  }


  // 빈 공간이면 Dice 생성
  dices.push(
    new Dice(
      mouseX,
      mouseY,
      random(70, 110)
    )
  );

}


// =====================================================
// mouseReleased
// =====================================================

function mouseReleased() {

  if (!engine) {
    return;
  }

  if (isDeleting === true) {
    isDeleting = false;
    return;
  }

  let dx = mouseX - firstX;

  windForce = map(
    dx,
    -width,
    width,
    -0.08,
    0.08
  );


  for (let d of dices) {

    if (d.isMerging === true) {
      continue;
    }

    MBody.applyForce(
      d.body,
      d.body.position,
      {
        x: windForce,
        y: 0
      }
    );
  }

}


// =====================================================
// resize
// =====================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}