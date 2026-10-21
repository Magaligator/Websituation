'use strict';
/**
 * POST /api/contact — formulaire de contact Websituation (fonction Vercel + Resend).
 *
 * Variables d'environnement (Vercel > Settings > Environment Variables) :
 *   RESEND_API_KEY  clé API Resend (obligatoire)
 *   CONTACT_TO      adresse qui reçoit les demandes (défaut : contact@websituation.ch)
 *   CONTACT_FROM    expéditeur vérifié dans Resend (défaut : Websituation <contact@websituation.ch>)
 *
 * Le domaine websituation.ch doit être vérifié dans Resend (SPF + DKIM, et DMARC recommandé).
 * Ne jamais modifier les enregistrements MX (messagerie Infomaniak).
 */

const MAX_BODY = 20000;
const SERVICES = {
  fr: ['Un site internet', 'Référencement', 'Print', 'Campagnes', 'Abonnement'],
  en: ['A website', 'SEO', 'Print', 'Campaigns', 'A plan'],
};
const FORMULES = { 'presque-free': 'Presque Free', pmepro: 'PMEPro', flexipro: 'FlexiPro' };
const T = {
  fr: {
    name: 'Merci d’indiquer votre nom.',
    email: 'Merci d’indiquer une adresse e-mail valide.',
    phone: 'Le numéro de téléphone semble invalide.',
    msg: 'Votre message est trop long (5 000 caractères maximum).',
    send: 'L’envoi a échoué. Réessayez dans un instant ou écrivez-nous à contact@websituation.ch.',
    method: 'Méthode non autorisée.',
    subjectOwner: 'Nouvelle demande de consultation',
    subjectUser: 'Websituation : nous avons bien reçu votre demande',
  },
  en: {
    name: 'Please enter your name.',
    email: 'Please enter a valid e-mail address.',
    phone: 'The phone number looks invalid.',
    msg: 'Your message is too long (5,000 characters maximum).',
    send: 'Sending failed. Please try again in a moment or write to us at contact@websituation.ch.',
    method: 'Method not allowed.',
    subjectOwner: 'New consultation request',
    subjectUser: 'Websituation: we received your request',
  },
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// supprime les caractères de contrôle ; oneLine retire aussi les retours à la ligne (en-têtes d'e-mail)
const clean = (v, max) =>
  String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');

function parseBody(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch (e) { b = Object.fromEntries(new URLSearchParams(b)); }
  }
  return b && typeof b === 'object' ? b : {};
}

function validate(raw) {
  const lang = raw.lang === 'en' ? 'en' : 'fr';
  const t = T[lang];
  const errors = {};
  const nom = oneLine(raw.nom, 100);
  const email = oneLine(raw.email, 200);
  const tel = oneLine(raw.tel, 40);
  const msg = clean(raw.msg, 5001);
  let svc = Array.isArray(raw.svc) ? raw.svc : raw.svc ? [raw.svc] : [];
  svc = svc.map((s) => oneLine(s, 60)).filter((s) => SERVICES[lang].includes(s));
  const formule = FORMULES[oneLine(raw.formule, 30).toLowerCase()] || '';

  if (nom.length < 2) errors.nom = t.name;
  if (!/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/.test(email)) errors.email = t.email;
  if (tel && !/^[0-9+\s().\-]{6,40}$/.test(tel)) errors.phone = t.phone;
  if (msg.length > 5000) errors.msg = t.msg;
  return { lang, t, errors, data: { nom, email, tel, msg: msg.slice(0, 5000), svc, formule } };
}

const row = (k, v) =>
  `<tr><td style="padding:6px 14px 6px 0;color:#555;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${v}</td></tr>`;
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
const wrap = (inner) =>
  `<div style="font:16px/1.55 Helvetica,Arial,sans-serif;color:#0a0a0b;max-width:560px">${inner}</div>`;

function ownerMail(d, lang) {
  const L = lang === 'en'
    ? { n: 'Name', e: 'E-mail', p: 'Phone', s: 'Interested in', f: 'Plan', m: 'Project', h: 'New request from the website', none: '—' }
    : { n: 'Nom', e: 'E-mail', p: 'Téléphone', s: 'Intéressé(e) par', f: 'Formule', m: 'Projet', h: 'Nouvelle demande depuis le site', none: '—' };
  const html = wrap(
    `<h2 style="margin:0 0 14px">${esc(L.h)}</h2><table style="border-collapse:collapse">` +
      row(L.n, esc(d.nom)) +
      row(L.e, `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`) +
      row(L.p, d.tel ? `<a href="tel:${esc(d.tel.replace(/[^0-9+]/g, ''))}">${esc(d.tel)}</a>` : L.none) +
      row(L.s, d.svc.length ? esc(d.svc.join(', ')) : L.none) +
      (d.formule ? row(L.f, esc(d.formule)) : '') +
      row(L.m, d.msg ? nl2br(d.msg) : L.none) +
      '</table>'
  );
  const text = [L.h, '', `${L.n} : ${d.nom}`, `${L.e} : ${d.email}`, `${L.p} : ${d.tel || L.none}`, `${L.s} : ${d.svc.join(', ') || L.none}`]
    .concat(d.formule ? [`${L.f} : ${d.formule}`] : [], ['', `${L.m} :`, d.msg || L.none]).join('\n');
  return { html, text };
}

function userMail(d, lang) {
  const first = d.nom.split(/\s+/)[0];
  const fr = lang !== 'en';
  const recap = [];
  if (d.formule) recap.push(fr ? `Formule : ${d.formule}` : `Plan: ${d.formule}`);
  if (d.svc.length) recap.push((fr ? 'Intéressé(e) par : ' : 'Interested in: ') + d.svc.join(', '));
  const hello = fr ? `Bonjour ${first},` : `Hello ${first},`;
  const p1 = fr
    ? 'Merci pour votre message : nous avons bien reçu votre demande de consultation.'
    : 'Thank you for your message: we have received your consultation request.';
  const p2 = fr
    ? 'Nous revenons vers vous sous 48 heures ouvrables pour fixer un échange, par téléphone, en visioconférence ou en personne. La consultation est gratuite et sans engagement.'
    : 'We will get back to you within 48 business hours to arrange a call, a video meeting or a visit. The consultation is free and without obligation.';
  const p3 = fr
    ? 'Une question urgente ? Appelez-nous au <a href="tel:+41798790079">+41 79 879 00 79</a> (lun–ven, 8h30–18h30).'
    : 'Something urgent? Call us on <a href="tel:+41798790079">+41 79 879 00 79</a> (Mon–Fri, 8:30–18:30).';
  const bye = fr ? 'À très vite,<br>L’équipe Websituation' : 'Speak soon,<br>The Websituation team';
  const rec = recap.length ? `<p style="margin:0 0 16px;padding:12px 16px;background:#f3f4f6;border-radius:10px">${recap.map(esc).join('<br>')}</p>` : '';
  const html = wrap(`<p>${esc(hello)}</p><p>${p1}</p>${rec}<p>${p2}</p><p>${p3}</p><p>${bye}</p>`);
  const strip = (s) => s.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');
  const text = [hello, '', p1, ''].concat(recap, recap.length ? [''] : [], [strip(p2), '', strip(p3), '', strip(bye)]).join('\n');
  return { html, text };
}

async function resend(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: T.fr.method });
  }
  const raw = parseBody(req);
  if (JSON.stringify(raw).length > MAX_BODY) return res.status(413).json({ ok: false });

  // champ piège (honeypot) et délai minimal : on répond « ok » sans rien envoyer
  const tooFast = raw.t && Date.now() - Number(raw.t) < 3000;
  if (clean(raw.website, 200) || tooFast) return res.status(200).json({ ok: true });

  const { lang, t, errors, data } = validate(raw);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY manquante');
    return res.status(500).json({ ok: false, error: t.send });
  }

  const from = process.env.CONTACT_FROM || 'Websituation <contact@websituation.ch>';
  const to = process.env.CONTACT_TO || 'contact@websituation.ch';
  try {
    const o = ownerMail(data, lang);
    await resend({
      from, to: [to], reply_to: data.email,
      subject: `${t.subjectOwner} : ${data.nom}${data.formule ? ' (' + data.formule + ')' : ''}`.replace(/[<>]/g, '').slice(0, 200),
      html: o.html, text: o.text,
    });
  } catch (e) {
    console.error('Envoi notification échoué', e.message);
    return res.status(502).json({ ok: false, error: t.send });
  }
  try {
    const u = userMail(data, lang);
    await resend({ from, to: [data.email], reply_to: to, subject: t.subjectUser, html: u.html, text: u.text });
  } catch (e) {
    console.error('E-mail de remerciement non envoyé', e.message); // la demande, elle, est bien reçue
  }
  return res.status(200).json({ ok: true });
};
