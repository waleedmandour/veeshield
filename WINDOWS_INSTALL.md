# VeeShield Windows Installation Guide

## Prerequisites

1. **Install Node.js** (if not installed)
   - Download from: https://nodejs.org/
   - Choose LTS version (20.x or higher)
   - This includes npm automatically

2. **Verify installation** (open Command Prompt or PowerShell):
   ```cmd
   node --version
   npm --version
   ```

---

## Quick Start

Open Command Prompt or PowerShell and run:

```cmd
# Navigate to your projects folder
cd %USERPROFILE%\Documents

# Clone the repository
git clone https://github.com/waleedmandour/veeshield.git

# Enter the project folder
cd veeshield

# Install dependencies
npm install

# Run development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Build Desktop App (.exe)

```cmd
# Build the Next.js app first
npm run build

# Install Electron (if needed)
npm install electron electron-builder --save-dev

# Build Windows installer
npm run electron:build
```

The installer will be in the `dist\` folder.

---

## Common Issues

### Issue: "npm not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "git not recognized"
**Solution:** Install Git from https://git-scm.com/download/win

### Issue: Port 3000 in use
**Solution:** 
```cmd
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
set PORT=3001 && npm run dev
```

### Issue: Module not found
**Solution:**
```cmd
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

---

## Alternative: Download ZIP

If git doesn't work:

1. Go to https://github.com/waleedmandour/veeshield
2. Click **Code** → **Download ZIP**
3. Extract the ZIP file
4. Open Command Prompt in the extracted folder
5. Run:
   ```cmd
   npm install
   npm run dev
   ```
