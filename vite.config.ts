import { existsSync, openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resumePath = resolve(process.cwd(), 'public/assets/resume.pdf');
const resumeHeader = new Uint8Array(5);
let hasValidResumePdf = false;

if (existsSync(resumePath)) {
  const fileDescriptor = openSync(resumePath, 'r');
  try {
    hasValidResumePdf = readSync(fileDescriptor, resumeHeader, 0, resumeHeader.length, 0) === resumeHeader.length
      && resumeHeader[0] === 0x25
      && resumeHeader[1] === 0x50
      && resumeHeader[2] === 0x44
      && resumeHeader[3] === 0x46
      && resumeHeader[4] === 0x2d;
  } finally {
    closeSync(fileDescriptor);
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/Portfolyo/',
  define: {
    __RESUME_PDF_AVAILABLE__: JSON.stringify(hasValidResumePdf),
  },
});
