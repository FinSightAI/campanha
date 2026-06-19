# Playbook — מדריך לקוח פיילוט

---

## שלב 1 — שליחת הצעה וקבלת אישור

**מה לשלוח:** `docs/cliente/proposta.html`
פתח בדפדפן → Cmd+P → Save as PDF → שלח ב-WhatsApp

**הודעת WhatsApp:** העתק מ-`mensagens-whatsapp.md` → הודעה מספר 1

**מה מחכה:** אישור בכתב + תשלום ב-PIX

---

## שלב 2 — לאחר אישור ותשלום

**מה לשלוח:** `docs/cliente/guia-gravacao.html`
פתח בדפדפן → Cmd+P → Save as PDF → שלח ב-WhatsApp

**הודעת WhatsApp:** העתק מ-`mensagens-whatsapp.md` → הודעה מספר 2

**מה מחכה:** סרטון מקור של 2-3 דקות

---

## שלב 3 — קיבלת את סרטון המקור, ייצור Avatar

1. כנס ל-studio.d-id.com
2. צור Instant Avatar עם הסרטון שהתקבל
3. שמור את ה-Avatar ID (נראה כמו: `agt_xxxxxxxx`)
4. כנס ל-vercel.com → הפרויקט של הלקוח → Settings → Environment Variables
5. הוסף / עדכן:
   - `DID_API_KEY` = המפתח שלך מ-D-ID
   - `CAMPANHA_MONTHLY_VIDEO_LIMIT` = `5`
   - `CAMPANHA_MONTHLY_SECONDS_LIMIT` = `600`
   - `GEMINI_API_KEY` = המפתח שלך מ-Google AI Studio
   - `BLOB_READ_WRITE_TOKEN` = טוקן מ-Vercel Blob
6. Redeploy → ממתין עד שמופיע "Aliased"
7. הלקוח שומר את ה-Avatar ID בהגדרות האפליקציה

**הודעה ללקוח:** העתק מ-`mensagens-whatsapp.md` → הודעה מספר 4

---

## שלב 4 — פעיל ושוטף

**כל חודש:**
- שלח הודעת עדכון (הודעה מספר 5)
- שלח הודעת חיוב (הודעה מספר 6)

**אם הלקוח מתלונן על איכות:**
→ שלח הודעה מספר 7
→ 90% מהמקרים הבעיה היא בסרטון המקור (תאורה / רעש)
→ הצע לצלם מחדש ולהכין avatar חדש בחינם

**אם הלקוח רוצה שדרוג לPro:**
→ תוכנית Pro = R$897/חודש
→ ב-Vercel: שנה `CAMPANHA_VIDEO_PROVIDER` = `heygen` → Redeploy
→ עדכן `CAMPANHA_MONTHLY_SECONDS_LIMIT` = `420` (7 דקות)

---

## שדרוג מ-Standard לPro באמצע פיילוט

**המצב:** הלקוח שילם R$350 לפיילוט Standard, ראה את הסרטון ורוצה לנסות איכות Pro.

1. גבה עוד **R$100** (סה"כ R$450 לפיילוט Pro)
2. ב-Vercel → `CAMPANHA_VIDEO_PROVIDER` = `heygen` → Redeploy
3. הלקוח מייצר וידאו חדש ורואה את איכות Pro
4. אם מרוצה → עובר לתוכנית Pro (R$897/חודש)
5. אם לא מרוצה → אפשר לחזור ל-Standard, `CAMPANHA_VIDEO_PROVIDER` = `did` → Redeploy

---

## קבצים בתיקיית cliente (לשלוח ללקוח)

| קובץ | מה זה | מתי |
|---|---|---|
| `proposta.html` | הצעת מחיר | שלב 1 |
| `guia-gravacao.html` | מדריך צילום | שלב 2 |
| `mensagens-whatsapp.md` | הודעות מוכנות | כל השלבים |
