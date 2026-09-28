"use client";

import { useRef } from "react";
import { PLACEHOLDER } from "@/data/site";
import { SIZE_SCALES } from "@/lib/product";
import type { SizeScale } from "@/lib/types";
import { CloseIcon, RulerIcon } from "../Icons";

export function SizeGuide({ scale }: { scale: Exclude<SizeScale, null> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const sizes = SIZE_SCALES[scale];

  return (
    <>
      <button type="button" className="btn btn--link size-guide__trigger" onClick={() => ref.current?.showModal()}>
        <RulerIcon width={18} height={18} /> מדריך מידות
      </button>
      <dialog
        ref={ref}
        className="dialog"
        aria-labelledby="size-guide-title"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="dialog__inner">
          <div className="dialog__head">
            <h2 id="size-guide-title">מדריך מידות</h2>
            <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="סגירה">
              <CloseIcon />
            </button>
          </div>
          <p className="ph-block">{PLACEHOLDER.sizing}</p>
          <p className="dialog__note">
            SUPERNOVA לא פרסמה טבלת מידות. הטבלה הבאה היא מבנה בלבד — יש להשלים מידות אמיתיות מהמותג. לשאלות על מידה ספציפית — שלחו הודעה פרטית.
          </p>
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">מידה</th>
                <th scope="col">{scale === "shoe" ? "אורך כף רגל (ס״מ)" : "רוחב חזה (ס״מ)"}</th>
                <th scope="col">{scale === "shoe" ? "US" : "אורך (ס״מ)"}</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  <td className="ph">[—]</td>
                  <td className="ph">[—]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  );
}
