'use strict';
(() => {
  const section=document.querySelector('[aria-labelledby="ar-navigation"]');
  const iframe=section.querySelector('iframe');
  const lighting=window.KokoroLighting;
  let mode='auto';
  function sync(sendToExperience=true) {
    const minute=lighting.minutesAt();
    const state=lighting.resolve(mode,minute);
    section.dataset.lighting=state;
    section.querySelectorAll('.ar4-sample').forEach(sample=>{
      sample.classList.toggle('lighting-day',state==='day');
      sample.classList.toggle('lighting-night',state==='night');
    });
    section.querySelectorAll('[data-ar-light-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.arLightMode===mode)));
    section.querySelector('[data-ar-light-status]').textContent=`${mode==='auto'?'自動':'手動'} · ${state==='day'?'昼のひかり':'夜のひかり'} / 日本時間 ${lighting.formatTime(minute)}`;
    if(sendToExperience) iframe.contentWindow?.postMessage({type:'kokoro-lighting',mode},location.origin);
  }
  section.querySelectorAll('[data-ar-light-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.arLightMode;sync();}));
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.themeChoice==='night'?'night':'day';sync();}));
  iframe.addEventListener('load',()=>sync());
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==iframe.contentWindow||event.data?.type!=='kokoro-lighting-state'||!['auto','day','night'].includes(event.data.mode))return;
    mode=event.data.mode;sync(false);
  });
  setInterval(()=>sync(false),15000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
  document.querySelector('[data-presence-still]')?.addEventListener('change', event => {
    section.classList.toggle('is-still',event.target.checked);
    announce(event.target.checked ? '部品見本の動きを静止しました。' : '部品見本の動きを再開しました。');
  });
  document.querySelector('[data-presence-contrast]')?.addEventListener('change', event => {
    document.querySelector('.ar4-setting-preview').style.background=event.target.checked?'#152a1c':'';
  });
  document.querySelector('.ar-jump')?.addEventListener('click',()=>{
    const search=document.querySelector('#library-search');
    if(search.value){search.value='';search.dispatchEvent(new Event('input'));}
  });
  sync(false);
})();
