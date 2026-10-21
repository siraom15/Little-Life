# Deploy ThaiLife to Cloudflare

เกมนี้ใช้ static export: บันทึกเกมอยู่ในเบราว์เซอร์ และแชร์ด้วย URL จึงไม่ต้องใช้ OpenNext หรือ server adapter

## GitHub + Workers Builds (ใช้ npx wrangler deploy)

ตั้งค่าบน Cloudflare:

- Root directory: โฟลเดอร์ที่มี package.json และ wrangler.jsonc (ถ้าอยู่ราก repository ให้เว้นว่าง)
- Build command: npm run build:cloudflare
- Deploy command: npx wrangler deploy
- Node.js: 24 (กำหนดไว้ใน .node-version)
- ชื่อ Worker ต้องตรงกับ name ใน wrangler.jsonc ซึ่งตั้งต้นเป็น little-life; หากสร้างชื่ออื่นไว้ ให้แก้ name ให้ตรงก่อน push

Commit และ push ไฟล์ตั้งค่า, scripts/build-cloudflare.mjs, package.json และ pnpm-lock.yaml ขึ้น branch ที่ Cloudflare ติดตาม แล้ว retry deployment
ไม่ต้อง commit out หรือ node_modules

ต้องตั้ง Build command ใน dashboard ด้วย เพราะ Workers Builds ไม่ใช้ custom build ใน wrangler config เป็นขั้น build ของระบบ CI
คำสั่ง deploy ที่รันบนเครื่องจะ build ผ่าน wrangler config ให้อัตโนมัติ

## ทดสอบบนเครื่อง

ติดตั้ง dependencies ด้วย pnpm install --frozen-lockfile แล้วรัน npm run deploy:check เพื่อ build และตรวจการ deploy โดยไม่เผยแพร่
เมื่อพร้อมเผยแพร่ ใช้ npx wrangler deploy (ต้อง login Cloudflare)

## ถ้าเป็น Cloudflare Pages Git integration จริง

Pages ใช้ Build command: npm run build:cloudflare และ Build output directory: out
เลือก framework preset None และตั้ง root directory ให้ตรงกับโฟลเดอร์ package.json
Pages จะเผยแพร่ผล build ให้อัตโนมัติ ไม่ต้องใส่ deploy command
npx wrangler deploy เป็นคำสั่ง Workers ไม่ใช่ Pages

## สาเหตุ error เดิม

Wrangler ไม่พบ config ที่ระบุการ deploy จึงพยายาม migrate Next.js ไป OpenNext และติดคำถามสร้าง next.config ใน CI
โปรเจกต์นี้มี next.config.mjs และ wrangler.jsonc ระบุ static assets ชัดเจนแล้ว ไม่ต้องรัน migrate
หากยังเห็นข้อความ OpenNext migrate หลัง push ให้ตรวจ branch และ root directory ว่ามีไฟล์สองตัวนี้จริง

## ข้อจำกัด

การเพิ่ม API routes, server actions หรือ SSR ในอนาคตต้องเปลี่ยนวิธี deploy ใหม่
เซฟอยู่เฉพาะเบราว์เซอร์/โดเมนเดิม การเปลี่ยนโดเมนจะไม่ย้าย localStorage ตามไปด้วย

เอกสาร: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
