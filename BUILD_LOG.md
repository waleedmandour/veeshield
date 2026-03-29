# VeeShield v1.0.0 Build Log

## Build Date: 2026-03-29

## Changes Made

### Architecture Migration
- Converted from API routes to client-side service layer for Electron static export compatibility
- Created `src/lib/services/scan-service.ts`, `clean-service.ts`, `assistant-service.ts`
- Configured Next.js for static export (`output: 'export'` in next.config.ts)
- Removed `/api/scan`, `/api/clean`, `/api/assistant` routes

### Bug Fixes
- Fixed `next build --webpack` invalid flag in package.json
- Fixed `RESPONSE_TEMPLATES.full_scan` type inconsistency in assistant/index.ts
- Fixed Tailwind CSS v4 syntax (`--spacing()`) in calendar.tsx and sidebar.tsx
- Fixed Electron main.js production URL (was pointing to non-existent `.next/server/app/page.html`)
- Fixed Electron navigation handler to allow `file://` protocol URLs
- Fixed icon.ico to meet electron-builder 256x256 minimum requirement
- Fixed package.json trailing comma causing JSON parse errors
- Fixed electron-builder `files` config to include `out/` instead of `.next/`

### New Features
- **QuarantinePanel**: Quarantine vault with bulk select, restore, and delete operations
- **NetworkPanel**: Real-time network activity monitor with traffic stats and firewall status
- **System tray**: Quick actions (Open, Quick Scan, Quit)
- **GitHub Actions CI/CD**: Automated Windows build and release workflow
- **App icon**: Created icon.ico and icon.png from veeshield-logo.png

### Electron Configuration
- System tray with context menu
- IPC handlers for file operations (read, delete, quarantine)
- Dialog handlers for file/folder selection
- System info retrieval
- Navigation security with allowed origins
- Production error fallback page

## Build Output
- Static export: `out/` directory (1.4MB)
- Electron targets: NSIS installer (.exe) + portable (.zip)
- GitHub Actions: Automated Windows build on tag push

## GitHub Release
- Tag: v1.0.0
- Release: https://github.com/waleedmandour/veeshield/releases/tag/v1.0.0
- Workflow: https://github.com/waleedmandour/veeshield/actions/workflows/release.yml
