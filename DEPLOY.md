# IoTHub Deployment Guide

## Environment
- Frontend: https://beebane25.github.io/iothub/
- Backend: (belum deploy)
- Database: https://nbungbznljbiddlwyvbd.supabase.co
- Payment: Midtrans (Sandbox)

## Quick Commands

### Deploy to Netlify:
```bash
cd "C:\Users\user\Documents\pribadi\web adsence"
netlify deploy --prod --dir=. --functions=netlify/functions
```

### Deploy to GitHub Pages:
```bash
cd "C:\Users\user\Documents\pribadi\web adsence"
git push origin main
```

### Run locally:
```bash
cd "C:\Users\user\Documents\pribadi\web adsence"
python server.py
# Buka http://localhost:8080
```

## Environment Variables (for Netlify)
```
SUPABASE_URL=https://nbungbznljbiddlwyvbd.supabase.co
SUPABASE_ANON_KEY=sb_publishable_XX4t1...
SUPABASE_SERVICE_KEY=sb_secret_Rr37jx2Ii5...
MIDTRANS_CLIENT_KEY=Mid-client-i8CzWdgvnoRMxqHH
MIDTRANS_SERVER_KEY=Mid-server-HCBkVMSxP...
```

## Database Tables
1. users - Data akun
2. sessions - Sesi login
3. views - Log viewing
4. subscribers - Newsletter
5. articles - Metadata artikel
6. payments - Riwayat pembayaran

## API Endpoints
- POST /api/auth (action: register|login)
- POST /api/subscribe
- POST /api/subscribe (Midtrans webhook)

## Testing Checklist
- [ ] Register akun baru
- [ ] Login dengan akun baru
- [ ] Buka artikel premium (blocked)
- [ ] Buka artikel gratis (email gate)
- [ ] Upgrade ke premium (pricing page)
- [ ] Bayar dengan Midtrans (sandbox)
- [ ] Cek data di Supabase
