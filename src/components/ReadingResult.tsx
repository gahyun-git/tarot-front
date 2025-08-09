import type { ReadingResponse } from "@/lib/api";
import Modal from "@/components/Modal";
import { useState } from "react";

const labels: Record<number, string> = {
  1: "이슈",
  2: "숨은 영향",
  3: "과거",
  4: "현재",
  5: "근미래",
  6: "내면",
  7: "외부",
  8: "솔루션",
};

export default function ReadingResult({ data }: { data: ReadingResponse }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(data.items[0]);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Result</h2>
      {/* 스프레드 배치: 
            1 2       8(솔루션)
            3 4 5
            6 7
       */}
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          {data.items.filter(i=>[1,2].includes(i.position)).map((it)=> (
            <Card key={it.position} {...it} onClick={()=>{ setFocus(it); setOpen(true); }} />
          ))}
          <div></div>
          <div className="justify-self-end"><Card {...data.items.find(i=>i.position===8)!} onClick={()=>{ setFocus(data.items.find(i=>i.position===8)!); setOpen(true); }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {data.items.filter(i=>[3,4,5].includes(i.position)).map((it)=> (
            <Card key={it.position} {...it} onClick={()=>{ setFocus(it); setOpen(true); }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.items.filter(i=>[6,7].includes(i.position)).map((it)=> (
            <Card key={it.position} {...it} onClick={()=>{ setFocus(it); setOpen(true); }} />
          ))}
        </div>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)}>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">#{focus.position} {labels[focus.position]}</div>
          <div className="text-lg font-semibold">{focus.card.name} {focus.is_reversed ? "(Reversed)" : ""}</div>
          {focus.card.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={focus.card.image_url} alt={focus.card.name} className={`w-full ${focus.is_reversed ? "rotate-180" : ""}`} />
          )}
        </div>
      </Modal>
    </section>
  );
}

function Card(props: { position: number; is_reversed: boolean; card: { name: string; image_url?: string | null }; onClick?: ()=>void }) {
  return (
    <button onClick={props.onClick} className="text-left border rounded p-2 hover:shadow focus:shadow">
      <div className="text-sm text-gray-500">#{props.position} {props.is_reversed ? "(Reversed)" : ""}</div>
      <div className="font-medium">{props.card.name}</div>
      {props.card.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={props.card.image_url} alt={props.card.name} className={`mt-2 w-full ${props.is_reversed ? "rotate-180" : ""}`} />
      )}
    </button>
  );
}
