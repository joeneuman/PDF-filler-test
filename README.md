# PDF Form Filler

A production-ready web application that lets users upload PDFs with AcroForm fields, automatically extracts form fields, renders a clean web form, captures user input, fills the original PDF, and returns a downloadable filled PDF. All uploaded PDFs and form schemas are persisted for later use.

## Features

- **PDF Upload & Field Extraction**: Automatically detects and extracts AcroForm fields from uploaded PDFs
- **Form Builder**: Edit field labels, required flags, default values, and reorder fields with drag-and-drop
- **Persistent Storage**: All PDFs and schemas are saved and can be accessed via stable links
- **Shareable Forms**: Generate shareable links (`/f/:pdfId`) for others to fill forms
- **Field Types Supported**: Text, textarea, checkbox, radio, dropdown, and date fields
- **Security**: File validation, rate limiting, CORS protection, and XSS prevention
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation support
- **Auto-save**: Schema changes are automatically saved with debouncing

## Tech Stack

### Backend
- Node.js with Express (TypeScript)
- pdf-lib for PDF manipulation
- Filesystem-based storage with JSON index
- Security: Helmet, CORS, rate limiting
- Validation: Zod

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- React Hook Form for form management
- @dnd-kit for drag-and-drop reordering

## Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### Prerequisites

- Node.js 18+ and npm
- TypeScript 5+

### Installation

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Development

```bash
# From root directory, run both server and client
npm run dev

# Or run separately:
npm run dev:server  # Backend on http://localhost:3001
npm run dev:client  # Frontend on http://localhost:5173
```

### Production Build

```bash
npm run build
```

## API Endpoints

### POST /api/upload
Upload a PDF and extract form fields.

**Request**: `multipart/form-data` with `pdf` file
**Response**: `{ pdfId, fields, meta }`

### GET /api/schema/:pdfId
Retrieve saved form schema.

**Response**: `{ pdfId, fields, meta }`

### PUT /api/schema/:pdfId
Update form schema (labels, required flags, defaults, order).

**Request**: `{ fields, meta? }`
**Response**: Updated schema

### POST /api/fill
Fill PDF with user values and return filled PDF.

**Request**: `{ pdfId, values, flatten? }`
**Response**: PDF file (binary)

### POST /api/clone/:pdfId
Clone a saved schema to a new pdfId.

**Response**: `{ pdfId, fields, meta }`

## Project Structure

```
.
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── routes.ts      # API routes
│   │   ├── pdfUtils.ts    # PDF utilities (isFieldRequired, humanize)
│   │   ├── pdfExtractor.ts # Field extraction and filling
│   │   ├── storage.ts     # Persistence layer
│   │   ├── validation.ts  # Zod schemas
│   │   ├── middleware.ts  # Security and upload middleware
│   │   └── types.ts       # TypeScript types
│   ├── storage/           # Persistent storage (created at runtime)
│   │   ├── pdfs/          # Uploaded PDF files
│   │   ├── schemas/       # Form schemas (JSON)
│   │   └── index.json     # Index of all PDFs
│   └── package.json
├── client/                # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── UploadPage.tsx
│   │   │   ├── BuilderPage.tsx
│   │   │   └── FillerPage.tsx
│   │   ├── components/    # Reusable components
│   │   │   ├── FieldEditor.tsx
│   │   │   └── FormRenderer.tsx
│   │   ├── api.ts         # API client
│   │   ├── types.ts       # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json
├── examples/              # Example PDFs for testing
└── README.md
```

## Environment Variables

### Server

- `PORT`: Server port (default: 3001)
- `FRONTEND_ORIGIN`: Allowed CORS origin (default: http://localhost:5173)
- `STORAGE_DIR`: Storage directory path (default: ./storage)
- `NODE_ENV`: Environment (development/production)

### Client

- `VITE_API_BASE`: API base URL (default: /api)

## Security Features

- **File Validation**: MIME type and magic bytes (%PDF-) validation
- **Size Limits**: 10 MB maximum file size
- **Rate Limiting**: 30 requests per minute per IP
- **CORS**: Restricted to frontend origin
- **Helmet**: Security headers enabled
- **XSS Prevention**: Input sanitization
- **PDF Safety**: Rejects PDFs with JavaScript or embedded files

## Error Handling

The API returns structured error responses:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": "Additional details (development only)"
}
```

Common error codes:
- `NO_ACROFORM`: PDF has no interactive form fields
- `XFA_UNSUPPORTED`: PDF uses XFA forms (not supported)
- `FILE_TOO_LARGE`: File exceeds 10 MB limit
- `INVALID_PDF`: File is not a valid PDF
- `UNSAFE_PDF`: PDF contains JavaScript or embedded files
- `NOT_FOUND`: PDF or schema not found
- `VALIDATION_ERROR`: Request validation failed

## Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## Deployment

### Server

1. Build the TypeScript code:
   ```bash
   cd server && npm run build
   ```

2. Set environment variables
3. Start the server:
   ```bash
   npm start
   ```

### Client

1. Build the React app:
   ```bash
   cd client && npm run build
   ```

2. Serve the `dist/` directory with a static file server (nginx, Apache, etc.)

### Docker (Optional)

You can containerize the application using Docker. Example Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Limitations

- **XFA Forms**: Not supported (returns error)
- **Non-AcroForm PDFs**: Returns error (no OCR/mapping)
- **File Size**: Maximum 10 MB per PDF
- **Storage**: Uses filesystem (consider database for production scale)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

