let lollingWorld = null;
function openLolling() {
  writingMode = 'lolling'; writingOpen = true;
  document.body.classList.add('is-writing','is-lolling');
  document.getElementById('lollingView').hidden = false;
  const {Engine,Bodies,Body,Composite,Events} = Matter;
  const engine = Engine.create({gravity:{x:0,y:0,scale:0}});
  const world = lollingWorld = {engine,items:[],walls:[],queue:[],splits:new Set(),drag:null,frame:0,last:performance.now()};
  const scale = Math.min(innerWidth/520,innerHeight/760,1.25), half = 112*scale*.78;
  const home = {x:Math.max(innerWidth*.082,half+20)+30,y:innerHeight-Math.max(innerHeight*.13,half+16)-30};
  world.home=home;
  world.dice=Bodies.circle(home.x,home.y,half,{restitution:.9,friction:0,frictionAir:.035,inertia:Infinity});
  Body.setMass(world.dice,12); Composite.add(engine.world,world.dice);
  function walls() {
    world.walls.forEach(b=>Composite.remove(engine.world,b));
    world.walls=[Bodies.rectangle(innerWidth/2,-50,innerWidth+200,100,{isStatic:true,restitution:1}),Bodies.rectangle(innerWidth/2,innerHeight+50,innerWidth+200,100,{isStatic:true,restitution:1}),Bodies.rectangle(-50,innerHeight/2,100,innerHeight+200,{isStatic:true,restitution:1}),Bodies.rectangle(innerWidth+50,innerHeight/2,100,innerHeight+200,{isStatic:true,restitution:1})];
    Composite.add(engine.world,world.walls);
    if(world.heading) Composite.remove(engine.world,world.heading);
    const rect=document.querySelector('.lolling-heading').getBoundingClientRect();
    world.heading=Bodies.rectangle(rect.x+rect.width/2,rect.y+rect.height/2,rect.width+16,rect.height+16,{isStatic:true,restitution:1,friction:0});
    Composite.add(engine.world,world.heading);
  }
  world.resize=()=>{
    walls();
    const s=Math.min(innerWidth/520,innerHeight/760,1.25),h=112*s*.78;
    world.home={x:Math.max(innerWidth*.082,h+20)+30,y:innerHeight-Math.max(innerHeight*.13,h+16)-30};
    world.items.forEach(item=>{measure(item);clamp(item);});
  };
  function clamp(item){const b=item.body; Body.setPosition(b,{x:Math.max(item.w/2,Math.min(innerWidth-item.w/2,b.position.x)),y:Math.max(item.h/2,Math.min(innerHeight-item.h/2,b.position.y))});}
  function measure(item) {
    const beforeW=item.w,beforeH=item.h;
    item.el.style.fontSize=`${item.size}px`;
    item.el.style.width=`${Math.min(320,innerWidth*.38)}px`;
    item.el.style.maxHeight=`${innerHeight*.75}px`;
    // 긴 기록과 합쳐진 더미도 화면 안에서 전체 내용을 담도록 글자 크기를 조정합니다.
    while(item.el.scrollHeight>innerHeight*.75 && item.size>8){item.size-=1;item.el.style.fontSize=`${item.size}px`;}
    item.w=item.el.offsetWidth;item.h=item.el.offsetHeight;
    if(item.body) Body.scale(item.body,item.w/beforeW,item.h/beforeH);
  }
  function add(text,x,y,velocity={x:1,y:1},parts=null,size=16) {
    const el=document.createElement('div');el.className='lolling-text';el.textContent=text;el.tabIndex=0;
    document.getElementById('lollingField').append(el);
    const item={el,text,size,w:1,h:1,thrown:0,breakable:false,cooldown:0,parts:parts || [{text,size}],body:null};measure(item);
    item.body=Bodies.rectangle(x,y,item.w,item.h,{restitution:1,friction:0,frictionAir:.001,inertia:Infinity});item.body.memo=item;
    Composite.add(engine.world,item.body);world.items.push(item);clamp(item);Body.setVelocity(item.body,velocity);
    el.addEventListener('pointerdown',e=>{
      if(e.button!==0||world.drag)return;e.preventDefault();el.setPointerCapture(e.pointerId);
      const restingSize=item.size; item.breakable=false;
      item.size=Math.min(item.size*1.3,30);measure(item);clamp(item);
      world.drag={item,restingSize,id:e.pointerId,lastX:e.clientX,lastY:e.clientY,time:performance.now(),vx:0,vy:0,dx:item.body.position.x-e.clientX,dy:item.body.position.y-e.clientY};
      Body.setStatic(item.body,true);el.classList.add('held');
    });
    el.addEventListener('pointermove',e=>{
      const d=world.drag;if(!d||d.item!==item||d.id!==e.pointerId)return;
      const now=performance.now(),dt=Math.max(8,now-d.time);
      d.vx=(e.clientX-d.lastX)/dt*16.67;d.vy=(e.clientY-d.lastY)/dt*16.67;
      d.lastX=e.clientX;d.lastY=e.clientY;d.time=now;
      Body.setPosition(item.body,{x:e.clientX+d.dx,y:e.clientY+d.dy});clamp(item);
    });
    function release(e){const d=world.drag;if(!d||d.item!==item||d.id!==e.pointerId)return;
      world.drag=null;Body.setStatic(item.body,false);item.size=d.restingSize;measure(item);clamp(item);Body.setInertia(item.body,Infinity);el.classList.remove('held');
      const fresh=performance.now()-d.time<150 && e.type!=='pointercancel';
      Body.setVelocity(item.body,{x:fresh?Math.max(-14,Math.min(14,d.vx)):0,y:fresh?Math.max(-14,Math.min(14,d.vy)):0});
      item.thrown=fresh&&Math.hypot(d.vx,d.vy)>1?performance.now()+1800:0;
      item.breakable=item.parts.length>1 && item.thrown>0;
    }
    el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
    return item;
  }
  walls();
  writingNotes.forEach((note,i)=>add(note.text,100+Math.random()*Math.max(1,innerWidth-200),180+Math.random()*Math.max(1,innerHeight-300),{x:(Math.random()-.5)*2,y:(Math.random()-.5)*2}));
  document.getElementById('lollingEmpty').hidden=writingNotes.length>0;
  Events.on(engine,'collisionStart collisionActive',event=>{
    for(const pair of event.pairs){const a=pair.bodyA.memo,b=pair.bodyB.memo;
      for(const [item,other] of [[a,pair.bodyB],[b,pair.bodyA]]) {
        if(item && item.breakable && item.parts.length>1 && world.drag?.item!==item && (other===world.dice || world.walls.includes(other))) world.splits.add(item);
      }
      if(a&&b && a.cooldown<performance.now() && b.cooldown<performance.now() && world.drag?.item!==a && world.drag?.item!==b && (a.thrown>performance.now()||b.thrown>performance.now()))world.queue.push([a,b]);
    }
  });
  function tick(now){if(lollingWorld!==world)return;
    const dt=Math.min(16.667,now-world.last);world.last=now;
    Body.applyForce(world.dice,world.dice.position,{x:(world.home.x-world.dice.position.x)*.00007,y:(world.home.y-world.dice.position.y)*.00007});
    Engine.update(engine,dt);
    for(const item of world.splits) {
      if(!world.items.includes(item))continue;
      const {x,y}=item.body.position, v=item.body.velocity;
      Composite.remove(engine.world,item.body);item.el.remove();world.items.splice(world.items.indexOf(item),1);
      item.parts.forEach((part,i)=>{
        const angle=2*Math.PI*i/item.parts.length;
        const piece=add(part.text,x+Math.cos(angle)*80,y+Math.sin(angle)*80,{x:v.x*.25+Math.cos(angle)*5,y:v.y*.25+Math.sin(angle)*5},null,part.size);
        piece.cooldown=performance.now()+700;
      });
    }world.splits.clear();
    for(const [a,b] of world.queue){if(!world.items.includes(a)||!world.items.includes(b))continue;
      const pos={x:(a.body.position.x+b.body.position.x)/2,y:(a.body.position.y+b.body.position.y)/2},v={x:(a.body.velocity.x+b.body.velocity.x)/2,y:(a.body.velocity.y+b.body.velocity.y)/2};
      for(const item of [a,b]){Composite.remove(engine.world,item.body);item.el.remove();world.items.splice(world.items.indexOf(item),1);}
      const merged=add(a.text+'\n\n'+b.text,pos.x,pos.y,v,[...a.parts,...b.parts]);
      merged.cooldown=performance.now()+300;
    }world.queue=[];
    world.items.forEach(item=>{const p=item.body.position;item.el.style.transform=`translate(${p.x-item.w/2}px,${p.y-item.h/2}px)`;});
    world.frame=requestAnimationFrame(tick);
  }
  window.addEventListener('resize',world.resize);world.frame=requestAnimationFrame(tick);
}
function closeLolling(){const w=lollingWorld;if(w){cancelAnimationFrame(w.frame);window.removeEventListener('resize',w.resize);Matter.Composite.clear(w.engine.world,false);Matter.Engine.clear(w.engine);}lollingWorld=null;
 document.getElementById('lollingField').replaceChildren();document.getElementById('lollingView').hidden=true;document.body.classList.remove('is-lolling','is-writing');writingOpen=false;document.querySelector('.instruction').hidden=false;document.querySelector('.face-button[data-face="6"]').focus();
}
document.addEventListener('DOMContentLoaded',()=>document.getElementById('lollingClose').addEventListener('click',closeLolling));
