"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type AB = "A"|"B"|"C";
type Order = [AB,AB,AB];

export default function GroupOrderPicker({ onChange }: { value: Order; onChange: (v: Order)=>void }){
  const { t } = useI18n();
  const base: AB[] = useMemo(()=> ["B","C","A"], []); // 현재, 미래, 과거 표시 순서
  const [placed, setPlaced] = useState<AB[]>([]);
  const dragStartRef = useRef<{x:number;y:number}|null>(null);
  // 터치 드래그 지원 (모바일 길게 눌러야 하는 문제 개선)
  const dragKeyRef = useRef<AB|null>(null);
  const imgFor: Record<AB, string> = { A: "/card-a.png", B: "/card-b.png", C: "/card-c.png" };
  const [pulseKey, setPulseKey] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    try {
      const touch = typeof window !== "undefined" && (
        "ontouchstart" in window ||
        (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
      setIsTouch(Boolean(touch));
    } catch { setIsTouch(false); }
  }, []);

  // desktop handlers removed

  return (
    <div className="space-y-3">
      {/* Unified stack UX for all breakpoints */}
      <div className="select-none space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {base.filter(k=> !placed.includes(k)).map((k)=> (
            <div
              key={`m-src-${k}`}
              className="stack-src"
              draggable={!isTouch}
              onDragStart={!isTouch ? ((e)=>{ e.dataTransfer.setData('text/x-card', k); e.dataTransfer.effectAllowed='move'; dragStartRef.current = { x: e.clientX, y: e.clientY }; }) : undefined}
              onTouchStart={isTouch ? (()=>{ dragKeyRef.current = k; }) : undefined}
              onTouchMove={isTouch ? ((e)=>{
                if (e.cancelable) e.preventDefault();
                const t = e.touches[0];
                const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
                if (el && el.closest('.stack-target')) {
                  // highlight target when hovering
                  (el.closest('.stack-target') as HTMLElement).classList.add('space-target-pulse');
                }
              }) : undefined}
              onTouchEnd={isTouch ? ((e)=>{
                const k2 = dragKeyRef.current; dragKeyRef.current = null;
                const t = e.changedTouches[0];
                const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
                if (k2 && el && el.closest('.stack-target')) {
                  const next = [...placed];
                  const existed = next.indexOf(k2);
                  if (existed>=0) next.splice(existed,1);
                  next.push(k2);
                  setPlaced(next);
                  const newOrder: AB[] = [...next, ...base.filter(b=> !next.includes(b))].slice(0,3) as AB[];
                  onChange(newOrder as Order);
                  setPulsing(true); setPulseKey(v=>v+1); setTimeout(()=> setPulsing(false), 420);
                }
                document.querySelector('.stack-target')?.classList.remove('space-target-pulse');
              }) : undefined}
              title={t(`group.${k}.label`)}
              style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none' }}
            >
              <div className="stack-card-img" style={{ backgroundImage: `url(${imgFor[k]})` }} />
              <div className="stack-card-badge">{t(`group.${k}.label`)}</div>
            </div>
          ))}
        </div>
        <div className={`stack-target ${pulsing ? 'space-target-pulse' : ''}`}
             onDragOver={(e)=>{ e.preventDefault(); }}
             onDrop={(e)=>{
          e.preventDefault();
          // no animation; rect is unused
          const key = (e.dataTransfer.getData('text/x-card')||'A') as AB;
          const next = [...placed];
          const existed = next.indexOf(key);
          if (existed>=0) next.splice(existed,1);
          next.push(key);
          // animation/position calculation removed for instant drop
          // update state & emit order (placed + 남은 순서)
          setPlaced(next);
          const newOrder: AB[] = [...next, ...base.filter(b=> !next.includes(b))].slice(0,3) as AB[];
          onChange(newOrder as Order);
          // mystic pulse + burst
          setPulsing(true);
          setPulseKey((v)=> v+1);
          setTimeout(()=> setPulsing(false), 420);
        }}
             onTouchMove={isTouch ? ((e)=>{ if (e.cancelable) e.preventDefault(); }) : undefined}
             style={{ touchAction: 'none' }}
        >
          <div className="stack-target-actions">
            <button type="button" className="btn-outline btn-reset" onClick={()=>{ setPlaced([]); onChange(["B","C","A"] as Order); }}>{t('picker.reset')}</button>
          </div>
          {/* burst sparkle */}
          <div key={pulseKey} className="space-burst" />
          <div className="stack-wrap" style={{ width: `${Math.min(320, 96 + Math.max(0, placed.length - 1) * 22)}px` }}>
            {placed.length===0 && (
              <div className="stack-empty-hint">{t('picker.dropHint')}</div>
            )}
            {[0,1,2].map((i)=> (
              <div key={`ph-${i}`} className="stack-ghost" style={{ left: `${i*22}px` }} />
            ))}
            {placed.map((k,i)=> (
              <div key={`m-st-${k}`} className="stack-layer" style={{ left: `${i*22}px`, zIndex: i+1 }}>
                <div className="stack-card-img" style={{ backgroundImage: `url(${imgFor[k]})` }} />
                <div className="stack-num top-left">{t(`group.${k}.label`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* footer helper removed per request */}
    </div>
  );
}


