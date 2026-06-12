# Configurare EmailJS — Miau App

Rapoartele zilnice se trimit prin [EmailJS](https://emailjs.com) — un serviciu gratuit care permite trimiterea de emailuri direct din browser, fără server propriu. **Gratuit: 200 emailuri/lună.**

---

## Pasul 1 — Creează cont EmailJS

1. Mergi la [emailjs.com](https://emailjs.com) → **Sign Up**
2. Creează un cont gratuit (poți folosi orice email)

---

## Pasul 2 — Adaugă un Email Service

Un "service" = contul de email de pe care se trimit mesajele.

1. În dashboard EmailJS → **Email Services** → **Add New Service**
2. Alege **Gmail** (sau alt provider)
3. Apasă **Connect Account** → autorizează contul tău Gmail
4. Dă un nume (ex: `Miau App`) → **Create Service**
5. Notează **Service ID** — arată ca `service_xxxxxxx`

---

## Pasul 3 — Creează un Email Template

Template-ul definește cum arată emailul primit.

1. În dashboard → **Email Templates** → **Create New Template**
2. Completează câmpurile:

   - **To Email:** `{{to_email}}`
   - **Subject:** `Miau — Tratament {{copil}} din {{data}}`
   - **Body (HTML sau text):**

```
Bună ziua,

Raport tratament pentru {{copil}} — {{data}} la ora {{ora}}.

DOZA: {{picaturi}} picături × {{unitati}} unități

SIMPTOME: {{simptome}}

STOC STALORAL: {{stoc_pic}} picături rămase în flacon, {{stoc_fla}} flacoane rezervă
STOC ANTIHISTAMINIC: {{stoc_anti}}

---
Trimis automat de aplicația Miau 🐾
```

3. Apasă **Save** → notează **Template ID** — arată ca `template_xxxxxxx`

---

## Pasul 4 — Ia Public Key

1. În dashboard → **Account** → **General**
2. Copiază **Public Key** — un șir de ~20 caractere

---

## Pasul 5 — Configurează în aplicație

1. Deschide aplicația Miau → tab **Setări ⚙️**
2. Derulează la secțiunea **Configurare EmailJS**
3. Completează cele 3 câmpuri:
   - **Service ID** — ex: `service_abc123`
   - **Template ID** — ex: `template_xyz789`
   - **Public Key** — ex: `aBcDeFgHiJkLmNoPqR`
4. Apasă **Salvează configurare EmailJS**
5. Activează toggle-ul **Trimite raport zilnic** și pune adresa de email

Emailul se trimite automat după fiecare tratament finalizat.

---

## Testare

După configurare, finalizează un tratament din aplicație → verifică inbox-ul (și folderul Spam la prima utilizare).

---

## Variabile disponibile în template

| Variabilă | Conținut |
|---|---|
| `{{to_email}}` | Adresa destinatar |
| `{{copil}}` | Numele tratamentului (ex: „Matei — pisică") |
| `{{data}}` | Data în format ZZ.LL.AAAA |
| `{{ora}}` | Ora finalizării |
| `{{picaturi}}` | Numărul de picături administrate |
| `{{unitati}}` | Unitățile (10 sau 100) |
| `{{simptome}}` | Lista simptomelor sau „Totul OK" |
| `{{stoc_pic}}` | Picături rămase în flacon |
| `{{stoc_fla}}` | Flacoane în rezervă |
| `{{stoc_anti}}` | Stoc antihistaminic (sau „N/A") |

---

## Limită gratuită

Planul gratuit EmailJS: **200 emailuri/lună**. Pentru o singură familie cu tratament zilnic = ~30 emailuri/lună — se încadrează confortabil.
