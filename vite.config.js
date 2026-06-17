import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Serves the boarding-pass PDFs from the project root under clean URLs
const boardingPassPlugin = {
  name: 'serve-boarding-passes',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const urlMap = {
        '/boarding-inbar.pdf': '4601600-SARUSI INBAR MS.pdf',
        '/boarding-oz.pdf':    '4601600-BASHARI OZ MR.pdf',
      };
      const localFile = urlMap[req.url?.split('?')[0]];
      if (localFile) {
        const filePath = path.join(process.cwd(), localFile);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${localFile}"`);
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
      next();
    });
  }
};

export default defineConfig({
  plugins: [react(), boardingPassPlugin],
})
