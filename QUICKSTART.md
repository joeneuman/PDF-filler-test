# Quick Start Guide

Get the PDF Form Filler up and running in minutes.

## Prerequisites

- **Node.js 18+** and npm (or yarn/pnpm)
- **TypeScript 5+** (installed automatically)

## Step 1: Install Dependencies

From the project root:

```bash
# Install root workspace dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Start Development Servers

From the project root:

```bash
# Start both server and client concurrently
npm run dev
```

This will start:
- **Backend server** on `http://localhost:3001`
- **Frontend app** on `http://localhost:5173`

Alternatively, run them separately:

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

## Step 3: Test the Application

1. Open your browser to `http://localhost:5173`
2. Upload a PDF with AcroForm fields
3. Edit field labels, required flags, and defaults in the builder
4. Copy the share link and test the form filler page
5. Fill the form and download the filled PDF

## Creating Test PDFs

You need a PDF with AcroForm fields to test. Here are some options:

### Option 1: Use Adobe Acrobat
1. Create a new PDF form
2. Add text fields, checkboxes, radio buttons, etc.
3. Save the PDF

### Option 2: Use LibreOffice
1. Create a document with form controls
2. Export to PDF (File → Export as PDF → Enable "Create PDF Form")
3. Save the PDF

### Option 3: Use Online Tools
- PDFescape
- JotForm PDF Editor
- Other online PDF form creators

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**Backend:**
```bash
PORT=3002 npm run dev:server
```

**Frontend:**
Edit `client/vite.config.ts` and change the port.

### Storage Directory Issues

The storage directory is created automatically. If you encounter permission errors:

```bash
mkdir -p server/storage/pdfs server/storage/schemas
chmod 755 server/storage
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Reinstall dependencies
rm -rf node_modules server/node_modules client/node_modules
npm install
cd server && npm install
cd ../client && npm install
```

### CORS Errors

If you see CORS errors, ensure:
- Backend is running on port 3001
- Frontend is running on port 5173
- `FRONTEND_ORIGIN` environment variable matches your frontend URL

## Environment Variables

Create a `.env` file in the `server/` directory (optional):

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
STORAGE_DIR=./storage
NODE_ENV=development
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check the API endpoints in `server/src/routes.ts`
- Explore the frontend components in `client/src/`

## Production Build

When ready to deploy:

```bash
# Build everything
npm run build

# Start production server
cd server
npm start
```

The client build will be in `client/dist/` - serve it with a static file server.

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review error messages in the browser console and server logs
- Ensure your PDF has AcroForm fields (not just text/images)

