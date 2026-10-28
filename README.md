# QR Code Generator with Large File Uploads

This project is a modern QR code generator web app (React + Vite frontend, PHP backend) that supports uploading large files (images, PDFs, videos up to 20MB) and generates a QR code that links to the uploaded file, just like commercial QR code services.

## Features
- Upload images, PDFs, or videos (up to 20MB)
- Files are uploaded to your server (Hostinger-ready PHP backend)
- QR code is generated for the public download URL
- Modern, responsive React frontend

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the React dev server:**
   ```bash
   npm run dev
   ```
   > Note: File uploads require a PHP server. For full upload testing, deploy to Hostinger or run a local PHP server in the `public/` directory.

## Building for Production

1. **Build the React app:**
   ```bash
   npm run build
   ```
   This outputs static files to the `dist/` directory.

## Deploying to Hostinger (or any PHP web host)

1. **Upload these files/folders to your web root:**
   - `dist/` (the built React app)
   - `public/upload.php` (the PHP upload handler)
   - `public/uploads/` (create this directory if it doesn't exist)

2. **Set permissions for uploads:**
   - Make sure the `uploads/` directory is writable by PHP. On Hostinger, this is usually automatic, but you can set permissions to 755 or 775 if needed.

3. **Access your app:**
   - Your site will be live at `https://yourdomain.com/`
   - The upload handler will be at `https://yourdomain.com/upload.php`
   - Uploaded files will be accessible at `https://yourdomain.com/uploads/filename.pdf` (or .jpg, .mp4, etc.)

## Security Notes
- Only images, PDFs, and videos are allowed (see `public/upload.php` for allowed types).
- Max file size is 20MB (configurable in `upload.php`).
- Uploaded files are given random names for privacy and security.

## Troubleshooting
- If uploads fail, check permissions on the `uploads/` directory.
- Make sure your PHP version is 7.2+.
- For CORS issues, ensure you are accessing the app from the same domain as the PHP backend.

## Credits
- React, Vite, Tailwind CSS
- PHP for backend file handling

---

For questions or help, contact your developer or open an issue. 