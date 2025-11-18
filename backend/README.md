# RescueMePets Backend

FastAPI backend for the RescueMePets application.

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Deployment to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL`: Your database URL (Render provides a PostgreSQL database)
   - `PYTHON_VERSION`: 3.11

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User login
- `GET /animals` - Get all animals
- `GET /centers` - Get all centers
- `POST /adopt` - Submit adoption request

## CORS

The API allows requests from:
- `https://rescue-me-pets-zga1.vercel.app` (Vercel deployment)
- `http://localhost:3000` (local development)
