class Dice {

  // ===================================================
  // constructor
  // ===================================================

  constructor(x, y, size) {

    this.x = x;
    this.y = y;
    this.size = size;

    // 1 ~ 6 랜덤 숫자
    this.value = floor(random(1, 7));


    // =================================================
    // Merge 상태
    // =================================================

    this.isMerging = false;
    this.mergeRole = null;

    this.mergeStartTime = 0;
    this.mergeDuration = 900;
    this.mergeProgress = 0;

    this.mergeStartX = 0;
    this.mergeStartY = 0;
    this.mergeStartAngle = 0;
    this.mergeStartSize = this.size;

    this.mergeTargetX = 0;
    this.mergeTargetY = 0;
    this.mergeTargetAngle = 0;
    this.mergeTargetSize = this.size;

    this.dead = false;


    // =================================================
    // Matter Body
    // =================================================

    this.body = Matter.Bodies.rectangle(
      this.x,
      this.y,
      this.size,
      this.size,
      {
        density: 0.0005,
        restitution: 0.7,
        friction: 0.4,
        frictionAir: 0.003,
        chamfer: {
          radius: this.size * 0.12
        }
      }
    );

    this.body.diceRef = this;

    Matter.Composite.add(
      engine.world,
      this.body
    );
  }



  // ===================================================
  // startMerging
  // ===================================================

  startMerging(
    targetX,
    targetY,
    targetAngle,
    targetSize,
    role
  ) {

    if (this.isMerging === true) {
      return;
    }

    this.isMerging = true;
    this.mergeRole = role;

    this.mergeStartTime = millis();

    this.mergeStartX = this.body.position.x;
    this.mergeStartY = this.body.position.y;
    this.mergeStartAngle = this.body.angle;
    this.mergeStartSize = this.size;

    this.mergeTargetX = targetX;
    this.mergeTargetY = targetY;
    this.mergeTargetAngle = targetAngle;
    this.mergeTargetSize = targetSize;


    // 물리 운동 멈춤
    Matter.Body.setVelocity(
      this.body,
      { x: 0, y: 0 }
    );

    Matter.Body.setAngularVelocity(
      this.body,
      0
    );

    this.body.isSensor = true;

    Matter.Body.setStatic(
      this.body,
      true
    );
  }



  // ===================================================
  // update
  // ===================================================

  update() {

    if (this.isMerging === false) {
      return;
    }

    let elapsed =
      millis() - this.mergeStartTime;

    this.mergeProgress = constrain(
      elapsed / this.mergeDuration,
      0,
      1
    );

    if (this.mergeProgress >= 1) {
      this.dead = true;
    }
  }



  // ===================================================
  // display
  // ===================================================

  display() {

    let drawX = this.body.position.x;
    let drawY = this.body.position.y;
    let drawAngle = this.body.angle;
    let drawSize = this.size;
    let drawAlpha = 255;


    // =================================================
    // Merge 중일 때 애니메이션
    // =================================================

    if (this.isMerging === true) {

      let p = this.mergeProgress;

      let moveProgress = constrain(
        p / 0.65,
        0,
        1
      );

      let easeMove =
        1 - Math.pow(1 - moveProgress, 3);

      drawX = lerp(
        this.mergeStartX,
        this.mergeTargetX,
        easeMove
      );

      drawY = lerp(
        this.mergeStartY,
        this.mergeTargetY,
        easeMove
      );

      drawAngle = lerp(
        this.mergeStartAngle,
        this.mergeTargetAngle,
        easeMove
      );

      drawSize = lerp(
        this.mergeStartSize,
        this.mergeTargetSize,
        easeMove
      );


      // follower는 leader 쪽으로 빨려 들어가면서 사라짐
      if (this.mergeRole === "follower") {

        let followerFade = constrain(
          (moveProgress - 0.45) / 0.55,
          0,
          1
        );

        drawAlpha =
          255 * (1 - followerFade);
      }


      // leader는 남아서 마지막에 사라짐
      if (this.mergeRole === "leader") {
        drawAlpha = 255;
      }


      // 후반부에 하나로 합쳐진 뒤 사라짐
      if (p > 0.65) {

        let disappearProgress = map(
          p,
          0.65,
          1,
          0,
          1
        );

        disappearProgress = constrain(
          disappearProgress,
          0,
          1
        );

        if (this.mergeRole === "leader") {

          drawAlpha =
            255 * (1 - disappearProgress);

          drawSize =
            this.mergeTargetSize *
            (1 - disappearProgress);
        }

        if (this.mergeRole === "follower") {
          drawAlpha = 0;
        }
      }
    }


    // =================================================
    // 어떤 이미지를 그릴지 결정
    //
    // 평소: 기본 이미지
    // merge 중: 노란색 이미지
    // =================================================

    let imageIndex = this.value - 1;

    let img;

    if (this.isMerging === true) {
      img = diceYellowImages[imageIndex];
    } else {
      img = diceImages[imageIndex];
    }


    // =================================================
    // Drawing
    // =================================================

    push();

    translate(drawX, drawY);
    rotate(drawAngle);

    imageMode(CENTER);

    tint(255, drawAlpha);

    image(
      img,
      0,
      0,
      drawSize,
      drawSize
    );

    noTint();

    pop();
  }



  // ===================================================
  // containsPoint
  // ===================================================

  containsPoint(px, py) {

    if (this.isMerging === true) {
      return false;
    }

    let point = {
      x: px,
      y: py
    };

    return Matter.Vertices.contains(
      this.body.vertices,
      point
    );
  }

}