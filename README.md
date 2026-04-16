# ⚽ ყომარ-Bingo Score Tracker

მობილურზე მორგებული საფეხბურთო სტილის საიტი 3 მოთამაშის (🦊 კაკუნა, 🐻 დათო, 🦁 დათა) ქულების სათვალყურეოდ.

## 🚀 სწრაფი დაწყება

### 🧪 Dev (ბაზის გარეშე)
არ გჭირდება PostgreSQL-ის დაყენება — იყენებს in-memory `pg-mem`-ს:
```bash
cd server && npm install && npm start
```
⚠️ მონაცემები იშლება გადატვირთვისას.

### 🏭 ლოკალური PostgreSQL-ით
```bash
# server/.env ფაილი:
DATABASE_URL=postgresql://user:pass@localhost:5432/bingo
```
```bash
cd server && npm install && npm start
```

## 🚂 Railway Deploy

1. **Push GitHub-ზე**:
```bash
git init && git add -A && git commit -m "initial"
git remote add origin https://github.com/USER/bingo.git
git push -u origin main
```
2. [Railway](https://railway.app) → **New Project** → Deploy from GitHub → აირჩიე repo
3. პროექტში: **+ New** → **Database** → **PostgreSQL**
   (Railway ავტომატურად ანიჭებს `DATABASE_URL`-ს სერვისს)
4. **Settings** → **Networking** → **Generate Domain**
5. გახსენი URL ✅

## 🔗 მისამართები

- 🏆 **საჯარო**: `/`
- 📋 **წესები**: `/rules`
- 🔒 **ადმინი**: `/admin-data`

## 🛠 სტეკი

- **Frontend**: HTML + CSS + Vanilla JS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (`pg` driver)
- **Dev fallback**: `pg-mem` (in-memory)

## 📁 სტრუქტურა

```
bingo/
├── server/
│   ├── config/db.js      # pg pool + schema
│   ├── routes/players.js # REST API
│   └── server.js         # express + seed
├── public/
│   ├── index.html        # ანგარიში
│   ├── rules.html        # წესები
│   ├── admin-data.html   # ადმინი
│   ├── css/style.css
│   ├── js/app.js · admin.js
│   └── assets/           # ავატარები
├── package.json          # root (Railway)
└── railway.json          # build config
```
