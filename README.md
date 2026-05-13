# Kin_Tan

Kin_Tan is a Next.js app for pantry management and menu assistance from scanned receipts.

Main workflow:

1. User captures a receipt photo.
2. Image is uploaded to the server.
3. OCR extracts text.
4. AI analyzes products with OpenAI first, then falls back to OCR plus Google APIs.
5. Items are categorized and stored in pantry.
6. The app shows pantry status, expiry alerts, menu recommendations, and partner stores.

## Getting started

1. Install dependencies with yarn.
   - `yarn install`
2. Copy environment template.
   - `cp .env.example .env.local`
3. Fill API keys in `.env.local`.
4. Start development server.
   - `yarn dev`

### Other useful scripts

- Build
  - `yarn build`
- Start production server
  - `yarn start`
- Lint
  - `yarn lint`

## Environment variables

- `OPENAI_API_KEY`
- `GOOGLE_CLOUD_VISION_API_KEY` or your preferred Google OCR credentials
- `GOOGLE_API_KEY` for catalog/search integrations

## Project structure

- `app/` UI pages and API routes
- `app/components/` shared UI shell/navigation components
- `app/contexts/` shared React contexts
- `lib/` OCR, OpenAI, parser, and shared types
- `public/` static assets for products, recipes, and illustrations
- `docs/screenshots/` local debug screenshots (ignored from git)
