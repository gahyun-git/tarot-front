# Deploy (Cloudflare Pages)

## Environment Variables (Production/Preview)

Add the following to Pages project settings → Environment variables:

```
TAROT_API_BASE_URL=https://tarot-api-r89b.onrender.com
# Choose one auth mode
# TAROT_API_KEY=...            # API Key mode (simple)
# or
# TAROT_HMAC_SECRET=...        # HMAC mode (recommended)
TAROT_CLIENT_ID=web-app
```

## Custom Domain

```
Frontend (Pages): www.go4it.site
Backend (Render): api.go4it.site (CNAME → <render-subdomain>.onrender.com)
```

Update next.config.ts images.remotePatterns when switching to api.go4it.site and redeploy.

# tarot-front

## 환경변수
- `.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8008
```

## 로컬 개발
```
npm ci
npm run dev
```

## Cloudflare Pages 배포
- 저장소 Secrets 설정:
  - `CF_API_TOKEN`: Pages 배포 권한 토큰
  - `CF_ACCOUNT_ID`: Cloudflare Account ID
  - `NEXT_PUBLIC_API_BASE_URL`: 프로덕션 API URL(Render 등)
- GitHub Actions 워크플로우: `.github/workflows/pages.yml`
- 기본 빌드 명령: `npm run build`
- 프로젝트명: `tarot-front`
