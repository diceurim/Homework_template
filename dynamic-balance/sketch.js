const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const MBody = Matter.Body;

let engine;
let dice01, dice02;

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
    Bodies.rectangle(width - wallThickness, height / 2, margin, height, {
      isStatic: true,
    }),
  ]);

  // dice01 = 주사위 2
  dice01 = Bodies.rectangle(width / 2 - 90, 120, 100, 100, {
    density: 0.0005,
    restitution: 0.75,
    friction: 0.4,
    frictionAir: 0.003,
    fill: "#ffffff",
    strokeFill: "#ffffff",
    chamfer: {
      radius: 15,
    },
    label: "dice01",
  });

  // dice02 = 주사위 3
  dice02 = Bodies.rectangle(width / 2 + 90, 40, 100, 100, {
    density: 0.0005,
    restitution: 0.75,
    friction: 0.4,
    frictionAir: 0.003,
    fill: "#c1c1c1",
    strokeFill: "#c1c1c1",
    strokeWeight:(2),
    chamfer: {
      radius: 15,
    },
    label: "dice02",
  });

  Composite.add(engine.world, [dice01, dice02]);
}

function draw() {
  background("#1A1A1A");
  Engine.update(engine);

  // ---------------------------
  // 바람 구간
  // 180프레임~320프레임 동안만 바람 작동
  // ---------------------------
  if (frameCount > 150 && frameCount < 200) {
    applyWind(dice01, 0.007);
    applyWind(dice02, 0.012);
  }

  // -------------------
  // Dice01 몸체
  // -------------------
  beginShape();
  fill(dice01.fill);
  stroke(dice01.strokeFill);
  strokeWeight(2);

  for (let i = 0; i < dice01.vertices.length; i++) {
    let x = dice01.vertices[i].x;
    let y = dice01.vertices[i].y;
    vertex(x, y);
  }
  endShape(CLOSE);

  // dice01 주사위 눈 = 2
  push();
  translate(dice01.position.x, dice01.position.y);
  rotate(dice01.angle);

  fill("#1A1A1A");
  noStroke();
  circle(-22, -22, 20);
  circle(22, 22, 20);
  pop();

  // -------------------
  // Dice02 몸체
  // -------------------
  beginShape();
  fill(dice02.fill);
  stroke(dice02.strokeFill);
  strokeWeight(2);

  for (let v of dice02.vertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);

  // dice02 주사위 눈 = 3
  push();
  translate(dice02.position.x, dice02.position.y);
  rotate(dice02.angle);

  fill("#1A1A1A");
  noStroke();
  circle(-22, -22, 18);
  circle(0, 0, 18);
  circle(22, 22, 18);
  pop();
}

// 바람 함수
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