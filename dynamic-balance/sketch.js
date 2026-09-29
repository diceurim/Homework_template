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

  // 첫 번째 주사위
  let dice01 = Bodies.rectangle(
    width / 2 - 180,
    120,
    100,
    100,
    {
      density: 0.0005,
      restitution: 0.75,
      friction: 0.4,
      frictionAir: 0.003,

      fill: "#c1c1c1",
      strokeFill: "#000000",

      chamfer: {
        radius: 15,
      },
    }
  );

  dice01.diceValue = 2;


  // 두 번째 주사위
  let dice02 = Bodies.rectangle(
    width / 2 - 90,
    40,
    100,
    100,
    {
      density: 0.0005,
      restitution: 0.75,
      friction: 0.4,
      frictionAir: 0.003,

      fill: "#c1c1c1",
      strokeFill: "#000000",

      chamfer: {
        radius: 15,
      },
    }
  );

  dice02.diceValue = 3;


  // 세 번째 주사위
  let dice03 = Bodies.rectangle(
    width / 2,
    100,
    100,
    100,
    {
      density: 0.0005,
      restitution: 0.75,
      friction: 0.4,
      frictionAir: 0.003,

      fill: "#c1c1c1",
      strokeFill: "#000000",

      chamfer: {
        radius: 15,
      },
    }
  );

  dice03.diceValue = 2;


  // 네 번째 주사위
  let dice04 = Bodies.rectangle(
    width / 2 + 90,
    20,
    100,
    100,
    {
      density: 0.0005,
      restitution: 0.75,
      friction: 0.4,
      frictionAir: 0.003,

      fill: "#c1c1c1",
      strokeFill: "#000000",

      chamfer: {
        radius: 15,
      },
    }
  );

  dice04.diceValue = 3;


  // 다섯 번째 주사위
  let dice05 = Bodies.rectangle(
    width / 2 + 180,
    80,
    100,
    100,
    {
      density: 0.0005,
      restitution: 0.75,
      friction: 0.4,
      frictionAir: 0.003,

      fill: "#c1c1c1",
      strokeFill: "#000000",

      chamfer: {
        radius: 15,
      },
    }
  );

  dice05.diceValue = 2;


  // 배열에 넣기
  dices.push(dice01);
  dices.push(dice02);
  dices.push(dice03);
  dices.push(dice04);
  dices.push(dice05);

  Composite.add(engine.world, dices);
}


function draw() {
  background("#ebebeb");

  Engine.update(engine);


  // ---------------------------
  // 바람 구간
  // ---------------------------

  if (frameCount > 150 && frameCount < 200) {

    for (let dice of dices) {
      applyWind(dice, 0.009);
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