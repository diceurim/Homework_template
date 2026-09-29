const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const MBody = Matter.Body;

let engine;
let dices = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // Matter setting
  engine = Engine.create();

  // 아래로 떨어지는 중력
  engine.gravity.x = 0;
  engine.gravity.y = 1;
  engine.gravity.scale = 0.001;

  // walls
  let wallThickness = 80;
  let floorThickness = 80;
  let margin = 20;

  Composite.add(engine.world, [
    // 바닥
    Bodies.rectangle(width / 2, height - margin, width, margin, {
      isStatic: true,
    }),

    // 천장
    Bodies.rectangle(width / 2, margin, width, margin, {
      isStatic: true,
    }),

    // 왼쪽 벽
    Bodies.rectangle(margin, height / 2, margin, height, {
      isStatic: true,
    }),

    // 오른쪽 벽
    Bodies.rectangle(
      width - wallThickness,
      height / 2,
      margin,
      height,
      {
        isStatic: true,
      }
    ),
  ]);

  // ---------------------------
  // 주사위 5개 한 번에 생성
  // ---------------------------

  let diceCount = 5;

  for (let i = 0; i < diceCount; i++) {

    // 두 종류를 번갈아 배치
    let diceType = i % 2;

    // 종류 1 = 주사위 2
    // 종류 2 = 주사위 3
    let diceValue = diceType === 0 ? 2 : 3;

    // 색상도 종류에 따라 다르게
    let diceColor = diceType === 0
      ? "#f1f1f1"
      : "#7f7f7f";

    let dice = Bodies.rectangle(
      width / 2 - 180 + i * 90,
      40 + (i % 2) * 80,
      100,
      100,
      {
        density: 0.0003,
        restitution: 0.9,
        friction: 0.4,
        frictionAir: 0.003,

        fill: diceColor,
        strokeFill: "#000000",

        chamfer: {
          radius: 15,
        },
      }
    );

    // 주사위 종류 정보 저장
    dice.diceValue = diceValue;

    // 배열에 추가
    dices.push(dice);
  }

  Composite.add(engine.world, dices);
}


function draw() {
  background("#d1d1d1");

  Engine.update(engine);


  // ---------------------------
  // 바람 구간
  // ---------------------------

  if (frameCount > 150 && frameCount < 200) {

    for (let dice of dices) {
      applyWind(dice, 0.012);
    }

  }


  // ---------------------------
  // draw dice
  // ---------------------------

  for (let dice of dices) {

    // dice 몸체
    beginShape();

    fill(dice.fill);
    stroke(dice.strokeFill);
    strokeWeight(2);

    for (let v of dice.vertices) {
      vertex(v.x, v.y);
    }

    endShape(CLOSE);


    // dice 주사위 눈
    push();

    translate(
      dice.position.x,
      dice.position.y
    );

    rotate(dice.angle);

    fill("#1A1A1A");
    noStroke();


    // 주사위 2
    if (dice.diceValue === 2) {
      circle(-22, -22, 20);
      circle(22, 22, 20);
    }


    // 주사위 3
    if (dice.diceValue === 3) {
      circle(-22, -22, 18);
      circle(0, 0, 18);
      circle(22, 22, 18);
    }

    pop();
  }
}


// ---------------------------
// 바람 함수
// ---------------------------

function applyWind(body, strength) {
  MBody.applyForce(
    body,

    {
      x: body.position.x,
      y: body.position.y - 30,
    },

    {
      x: strength,
      y: -strength * 0.35,
    }
  );
}