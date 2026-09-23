'use strict';
// Visual design simulator only. These values never consume or infer real position.
(() => {
  const lab = document.querySelector('[data-ar-lab]');
  if (!lab) return;
  const one = selector => lab.querySelector(selector);
  const all = selector => Array.from(lab.querySelectorAll(selector));
  const viewport = one('[data-ar-viewport]');
  const distanceInput = one('#ar-distance');
  const motifs = {
    fountain: {name:'待ち合わせの泉',short:'泉',color:'#a7f4e2',copy:'地面から湧く光の泉が、待ち合わせの目印。近づくと、水の輪がゆっくり広がります。'},
    flame: {name:'喫煙所',short:'小さな炎',color:'#ffd48c',copy:'小さな琥珀の炎が、喫煙所の目印。場所の名前と一緒に、控えめな光で示します。'},
    sound: {name:'灯りのステージ',short:'音の波紋',color:'#d7c8ff',copy:'空気に浮かぶ音の波紋が、音楽の場所を知らせます。音を鳴らさず、ゆっくり呼吸するように。'},
    steam: {name:'森のキッチン',short:'湯気',color:'#f6d9a5',copy:'風景に溶けるやわらかな湯気。あたたかい一杯が待っている場所の目印です。'},
    portal: {name:'街の入口',short:'光の門',color:'#c6f5d8',copy:'細い光の輪郭が、街への入口をつくります。現実の通り道を残して、その先への期待を添えます。'},
    fireflies: {name:'記憶の木立',short:'蛍の灯り',color:'#edc579',copy:'ここで生まれた記憶が、小さな光として集まります。琥珀はみんなの記憶、淡い緑は自分だけの記憶。'}
  };
  let motif = 'fountain';
  let state = 'navigating';
  let distance = 60;
  let paused = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  one('[data-ar-reduce]').checked = reducedMotion.matches;
  lab.classList.toggle('ar-reduced', reducedMotion.matches);
  function render() {
    const active = motifs[motif];
    viewport.style.setProperty('--ar-accent', active.color);
    viewport.style.setProperty('--ar-object-scale', String(.67 + (120-distance)/120*.49));
    viewport.classList.toggle('is-near', state === 'near');
    viewport.classList.toggle('is-arrived', state === 'arrived');
    viewport.classList.toggle('is-uncertain', state === 'uncertain');
    all('[data-ar-world]').forEach(element => { element.hidden = element.dataset.arWorld !== motif; });
    all('[data-ar-motif]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.arMotif === motif)));
    all('[data-ar-state]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.arState === state)));
    distanceInput.value = String(distance);
    one('[data-ar-distance-output]').textContent = `${distance}m`;
    one('[data-ar-destination]').textContent = active.name;
    one('[data-ar-label-distance]').textContent = state === 'arrived' ? '到着' : `${distance}m`;
    one('[data-ar-info-title]').textContent = active.name;
    one('[data-ar-info-copy]').textContent = active.copy;
    one('[data-ar-info]').setAttribute('aria-label', `${active.name}の演出について`);
    one('[data-ar-info]').disabled = state === 'uncertain';
    one('[data-ar-info]').setAttribute('aria-expanded', String(!one('[data-ar-info-panel]').hidden));
    one('[data-ar-tracking]').hidden = state !== 'uncertain';
    one('[data-ar-leave]').hidden = state !== 'arrived';
    one('[data-ar-remaining]').textContent = state === 'arrived' ? 'ARRIVED' : `目的地まで ${distance}m`;
    one('[data-ar-step]').textContent = state === 'arrived' ? '案内完了' : state === 'near' ? 'もうすぐ目的地' : '区間 1 / 3';
    one('[data-ar-status]').textContent = state === 'uncertain' ? '位置を確認しています' : state === 'arrived' ? '目的地に到着' : '位置を合わせました';
    one('[data-ar-instruction]').textContent = state === 'arrived' ? '到着しました' : state === 'near' ? `あと ${distance}m、目印のそばへ` : state === 'uncertain' ? '立ち止まって確認' : `まっすぐ ${Math.min(20,distance)}m`;
    one('[data-ar-next]').textContent = state === 'arrived' ? `ここは、${active.name}。` : state === 'near' ? `${active.short}が目印です` : state === 'uncertain' ? '周囲の目印と、地図を確かめる' : 'その先、左の小道へ';
    one('[data-ar-demo-status]').textContent = state === 'uncertain' ? '測位不良の見本：空間の目印を消し、位置確認と地図への導線を表示。' : state === 'arrived' ? `到着の見本：${active.name}の光が広がり、記憶を残す操作へ。` : `${active.short}を目印に、${state==='near'?'もうすぐ到着':'まっすぐ20m'}。目的地まで${distance}m。`;
  }
  all('[data-ar-motif]').forEach(button => button.addEventListener('click', () => {
    motif = button.dataset.arMotif;
    state = 'navigating'; distance = 60;
    one('[data-ar-info-panel]').hidden = true;
    // Use the selected motif's icon in the destination badge.
    one('.ar-destination-icon').replaceChildren(button.querySelector('svg').cloneNode(true));
    render();
  }));
  all('[data-ar-state]').forEach(button => button.addEventListener('click', () => {
    state = button.dataset.arState;
    if (state === 'navigating') distance = 60;
    if (state === 'near') distance = 12;
    if (state === 'arrived') distance = 0;
    one('[data-ar-info-panel]').hidden = true;
    render();
  }));
  distanceInput.addEventListener('input', () => {
    distance = Number(distanceInput.value);
    // A UI-only storyboard threshold, never a real-world arrival decision.
    state = distance === 0 ? 'arrived' : distance <= 18 ? 'near' : 'navigating';
    one('[data-ar-info-panel]').hidden = true;
    render();
  });
  one('[data-ar-realign]').addEventListener('click', () => {
    state = 'navigating'; distance = 60; render();
    one('[data-ar-info]').focus();
  });
  one('[data-ar-dusk]').addEventListener('change', event => viewport.classList.toggle('is-dusk', event.target.checked));
  one('[data-ar-reduce]').addEventListener('change', event => lab.classList.toggle('ar-reduced', event.target.checked));
  one('[data-ar-contrast]').addEventListener('change', event => viewport.classList.toggle('is-solid-hud', event.target.checked));
  reducedMotion.addEventListener('change', event => {
    one('[data-ar-reduce]').checked = event.matches;
    lab.classList.toggle('ar-reduced', event.matches);
  });
  one('[data-ar-pause]').addEventListener('click', event => {
    paused = !paused;
    lab.classList.toggle('ar-paused', paused);
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.setAttribute('aria-label', paused ? 'AR演出を再開' : 'AR演出を一時停止');
    one('[data-ar-demo-status]').textContent = paused ? 'ARの光の動きを一時停止しました。' : 'ARの光の動きを再開しました。';
  });
  one('[data-ar-info]').addEventListener('click', () => {
    one('[data-ar-info-panel]').hidden = false;
    one('[data-ar-info]').setAttribute('aria-expanded', 'true');
    one('[data-ar-close-info]').focus();
  });
  const closeInfo = () => { one('[data-ar-info-panel]').hidden = true; one('[data-ar-info]').setAttribute('aria-expanded', 'false'); one('[data-ar-info]').focus(); };
  one('[data-ar-close-info]').addEventListener('click', closeInfo);
  one('[data-ar-info-panel]').addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeInfo(); } });
  const localReduce = document.querySelector('[data-ar-local-reduce]');
  localReduce.addEventListener('change', event => {
    one('[data-ar-reduce]').checked = event.target.checked;
    lab.classList.toggle('ar-reduced', event.target.checked);
    announce('ARプレビューの動きの設定を変更しました。');
  });
  document.querySelector('[data-ar-local-contrast]').addEventListener('change', event => {
    const preview = document.querySelector('[data-ar-setting-preview]');
    preview.style.background = event.target.checked ? '#122a22' : '';
    one('[data-ar-contrast]').checked = event.target.checked;
    viewport.classList.toggle('is-solid-hud', event.target.checked);
  });
  document.querySelector('.ar-jump').addEventListener('click', () => {
    const search = document.querySelector('#library-search');
    if (search.value) { search.value = ''; search.dispatchEvent(new Event('input')); }
  });
  render();
})();
