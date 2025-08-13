import { NextRequest } from "next/server";
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  searchParams.get("id");
  const name = searchParams.get("name");

  // 목 데이터: id/name 일부에 대해 간단한 텍스트 반환
  const db: Record<string, { keywords: string[]; upright: string; reversed?: string }> = {
    "The Fool": { keywords: ["새출발", "자유", "가능성"], upright: "새로운 여정의 시작과 열린 가능성.", reversed: "무모함, 준비 부족." },
    "The Magician": { keywords: ["의지", "실행력"], upright: "의지를 현실로 구현.", reversed: "속임수, 집중 부족." },
    "The High Priestess": { keywords: ["직관", "비밀"], upright: "내면의 지혜.", reversed: "직관 차단." },
    "The Lovers": { keywords: ["사랑", "조화"], upright: "깊은 결합과 조화.", reversed: "불일치와 혼란." },
    "Strength": { keywords: ["용기", "인내"], upright: "내적 힘과 인내.", reversed: "의심, 불안." },
    "The Tower": { keywords: ["변화", "붕괴"], upright: "급격한 변화로 재정립.", reversed: "변화 회피." },
    "King of Wands": { keywords: ["리더십", "비전"], upright: "주도권과 추진력.", reversed: "독선, 성급함." },
    "Page of Swords": { keywords: ["호기심", "기민함"], upright: "탐구와 기민한 대응.", reversed: "조급함, 경솔." },
    "Ten of Cups": { keywords: ["성취", "가족"], upright: "정서적 충만.", reversed: "불화, 기대 불일치." },
    "Ace of Wands": { keywords: ["열정", "시작"], upright: "강력한 시작.", reversed: "동력 부족." },
    "Ten of Pentacles": { keywords: ["유산", "안정"], upright: "장기적 안정.", reversed: "재정 불균형." },
  };

  const key = (name || "").trim();
  const found = key && db[key] ? db[key] : null;
  return Response.json({ meaning: found ?? null });
}


