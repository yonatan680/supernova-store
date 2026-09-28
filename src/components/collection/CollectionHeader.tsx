import Link from "next/link";

export function CollectionHeader({ eyebrow, title, description, crumbs }: { eyebrow: string; title: string; description?: string; crumbs?: { href: string; label: string }[] }) {
  return (
    <header className="page-head container">
      {crumbs && (
        <nav className="breadcrumbs breadcrumbs--flush" aria-label="פירורי לחם">
          <ol>
            {crumbs.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{c.label}</Link>
              </li>
            ))}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-head__title">{title}</h1>
      {description && <p className="page-head__desc">{description}</p>}
    </header>
  );
}
