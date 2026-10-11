export const strings = {
  fr: {
    skip: "Aller au catalogue",
    "nav.catalog": "Catalogue",
    "nav.contact": "Contact",
    "nav.pdf": "Télécharger le PDF",
    "hero.tagline": "Le catalogue jouets 2026–2027",
    "hero.cta": "Voir le catalogue",
    "catalog.title": "Catalogue",
    "catalog.lede": "Parcourez nos jouets. Pour commander, écrivez-nous.",
    "catalog.all": "Tout",
    "catalog.count": "{n} articles",
    "catalog.empty": "Aucun article dans cette catégorie.",
    "contact.title": "Nous contacter",
    "contact.lede": "Pas de panier en ligne — écrivez-nous pour commander ou poser une question.",
    "contact.whatsapp": "WhatsApp",
    "contact.email": "E-mail",
    "detail.whatsapp": "Demander via WhatsApp",
    "detail.email": "Demander par e-mail",
    "detail.close": "Fermer",
    "footer.copy": "© HoballaH jouets — Catalogue 2026–2027",
    "inquire.whatsapp": "Bonjour, je suis intéressé(e) par « {name} » (n° {number}) du catalogue HoballaH jouets.",
    "inquire.emailSubject": "Demande — {name}",
    "inquire.emailBody": "Bonjour,\n\nJe souhaite des informations sur « {name} » (n° {number}) du catalogue HoballaH jouets.\n\nMerci.",
  },
  en: {
    skip: "Skip to catalogue",
    "nav.catalog": "Catalogue",
    "nav.contact": "Contact",
    "nav.pdf": "Download PDF",
    "hero.tagline": "The 2026–2027 toy catalogue",
    "hero.cta": "View catalogue",
    "catalog.title": "Catalogue",
    "catalog.lede": "Browse our toys. To order, get in touch.",
    "catalog.all": "All",
    "catalog.count": "{n} items",
    "catalog.empty": "No items in this category.",
    "contact.title": "Contact us",
    "contact.lede": "No online cart — message us to order or ask a question.",
    "contact.whatsapp": "WhatsApp",
    "contact.email": "Email",
    "detail.whatsapp": "Ask on WhatsApp",
    "detail.email": "Ask by email",
    "detail.close": "Close",
    "footer.copy": "© HoballaH jouets — 2026–2027 catalogue",
    "inquire.whatsapp": "Hello, I’m interested in “{name}” (no. {number}) from the HoballaH jouets catalogue.",
    "inquire.emailSubject": "Inquiry — {name}",
    "inquire.emailBody": "Hello,\n\nI’d like information about “{name}” (no. {number}) from the HoballaH jouets catalogue.\n\nThank you.",
  },
};

export function t(locale, key, vars = {}) {
  const table = strings[locale] || strings.fr;
  let value = table[key] ?? strings.fr[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    value = value.replaceAll(`{${k}}`, String(v));
  }
  return value;
}

export function applyStaticI18n(locale) {
  document.documentElement.lang = locale === "en" ? "en" : "fr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(locale, key);
  });
  const close = document.querySelector(".detail-close");
  if (close) close.setAttribute("aria-label", t(locale, "detail.close"));
}
