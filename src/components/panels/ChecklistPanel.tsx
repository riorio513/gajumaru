"use client";

import { useState } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import { CHECKLIST_CATEGORIES } from "@/lib/checklistData";

type ChecklistState = Record<string, boolean>;

export default function ChecklistPanel({ userId }: { userId: string | null }) {
  const [state, setState] = useSyncedRecord<ChecklistState>(
    userId,
    "checklist_state",
    "gajumaru:checklist:v1",
    {}
  );
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  function taskId(catKey: string, idx: number) {
    return `${catKey}_${idx}`;
  }

  function toggleTask(id: string, checked: boolean) {
    setState({ ...state, [id]: checked });
  }

  function toggleCat(key: string) {
    setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const total = CHECKLIST_CATEGORIES.reduce((s, c) => s + c.tasks.length, 0);
  const done = Object.values(state).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const circumference = 169.6;
  const offset = circumference - (circumference * pct) / 100;

  return (
    <>
      <div className="card">
        <div className="progress-wrap">
          <div className="progress-ring">
            <svg width="64" height="64">
              <circle cx="32" cy="32" r="27" stroke="#e2ede4" strokeWidth="7" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="27"
                stroke="#6ea87e"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="pct">{pct}%</div>
          </div>
          <div className="progress-text">
            今の進み具合
            <br />
            <b>{done}</b> / {total} 個 終わってるよ
          </div>
        </div>
      </div>

      {CHECKLIST_CATEGORIES.map((cat) => {
        const catDone = cat.tasks.filter((_, i) => state[taskId(cat.key, i)]).length;
        const open = !!openCats[cat.key];
        return (
          <div key={cat.key} className={`cat${open ? " open" : ""}`}>
            <div className="cat-head" onClick={() => toggleCat(cat.key)}>
              <span className="title">
                <span className="arrow">▶</span>
                {cat.title}
              </span>
              <span className="badge">
                {catDone}/{cat.tasks.length}
              </span>
            </div>
            <div className="cat-body">
              {cat.tasks.map((task, i) => {
                const id = taskId(cat.key, i);
                const isDone = !!state[id];
                return (
                  <div className={`task${isDone ? " done" : ""}`} key={id}>
                    <input
                      type="checkbox"
                      id={`chk_${id}`}
                      checked={isDone}
                      onChange={(e) => toggleTask(id, e.target.checked)}
                    />
                    <label htmlFor={`chk_${id}`}>
                      <span className="t">{task.t}</span>
                      {task.note && <span className="note">{task.note}</span>}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
