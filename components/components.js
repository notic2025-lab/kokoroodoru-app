'use strict';
// Demonstration interactions only. No location, photo, or memory data is saved.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const toast = $('.toast');
let toastTimer;
function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
$$('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
  document.documentElement.dataset.theme = button.dataset.themeChoice;
  $$('[data-theme-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('meta[name="theme-color"]').content = button.dataset.themeChoice === 'night' ? '#172b24' : '#faf8ef';
}));
$$('[data-width]').forEach(button => button.addEventListener('click', () => {
  $('.catalog').classList.toggle('mobile', button.dataset.width === 'mobile');
  $$('[data-width]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
for (const selector of ['[data-category]', '[data-pin]']) {
  $$(selector).forEach(button => button.addEventListener('click', () => {
    $$(selector, button.parentElement).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
}
$$('[data-toggle]').forEach(button => button.addEventListener('click', () => {
  button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
}));
$$('[data-feedback]').forEach(button => button.addEventListener('click', () => announce(button.dataset.feedback)));
$('#memory-text').addEventListener('input', event => {
  $('#memory-count').textContent = `${event.target.value.length} / 500文字`;
});
const dialog = $('#confirm-dialog');
let dialogTrigger;
$$('[data-open-dialog]').forEach(button => button.addEventListener('click', () => {
  dialogTrigger = button;
  dialog.showModal();
}));
$('#confirm-cancel').addEventListener('click', () => dialog.close());
$('#confirm-save').addEventListener('click', () => {
  dialog.close();
  announce('灯りを残しました。〔表示見本・保存はされません〕');
});
dialog.addEventListener('close', () => dialogTrigger?.focus());
$$('.copy').forEach(button => button.addEventListener('click', async () => {
  const sample = $('.sample', button.closest('.specimen')).cloneNode(true);
  // Unique form identifiers keep snippets safe to paste together more than once.
  const suffix = `-${Date.now().toString(36)}`;
  const idMap = new Map();
  $$('[id]', sample).forEach(element => {
    idMap.set(element.id, element.id + suffix);
    element.id += suffix;
  });
  $$('*', sample).forEach(element => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith('data-')) element.removeAttribute(attribute.name);
    }
    for (const attribute of ['for', 'aria-describedby', 'aria-labelledby']) {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, element.getAttribute(attribute).split(' ').map(id => idMap.get(id) || id).join(' '));
    }
    if (element.matches('input[type="radio"]')) element.name += suffix;
    if (element.matches('button')) element.type = 'button';
    if (element.matches('img')) element.src = new URL(element.getAttribute('src'), location.href).href;
  });
  const source = '<!-- Requires components.css. Static design markup; connect actions in your app. -->\n' + sample.innerHTML.trim();
  try {
    await navigator.clipboard.writeText(source);
    announce('HTMLをコピーしました。共通CSSと一緒に使えます。');
  } catch {
    announce('コピーできませんでした。ページ下部の「ソースを見る」から取得できます。');
  }
}));
