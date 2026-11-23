export const languages = { en: "English", cs: "Čeština", de: "Deutsch" } as const;
export type Locale = keyof typeof languages;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && Object.hasOwn(languages, value);
}

const en = {
  description: "HMan’s portfolio. Software, graphics, hardware, and other creative stuff.",
  language: "Language", back: "Back to home", pet: "Pet the cat", chess: "Chess easter egg, coming soon",
  home: {
    greeting: "heyy! my name’s", menu: "Main menu", select: "select", open: "open",
    about: ["", "Who", " tf are you?"],
    projects: ["Stfu and gimme your ", "projects", "."],
    contact: ["", "Let’s talk", " honey!"],
  },
  about: {
    title: "About", prefix: "I’m a", creator: "CREATOR", intro: "I can make:", footer: "also music and creative stuff",
    software: { title: "Software", items: ["websites", "Android apps", "iOS apps", "desktop apps", "automation", "web apps", "complex systems", "game dev"] },
    graphics: { title: "Graphics", items: ["UI/UX design", "logos", "posters", "advertising", "banners", "soc. media posts"] },
    hardware: { title: "Hardware", items: ["PCB design", "MCU programming", "CAD design"] },
  },
  projects: {
    title: "Projects", heading: "Some stuff I made...", footer: "give me a star plsss", empty: "No public repositories yet.",
    offline: "GitHub is unavailable. Showing featured projects.", stars: { one: "star", few: "stars", other: "stars" },
  },
  contact: {
    title: "Let’s talk", accent: "Let’s talk", rest: " honey!", intro: "Got something in mind?",
    footer: "see you around!", email: "Email me", github: "Find me on GitHub",
  },
};

const cs: typeof en = {
  description: "HManovo portfolio. Software, grafika, hardware a další věci, co mě baví tvořit.",
  language: "Jazyk", back: "Zpátky na hlavní menu", pet: "Pohladit kočku", chess: "Šachová minihra už brzy",
  home: {
    greeting: "čau, já jsem", menu: "Hlavní menu", select: "vybrat", open: "otevřít",
    about: ["A ty jsi ", "kdo", "?"],
    projects: ["Ukaž mi ty ", "projekty", "."],
    contact: ["", "Dáme řeč", "?"],
  },
  about: {
    title: "O mně", prefix: "Baví mě", creator: "TVOŘIT", intro: "Co všechno dělám?", footer: "a když zrovna nekódím, dělám hudbu",
    software: { title: "Software", items: ["weby", "appky pro Android", "appky pro iOS", "desktopové appky", "automatizace", "webové appky", "komplexní systémy", "vývoj her"] },
    graphics: { title: "Grafika", items: ["UI/UX design", "loga", "plakáty", "reklamy", "bannery", "příspěvky na sítě"] },
    hardware: { title: "Hardware", items: ["návrh PCB", "programování MCU", "CAD design"] },
  },
  projects: {
    title: "Projekty", heading: "Něco z mojí dílny…", footer: "hoď mi hvězdičku, prosííím", empty: "Zatím tu nejsou žádné veřejné repozitáře.",
    offline: "GitHub zrovna neodpovídá. Mrkni zatím na tyhle projekty.", stars: { one: "hvězdička", few: "hvězdičky", other: "hvězdiček" },
  },
  contact: {
    title: "Kontakt", accent: "Dáme řeč", rest: "?", intro: "Máš nápad? Sem s ním.",
    footer: "tak zatím!", email: "Napiš mi e-mail", github: "Můj GitHub",
  },
};

const de: typeof en = {
  description: "HMans Portfolio. Software, Grafik, Hardware und anderer kreativer Kram.",
  language: "Sprache", back: "Zurück zum Hauptmenü", pet: "Katze streicheln", chess: "Schach-Minispiel, bald spielbar",
  home: {
    greeting: "hey, ich bin", menu: "Hauptmenü", select: "wählen", open: "öffnen",
    about: ["", "Wer", " bist du denn?"],
    projects: ["Zeig mal deine ", "Projekte", "."],
    contact: ["", "Schreib mir", " mal!"],
  },
  about: {
    title: "Über mich", prefix: "Ich baue", creator: "DINGE", intro: "Was ich so mache:", footer: "und zwischendurch mach ich Musik",
    software: { title: "Software", items: ["Websites", "Android-Apps", "iOS-Apps", "Desktop-Apps", "Automatisierung", "Web-Apps", "komplexe Systeme", "Game Dev"] },
    graphics: { title: "Grafik", items: ["UI/UX-Design", "Logos", "Plakate", "Werbung", "Banner", "Social-Media-Posts"] },
    hardware: { title: "Hardware", items: ["PCB-Design", "MCU-Programmierung", "CAD-Design"] },
  },
  projects: {
    title: "Projekte", heading: "Ein paar meiner Projekte…", footer: "lass gern einen Stern da", empty: "Hier gibt’s noch keine öffentlichen Repos.",
    offline: "GitHub macht gerade Pause. Hier sind ein paar meiner Projekte.", stars: { one: "Stern", few: "Sterne", other: "Sterne" },
  },
  contact: {
    title: "Kontakt", accent: "Schreib mir", rest: " mal!", intro: "Hast du eine Idee? Immer her damit!",
    footer: "bis dann!", email: "Schreib mir eine Mail", github: "Mein GitHub-Profil",
  },
};

export const translations = { en, cs, de };
