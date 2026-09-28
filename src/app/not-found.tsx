import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container empty-state empty-state--page">
      <p className="eyebrow">404</p>
      <h1 className="empty-state__title">העמוד לא נמצא</h1>
      <p>ייתכן שהקישור שגוי או שהמוצר כבר לא זמין.</p>
      <Link href="/shop" className="btn btn--primary">
        לחנות
      </Link>
    </div>
  );
}
