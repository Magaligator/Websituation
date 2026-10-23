/*! © 2026 Websituation — Magali Tshikudi Kabondo, Cologny (Genève) · Tous droits réservés · https://www.websituation.ch */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;

  /* barre de progression */
  const prog = $('.prog');
  const onScroll = () => {
    const h = document.documentElement;
    prog.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu mobile */
  const burger = $('.burger'), nav = $('.nav');
  burger?.addEventListener('click', () => {
    const o = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!o)); nav.classList.toggle('open', !o);
  });

  /* apparitions */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));

  /* compteurs */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1300, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick); cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(c => cio.observe(c));

  /* mot rotatif */
  const rot = $('.rot');
  if (rot && !reduce) {
    const words = JSON.parse(rot.dataset.words), cols = ['var(--blue)', 'var(--red)', 'var(--green)', 'var(--orange)'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      rot.classList.remove('swap'); void rot.offsetWidth;
      rot.textContent = words[i]; rot.style.background = cols[i % cols.length];
      rot.style.color = (i % 4 === 2 || i % 4 === 3) ? 'var(--ink)' : '#fff';
      rot.classList.add('swap');
    }, 2300);
  }

  /* ===== cube 3D interactif ===== */
  const stage = $('.stage'), cube = $('.cube');
  if (stage && cube) {
    const COL = { f: '#2958e6', b: '#28c54c', r: '#ff1716', l: '#f98305', t: '#FEFE26', d: '#f4f4f4' };
    const cubies = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const el = document.createElement('div'); el.className = 'cubie';
      const faces = { f: z === 1, b: z === -1, r: x === 1, l: x === -1, t: y === -1, d: y === 1 };
      for (const k of 'fbrltd') {
        const f = document.createElement('div'); f.className = 'face f-' + k;
        if (faces[k]) f.style.setProperty('--c', COL[k]);
        el.appendChild(f);
      }
      cube.appendChild(el);
      cubies.push({ el, m: new DOMMatrix().translate(x, y, z) }); // position en unités
    }
    let S = parseFloat(getComputedStyle(cube).getPropertyValue('--s')) || 100;
    const apply = (c, extra) => {
      const m = extra ? extra.multiply(c.m) : c.m;
      c.el.style.transform = `matrix3d(${m.m11},${m.m12},${m.m13},${m.m14},${m.m21},${m.m22},${m.m23},${m.m24},${m.m31},${m.m32},${m.m33},${m.m34},${m.m41 * S},${m.m42 * S},${m.m43 * S},${m.m44})`;
    };
    const render = () => cubies.forEach(c => apply(c));
    render();
    addEventListener('resize', () => { S = parseFloat(getComputedStyle(cube).getPropertyValue('--s')) || 100; render(); });

    let busy = false;
    const twist = () => {
      if (busy || reduce) return; busy = true;
      const ax = [[1, 0, 0], [0, 1, 0], [0, 0, 1]][Math.floor(Math.random() * 3)];
      const layer = Math.random() < .5 ? -1 : 1, dir = Math.random() < .5 ? -1 : 1;
      const idx = ax.indexOf(1);
      const sel = cubies.filter(c => Math.round([c.m.m41, c.m.m42, c.m.m43][idx]) === layer);
      const t0 = performance.now(), dur = 750;
      const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const step = t => {
        const p = Math.min((t - t0) / dur, 1), a = 90 * dir * ease(p);
        const R = new DOMMatrix().rotateAxisAngleSelf(ax[0], ax[1], ax[2], a);
        sel.forEach(c => apply(c, R));
        if (p < 1) requestAnimationFrame(step);
        else {
          const R90 = new DOMMatrix().rotateAxisAngleSelf(ax[0], ax[1], ax[2], 90 * dir);
          sel.forEach(c => {
            const n = R90.multiply(c.m), r = v => Math.round(v * 1e6) / 1e6;
            c.m = new DOMMatrix([r(n.m11), r(n.m12), r(n.m13), r(n.m14), r(n.m21), r(n.m22), r(n.m23), r(n.m24), r(n.m31), r(n.m32), r(n.m33), r(n.m34), Math.round(n.m41), Math.round(n.m42), Math.round(n.m43), 1]);
            apply(c);
          });
          busy = false;
        }
      };
      requestAnimationFrame(step);
    };

    // rotation globale : souris / glisser / inertie
    let rx = -24, ry = -32, tx = rx, ty = ry, drag = false, lx = 0, ly = 0, moved = 0, visible = true, last = 0;
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(stage);
    stage.addEventListener('pointerdown', e => { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => {
      if (drag) {
        const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
        ty += dx * .45; tx = Math.max(-80, Math.min(80, tx - dy * .45));
      } else if (fine) {
        const r = stage.getBoundingClientRect();
        tx = -24 + ((e.clientY - r.top) / r.height - .5) * -26; ty += ((e.clientX - r.left) / r.width - .5) * .6;
      }
    });
    const up = () => { if (drag && moved < 6) twist(); drag = false; };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', () => drag = false);
    const loop = t => {
      if (visible) {
        if (!drag && !reduce) ty += .22;
        rx += (tx - rx) * .08; ry += (ty - ry) * .08;
        cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (!reduce && t - last > 3800) { last = t; twist(); }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* démo multi-écrans */
  /* démo multi-écrans : le site maquette garde la largeur réelle de l'écran choisi (1024 / 768 / 375 px),
     puis est réduit pour tenir dans la zone : le changement reste visible même sur téléphone */
  const dev = $('.dev'), mock = $('.mock', dev || document);
  if (dev && mock) {
    const W = { desktop: 1024, tablet: 768, mobile: 375 };
    const fit = () => {
      const avail = dev.parentElement.clientWidth - 52, w = W[dev.dataset.d] || 1024, k = Math.min(1, avail / w);
      mock.style.width = w + 'px'; mock.style.transform = `scale(${k})`;
      mock.style.marginLeft = Math.max(0, (dev.clientWidth - w * k) / 2) + 'px';
      dev.style.height = Math.ceil(mock.offsetHeight * k + 12) + 'px';
    };
    $$('.seg button').forEach(b => b.addEventListener('click', () => {
      $$('.seg button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); dev.dataset.d = b.dataset.d; fit();
    }));
    fit(); addEventListener('resize', fit); addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* étapes (process) */
  const steps = $$('.step');
  if (steps.length) {
    const sio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('on', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    steps.forEach(s => sio.observe(s));
  }

  /* explorateur de services */
  const tabs = $$('.xp__tab');
  if (tabs.length) {
    const panel = $('.xp__panel'), panes = $$('.xp__pane');
    const sel = i => {
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
      panes.forEach((p, k) => p.classList.toggle('on', k === i));
      panel.dataset.c = tabs[i].dataset.c;
    };
    const reduceXp = matchMedia('(prefers-reduced-motion: reduce)').matches;
    tabs.forEach((t, i) => t.addEventListener('click', () => {
      sel(i);
      /* panneau sous les onglets (mobile/tablette) : on y glisse doucement pour que le contenu soit évident */
      if (panel.getBoundingClientRect().top > t.getBoundingClientRect().bottom - 4) {
        panel.scrollIntoView({ behavior: reduceXp ? 'auto' : 'smooth', block: 'start' });
      }
      panel.classList.remove('ping'); void panel.offsetWidth; panel.classList.add('ping');
    }));
    const h = location.hash.replace('#', ''), k = tabs.findIndex(t => t.dataset.id === h);
    sel(k >= 0 ? k : 0);
  }

  /* projets : filtres, tilt, fenêtre détail */
  const projs = $$('.proj');
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
    const f = b.dataset.f;
    projs.forEach(p => p.classList.toggle('hide', f !== 'all' && !p.dataset.cat.split(' ').includes(f)));
  }));
  if (fine) projs.forEach(p => p.addEventListener('pointerenter', () => $$('img.rgb[data-src]', p).forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); }), { once: true }));
  if (fine && !reduce) projs.forEach(p => {
    const card = $('.proj__card', p), frame = $('.proj__frame', p);
    p.addEventListener('pointermove', e => {
      const r = p.querySelector('.proj__stage').getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
      frame.style.setProperty('--gx', `${-120 + (x + .5) * 140}%`);
    });
    p.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
  projs.forEach(p => p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); } }));
  const dlg = $('dialog.pdlg');
  if (dlg) {
    projs.forEach(p => p.addEventListener('click', () => {
      $('.pdlg__img img', dlg).src = p.dataset.img; $('.pdlg__img img', dlg).alt = p.dataset.alt;
      $('.pdlg__cat', dlg).textContent = p.dataset.catl; $('.pdlg__t', dlg).textContent = p.dataset.title;
      $('.pdlg__d', dlg).textContent = p.dataset.desc; $('.pdlg__tags', dlg).innerHTML = p.dataset.tags.split('|').map(t => `<span class="tag">${t}</span>`).join('');
      dlg.showModal();
    }));
    $('.pdlg__x', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }

  /* quiz abonnement */
  const quiz = $('.quiz');
  if (quiz) {
    const qs = $$('.quiz__q', quiz), dots = $$('.quiz__dots i', quiz), res = $('.quiz__res', quiz);
    const ans = [];
    const show = n => { qs.forEach((q, i) => q.hidden = i !== n); dots.forEach((d, i) => d.classList.toggle('on', i <= n)); };
    show(0);
    $$('.opt', quiz).forEach(o => o.addEventListener('click', () => {
      const qi = +o.closest('.quiz__q').dataset.q; ans[qi] = o.dataset.v;
      if (qi < qs.length - 1) show(qi + 1);
      else {
        qs.forEach(q => q.hidden = true); dots.forEach(d => d.classList.add('on'));
        const key = (ans[1] === 'a' && ans[0] === 'c') ? 'pro' : { a: 'free', b: 'pro', c: 'flex' }[ans[1]];
        $$('[data-res]', res).forEach(r => r.hidden = r.dataset.res !== key);
        res.hidden = false;
        $$('.plan').forEach(p => p.classList.toggle('plan--rec', p.dataset.plan === key));
        $('.quiz__reset', quiz).hidden = false;
      }
    }));
    $('.quiz__reset', quiz).addEventListener('click', () => {
      ans.length = 0; res.hidden = true; $('.quiz__reset', quiz).hidden = true;
      $$('.plan').forEach(p => p.classList.remove('plan--rec')); show(0);
    });
  }

  /* tableaux défilants : flèches gauche/droite quand le contenu dépasse (utile sur mobile) */
  $$('.tbl-w').forEach(t => {
    const fr = document.documentElement.lang === 'fr';
    const wrap = document.createElement('div'); wrap.className = 'tbl-wrap';
    t.parentNode.insertBefore(wrap, t); wrap.appendChild(t);
    const mk = (dir) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tbl-arr tbl-arr--' + dir;
      b.setAttribute('aria-label', dir === 'r' ? (fr ? 'Voir la suite du tableau' : 'Scroll table right') : (fr ? 'Revenir au début du tableau' : 'Scroll table left'));
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (dir === 'r' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7') + '"/></svg>';
      b.addEventListener('click', () => t.scrollBy({ left: (dir === 'r' ? 1 : -1) * Math.max(160, t.clientWidth * .6), behavior: reduce ? 'auto' : 'smooth' }));
      wrap.appendChild(b);
    };
    mk('l'); mk('r');
    const upd = () => {
      const max = t.scrollWidth - t.clientWidth;
      wrap.classList.toggle('can-l', t.scrollLeft > 4);
      wrap.classList.toggle('can-r', max > 4 && t.scrollLeft < max - 4);
    };
    t.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(upd);
  });

  /* formulaire de contact : envoi via /api/contact (Resend) ; repli sur la messagerie si l'envoi échoue */
  const cf = $('form[data-api]');
  if (cf) {
    const ok = $('.ok', cf), btn = $('button[type=submit]', cf);
    // horodatage (anti-robot) et pré-sélection de la formule : contact.html?formule=pmepro
    cf.elements.t.value = Date.now();
    const slugs = { 'presque-free': 'Presque Free', pmepro: 'PMEPro', flexipro: 'FlexiPro' };
    const wanted = (new URLSearchParams(location.search).get('formule') || '').toLowerCase();
    if (slugs[wanted]) {
      cf.elements.formule.value = wanted;
      const t = $('[data-formule-target]', cf); if (t) t.checked = true;
      const note = $('.formule-note', cf); if (note) { note.textContent = cf.dataset.formuleLabel + ' ' + slugs[wanted]; note.hidden = false; }
    }
    const show = (msg, err) => { ok.textContent = msg; ok.classList.toggle('is-err', !!err); ok.hidden = false; ok.focus({ preventScroll: false }); };
    const fallback = () => {
      const lines = [], svc = $$('input[name=svc]:checked', cf).map(c => c.value);
      if (svc.length) lines.push(cf.dataset.lsvc + ' : ' + svc.join(', '));
      $$('[data-label]', cf).forEach(el => { const v = el.value.trim(); if (v) lines.push(el.dataset.label + ' : ' + v); });
      return 'mailto:' + cf.dataset.mailto + '?subject=' + encodeURIComponent(cf.dataset.subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    };
    cf.addEventListener('submit', async e => {
      e.preventDefault();
      if (!cf.checkValidity()) { cf.reportValidity(); return; }
      const payload = {
        nom: cf.elements.nom.value, email: cf.elements.email.value, tel: cf.elements.tel.value, msg: cf.elements.msg.value,
        svc: $$('input[name=svc]:checked', cf).map(c => c.value), formule: cf.elements.formule.value,
        website: cf.elements.website.value, t: cf.elements.t.value, lang: cf.dataset.lang
      };
      btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      try {
        const r = await fetch(cf.dataset.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) {
          show(cf.dataset.ok.replace('{name}', payload.nom.trim().split(/\s+/)[0]), false);
          cf.reset(); cf.elements.t.value = Date.now(); if (slugs[wanted]) cf.elements.formule.value = wanted;
        } else if (j.errors) {
          show(Object.values(j.errors).join(' '), true);
        } else { throw new Error('send'); }
      } catch (err) {
        show(cf.dataset.err, true);
        const a = document.createElement('a'); a.href = fallback(); a.textContent = ' ' + cf.dataset.mailto; ok.append(a);
      } finally { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    });
  }
})();

/* aperçu print : slider avant-gardiste (scroll-snap + inclinaison 3D + compteur) */
(() => {
  const root = document.querySelector('.pk');
  if (!root) return;
  const track = root.querySelector('.pk__track'), slides = [...root.querySelectorAll('.pk__s')];
  const cnt = root.querySelector('.pk__cnt b'), bar = root.querySelector('.pk__prog i');
  let raf = 0, cur = -1;
  const upd = () => {
    raf = 0;
    const tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2;
    let best = 0, bd = 1e9;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / r.width;
      s.style.setProperty('--d', Math.max(-1.6, Math.min(1.6, d)).toFixed(3));
      s.style.setProperty('--a', Math.min(1, Math.abs(d)).toFixed(3));
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
    });
    const max = track.scrollWidth - track.clientWidth;
    bar.style.transform = 'scaleX(' + Math.max(.06, track.scrollLeft / Math.max(1, max)).toFixed(3) + ')';
    if (best !== cur) {
      cur = best;
      cnt.textContent = String(best + 1).padStart(2, '0');
      root.dataset.acc = slides[best].dataset.acc;
    }
  };
  const q = () => { if (!raf) raf = requestAnimationFrame(upd); };
  track.addEventListener('scroll', q, { passive: true });
  addEventListener('resize', q);
  root.querySelectorAll('.pk__b').forEach(b => b.addEventListener('click', () => {
    const w = slides[0].getBoundingClientRect().width + 24;
    track.scrollBy({ left: +b.dataset.d * w, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
  /* glisser à la souris */
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); }
    if (moved) track.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false;
    if (moved) { track.classList.remove('drag'); }
  });
  /* clic sur une diapositive : la centre */
  slides.forEach(s => s.addEventListener('click', () => { if (!moved) s.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }));
  upd();
})();

/* démo multi-écrans : un vrai site (lebod.ch) vu sur desktop, tablette et mobile */
(() => {
  const box = document.querySelector('.dvx'), btns = [...document.querySelectorAll('.seg button')];
  if (!box || !btns.length) return;
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    box.dataset.d = b.dataset.d;
  }));
})();
