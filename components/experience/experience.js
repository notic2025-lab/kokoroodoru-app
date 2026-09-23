'use strict';
// Explicit storyboard only. No position sensor, camera, fabricated tracking or persistence.
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const embedded = params.get('embed') === '1';
  document.documentElement.classList.toggle('is-embedded', embedded);
  if (embedded) $('.field-exit').target = '_top';
  const field = $('#experience');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let stage = 0;
  let material = 'water';
  let lost = false;
  let memory = false;
  let announcementTimer;
  const lighting = window.KokoroLighting;
  let lightingMode = ['auto','day','night'].includes(params.get('mode')) ? params.get('mode') : 'auto';
  let testMinute = null;
  function applyLighting() {
    const minute = testMinute ?? lighting.minutesAt();
    const resolved = lighting.resolve(lightingMode,minute);
    document.documentElement.dataset.lighting=resolved;
    field.dataset.lighting=resolved;
    document.querySelector('meta[name="theme-color"]').content=resolved==='day'?'#eeeae1':'#14231d';
    $$('[data-light-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lightMode===lightingMode)));
    const label=resolved==='day'?'昼':'夜';
    const clock=lighting.formatTime(minute);
    const source=testMinute===null?'日本時間':'確認用の時刻';
    const status=lightingMode==='auto'?`自動 · ${label}の表示 / ${source} ${clock}`:`${label}に固定 / 日本時間 ${clock}`;
    $$('[data-light-status]').forEach(el=>{if(el.textContent!==status)el.textContent=status;});
    $('#clock-feedback').textContent=testMinute===null?'端末の時計を日本時間に換算して判定しています。':`${clock}の判定を確認中。現在時刻の自動更新は停止しています。`;
    $('#light-principle').textContent=resolved==='day'?'夜と同じ細い光。昼は光の芯を少し太く、その下に薄い陰影を添えて、明るい景色でも見えるように。':'夜は細い流れと、地面に広がる光。同じ目印の輪郭がほどけて、街の灯りになります。';
    $('.field-entry .field-kicker').textContent=resolved==='day'?'この道に、街のしるし。':'この道に、街の灯り。';
    $('.field-entry>p:not(.field-kicker)').textContent=resolved==='day'?'光の流れる先へ、出かけてみませんか。':'灯りの流れる先へ、出かけてみませんか。';
    if(embedded) parent.postMessage({type:'kokoro-lighting-state',mode:lightingMode},location.origin);
  }
  function chooseLighting(mode) {lightingMode=mode;testMinute=null;applyLighting();}
  $$('[data-light-mode]').forEach(button=>button.addEventListener('click',()=>chooseLighting(button.dataset.lightMode)));
  $('#apply-time').addEventListener('click',()=>{
    const minute=lighting.parseTime($('#test-time').value);
    if(minute===null){$('#clock-feedback').textContent='確認したい時刻を入力してください。';$('#test-time').focus();return;}
    testMinute=minute;lightingMode='auto';applyLighting();
  });
  $('#live-time').addEventListener('click',()=>chooseLighting('auto'));
  $('#bright-background').addEventListener('change',event=>field.classList.toggle('is-bright-background',event.target.checked));
  // Re-check on foreground return and every 15 seconds; manual selection is kept.
  setInterval(()=>{if(testMinute===null)applyLighting();},15000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&testMinute===null)applyLighting();});
  window.addEventListener('focus',()=>{if(testMinute===null)applyLighting();});
  if(embedded) window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='kokoro-lighting'||!['auto','day','night'].includes(event.data.mode))return;
    chooseLighting(event.data.mode);
  });
  const places = {
    water: {name:'待ち合わせの泉',element:'水',index:'01',hint:'水が湧き、輪が重なる。人が集まる場所の目印。',description:'人が集まり、また街へ向かう場所。遠くでは小さな光、近づくと水の流れが立ち上がり、足元に輪が広がります。',arrival:'画面を下ろして、\n待っている人を見つけよう。'},
    ember: {name:'喫煙所',element:'熾火',index:'02',hint:'低く揺らぐ、琥珀の光。立ち止まる場所に小さなぬくもり。',description:'喫煙所を示す、小さな熾火。地面を燃やす表現は使わず、限られた場所にだけ低い光を置きます。名称を添えて、実際の火との違いを示します。',arrival:'ひと息つける場所です。\n現地の案内を確かめて、ひと休み。'},
    sound: {name:'森のステージ',element:'共鳴',index:'03',hint:'水平にひろがる、薄い波。人と音が響き合う場所。',description:'音が空間へ広がる気配を、薄い波の重なりで表します。いま鳴っている音楽へ、視線と気持ちをつなぐ目印。見本の動きは音声には連動していません。',arrival:'画面を下ろして、\nここで鳴っている音を聴こう。'},
    steam: {name:'森のキッチン',element:'湯気',index:'04',hint:'細い線が、上へほどける。あたたかい食べものの気配。',description:'湯気のような細い線が、ゆっくり上へほどけていきます。料理そのものを描かず、食の場所にある温度を表します。',arrival:'おいしそうな香りの方へ。\n今日の一皿を見つけよう。'},
    portal: {name:'街の入口',element:'光の境界',index:'05',hint:'薄い輪郭を越える。いま、街の中へ入るという感覚。',description:'実際の入口の手前に、光の薄い境界を重ねる案。門を巨大な壁にせず、向こうの風景が見えるまま、入る瞬間をつくります。',arrival:'ここから、こころ踊る街。\n気になる方へ、歩き出そう。'},
    memory: {name:'記憶の木立',element:'残り灯',index:'06',hint:'そこにいた誰かの気配。小さな灯りが、ゆっくり留まる。',description:'同じ場所にいた人の記憶が、小さな灯りとして留まる案。光の数を抑え、木々や人の姿が見える余白を残します。プレビューの灯りは架空です。',arrival:'同じ場所にいた、誰かの気配。\nあなたも、ひとつ灯りを。'}
  };
  const moments = [
    '景色と目印の関係を最初に見せる。昼も夜も、流れる灯りが案内を始める。',
    '昼も夜も、先へ流れる細い光。道順は同じでも、背景に合う見せ方を選ぶ。',
    '昼も夜も、同じ形の光で場所を示す。名前・輪郭・動く方向を共通にして迷わせない。',
    '光の道と距離表示を消す。案内の終わりを、実際の場所や人に出会う始まりにする。'
  ];
  function announce(text) {
    clearTimeout(announcementTimer);
    $('.field-announcement').textContent = text;
    announcementTimer = setTimeout(() => { $('.field-announcement').textContent = ''; }, 4200);
  }
  function render() {
    const place = places[material];
    field.dataset.stage = String(stage);
    field.dataset.material = material;
    field.classList.toggle('is-lost', lost);
    field.classList.toggle('has-memory', memory && stage === 3 && !lost);
    $$('.material').forEach(el => { el.style.display = el.classList.contains(`material-${material}`) ? '' : 'none'; });
    $('.field-entry').hidden = stage !== 0 || lost;
    $('.field-guidance').hidden = ![1,2].includes(stage) || lost;
    $('.field-arrival').hidden = stage !== 3 || lost;
    $('.tracking-message').hidden = !lost;
    $('#field-label').textContent = stage === 0 ? 'こころ踊る街' : place.name;
    $('#field-meta').textContent = lost ? '位置を確認中' : ['散策のはじまり','目的地まで 60m','目的地まで 12m','道案内を終えました'][stage];
    $('#world-name').textContent = place.name;
    $('#arrival-title').textContent = place.name;
    $('#arrival-copy').replaceChildren(...place.arrival.split('\n').flatMap((text,i) => i ? [document.createElement('br'),document.createTextNode(text)] : [document.createTextNode(text)]));
    $('#guidance-eyebrow').textContent = stage === 2 ? '目印のすぐそばまで' : '次の曲がり角まで';
    $('#guidance-main').innerHTML = stage === 2 ? 'もうすぐ <b>12<small>m</small></b>' : 'まっすぐ <b>20<small>m</small></b>';
    $('.direction').textContent = stage === 2 ? '↗' : '↑';
    $('#guidance-sub').textContent = stage === 2 ? `${place.element}の気配が目印です` : 'その先、左の小道へ';
    $('#leave-memory').disabled = memory;
    $('#leave-memory').textContent = memory ? 'この場所に、あなたの灯り。' : 'ここに、小さな灯りを残す ＋';
    $('#place-title').textContent = place.name;
    $('#place-description').textContent = place.description;
    $('#material-index').textContent = `${place.index} / ${place.element}`;
    $('#material-hint').textContent = place.hint;
    $('#map-title').textContent = `${place.name}${stage === 3 ? 'に到着' : 'へ'}`;
    $('.map-guidance').textContent = lost ? '周囲の目印と、現在地を確かめてください。' : stage === 3 ? '目的地です。現地の案内も確認してください。' : stage === 2 ? `あと12m。${place.element}の気配が目印です。` : 'まっすぐ20m。その先の左の小道へ。';
    $('#scene-position').innerHTML = `0${stage+1} <span>/ 04</span>`;
    $('#previous').disabled = stage === 0;
    $('#next').innerHTML = stage === 3 ? '最初から <span>↶</span>' : '次の場面へ <span>→</span>';
    $('#attention-number').textContent = `0${stage+1} — 視線の設計`;
    $('#attention-copy').textContent = moments[stage];
    $$('[data-moment]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.moment) === stage)));
  }
  function goTo(next) {
    const wasInField = field.contains(document.activeElement);
    stage = next; lost = false;
    if (stage === 0) memory = false;
    clearTimeout(announcementTimer); $('.field-announcement').textContent = '';
    render();
    if (wasInField) $('#next').focus({preventScroll:true});
  }
  $('#enter').addEventListener('click', () => goTo(1));
  $('#next').addEventListener('click', () => goTo((stage+1)%4));
  $('#previous').addEventListener('click', () => goTo(Math.max(0,stage-1)));
  $$('[data-moment]').forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.moment))));
  $('#place-select').addEventListener('change', event => { material = event.target.value; memory = false; render(); });
  const dialogTriggers = new WeakMap();
  function openDialog(id, trigger) { const dialog = $(id); dialogTriggers.set(dialog,trigger); dialog.showModal(); }
  for (const dialog of $$('dialog')) dialog.addEventListener('close', () => {
    const trigger=dialogTriggers.get(dialog);
    if (trigger && !trigger.closest('[hidden]')) trigger.focus({preventScroll:true}); else $('#next').focus({preventScroll:true});
  });
  $('#open-settings').addEventListener('click', event => openDialog('#settings-dialog',event.currentTarget));
  for (const button of [$('#open-map'),$('#arrival-map'),$('#tracking-map')]) button.addEventListener('click', () => openDialog('#map-dialog',button));
  $('#landmark-info').addEventListener('click', event => openDialog('#place-dialog',event.currentTarget));
  $('#leave-memory').addEventListener('click', () => {memory=true;render();announce('小さな灯りを置きました。表示の見本・保存はされません。');});
  $('#lose-position').addEventListener('click', () => {lost=true;$('#settings-dialog').close();render();$('#tracking-map').focus({preventScroll:true});});
  $('#recover').addEventListener('click', () => {lost=false;render();$('#open-settings').focus({preventScroll:true});});
  $('#reality-toggle').addEventListener('click', event => {
    const real=!field.classList.contains('is-reality');field.classList.toggle('is-reality',real);
    event.currentTarget.setAttribute('aria-pressed',String(real));
    event.currentTarget.firstChild.textContent=real?'ARを重ねる ':'実景と見比べる ';
    $('.reality-label').hidden=!real;
    for(const el of $$('.field-header,.field-entry,.field-guidance,.field-arrival,.tracking-message')) el.inert=real;
  });
  $('#strong-labels').addEventListener('change', e=>field.classList.toggle('is-solid',e.target.checked));
  const setStill=value=>{field.classList.toggle('is-still',value);$('#reduce-motion').checked=value;};
  $('#reduce-motion').addEventListener('change', e=>setStill(e.target.checked));
  media.addEventListener('change', e=>setStill(e.matches));
  setStill(media.matches);
  // Embed uses the same public scenes. No postMessage or parent state access is required.
  if(embedded) stage=2;
  if(/^[0-3]$/.test(params.get('scene')||'')) stage=Number(params.get('scene'));
  applyLighting();
  render();
})();
