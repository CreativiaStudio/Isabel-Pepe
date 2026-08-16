const strings = {
  'layout.desc': 'Gioielli Demi-Fine in Argento 925 con placcatura Oro 18K (1.0µm) o Rodio ed E-Coating. Cofanetto regalo luxury e garanzia inclusi. Spedizione 24/48h.',
  'shop.default_desc': 'Esplora il catalogo gioielli Demi-Fine Isabel Pepe: Argento 925, placcatura Oro 18K, pietre taglio brillante e cofanetto regalo luxury incluso.',
  'shop.collane_desc': 'Scopri le collane demi-fine Isabel Pepe: punti luce, pendenti e catene in Argento 925 placcate Oro 18K (1.0µm) o Rodio con nano-protective E-coating.',
  'shop.orecchini_desc': 'Orecchini demi-fine Isabel Pepe in Argento 925 nichel free con placcatura Oro 18K o Rodio Puro. Massima lucentezza e comfort per pelli sensibili.',
  'shop.anelli_desc': 'Scopri gli anelli demi-fine Isabel Pepe: solitari taglio brillante e fasce pavé in Argento 925 con doppio scudo protettivo e cofanetto di lusso.',
  'shop.bracciali_desc': 'Bracciali demi-fine Isabel Pepe con placcatura Oro 18K (1.0µm) ed E-Coating protettivo anti-ossidazione. Eleganza senza tempo per ogni giorno.',
  'shop.set_desc': 'Parure esclusive Isabel Pepe: set coordinati in Argento 925 e Oro 18K con cofanetto regalo signature, panno microfibra e certificato ufficiale.',
  'chi-siamo.desc': 'Scopri la storia e i valori di Isabel Pepe: gioielli Demi-Fine in Argento 925, placcatura Oro 18K, pietre di pura luce e impegno per gli animali.',
  'cura-gioielli.desc': 'Scopri come preservare i tuoi gioielli Isabel Pepe: guida alla manutenzione della placcatura Oro 18K (1.0µm), Rodio, E-Coating e panno incluso.',
  'guida-taglie.desc': 'Trova la misura perfetta per il tuo anello Isabel Pepe. Consulta la tabella millimetrica comparativa IT/US e segui i consigli dei nostri esperti.',
  'impegno-animali.desc': 'Per ogni gioiello Isabel Pepe acquistato, doniamo una quota a rifugi e cure veterinarie per animali in difficoltà. Bellezza che protegge la vita.',
  'spedizioni-resi.desc': 'Spedizioni express in tutta Italia con Packlink PRO e Poste Italiane. Gratuite sopra 150€. Reso facile entro 30 giorni con rimborso rapido garantito.',
  'assistenza-clienti.desc': 'Hai bisogno di supporto? Contatta il Concierge Isabel Pepe via WhatsApp o email per informazioni su ordini, taglie, spedizioni e garanzia 24 mesi.',
  'privacy.desc': 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR). Trasparenza e sicurezza per i tuoi acquisti su Isabel Pepe.',
  'cookie-policy.desc': 'Informativa sull\'utilizzo dei cookie tecnici e analitici adottati dal sito web Isabel Pepe per garantire un\'esperienza di acquisto sicura e fluida.',
  'termini-condizioni.desc': 'Condizioni generali di vendita e-commerce Isabel Pepe: pagamenti protetti, garanzia legale di conformità 24 mesi e diritto di recesso 14 giorni.',
  'login.desc': 'Accedi alla tua area riservata Isabel Pepe per gestire comodamente i tuoi ordini, i tuoi dati personali e la lista desideri in totale sicurezza.',
  'account.desc': 'Accedi all\'area riservata Isabel Pepe per visualizzare lo stato dei tuoi ordini, i dettagli di spedizione e le impostazioni del tuo account.',
  'success.desc': 'Grazie per il tuo acquisto su Isabel Pepe. Il tuo ordine è stato confermato con successo e stiamo preparando i tuoi gioielli con la massima cura.'
};

console.log('--- DESCRIPTIONS (Target: 140-155) ---');
let descOk = true;
for (const [k, v] of Object.entries(strings)) {
  const len = v.length;
  const ok = len >= 140 && len <= 155;
  if (!ok) descOk = false;
  console.log(`${ok ? '✅' : '❌'} ${k}: ${len} chars -> "${v}"`);
}

const titles = {
  'layout.default': 'Isabel Pepe | Gioielli Demi-Fine & Argento 925',
  'shop.default': 'Catalogo Gioielli Demi-Fine & Parure',
  'shop.collane': 'Collane Demi-Fine in Oro 18K',
  'shop.orecchini': 'Orecchini Demi-Fine in Oro 18K',
  'shop.anelli': 'Anelli Solitari & Pavé Demi-Fine',
  'shop.bracciali': 'Bracciali Tennis & Rigidi Demi-Fine',
  'shop.set': 'Set Parure Royale Demi-Fine',
  'chi-siamo': 'Chi Siamo — L\'Arte di Splendere',
  'cura-gioielli': 'Cura dei Gioielli Demi-Fine',
  'guida-taglie': 'Guida alle Taglie Anelli',
  'impegno-animali': 'L\'Arte del Dono',
  'spedizioni-resi': 'Spedizioni e Resi',
  'assistenza-clienti': 'Assistenza Clienti & FAQ',
  'privacy': 'Informativa sulla Privacy & GDPR',
  'cookie-policy': 'Informativa Cookie',
  'termini-condizioni': 'Termini e Condizioni di Vendita',
  'login': 'Accedi al tuo Account',
  'account': 'Il Mio Account',
  'success': 'Ordine Confermato'
};

console.log('\n--- TITLES (With template " | Isabel Pepe", Target <= 60) ---');
let titlesOk = true;
for (const [k, v] of Object.entries(titles)) {
  const rendered = k === 'layout.default' ? v : `${v} | Isabel Pepe`;
  const len = rendered.length;
  const ok = len <= 60;
  if (!ok) titlesOk = false;
  console.log(`${ok ? '✅' : '❌'} ${k}: subpage=${v.length} chars, rendered=${len} chars -> "${rendered}"`);
}

if (descOk && titlesOk) {
  console.log('\n🎉 ALL TITLES AND DESCRIPTIONS ARE 100% COMPLIANT!');
} else {
  console.log('\n❌ SOME STRINGS FAILED COMPLIANCE!');
  process.exit(1);
}
