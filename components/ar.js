'use strict';
// Component-level preview preferences; the immersive study is self-contained.
(() => {
  document.querySelector('[data-presence-still]')?.addEventListener('change', event => {
    document.querySelector('[aria-labelledby="ar-navigation"]').classList.toggle('is-still',event.target.checked);
    announce(event.target.checked ? '部品見本の光を静止しました。' : '部品見本の光を再開しました。');
  });
  document.querySelector('[data-presence-contrast]')?.addEventListener('change', event => {
    document.querySelector('.ar4-setting-preview').style.background=event.target.checked?'#152a1c':'';
  });
  document.querySelector('.ar-jump')?.addEventListener('click',()=>{
    const search=document.querySelector('#library-search');
    if(search.value){search.value='';search.dispatchEvent(new Event('input'));}
  });
})();
