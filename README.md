## Supabase Employee Directory

This project implements the React + Supabase exercise described in
[references/paper.md](references/paper.md). The UI lists employees, formats the
created date as `dd/MM/yyyy`, supports deleting records, and lets you rename an
employee.

### Requirements

- Node.js 18+ recommended
- Supabase project with:
  - Table `Employee` containing `name` (text) and `avatar` (text)
  - Storage bucket `avatars` with public read access
  - Row policy allowing `select` for all
- Firebase project for Analytics, Firestore, and Hosting

### Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`:

#### Supabase
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EMPLOYEE_TABLE` (optional, defaults to `employee`)
- `VITE_AVATAR_BUCKET` (optional, defaults to `avatars`)

#### Firebase
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

3. Start the dev server

```bash
npm run dev
```

### Supabase MCP for VS Code

This repo includes `.vscode/mcp.json` so VS Code MCP-compatible agents can
connect to the Supabase project used for the exercise:

```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=pauqimgtovrfeouvbnte"
    }
  }
}
```

After opening the repo in VS Code, start or reload the MCP client/agent and
complete the Supabase OAuth flow in the browser if prompted. Agent skills are
already recorded in `skills-lock.json`; to reinstall them manually, run:

```bash
npx skills add supabase/agent-skills
```

### Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `firebase deploy` - deploy to Firebase Hosting

### Firebase Integration

The project is integrated with Firebase for:
- **Analytics**: Automatically tracks app usage.
- **Hosting**: Configured for static site deployment.
- **Firestore & Auth**: Initialization ready in `src/lib/firebase.ts`.

To deploy:
1. Build the project: `npm run build`
2. Deploy to Firebase: `firebase deploy --only hosting`

### Notes

- Avatar values can be full URLs or file names stored in the configured bucket.
- Do not commit secrets. `.env` is for local development only.

---
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
