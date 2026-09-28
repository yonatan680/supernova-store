import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { PLACEHOLDER, site } from "@/data/site";
import { InstagramIcon, SendIcon } from "../Icons";
import { Logo } from "../Logo";
import { Newsletter } from "./Newsletter";

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav className="footer__col" aria-label={title}>
      <h2 className="footer__heading">{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Logo variant="badge" />
          <p className="footer__tagline">{site.bio.promise}</p>
          <div className="footer__social">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <InstagramIcon /> {site.instagram.at}
            </a>
            <a href={site.instagram.dm} target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <SendIcon /> {site.bio.ordering}
            </a>
          </div>
        </div>
        <Column title="חנות" links={footerNav.shop} />
        <Column title="קולקציות" links={footerNav.collections} />
        <nav className="footer__col" aria-label="שירות לקוחות">
          <h2 className="footer__heading">שירות</h2>
          <ul>
            {[...footerNav.help, ...footerNav.legal].map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer__col footer__col--wide">
          <Newsletter />
          <address className="footer__contact">
            <span>אימייל: <span className="ph">{PLACEHOLDER.email}</span></span>
            <span>טלפון: <span className="ph">{PLACEHOLDER.phone}</span></span>
          </address>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.</p>
        <p className="footer__pay">
          תשלום: <span className="ph">{PLACEHOLDER.payments}</span>
        </p>
      </div>
    </footer>
  );
}
