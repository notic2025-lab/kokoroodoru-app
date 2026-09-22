'use strict';
// Edition 02: local design demonstrations only. No APIs, authentication or storage.
(() => {
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cards = all('.specimen');
  const searchText = new Map(cards.map(card => [card, (card.textContent + ' ' + (card.dataset.keywords || '')).toLocaleLowerCase()]));
  one('#library-search').addEventListener('input', event => {
    const terms = event.target.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      card.hidden = !terms.every(term => searchText.get(card).includes(term));
      if (!card.hidden) count++;
    });
    all('.catalog > section').forEach(section => {
      section.hidden = section.hasAttribute('data-foundation') ? terms.length > 0 : !all('.specimen', section).some(card => !card.hidden);
    });
    one('#catalog-count').textContent = terms.length ? `${count} / ${cards.length}の部品` : `${cards.length}の部品・昼と夜のデザイン`;
    one('#library-empty').hidden = count !== 0;
  });
  one('#catalog-count').setAttribute('role', 'status');
  one('#catalog-count').setAttribute('aria-live', 'polite');
  all('.sidebar a').forEach(link => link.addEventListener('click', () => {
    const search = one('#library-search');
    if (search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input'));
    }
  }));
  const consent = one('[data-consent]');
  one('[data-consent-check]', consent).addEventListener('change', event => {
    one('[data-consent-next]', consent).disabled = !event.target.checked;
  });
  one('#nickname-demo').addEventListener('input', event => {
    one('#nickname-help').textContent = `${event.target.value.length} / 12文字・見本の上限です`;
    one('[data-nickname-next]').disabled = !event.target.value.trim();
  });
  all('[data-color]').forEach(button => button.addEventListener('click', () => {
    const picker = button.closest('[data-color-picker]');
    all('[data-color]', picker).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    one('.ui-color-preview', picker).style.setProperty('--avatar-color', button.dataset.color);
    one('[data-color-name]', picker).textContent = button.dataset.colorLabel;
  }));
  all('[data-nav-choice]').forEach(button => button.addEventListener('click', () => {
    all('[data-nav-choice]', button.parentElement).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    one('[data-nav-status]').textContent = `${button.textContent.trim()}を表示中〔見本〕`;
  }));
  all('[data-tabs]').forEach(group => {
    const tabs = all('[role="tab"]', group);
    const select = tab => {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') target = tabs[(index + tabs.length - 1) % tabs.length];
        if (event.key === 'Home') target = tabs[0];
        if (event.key === 'End') target = tabs[tabs.length - 1];
        if (target) { event.preventDefault(); select(target); target.focus(); }
      });
    });
  });
  one('[data-cluster]').addEventListener('click', event => {
    const list = one('[data-cluster-list]');
    list.hidden = !list.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!list.hidden));
    event.currentTarget.setAttribute('aria-label', list.hidden ? 'この付近の3件を表示' : 'この付近の3件を閉じる');
  });
  one('[data-cluster]').setAttribute('aria-expanded', 'false');
  all('[data-remove-recent]').forEach(button => button.addEventListener('click', () => {
    const group = button.closest('[data-recent]');
    const next = button.closest('.ui-recent').nextElementSibling;
    button.closest('.ui-recent').remove();
    one('[data-recent-empty]', group).hidden = all('.ui-recent', group).length > 0;
    if (next?.matches('.ui-recent')) one('button', next).focus();
    announce('検索履歴の見本から外しました。');
  }));
  all('[data-filter-chip]').forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  }));
  one('#distance-range').addEventListener('input', event => {
    one('#distance-label').textContent = `${event.target.value}m以内`;
  });
  one('[data-apply-inline-filter]').addEventListener('click', () => {
    const selected = all('[data-filter-chip][aria-pressed="true"]');
    announce(`${selected.length ? selected.map(button => button.textContent).join('・') : 'すべて'} / ${one('#distance-range').value}m以内〔見本〕`);
  });
  all('[data-schedule-day]').forEach(button => button.addEventListener('click', () => {
    all('[data-schedule-day]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const titles = {'10/10':'森の音楽会','10/11':'木立のミニライブ','10/12':'おわりの音楽会'};
    const title = one('[data-schedule-title]');
    title.replaceChildren(document.createTextNode(titles[button.dataset.scheduleDay]));
    const sub = document.createElement('small'); sub.textContent = '灯りのステージ'; title.append(sub);
  }));
  one('[data-bookmark]').addEventListener('click', event => {
    const button = event.currentTarget;
    const selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? '場所をお気に入りから外す' : '場所をお気に入りに登録');
    one('[data-bookmark-status]').textContent = selected ? 'お気に入りに追加しました〔見本〕' : 'お気に入りから外しました〔見本〕';
  });
  const photoGroup = one('[data-photo-grid]');
  const updatePhotoCount = () => {
    const count = all('.ui-thumbnail:not(.add)', photoGroup).length;
    one('[data-photo-count]', photoGroup).textContent = `${count}枚の見本写真`;
    one('[data-add-photo]', photoGroup).disabled = count >= 3;
  };
  photoGroup.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-photo]');
    if (remove) {
      remove.closest('.ui-thumbnail').remove();
      updatePhotoCount();
      one('[data-add-photo]', photoGroup).focus();
    }
    if (event.target.closest('[data-add-photo]')) {
      const item = document.createElement('div');
      item.className = 'ui-thumbnail';
      const img = document.createElement('img');
      img.src = '../forest-reference.jpeg'; img.alt = '追加された見本写真：森の灯り';
      const removeButton = document.createElement('button');
      removeButton.type = 'button'; removeButton.className = 'ui-icon'; removeButton.dataset.removePhoto = '';
      removeButton.setAttribute('aria-label', '追加した見本写真を外す'); removeButton.textContent = '×';
      item.append(img, removeButton);
      one('.ui-photo-grid', photoGroup).insertBefore(item, one('[data-add-photo]', photoGroup));
      updatePhotoCount();
    }
  });
  updatePhotoCount();
  one('#report-reason').addEventListener('change', event => {
    one('[data-report-next]').disabled = !event.target.value;
  });
  all('[data-retry]').forEach(button => button.addEventListener('click', () => {
    const previous = button.innerHTML;
    button.disabled = true; button.textContent = '確認しています…'; button.setAttribute('aria-busy', 'true');
    const status = one('[data-retry-status]', button.closest('.sample'));
    if (status) status.textContent = '処理中…';
    setTimeout(() => {
      button.innerHTML = previous; button.disabled = false; button.removeAttribute('aria-busy');
      if (status) status.textContent = '完了しました〔表示見本〕';
      announce(button.dataset.retry);
    }, 900);
  }));
  const validation = one('[data-validation]');
  const validate = () => {
    const input = one('#validation-name');
    const valid = input.value.trim().length > 0;
    input.setAttribute('aria-invalid', String(!valid));
    one('#validation-help').classList.toggle('ui-error', !valid);
    one('#validation-help').textContent = valid ? '入力できています。' : '名前を入力してください。';
    return valid;
  };
  validation.addEventListener('submit', event => {
    event.preventDefault();
    if (validate()) announce('入力内容を確認しました〔見本〕');
    else one('#validation-name').focus();
  });
  one('#validation-name').addEventListener('input', () => {
    if (one('#validation-name').hasAttribute('aria-invalid')) validate();
  });
  one('[data-undo]').addEventListener('click', event => {
    one('[data-undo-text]').textContent = 'お気に入りに戻しました';
    event.currentTarget.hidden = true;
    announce('操作を取り消しました〔見本〕');
  });
  const undoReset = one('[data-undo]').closest('.sample').querySelector('[data-feedback]');
  undoReset.addEventListener('click', () => {
    one('[data-undo-text]').textContent = 'お気に入りを外しました';
    one('[data-undo]').hidden = false;
  });
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL('./', location.href).href);
      announce('部品集のURLをコピーしました。');
    } catch { announce('コピーできませんでした。ブラウザのURLをご利用ください。'); }
  };
  all('[data-copy-link]').forEach(button => button.addEventListener('click', copyLink));

  const dialog = one('#extended-dialog');
  let trigger;
  const close = () => dialog.close();
  one('[data-close-extended]').addEventListener('click', close);
  dialog.addEventListener('close', () => trigger?.isConnected && trigger.focus());
  function show(title, body, actions = [], origin) {
    trigger = origin || document.activeElement;
    one('#extended-dialog-title').textContent = title;
    one('#extended-dialog-body').innerHTML = body;
    const footer = one('#extended-dialog-actions'); footer.replaceChildren();
    for (const action of actions.length ? actions : [{label:'閉じる',secondary:true,run:close}]) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'ui-button' + (action.secondary ? ' secondary' : '') + (action.danger ? ' danger' : '');
      button.textContent = action.label;
      button.addEventListener('click', action.run || close);
      footer.append(button);
    }
    if (!dialog.open) dialog.showModal();
    // Destructive confirmations start on the reversible action.
    const safeAction = all('button', footer).find(button => button.classList.contains('secondary'));
    (safeAction || one('[data-close-extended]')).focus();
  }
  const done = message => () => { close(); announce(message + '〔デザイン見本〕'); };
  const openDemo = (key, origin) => {
    const examples = {
      terms: ['利用にあたって','<p>正式な利用条件・プライバシーポリシーを配置するための見本です。</p><p>この部品集では、認証・位置情報取得・データ送信・永続保存を行いません。</p>'],
      discard: ['編集をやめますか？','<p>変更を保存せずに戻る操作の見本です。</p>',[{label:'編集を続ける',secondary:true},{label:'変更を破棄',danger:true,run:done('変更を破棄しました')}]],
      notifications: ['お知らせ','<div class="ui-notice"><div>森の音楽会が、まもなく始まります。<small>灯りのステージ / 10分前〔架空の見本〕</small></div></div>'],
      privacy: ['記憶を見られる人','<fieldset class="ui-privacy"><legend>公開範囲の見本</legend><label class="ui-option"><span>自分だけ</span><input type="radio" name="dialog-privacy" value="自分だけ" checked></label><label class="ui-option"><span>みんな</span><input type="radio" name="dialog-privacy" value="みんな"></label></fieldset>',[{label:'キャンセル',secondary:true},{label:'この範囲にする',run:()=>{const value=one('input[name="dialog-privacy"]:checked').value;close();announce(`${value}を選びました〔見本〕`);}}]],
      help: ['街の歩き方','<div class="ui-column"><p>1. 地図で行きたい場所を探す。</p><p>2. 場所を選んで、案内を始める。</p><p>3. 心が動いたら、記憶を残す。</p></div><p class="ui-help">説明画面の構成見本です。</p>'],
      contact: ['運営へのお問い合わせ','<label class="ui-label" for="contact-demo">お問い合わせ内容</label><textarea class="ui-textarea" id="contact-demo" maxlength="500" placeholder="お困りのことをご記入ください"></textarea><p class="ui-help">送信先を接続するための画面見本です。</p>',[{label:'閉じる',secondary:true},{label:'内容を確認',run:()=>{const value=one('#contact-demo').value.trim();if(!value){one('#contact-demo').focus();announce('お問い合わせ内容を入力してください。');return;}close();announce('お問い合わせ内容を確認しました〔見本・送信はされません〕');}}]],
      location: ['位置情報を使うには','<p>端末とブラウザで、このサイトの位置情報を許可するための案内画面です。</p><div class="ui-hint">許可できない場合も、地図を見る導線を用意します。操作案内は実装時に対象端末に合わせてください。</div><p class="ui-help">この見本では権限の要求は行いません。</p>'],
      camera: ['ARとカメラの確認','<p>カメラを許可して、AR案内へ進むための見本です。</p><div class="ui-hint">利用できないときは、通常の地図案内へ戻れます。</div><p class="ui-help">カメラの起動・権限の要求は行いません。</p>',[{label:'地図で案内',secondary:true,run:()=>openDemo('route',trigger)},{label:'閉じる'}]],
      route: ['森のキッチンまで','<div class="ui-route-stats"><div><strong>2</strong><small>分</small><span>徒歩の目安</span></div><div><strong>120</strong><small>m</small><span>距離の見本</span></div></div><div class="ui-hint">30m先、右の小道へ。<br>周囲の状況を確認してお進みください。</div>',[{label:'閉じる',secondary:true},{label:'案内を終了',run:done('案内を終了しました')}]],
      layers: ['地図の表示','<label class="ui-label" for="dialog-background">背景</label><select class="ui-select" id="dialog-background"><option>建物あり</option><option>建物なし</option></select><label class="ui-switch"><span>場所の名前</span><input type="checkbox" role="switch" checked></label><label class="ui-switch"><span>記憶の灯り</span><input type="checkbox" role="switch" checked></label>',[{label:'表示に反映',run:done('地図の表示を選びました')}]],
      filters: ['場所を絞り込む','<fieldset class="ui-privacy"><legend>カテゴリ</legend><label class="ui-check"><input type="checkbox" name="dialog-category" value="食べる">食べる</label><label class="ui-check"><input type="checkbox" name="dialog-category" value="音楽">音楽</label><label class="ui-check"><input type="checkbox" name="dialog-category" value="体験">体験</label></fieldset>',[{label:'リセット',secondary:true,run:()=>all('input[name="dialog-category"]').forEach(input=>input.checked=false)},{label:'条件を適用',run:()=>{const count=all('input[name="dialog-category"]:checked').length;one('[data-filter-count]').textContent=count;close();announce(`${count}件の条件を適用しました〔見本〕`);}}]],
      photo: ['森にともる灯り','<img src="../forest-reference.jpeg" alt="森にともる灯りの拡大見本" style="display:block;width:100%;border-radius:14px"><p class="ui-help">参照アプリの画像を使った拡大表示の見本です。</p>'],
      share: ['この灯りを、誰かにも。','<p>公開された記憶の共有シートです。<br>この見本では、部品集のURLをコピーできます。</p>',[{label:'閉じる',secondary:true},{label:'URLをコピー',run:copyLink}]],
      delete: ['この記憶を削除しますか？','<p>削除する記憶を確認してください。</p><div class="ui-hint">木漏れ日の下で、笑い声がほどけた。<br>森のキッチン / 今日 16:42</div><p class="ui-help">デザイン見本です。実際のデータは削除されません。</p>',[{label:'キャンセル',secondary:true},{label:'削除する',danger:true,run:done('削除後の状態です')}]],
      profile: ['街で呼ばれる名前','<label class="ui-label" for="dialog-name">ニックネーム</label><input class="ui-input" id="dialog-name" value="こもれび" maxlength="12"><p class="ui-help">12文字以内・表示見本の上限です。</p>',[{label:'キャンセル',secondary:true},{label:'保存',run:()=>{const value=one('#dialog-name').value.trim();if(!value){one('#dialog-name').focus();announce('名前を入力してください。');return;}close();announce(`「${value}」に変更しました〔見本・保存はされません〕`);}}]],
      logout: ['ログアウトしますか？','<p>この端末でのログイン状態を終了する操作の見本です。</p>',[{label:'キャンセル',secondary:true},{label:'ログアウト',run:done('ログアウト後の状態です')}]]
    };
    const example = examples[key];
    if (example) show(...example, ...(example.length===2?[undefined,origin]:[origin]));
  };
  all('[data-demo-dialog]').forEach(button => button.addEventListener('click', () => openDemo(button.dataset.demoDialog, button)));
  one('[data-report-next]').addEventListener('click', event => {
    const reason = one('#report-reason').value;
    const note = one('#report-note').value;
    show('報告内容を確認', `<p>理由：${escape(reason)}</p><div class="ui-hint">${escape(note || '補足なし')}</div><p class="ui-help">見本です。内容は送信されません。</p>`,[{label:'戻る',secondary:true},{label:'報告する',run:done('報告の完了画面です')}],event.currentTarget);
  });
  let authTimer;
  all('[data-auth]').forEach(button => button.addEventListener('click', () => {
    clearTimeout(authTimer);
    show(`${button.dataset.auth}を確認中`, '<div class="ui-row"><span class="ui-spinner" aria-hidden="true"></span><span class="ui-small">認証から戻るまでの表示見本です。</span></div><p class="ui-help">外部サービスには接続しません。</p>',[{label:'キャンセル',secondary:true,run:()=>{clearTimeout(authTimer);close();}}],button);
    authTimer=setTimeout(()=>{
      if(!dialog.open)return;
      one('#extended-dialog-title').textContent='街へ戻る準備ができました';
      one('#extended-dialog-body').innerHTML='<p>認証完了後に、元の画面へ戻る状態の見本です。</p><p class="ui-help">実際のログインは行っていません。</p>';
    },900);
  }));
  dialog.addEventListener('close', () => clearTimeout(authTimer));
})();
