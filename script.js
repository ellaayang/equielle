/* Equielle website scripts: tabs, gallery viewer, playable demo, breathing pacer */
(function(){
  function $(id){return document.getElementById(id);}
  var reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* flip cards */
  document.querySelectorAll('.card').forEach(function(card){
    function toggle(){var f=card.classList.toggle('is-flipped');card.setAttribute('aria-expanded',f?'true':'false');}
    card.addEventListener('click',toggle);
    card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    card.addEventListener('mouseleave',function(){card.classList.remove('is-flipped');card.setAttribute('aria-expanded','false');});
  });

  /* tabs, shared nav bar, scroll progress */
  var sticky=$('sticky'),prog=$('progress'),hero=document.querySelector('.hero'),footRidge=$('foot-ridge'),tabsEl=$('tabs');
  var panes=[].slice.call(document.querySelectorAll('[data-tab]'));
  var tabLinks=[].slice.call(sticky.querySelectorAll('[data-tab-link]'));
  var current='home';
  function tabOf(el){var pn=el&&el.closest?el.closest('[data-tab]'):null;return pn?pn.getAttribute('data-tab'):null;}
  function onScroll(){
    var y=window.scrollY||document.documentElement.scrollTop||0;
    sticky.classList.toggle('over',current==='home'&&y<hero.offsetHeight-90);
    var max=document.documentElement.scrollHeight-window.innerHeight;
    prog.style.transform='scaleX('+(max>0?Math.min(1,y/max):0)+')';
  }
  function measure(){
    var was=sticky.classList.contains('over');
    sticky.classList.remove('over');
    document.documentElement.style.setProperty('--navh',sticky.offsetHeight+'px');
    if(was)sticky.classList.add('over');
  }
  function jumpTop(){
    var root=document.documentElement,old=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';window.scrollTo(0,0);root.style.scrollBehavior=old;
  }
  function showTab(name,target){
    current=name;
    var first=null,lastPane=null;
    panes.forEach(function(pn){
      var on=pn.getAttribute('data-tab')===name;
      pn.hidden=!on;
      if(on){if(!first)first=pn;lastPane=pn;}
    });
    tabLinks.forEach(function(a){
      var on=a.getAttribute('data-tab-link')===name;
      a.classList.toggle('active',on);
      if(on){a.setAttribute('aria-current','page');tabsEl.scrollLeft=a.offsetLeft-tabsEl.clientWidth/2+a.offsetWidth/2;}
      else a.removeAttribute('aria-current');
    });
    document.body.classList.toggle('inner',name!=='home');
    footRidge.className='foot-ridge'+(lastPane.classList.contains('calm')?' dark':lastPane.classList.contains('soft')?' soft':'');
    if(target&&target!==first){target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}
    else jumpTop();
    onScroll();
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a[href^="#"]'):null;
    if(!a)return;
    var id=a.getAttribute('href').slice(1),el=id?$(id):null,t=tabOf(el);
    if(!t)return;
    e.preventDefault();
    showTab(t,el);
    try{history.replaceState(null,'','#'+id);}catch(err){}
  });
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){measure();onScroll();});
  measure();
  function fromHash(){
    var id=(location.hash||'').slice(1),el=id?$(id):null,t=tabOf(el);
    showTab(t||'home',t?el:null);
  }
  window.addEventListener('hashchange',fromHash);
  fromHash();

  /* gallery viewer */
  var lb=$('lightbox'),lbi=$('lightbox-img'),cap=$('lb-cap'),shots=[].slice.call(document.querySelectorAll('.shot button')),cur=0,last=null;
  function show(i){
    cur=(i+shots.length)%shots.length;
    var img=shots[cur].querySelector('img'),name=shots[cur].parentNode.querySelector('strong');
    lbi.src=img.src;lbi.alt=img.alt;
    cap.textContent=(name?name.textContent+' · ':'')+(cur+1)+' / '+shots.length;
  }
  function closeLb(){lb.hidden=true;if(last)last.focus();}
  shots.forEach(function(b,i){b.addEventListener('click',function(){last=b;show(i);lb.hidden=false;$('lb-close').focus();});});
  $('lb-prev').addEventListener('click',function(){show(cur-1);});
  $('lb-next').addEventListener('click',function(){show(cur+1);});
  lbi.addEventListener('click',function(){show(cur+1);});
  $('lb-close').addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb();});
  document.addEventListener('keydown',function(e){
    if(lb.hidden)return;
    if(e.key==='Escape')closeLb();
    else if(e.key==='ArrowLeft')show(cur-1);
    else if(e.key==='ArrowRight')show(cur+1);
  });

  /* playable demo */
  var stage=$('stage'),fx=$('fx'),statusEl=$('demo-status'),won=$('won'),horse=$('hit-horse');
  var S={apple:0,water:0,brush:0};
  var P={muzzle:[54.5,51],head:[52.4,36],apple:[55.7,55.4],water:[83.9,65.7]};
  var HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8 3.2C20 15.8 12 21 12 21Z" fill="#a4c2f4" stroke="#ffffff" stroke-width="1.2"/></svg>';
  var START='The horse is waiting. Start wherever you like.';
  function say(t){if(statusEl.textContent!==t)statusEl.textContent=t;}
  function put(cls,x,y,html,life){
    if(reduce)return null;
    var e=document.createElement('span');
    e.className=cls;e.style.left=x+'%';e.style.top=y+'%';
    if(html)e.innerHTML=html;
    fx.appendChild(e);
    setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},life||1600);
    return e;
  }
  function heart(){put('heart',P.head[0]+(Math.random()*6-3),P.head[1],HEART,1600);}
  function render(){
    ['apple','water','brush'].forEach(function(k){
      var b=$('act-'+k),v=Math.round(S[k]);
      b.querySelector('.bar i').style.width=v+'%';
      b.querySelector('em').textContent=v+'%';
      b.classList.toggle('full',v>=100);
      $('spot-'+k).hidden=v>=100;
    });
    if(S.apple>=100&&S.water>=100&&S.brush>=100&&won.hidden){
      won.hidden=false;
      say('Every job is done. You earned a ribbon for this session.');
    }
  }
  function feed(){
    if(S.apple>=100){say('The apples are all gone.');return;}
    S.apple=Math.min(100,S.apple+50);
    var a=put('apple',P.apple[0],P.apple[1],'',800);
    if(a&&a.animate){a.animate([
      {left:P.apple[0]+'%',top:P.apple[1]+'%',transform:'scale(1)',opacity:1},
      {left:P.muzzle[0]+'%',top:P.muzzle[1]+'%',transform:'scale(.35)',opacity:0}
    ],{duration:750,easing:'ease-in',fill:'forwards'});}
    heart();
    say(S.apple<100?'Crunch. One apple down, one to go.':'Both apples are gone. That is one happy horse.');
    render();
  }
  function water(){
    if(S.water>=100){say('The trough is already full.');return;}
    S.water=S.water>=66?100:S.water+34;
    put('ripple',P.water[0],P.water[1],'',1000);
    if(S.water>=100)heart();
    say(S.water<100?'The trough is filling with fresh water.':'Fresh water, right to the brim.');
    render();
  }
  function brush(amt,x,y){
    if(S.brush>=100)return;
    S.brush=Math.min(100,S.brush+amt);
    if(x!=null)put('spark',x,y,'',800);
    if(S.brush>=100)heart();
    say(S.brush>=100?'Groomed from mane to tail.':S.brush>=50?'The coat is starting to shine.':'Long, slow strokes along the coat.');
    render();
  }
  $('act-apple').addEventListener('click',feed);
  $('spot-apple').addEventListener('click',feed);
  $('act-water').addEventListener('click',water);
  $('spot-water').addEventListener('click',water);
  $('act-brush').addEventListener('click',function(){
    if(S.brush>=100){say('The coat is already gleaming.');return;}
    [[14,58],[27,52],[40,60]].forEach(function(p){put('spark',p[0],p[1],'',800);});
    brush(20);
  });
  var down=false,prev=null,lastSpark=0;
  function rel(e){
    var r=stage.getBoundingClientRect(),fxp=(e.clientX-r.left)/r.width,fyp=(e.clientY-r.top)/r.height;
    return {x:fxp*100,y:fyp*100,u:fxp*1174,v:fyp*794};
  }
  horse.addEventListener('pointerdown',function(e){e.preventDefault();down=true;prev=rel(e);brush(5,prev.x,prev.y);});
  horse.addEventListener('pointermove',function(e){
    if(!down)return;
    if(document.elementFromPoint(e.clientX,e.clientY)!==horse){prev=null;return;}
    var p=rel(e);
    if(!prev){prev=p;return;}
    var d=Math.sqrt((p.u-prev.u)*(p.u-prev.u)+(p.v-prev.v)*(p.v-prev.v));
    prev=p;
    var now=Date.now(),sp=now-lastSpark>80;
    if(sp)lastSpark=now;
    brush(d/30,sp?p.x:null,sp?p.y:null);
  });
  horse.addEventListener('pointerenter',function(e){if(down)prev=rel(e);});
  ['pointerup','pointercancel'].forEach(function(t){window.addEventListener(t,function(){down=false;prev=null;});});
  function resetDemo(){S.apple=0;S.water=0;S.brush=0;won.hidden=true;say(START);render();}
  $('reset').addEventListener('click',resetDemo);
  $('again').addEventListener('click',resetDemo);

  /* breathing pacer */
  var bb=$('breathe'),orb=bb.querySelector('.orb'),bl=$('breathe-label'),bt=null,breathing=false;
  function phase(inhale){
    if(!breathing)return;
    bl.textContent=inhale?'Breathe in':'Breathe out';
    orb.style.transitionDuration=(reduce?0:(inhale?4:6))+'s';
    orb.style.transform=inhale?'scale(1.26)':'scale(1)';
    bt=setTimeout(function(){phase(!inhale);},inhale?4000:6000);
  }
  bb.addEventListener('click',function(){
    breathing=!breathing;
    bb.setAttribute('aria-pressed',breathing?'true':'false');
    clearTimeout(bt);
    if(breathing){phase(true);}
    else{orb.style.transitionDuration='.6s';orb.style.transform='scale(1)';bl.textContent='Breathe with your horse';}
  });
})();
