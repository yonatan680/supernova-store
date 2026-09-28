import { faq } from "@/data/content";

export function FaqAccordion() {
  return (
    <div className="accordion accordion--lg">
      {faq.map((item) => (
        <details key={item.q} name="faq">
          <summary>{item.q}</summary>
          <div className="accordion__content">
            {item.known && <p>{item.known}</p>}
            {item.placeholder && <p className="ph-block">{item.placeholder}</p>}
          </div>
        </details>
      ))}
    </div>
  );
}
