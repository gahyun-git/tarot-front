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
