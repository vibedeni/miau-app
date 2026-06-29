// ============================================================
//  MIAU — Imunoterapie alergii copii
//  Version 1.10
//  Vanilla JS, zero dependențe, localStorage
// ============================================================

'use strict';

// ============================================================
//  CONSTANTE
// ============================================================

const APP_VERSION = '1.23';
const STORAGE_KEY = 'miau_data';
const TIMER_KEY   = 'miau_timer';

const SIMPTOME = [
  { id: 'muci',       label: '🤧 Muci / nas înfundat' },
  { id: 'tuse',       label: '😮‍💨 Tuse' },
  { id: 'ragusit',    label: '🗣️ Raguseală' },
  { id: 'pete',       label: '🔴 Pete pe piele' },
  { id: 'mancarime',  label: '👅 Mâncărime limbă / gât' },
  { id: 'lacrimare',  label: '👁️ Lăcrimare / ochi roșii' },
  { id: 'stranute',   label: '🤧 Strănutat' },
  { id: 'oboseala',   label: '😴 Oboseală / irascibilitate' },
  { id: 'greata',     label: '🤢 Greață' },
  { id: 'edem',       label: '💊 Edem / umflătură' },
  { id: 'altele',     label: '📝 Altele', cuDetalii: true }
];

const SEVERITATE = [
  { id: 'usor',  label: 'Ușor',  emoji: '🟡' },
  { id: 'mediu', label: 'Mediu', emoji: '🟠' },
  { id: 'sever', label: 'Sever', emoji: '🔴' }
];

// ============================================================
//  LANG — traduceri (ro / en)
// ============================================================

const LANG = {
  ro: {
    // -- generale / butoane comune --
    anuleaza: 'Anulează',
    confirma: 'Confirmă',
    salveaza: 'Salvează',
    sterge: 'Șterge',
    editeaza: 'Editează',
    adauga: 'Adaugă',
    inchide: 'Închide',
    continua: 'Continuă',
    inapoi: '← Înapoi',
    da: 'Da',
    nu: 'Nu',
    niciun_tratament_activ: 'Niciun tratament activ.',

    // -- limbă (settings) --
    setari_limba_titlu: 'Limbă',
    setari_limba_ro: 'Română',
    setari_limba_en: 'English',

    // -- nav --
    nav_acasa: 'Acasă',
    nav_simptome: 'Simptome',
    nav_stocuri: 'Stocuri',
    nav_istoric: 'Istoric',
    nav_setari: 'Setări',

    // -- confirmDialog implicit --
    confirm_dialog_titlu: 'Confirmă acțiunea',
    confirm_dialog_titlu_danger: '⚠️ Confirmare',

    // -- header --
    header_titlu: '🐾 Miau',

    // -- acasa --
    acasa_stoc_scazut_titlu: '⚠️ Stoc scăzut',
    acasa_stoc_scazut_ok: 'OK, am notat',
    acasa_instalare_titlu: '📲 Adaugă Miau pe ecranul principal',
    acasa_instalare_text: 'Pe iPhone, datele se pot șterge automat dacă aplicația rămâne doar în browser și nu e folosită o vreme. Adaugă-o pe ecranul principal ca să fie sigură.',
    acasa_instalare_vezi_cum: 'Vezi cum',
    acasa_instalare_am_facut: 'Am făcut-o',
    acasa_tranzitie_titlu: '💙 Ai trecut la faza de Menținere!',
    acasa_tranzitie_text: 'De azi dozele sunt de <strong>100 unități</strong> (flaconul albastru).<br>Pune un flacon albastru nou și confirmă mai jos — stocul se resetează automat la 50 de picături.',
    acasa_tranzitie_btn: '✅ Am pus flaconul albastru — continuă',
    acasa_card_titlu: 'Tratamentul de azi — {{data}}',
    acasa_ziua_din_tratament: 'Ziua {{ziua}} din tratament',
    acasa_picatura: 'picătură',
    acasa_picaturi: 'picături',
    acasa_unitati: 'unități',
    acasa_faza_initiere: 'Inițiere',
    acasa_faza_mentinere: 'Menținere',
    acasa_unitati_total: '{{faza}} — {{total}} unități total',
    acasa_ultima_zi: '⏳ Ultima zi din doza curentă',
    acasa_zile_ramase: '⏳ Mai {{verb}} <strong>{{zile}} {{ziCuvant}}</strong> din doza curentă',
    acasa_doza_mentinere: '⏳ Doza de menținere — continuă',
    acasa_protocol_neconfigurat: 'Protocolul nu este configurat.',
    acasa_tarziu: '🌙 E târziu — nu uita de tratament!',
    acasa_hint_protocol: '⚙️ Protocolul și pașii se modifică din tab-ul <strong>Setări</strong>',
    acasa_linkuri_titlu: 'Linkuri utile',
    acasa_sarit_btn: 'Sărit azi (nu s-a putut face tratamentul)',
    acasa_protocol_neconfigurat_setari: '⚙️ Protocolul nu e configurat — mergi la <strong>Setări</strong> pentru a-l adăuga.',

    // -- pasii tratamentului --
    pasi_titlu: 'Pașii tratamentului',
    pasi_start: 'Start ▶',
    pasi_continua_acum: '⏭️ Continuă acum',
    pasi_finalizeaza: '🎉 Finalizează tratamentul zilei!',
    pasi_finalizat_azi: 'Tratament finalizat azi',
    pasi_reactivare: 'Reactivare la miezul nopții',

    // -- donatii --
    donatii_titlu: '💛 Susține aplicația',
    donatii_text: 'Miau e gratuită și fără reclame.<br>O cafea pentru developer (10–50 lei) ajută mult!',
    donatii_btn: '☕ Cumpără-ne o cafea',

    // -- linkuri --
    link_staloral: 'Caută Staloral — Farmacia Tei',
    link_medradar: 'MedRadar — stocuri farmacii',
    link_prospect: 'Prospect oficial Staloral (PDF)',
    link_site: 'miauapp.ro — site aplicație',
    link_ghid: 'Ghid instalare pe telefon',

    // -- simptome tab --
    simptome_data_label: 'Data:',
    simptome_zi_trecuta: 'zi trecută',
    simptome_protocol_pentru: '📋 Protocol pentru {{data}}: {{picaturi}} pic. × {{unitati}}u',
    simptome_efectuat_chk: 'Tratamentul a fost efectuat — scade din stoc',
    simptome_totul_ok: '✅ Totul OK — niciun simptom',
    simptome_hint_gol: 'Bifează cel puțin un simptom sau apasă <strong>Totul OK</strong> dacă nu a fost nimic.',
    simptome_bifeaza_azi: 'Bifează simptomele de azi:',
    simptome_bifeaza_data: 'Bifează simptomele din {{data}}:',
    simptome_placeholder_detalii: 'Descrie pe scurt...',
    simptome_salveaza_istoric: '💾 Salvează în Istoric',
    simptome_zi: 'zi',
    simptome_zile: 'zile',

    // -- stocuri tab --
    stocuri_staloral_titlu: '💧 Staloral — Flacon curent',
    stocuri_ajunge: 'îți ajunge ~{{zile}} {{ziCuvant}} · până pe {{data}}',
    stocuri_stoc_scazut: '⚠️ Stoc scăzut!',
    stocuri_rezerva: '📦 Rezervă:',
    stocuri_flacon: 'flacon',
    stocuri_flacoane: 'flacoane',
    stocuri_putine: '⚠️ Puține!',
    stocuri_flacon_nou: '🆕 Flacon nou (50)',
    stocuri_corecteaza: '✏️ Corectează',
    stocuri_hint_corectare: 'Dacă s-au pierdut picături la pornire, folosește „Corectează" pentru a scădea manual.',
    stocuri_expira_la: '📅 Expiră la:',
    stocuri_salveaza: 'Salvează',
    stocuri_expirat: '⚠️ <strong>Flaconul a expirat!</strong> Înlocuiește-l înainte de următorul tratament.',
    stocuri_atentie_expirare: '⚠️ Atenție la data de expirare — mai sunt <strong>{{zile}} {{ziCuvant}}</strong> ({{data}}).',
    stocuri_data_expirare_info: '📅 Data expirare flacon: <strong>{{data}}</strong> — mai sunt {{zile}} zile.',
    stocuri_antihistaminic_implicit: 'Antihistaminic',
    stocuri_pastile_ramase: 'pastile rămase',
    stocuri_doze_ramase: 'doze rămase',
    stocuri_din_stoc_initial: 'din stoc inițial',
    stocuri_cutie_noua: '🆕 Cutie / sticlă nouă',
    stocuri_praguri_titlu: '🔔 Praguri de alertă',
    stocuri_alerta_la: 'Alertă la <strong>{{picaturi}} picături</strong> în flacon · <strong>{{flacoane}} flacoane</strong> rezervă',
    stocuri_label_alerta_picaturi: 'Alertă picături flacon (curent)',
    stocuri_hint_alerta_picaturi: 'Primești alertă când sunt atât de puține picături în flacon (implicit 5)',
    stocuri_label_alerta_flacoane: 'Alertă flacoane în rezervă',

    // -- istoric --
    istoric_gol_titlu: 'Nicio intrare în istoric încă.<br>Fă primul tratament!',
    istoric_grafic_titlu: 'Simptome — ultimele 14 zile',
    istoric_zi: 'zi',
    istoric_zile: 'zile',
    istoric_zile_cu_simptome: 'zile cu simptome',
    istoric_zile_ok: 'zile OK',
    istoric_fara_inreg: 'fără înreg.',
    istoric_din_14_zile: 'din 14 zile',
    istoric_zile_ok_scurt: 'zile OK',
    istoric_din_14: 'din 14',
    istoric_lista_titlu: '📅 {{nume}} — toate zilele',
    istoric_totul_ok: '✅ Totul OK',
    istoric_sarit: 'Sărit',
    istoric_simptome_inregistrate: 'Simptome înregistrate',

    // -- setari --
    setari_tema_titlu: 'Temă',
    setari_tema_hint: 'Alege cum arată aplicația. Se salvează pe telefon.',
    tema_menta_nume: 'Mentă',
    tema_menta_desc: 'Verde-teal, prietenos · pentru copil',
    tema_soare_nume: 'Soare',
    tema_soare_desc: 'Cald, portocaliu · jucăuș',
    tema_salvie_nume: 'Salvie',
    tema_salvie_desc: 'Verde calm, sobru · pentru părinte',
    tema_nocturn_nume: 'Nocturn',
    tema_nocturn_desc: 'Întunecat, mint · doza de seară',
    setari_protocol_titlu: 'Protocol & pași zilnici',
    setari_protocol_zi: 'zi',
    setari_protocol_zile: 'zile',
    setari_protocol_gol: 'Niciun protocol configurat.',
    setari_protocol_modifica: '✏️ Modifică protocolul',
    setari_protocol_hint_modificare: 'Modificarea protocolului nu resetează istoricul sau stocurile.',
    setari_protocol_info_box: '💡 Protocolul e complet, de la ziua 1. App-ul calculează automat în ce zi ești azi față de data de start.<br>Dacă tratamentul a început deja și nu vrei să introduci istoricul, poți introduce doar pașii de acum și să schimbi data de start pe ziua de azi.',
    setari_flux_intro: 'Personalizează pașii care apar zilnic, în ordinea în care se fac. Poți schimba antihistaminicul, adăuga pași înainte sau după Staloral, sau seta expirare automată (ex: un pas pentru o anumită fază).',
    setari_flux_inainte_de_staloral: 'înainte de Staloral',
    setari_flux_dupa_tratament: 'după tratament',
    setari_flux_exp_dupa_folosiri: ' · exp. după {{val}} folosiri ({{curent}}/{{val}})',
    setari_flux_exp_dupa_data: ' · exp. {{data}}',
    setari_flux_antihistaminic_label: 'Antihistaminic {{nume}}',
    setari_flux_antihistaminic_sub: '{{minute}} min {{pozitie}} Staloral · stoc: {{stoc}}',
    setari_flux_inainte_de: 'înainte de',
    setari_flux_dupa: 'după',
    setari_flux_adauga_antihistaminic: '+ Adaugă antihistaminic',
    setari_flux_confirmare: 'confirmare',
    setari_flux_staloral_titlu: 'Staloral sub limbă',
    setari_flux_staloral_sub: '2 min — fix, nu se poate modifica',
    setari_flux_asteptare_titlu: 'Nu mânca / bea / dinți',
    setari_flux_asteptare_sub: '10 min — fix, nu se poate modifica',
    setari_flux_fix: 'fix',
    setari_flux_pasi_expirati_titlu: 'Pași finalizați / expirați:',
    setari_flux_sterge: 'șterge',
    setari_flux_adauga_pas: '+ Adaugă pas personalizat',
    buildpasi_anti_inainte: 'Aștepți {{minute}} min înainte de Staloral',
    buildpasi_anti_dupa: 'Aștepți {{minute}} min după Staloral',
    buildpasi_staloral_sub: 'Ții 2 minute sub limbă fără să înghiți',
    buildpasi_asteptare_sub: '10 minute — nu mânca, nu bea, nu te spăla pe dinți',
    setari_email_titlu: 'Trimite raport zilnic',
    setari_email_sub: 'După fiecare tratament finalizat',
    setari_email_label_adresa: 'Adresă de email',
    setari_emailjs_titlu: '⚙️ Configurare EmailJS',
    setari_emailjs_complet: '✅ EmailJS complet configurat',
    setari_emailjs_incomplet: '⚠️ Configurare incompletă',
    setari_emailjs_intro: 'Permite trimiterea unui raport zilnic pe email după fiecare tratament. Gratuit, fără server.<br><br>Dacă nu te descurci cu configurarea, găsești ghidul complet pas cu pas pe site-ul nostru:',
    setari_copii_activ: 'Activ',
    setari_copii_activeaza: 'Activează',
    setari_copii_start: 'Start: {{data}}',
    setari_copii_nou: '+ Copil / Tratament nou',
    setari_staloral_titlu: 'Link căutare Staloral',
    setari_staloral_intro: 'Implicit, aplicația caută Staloral pisică pe Farmacia Tei. Dacă tratamentul este pentru alt alergen, poți introduce un link personalizat.',
    setari_staloral_label: 'Link personalizat (lasă gol pentru default pisică)',
    setari_staloral_placeholder: 'Lipește linkul aici...',
    setari_staloral_reseteaza: 'Resetează la default',
    setari_export_titlu: 'Export / Import date',
    setari_export_btn: '📤 Export JSON',
    setari_import_btn: '📥 Import JSON',
    setari_export_hint: 'Exportă toate datele ca fișier JSON — pentru backup sau transfer pe alt dispozitiv / al doilea părinte.',
    setari_reset_titlu: 'Resetare',
    setari_reset_btn: 'Șterge toate datele',
    setari_reset_hint: 'Atenție: șterge tot — tratamente, istoric, stocuri. Ireversibil!',
    setari_copii_titlu: 'Copii / Tratamente',

    // -- onboarding --
    onb_titlu_pas1: 'Bine ai venit! 🐾',
    onb_titlu_pas2: 'Tratamentul',
    onb_titlu_pas3: 'Protocolul medical',
    onb_titlu_pas4: 'Staloral — stoc inițial',
    onb_titlu_pas5: 'Antihistaminic',
    onb_titlu_pas6: 'Gata! 🎉',
    onb_pasul_x_din_y: 'Pasul {{step}} din {{total}}',
    onb_pornesc_aplicatia: '✅ Pornesc aplicația!',
    onb_continua: 'Continuă →',
    onb_welcome_titlu: 'Miau',
    onb_welcome_text: 'Aplicația care te ajută să gestionezi imunoterapia sublinguală a copilului tău — timere, stocuri, simptome, totul într-un loc.',
    onb_nota_importanta: '⚠️ <strong>Notă importantă:</strong> Miau este un instrument de organizare, nu un dispozitiv medical. Urmează întotdeauna indicațiile medicului alergolog. În caz de reacție severă, contactează imediat medicul sau serviciul de urgență.',
    onb_label_nume: 'Cum numim acest tratament?',
    onb_placeholder_nume: 'ex: Matei — pisică',
    onb_hint_nume: 'Poți adăuga mai târziu tratamente pentru alți alergeni sau pentru alți copii.',
    onb_label_data: 'Data de start a tratamentului',
    onb_hint_data: 'Dacă tratamentul a început deja, pune data reală de start — aplicația va calcula automat ziua curentă.',
    onb_info_protocol: '💡 Protocolul e complet, de la ziua 1. App-ul calculează automat în ce zi ești azi față de data de start.<br>Dacă tratamentul a început deja și nu vrei să introduci istoricul, poți introduce doar pașii de acum și să schimbi data de start pe ziua de azi.',
    onb_label_faza: 'Faza curentă',
    onb_faza_initiere: '🩷 Inițiere',
    onb_faza_initiere_sub: 'Doze de 10u (flacon roz)',
    onb_faza_mentinere: '💙 Menținere',
    onb_faza_mentinere_sub: 'Doze de 100u (flacon albastru)',
    onb_hint_faze: 'Inițiere = flaconul roz de 50 picături × 10 unități.<br>Menținere = flacoanele albastre de 50 picături × 100 unități.<br>Tranziția dintre ele o marchezi tu manual când doctorul decide.',
    onb_protocol_precompletat_mentinere: 'Am pre-completat protocolul standard — ajustează dacă medicul a prescris altceva.',
    onb_protocol_precompletat_initiere: 'Am pre-completat protocolul standard de inițiere — ajustează dacă medicul a prescris altceva.',
    onb_btn_adauga_pas_100: '💙 Adaugă pas (100u — menținere)',
    onb_btn_adauga_pas_10: '🩷 Adaugă pas (10u — inițiere)',
    onb_btn_adauga_doze_100: '💙 Adaugă doze de 100',
    onb_hint_pasi: 'Pașii se aplică în ordine, ziuă cu ziuă, de la data de start.<br>{{extra}}Poți modifica oricând mai târziu din Setări, fără să pierzi istoricul.',
    onb_hint_pasi_extra_initiere: 'Adaugă mai întâi toți pașii de 10u (inițiere), apoi cei de 100u (menținere) — se continuă fără pauză.<br>',
    onb_info_tratament_inceput: '💡 <strong>Tratamentul a început deja?</strong> Ai două variante:<br>• Introduci protocolul complet de la ziua 1 și setezi data de start corectă — app-ul se poziționează singur pe ziua de azi.<br>• Sau introduci doar pașii de acum înainte și setezi data de start pe ziua de azi — mai simplu, dar fără istoric anterior.',
    onb_label_picaturi_flacon: 'Picături în flacon curent',
    onb_hint_picaturi_flacon: 'Un flacon nou are 50 de picături. Dacă ai început deja, pune câte au mai rămas.',
    onb_label_flacoane_rezerva: 'Flacoane în rezervă (în afara celui curent)',
    onb_hint_flacoane_rezerva: 'Setul de inițiere include 1 flacon roz + 2 flacoane albastre.',
    onb_label_anti_intrebare: 'Copilul ia și un antihistaminic?',
    onb_label_anti_nume: 'Numele medicamentului',
    onb_placeholder_anti_nume: 'ex: Xyzal, Zyrtec',
    onb_label_anti_tip: 'Tip',
    onb_anti_pastile: '💊 Pastile',
    onb_anti_picaturi: '💧 Picături',
    onb_label_anti_stoc: 'Stoc inițial',
    onb_label_anti_pozitie: 'Se administrează față de Staloral',
    onb_anti_inainte: 'Înainte',
    onb_anti_dupa: 'După',
    onb_hint_anti_pozitie: 'Recomandat: minim 20 de minute înainte de Staloral.',
    onb_label_anti_interval: 'Interval față de Staloral (minute)',
    onb_final_titlu: 'Totul e configurat!',
    onb_final_text: '<strong>{{nume}}</strong> este gata.<br><br>Poți modifica oricând protocolul, pașii sau setările din tab-ul <strong>Setări ⚙️</strong>.<br><br>Dacă vrei să primești rapoarte zilnice pe email, configurează <strong>EmailJS</strong> din Setări — e gratuit și durează 10 minute.<br><br>Mult succes! 🐾',
    onb_final_nume_implicit: 'Tratamentul',
    onb_hint_continua_data: 'Continuă automat de la pasul anterior ({{data}}).',
    onb_sep_zile: 'zile',
    onb_sep_pic: 'pic. ×',
    onb_sep_u: 'u',

    // -- protocol row sufixe --
    protocol_row_zile: '🔢 Zile',
    protocol_row_calendar: '📅 Date',
    protocol_row_zile_placeholder: 'zile',
    unitati_pe_zi: 'u/zi',
    protocol_row_pic_placeholder: 'pic.',

    // -- toast / confirm / modale partajate --
    toast_eroare_salvare: '⚠️ Eroare la salvare — memoria plină?',
    toast_data_invalida_min: '⚠️ Data nu poate fi înainte de {{data}} (continuarea pasului anterior).',
    toast_data_sfarsit_invalida: '⚠️ Data de sfârșit nu poate fi înainte de data de început.',
    toast_3ani_completati: '3 pic × 100u → 3 ani completați automat 🎉',
    toast_introdu_nume: 'Introdu un nume pentru tratament!',
    toast_introdu_data: 'Introdu data de start!',
    modal_ziua_sarit_titlu: 'Marchează ziua ca sărit',
    modal_ziua_sarit_text_anti: 'Staloral nu s-a administrat azi — stocul <strong>nu</strong> va scădea.<br>Dar {{forma}} de <strong>{{nume}}</strong>?',
    modal_ziua_sarit_pastila: 'pastila',
    modal_ziua_sarit_picaturile: 'picăturile',
    modal_ziua_sarit_da_cu_anti: '💊 Da, a luat antihistaminicul — scade 1 din stoc',
    modal_ziua_sarit_fara_anti: '✕ Nu, nu a luat nimic',
    modal_ziua_sarit_text_fara_anti: 'Ești sigur că tratamentul de azi nu s-a putut face?<br>Staloral <strong>nu</strong> va scădea din stoc.',
    modal_ziua_sarit_da: 'Da, marchează ca sărit',
    modal_ziua_sarit_nu: 'Nu, anulează',
    toast_sarit_cu_anti: 'Sărit — antihistaminic scăzut din stoc.',
    toast_sarit_fara_anti: 'Ziua marcată ca sărit.',
    toast_tratament_finalizat: '🎉 Tratamentul zilei, finalizat!',
    toast_completeaza_simptome: 'Completează simptomele de azi 📋',
    toast_flacon_albastru_activat: '💙 Flacon albastru activat! Stoc resetat la 50 picături.',
    milestone_tranzitie_mentinere: '💙 Tranziție la Menținere (100u)',
    milestone_tranzitie_detalii: 'Flacon albastru activat, stoc resetat la 50 picături',
    milestone_tranzitie_detalii_auto: 'Calculat automat din protocolul introdus la configurare',
    milestone_faza_noua: '🔬 Fază nouă: {{picaturi}} pic. × {{unitati}}u',
    milestone_faza_anterior: 'Anterior: {{picaturi}} pic. × {{unitati}}u',
    milestone_pas_finalizat: '⭐ Pas finalizat: {{label}}',
    milestone_pas_expirat_folosiri: 'Expirat după {{val}} {{cuvant}}',
    milestone_pas_expirat_data: 'Expirat la data: {{data}}',
    cuvant_folosire: 'folosire',
    cuvant_folosiri: 'folosiri',
    toast_pas_finalizat: '✅ Pasul „{{label}}" s-a finalizat!',
    toast_picaturi_putine: '⚠️ Picături puține în flacon: {{ramase}} rămase!',
    toast_flacoane_putine: '⚠️ Flacoane puține în rezervă: {{ramase}}!',
    toast_anti_stoc_scazut: '⚠️ {{nume}}: stoc scăzut ({{stoc}} rămase)!',
    modal_anti_titlu: '💊 Antihistaminic',
    modal_anti_activ_titlu: 'Activ — copilul ia antihistaminic',
    modal_anti_activ_sub: 'Dezactivează dacă nu mai este prescris',
    modal_anti_label_denumire: 'Denumire medicament',
    modal_anti_label_doza: 'Doză per administrare (opțional)',
    modal_anti_placeholder_doza: 'ex: 5mg, 10ml, 2 picături',
    modal_anti_hint_doza: 'Conform prescripției medicului. Apare în stocuri și rapoarte email.',
    modal_anti_label_tip: 'Tip',
    modal_anti_label_pozitie: 'Față de Staloral',
    modal_anti_inainte_recomandat: 'Înainte (recomandat)',
    modal_anti_dupa: 'După',
    modal_anti_label_interval: 'Interval față de Staloral (minute)',
    modal_anti_hint_interval: 'Recomandat: minim 20 de minute înainte de picături.',
    modal_anti_save: '✅ Salvează',
    toast_anti_actualizat: '✅ Antihistaminic actualizat!',
    modal_pas_edit_titlu: '✏️ Editează pas',
    modal_pas_nou_titlu: '➕ Pas nou',
    modal_pas_label_descriere: 'Descriere (cu emoji)',
    modal_pas_placeholder_descriere: '💧 Bea apă acum',
    modal_pas_label_durata: 'Durată (minute) — 0 = fără timer, doar confirmare',
    modal_pas_label_nota: 'Notă explicativă (opțional)',
    modal_pas_placeholder_nota: 'ex: Poți bea apă sau suc',
    modal_pas_label_pozitie: 'Poziție în flux',
    modal_pas_inainte_de_staloral: 'Înainte de Staloral',
    modal_pas_dupa_tratament: 'După tratament',
    modal_pas_label_expirare: 'Expirare automată',
    modal_pas_exp_niciodata: '🔁 Niciodată — continuă mereu',
    modal_pas_exp_folosiri: '🔢 După X folosiri',
    modal_pas_exp_folosiri_ex: '🔢 După X folosiri (ex: 1 picătură = 10 zile)',
    modal_pas_exp_data: '📅 Până la o dată',
    modal_pas_label_numar_folosiri: 'Număr de folosiri',
    modal_pas_hint_numar_folosiri: 'Ex: 10 = pasul apare 10 zile și dispare automat, lăsând o urmă în Istoric.',
    modal_pas_label_expira_la: 'Expiră la data',
    modal_pas_adauga: '✅ Adaugă',
    toast_pas_actualizat: '✅ Pas actualizat!',
    toast_pas_adaugat: '✅ Pas adăugat!',
    toast_adauga_descriere: 'Adaugă o descriere!',
    modal_corecteaza_pic_titlu: 'Corectează stoc picături',
    modal_label_pic_ramase: 'Picături rămase în flacon',
    modal_label_flacoane_rezerva: 'Flacoane în rezervă',
    toast_stoc_corectat: 'Stoc corectat!',
    modal_flacon_nou_titlu: 'Cutie / sticlă nouă',
    modal_label_cate_adaugi: 'Câte {{tip}} adaugi?',
    modal_pastile: 'pastile',
    modal_doze: 'doze',
    modal_btn_adauga_stoc: 'Adaugă la stoc',
    toast_adaugate_la_stoc: '+{{n}} adăugate la stoc!',
    modal_corecteaza_anti_titlu: 'Corectează {{tip}}',
    modal_label_ramase: '{{tip}} rămase',
    toast_praguri_salvate: '✅ Praguri salvate!',
    toast_eroare_email_invalid: '⚠️ Adresa de email nu este validă!',
    toast_email_salvat: 'Email salvat!',
    toast_emailjs_salvat: '✅ Configurare EmailJS salvată!',
    toast_tema_schimbata: '🎨 Temă schimbată!',
    toast_link_staloral_salvat: 'Link Staloral salvat!',
    toast_link_resetat: 'Link resetat la default (pisică).',
    toast_export_realizat: '📤 Export realizat!',
    modal_export_titlu: '📤 Export date',
    modal_export_pentru_cine: 'Exportă pentru cine?',
    modal_export_toti: '📦 Toți ({{n}} copii)',
    toast_fisier_prea_mare: '❌ Fișier prea mare — nu pare un export Miau.',
    toast_fisier_invalid: '❌ Fișier invalid — nu este un JSON corect.',
    toast_date_importate: '✅ Date importate cu succes!',
    confirm_import: 'Importă {{n}} tratament(e)? Datele existente vor fi înlocuite.',
    confirm_import_btn: 'Importă',
    confirm_reset_1: 'Ești sigur? Toate datele vor fi șterse definitiv!',
    confirm_reset_2: 'Ultima confirmare — chiar ștergi tot?',
    confirm_reset_btn_continua: 'Continuă',
    confirm_reset_btn_sterge: 'Șterge tot',
    toast_date_sterse: 'Toate datele au fost șterse.',
    modal_edit_protocol_titlu: '✏️ Modifică protocol',
    modal_edit_protocol_text: 'Modificarea se aplică zilelor viitoare. Istoricul și stocurile rămân neschimbate.',
    btn_adauga_pas: '+ Adaugă pas',
    toast_pauza_protocol: '⚠️ Există o pauză de {{zile}} {{ziCuvant}} între pași calendaristici. Protocolul trebuie să fie continuu!',
    toast_protocol_actualizat: '✅ Protocol actualizat!',
    confirm_sterge_pas: 'Ștergi pasul „{{label}}"? Acțiunea este ireversibilă.',
    toast_pas_sters: 'Pas șters.',
    toast_email_activat: '📧 Email activat',
    toast_email_dezactivat: '🔕 Email dezactivat',
    modal_simptome_titlu: 'Simptome — {{data}}',
    modal_simptome_sterge_zi: '🗑️ Șterge intrarea acestei zile',
    confirm_sterge_zi_finalizat: 'Ștergi intrarea din {{data}}?\n\nTratamentul era marcat ca finalizat — stocurile se vor reface automat ({{picaturi}} picături Staloral{{anti}}).',
    confirm_sterge_zi_simplu: 'Ștergi intrarea din {{data}}?',
    confirm_sterge_zi_btn: 'Șterge',
    toast_intrare_stearsa_stoc: '🗑️ Intrare ștearsă + stocuri refăcute.',
    toast_intrare_stearsa: '🗑️ Intrare ștearsă.',
    toast_totul_ok_salvat: '✅ Totul OK salvat!',
    toast_simptome_actualizate: '📋 Simptome actualizate!',
    toast_salvat_stoc_scazut: '💾 Salvat + stoc scăzut pentru {{data}}!',
    toast_totul_ok_salvat_istoric: '✅ Totul OK salvat în Istoric!',
    toast_simptome_salvate: '💾 {{n}} simptome salvate!',
    toast_flacon_nou_deschis: '🆕 Flacon nou deschis — 50 picături',
    toast_data_expirare_salvata: '📅 Data expirare salvată: {{data}}',
    toast_data_expirare_stearsa: 'Data expirare ștearsă.',
    toast_email_trimis: '📧 Raport trimis pe email!',
    toast_email_eroare: '⚠️ Emailul nu s-a putut trimite. Verifică configurarea EmailJS din Setări.',
    toast_backup_niciodata: '💾 Nu ai făcut niciun backup încă. Setări → Export JSON, ca să nu pierzi datele.',
    toast_backup_vechi: '💾 Au trecut {{zile}} zile de la ultimul backup — exportă datele din Setări.',
    import_eroare_date_invalide: 'Fișierul nu conține date valide.',
    import_eroare_lipsesc_tratamente: 'Lipsesc tratamentele — nu pare un export Miau.',
    import_eroare_fara_tratamente: 'Fișierul nu conține niciun tratament.',
    import_eroare_structura: 'Structură invalidă — fișier corupt sau din altă sursă.',
    import_eroare_protocol_corupt: 'Tratamentul "{{nume}}" are protocolul corupt.',
    import_eroare_istoric_corupt: 'Tratamentul "{{nume}}" are istoricul corupt.',
    import_eroare_stocuri_corupte: 'Tratamentul "{{nume}}" are stocurile corupte.',
    modal_export_pentru: '👤',
    email_totul_ok: 'Totul OK — fără simptome',
    email_nicio_informatie: 'Nicio informație',
    alerta_picaturi_ramase: '💧 Au mai rămas <strong>{{ramase}} picături</strong> Staloral în flaconul curent.',
    alerta_flacoane_ramase: '📦 Doar <strong>{{ramase}} {{flaconCuvant}}</strong> de rezervă Staloral.',
    alerta_anti_stoc_scazut: '💊 Stoc scăzut la <strong>{{nume}}</strong>: {{stoc}} rămase.',

    // -- simptome / severitate (labels, fără emoji) --
    simptome: {
      muci: 'Muci / nas înfundat',
      tuse: 'Tuse',
      ragusit: 'Raguseală',
      pete: 'Pete pe piele',
      mancarime: 'Mâncărime limbă / gât',
      lacrimare: 'Lăcrimare / ochi roșii',
      stranute: 'Strănutat',
      oboseala: 'Oboseală / irascibilitate',
      greata: 'Greață',
      edem: 'Edem / umflătură',
      altele: 'Altele'
    },
    severitate: {
      usor: 'Ușor',
      mediu: 'Mediu',
      sever: 'Sever'
    }
  },

  en: {
    anuleaza: 'Cancel',
    confirma: 'Confirm',
    salveaza: 'Save',
    sterge: 'Delete',
    editeaza: 'Edit',
    adauga: 'Add',
    inchide: 'Close',
    continua: 'Continue',
    inapoi: '← Back',
    da: 'Yes',
    nu: 'No',
    niciun_tratament_activ: 'No active treatment.',

    setari_limba_titlu: 'Language',
    setari_limba_ro: 'Română',
    setari_limba_en: 'English',

    nav_acasa: 'Home',
    nav_simptome: 'Symptoms',
    nav_stocuri: 'Stock',
    nav_istoric: 'History',
    nav_setari: 'Settings',

    confirm_dialog_titlu: 'Confirm action',
    confirm_dialog_titlu_danger: '⚠️ Confirmation',

    header_titlu: '🐾 Miau',

    acasa_stoc_scazut_titlu: '⚠️ Low stock',
    acasa_stoc_scazut_ok: 'OK, got it',
    acasa_instalare_titlu: '📲 Add Miau to your home screen',
    acasa_instalare_text: 'On iPhone, data may be deleted automatically if the app stays only in the browser and isn\'t used for a while. Add it to your home screen to keep it safe.',
    acasa_instalare_vezi_cum: 'See how',
    acasa_instalare_am_facut: 'Done',
    acasa_tranzitie_titlu: '💙 You moved to the Maintenance phase!',
    acasa_tranzitie_text: 'From today the doses are <strong>100 units</strong> (blue bottle).<br>Put in a new blue bottle and confirm below — the stock resets automatically to 50 drops.',
    acasa_tranzitie_btn: '✅ I put in the blue bottle — continue',
    acasa_card_titlu: "Today's treatment — {{data}}",
    acasa_ziua_din_tratament: 'Day {{ziua}} of treatment',
    acasa_picatura: 'drop',
    acasa_picaturi: 'drops',
    acasa_unitati: 'units',
    acasa_faza_initiere: 'Induction',
    acasa_faza_mentinere: 'Maintenance',
    acasa_unitati_total: '{{faza}} — {{total}} total units',
    acasa_ultima_zi: '⏳ Last day on this dose',
    acasa_zile_ramase: '⏳ <strong>{{zile}} {{ziCuvant}}</strong> left on this dose',
    acasa_doza_mentinere: '⏳ Maintenance dose — continue',
    acasa_protocol_neconfigurat: 'The protocol is not configured.',
    acasa_tarziu: "🌙 It's getting late — don't forget the treatment!",
    acasa_hint_protocol: '⚙️ The protocol and steps can be changed in the <strong>Settings</strong> tab',
    acasa_linkuri_titlu: 'Useful links',
    acasa_sarit_btn: "Skipped today (couldn't do the treatment)",
    acasa_protocol_neconfigurat_setari: '⚙️ The protocol is not set up — go to <strong>Settings</strong> to add it.',

    pasi_titlu: 'Treatment steps',
    pasi_start: 'Start ▶',
    pasi_continua_acum: '⏭️ Continue now',
    pasi_finalizeaza: "🎉 Finish today's treatment!",
    pasi_finalizat_azi: 'Treatment completed today',
    pasi_reactivare: 'Reactivates at midnight',

    donatii_titlu: '💛 Support the app',
    donatii_text: "Miau is free and ad-free.<br>A coffee for the developer (10–50 lei) helps a lot!",
    donatii_btn: '☕ Buy us a coffee',

    link_staloral: 'Search Staloral — Farmacia Tei',
    link_medradar: 'MedRadar — pharmacy stock',
    link_prospect: 'Official Staloral leaflet (PDF)',
    link_site: 'miauapp.ro — app website',
    link_ghid: 'Phone install guide',

    simptome_data_label: 'Date:',
    simptome_zi_trecuta: 'past day',
    simptome_protocol_pentru: '📋 Protocol for {{data}}: {{picaturi}} drops × {{unitati}}u',
    simptome_efectuat_chk: 'Treatment was done — deduct from stock',
    simptome_totul_ok: '✅ All good — no symptoms',
    simptome_hint_gol: 'Check at least one symptom or press <strong>All good</strong> if there was nothing.',
    simptome_bifeaza_azi: "Check today's symptoms:",
    simptome_bifeaza_data: 'Check symptoms for {{data}}:',
    simptome_placeholder_detalii: 'Briefly describe...',
    simptome_salveaza_istoric: '💾 Save to History',
    simptome_zi: 'day',
    simptome_zile: 'days',

    stocuri_staloral_titlu: '💧 Staloral — Current bottle',
    stocuri_ajunge: "lasts ~{{zile}} {{ziCuvant}} · until {{data}}",
    stocuri_stoc_scazut: '⚠️ Low stock!',
    stocuri_rezerva: '📦 Reserve:',
    stocuri_flacon: 'bottle',
    stocuri_flacoane: 'bottles',
    stocuri_putine: '⚠️ Low!',
    stocuri_flacon_nou: '🆕 New bottle (50)',
    stocuri_corecteaza: '✏️ Correct',
    stocuri_hint_corectare: 'If drops were lost when starting, use "Correct" to manually subtract.',
    stocuri_expira_la: '📅 Expires on:',
    stocuri_salveaza: 'Save',
    stocuri_expirat: '⚠️ <strong>The bottle has expired!</strong> Replace it before the next treatment.',
    stocuri_atentie_expirare: '⚠️ Watch the expiration date — <strong>{{zile}} {{ziCuvant}}</strong> left ({{data}}).',
    stocuri_data_expirare_info: '📅 Bottle expiration date: <strong>{{data}}</strong> — {{zile}} days left.',
    stocuri_antihistaminic_implicit: 'Antihistamine',
    stocuri_pastile_ramase: 'pills left',
    stocuri_doze_ramase: 'doses left',
    stocuri_din_stoc_initial: 'of initial stock',
    stocuri_cutie_noua: '🆕 New box / bottle',
    stocuri_praguri_titlu: '🔔 Alert thresholds',
    stocuri_alerta_la: 'Alert at <strong>{{picaturi}} drops</strong> in bottle · <strong>{{flacoane}} bottles</strong> reserve',
    stocuri_label_alerta_picaturi: 'Drop alert threshold (current bottle)',
    stocuri_hint_alerta_picaturi: "You get an alert when there are this few drops left in the bottle (default 5)",
    stocuri_label_alerta_flacoane: 'Reserve bottles alert threshold',

    istoric_gol_titlu: 'No history entries yet.<br>Do the first treatment!',
    istoric_grafic_titlu: 'Symptoms — last 14 days',
    istoric_zi: 'day',
    istoric_zile: 'days',
    istoric_zile_cu_simptome: 'days with symptoms',
    istoric_zile_ok: 'OK days',
    istoric_fara_inreg: 'no entry',
    istoric_din_14_zile: 'of 14 days',
    istoric_zile_ok_scurt: 'OK days',
    istoric_din_14: 'of 14',
    istoric_lista_titlu: '📅 {{nume}} — all days',
    istoric_totul_ok: '✅ All good',
    istoric_sarit: 'Skipped',
    istoric_simptome_inregistrate: 'Symptoms recorded',

    setari_tema_titlu: 'Theme',
    setari_tema_hint: 'Choose how the app looks. Saved on this device.',
    tema_menta_nume: 'Mint',
    tema_menta_desc: 'Teal green, friendly · for the child',
    tema_soare_nume: 'Sun',
    tema_soare_desc: 'Warm orange · playful',
    tema_salvie_nume: 'Sage',
    tema_salvie_desc: 'Calm green, sober · for the parent',
    tema_nocturn_nume: 'Night',
    tema_nocturn_desc: 'Dark, mint · evening dose',
    setari_protocol_titlu: 'Protocol & daily steps',
    setari_protocol_zi: 'day',
    setari_protocol_zile: 'days',
    setari_protocol_gol: 'No protocol configured.',
    setari_protocol_modifica: '✏️ Edit protocol',
    setari_protocol_hint_modificare: "Changing the protocol doesn't reset history or stock.",
    setari_protocol_info_box: "💡 The protocol is complete, from day 1. The app automatically calculates which day you're on relative to the start date.<br>If treatment already started and you don't want to enter history, you can enter just the current steps and change the start date to today.",
    setari_flux_intro: 'Customize the steps that appear daily, in the order they happen. You can change the antihistamine, add steps before or after Staloral, or set automatic expiry (e.g. a step for a specific phase).',
    setari_flux_inainte_de_staloral: 'before Staloral',
    setari_flux_dupa_tratament: 'after treatment',
    setari_flux_exp_dupa_folosiri: ' · exp. after {{val}} uses ({{curent}}/{{val}})',
    setari_flux_exp_dupa_data: ' · exp. {{data}}',
    setari_flux_antihistaminic_label: 'Antihistamine {{nume}}',
    setari_flux_antihistaminic_sub: '{{minute}} min {{pozitie}} Staloral · stock: {{stoc}}',
    setari_flux_inainte_de: 'before',
    setari_flux_dupa: 'after',
    setari_flux_adauga_antihistaminic: '+ Add antihistamine',
    setari_flux_confirmare: 'confirmation',
    setari_flux_staloral_titlu: 'Staloral under the tongue',
    setari_flux_staloral_sub: '2 min — fixed, cannot be changed',
    setari_flux_asteptare_titlu: "Don't eat / drink / brush teeth",
    setari_flux_asteptare_sub: '10 min — fixed, cannot be changed',
    setari_flux_fix: 'fixed',
    setari_flux_pasi_expirati_titlu: 'Completed / expired steps:',
    setari_flux_sterge: 'delete',
    setari_flux_adauga_pas: '+ Add custom step',
    buildpasi_anti_inainte: 'Wait {{minute}} min before Staloral',
    buildpasi_anti_dupa: 'Wait {{minute}} min after Staloral',
    buildpasi_staloral_sub: 'Hold for 2 minutes under the tongue without swallowing',
    buildpasi_asteptare_sub: "10 minutes — don't eat, drink, or brush teeth",
    setari_email_titlu: 'Send daily report',
    setari_email_sub: 'After each completed treatment',
    setari_email_label_adresa: 'Email address',
    setari_emailjs_titlu: '⚙️ EmailJS setup',
    setari_emailjs_complet: '✅ EmailJS fully configured',
    setari_emailjs_incomplet: '⚠️ Incomplete configuration',
    setari_emailjs_intro: "Lets you send a daily report by email after every treatment. Free, no server needed.<br><br>If you're stuck setting it up, check our full step-by-step guide:",
    setari_copii_activ: 'Active',
    setari_copii_activeaza: 'Activate',
    setari_copii_start: 'Start: {{data}}',
    setari_copii_nou: '+ New child / treatment',
    setari_staloral_titlu: 'Staloral search link',
    setari_staloral_intro: 'By default, the app searches for Staloral cat on Farmacia Tei. If the treatment is for another allergen, you can set a custom link.',
    setari_staloral_label: 'Custom link (leave empty for default cat)',
    setari_staloral_placeholder: 'Paste the link here...',
    setari_staloral_reseteaza: 'Reset to default',
    setari_export_titlu: 'Export / Import data',
    setari_export_btn: '📤 Export JSON',
    setari_import_btn: '📥 Import JSON',
    setari_export_hint: 'Export all data as a JSON file — for backup or transfer to another device / second parent.',
    setari_reset_titlu: 'Reset',
    setari_reset_btn: 'Delete all data',
    setari_reset_hint: 'Warning: deletes everything — treatments, history, stock. Irreversible!',
    setari_copii_titlu: 'Children / Treatments',

    onb_titlu_pas1: 'Welcome! 🐾',
    onb_titlu_pas2: 'The treatment',
    onb_titlu_pas3: 'Medical protocol',
    onb_titlu_pas4: 'Staloral — initial stock',
    onb_titlu_pas5: 'Antihistamine',
    onb_titlu_pas6: 'Done! 🎉',
    onb_pasul_x_din_y: 'Step {{step}} of {{total}}',
    onb_pornesc_aplicatia: '✅ Start the app!',
    onb_continua: 'Continue →',
    onb_welcome_titlu: 'Miau',
    onb_welcome_text: "The app that helps you manage your child's sublingual immunotherapy — timers, stock, symptoms, all in one place.",
    onb_nota_importanta: '⚠️ <strong>Important note:</strong> Miau is an organizing tool, not a medical device. Always follow the allergist\'s instructions. In case of a severe reaction, contact a doctor or emergency services immediately.',
    onb_label_nume: 'What should we call this treatment?',
    onb_placeholder_nume: 'e.g. Matei — cat',
    onb_hint_nume: 'You can add treatments for other allergens or other children later.',
    onb_label_data: 'Treatment start date',
    onb_hint_data: 'If treatment already started, enter the real start date — the app will automatically calculate the current day.',
    onb_info_protocol: "💡 The protocol is complete, from day 1. The app automatically calculates which day you're on relative to the start date.<br>If treatment already started and you don't want to enter history, you can enter just the current steps and change the start date to today.",
    onb_label_faza: 'Current phase',
    onb_faza_initiere: '🩷 Induction',
    onb_faza_initiere_sub: '10u doses (pink bottle)',
    onb_faza_mentinere: '💙 Maintenance',
    onb_faza_mentinere_sub: '100u doses (blue bottle)',
    onb_hint_faze: 'Induction = the pink 50-drop bottle × 10 units.<br>Maintenance = the blue 50-drop bottles × 100 units.<br>You mark the transition manually when the doctor decides.',
    onb_protocol_precompletat_mentinere: "We've pre-filled the standard protocol — adjust it if your doctor prescribed something else.",
    onb_protocol_precompletat_initiere: "We've pre-filled the standard induction protocol — adjust it if your doctor prescribed something else.",
    onb_btn_adauga_pas_100: '💙 Add step (100u — maintenance)',
    onb_btn_adauga_pas_10: '🩷 Add step (10u — induction)',
    onb_btn_adauga_doze_100: '💙 Add 100 doses',
    onb_hint_pasi: 'Steps apply in order, day by day, from the start date.<br>{{extra}}You can change this anytime later in Settings, without losing history.',
    onb_hint_pasi_extra_initiere: 'Add all the 10u (induction) steps first, then the 100u (maintenance) ones — it continues without a break.<br>',
    onb_info_tratament_inceput: '💡 <strong>Has treatment already started?</strong> You have two options:<br>• Enter the full protocol from day 1 and set the correct start date — the app positions itself on today automatically.<br>• Or enter only the current steps and set the start date to today — simpler, but without prior history.',
    onb_label_picaturi_flacon: 'Drops in the current bottle',
    onb_hint_picaturi_flacon: "A new bottle has 50 drops. If you've already started, enter how many are left.",
    onb_label_flacoane_rezerva: 'Reserve bottles (besides the current one)',
    onb_hint_flacoane_rezerva: 'The induction kit includes 1 pink bottle + 2 blue bottles.',
    onb_label_anti_intrebare: 'Does the child also take an antihistamine?',
    onb_label_anti_nume: 'Medicine name',
    onb_placeholder_anti_nume: 'e.g. Xyzal, Zyrtec',
    onb_label_anti_tip: 'Type',
    onb_anti_pastile: '💊 Pills',
    onb_anti_picaturi: '💧 Drops',
    onb_label_anti_stoc: 'Initial stock',
    onb_label_anti_pozitie: 'Given relative to Staloral',
    onb_anti_inainte: 'Before',
    onb_anti_dupa: 'After',
    onb_hint_anti_pozitie: 'Recommended: at least 20 minutes before Staloral.',
    onb_label_anti_interval: 'Interval relative to Staloral (minutes)',
    onb_final_titlu: 'Everything is set up!',
    onb_final_text: '<strong>{{nume}}</strong> is ready.<br><br>You can change the protocol, steps or settings anytime in the <strong>Settings ⚙️</strong> tab.<br><br>If you want daily email reports, set up <strong>EmailJS</strong> in Settings — it\'s free and takes 10 minutes.<br><br>Good luck! 🐾',
    onb_final_nume_implicit: 'The treatment',
    onb_hint_continua_data: 'Continues automatically from the previous step ({{data}}).',
    onb_sep_zile: 'days',
    onb_sep_pic: 'drops ×',
    onb_sep_u: 'u',

    protocol_row_zile: '🔢 Days',
    protocol_row_calendar: '📅 Dates',
    protocol_row_zile_placeholder: 'days',
    unitati_pe_zi: 'u/day',
    protocol_row_pic_placeholder: 'drops',

    toast_eroare_salvare: '⚠️ Error saving — storage full?',
    toast_data_invalida_min: '⚠️ The date cannot be before {{data}} (continuation of the previous step).',
    toast_data_sfarsit_invalida: '⚠️ The end date cannot be before the start date.',
    toast_3ani_completati: '3 drops × 100u → 3 years filled in automatically 🎉',
    toast_introdu_nume: 'Enter a name for the treatment!',
    toast_introdu_data: 'Enter the start date!',
    modal_ziua_sarit_titlu: 'Mark the day as skipped',
    modal_ziua_sarit_text_anti: 'Staloral was not given today — the stock will <strong>not</strong> decrease.<br>But the {{forma}} of <strong>{{nume}}</strong>?',
    modal_ziua_sarit_pastila: 'pill',
    modal_ziua_sarit_picaturile: 'drops',
    modal_ziua_sarit_da_cu_anti: '💊 Yes, the antihistamine was taken — subtract 1 from stock',
    modal_ziua_sarit_fara_anti: '✕ No, nothing was taken',
    modal_ziua_sarit_text_fara_anti: "Are you sure today's treatment couldn't be done?<br>Staloral will <strong>not</strong> be subtracted from stock.",
    modal_ziua_sarit_da: 'Yes, mark as skipped',
    modal_ziua_sarit_nu: 'No, cancel',
    toast_sarit_cu_anti: 'Skipped — antihistamine subtracted from stock.',
    toast_sarit_fara_anti: 'Day marked as skipped.',
    toast_tratament_finalizat: "🎉 Today's treatment, finished!",
    toast_completeaza_simptome: "Fill in today's symptoms 📋",
    toast_flacon_albastru_activat: '💙 Blue bottle activated! Stock reset to 50 drops.',
    milestone_tranzitie_mentinere: '💙 Transition to Maintenance (100u)',
    milestone_tranzitie_detalii: 'Blue bottle activated, stock reset to 50 drops',
    milestone_tranzitie_detalii_auto: 'Automatically calculated from the protocol entered during setup',
    milestone_faza_noua: '🔬 New phase: {{picaturi}} drops × {{unitati}}u',
    milestone_faza_anterior: 'Previous: {{picaturi}} drops × {{unitati}}u',
    milestone_pas_finalizat: '⭐ Step completed: {{label}}',
    milestone_pas_expirat_folosiri: 'Expired after {{val}} {{cuvant}}',
    milestone_pas_expirat_data: 'Expired on: {{data}}',
    cuvant_folosire: 'use',
    cuvant_folosiri: 'uses',
    toast_pas_finalizat: '✅ Step "{{label}}" has finished!',
    toast_picaturi_putine: '⚠️ Few drops left in bottle: {{ramase}} left!',
    toast_flacoane_putine: '⚠️ Few reserve bottles: {{ramase}}!',
    toast_anti_stoc_scazut: '⚠️ {{nume}}: low stock ({{stoc}} left)!',
    modal_anti_titlu: '💊 Antihistamine',
    modal_anti_activ_titlu: 'Active — the child takes an antihistamine',
    modal_anti_activ_sub: 'Disable if no longer prescribed',
    modal_anti_label_denumire: 'Medicine name',
    modal_anti_label_doza: 'Dose per administration (optional)',
    modal_anti_placeholder_doza: 'e.g. 5mg, 10ml, 2 drops',
    modal_anti_hint_doza: "As prescribed by the doctor. Shown in stock and email reports.",
    modal_anti_label_tip: 'Type',
    modal_anti_label_pozitie: 'Relative to Staloral',
    modal_anti_inainte_recomandat: 'Before (recommended)',
    modal_anti_dupa: 'After',
    modal_anti_label_interval: 'Interval relative to Staloral (minutes)',
    modal_anti_hint_interval: 'Recommended: at least 20 minutes before drops.',
    modal_anti_save: '✅ Save',
    toast_anti_actualizat: '✅ Antihistamine updated!',
    modal_pas_edit_titlu: '✏️ Edit step',
    modal_pas_nou_titlu: '➕ New step',
    modal_pas_label_descriere: 'Description (with emoji)',
    modal_pas_placeholder_descriere: '💧 Drink water now',
    modal_pas_label_durata: 'Duration (minutes) — 0 = no timer, just confirmation',
    modal_pas_label_nota: 'Explanatory note (optional)',
    modal_pas_placeholder_nota: 'e.g. You can drink water or juice',
    modal_pas_label_pozitie: 'Position in flow',
    modal_pas_inainte_de_staloral: 'Before Staloral',
    modal_pas_dupa_tratament: 'After treatment',
    modal_pas_label_expirare: 'Automatic expiry',
    modal_pas_exp_niciodata: '🔁 Never — continues forever',
    modal_pas_exp_folosiri: '🔢 After X uses',
    modal_pas_exp_folosiri_ex: '🔢 After X uses (e.g. 1 drop = 10 days)',
    modal_pas_exp_data: '📅 Until a date',
    modal_pas_label_numar_folosiri: 'Number of uses',
    modal_pas_hint_numar_folosiri: 'E.g. 10 = the step appears for 10 days and disappears automatically, leaving a trace in History.',
    modal_pas_label_expira_la: 'Expires on',
    modal_pas_adauga: '✅ Add',
    toast_pas_actualizat: '✅ Step updated!',
    toast_pas_adaugat: '✅ Step added!',
    toast_adauga_descriere: 'Add a description!',
    modal_corecteaza_pic_titlu: 'Correct drop stock',
    modal_label_pic_ramase: 'Drops left in bottle',
    modal_label_flacoane_rezerva: 'Reserve bottles',
    toast_stoc_corectat: 'Stock corrected!',
    modal_flacon_nou_titlu: 'New box / bottle',
    modal_label_cate_adaugi: 'How many {{tip}} are you adding?',
    modal_pastile: 'pills',
    modal_doze: 'doses',
    modal_btn_adauga_stoc: 'Add to stock',
    toast_adaugate_la_stoc: '+{{n}} added to stock!',
    modal_corecteaza_anti_titlu: 'Correct {{tip}}',
    modal_label_ramase: '{{tip}} left',
    toast_praguri_salvate: '✅ Thresholds saved!',
    toast_eroare_email_invalid: '⚠️ The email address is not valid!',
    toast_email_salvat: 'Email saved!',
    toast_emailjs_salvat: '✅ EmailJS configuration saved!',
    toast_tema_schimbata: '🎨 Theme changed!',
    toast_link_staloral_salvat: 'Staloral link saved!',
    toast_link_resetat: 'Link reset to default (cat).',
    toast_export_realizat: '📤 Export complete!',
    modal_export_titlu: '📤 Export data',
    modal_export_pentru_cine: 'Export for whom?',
    modal_export_toti: '📦 All ({{n}} children)',
    toast_fisier_prea_mare: "❌ File too large — doesn't look like a Miau export.",
    toast_fisier_invalid: '❌ Invalid file — not a valid JSON.',
    toast_date_importate: '✅ Data imported successfully!',
    confirm_import: 'Import {{n}} treatment(s)? Existing data will be replaced.',
    confirm_import_btn: 'Import',
    confirm_reset_1: 'Are you sure? All data will be permanently deleted!',
    confirm_reset_2: 'Final confirmation — really delete everything?',
    confirm_reset_btn_continua: 'Continue',
    confirm_reset_btn_sterge: 'Delete everything',
    toast_date_sterse: 'All data has been deleted.',
    modal_edit_protocol_titlu: '✏️ Edit protocol',
    modal_edit_protocol_text: "Changes apply to future days. History and stock remain unchanged.",
    btn_adauga_pas: '+ Add step',
    toast_pauza_protocol: '⚠️ There is a {{zile}}-{{ziCuvant}} gap between calendar steps. The protocol must be continuous!',
    toast_protocol_actualizat: '✅ Protocol updated!',
    confirm_sterge_pas: 'Delete the step "{{label}}"? This action is irreversible.',
    toast_pas_sters: 'Step deleted.',
    toast_email_activat: '📧 Email enabled',
    toast_email_dezactivat: '🔕 Email disabled',
    modal_simptome_titlu: 'Symptoms — {{data}}',
    modal_simptome_sterge_zi: "🗑️ Delete this day's entry",
    confirm_sterge_zi_finalizat: 'Delete the entry from {{data}}?\n\nThe treatment was marked as completed — stock will be restored automatically ({{picaturi}} Staloral drops{{anti}}).',
    confirm_sterge_zi_simplu: 'Delete the entry from {{data}}?',
    confirm_sterge_zi_btn: 'Delete',
    toast_intrare_stearsa_stoc: '🗑️ Entry deleted + stock restored.',
    toast_intrare_stearsa: '🗑️ Entry deleted.',
    toast_totul_ok_salvat: '✅ All good saved!',
    toast_simptome_actualizate: '📋 Symptoms updated!',
    toast_salvat_stoc_scazut: '💾 Saved + stock deducted for {{data}}!',
    toast_totul_ok_salvat_istoric: '✅ All good saved to History!',
    toast_simptome_salvate: '💾 {{n}} symptoms saved!',
    toast_flacon_nou_deschis: '🆕 New bottle opened — 50 drops',
    toast_data_expirare_salvata: '📅 Expiration date saved: {{data}}',
    toast_data_expirare_stearsa: 'Expiration date removed.',
    toast_email_trimis: '📧 Report sent by email!',
    toast_email_eroare: "⚠️ The email couldn't be sent. Check the EmailJS configuration in Settings.",
    toast_backup_niciodata: "💾 You haven't made a backup yet. Settings → Export JSON, so you don't lose your data.",
    toast_backup_vechi: '💾 {{zile}} days have passed since the last backup — export your data from Settings.',
    import_eroare_date_invalide: "The file doesn't contain valid data.",
    import_eroare_lipsesc_tratamente: "Treatments are missing — doesn't look like a Miau export.",
    import_eroare_fara_tratamente: "The file doesn't contain any treatment.",
    import_eroare_structura: 'Invalid structure — corrupted file or from another source.',
    import_eroare_protocol_corupt: 'Treatment "{{nume}}" has a corrupted protocol.',
    import_eroare_istoric_corupt: 'Treatment "{{nume}}" has corrupted history.',
    import_eroare_stocuri_corupte: 'Treatment "{{nume}}" has corrupted stock.',
    modal_export_pentru: '👤',
    email_totul_ok: 'All good — no symptoms',
    email_nicio_informatie: 'No information',
    alerta_picaturi_ramase: '💧 Only <strong>{{ramase}} drops</strong> left of Staloral in the current bottle.',
    alerta_flacoane_ramase: '📦 Only <strong>{{ramase}} {{flaconCuvant}}</strong> left in Staloral reserve.',
    alerta_anti_stoc_scazut: '💊 Low stock for <strong>{{nume}}</strong>: {{stoc}} left.',

    simptome: {
      muci: 'Runny / blocked nose',
      tuse: 'Cough',
      ragusit: 'Hoarseness',
      pete: 'Skin rash',
      mancarime: 'Itchy tongue / throat',
      lacrimare: 'Watery / red eyes',
      stranute: 'Sneezing',
      oboseala: 'Fatigue / irritability',
      greata: 'Nausea',
      edem: 'Swelling',
      altele: 'Other'
    },
    severitate: {
      usor: 'Mild',
      mediu: 'Moderate',
      sever: 'Severe'
    }
  }
};

function currentLang() {
  return S.data?.lang || localStorage.getItem('miau_lang') || 'ro';
}

function setLang(lang) {
  localStorage.setItem('miau_lang', lang);
  if (S.data) { S.data.lang = lang; saveData(); }
  render();
}

function t(key, vars) {
  const path = key.split('.');
  const lookup = (obj) => path.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  let val = lookup(LANG[currentLang()]);
  if (val === undefined) val = lookup(LANG.ro);
  if (val === undefined) return `[${key}]`;
  if (vars) {
    Object.keys(vars).forEach(k => {
      val = val.replace(new RegExp(`{{${k}}}`, 'g'), vars[k]);
    });
  }
  return val;
}

function tSimptom(id) { return t('simptome.' + id); }
function tSeveritate(id) { return t('severitate.' + id); }

const LINK_STALORAL_DEFAULT = 'https://comenzi.farmaciatei.ro/cauti/staloral+pisica?product_category=1';
const LINK_MEDRADAR  = 'https://www.medradar.ro/';
const LINK_PROSPECT  = 'https://www.anm.ro/_/_PRO/PRO_10664_15.03.18.pdf';
const LINK_SITE      = 'https://miauapp.ro';
const LINK_GHID      = 'https://miauapp.ro/ghid-instalare.html';
const LINK_DONATIE   = 'https://revolut.me/denisalvcr';

// ============================================================
//  STARE GLOBALĂ
// ============================================================

let S = {
  data: null,              // toate datele salvate
  tab: 'acasa',            // tab activ: acasa | simptome | stocuri | istoric | setari
  timers: {},              // timere active
  timerStepIdx: null,      // indexul pasului curent în buildPasi() — null = neînceput
  timerDone: false,        // timer-ul curent a expirat
  onb: { step: 1, d: {} }, // onboarding state
  simptomeCurate: false,   // după salvare, arată ecran curat
  simptomeData: null,      // data selectată în tab Simptome (null = azi)
  ejsExpanded: false,      // formular EmailJS expandat în Setări
  alerteExpanded: false,   // formular alerte stoc expandat
  wakeLock: null           // referință Wake Lock activ
};

// ============================================================
//  DATE — Model implicit
// ============================================================

function defaultData() {
  return {
    version: APP_VERSION,
    tratamente: [],
    activId: null
  };
}

function defaultTratament(partial = {}) {
  return {
    id: uid(),
    nume: '',                // ex: "Matei — pisică"
    alergen: 'pisica',
    dataStart: today(),
    protocol: [],            // [{ id, zile, picaturi, unitati }]
    antihistaminic: {
      activ: false,
      nume: '',
      tip: 'pastile',        // 'pastile' | 'picaturi'
      doza: '',              // ex: '5mg', '10ml', '2 picături'
      stoc: 0,
      stocInitial: 0,
      pozitie: 'inainte',   // 'inainte' | 'dupa'
      minute: 20
    },
    staloral: {
      flaconCurent: 50,      // picături rămase în flacon curent
      flacoaneRamase: 0,
      alertaPicaturi: 5,     // alertă la 10% din 50
      alertaFlacoane: 1,
      dataExpirare: ''       // opțional — data expirare flacon curent
    },
    email: '',
    emailActiv: false,
    emailjs: { serviceId: '', templateId: '', publicKey: '' },
    linkStaloral: '',       // link custom căutare Staloral (gol = default Farmacia Tei pisică)
    tranzitieFlacon: false, // true după ce utilizatorul confirmă trecerea la flaconul albastru
    pasiExtra: [], // pași personalizați adăugați după protocolul standard
    istoric: [],             // intrări zilnice
    creatLa: new Date().toISOString()
  };
}

function defaultProtocolInitiere() {
  return [
    { id: uid(), zile: 1, picaturi: 1, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 2, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 3, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 4, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 5, unitati: 10, tipData: 'zile' },
  ];
}

function defaultProtocolMentinere() {
  return [
    { id: uid(), zile: 7,    picaturi: 1, unitati: 100, tipData: 'zile' },
    { id: uid(), zile: 7,    picaturi: 2, unitati: 100, tipData: 'zile' },
    { id: uid(), zile: 1095, picaturi: 3, unitati: 100, tipData: 'zile' },
  ];
}

// ============================================================
//  STORAGE
// ============================================================

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) S.data = JSON.parse(raw);
    else S.data = defaultData();
  } catch {
    S.data = defaultData();
  }
  curataIstoricVechi();
}

function curataIstoricVechi() {
  if (!S.data?.tratamente) return;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 3);
  const limita = cutoff.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  let modificat = false;
  S.data.tratamente.forEach(t => {
    if (!t.istoric) return;
    const inainte = t.istoric.length;
    t.istoric = t.istoric.filter(e => e.data >= limita);
    if (t.istoric.length !== inainte) modificat = true;
  });
  if (modificat) saveData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S.data));
  } catch (e) {
    toast(t('toast_eroare_salvare'));
  }
}

const TEME_VALIDE = ['menta', 'soare', 'salvie', 'nocturn'];

function aplicaTema(tema) {
  if (!TEME_VALIDE.includes(tema)) tema = 'salvie';
  if (tema === 'menta') document.documentElement.removeAttribute('data-tema');
  else document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem('miau_tema', tema);
  const culoriBara = { menta:'#4A9B8E', soare:'#F26A4B', salvie:'#2F5D50', nocturn:'#161C2E' };
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', culoriBara[tema]);
}

function temaCurenta() {
  return localStorage.getItem('miau_tema') || 'salvie';
}

function tratamentActiv() {
  if (!S.data.activId) return null;
  return S.data.tratamente.find(t => t.id === S.data.activId) || null;
}

// ============================================================
//  UTILITARE
// ============================================================

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  // Folosim data locală (nu UTC) — evită bug-ul de timezone
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}

function formatMMSS(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ziuaTratamentului(tratament) {
  const start = new Date(tratament.dataStart);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / 86400000) + 1;
}

function pasProtocolPentruZiua(tratament, ziua) {
  return pasProtocolPentruZiuaSiData(tratament, ziua, today());
}

function pasProtocolPentruZiuaSiData(tratament, ziua, azi) {
  // Întâi verifică pașii cu date calendaristice — au prioritate
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar' && pas.dataStart && pas.dataEnd) {
      if (azi >= pas.dataStart && azi <= pas.dataEnd) return pas;
    }
  }

  // Apoi pașii cu număr de zile
  let contor = 0;
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar') continue;
    contor += (pas.zile || 0);
    if (ziua <= contor) return pas;
  }
  return tratament.protocol[tratament.protocol.length - 1] || null;
}

// Găsește data calendaristică (reală) la care tratamentul a ajuns prima dată la 100u,
// simulând ziua cu ziua de la data de start până azi — folosește exact logica live a app-ului.
function gasesteDataTransitieMentinere(t) {
  const start = new Date(t.dataStart); start.setHours(0, 0, 0, 0);
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const totalZile = Math.floor((azi - start) / 86400000) + 1;
  if (totalZile < 1) return null;
  for (let ziua = 1; ziua <= totalZile; ziua++) {
    const d = new Date(start); d.setDate(d.getDate() + ziua - 1);
    const dataStr = d.toISOString().slice(0, 10);
    const pas = pasProtocolPentruZiuaSiData(t, ziua, dataStr);
    if (pas && pas.unitati === 100) return dataStr;
  }
  return null;
}

function tratatAziExista(tratament) {
  return tratament.istoric.some(e => e.data === today());
}

function zileRamasePas(tratament, ziua) {
  const azi = today();

  // Pas calendaristic — până la dataEnd
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar' && pas.dataStart && pas.dataEnd) {
      if (azi >= pas.dataStart && azi <= pas.dataEnd) {
        const end = new Date(pas.dataEnd); end.setHours(0,0,0,0);
        const now = new Date(); now.setHours(0,0,0,0);
        return Math.ceil((end - now) / 86400000) + 1;
      }
    }
  }

  // Pas cu zile — numără câte zile mai rămân în blocul curent
  let contor = 0;
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar') continue;
    const startPas = contor + 1;
    contor += (pas.zile || 0);
    if (ziua <= contor) return contor - ziua + 1;
  }
  return null; // ultimul pas (nelimitat)
}

function toast(msg, durata = 3000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), durata);
}

function showOverlay(html) {
  const div = document.createElement('div');
  div.className = 'overlay';
  div.id = 'overlay';
  div.innerHTML = html;
  div.addEventListener('click', e => {
    if (e.target === div) closeOverlay();
    const btn = e.target.closest('button');
    if (btn && (btn.classList.contains('close-btn') || btn.getAttribute('onclick')?.includes('closeOverlay'))) {
      e.stopPropagation();
      closeOverlay();
    }
  });
  document.body.appendChild(div);
}

function closeOverlay() {
  document.getElementById('overlay')?.remove();
}

function confirmDialog(mesaj, onConfirm, { danger = false, textConfirma } = {}) {
  if (!textConfirma) textConfirma = t('confirma');
  const div = document.createElement('div');
  div.className = 'overlay';
  div.innerHTML = `
    <div class="modal">
      <div class="modal-title">${danger ? t('confirm_dialog_titlu_danger') : t('confirm_dialog_titlu')}</div>
      <p style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:16px;white-space:pre-line">${mesaj}</p>
      <div class="btn-row">
        <button class="btn btn-outline" id="confirm-dialog-cancel">${t('anuleaza')}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-dialog-ok">${textConfirma}</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
  const inchide = () => div.remove();
  div.addEventListener('click', e => { if (e.target === div) inchide(); });
  div.querySelector('#confirm-dialog-cancel').addEventListener('click', inchide);
  div.querySelector('#confirm-dialog-ok').addEventListener('click', () => { inchide(); onConfirm(); });
}

// ============================================================
//  TIMER ENGINE
// ============================================================

function startTimer(id, minutes, onDone) {
  if (S.timers[id]) clearInterval(S.timers[id].interval);
  const endTs = Date.now() + minutes * 60 * 1000;
  const durataPasMs = minutes * 60 * 1000;

  // Stochează callback-ul pentru Skip
  S.timers[id] = { endTs, interval: null, onDone };

  const interval = setInterval(() => {
    const remaining = endTs - Date.now();
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatMMSS(remaining);

    // Inelul Nocturn — fracțiunea de timp rămasă (1 = plin, 0 = gol)
    const circle = document.getElementById('timer-circle');
    if (circle) {
      const frac = Math.max(0, Math.min(1, remaining / durataPasMs));
      circle.style.setProperty('--prog', frac.toFixed(3));
    }

    if (remaining <= 0) {
      clearInterval(interval);
      if (el) el.textContent = '00:00';
      if (circle) {
        circle.classList.remove('running');
        circle.classList.add('done');
        circle.style.setProperty('--prog', '0');
      }
      delete S.timers[id];
      if (onDone) onDone();
    }
  }, 500);

  S.timers[id].interval = interval;
  requestWakeLock();
}

// ============================================================
//  WAKE LOCK — ține ecranul aprins în timpul tratamentului
// ============================================================

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    if (S.wakeLock) return; // deja activ
    S.wakeLock = await navigator.wakeLock.request('screen');
    S.wakeLock.addEventListener('release', () => { S.wakeLock = null; });
  } catch {}
}

function releaseWakeLock() {
  if (S.wakeLock) {
    S.wakeLock.release().catch(() => {});
    S.wakeLock = null;
  }
}

// Reactivează Wake Lock și AudioContext dacă ecranul a revenit
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Object.keys(S.timers).length > 0) {
    requestWakeLock();
    if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
    // Recalculează timere — dacă ecranul a fost stins, actualizăm afișajul
    for (const [id, t] of Object.entries(S.timers)) {
      const remaining = t.endTs - Date.now();
      if (remaining <= 0 && t.onDone) {
        clearInterval(t.interval);
        delete S.timers[id];
        t.onDone();
      }
    }
  }
});

function stopAllTimers() {
  Object.values(S.timers).forEach(t => clearInterval(t.interval));
  S.timers = {};
  releaseWakeLock();
  localStorage.removeItem(TIMER_KEY);
}

function saveTimerState(endTs) {
  if (S.timerStepIdx === null) { localStorage.removeItem(TIMER_KEY); return; }
  localStorage.setItem(TIMER_KEY, JSON.stringify({
    data: today(), stepIdx: S.timerStepIdx, done: S.timerDone, endTs: endTs || null
  }));
}

function restoreTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return;
    const st = JSON.parse(raw);
    if (st.data !== today()) { localStorage.removeItem(TIMER_KEY); return; }
    const t = tratamentActiv();
    if (!t || tratatAziExista(t)) { localStorage.removeItem(TIMER_KEY); return; }
    S.timerStepIdx = st.stepIdx;
    if (st.done || !st.endTs || st.endTs <= Date.now()) {
      S.timerDone = true;
    } else {
      S._restoreEndTs = st.endTs; // timer încă rulează — repornim după render
    }
  } catch { localStorage.removeItem(TIMER_KEY); }
}

// ============================================================
//  SUNET (bip simplu cu Web Audio)
// ============================================================

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // iOS suspendă contextul dacă nu e user gesture — rezumăm
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// Apelat la primul tap — deblochează AudioContext pe iOS
function initAudio() {
  try { getAudioCtx(); } catch {}
  document.removeEventListener('touchstart', initAudio);
  document.removeEventListener('mousedown', initAudio);
}
document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('mousedown', initAudio, { once: true });

function bip(frecventa = 880, durata = 0.3) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frecventa;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durata);
    osc.start();
    osc.stop(ctx.currentTime + durata);
  } catch {}
}

// ============================================================
//  RENDER PRINCIPAL
// ============================================================

function render() {
  const app = document.getElementById('app');

  // Dacă limba nu a fost încă aleasă → ecran de alegere a limbii (primul ecran absolut)
  if (!S.data.lang) {
    app.innerHTML = renderLangSelect();
    attachLangSelectEvents();
    return;
  }

  // Dacă nu există niciun tratament → onboarding
  if (!S.data.tratamente.length) {
    app.innerHTML = renderOnboarding();
    attachOnboardingEvents();
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <div class="scroll-area" id="scroll-area">
      ${renderTab()}
    </div>
    ${renderBottomNav()}
  `;
  attachMainEvents();
}

// ============================================================
//  HEADER
// ============================================================

function renderHeader() {
  const optiuni = S.data.tratamente
    .map(tr => `<option value="${tr.id}" ${tr.id === S.data.activId ? 'selected' : ''}>${tr.nume}</option>`)
    .join('');
  return `
    <div class="app-header">
      <h1>${t('header_titlu')}</h1>
      <select class="treatment-selector" id="sel-tratament">${optiuni}</select>
    </div>
  `;
}

// ============================================================
//  BOTTOM NAV
// ============================================================

function renderBottomNav() {
  const tabs = [
    { id: 'acasa',    icon: '🏠', label: t('nav_acasa') },
    { id: 'simptome', icon: '📋', label: t('nav_simptome') },
    { id: 'stocuri',  icon: '💊', label: t('nav_stocuri') },
    { id: 'istoric',  icon: '📅', label: t('nav_istoric') },
    { id: 'setari',   icon: '⚙️',  label: t('nav_setari') }
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map(t => `
        <button class="nav-btn ${S.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
          <span class="nav-icon">${t.icon}</span>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// ============================================================
//  DISPATCH TABS
// ============================================================

function renderTab() {
  switch (S.tab) {
    case 'acasa':    return renderAcasa();
    case 'simptome': return renderSimptome();
    case 'stocuri':  return renderStocuri();
    case 'istoric':  return renderIstoric();
    case 'setari':   return renderSetari();
    default:         return renderAcasa();
  }
}

// ============================================================
//  TAB: ACASĂ — tratament zilei + timere
// ============================================================

function esteZiTransitieFlacon(t) {
  if (t.tranzitieFlacon) return false; // deja confirmat
  const ziua = ziuaTratamentului(t);
  const pasAzi = pasProtocolPentruZiua(t, ziua);
  if (!pasAzi || pasAzi.unitati !== 100) return false;
  // Verifică dacă protocolul are și pași de 10u (inițiere) înainte
  const areInitiere = t.protocol.some(p => p.unitati === 10);
  return areInitiere;
}

function alerteStoc(trt) {
  const mesaje = [];
  const s = trt.staloral;
  const a = trt.antihistaminic;
  if (s.flaconCurent <= s.alertaPicaturi) {
    mesaje.push(t('alerta_picaturi_ramase', { ramase: s.flaconCurent }));
  }
  if (s.flacoaneRamase <= s.alertaFlacoane) {
    mesaje.push(t('alerta_flacoane_ramase', { ramase: s.flacoaneRamase, flaconCuvant: s.flacoaneRamase === 1 ? t('stocuri_flacon') : t('stocuri_flacoane') }));
  }
  if (a.activ && a.stocInitial && a.stoc <= Math.ceil(a.stocInitial * 0.1)) {
    mesaje.push(t('alerta_anti_stoc_scazut', { nume: a.nume || t('stocuri_antihistaminic_implicit'), stoc: a.stoc }));
  }
  return mesaje;
}

function trebuieBannerStocAscuns(trt) {
  return trt.alertaStocAscunsaLa === today();
}

function trebuieBannerInstalare() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return false;
  if (S.data.bannerInstalareAscunsLa === 'pentru-totdeauna') return false;
  return true;
}

function renderAcasa() {
  const trt = tratamentActiv();
  if (!trt) return `<div class="empty-state"><div class="empty-icon">😿</div><p>${t('niciun_tratament_activ')}</p></div>`;

  const ziua = ziuaTratamentului(trt);
  const pas = pasProtocolPentruZiua(trt, ziua);
  const tratatAzi = tratatAziExista(trt);
  const faza = pas ? (pas.unitati === 10 ? t('acasa_faza_initiere') : t('acasa_faza_mentinere')) : t('acasa_faza_mentinere');
  const tranzitie = esteZiTransitieFlacon(trt);
  const zileRamase = pas ? zileRamasePas(trt, ziua) : null;

  const alerte = alerteStoc(trt);

  return `
    ${(alerte.length > 0 && !trebuieBannerStocAscuns(trt)) ? `
    <div class="card" style="border:2px solid var(--danger);background:#FFF0F0">
      <div style="font-size:14px;font-weight:700;color:#C00000;margin-bottom:6px">${t('acasa_stoc_scazut_titlu')}</div>
      <div style="font-size:13px;color:#C00000;line-height:1.6;margin-bottom:10px">
        ${alerte.join('<br>')}
      </div>
      <button class="btn btn-danger" id="btn-ascunde-alerta-stoc">${t('acasa_stoc_scazut_ok')}</button>
    </div>
    ` : ''}
    ${trebuieBannerInstalare() ? `
    <div class="card" style="border:2px solid var(--warning);background:#FFF8EC">
      <div style="font-size:14px;font-weight:700;color:#7A5500;margin-bottom:6px">${t('acasa_instalare_titlu')}</div>
      <div style="font-size:13px;color:#7A5500;line-height:1.5;margin-bottom:10px">
        ${t('acasa_instalare_text')}
      </div>
      <div style="display:flex;gap:8px">
        <a href="${LINK_GHID}" target="_blank" class="btn btn-primary" style="flex:1;text-align:center;text-decoration:none">${t('acasa_instalare_vezi_cum')}</a>
        <button class="btn btn-outline" id="btn-ascunde-banner-instalare">${t('acasa_instalare_am_facut')}</button>
      </div>
    </div>
    ` : ''}
    ${tranzitie ? `
    <div style="background:linear-gradient(135deg,#EEF4FF,#E0EAFF);border:2px solid #5B9BD5;
      border-radius:14px;padding:16px;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:#1A4A8A;margin-bottom:6px">
        ${t('acasa_tranzitie_titlu')}
      </div>
      <div style="font-size:13px;color:#2A5A9A;line-height:1.6;margin-bottom:14px">
        ${t('acasa_tranzitie_text')}
      </div>
      <button class="btn" id="btn-confirma-tranzitie"
        style="background:#3A7ABD;color:white;border:none;width:100%;padding:13px;
          border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">
        ${t('acasa_tranzitie_btn')}
      </button>
    </div>
    ` : ''}

    <!-- Card protocol azi -->
    <div class="card card-pink">
      <div class="card-title">${t('acasa_card_titlu', { data: formatDate(today()) })}</div>
      <div class="protocol-today">
        <div class="protocol-day">${t('acasa_ziua_din_tratament', { ziua })}</div>
        ${pas ? `
          <div class="protocol-dose">
            ${pas.picaturi} ${pas.picaturi === 1 ? t('acasa_picatura') : t('acasa_picaturi')}
            <span>× ${pas.unitati} ${t('acasa_unitati')}</span>
          </div>
          <span class="protocol-phase ${faza === t('acasa_faza_mentinere') ? 'mentinere' : ''}">${t('acasa_unitati_total', { faza, total: pas.picaturi * pas.unitati })}</span>
          ${zileRamase !== null ? `
            <div style="margin-top:8px;font-size:12px;color:var(--text-light)">
              ${zileRamase === 1
                ? t('acasa_ultima_zi')
                : t('acasa_zile_ramase', { verb: zileRamase === 2 ? 'e' : 'sunt', zile: zileRamase, ziCuvant: zileRamase === 1 ? t('simptome_zi') : t('simptome_zile') })}
            </div>
          ` : `
            <div style="margin-top:8px;font-size:12px;color:var(--text-light)">
              ${t('acasa_doza_mentinere')}
            </div>
          `}
        ` : `<p style="color:var(--text-light)">${t('acasa_protocol_neconfigurat')}</p>`}
      </div>
    </div>

    ${!tratatAzi && pas && new Date().getHours() >= 20 ? `
      <div style="background:#FFF0DC;border:1px solid #FFD060;border-radius:10px;
        padding:10px 14px;margin-bottom:8px;font-size:13px;color:#7A5500;text-align:center">
        ${t('acasa_tarziu')}
      </div>
    ` : ''}

    ${tratatAzi ? renderTimereInactive(trt) : renderTimere(trt)}

    <!-- Hint protocol -->
    <p style="font-size:12px;color:var(--text-light);text-align:center;margin-bottom:12px">
      ${t('acasa_hint_protocol')}
    </p>

    <!-- Linkuri rapide -->
    <div class="card">
      <div class="card-title">${t('acasa_linkuri_titlu')}</div>
      <div class="links-grid">
        ${renderLinkuri(trt)}
      </div>
    </div>

    ${!tratatAzi && pas ? `
      <button class="btn btn-outline" id="btn-sari">${t('acasa_sarit_btn')}</button>
    ` : ''}

    ${!pas ? `
      <div style="background:var(--bg);border-radius:10px;padding:14px;text-align:center;
        font-size:13px;color:var(--text-light)">
        ${t('acasa_protocol_neconfigurat_setari')}
      </div>
    ` : ''}
  `;
}

function renderTimere(trt) {
  const idx  = S.timerStepIdx;   // null = neînceput, 0,1,2... = pasul curent
  const pasi = buildPasi(trt);

  return `
    <div class="card">
      <div class="card-title">${t('pasi_titlu')}</div>
      <div class="steps-list">
        ${pasi.map((p, i) => {
          const done   = idx !== null && (i < idx || (i === idx && S.timerDone));
          const active = idx !== null && i === idx && !S.timerDone;
          const cls    = done ? 'done' : (active ? 'active' : 'waiting');
          return `
            <div class="step-item">
              <div class="step-number ${cls}">${done ? '✓' : (i + 1)}</div>
              <div class="step-info">
                <div class="step-title">${p.label}</div>
                <div class="step-sub">${p.sub}</div>
                ${active ? `
                  <div style="margin-top:8px;display:flex;align-items:center;gap:12px">
                    <div id="timer-circle" class="timer-circle running"
                      style="width:80px;height:80px;margin:0;border-width:4px">
                      <span id="timer-display" class="timer-time" style="font-size:20px">
                        ${formatMMSS(p.minute * 60000)}
                      </span>
                    </div>
                    <button class="btn btn-outline btn-small" id="btn-skip-timer"
                      style="font-size:13px;padding:10px 14px;width:auto">
                      ${t('pasi_continua_acum')}
                    </button>
                  </div>
                ` : ''}
              </div>
              <div class="step-action">
                ${idx === null && i === 0 ? `
                  <button class="btn btn-primary btn-small" id="btn-start-pas">${t('pasi_start')}</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${idx !== null && S.timerDone && idx < pasi.length - 1 ? `
        <div style="margin-top:12px">
          <button class="btn btn-success" id="btn-pas-urmator" data-idx="${idx + 1}">
            ${pasi[idx + 1].label} ▶
          </button>
        </div>
      ` : ''}
      ${idx !== null && S.timerDone && idx === pasi.length - 1 ? `
        <div style="margin-top:12px">
          <button class="btn btn-success" id="btn-finalizeaza">
            ${t('pasi_finalizeaza')}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDonatii() {
  return `
    <div style="background:linear-gradient(135deg,#FFF8EC,#FFF0DC);border-radius:14px;
      padding:14px 16px;margin-bottom:12px;border:1px solid #FFE0A0;
      display:flex;align-items:center;gap:12px">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#7A5500;margin-bottom:2px">
          ${t('donatii_titlu')}
        </div>
        <div style="font-size:12px;color:#A07020;line-height:1.4">
          ${t('donatii_text')}
        </div>
      </div>
      <a href="${LINK_DONATIE}" target="_blank" rel="noopener"
        style="display:block;text-align:center;padding:10px 16px;white-space:nowrap;
          background:white;border:2px solid #FFD060;border-radius:10px;
          font-size:13px;font-weight:700;color:#7A5500;text-decoration:none;
          box-shadow:0 1px 4px rgba(0,0,0,0.06);flex-shrink:0">
        ${t('donatii_btn')}
      </a>
    </div>
  `;
}

function renderLinkuri(trt) {
  const linkStaloral = trt.linkStaloral || LINK_STALORAL_DEFAULT;
  return `
    <div style="display:flex;align-items:center;gap:6px">
      <a href="${linkStaloral}" target="_blank" class="link-btn" style="flex:1">
        <span class="link-icon">🛒</span>
        <span>${t('link_staloral')}</span>
        <span class="link-arrow">↗</span>
      </a>
    </div>
    <a href="${LINK_MEDRADAR}" target="_blank" class="link-btn">
      <span class="link-icon">💊</span>
      <span>${t('link_medradar')}</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_PROSPECT}" target="_blank" class="link-btn">
      <span class="link-icon">📄</span>
      <span>${t('link_prospect')}</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_SITE}" target="_blank" class="link-btn">
      <span class="link-icon">🌐</span>
      <span>${t('link_site')}</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_GHID}" target="_blank" class="link-btn">
      <span class="link-icon">📱</span>
      <span>${t('link_ghid')}</span>
      <span class="link-arrow">↗</span>
    </a>
  `;
}

// ============================================================
//  TAB: SIMPTOME
// ============================================================

function renderSimptome() {
  const trt = tratamentActiv();
  if (!trt) return `<div class="empty-state"><div class="empty-icon">😿</div><p>${t('niciun_tratament_activ')}</p></div>`;

  const dataSelectata = S.simptomeData || today();
  const esteAzi = dataSelectata === today();
  const intrareZi = trt.istoric.find(e => e.data === dataSelectata);
  const simptomeZi = S.simptomeCurate ? [] : (intrareZi?.simptome || []);

  // Calculează doza pentru ziua selectată (pentru log retroactiv)
  const ziuaNr = (() => {
    const start = new Date(trt.dataStart); start.setHours(0,0,0,0);
    const sel   = new Date(dataSelectata); sel.setHours(0,0,0,0);
    return Math.floor((sel - start) / 86400000) + 1;
  })();
  const pasZi = ziuaNr > 0 ? pasProtocolPentruZiua(trt, ziuaNr) : null;

  return `
    <div class="card">
      <!-- Selector dată -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <label style="font-size:13px;font-weight:600;color:var(--text-light);text-transform:uppercase;
          letter-spacing:0.3px;white-space:nowrap">${t('simptome_data_label')}</label>
        <input type="date" id="sim-data" value="${dataSelectata}" max="${today()}"
          style="flex:1;padding:8px 12px;border:2px solid ${esteAzi ? 'var(--teal)' : 'var(--warning)'};
            border-radius:8px;font-size:14px;font-weight:600">
        ${!esteAzi ? `<span style="font-size:12px;color:var(--warning);font-weight:600">${t('simptome_zi_trecuta')}</span>` : ''}
      </div>

      ${!esteAzi && pasZi ? `
        <!-- Log retroactiv — opțiune scădere stoc -->
        <div style="background:var(--blue-light);border-radius:10px;padding:12px;margin-bottom:14px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">
            ${t('simptome_protocol_pentru', { data: formatDate(dataSelectata), picaturi: pasZi.picaturi, unitati: pasZi.unitati })}
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="checkbox" id="chk-scade-stoc" ${intrareZi?.finalizat ? 'checked' : ''}>
            ${t('simptome_efectuat_chk')}
          </label>
        </div>
      ` : ''}

      <button class="btn btn-success" id="btn-totul-ok" style="margin-bottom:14px">
        ${t('simptome_totul_ok')}
      </button>

      <div id="hint-simptome-goale" style="display:none;background:#FFF0DC;border:1px solid #FFD060;
        border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#7A5500;text-align:center">
        ${t('simptome_hint_gol')}
      </div>

      <div class="divider"></div>
      <p style="font-size:13px;color:var(--text-light);margin:10px 0 12px">
        ${esteAzi ? t('simptome_bifeaza_azi') : t('simptome_bifeaza_data', { data: formatDate(dataSelectata) })}
      </p>

      <div id="symptom-list" style="display:flex;flex-direction:column;gap:8px">
        ${SIMPTOME.map(s => {
          const sel = simptomeZi.find(x => x.id === s.id);
          return `
            <div class="symptom-row" data-id="${s.id}"
              style="padding:12px;border:2px solid ${sel ? 'var(--teal)' : '#DDF0ED'};border-radius:10px;
                     background:${sel ? 'var(--teal-light)' : 'white'};cursor:pointer;transition:all 0.15s">
              <div style="display:flex;align-items:center;gap:10px;pointer-events:none">
                <span style="font-size:20px">${s.label.split(' ')[0]}</span>
                <span style="font-size:14px;flex:1;font-weight:${sel ? '600' : '400'}">
                  ${tSimptom(s.id)}
                </span>
                <span style="font-size:18px;color:${sel ? 'var(--teal)' : '#CCC'}">${sel ? '✓' : '○'}</span>
              </div>
              ${sel ? `
                <div class="severity-row" style="margin-top:10px" onclick="event.stopPropagation()">
                  ${SEVERITATE.map(sv => `
                    <button class="sev-btn ${sv.id} ${sel.severitate === sv.id ? 'sel' : ''}"
                      data-symptom="${s.id}" data-sev="${sv.id}">${sv.emoji} ${tSeveritate(sv.id)}</button>
                  `).join('')}
                </div>
                ${s.cuDetalii ? `
                  <input type="text" class="altele-detalii" placeholder="${t('simptome_placeholder_detalii')}"
                    value="${sel.detalii || ''}"
                    onclick="event.stopPropagation()"
                    style="margin-top:8px;width:100%;padding:8px 10px;border:1px solid #DDF0ED;
                      border-radius:8px;font-size:13px;box-sizing:border-box">
                ` : ''}
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn btn-primary" id="btn-salveaza-simptome" style="margin-top:16px">
        ${t('simptome_salveaza_istoric')}
      </button>
    </div>
  `;
}

// ============================================================
//  TAB: STOCURI
// ============================================================

function renderStocuri() {
  const trt = tratamentActiv();
  if (!trt) return `<div class="empty-state"><div class="empty-icon">😿</div><p>${t('niciun_tratament_activ')}</p></div>`;

  const s = trt.staloral;
  const a = trt.antihistaminic;
  const picAlert = s.flaconCurent <= s.alertaPicaturi;
  const flaconAlert = s.flacoaneRamase <= s.alertaFlacoane;

  // Estimare „îți ajunge ~N zile"
  const pasAzi = pasProtocolPentruZiua(trt, ziuaTratamentului(trt));
  const dozaZi = pasAzi?.picaturi || 0;
  const flaconPlinPic = 50;
  let estimText = '';
  if (dozaZi > 0) {
    const zile = Math.floor(s.flaconCurent / dozaZi);
    const d = new Date(); d.setDate(d.getDate() + zile);
    estimText = t('stocuri_ajunge', { zile, ziCuvant: zile === 1 ? t('istoric_zi') : t('istoric_zile'), data: formatDate(d.toISOString().slice(0,10)) });
  }
  const fillPct = Math.max(0, Math.min(100, Math.round(s.flaconCurent / flaconPlinPic * 100)));

  return `
    <!-- Staloral -->
    <div class="card card-pink">
      <div class="card-title">${t('stocuri_staloral_titlu')}</div>
      <div style="display:flex;gap:18px;align-items:center;margin-bottom:12px">
        <div class="stock-bottle"><div class="stock-fill" style="height:${fillPct}%"></div></div>
        <div style="flex:1">
          <div class="stock-value ${picAlert ? 'stock-alert' : ''}">${s.flaconCurent} <span style="font-size:15px;font-weight:600;color:var(--text-light)">/ ${flaconPlinPic} ${t('protocol_row_pic_placeholder')}</span></div>
          ${picAlert ? `<div style="font-size:11px;color:var(--danger);font-weight:600;margin-top:4px">${t('stocuri_stoc_scazut')}</div>` : ''}
          ${estimText ? `<div class="badge badge-pink" style="margin-top:8px;display:inline-block">⏳ ${estimText}</div>` : ''}
        </div>
      </div>
      <div class="stock-pips">
        <span style="font-size:12.5px;color:var(--text-light);font-weight:600">${t('stocuri_rezerva')}</span>
        ${Array.from({length: Math.max(s.flacoaneRamase, 0)}).map(()=>'<i class="pip on"></i>').join('')}
        <span style="font-size:12.5px;color:var(--text-light)">${s.flacoaneRamase} ${s.flacoaneRamase === 1 ? t('stocuri_flacon') : t('stocuri_flacoane')}</span>
        ${flaconAlert ? `<span style="font-size:11px;color:var(--warning);font-weight:600;margin-left:4px">${t('stocuri_putine')}</span>` : ''}
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn btn-outline btn-small" id="btn-flacon-nou">${t('stocuri_flacon_nou')}</button>
        <button class="btn btn-outline btn-small" id="btn-corecteaza">${t('stocuri_corecteaza')}</button>
      </div>
      <p class="hint" style="margin-top:8px">${t('stocuri_hint_corectare')}</p>

      <!-- Data expirare opțională -->
      <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
        <label style="font-size:12px;color:var(--text-light);white-space:nowrap">${t('stocuri_expira_la')}</label>
        <input type="date" id="input-data-expirare" value="${s.dataExpirare || ''}"
          style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:13px">
        <button class="btn btn-outline btn-small" id="btn-salveaza-expirare"
          style="width:auto;padding:6px 12px;font-size:12px">${t('stocuri_salveaza')}</button>
      </div>

      ${s.dataExpirare ? (() => {
        const azi = today();
        const zileRamase = Math.ceil((new Date(s.dataExpirare) - new Date(azi)) / 86400000);
        const expirat = zileRamase < 0;
        const aproape = zileRamase >= 0 && zileRamase <= 30;
        if (expirat) return `
          <div style="margin-top:10px;background:#FFF0F0;border:1px solid #F5B0B0;border-radius:10px;
            padding:10px 12px;font-size:13px;color:#C00000;display:flex;align-items:center;gap:8px">
            ${t('stocuri_expirat')}
          </div>`;
        if (aproape) return `
          <div style="margin-top:10px;background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;
            padding:10px 12px;font-size:13px;color:#7A5500;display:flex;align-items:center;gap:8px">
            ${t('stocuri_atentie_expirare', { zile: zileRamase, ziCuvant: zileRamase === 1 ? t('istoric_zi') : t('istoric_zile'), data: formatDate(s.dataExpirare) })}
          </div>`;
        return `
          <div style="margin-top:10px;background:var(--bg);border-radius:10px;
            padding:8px 12px;font-size:12px;color:var(--text-light)">
            ${t('stocuri_data_expirare_info', { data: formatDate(s.dataExpirare), zile: zileRamase })}
          </div>`;
      })() : ''}
    </div>

    ${a.activ ? `
      <!-- Antihistaminic -->
      <div class="card card-blue">
        <div class="card-title">💊 ${a.nume || t('stocuri_antihistaminic_implicit')}${a.doza ? ` — ${a.doza}` : ''}</div>
        <div class="stock-grid">
          <div class="stock-item">
            <div class="stock-icon">${a.tip === 'pastile' ? '💊' : '💧'}</div>
            <div class="stock-value ${a.stoc <= Math.ceil(a.stocInitial * 0.1) ? 'stock-alert' : ''}">${a.stoc}</div>
            <div class="stock-label">${a.tip === 'pastile' ? t('stocuri_pastile_ramase') : t('stocuri_doze_ramase')}</div>
          </div>
          <div class="stock-item">
            <div class="stock-icon">📊</div>
            <div class="stock-value">${a.stocInitial ? Math.round((a.stoc / a.stocInitial) * 100) : 0}%</div>
            <div class="stock-label">${t('stocuri_din_stoc_initial')}</div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-outline btn-small" id="btn-cutie-noua">${t('stocuri_cutie_noua')}</button>
          <button class="btn btn-outline btn-small" id="btn-corecteaza-anti">${t('stocuri_corecteaza')}</button>
        </div>
      </div>
    ` : ''}

    <!-- Praguri alerte -->
    <div class="card">
      <div class="card-title">${t('stocuri_praguri_titlu')}</div>
      ${!S.alerteExpanded ? `
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:10px 12px;background:var(--bg);border-radius:10px">
          <div style="font-size:13px;color:var(--text-light)">
            ${t('stocuri_alerta_la', { picaturi: s.alertaPicaturi, flacoane: s.alertaFlacoane })}
          </div>
          <button class="btn btn-outline btn-small" id="btn-alerte-edit"
            style="width:auto;padding:6px 12px;font-size:12px">${t('editeaza')}</button>
        </div>
      ` : `
        <div class="form-group">
          <label>${t('stocuri_label_alerta_picaturi')}</label>
          <input type="number" id="alert-picaturi" value="${s.alertaPicaturi}" min="1" max="50">
          <p class="hint">${t('stocuri_hint_alerta_picaturi')}</p>
        </div>
        <div class="form-group">
          <label>${t('stocuri_label_alerta_flacoane')}</label>
          <input type="number" id="alert-flacoane" value="${s.alertaFlacoane}" min="0" max="10">
        </div>
        <div class="btn-row">
          <button class="btn btn-outline" id="btn-alerte-cancel">${t('anuleaza')}</button>
          <button class="btn btn-primary" id="btn-salveaza-alerte">${t('salveaza')}</button>
        </div>
      `}
    </div>
  `;
}

// ============================================================
//  TAB: ISTORIC — cu sub-taburi Grafic | Listă
// ============================================================

const SIMPTOME_CULORI = {
  muci:       '#4A9B8E',
  tuse:       '#4A7FB5',
  ragusit:    '#C07840',
  pete:       '#D06060',
  mancarime:  '#E0A840',
  lacrimare:  '#5BA0C8',
  stranute:   '#8E72B5',
  oboseala:   '#6DBF8E',
  greata:     '#D4759F',
  edem:       '#FF8C42',
  altele:     '#AAA'
};

function renderIstoric() {
  const trt = tratamentActiv();
  if (!trt) return `<div class="empty-state"><div class="empty-icon">😿</div><p>${t('niciun_tratament_activ')}</p></div>`;

  return `
    ${renderGraficSimptome(trt)}
    ${renderListaIstorica(trt)}
  `;
}

function renderGraficSimptome(trt) {
  // Ultimele 14 zile — date locale, nu UTC
  const azi = new Date();
  const zile30 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(azi);
    d.setDate(azi.getDate() - i);
    zile30.push(localDateStr(d));
  }

  // Calculează frecvența fiecărui simptom în ultimele 30 de zile
  const frecventa = {};
  SIMPTOME.forEach(s => { frecventa[s.id] = 0; });
  let zileCuDateAzi = 0;
  let zileOk = 0;
  let zileFaraMentiune = 0;

  for (const data of zile30) {
    const intrare = trt.istoric.find(e => e.data === data);
    if (!intrare) { zileFaraMentiune++; continue; }
    if (intrare.totulOk) { zileOk++; continue; }
    if (intrare.simptome?.length) {
      zileCuDateAzi++;
      intrare.simptome.forEach(s => { if (frecventa[s.id] !== undefined) frecventa[s.id]++; });
    } else {
      zileFaraMentiune++;
    }
  }

  // Filtrare simptome cu cel puțin 1 apariție
  const simptomeActive = SIMPTOME
    .filter(s => frecventa[s.id] > 0)
    .map(s => ({ ...s, count: frecventa[s.id], culoare: SIMPTOME_CULORI[s.id] || '#AAA' }))
    .sort((a, b) => b.count - a.count);

  const svgChart = simptomeActive.length > 0
    ? renderDonut(simptomeActive, zileCuDateAzi, 14)
    : renderDonutOk(zileOk, zileFaraMentiune);

  return `
    <div class="card">
      <div class="card-title">${t('istoric_grafic_titlu')}</div>

      <!-- Chart -->
      <div style="display:flex;flex-direction:column;align-items:center;padding:8px 0">
        ${svgChart}
      </div>

      ${simptomeActive.length > 0 ? `
        <!-- Legendă -->
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          ${simptomeActive.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;
              background:var(--bg);border-radius:8px">
              <div style="width:14px;height:14px;border-radius:50%;background:${s.culoare};flex-shrink:0"></div>
              <span style="flex:1;font-size:14px">${tSimptom(s.id)}</span>
              <span style="font-weight:700;font-size:16px;color:${s.culoare}">${s.count}</span>
              <span style="font-size:12px;color:var(--text-light)">${s.count === 1 ? t('istoric_zi') : t('istoric_zile')}</span>
            </div>
          `).join('')}
        </div>

        <!-- Sumar -->
        <div style="display:flex;gap:8px;margin-top:12px">
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--danger)">${zileCuDateAzi}</div>
            <div style="font-size:11px;color:var(--text-light)">${t('istoric_zile_cu_simptome')}</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--success)">${zileOk}</div>
            <div style="font-size:11px;color:var(--text-light)">${t('istoric_zile_ok')}</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--text-light)">${zileFaraMentiune}</div>
            <div style="font-size:11px;color:var(--text-light)">${t('istoric_fara_inreg')}</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDonutOk(zileOk, zileFaraMentiune) {
  const cx = 90, cy = 90, r = 60;
  const C = 2 * Math.PI * r;
  const total = 14;
  const dashOk   = (zileOk / total) * C;
  const dashGray = (zileFaraMentiune / total) * C;
  const gap = C - dashOk - dashGray;

  return `
    <svg viewBox="0 0 180 180" width="180" height="180">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E0EDEA" stroke-width="24"/>
      ${zileOk > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="#4A9B8E" stroke-width="24"
        stroke-dasharray="${dashOk.toFixed(2)} ${(C - dashOk).toFixed(2)}"
        stroke-dashoffset="${(C * 0.25).toFixed(2)}"
        stroke-linecap="butt"/>` : ''}
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="28" font-weight="800" fill="#1E3230">${zileOk}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="#6A8C88">${t('istoric_zile_ok_scurt')}</text>
      <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="13" font-weight="700" fill="#4A9B8E">${t('istoric_din_14')}</text>
    </svg>
  `;
}

function renderDonut(simptomeActive, zileCuSimptome, totalZile) {
  const r  = 60;
  const cx = 90, cy = 90;
  const C  = 2 * Math.PI * r; // circumference
  const totalCount = simptomeActive.reduce((acc, s) => acc + s.count, 0);

  // Fundal
  let arcs = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E0EDEA" stroke-width="24"/>`;

  // Calculăm unghiurile — rotim din -90° (sus)
  let angleParcurs = -90;
  for (const s of simptomeActive) {
    const grade = (s.count / totalCount) * 360;
    const gradeUtil = Math.max(0, grade - 2); // mic gap între segmente
    const dash = (gradeUtil / 360) * C;
    const gap  = C - dash;
    arcs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${s.culoare}" stroke-width="24"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="${((90 + angleParcurs) / 360 * C * -1).toFixed(2)}"
      transform="rotate(${angleParcurs + 90} ${cx} ${cy})"
      stroke-linecap="butt"/>`;
    angleParcurs += grade;
  }

  // Text central
  const pct = Math.round((zileCuSimptome / totalZile) * 100);
  arcs += `
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="28" font-weight="800" fill="#1E3230">${zileCuSimptome}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="#6A8C88">${t('istoric_din_14_zile')}</text>
    <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="13" font-weight="700"
      fill="${pct > 30 ? '#D06060' : '#4A9B8E'}">${pct}%</text>
  `;

  return `<svg viewBox="0 0 180 180" width="180" height="180" style="overflow:visible">${arcs}</svg>`;
}

function renderListaIstorica(trt) {
  const milestones = (trt.milestones || []).map(m => ({ ...m, _tip: 'milestone' }));
  const intrari = trt.istoric.map(e => ({ ...e, _tip: 'intrare' }));

  // Combină și sortează descrescător după dată
  const toate = [...intrari, ...milestones]
    .sort((a, b) => b.data.localeCompare(a.data) || (b._tip === 'milestone' ? 1 : -1));

  if (!toate.length) return `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>${t('istoric_gol_titlu')}</p>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">${t('istoric_lista_titlu', { nume: trt.nume })}</div>
      ${toate.map(item => {
        if (item._tip === 'milestone') {
          return `
            <div style="display:flex;gap:10px;align-items:center;padding:8px 10px;
              background:linear-gradient(135deg,#FFF8EC,#FFF3DC);border-radius:10px;
              border-left:3px solid var(--warning);margin-bottom:4px">
              <span style="font-size:18px;flex-shrink:0">${item.label.split(' ')[0]}</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:#7A5500">
                  ${item.label.split(' ').slice(1).join(' ')}
                </div>
                <div style="font-size:11px;color:var(--text-light)">${formatDate(item.data)} · ${item.detalii}</div>
              </div>
            </div>
          `;
        }
        const e = item;
        const simStr = e.totulOk ? t('istoric_totul_ok') :
          e.simptome?.length ? e.simptome.map(s => {
            const info = SIMPTOME.find(x => x.id === s.id);
            const sev  = SEVERITATE.find(x => x.id === s.severitate);
            return `${info?.label.split(' ')[0]} ${sev?.emoji || ''}`;
          }).join('  ') : '—';
        return `
          <div class="history-item" data-hist-data="${e.data}" style="cursor:pointer">
            <div class="history-date">
              <div style="font-size:11px;font-weight:600">${formatDate(e.data).slice(0,5)}</div>
              <div style="font-size:10px;color:var(--text-light)">${formatDate(e.data).slice(6)}</div>
            </div>
            <div class="history-icon">${e.sarit ? '⏭️' : (e.finalizat || e.picaturi > 0) ? '✅' : '📋'}</div>
            <div class="history-info">
              <div class="history-title">
                ${e.sarit ? t('istoric_sarit') : (e.finalizat || e.picaturi > 0)
                  ? `${e.picaturi} ${t('protocol_row_pic_placeholder')} × ${e.unitati}u`
                  : t('istoric_simptome_inregistrate')}
              </div>
              <div class="history-sub">${simStr}</div>
            </div>
            <div style="color:var(--text-light);font-size:16px;padding:0 4px">›</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
//  TAB: SETĂRI
// ============================================================

function sectiune(id, icon, titlu, dreapta, contentHTML) {
  const open = !!S.setariOpen[id];
  return `
    <div class="set-acc ${open ? 'open' : ''}">
      <button class="set-acc-head" data-acc="${id}">
        <span class="set-acc-icon">${icon}</span>
        <span class="set-acc-title">${titlu}</span>
        ${dreapta ? `<span class="set-acc-meta">${dreapta}</span>` : ''}
        <span class="set-acc-chevron">⌄</span>
      </button>
      ${open ? `<div class="set-acc-body">${contentHTML}</div>` : ''}
    </div>
  `;
}

function temaNume(id) {
  return {
    menta: t('tema_menta_nume'), soare: t('tema_soare_nume'),
    salvie: t('tema_salvie_nume'), nocturn: t('tema_nocturn_nume')
  }[id] || t('tema_menta_nume');
}

function renderSetari() {
  const trt = tratamentActiv();
  S.setariOpen = S.setariOpen || {};
  const tema = temaCurenta();
  const lang = currentLang();
  const teme = [
    { id:'menta',   nume:t('tema_menta_nume'),   desc:t('tema_menta_desc'),   c:['#4A9B8E','#5BA0C8','#F0F8F6'] },
    { id:'soare',   nume:t('tema_soare_nume'),   desc:t('tema_soare_desc'),   c:['#F26A4B','#FF8C61','#FFF6EF'] },
    { id:'salvie',  nume:t('tema_salvie_nume'),  desc:t('tema_salvie_desc'),  c:['#2F5D50','#7BA593','#F4F2E9'] },
    { id:'nocturn', nume:t('tema_nocturn_nume'), desc:t('tema_nocturn_desc'), c:['#161C2E','#5BE3C0','#232C46'] },
  ];

  const continutLimba = `
    <div style="display:flex;gap:10px">
      <button data-lang-set="ro"
        style="flex:1;padding:12px;border-radius:12px;cursor:pointer;text-align:center;font-weight:700;font-size:15px;
          background:${lang==='ro'?'var(--teal-light)':'var(--bg)'};
          border:2px solid ${lang==='ro'?'var(--teal)':'transparent'};color:var(--text)">
        ${lang==='ro' ? '✓ ' : ''}${t('setari_limba_ro')}
      </button>
      <button data-lang-set="en"
        style="flex:1;padding:12px;border-radius:12px;cursor:pointer;text-align:center;font-weight:700;font-size:15px;
          background:${lang==='en'?'var(--teal-light)':'var(--bg)'};
          border:2px solid ${lang==='en'?'var(--teal)':'transparent'};color:var(--text)">
        ${lang==='en' ? '✓ ' : ''}${t('setari_limba_en')}
      </button>
    </div>
  `;

  const continutTema = `
    <p class="hint" style="margin-bottom:12px">${t('setari_tema_hint')}</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${teme.map(tm => `
        <button class="tema-optiune" data-tema-set="${tm.id}"
          style="display:flex;align-items:center;gap:14px;padding:12px;cursor:pointer;
            border-radius:14px;background:${tema===tm.id?'var(--teal-light)':'var(--bg)'};
            border:2px solid ${tema===tm.id?'var(--teal)':'transparent'};text-align:left;width:100%">
          <span style="display:flex;border-radius:10px;overflow:hidden;flex-shrink:0;
            box-shadow:0 1px 4px rgba(0,0,0,0.12)">
            <span style="width:20px;height:40px;background:${tm.c[0]}"></span>
            <span style="width:20px;height:40px;background:${tm.c[1]}"></span>
            <span style="width:20px;height:40px;background:${tm.c[2]}"></span>
          </span>
          <span style="flex:1">
            <span style="display:block;font-weight:700;font-size:16px;color:var(--text)">${tm.nume}</span>
            <span style="display:block;font-size:12.5px;color:var(--text-light)">${tm.desc}</span>
          </span>
          ${tema===tm.id
            ? '<span style="width:24px;height:24px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0">✓</span>'
            : '<span style="width:24px;height:24px;border-radius:50%;border:2px solid var(--border);flex-shrink:0"></span>'}
        </button>
      `).join('')}
    </div>
  `;

  const continutProtocolFlux = trt ? `
      <!-- Protocol -->
      <div style="margin-bottom:12px">
        ${trt.protocol.map((p, i) => {
          const desc = p.tipData === 'calendar'
            ? `${formatDate(p.dataStart)} → ${formatDate(p.dataEnd)}`
            : `${p.zile} ${p.zile === 1 ? t('setari_protocol_zi') : t('setari_protocol_zile')}`;
          return `
            <div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #EAF4F2">
              <span style="color:var(--text-light);font-size:13px;width:20px">${i+1}.</span>
              <span style="font-size:14px">${desc} × ${p.picaturi} ${t('protocol_row_pic_placeholder')} × ${p.unitati}u = <strong>${p.picaturi * p.unitati} ${t('unitati_pe_zi')}</strong></span>
            </div>
          `;
        }).join('') || `<p style="color:var(--text-light);font-size:14px">${t('setari_protocol_gol')}</p>`}
      </div>
      <button class="btn btn-outline" id="btn-edit-protocol">${t('setari_protocol_modifica')}</button>
      <p class="hint important" style="margin-top:8px">${t('setari_protocol_hint_modificare')}</p>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:12px;color:#7A5500;line-height:1.6">
        ${t('setari_protocol_info_box')}
      </div>

      <!-- Flux zilnic tratament -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
        <p style="font-size:13px;color:var(--text-light);margin-bottom:12px;line-height:1.5">
          ${t('setari_flux_intro')}
        </p>

        ${(() => {
          const anti = trt.antihistaminic;
          const extras = trt.pasiExtra || [];
          const extrasActivi = extras.filter(p => p.activ !== false);
          const extrasInactivi = extras.filter(p => p.activ === false);

          const etiPoz = p => p.pozitie === 'inainte' ? t('setari_flux_inainte_de_staloral') : t('setari_flux_dupa_tratament');
          const etiExp = p => {
            if (!p.expirare || p.expirare.tip === 'niciodata') return '';
            if (p.expirare.tip === 'dupa_uses') return t('setari_flux_exp_dupa_folosiri', { val: p.expirare.valoare, curent: p.usesCount || 0 });
            if (p.expirare.tip === 'dupa_data') return t('setari_flux_exp_dupa_data', { data: formatDate(p.expirare.valoare) });
            return '';
          };

          const rowItem = (icon, label, sub, extra = '') => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
              background:var(--bg);border-radius:8px;margin-bottom:6px">
              <span style="font-size:20px;flex-shrink:0">${icon}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:14px;font-weight:600">${label}</div>
                <div style="font-size:12px;color:var(--text-light)">${sub}</div>
              </div>
              ${extra}
            </div>
          `;

          // Pași ÎNAINTE de Staloral
          const inainte = extrasActivi.filter(p => p.pozitie === 'inainte');
          const dupa = extrasActivi.filter(p => !p.pozitie || p.pozitie === 'dupa');

          const antiRow = anti.activ ? rowItem(
              anti.tip === 'pastile' ? '💊' : '💧',
              t('setari_flux_antihistaminic_label', { nume: anti.nume }),
              t('setari_flux_antihistaminic_sub', { minute: anti.minute, pozitie: anti.pozitie === 'inainte' ? t('setari_flux_inainte_de') : t('setari_flux_dupa'), stoc: anti.stoc }),
              `<button class="btn btn-outline btn-small" id="btn-edit-anti" style="width:auto;padding:6px 10px;font-size:12px">✏️</button>`
            ) : `
              <div style="text-align:center;padding:8px;margin-bottom:6px">
                <button class="btn btn-outline btn-small" id="btn-edit-anti"
                  style="width:auto;padding:8px 16px;font-size:13px;color:var(--teal-dark)">
                  ${t('setari_flux_adauga_antihistaminic')}
                </button>
              </div>
            `;
          const antiDupa = anti.activ && anti.pozitie === 'dupa';

          return `
            <!-- Antihistaminic (când e ÎNAINTE de Staloral, sau neactivat încă) -->
            ${!antiDupa ? antiRow : ''}

            <!-- Pași personalizați ÎNAINTE -->
            ${inainte.map((p, i) => rowItem(
              p.label.split(' ')[0],
              p.label.split(' ').slice(1).join(' ') || p.label,
              `${p.minute > 0 ? p.minute + ' min' : t('setari_flux_confirmare')} · ${etiPoz(p)}${etiExp(p)}`,
              `<button class="btn btn-outline btn-small" data-edit-extra="${extras.indexOf(p)}"
                style="width:auto;padding:6px 10px;font-size:12px">✏️</button>
               <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--danger);padding:4px"
                data-del-extra="${extras.indexOf(p)}">✕</button>`
            )).join('')}

            <!-- Staloral + asteptare (fixe) -->
            ${rowItem('💧', t('setari_flux_staloral_titlu'), t('setari_flux_staloral_sub'), `<span style="font-size:11px;color:var(--text-light);white-space:nowrap">${t('setari_flux_fix')}</span>`)}
            ${rowItem('⏳', t('setari_flux_asteptare_titlu'), t('setari_flux_asteptare_sub'), `<span style="font-size:11px;color:var(--text-light);white-space:nowrap">${t('setari_flux_fix')}</span>`)}

            <!-- Antihistaminic (când e DUPĂ Staloral) -->
            ${antiDupa ? antiRow : ''}

            <!-- Pași personalizați DUPĂ -->
            ${dupa.map((p, i) => rowItem(
              p.label.split(' ')[0],
              p.label.split(' ').slice(1).join(' ') || p.label,
              `${p.minute > 0 ? p.minute + ' min' : t('setari_flux_confirmare')} · ${etiPoz(p)}${etiExp(p)}`,
              `<button class="btn btn-outline btn-small" data-edit-extra="${extras.indexOf(p)}"
                style="width:auto;padding:6px 10px;font-size:12px">✏️</button>
               <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--danger);padding:4px"
                data-del-extra="${extras.indexOf(p)}">✕</button>`
            )).join('')}

            <!-- Pași inactivați (expirați) -->
            ${extrasInactivi.length > 0 ? `
              <div style="margin-top:8px;padding:8px 12px;background:#f5f5f5;border-radius:8px">
                <div style="font-size:12px;color:var(--text-light);font-weight:600;margin-bottom:4px">
                  ${t('setari_flux_pasi_expirati_titlu')}
                </div>
                ${extrasInactivi.map((p, i) => `
                  <div style="font-size:13px;color:var(--text-light);padding:3px 0">
                    ✓ ${p.label}
                    <button style="background:none;border:none;font-size:12px;cursor:pointer;color:var(--danger)"
                      data-del-extra="${extras.indexOf(p)}">${t('setari_flux_sterge')}</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          `;
        })()}

        <button class="btn btn-outline" id="btn-adauga-pas-extra" style="margin-top:4px">
          ${t('setari_flux_adauga_pas')}
        </button>
      </div>
  ` : '';

  const continutEmail = trt ? `
      <!-- Email -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;margin-bottom:12px">
        <div>
          <div style="font-weight:600;font-size:15px">${t('setari_email_titlu')}</div>
          <div style="font-size:12px;color:var(--text-light)">${t('setari_email_sub')}</div>
        </div>
        <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer">
          <input type="checkbox" id="toggle-email" ${trt.emailActiv ? 'checked' : ''}
            style="opacity:0;width:0;height:0;position:absolute">
          <span id="toggle-email-track" style="position:absolute;inset:0;background:${trt.emailActiv ? 'var(--teal)' : '#CCC'};
            border-radius:13px;transition:0.2s"></span>
          <span style="position:absolute;left:${trt.emailActiv ? '24px' : '2px'};top:2px;width:22px;height:22px;
            background:white;border-radius:50%;transition:0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)"
            id="toggle-email-thumb"></span>
        </label>
      </div>
      <div class="form-group">
        <label>${t('setari_email_label_adresa')}</label>
        <input type="email" id="set-email" value="${trt.email || ''}" placeholder="xxx@gmail.com">
      </div>
      <button class="btn btn-outline" id="btn-salveaza-email">${t('salveaza')}</button>

      <!-- EmailJS configurare -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="card-title">${t('setari_emailjs_titlu')}</div>
        ${(trt.emailjs?.serviceId && !S.ejsExpanded) ? (() => {
          const ejs = trt.emailjs;
          const ok = field => ejs[field] ? '✅' : '❌';
          const complet = ejs.serviceId && ejs.templateId && ejs.publicKey;
          return `
          <div style="background:${complet ? '#EDF7F0' : '#FFF8EC'};border:1px solid ${complet ? '#B2DFC0' : '#FFD060'};
            border-radius:10px;padding:12px 14px;margin-bottom:10px">
            <div style="font-size:13px;font-weight:700;color:${complet ? 'var(--success)' : '#7A5500'};margin-bottom:8px">
              ${complet ? t('setari_emailjs_complet') : t('setari_emailjs_incomplet')}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--text-light)">
              <div>${ok('serviceId')} Service ID: <strong style="color:#333">${ejs.serviceId || '—'}</strong></div>
              <div>${ok('templateId')} Template ID: <strong style="color:#333">${ejs.templateId || '—'}</strong></div>
              <div>${ok('publicKey')} Public Key: <strong style="color:#333">${ejs.publicKey ? ejs.publicKey.slice(0,6) + '••••••' : '—'}</strong></div>
            </div>
          </div>
          <button class="btn btn-outline btn-small" id="btn-ejs-edit"
            style="width:auto;padding:6px 14px;font-size:12px">${t('editeaza')}</button>
          `;
        })() : `
          <p style="font-size:13px;color:var(--text-light);margin-bottom:12px;line-height:1.5">
            ${t('setari_emailjs_intro')}
            <a href="https://miauapp.ro/ghid-emailjs" target="_blank" style="color:var(--teal-dark);font-weight:600">miauapp.ro/ghid-emailjs</a>
          </p>
          <div class="form-group">
            <label>Service ID</label>
            <input type="text" id="ejs-service" value="${trt.emailjs?.serviceId || ''}" placeholder="service_xxxxxxx">
          </div>
          <div class="form-group">
            <label>Template ID</label>
            <input type="text" id="ejs-template" value="${trt.emailjs?.templateId || ''}" placeholder="template_xxxxxxx">
          </div>
          <div class="form-group">
            <label>Public Key</label>
            <input type="text" id="ejs-pubkey" value="${trt.emailjs?.publicKey || ''}" placeholder="xxxxxxxxxxxxxx">
          </div>
          <div class="btn-row">
            ${S.ejsExpanded ? `<button class="btn btn-outline" id="btn-ejs-cancel">${t('anuleaza')}</button>` : ''}
            <button class="btn btn-outline" id="btn-salveaza-emailjs">${t('salveaza')}</button>
          </div>
        `}
      </div>
  ` : '';

  const continutCopii = `
    ${S.data.tratamente.map(tr => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #EAF4F2">
        <div>
          <div style="font-weight:600">${tr.nume}</div>
          <div style="font-size:12px;color:var(--text-light)">${t('setari_copii_start', { data: formatDate(tr.dataStart) })}</div>
        </div>
        <div style="display:flex;gap:8px">
          ${tr.id === S.data.activId ? `<span class="badge badge-pink">${t('setari_copii_activ')}</span>` :
            `<button class="btn btn-outline btn-small" data-activare="${tr.id}">${t('setari_copii_activeaza')}</button>`}
        </div>
      </div>
    `).join('')}
    <div style="margin-top:12px">
      <button class="btn btn-primary" id="btn-tratament-nou">${t('setari_copii_nou')}</button>
    </div>
  `;

  const continutLink = trt ? `
    <p style="font-size:13px;color:var(--text-light);margin-bottom:10px;line-height:1.5">
      ${t('setari_staloral_intro')}
    </p>
    <label style="font-size:13px;color:var(--text-light);display:block;margin-bottom:4px">${t('setari_staloral_label')}</label>
    <input type="url" id="input-link-staloral"
      placeholder="${t('setari_staloral_placeholder')}"
      value="${trt.linkStaloral || ''}"
      style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary btn-small" id="btn-salveaza-link-staloral" style="width:auto;padding:8px 16px">${t('salveaza')}</button>
      ${trt.linkStaloral ? `<button class="btn btn-outline btn-small" id="btn-reseteaza-link-staloral" style="width:auto;padding:8px 16px;color:var(--text-light)">${t('setari_staloral_reseteaza')}</button>` : ''}
    </div>
  ` : '';

  const continutExport = `
    <div class="btn-row">
      <button class="btn btn-outline" id="btn-export">${t('setari_export_btn')}</button>
      <button class="btn btn-outline" id="btn-import">${t('setari_import_btn')}</button>
    </div>
    <p class="hint" style="margin-top:8px">${t('setari_export_hint')}</p>
    <input type="file" id="import-file" accept=".json" style="display:none">
  `;

  const continutReset = `
    <button class="btn btn-danger" id="btn-reset">${t('setari_reset_btn')}</button>
    <p class="hint" style="margin-top:8px">${t('setari_reset_hint')}</p>
  `;

  return `
    ${renderDonatii()}

    ${sectiune('limba', '🌐', t('setari_limba_titlu'), lang === 'ro' ? t('setari_limba_ro') : t('setari_limba_en'), continutLimba)}
    ${sectiune('tema', '🎨', t('setari_tema_titlu'), temaNume(tema), continutTema)}
    ${trt ? sectiune('protocol', '📋', t('setari_protocol_titlu'), '', continutProtocolFlux) : ''}
    ${trt ? sectiune('email', '📧', t('setari_email_titlu'), trt.emailActiv ? '<span class="set-pill">✓</span>' : '', continutEmail) : ''}
    ${sectiune('copii', '🐾', t('setari_copii_titlu'), String(S.data.tratamente.length), continutCopii)}
    ${trt ? sectiune('staloral', '🔗', t('setari_staloral_titlu'), '', continutLink) : ''}
    ${sectiune('date', '💾', t('setari_export_titlu'), '', continutExport)}
    ${sectiune('reset', '⚠️', t('setari_reset_titlu'), '', continutReset)}
  `;
}

// ============================================================
//  ONBOARDING — Wizard multi-step
// ============================================================

function renderLangSelect() {
  return `
    <div class="onboarding">
      <div class="welcome-paw" style="text-align:center;margin-top:40px">
        <span class="big-paw">🐾</span>
        <h2>Alege limba · Choose your language</h2>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;padding:0 8px;margin-top:24px">
        <button data-lang-set="ro" class="btn btn-primary btn-large" style="width:100%">
          🇷🇴 Română
        </button>
        <button data-lang-set="en" class="btn btn-primary btn-large" style="width:100%">
          🇬🇧 English
        </button>
      </div>
    </div>
  `;
}

function attachLangSelectEvents() {
  document.querySelectorAll('[data-lang-set]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.langSet));
  });
}

function renderOnboarding() {
  const { step, d } = S.onb;
  const totalSteps = 6;
  const pct = Math.round((step / totalSteps) * 100);

  const titluriPasi = {
    1: t('onb_titlu_pas1'),
    2: t('onb_titlu_pas2'),
    3: t('onb_titlu_pas3'),
    4: t('onb_titlu_pas4'),
    5: t('onb_titlu_pas5'),
    6: t('onb_titlu_pas6')
  };

  return `
    <div class="onboarding">
      <div class="onboarding-header">
        <h2>${titluriPasi[step]}</h2>
        <div class="step-indicator">${t('onb_pasul_x_din_y', { step, total: totalSteps })}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="onboarding-body" id="onb-body">
        ${renderOnboardingStep(step, d)}
      </div>

      <div class="onboarding-footer">
        <div class="btn-row">
          ${step > 1 ? `<button class="btn btn-outline" id="onb-back">${t('inapoi')}</button>` : ''}
          <button class="btn btn-primary" id="onb-next">
            ${step === totalSteps ? t('onb_pornesc_aplicatia') : t('onb_continua')}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOnboardingStep(step, d) {
  switch (step) {
    case 1: return `
      <div class="welcome-paw">
        <span class="big-paw">🐾</span>
        <h2>${t('onb_welcome_titlu')}</h2>
        <p>${t('onb_welcome_text')}</p>
      </div>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 14px;
        margin-bottom:16px;font-size:12px;color:#7A5500;line-height:1.5">
        ${t('onb_nota_importanta')}
      </div>
      <div class="form-group">
        <label>${t('onb_label_nume')}</label>
        <input type="text" id="onb-nume" value="${d.nume || ''}" placeholder="${t('onb_placeholder_nume')}">
        <p class="hint">${t('onb_hint_nume')}</p>
      </div>
      <div class="form-group">
        <label>${t('onb_label_data')}</label>
        <input type="date" id="onb-data" value="${d.dataStart || today()}">
        <p class="hint">${t('onb_hint_data')}</p>
      </div>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:12px;color:#7A5500;line-height:1.6">
        ${t('onb_info_protocol')}
      </div>
    `;

    case 2: return `
      <div class="form-group">
        <label>${t('onb_label_faza')}</label>
        <div class="toggle-group">
          <button class="toggle-btn ${(!d.faza || d.faza === 'initiere') ? 'selected' : ''}" data-faza="initiere">
            ${t('onb_faza_initiere')}<br><small style="font-weight:400">${t('onb_faza_initiere_sub')}</small>
          </button>
          <button class="toggle-btn ${d.faza === 'mentinere' ? 'selected blue' : ''}" data-faza="mentinere">
            ${t('onb_faza_mentinere')}<br><small style="font-weight:400">${t('onb_faza_mentinere_sub')}</small>
          </button>
        </div>
      </div>
      <div class="hint important">
        ${t('onb_hint_faze')}
      </div>
    `;

    case 3: return `
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px">
        ${d.faza === 'mentinere'
          ? t('onb_protocol_precompletat_mentinere')
          : t('onb_protocol_precompletat_initiere')}
      </p>
      <div id="protocol-rows">
        ${(() => {
          if (!d.protocol || d.protocol.length === 0) {
            d.protocol = d.faza === 'mentinere' ? defaultProtocolMentinere() : defaultProtocolInitiere();
          }
          return d.protocol.map((p, i) => renderProtocolRow(p, i, d.protocol)).join('');
        })()}
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        ${d.faza === 'mentinere' ? `
          <button class="btn btn-outline" id="btn-adauga-pas-100" style="flex:1;border-color:#5B9BD5;color:#3A7ABD">
            ${t('onb_btn_adauga_pas_100')}
          </button>
        ` : `
          <button class="btn btn-outline" id="btn-adauga-pas" style="flex:1">
            ${t('onb_btn_adauga_pas_10')}
          </button>
          <button class="btn btn-outline" id="btn-adauga-pas-100" style="flex:1;border-color:#5B9BD5;color:#3A7ABD">
            ${t('onb_btn_adauga_doze_100')}
          </button>
        `}
      </div>
      <p class="hint" style="margin-top:12px">
        ${t('onb_hint_pasi', { extra: d.faza !== 'mentinere' ? t('onb_hint_pasi_extra_initiere') : '' })}
      </p>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:12px;color:#7A5500;line-height:1.6">
        ${t('onb_info_tratament_inceput')}
      </p>
    `;

    case 4: return `
      <div class="form-group">
        <label>${t('onb_label_picaturi_flacon')}</label>
        <input type="number" id="onb-picaturi" value="${d.picaturiFlacon ?? 50}" min="1" max="50">
        <p class="hint">${t('onb_hint_picaturi_flacon')}</p>
      </div>
      <div class="form-group">
        <label>${t('onb_label_flacoane_rezerva')}</label>
        <input type="number" id="onb-flacoane" value="${d.flacoaneRamase ?? 0}" min="0">
        <p class="hint">${t('onb_hint_flacoane_rezerva')}</p>
      </div>
    `;

    case 5: return `
      <div class="form-group">
        <label>${t('onb_label_anti_intrebare')}</label>
        <div class="toggle-group">
          <button class="toggle-btn ${d.antiActiv !== false ? 'selected' : ''}" data-anti="da">${t('da')}</button>
          <button class="toggle-btn ${d.antiActiv === false ? 'selected' : ''}" data-anti="nu">${t('nu')}</button>
        </div>
      </div>
      ${d.antiActiv !== false ? `
        <div class="form-group">
          <label>${t('onb_label_anti_nume')}</label>
          <input type="text" id="onb-anti-nume" value="${d.antiNume || ''}" placeholder="${t('onb_placeholder_anti_nume')}">
        </div>
        <div class="form-group">
          <label>${t('onb_label_anti_tip')}</label>
          <div class="toggle-group">
            <button class="toggle-btn ${(!d.antiTip || d.antiTip === 'pastile') ? 'selected' : ''}" data-antitip="pastile">${t('onb_anti_pastile')}</button>
            <button class="toggle-btn ${d.antiTip === 'picaturi' ? 'selected' : ''}" data-antitip="picaturi">${t('onb_anti_picaturi')}</button>
          </div>
        </div>
        <div class="form-group">
          <label>${t('onb_label_anti_stoc')}</label>
          <input type="number" id="onb-anti-stoc" value="${d.antiStoc || 30}" min="1">
        </div>
        <div class="form-group">
          <label>${t('onb_label_anti_pozitie')}</label>
          <div class="toggle-group">
            <button class="toggle-btn ${(!d.antiPozitie || d.antiPozitie === 'inainte') ? 'selected' : ''}" data-antipoz="inainte">${t('onb_anti_inainte')}</button>
            <button class="toggle-btn ${d.antiPozitie === 'dupa' ? 'selected' : ''}" data-antipoz="dupa">${t('onb_anti_dupa')}</button>
          </div>
          <p class="hint important" style="margin-top:6px">${t('onb_hint_anti_pozitie')}</p>
        </div>
        <div class="form-group">
          <label>${t('onb_label_anti_interval')}</label>
          <input type="number" id="onb-anti-min" value="${d.antiMinute || 20}" min="5" max="120">
        </div>
      ` : ''}
    `;

    case 6: return `
      <div class="welcome-paw" style="padding-top:20px">
        <span class="big-paw">🎉</span>
        <h2 style="color:var(--success)">${t('onb_final_titlu')}</h2>
        <p style="margin-top:12px">
          ${t('onb_final_text', { nume: d.nume || t('onb_final_nume_implicit') })}
        </p>
      </div>
    `;
  }
}

function minDataPentruRand(proto, i) {
  for (let j = i - 1; j >= 0; j--) {
    if (proto[j].tipData === 'calendar' && proto[j].dataEnd) return addZile(proto[j].dataEnd, 1);
  }
  return null;
}

function addZile(dataStr, n) {
  const d = new Date(dataStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function cascadeazaDateleUrmatoare(proto) {
  for (let i = 0; i < proto.length; i++) {
    if (proto[i].tipData !== 'calendar') continue;
    const minStart = minDataPentruRand(proto, i);
    if (minStart && (!proto[i].dataStart || proto[i].dataStart < minStart)) {
      proto[i].dataStart = minStart;
    }
    if (proto[i].dataEnd && proto[i].dataStart && proto[i].dataEnd < proto[i].dataStart) {
      proto[i].dataEnd = '';
    }
  }
}

function renderProtocolRow(p, i, proto = null) {
  const isCalendar = p.tipData === 'calendar';
  const is100u = p.unitati === 100;
  const minStart = proto ? minDataPentruRand(proto, i) : null;
  const valStart = p.dataStart || minStart || today();
  return `
    <div class="protocol-row" data-idx="${i}" style="flex-wrap:wrap;gap:6px;${is100u ? 'border-left:3px solid #5B9BD5;padding-left:8px;background:#F0F6FC;' : ''}">${is100u ? `<span style="font-size:11px;color:#3A7ABD;font-weight:600;width:100%;margin-bottom:2px">💙 ${t('acasa_faza_mentinere')} (100u)</span>` : ''}
      <!-- Toggle tip dată -->
      <div style="display:flex;gap:4px;width:100%">
        <button class="toggle-btn btn-small ${!isCalendar ? 'selected' : ''}"
          data-rowtip="zile" data-rowidx="${i}" style="flex:1;padding:6px 4px;font-size:12px">${t('protocol_row_zile')}</button>
        <button class="toggle-btn btn-small ${isCalendar ? 'selected' : ''}"
          data-rowtip="calendar" data-rowidx="${i}" style="flex:1;padding:6px 4px;font-size:12px">${t('protocol_row_calendar')}</button>
      </div>

      ${!isCalendar ? `
        <!-- Zile -->
        <input type="number" class="pr-zile" value="${p.zile || 1}" min="1" placeholder="${t('protocol_row_zile_placeholder')}" style="width:60px;text-align:center">
        <span class="sep">${t('onb_sep_zile')}</span>
      ` : `
        <!-- Date calendaristice -->
        <div style="display:flex;gap:4px;align-items:center;width:100%">
          <input type="date" class="pr-data-start" value="${valStart}" ${minStart ? `min="${minStart}"` : ''} style="flex:1;font-size:16px;padding:6px">
          <span class="sep">→</span>
          <input type="date" class="pr-data-end" value="${p.dataEnd || ''}" min="${valStart}" style="flex:1;font-size:16px;padding:6px">
        </div>
        ${minStart ? `<p class="hint" style="width:100%;margin:2px 0 0">${t('onb_hint_continua_data', { data: formatDate(minStart) })}</p>` : ''}
      `}

      <span class="sep">×</span>
      <input type="number" class="pr-pic" value="${p.picaturi || 1}" min="1" max="10" placeholder="${t('protocol_row_pic_placeholder')}" style="width:50px;text-align:center">
      <span class="sep">${t('onb_sep_pic')}</span>
      <select class="pr-u" style="width:70px;text-align:center;padding:4px 2px;border:1px solid var(--border);border-radius:6px;font-size:14px">
        <option value="10" ${(p.unitati || 10) === 10 ? 'selected' : ''}>10u</option>
        <option value="100" ${p.unitati === 100 ? 'selected' : ''}>100u</option>
      </select>
      <span class="sep">u</span>
      <button class="del-btn" data-del="${i}">✕</button>
    </div>
  `;
}

// ============================================================
//  EVENT HANDLERS — Onboarding
// ============================================================

function attachOnboardingEvents() {
  const next = document.getElementById('onb-next');
  const back = document.getElementById('onb-back');

  next?.addEventListener('click', onbNext);
  back?.addEventListener('click', () => {
    S.onb.step--;
    renderOnboardingStep_update();
  });

  attachOnboardingStepEvents();
}

function attachOnboardingStepEvents() {
  const { step, d } = S.onb;

  // Step 1
  document.getElementById('onb-nume')?.addEventListener('input', e => d.nume = e.target.value.trim());
  document.getElementById('onb-data')?.addEventListener('change', e => d.dataStart = e.target.value);

  // Step 2 — toggle faza
  document.querySelectorAll('[data-faza]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.faza = btn.dataset.faza;
      d.protocol = []; // resetează ca să primești defaulturile corecte la step 3
      document.querySelectorAll('[data-faza]').forEach(b => {
        b.classList.toggle('selected', b.dataset.faza === d.faza);
        b.classList.toggle('blue', b.dataset.faza === 'mentinere' && b.dataset.faza === d.faza);
      });
    });
  });

  // Step 3 — protocol
  document.getElementById('btn-adauga-pas')?.addEventListener('click', () => {
    if (!d.protocol) d.protocol = [];
    d.protocol.push({ id: uid(), zile: 1, picaturi: 1, unitati: 10, tipData: 'zile' });
    document.getElementById('protocol-rows').innerHTML =
      d.protocol.map((p, i) => renderProtocolRow(p, i, d.protocol)).join('');
    attachProtocolRowEvents('protocol-rows', d.protocol);
  });
  document.getElementById('btn-adauga-pas-100')?.addEventListener('click', () => {
    if (!d.protocol) d.protocol = [];
    defaultProtocolMentinere().forEach(p => d.protocol.push(p));
    d.faza = 'mentinere'; // comută vizual la menținere — dispar butoanele de 10u
    renderOnboardingStep_update();
  });
  if (!d.protocol) d.protocol = [];
  attachProtocolRowEvents('protocol-rows', d.protocol);

  // Step 4
  document.getElementById('onb-picaturi')?.addEventListener('change', e => d.picaturiFlacon = +e.target.value);
  document.getElementById('onb-flacoane')?.addEventListener('change', e => d.flacoaneRamase = +e.target.value);

  // Step 5 — anti toggles
  document.querySelectorAll('[data-anti]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiActiv = btn.dataset.anti === 'da';
      document.querySelectorAll('[data-anti]').forEach(b => b.classList.toggle('selected', b.dataset.anti === btn.dataset.anti));
      renderOnboardingStep_update();
    });
  });
  document.querySelectorAll('[data-antitip]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiTip = btn.dataset.antitip;
      document.querySelectorAll('[data-antitip]').forEach(b => b.classList.toggle('selected', b.dataset.antitip === d.antiTip));
    });
  });
  document.querySelectorAll('[data-antipoz]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiPozitie = btn.dataset.antipoz;
      document.querySelectorAll('[data-antipoz]').forEach(b => b.classList.toggle('selected', b.dataset.antipoz === d.antiPozitie));
    });
  });
  document.getElementById('onb-anti-nume')?.addEventListener('input', e => d.antiNume = e.target.value.trim());
  document.getElementById('onb-anti-stoc')?.addEventListener('change', e => d.antiStoc = +e.target.value);
  document.getElementById('onb-anti-min')?.addEventListener('change', e => d.antiMinute = +e.target.value);
}

function detecteazaPauzeProtocol(protocol) {
  const calendarare = protocol
    .filter(p => p.tipData === 'calendar' && p.dataStart && p.dataEnd)
    .sort((a, b) => a.dataStart.localeCompare(b.dataStart));
  for (let i = 1; i < calendarare.length; i++) {
    const prev = calendarare[i - 1];
    const curr = calendarare[i];
    const endPrev = new Date(prev.dataEnd);
    const startCurr = new Date(curr.dataStart);
    endPrev.setHours(0,0,0,0); startCurr.setHours(0,0,0,0);
    const diff = Math.floor((startCurr - endPrev) / 86400000);
    if (diff > 1) return diff - 1; // nr zile de pauză
  }
  return 0;
}

function attachProtocolRowEvents(containerId = 'protocol-rows', protocol = null) {
  const { d } = S.onb;
  const proto = protocol || d.protocol;
  if (!proto) return;

  document.querySelectorAll(`#${containerId} .protocol-row`).forEach((row, i) => {
    const p = proto[i];
    if (!p) return;

    // Toggle tip dată
    row.querySelectorAll('[data-rowtip]').forEach(btn => {
      btn.addEventListener('click', () => {
        p.tipData = btn.dataset.rowtip;
        if (p.tipData === 'calendar' && !p.dataStart) {
          p.dataStart = minDataPentruRand(proto, i) || today();
          p.dataEnd = '';
          delete p.zile;
        } else if (p.tipData === 'zile') {
          p.zile = p.zile || 1;
          delete p.dataStart;
          delete p.dataEnd;
        }
        document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j, proto)).join('');
        attachProtocolRowEvents(containerId, proto);
      });
    });

    row.querySelector('.pr-zile')?.addEventListener('change', e => { p.zile = +e.target.value; });

    row.querySelector('.pr-data-start')?.addEventListener('change', e => {
      const minStart = minDataPentruRand(proto, i);
      let val = e.target.value;
      if (minStart && val < minStart) {
        toast(t('toast_data_invalida_min', { data: formatDate(minStart) }));
        val = minStart;
      }
      p.dataStart = val;
      if (p.dataEnd && p.dataEnd < p.dataStart) p.dataEnd = '';
      cascadeazaDateleUrmatoare(proto);
      document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j, proto)).join('');
      attachProtocolRowEvents(containerId, proto);
    });

    row.querySelector('.pr-data-end')?.addEventListener('change', e => {
      let val = e.target.value;
      if (p.dataStart && val < p.dataStart) {
        toast(t('toast_data_sfarsit_invalida'));
        val = p.dataStart;
      }
      p.dataEnd = val;
      cascadeazaDateleUrmatoare(proto);
      document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j, proto)).join('');
      attachProtocolRowEvents(containerId, proto);
    });

    row.querySelector('.pr-pic')?.addEventListener('change', e => {
      p.picaturi = +e.target.value;
      autoFill3Ani(p, proto, i, containerId);
    });
    row.querySelector('.pr-u')?.addEventListener('change', e => {
      p.unitati = +e.target.value;
      autoFill3Ani(p, proto, i, containerId);
    });

    row.querySelector('[data-del]')?.addEventListener('click', () => {
      proto.splice(i, 1);
      document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j, proto)).join('');
      attachProtocolRowEvents(containerId, proto);
    });
  });
}

// Auto-completare 3 ani când e ultimul pas cu 3 pic × 100u (doza maximă de menținere)
function autoFill3Ani(pas, proto, idx, containerId) {
  if (pas.picaturi === 3 && pas.unitati === 100 && pas.tipData !== 'calendar') {
    if (!pas.zile || pas.zile < 100) {
      pas.zile = 1095; // 3 ani
      document.getElementById(containerId).innerHTML = proto.map((p, j) => renderProtocolRow(p, j, proto)).join('');
      attachProtocolRowEvents(containerId, proto);
      toast(t('toast_3ani_completati'));
    }
  }
}

function renderOnboardingStep_update() {
  const app = document.getElementById('app');
  app.innerHTML = renderOnboarding();
  attachOnboardingEvents();
}

function onbNext() {
  const { step, d } = S.onb;

  // Validări per pas
  if (step === 1) {
    const numeEl = document.getElementById('onb-nume');
    const dataEl = document.getElementById('onb-data');
    d.nume = numeEl?.value.trim() || d.nume;
    d.dataStart = dataEl?.value || d.dataStart;
    if (!d.nume) { toast(t('toast_introdu_nume')); return; }
    if (!d.dataStart) { toast(t('toast_introdu_data')); return; }
  }

  if (step === 3) {
    if (!d.protocol) d.protocol = [];
    document.querySelectorAll('#protocol-rows .protocol-row').forEach((row, i) => {
      if (d.protocol[i]) {
        const p = d.protocol[i];
        if (p.tipData === 'calendar') {
          p.dataStart = row.querySelector('.pr-data-start')?.value || p.dataStart;
          p.dataEnd   = row.querySelector('.pr-data-end')?.value || p.dataEnd;
        } else {
          p.zile = +(row.querySelector('.pr-zile')?.value || 1);
        }
        p.picaturi = +(row.querySelector('.pr-pic')?.value || 1);
        p.unitati  = +(row.querySelector('.pr-u')?.value || 10);
      }
    });
  }

  if (step === 4) {
    d.picaturiFlacon = +(document.getElementById('onb-picaturi')?.value || 50);
    d.flacoaneRamase = +(document.getElementById('onb-flacoane')?.value || 0);
  }

  if (step === 5 && d.antiActiv !== false) {
    d.antiNume    = document.getElementById('onb-anti-nume')?.value.trim() || d.antiNume;
    d.antiStoc    = +(document.getElementById('onb-anti-stoc')?.value || 30);
    d.antiMinute  = +(document.getElementById('onb-anti-min')?.value || 20);
  }

  if (step === 6) {
    // Finalizare — crează tratament
    const trt = defaultTratament();
    trt.nume      = d.nume;
    trt.dataStart = d.dataStart;
    trt.protocol  = (d.protocol || []).map(p => ({ ...p, id: uid() }));
    trt.email     = d.email || '';
    trt.staloral = {
      flaconCurent: d.picaturiFlacon || 50,
      flacoaneRamase: d.flacoaneRamase || 0,
      alertaPicaturi: 5,
      alertaFlacoane: 1
    };
    trt.antihistaminic = {
      activ: d.antiActiv !== false,
      nume: d.antiNume || '',
      tip: d.antiTip || 'pastile',
      stoc: d.antiStoc || 0,
      stocInitial: d.antiStoc || 0,
      pozitie: d.antiPozitie || 'inainte',
      minute: d.antiMinute || 20
    };

    // Dacă, pe baza protocolului introdus, tranziția la 100u s-a petrecut deja
    // în trecut (înainte de azi), nu mai cerem confirmare pe Acasă (asta ar reseta
    // stocul introdus mai sus) — o marcăm direct ca confirmată și recreăm milestone-ul istoric.
    const areInitiere = trt.protocol.some(p => p.unitati === 10);
    if (areInitiere) {
      const dataTransitie = gasesteDataTransitieMentinere(trt);
      if (dataTransitie) {
        trt.tranzitieFlacon = true;
        if (!trt.milestones) trt.milestones = [];
        trt.milestones.push({
          data: dataTransitie,
          label: t('milestone_tranzitie_mentinere'),
          detalii: t('milestone_tranzitie_detalii_auto')
        });
      }
    }

    if (S.data._backup) {
      S.data.tratamente = [...S.data._backup.tratamente, trt];
      delete S.data._backup;
    } else {
      S.data.tratamente.push(trt);
    }
    S.data.activId = trt.id;
    saveData();
    S.tab = 'acasa';
    S.timerStepIdx = null;
    S.timerDone = false;
    render();
    return;
  }

  S.onb.step++;
  renderOnboardingStep_update();
}

// ============================================================
//  EVENT HANDLERS — Main app
// ============================================================

function pornestePas(idx) {
  const t = tratamentActiv();
  const pasi = buildPasi(t);
  const pas = pasi[idx];
  if (!pas) return;
  S.timerStepIdx = idx;
  S.timerDone = false;

  // Pas fără timer (minute = 0) → marcat imediat ca done, așteaptă confirmare
  if (!pas.minute) {
    S.timerDone = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    return;
  }

  const endTs = Date.now() + pas.minute * 60 * 1000;
  saveTimerState(endTs);
  document.getElementById('scroll-area').innerHTML = renderTab();
  attachTabEvents();
  startTimer('pas', pas.minute, () => {
    S.timerDone = true;
    saveTimerState(null);
    bip(880, 0.4); bip(1100, 0.4);
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
}

function attachListaIstorica() {
  // Click pe ziua din listă → editare simptome
  document.querySelectorAll('[data-hist-data]').forEach(row => {
    row.addEventListener('click', () => {
      showEditSimptomeZi(row.dataset.histData);
    });
  });
}

function showEditSimptomeZi(data) {
  const trt = tratamentActiv();
  if (!trt) return;
  const intrare = trt.istoric.find(e => e.data === data);
  if (!intrare) return;

  let simSelectate = {};
  (intrare.simptome || []).forEach(s => { simSelectate[s.id] = s.severitate; });

  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        ${t('modal_simptome_titlu', { data: formatDate(data) })}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <button class="btn btn-success" id="modal-totul-ok" style="margin-bottom:12px">
        ${t('simptome_totul_ok')}
      </button>
      <div class="divider" style="margin-bottom:12px"></div>

      <div id="modal-symptom-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${SIMPTOME.map(s => {
          const sel = intrare.simptome?.find(x => x.id === s.id);
          return `
            <div class="modal-sym-row" data-id="${s.id}"
              style="padding:10px 12px;border:2px solid ${sel ? 'var(--teal)' : '#DDF0ED'};
                border-radius:10px;background:${sel ? 'var(--teal-light)' : 'white'};cursor:pointer">
              <div style="display:flex;align-items:center;gap:10px;pointer-events:none">
                <span style="font-size:18px">${s.label.split(' ')[0]}</span>
                <span style="font-size:14px;flex:1">${tSimptom(s.id)}</span>
                <span style="font-size:16px;color:${sel ? 'var(--teal)' : '#CCC'}">${sel ? '✓' : '○'}</span>
              </div>
              ${sel ? `
                <div class="severity-row" style="margin-top:8px" onclick="event.stopPropagation()">
                  ${SEVERITATE.map(sv => `
                    <button class="sev-btn ${sv.id} ${sel.severitate === sv.id ? 'sel' : ''}"
                      data-symptom="${s.id}" data-sev="${sv.id}">${sv.emoji} ${tSeveritate(sv.id)}</button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div id="modal-altele-wrap" style="display:${simSelectate['altele'] ? 'block' : 'none'};margin-bottom:12px">
        <input type="text" id="modal-altele-detalii" placeholder="${t('simptome_placeholder_detalii')}"
          value="${intrare.simptome?.find(x => x.id === 'altele')?.detalii || ''}"
          onclick="event.stopPropagation()"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px">
      </div>

      <button class="btn btn-primary" id="modal-salveaza">${t('salveaza')}</button>
      <button class="btn btn-danger" id="modal-sterge-zi" style="margin-top:8px">${t('modal_simptome_sterge_zi')}</button>
    </div>
  `);

  const updateAlteleWrap = () => {
    const wrap = document.getElementById('modal-altele-wrap');
    if (wrap) wrap.style.display = simSelectate['altele'] ? 'block' : 'none';
  };

  // Events în modal
  document.querySelectorAll('.modal-sym-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.classList.contains('sev-btn')) return;
      const id = row.dataset.id;
      if (simSelectate[id]) {
        delete simSelectate[id];
        row.style.border = '2px solid #DDF0ED';
        row.style.background = 'white';
        row.querySelector('span:last-child').textContent = '○';
        row.querySelector('span:last-child').style.color = '#CCC';
        row.querySelectorAll('.severity-row').forEach(r => r.remove());
      } else {
        simSelectate[id] = 'usor';
        row.style.border = '2px solid var(--teal)';
        row.style.background = 'var(--teal-light)';
        const sevRow = document.createElement('div');
        sevRow.className = 'severity-row';
        sevRow.style.marginTop = '8px';
        sevRow.setAttribute('onclick', 'event.stopPropagation()');
        sevRow.innerHTML = SEVERITATE.map(sv => `
          <button class="sev-btn ${sv.id} ${simSelectate[id] === sv.id ? 'sel' : ''}"
            data-symptom="${id}" data-sev="${sv.id}">${sv.emoji} ${sv.label}</button>
        `).join('');
        row.appendChild(sevRow);
        sevRow.querySelectorAll('.sev-btn').forEach(sb => {
          sb.addEventListener('click', e => {
            e.stopPropagation();
            simSelectate[id] = sb.dataset.sev;
            sevRow.querySelectorAll('.sev-btn').forEach(b => b.classList.toggle('sel', b.dataset.sev === sb.dataset.sev));
          });
        });
      }
      updateAlteleWrap();
    });
  });

  document.getElementById('modal-totul-ok').addEventListener('click', () => {
    intrare.simptome = [];
    intrare.totulOk = true;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_totul_ok_salvat'));
  });

  document.getElementById('modal-salveaza').addEventListener('click', () => {
    const detaliiAltele = document.getElementById('modal-altele-detalii')?.value.trim() || '';
    intrare.simptome = Object.entries(simSelectate).map(([id, severitate]) => {
      const obj = { id, severitate };
      if (id === 'altele' && detaliiAltele) obj.detalii = detaliiAltele;
      return obj;
    });
    intrare.totulOk = false;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_simptome_actualizate'));
  });

  document.getElementById('modal-sterge-zi').addEventListener('click', () => {
    const wasFinalizat = intrare.finalizat || intrare.picaturi > 0;
    const msg = wasFinalizat
      ? t('confirm_sterge_zi_finalizat', { data: formatDate(data), picaturi: intrare.picaturi, anti: trt.antihistaminic.activ ? ' + 1 antihistaminic' : '' })
      : t('confirm_sterge_zi_simplu', { data: formatDate(data) });
    confirmDialog(msg, () => {
      // Reface stocurile dacă era finalizat
      if (wasFinalizat) {
        trt.staloral.flaconCurent = Math.min(50, trt.staloral.flaconCurent + (intrare.picaturi || 0));
        if (trt.antihistaminic.activ && intrare.finalizat) {
          trt.antihistaminic.stoc += 1;
        }
      }

      trt.istoric = trt.istoric.filter(e => e.data !== data);
      saveData();
      closeOverlay();
      if (data === today()) {
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
      }
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(wasFinalizat ? t('toast_intrare_stearsa_stoc') : t('toast_intrare_stearsa'));
    }, { danger: true, textConfirma: t('confirm_sterge_zi_btn') });
  });
}

function attachMainEvents() {
  // Selector tratament din header
  document.getElementById('sel-tratament')?.addEventListener('change', e => {
    S.data.activId = e.target.value;
    saveData();
    S.timerStepIdx = null;
    S.timerDone = false;
    stopAllTimers();
    S.tab = 'acasa';
    render();
  });

  // Bottom nav
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.tab = btn.dataset.tab;
      document.getElementById('scroll-area').innerHTML = renderTab();
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === S.tab));
      attachTabEvents();
    });
  });

  attachTabEvents();
}

function attachTabEvents() {
  switch (S.tab) {
    case 'acasa':    attachAcasaEvents(); break;
    case 'simptome': attachSimptomeEvents(); break;
    case 'istoric':  attachListaIstorica(); break;
    case 'stocuri':  attachStocuriEvents(); break;
    case 'setari':   attachSetariEvents(); break;
  }
}

// --- ACASĂ ---

function attachAcasaEvents() {
  // Restaurare timer dacă aplicația a fost închisă și redeschisă
  if (S._restoreEndTs) {
    const remaining = (S._restoreEndTs - Date.now()) / 60000;
    const endTs = S._restoreEndTs;
    delete S._restoreEndTs;
    startTimer('pas', remaining, () => {
      S.timerDone = true;
      saveTimerState(null);
      bip(880, 0.4); bip(1100, 0.4);
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
    });
    // Actualizează display-ul timerului
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatMMSS(endTs - Date.now());
  }

  // ── Banner alertă stoc scăzut ──
  document.getElementById('btn-ascunde-alerta-stoc')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    trt.alertaStocAscunsaLa = today();
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });

  // ── Banner instalare pe ecranul principal ──
  document.getElementById('btn-ascunde-banner-instalare')?.addEventListener('click', () => {
    S.data.bannerInstalareAscunsLa = 'pentru-totdeauna';
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });

  // ── Confirmare tranziție la flaconul albastru ──
  document.getElementById('btn-confirma-tranzitie')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    trt.tranzitieFlacon = true;
    trt.staloral.flaconCurent = 50;
    trt.staloral.flacoaneRamase = Math.max(0, trt.staloral.flacoaneRamase - 1);
    if (trt.milestones == null) trt.milestones = [];
    trt.milestones.push({ data: today(), label: t('milestone_tranzitie_mentinere'), detalii: t('milestone_tranzitie_detalii') });
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_flacon_albastru_activat'));
  });

  // ── Start primul pas (idx = 0) ──
  document.getElementById('btn-start-pas')?.addEventListener('click', () => {
    pornestePas(0);
  });

  // ── Continuă acum (skip timer) ──
  document.getElementById('btn-skip-timer')?.addEventListener('click', () => {
    stopAllTimers();
    S.timerDone = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    bip(880, 0.3);
  });

  // ── Pasul următor ──
  document.getElementById('btn-pas-urmator')?.addEventListener('click', e => {
    pornestePas(+e.currentTarget.dataset.idx);
  });

  // Finalizează
  document.getElementById('btn-finalizeaza')?.addEventListener('click', () => {
    finalizazaTratament();
  });

  // Sărit
  document.getElementById('btn-sari')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    const anti = trt.antihistaminic;

    if (anti.activ) {
      // Modal cu întrebare despre antihistaminic
      showOverlay(`
        <div class="modal">
          <div class="modal-title">
            ${t('modal_ziua_sarit_titlu')}
            <button class="close-btn" onclick="closeOverlay()">✕</button>
          </div>
          <p style="font-size:14px;color:var(--text-light);margin-bottom:20px;line-height:1.6">
            ${t('modal_ziua_sarit_text_anti', { forma: anti.tip === 'pastile' ? t('modal_ziua_sarit_pastila') : t('modal_ziua_sarit_picaturile'), nume: anti.nume || t('stocuri_antihistaminic_implicit') })}
          </p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" id="modal-sarit-cu-anti">
              ${t('modal_ziua_sarit_da_cu_anti')}
            </button>
            <button class="btn btn-outline" id="modal-sarit-fara-anti">
              ${t('modal_ziua_sarit_fara_anti')}
            </button>
            <button class="btn btn-outline" style="color:var(--text-light)" onclick="closeOverlay()">
              ${t('anuleaza')}
            </button>
          </div>
        </div>
      `);

      const finalizeazaSarit = (scadeAnti) => {
        const pas = pasProtocolPentruZiua(trt, ziuaTratamentului(trt));
        if (scadeAnti) trt.antihistaminic.stoc = Math.max(0, trt.antihistaminic.stoc - 1);
        trt.istoric.push({
          data: today(), ora: Date.now(), finalizat: false, sarit: true,
          antiScazut: scadeAnti,
          picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
          simptome: [], totulOk: false
        });
        saveData();
        closeOverlay();
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast(scadeAnti ? t('toast_sarit_cu_anti') : t('toast_sarit_fara_anti'));
      };

      document.getElementById('modal-sarit-cu-anti')?.addEventListener('click', () => finalizeazaSarit(true));
      document.getElementById('modal-sarit-fara-anti')?.addEventListener('click', () => finalizeazaSarit(false));

    } else {
      // Fără antihistaminic — modal de confirmare
      showOverlay(`
        <div class="modal">
          <div class="modal-title">
            ${t('modal_ziua_sarit_titlu')}
            <button class="close-btn" onclick="closeOverlay()">✕</button>
          </div>
          <p style="font-size:14px;color:var(--text-light);margin-bottom:20px;line-height:1.6">
            ${t('modal_ziua_sarit_text_fara_anti')}
          </p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" id="modal-sarit-da">${t('modal_ziua_sarit_da')}</button>
            <button class="btn btn-outline" onclick="closeOverlay()">${t('modal_ziua_sarit_nu')}</button>
          </div>
        </div>
      `);
      document.getElementById('modal-sarit-da')?.addEventListener('click', () => {
        const pas = pasProtocolPentruZiua(trt, ziuaTratamentului(trt));
        trt.istoric.push({
          data: today(), ora: Date.now(), finalizat: false, sarit: true,
          picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
          simptome: [], totulOk: false
        });
        saveData();
        closeOverlay();
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast(t('toast_sarit_fara_anti'));
      });
    }
  });
}

function renderTimereInactive(trt) {
  const pasi = buildPasi(trt);
  const oraFin = trt.istoric.find(e => e.data === today())?.ora;
  return `
    <div class="card" style="opacity:0.6">
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0 12px">
        <span style="font-size:26px">✅</span>
        <div>
          <div style="font-weight:700;font-size:15px">${t('pasi_finalizat_azi')}</div>
          <div style="font-size:12px;color:var(--text-light)">${oraFin ? formatTime(oraFin) : ''} · ${t('pasi_reactivare')}</div>
        </div>
      </div>
      <div class="steps-list">
        ${pasi.map((p, i) => `
          <div class="step-item" style="opacity:0.7">
            <div class="step-number done">✓</div>
            <div class="step-info">
              <div class="step-title">${p.label}</div>
              <div class="step-sub">${p.sub}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buildPasi(trt) {
  const anti = trt.antihistaminic;
  // Doar pașii activi (activ !== false)
  const extras = (trt.pasiExtra || []).filter(p => p.activ !== false);
  const pasi = [];

  // ① Pași înainte de Staloral
  if (anti.activ && anti.pozitie === 'inainte')
    pasi.push({ id: 'anti', minute: anti.minute,
      label: t('setari_flux_antihistaminic_label', { nume: anti.nume }),
      sub: t('buildpasi_anti_inainte', { minute: anti.minute }) });
  extras.filter(p => p.pozitie === 'inainte').forEach((p, i) =>
    pasi.push({ id: `extra_pre_${i}`, minute: p.minute, label: p.label, sub: p.sub || '' }));

  // ② Staloral + așteptare (fixe)
  pasi.push({ id: 'staloral', minute: 2,
    label: '💧 ' + t('setari_flux_staloral_titlu'),
    sub: t('buildpasi_staloral_sub') });
  pasi.push({ id: 'asteptare', minute: 10,
    label: '⏳ ' + t('setari_flux_asteptare_titlu'),
    sub: t('buildpasi_asteptare_sub') });

  // ③ Pași după așteptare
  if (anti.activ && anti.pozitie === 'dupa')
    pasi.push({ id: 'anti', minute: anti.minute,
      label: t('setari_flux_antihistaminic_label', { nume: anti.nume }),
      sub: t('buildpasi_anti_dupa', { minute: anti.minute }) });
  extras.filter(p => !p.pozitie || p.pozitie === 'dupa').forEach((p, i) =>
    pasi.push({ id: `extra_post_${i}`, minute: p.minute, label: p.label, sub: p.sub || '' }));

  return pasi;
}

function finalizazaTratament() {
  const trt = tratamentActiv();
  const ziua = ziuaTratamentului(trt);
  const pas = pasProtocolPentruZiua(trt, ziua);

  // Scade stoc picături
  if (pas) {
    trt.staloral.flaconCurent = Math.max(0, trt.staloral.flaconCurent - pas.picaturi);
    if (trt.antihistaminic.activ) {
      trt.antihistaminic.stoc = Math.max(0, trt.antihistaminic.stoc - 1);
    }
  }

  // Adaugă în istoric
  trt.istoric.push({
    data: today(), ora: Date.now(), finalizat: true, sarit: false,
    picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
    simptome: [], totulOk: false
  });

  // Verifică dacă s-a schimbat faza de protocol (milestone)
  checkPhaseChange(trt, ziua);

  // Incrementează usesCount și verifică expirare pași personalizați
  checkExpirPasiExtra(trt);

  saveData();
  stopAllTimers(); // include releaseWakeLock
  S.timerStepIdx = null;
  S.timerDone = false;

  // Verifică alerte stoc
  checkAlertStoc(trt);

  document.getElementById('scroll-area').innerHTML = renderTab();
  attachTabEvents();
  bip(660, 0.2); bip(880, 0.3); bip(1100, 0.5);
  toast(t('toast_tratament_finalizat'));

  // Navighează la simptome
  setTimeout(() => {
    S.tab = 'simptome';
    document.getElementById('scroll-area').innerHTML = renderTab();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === S.tab));
    attachTabEvents();
    toast(t('toast_completeaza_simptome'));
  }, 1500);
}

function checkPhaseChange(trt, ziuaCurenta) {
  if (ziuaCurenta < 2) return;
  const pasAzi  = pasProtocolPentruZiua(trt, ziuaCurenta);
  const pasIeri = pasProtocolPentruZiua(trt, ziuaCurenta - 1);
  if (!pasAzi || !pasIeri) return;
  if (pasAzi.picaturi === pasIeri.picaturi && pasAzi.unitati === pasIeri.unitati) return;
  if (!trt.milestones) trt.milestones = [];
  const dejazi = trt.milestones.find(m => m.data === today() && m.label.startsWith('🔬'));
  if (!dejazi) {
    trt.milestones.push({
      data: today(),
      label: t('milestone_faza_noua', { picaturi: pasAzi.picaturi, unitati: pasAzi.unitati }),
      detalii: t('milestone_faza_anterior', { picaturi: pasIeri.picaturi, unitati: pasIeri.unitati })
    });
  }
}

function checkExpirPasiExtra(trt) {
  (trt.pasiExtra || []).forEach(p => {
    if (p.activ === false) return;
    p.usesCount = (p.usesCount || 0) + 1;
    let expirat = false;
    if (p.expirare?.tip === 'dupa_uses' && p.expirare.valoare > 0
        && p.usesCount >= p.expirare.valoare) expirat = true;
    if (p.expirare?.tip === 'dupa_data' && p.expirare.valoare
        && today() >= p.expirare.valoare) expirat = true;
    if (expirat) {
      p.activ = false;
      if (!trt.milestones) trt.milestones = [];
      const det = p.expirare.tip === 'dupa_uses'
        ? t('milestone_pas_expirat_folosiri', { val: p.expirare.valoare, cuvant: p.expirare.valoare === 1 ? t('cuvant_folosire') : t('cuvant_folosiri') })
        : t('milestone_pas_expirat_data', { data: formatDate(p.expirare.valoare) });
      trt.milestones.push({ data: today(), label: t('milestone_pas_finalizat', { label: p.label }), detalii: det });
      setTimeout(() => toast(t('toast_pas_finalizat', { label: p.label }), 4000), 1800);
    }
  });
}

function showEditAntihistaminic(trt) {
  const a = trt.antihistaminic;
  let tmpTip = a.tip || 'pastile';
  let tmpPoz = a.pozitie || 'inainte';
  // Implicit ON: singurul mod de a ajunge aici cu activ=false e butonul "+ Adaugă antihistaminic".
  let tmpActiv = true;

  showOverlay(`
    <div class="modal">
      <div class="modal-title">${t('modal_anti_titlu')}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:10px 0;margin-bottom:4px">
        <div>
          <div style="font-weight:600">${t('modal_anti_activ_titlu')}</div>
          <div style="font-size:12px;color:var(--text-light)">${t('modal_anti_activ_sub')}</div>
        </div>
        <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer">
          <input type="checkbox" id="anti-activ" ${tmpActiv ? 'checked' : ''}
            style="opacity:0;width:0;height:0;position:absolute">
          <span id="anti-activ-track" style="position:absolute;inset:0;background:${tmpActiv ? 'var(--teal)' : '#CCC'};
            border-radius:13px;transition:0.2s"></span>
          <span id="anti-activ-thumb" style="position:absolute;left:${tmpActiv ? '24px' : '2px'};top:2px;
            width:22px;height:22px;background:white;border-radius:50%;transition:0.2s;
            box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span>
        </label>
      </div>

      <div class="form-group">
        <label>${t('modal_anti_label_denumire')}</label>
        <input type="text" id="anti-nume" value="${a.nume || ''}" placeholder="${t('onb_placeholder_anti_nume')}">
      </div>
      <div class="form-group">
        <label>${t('modal_anti_label_doza')}</label>
        <input type="text" id="anti-doza" value="${a.doza || ''}" placeholder="${t('modal_anti_placeholder_doza')}">
        <p class="hint">${t('modal_anti_hint_doza')}</p>
      </div>

      <div class="form-group">
        <label>${t('modal_anti_label_tip')}</label>
        <div class="toggle-group" id="anti-tip-group">
          <button class="toggle-btn ${tmpTip === 'pastile' ? 'selected' : ''}" data-antitip2="pastile">${t('onb_anti_pastile')}</button>
          <button class="toggle-btn ${tmpTip === 'picaturi' ? 'selected' : ''}" data-antitip2="picaturi">${t('onb_anti_picaturi')}</button>
        </div>
      </div>

      <div class="form-group">
        <label>${t('modal_anti_label_pozitie')}</label>
        <div class="toggle-group" id="anti-poz-group">
          <button class="toggle-btn ${tmpPoz === 'inainte' ? 'selected' : ''}" data-antipoz2="inainte">${t('modal_anti_inainte_recomandat')}</button>
          <button class="toggle-btn ${tmpPoz === 'dupa' ? 'selected' : ''}" data-antipoz2="dupa">${t('modal_anti_dupa')}</button>
        </div>
      </div>

      <div class="form-group">
        <label>${t('modal_anti_label_interval')}</label>
        <input type="number" id="anti-minute" value="${a.minute || 20}" min="1" max="120">
        <p class="hint important">${t('modal_anti_hint_interval')}</p>
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">${t('anuleaza')}</button>
        <button class="btn btn-primary" id="btn-save-anti">${t('modal_anti_save')}</button>
      </div>
    </div>
  `);

  // Toggle activ
  document.getElementById('anti-activ').addEventListener('change', e => {
    tmpActiv = e.target.checked;
    document.getElementById('anti-activ-track').style.background = tmpActiv ? 'var(--teal)' : '#CCC';
    document.getElementById('anti-activ-thumb').style.left = tmpActiv ? '24px' : '2px';
  });
  // Tip toggle
  document.querySelectorAll('[data-antitip2]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpTip = btn.dataset.antitip2;
      document.querySelectorAll('[data-antitip2]').forEach(b => b.classList.toggle('selected', b.dataset.antitip2 === tmpTip));
    });
  });
  // Poziție toggle
  document.querySelectorAll('[data-antipoz2]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.antipoz2;
      document.querySelectorAll('[data-antipoz2]').forEach(b => b.classList.toggle('selected', b.dataset.antipoz2 === tmpPoz));
    });
  });

  document.getElementById('btn-save-anti').addEventListener('click', () => {
    a.activ   = tmpActiv;
    a.tip     = tmpTip;
    a.pozitie = tmpPoz;
    a.nume    = document.getElementById('anti-nume').value.trim();
    a.doza    = document.getElementById('anti-doza').value.trim();
    a.minute  = +(document.getElementById('anti-minute').value) || 20;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_anti_actualizat'));
  });
}

function showEditPasExtra(trt, idx) {
  const p = trt.pasiExtra[idx];
  if (!p) return;
  let tmpPoz = p.pozitie || 'dupa';
  let tmpExpTip = p.expirare?.tip || 'niciodata';

  showOverlay(`
    <div class="modal">
      <div class="modal-title">${t('modal_pas_edit_titlu')}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_descriere')}</label>
        <input type="text" id="ep-label" value="${p.label}" style="font-size:16px">
      </div>
      <div class="form-group">
        <label>${t('modal_pas_label_durata')}</label>
        <input type="number" id="ep-min" value="${p.minute || 0}" min="0" max="120">
      </div>
      <div class="form-group">
        <label>${t('modal_pas_label_nota')}</label>
        <input type="text" id="ep-sub" value="${p.sub || ''}" placeholder="${t('modal_pas_placeholder_nota')}">
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_pozitie')}</label>
        <div class="toggle-group" id="ep-poz-group">
          <button class="toggle-btn ${tmpPoz === 'inainte' ? 'selected' : ''}" data-ep-poz="inainte">${t('modal_pas_inainte_de_staloral')}</button>
          <button class="toggle-btn ${tmpPoz === 'dupa' ? 'selected' : ''}" data-ep-poz="dupa">${t('modal_pas_dupa_tratament')}</button>
        </div>
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_expirare')}</label>
        <div style="display:flex;flex-direction:column;gap:6px" id="ep-exp-group">
          <button class="toggle-btn ${tmpExpTip === 'niciodata' ? 'selected' : ''}" data-ep-exp="niciodata" style="text-align:left">${t('modal_pas_exp_niciodata')}</button>
          <button class="toggle-btn ${tmpExpTip === 'dupa_uses' ? 'selected' : ''}" data-ep-exp="dupa_uses" style="text-align:left">${t('modal_pas_exp_folosiri')}</button>
          <button class="toggle-btn ${tmpExpTip === 'dupa_data' ? 'selected' : ''}" data-ep-exp="dupa_data" style="text-align:left">${t('modal_pas_exp_data')}</button>
        </div>
      </div>

      <div id="ep-exp-valoare" style="${tmpExpTip === 'niciodata' ? 'display:none' : ''}">
        ${tmpExpTip === 'dupa_uses' ? `
          <div class="form-group">
            <label>${t('modal_pas_label_numar_folosiri')}</label>
            <input type="number" id="ep-exp-num" value="${p.expirare?.valoare || 1}" min="1">
          </div>
        ` : tmpExpTip === 'dupa_data' ? `
          <div class="form-group">
            <label>${t('modal_pas_label_expira_la')}</label>
            <input type="date" id="ep-exp-data" value="${p.expirare?.valoare || today()}">
          </div>
        ` : ''}
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">${t('anuleaza')}</button>
        <button class="btn btn-primary" id="btn-ep-save">${t('modal_anti_save')}</button>
      </div>
    </div>
  `);

  // Poziție toggle
  document.querySelectorAll('[data-ep-poz]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.epPoz;
      document.querySelectorAll('[data-ep-poz]').forEach(b => b.classList.toggle('selected', b.dataset.epPoz === tmpPoz));
    });
  });

  // Expirare toggle
  document.querySelectorAll('[data-ep-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpExpTip = btn.dataset.epExp;
      document.querySelectorAll('[data-ep-exp]').forEach(b => b.classList.toggle('selected', b.dataset.epExp === tmpExpTip));
      const valEl = document.getElementById('ep-exp-valoare');
      valEl.style.display = tmpExpTip === 'niciodata' ? 'none' : '';
      valEl.innerHTML = tmpExpTip === 'dupa_uses'
        ? `<div class="form-group"><label>${t('modal_pas_label_numar_folosiri')}</label>
            <input type="number" id="ep-exp-num" value="${p.expirare?.valoare || 1}" min="1"></div>`
        : `<div class="form-group"><label>${t('modal_pas_label_expira_la')}</label>
            <input type="date" id="ep-exp-data" value="${p.expirare?.valoare || today()}"></div>`;
    });
  });

  document.getElementById('btn-ep-save').addEventListener('click', () => {
    p.label   = document.getElementById('ep-label').value.trim() || p.label;
    p.minute  = +(document.getElementById('ep-min').value) || 0;
    p.sub     = document.getElementById('ep-sub').value.trim();
    p.pozitie = tmpPoz;
    p.expirare = { tip: tmpExpTip, valoare: null };
    if (tmpExpTip === 'dupa_uses')
      p.expirare.valoare = +(document.getElementById('ep-exp-num')?.value) || 1;
    if (tmpExpTip === 'dupa_data')
      p.expirare.valoare = document.getElementById('ep-exp-data')?.value || null;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_pas_actualizat'));
  });
}

function showAdaugaPasExtra(trt) {
  let tmpPoz = 'dupa';
  let tmpExpTip = 'niciodata';

  showOverlay(`
    <div class="modal">
      <div class="modal-title">${t('modal_pas_nou_titlu')}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_descriere')}</label>
        <input type="text" id="np-label" placeholder="${t('modal_pas_placeholder_descriere')}" style="font-size:16px">
      </div>
      <div class="form-group">
        <label>${t('modal_pas_label_durata')}</label>
        <input type="number" id="np-min" value="0" min="0" max="120">
      </div>
      <div class="form-group">
        <label>${t('modal_pas_label_nota')}</label>
        <input type="text" id="np-sub" placeholder="${t('modal_pas_placeholder_nota')}">
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_pozitie')}</label>
        <div class="toggle-group" id="np-poz-group">
          <button class="toggle-btn" data-np-poz="inainte">${t('modal_pas_inainte_de_staloral')}</button>
          <button class="toggle-btn selected" data-np-poz="dupa">${t('modal_pas_dupa_tratament')}</button>
        </div>
      </div>

      <div class="form-group">
        <label>${t('modal_pas_label_expirare')}</label>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="toggle-btn selected" data-np-exp="niciodata" style="text-align:left">${t('modal_pas_exp_niciodata')}</button>
          <button class="toggle-btn" data-np-exp="dupa_uses" style="text-align:left">${t('modal_pas_exp_folosiri_ex')}</button>
          <button class="toggle-btn" data-np-exp="dupa_data" style="text-align:left">${t('modal_pas_exp_data')}</button>
        </div>
      </div>
      <div id="np-exp-valoare" style="display:none"></div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">${t('anuleaza')}</button>
        <button class="btn btn-primary" id="btn-np-save">${t('modal_pas_adauga')}</button>
      </div>
    </div>
  `);

  document.querySelectorAll('[data-np-poz]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.npPoz;
      document.querySelectorAll('[data-np-poz]').forEach(b => b.classList.toggle('selected', b.dataset.npPoz === tmpPoz));
    });
  });

  document.querySelectorAll('[data-np-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpExpTip = btn.dataset.npExp;
      document.querySelectorAll('[data-np-exp]').forEach(b => b.classList.toggle('selected', b.dataset.npExp === tmpExpTip));
      const valEl = document.getElementById('np-exp-valoare');
      valEl.style.display = tmpExpTip === 'niciodata' ? 'none' : '';
      valEl.innerHTML = tmpExpTip === 'dupa_uses'
        ? `<div class="form-group"><label>${t('modal_pas_label_numar_folosiri')}</label>
            <input type="number" id="np-exp-num" value="10" min="1">
            <p class="hint">${t('modal_pas_hint_numar_folosiri')}</p></div>`
        : `<div class="form-group"><label>${t('modal_pas_label_expira_la')}</label>
            <input type="date" id="np-exp-data" value="${today()}"></div>`;
    });
  });

  document.getElementById('btn-np-save').addEventListener('click', () => {
    const label = document.getElementById('np-label').value.trim();
    if (!label) { toast(t('toast_adauga_descriere')); return; }
    if (!trt.pasiExtra) trt.pasiExtra = [];
    const expirare = { tip: tmpExpTip, valoare: null };
    if (tmpExpTip === 'dupa_uses')
      expirare.valoare = +(document.getElementById('np-exp-num')?.value) || 1;
    if (tmpExpTip === 'dupa_data')
      expirare.valoare = document.getElementById('np-exp-data')?.value || null;
    trt.pasiExtra.push({
      label,
      minute: +(document.getElementById('np-min').value) || 0,
      sub: document.getElementById('np-sub').value.trim(),
      pozitie: tmpPoz,
      expirare,
      usesCount: 0,
      activ: true
    });
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_pas_adaugat'));
  });
}

function checkAlertStoc(trt) {
  if (trt.staloral.flaconCurent <= trt.staloral.alertaPicaturi) {
    toast(t('toast_picaturi_putine', { ramase: trt.staloral.flaconCurent }), 5000);
  }
  if (trt.staloral.flacoaneRamase <= trt.staloral.alertaFlacoane) {
    toast(t('toast_flacoane_putine', { ramase: trt.staloral.flacoaneRamase }), 5000);
  }
  if (trt.antihistaminic.activ) {
    const prag = Math.ceil(trt.antihistaminic.stocInitial * 0.1);
    if (trt.antihistaminic.stoc <= prag) {
      toast(t('toast_anti_stoc_scazut', { nume: trt.antihistaminic.nume, stoc: trt.antihistaminic.stoc }), 5000);
    }
  }
}

// --- SIMPTOME ---

function attachSimptomeEvents() {
  const trt = tratamentActiv();
  if (!trt) return;

  // Schimbare dată → re-randează cu noua dată
  document.getElementById('sim-data')?.addEventListener('change', e => {
    S.simptomeData = e.target.value || null;
    S.simptomeCurate = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });

  const dataSelectata = S.simptomeData || today();
  const intrareZi = trt.istoric.find(e => e.data === dataSelectata);
  let simptomeSelectate = {};
  if (!S.simptomeCurate && intrareZi?.simptome) {
    intrareZi.simptome.forEach(s => { simptomeSelectate[s.id] = s.severitate; });
  }

  document.querySelectorAll('.symptom-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('sev-btn')) return;
      document.getElementById('hint-simptome-goale')?.style && (document.getElementById('hint-simptome-goale').style.display = 'none');
      const id = row.dataset.id;
      if (simptomeSelectate[id]) {
        delete simptomeSelectate[id];
        // Re-render rândul fără severitate
        row.style.border = '2px solid #E0EDEB';
        row.style.background = 'white';
        row.classList.remove('selected');
        row.querySelectorAll('.severity-row').forEach(r => r.remove());
        row.querySelector('span:nth-child(2), div > span:last-child') && (row.querySelector('div > span:last-child').style.fontWeight = '400');
      } else {
        simptomeSelectate[id] = 'usor';
        row.style.border = '2px solid var(--teal)';
        row.style.background = 'var(--teal-light)';
        row.classList.add('selected');
        // Adaugă severitate
        const sevRow = document.createElement('div');
        sevRow.className = 'severity-row';
        sevRow.style.marginTop = '10px';
        sevRow.innerHTML = SEVERITATE.map(sv => `
          <button class="sev-btn ${sv.id} ${simptomeSelectate[id] === sv.id ? 'sel' : ''}"
            data-symptom="${id}" data-sev="${sv.id}">${sv.emoji} ${tSeveritate(sv.id)}</button>
        `).join('');
        row.appendChild(sevRow);
        sevRow.querySelectorAll('.sev-btn').forEach(sb => {
          sb.addEventListener('click', e => {
            e.stopPropagation();
            simptomeSelectate[id] = sb.dataset.sev;
            sevRow.querySelectorAll('.sev-btn').forEach(b => b.classList.toggle('sel', b.dataset.sev === sb.dataset.sev));
          });
        });
        // Câmp text pentru "Altele"
        if (id === 'altele') {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'altele-detalii';
          inp.placeholder = t('simptome_placeholder_detalii');
          inp.style.cssText = 'margin-top:8px;width:100%;padding:8px 10px;border:1px solid #DDF0ED;border-radius:8px;font-size:13px;box-sizing:border-box';
          inp.addEventListener('click', e => e.stopPropagation());
          row.appendChild(inp);
        }
      }
    });
  });

  document.getElementById('btn-totul-ok')?.addEventListener('click', () => {
    salveazaSimptome(trt, [], true, dataSelectata);
  });

  document.getElementById('btn-salveaza-simptome')?.addEventListener('click', () => {
    const detaliiAltele = document.querySelector('.altele-detalii')?.value.trim() || '';
    const sim = Object.entries(simptomeSelectate).map(([id, severitate]) => {
      const obj = { id, severitate };
      if (id === 'altele' && detaliiAltele) obj.detalii = detaliiAltele;
      return obj;
    });
    if (sim.length === 0) {
      const hint = document.getElementById('hint-simptome-goale');
      if (hint) {
        hint.style.display = 'block';
        hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    salveazaSimptome(trt, sim, false, dataSelectata);
  });
}

function salveazaSimptome(trt, simptome, totulOk, data) {
  const dataZi = data || today();
  const esteAzi = dataZi === today();
  const intrare = trt.istoric.find(e => e.data === dataZi);

  // Scade stoc dacă e zi trecută și e bifat "tratament efectuat"
  const scadeStoc = !esteAzi && document.getElementById('chk-scade-stoc')?.checked;

  if (intrare) {
    intrare.simptome = simptome;
    intrare.totulOk  = totulOk;
    if (scadeStoc && !intrare.finalizat) {
      // Marchează ca finalizat și scade stoc
      const ziuaNr = Math.floor((new Date(dataZi) - new Date(trt.dataStart)) / 86400000) + 1;
      const pas = pasProtocolPentruZiua(trt, ziuaNr);
      if (pas) {
        intrare.finalizat = true;
        intrare.picaturi = pas.picaturi;
        intrare.unitati  = pas.unitati;
        trt.staloral.flaconCurent = Math.max(0, trt.staloral.flaconCurent - pas.picaturi);
        if (trt.antihistaminic.activ) trt.antihistaminic.stoc = Math.max(0, trt.antihistaminic.stoc - 1);
      }
    }
  } else {
    const ziuaNr = Math.floor((new Date(dataZi) - new Date(trt.dataStart)) / 86400000) + 1;
    const pas = scadeStoc ? pasProtocolPentruZiua(trt, ziuaNr) : null;
    if (scadeStoc && pas) {
      trt.staloral.flaconCurent = Math.max(0, trt.staloral.flaconCurent - pas.picaturi);
      if (trt.antihistaminic.activ) trt.antihistaminic.stoc = Math.max(0, trt.antihistaminic.stoc - 1);
    }
    trt.istoric.push({
      data: dataZi, ora: Date.now(), finalizat: !!scadeStoc, sarit: false,
      picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0, simptome, totulOk
    });
  }

  // Sortează istoricul cronologic
  trt.istoric.sort((a, b) => a.data.localeCompare(b.data));

  saveData();
  if (esteAzi) {
    S.simptomeCurate = true;
    S.simptomeData = null; // resetează la azi după salvare
  }
  document.getElementById('scroll-area').innerHTML = renderTab();
  S.simptomeCurate = false;
  attachTabEvents();

  const msg = scadeStoc
    ? t('toast_salvat_stoc_scazut', { data: formatDate(dataZi) })
    : totulOk ? t('toast_totul_ok_salvat_istoric') : t('toast_simptome_salvate', { n: simptome.length });
  toast(msg);
  if (esteAzi && trt.emailActiv && trt.email && trt.emailjs?.serviceId) trimiteEmail(trt);
}

// --- STOCURI ---

function attachStocuriEvents() {
  const trt = tratamentActiv();
  if (!trt) return;

  document.getElementById('btn-flacon-nou')?.addEventListener('click', () => {
    trt.staloral.flaconCurent = 50;
    trt.staloral.dataExpirare = ''; // resetează data expirare la flacon nou
    if (trt.staloral.flacoaneRamase > 0) trt.staloral.flacoaneRamase--;
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_flacon_nou_deschis'));
  });

  document.getElementById('btn-salveaza-expirare')?.addEventListener('click', () => {
    const val = document.getElementById('input-data-expirare')?.value || '';
    trt.staloral.dataExpirare = val;
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(val ? t('toast_data_expirare_salvata', { data: formatDate(val) }) : t('toast_data_expirare_stearsa'));
  });

  document.getElementById('btn-corecteaza')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">${t('modal_corecteaza_pic_titlu')} <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>${t('modal_label_pic_ramase')}</label>
          <input type="number" id="cor-pic" value="${trt.staloral.flaconCurent}" min="0" max="50">
        </div>
        <div class="form-group">
          <label>${t('modal_label_flacoane_rezerva')}</label>
          <input type="number" id="cor-fla" value="${trt.staloral.flacoaneRamase}" min="0">
        </div>
        <button class="btn btn-primary" id="btn-cor-save">${t('salveaza')}</button>
      </div>
    `);
    document.getElementById('btn-cor-save').addEventListener('click', () => {
      trt.staloral.flaconCurent    = +(document.getElementById('cor-pic').value) || 0;
      trt.staloral.flacoaneRamase  = +(document.getElementById('cor-fla').value) || 0;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(t('toast_stoc_corectat'));
    });
  });

  document.getElementById('btn-cutie-noua')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">${t('modal_flacon_nou_titlu')} <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>${t('modal_label_cate_adaugi', { tip: trt.antihistaminic.tip === 'pastile' ? t('modal_pastile') : t('modal_doze') })}</label>
          <input type="number" id="add-anti" value="${trt.antihistaminic.stocInitial || 30}" min="1">
        </div>
        <button class="btn btn-primary" id="btn-add-anti-save">${t('modal_btn_adauga_stoc')}</button>
      </div>
    `);
    document.getElementById('btn-add-anti-save').addEventListener('click', () => {
      const add = +(document.getElementById('add-anti').value) || 0;
      trt.antihistaminic.stoc += add;
      trt.antihistaminic.stocInitial = trt.antihistaminic.stoc;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(t('toast_adaugate_la_stoc', { n: add }));
    });
  });

  document.getElementById('btn-corecteaza-anti')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">${t('modal_corecteaza_anti_titlu', { tip: trt.antihistaminic.tip === 'pastile' ? t('modal_pastile') : t('protocol_row_pic_placeholder') })} <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>${t('modal_label_ramase', { tip: trt.antihistaminic.tip === 'pastile' ? t('modal_pastile') : t('modal_doze') })}</label>
          <input type="number" id="cor-anti" value="${trt.antihistaminic.stoc}" min="0">
        </div>
        <button class="btn btn-primary" id="btn-cor-anti-save">${t('salveaza')}</button>
      </div>
    `);
    document.getElementById('btn-cor-anti-save').addEventListener('click', () => {
      trt.antihistaminic.stoc = +(document.getElementById('cor-anti').value) || 0;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(t('toast_stoc_corectat'));
    });
  });

  document.getElementById('btn-alerte-edit')?.addEventListener('click', () => {
    S.alerteExpanded = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-alerte-cancel')?.addEventListener('click', () => {
    S.alerteExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-salveaza-alerte')?.addEventListener('click', () => {
    trt.staloral.alertaPicaturi = +(document.getElementById('alert-picaturi').value) || 5;
    trt.staloral.alertaFlacoane = +(document.getElementById('alert-flacoane').value) || 1;
    saveData();
    S.alerteExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_praguri_salvate'));
  });
}

// --- SETĂRI ---

function attachSetariEvents() {
  // Acordeon secțiuni
  document.querySelectorAll('[data-acc]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.acc;
      S.setariOpen[id] = !S.setariOpen[id];
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
    });
  });

  // Antihistaminic — editare
  document.getElementById('btn-edit-anti')?.addEventListener('click', () => {
    const trt = tratamentActiv(); if (!trt) return;
    showEditAntihistaminic(trt);
  });

  // Pași extra — editare
  document.querySelectorAll('[data-edit-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const trt = tratamentActiv(); if (!trt) return;
      showEditPasExtra(trt, +btn.dataset.editExtra);
    });
  });

  // Pași extra — ștergere
  document.querySelectorAll('[data-del-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const trt = tratamentActiv(); if (!trt) return;
      const p = trt.pasiExtra[+btn.dataset.delExtra];
      confirmDialog(t('confirm_sterge_pas', { label: p?.label || '' }), () => {
        trt.pasiExtra.splice(+btn.dataset.delExtra, 1);
        saveData();
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast(t('toast_pas_sters'));
      }, { danger: true, textConfirma: t('sterge') });
    });
  });

  // Pași extra — adăugare
  document.getElementById('btn-adauga-pas-extra')?.addEventListener('click', () => {
    const trt = tratamentActiv(); if (!trt) return;
    showAdaugaPasExtra(trt);
  });

  // Toggle email on/off
  document.getElementById('toggle-email')?.addEventListener('change', e => {
    const trt = tratamentActiv();
    if (!trt) return;
    trt.emailActiv = e.target.checked;
    const track = document.getElementById('toggle-email-track');
    const thumb = document.getElementById('toggle-email-thumb');
    if (track) track.style.background = trt.emailActiv ? 'var(--teal)' : '#CCC';
    if (thumb) thumb.style.left = trt.emailActiv ? '24px' : '2px';
    saveData();
    toast(trt.emailActiv ? t('toast_email_activat') : t('toast_email_dezactivat'));
  });

  // Email adresă
  document.getElementById('btn-salveaza-email')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    const val = document.getElementById('set-email')?.value.trim() || '';
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      toast(t('toast_eroare_email_invalid')); return;
    }
    trt.email = val;
    saveData();
    toast(t('toast_email_salvat'));
  });

  // EmailJS config
  document.getElementById('btn-ejs-edit')?.addEventListener('click', () => {
    S.ejsExpanded = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-ejs-cancel')?.addEventListener('click', () => {
    S.ejsExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-salveaza-emailjs')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    if (!trt.emailjs) trt.emailjs = {};
    trt.emailjs.serviceId  = document.getElementById('ejs-service')?.value.trim() || '';
    trt.emailjs.templateId = document.getElementById('ejs-template')?.value.trim() || '';
    trt.emailjs.publicKey  = document.getElementById('ejs-pubkey')?.value.trim() || '';
    saveData();
    S.ejsExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_emailjs_salvat'));
  });

  // Activare tratament
  document.querySelectorAll('[data-activare]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.data.activId = btn.dataset.activare;
      saveData();
      S.timerStepIdx = null;
      S.timerDone = false;
      stopAllTimers();
      S.tab = 'acasa';
      render();
    });
  });

  // Tratament nou
  document.getElementById('btn-tratament-nou')?.addEventListener('click', () => {
    S.onb = { step: 1, d: {} };
    S.data.tratamente = S.data.tratamente; // keep existing
    // Temporar golim lista ca să apară onboarding
    const backup = S.data.tratamente;
    const backupId = S.data.activId;
    S.data._backup = { tratamente: backup, activId: backupId };
    S.data.tratamente = [];
    S.data.activId = null;
    render();
  });

  // Limbă
  document.querySelectorAll('[data-lang-set]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.langSet));
  });

  // Temă
  document.querySelectorAll('[data-tema-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      aplicaTema(btn.dataset.temaSet);
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(t('toast_tema_schimbata'));
    });
  });

  // Edit protocol
  document.getElementById('btn-edit-protocol')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    showEditProtocol(trt);
  });

  // Link Staloral custom
  document.getElementById('btn-salveaza-link-staloral')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    const val = document.getElementById('input-link-staloral')?.value.trim() || '';
    trt.linkStaloral = val;
    saveData();
    render();
    toast(t('toast_link_staloral_salvat'));
  });
  document.getElementById('btn-reseteaza-link-staloral')?.addEventListener('click', () => {
    const trt = tratamentActiv();
    if (!trt) return;
    trt.linkStaloral = '';
    saveData();
    render();
    toast(t('toast_link_resetat'));
  });

  // Export
  document.getElementById('btn-export')?.addEventListener('click', showExportModal);

  // Import
  document.getElementById('btn-import')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });
  document.getElementById('import-file')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    // Fișier prea mare (>5MB) e suspect
    if (file.size > 5 * 1024 * 1024) {
      toast(t('toast_fisier_prea_mare'));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const eroare = valideazaImport(data);
        if (eroare) {
          toast(`❌ ${eroare}`);
          e.target.value = '';
          return;
        }
        confirmDialog(t('confirm_import', { n: data.tratamente.length }), () => {
          S.data = data;
          saveData();
          render();
          toast(t('toast_date_importate'));
        }, { danger: true, textConfirma: t('confirm_import_btn') });
      } catch {
        toast(t('toast_fisier_invalid'));
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  // Reset
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    confirmDialog(t('confirm_reset_1'), () => {
      confirmDialog(t('confirm_reset_2'), () => {
        localStorage.removeItem(STORAGE_KEY);
        S.data = defaultData();
        S.onb = { step: 1, d: {} };
        S.timerStepIdx = null;
        S.timerDone = false;
        stopAllTimers();
        render();
        toast(t('toast_date_sterse'));
      }, { danger: true, textConfirma: t('confirm_reset_btn_sterge') });
    }, { danger: true, textConfirma: t('confirm_reset_btn_continua') });
  });
}

function showEditProtocol(trt) {
  let protocol = trt.protocol.map(p => ({ ...p }));

  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        ${t('modal_edit_protocol_titlu')}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>
      <p style="font-size:13px;color:var(--text-light);margin-bottom:16px">
        ${t('modal_edit_protocol_text')}
      </p>
      <div id="edit-protocol-rows">
        ${protocol.map((p, i) => renderProtocolRow(p, i, protocol)).join('')}
      </div>
      <button class="btn btn-outline" id="ep-add" style="margin-top:8px">${t('btn_adauga_pas')}</button>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">${t('anuleaza')}</button>
        <button class="btn btn-primary" id="ep-save">${t('salveaza')}</button>
      </div>
    </div>
  `);

  attachProtocolRowEvents('edit-protocol-rows', protocol);

  document.getElementById('ep-add').addEventListener('click', () => {
    protocol.push({ id: uid(), zile: 1, picaturi: 1, unitati: 100, tipData: 'zile' });
    document.getElementById('edit-protocol-rows').innerHTML = protocol.map((p, i) => renderProtocolRow(p, i, protocol)).join('');
    attachProtocolRowEvents('edit-protocol-rows', protocol);
  });

  document.getElementById('ep-save').addEventListener('click', () => {
    protocol.forEach((_, i) => {
      const row = document.querySelector(`[data-idx="${i}"]`);
      if (!row) return;
      if (protocol[i].tipData === 'calendar') {
        protocol[i].dataStart = row.querySelector('.pr-data-start')?.value || protocol[i].dataStart;
        protocol[i].dataEnd   = row.querySelector('.pr-data-end')?.value || protocol[i].dataEnd;
      } else {
        protocol[i].zile = +(row.querySelector('.pr-zile')?.value || 1);
      }
      protocol[i].picaturi = +(row.querySelector('.pr-pic')?.value || 1);
      protocol[i].unitati  = +(row.querySelector('.pr-u')?.value || 10);
    });
    const pauze = detecteazaPauzeProtocol(protocol);
    if (pauze > 0) {
      toast(t('toast_pauza_protocol', { zile: pauze, ziCuvant: pauze === 1 ? t('istoric_zi') : t('istoric_zile') }), 5000);
      return;
    }
    trt.protocol = protocol;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(t('toast_protocol_actualizat'));
  });
}

// ============================================================
//  EXPORT / IMPORT JSON
// ============================================================

function valideazaImport(data) {
  if (!data || typeof data !== 'object') return t('import_eroare_date_invalide');
  if (!Array.isArray(data.tratamente)) return t('import_eroare_lipsesc_tratamente');
  if (data.tratamente.length === 0) return t('import_eroare_fara_tratamente');

  for (const trt of data.tratamente) {
    if (typeof trt !== 'object' || !trt.id) return t('import_eroare_structura');
    if (!Array.isArray(trt.protocol)) return t('import_eroare_protocol_corupt', { nume: trt.nume || trt.id });
    if (!Array.isArray(trt.istoric)) return t('import_eroare_istoric_corupt', { nume: trt.nume || trt.id });
    if (!trt.staloral || typeof trt.staloral !== 'object') return t('import_eroare_stocuri_corupte', { nume: trt.nume || trt.id });
  }

  return null; // totul ok
}

function exportJSON(filtruId = null) {
  let dataDeExportat;
  if (filtruId && filtruId !== 'toti') {
    const trt = S.data.tratamente.find(x => x.id === filtruId);
    dataDeExportat = { ...S.data, tratamente: trt ? [trt] : [], activId: trt?.id || null };
  } else {
    dataDeExportat = S.data;
  }
  const json = JSON.stringify(dataDeExportat, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  const numeFisier = filtruId && filtruId !== 'toti'
    ? `miau-backup-${S.data.tratamente.find(x => x.id === filtruId)?.nume?.replace(/\s/g,'-') || 'copil'}-${today()}.json`
    : `miau-backup-${today()}.json`;
  a.download = numeFisier;
  a.click();
  URL.revokeObjectURL(url);
  S.data.lastBackup = today();
  saveData();
  toast(t('toast_export_realizat'));
}

function showExportModal() {
  if (S.data.tratamente.length <= 1) { exportJSON(); return; }
  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        ${t('modal_export_titlu')}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px">${t('modal_export_pentru_cine')}</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-primary" data-export-id="toti">${t('modal_export_toti', { n: S.data.tratamente.length })}</button>
        ${S.data.tratamente.map(trt => `
          <button class="btn btn-outline" data-export-id="${trt.id}">${t('modal_export_pentru')} ${trt.nume}</button>
        `).join('')}
      </div>
    </div>
  `);
  document.querySelectorAll('[data-export-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeOverlay();
      exportJSON(btn.dataset.exportId);
    });
  });
}

// ============================================================
//  EMAIL (EmailJS)
// ============================================================

function trimiteEmail(trt) {
  if (!trt.emailjs?.serviceId || !trt.emailjs?.templateId || !trt.emailjs?.publicKey) return;

  try {
    emailjs.init(trt.emailjs.publicKey);
    const intrareAzi = trt.istoric.find(e => e.data === today());
    const simStr = intrareAzi?.totulOk ? t('email_totul_ok') :
      intrareAzi?.simptome?.map(s => {
        const info = SIMPTOME.find(x => x.id === s.id);
        return `${info ? tSimptom(info.id) : s.id} (${s.severitate})`;
      }).join(', ') || t('email_nicio_informatie');

    const params = {
      to_email:    trt.email,
      copil:       trt.nume,
      data:        formatDate(today()),
      ora:         formatTime(intrareAzi?.ora || Date.now()),
      picaturi:    intrareAzi?.picaturi || 0,
      unitati:     intrareAzi?.unitati || 0,
      simptome:    simStr,
      stoc_pic:    trt.staloral.flaconCurent,
      stoc_fla:    trt.staloral.flacoaneRamase,
      stoc_anti:   trt.antihistaminic.activ ? trt.antihistaminic.stoc : 'N/A'
    };

    emailjs.send(trt.emailjs.serviceId, trt.emailjs.templateId, params)
      .then(() => toast(t('toast_email_trimis'), 5000))
      .catch(() => toast(t('toast_email_eroare'), 6000));
  } catch {}
}

function verificaReminderBackup() {
  if (!S.data?.tratamente?.length) return;
  const ultim = S.data.lastBackup;
  if (!ultim) {
    setTimeout(() => toast(t('toast_backup_niciodata'), 6000), 2000);
    return;
  }
  const zile = Math.floor((new Date(today()) - new Date(ultim)) / 86400000);
  if (zile >= 30) {
    setTimeout(() => toast(t('toast_backup_vechi', { zile }), 6000), 2000);
  }
}

// ============================================================
//  INIT
// ============================================================

function init() {
  aplicaTema(temaCurenta());
  loadData();
  restoreTimerState();

  // Dacă exista backup de tratamente (tratament nou din setări)
  if (S.data._backup) {
    const backup = S.data._backup;
    S.data.tratamente = [...backup.tratamente, ...S.data.tratamente];
    if (!S.data.activId) S.data.activId = backup.activId;
    delete S.data._backup;
    saveData();
  }

  render();
  verificaReminderBackup();

  // Dacă timer-ul era activ și app-ul s-a reîncărcat pe alt tab, întoarce-l pe Acasă
  if (S._restoreEndTs) {
    S.tab = 'acasa';
    document.getElementById('scroll-area').innerHTML = renderTab();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'acasa'));
    attachTabEvents();
  }
}

// Pornire
document.addEventListener('DOMContentLoaded', init);
