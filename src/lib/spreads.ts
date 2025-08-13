export function getSpreadLabels(count: number, t: (k: string) => string): string[] {
  if (count === 1) return [t('spread.daily')];
  // 기본 8포지션 매핑(i18n 키 사용)
  const labels: string[] = [];
  for (let i = 1; i <= count; i++) {
    labels.push(t(`position.${i}`));
  }
  return labels;
}


