# Frame Image Middleware

A middleware service that intercepts and modifies Farcaster Frame images by adding custom metadata overlays. This service supports multiple aspect ratios (1:1 and 1.91:1) and handles image compression to meet Farcaster's size requirements.

## Features

- Intercepts Frame image requests and adds custom overlays
- Supports multiple aspect ratios (1:1 and 1.91:1)
- Automatic image compression to meet Farcaster's 256KB limit
- Custom metadata overlay with title and description
- Profile image integration
- Preview HTML generation for testing

## How It Works

1. **Request Interception**: The service intercepts requests to Frame images through an Express server.

2. **Frame Data Processing**: 
   - Processes Farcaster Frame data including FID, message hash, and timestamps
   - Integrates with Pinata for Frame interactions

3. **Image Generation**:
   - Uses Satori to generate custom image overlays
   - Supports dynamic text placement and image sizing
   - Handles multiple aspect ratios (1:1 and 1.91:1)
   - Automatically compresses images to meet size requirements

4. **HTML Modification**:
   - Parses incoming HTML using JSDOM
   - Modifies Frame image meta tags
   - Generates preview HTML for testing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Warpads-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with required environment variables:
```env
PORT=3005
PINATA_API_KEY=your_pinata_api_key
MBD_API_KEY=your_mbd_api_key
```

## Running the Service

### Development Mode

```bash
npm run dev
```

This will start the service with hot-reloading using nodemon.

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Main Endpoint

- `GET *` - Intercepts all GET requests and processes Frame images

### Health Check

- `GET /check` - Returns "Hello CASTS" to verify service is running

## Configuration

### Image Dimensions

The service supports two aspect ratios:

1. **1.91:1 (Default Farcaster Frame)**
   - Width: 1200px
   - Height: 630px
   - Add Size: 120px
   - Bottom Height: 150px
   - Font Size: 32px

2. **1:1 (Square)**
   - Width: 600px
   - Height: 600px

### Image Compression

The service automatically compresses images to meet Farcaster's 256KB limit while maintaining quality:

1. Initial compression with high quality settings
2. Progressive compression if size still exceeds limit
3. Maintains aspect ratio and dimensions during compression

## Testing

1. Start the service
2. Access the preview HTML at `src/preview.html`
3. Check the original HTML at `src/original.html`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, please open an issue in the repository or contact the maintainers.
