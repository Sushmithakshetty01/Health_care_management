# MediFlow AI - Smart Healthcare Queue & Operations Platform

This starter project uses:
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Database: Supabase PostgreSQL
- Real modules: signup/login and dynamic symptoms page
- Mock modules: admin/user dashboards, analytics, imaging queue, bed/resource management, pharmacy, notifications, telemedicine, etc.

## 1. Supabase setup
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Project Settings > API.
5. Copy Project URL and service_role key.

## 2. Backend setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
```

Update `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=any_long_random_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend setup
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open: http://localhost:5173

## Test flow
1. Signup as `user` and submit symptoms.
2. Signup as `admin` to see admin dashboard.
3. Symptoms come from Supabase table, not hardcoded in React.
4. Other features are mock UI and can be connected by teammates later.

## Suggested team split
- Member 1: Frontend + auth + symptom flow
- Member 2: AI queue prediction + emergency prioritization
- Member 3: bed/resource/pharmacy/notification modules
- Member 4: diagnostic imaging queue + analytics + report summarization
