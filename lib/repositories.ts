import type { Locale } from "./translations";
import { githubProfile, githubUser } from "./profile";

type GitHubRepository = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
};

export const githubRefreshSeconds = 900;

type FeaturedRepository = GitHubRepository & { cs: string; de: string };

const featuredRepos: FeaturedRepository[] = [
  {
    name: "VincentBOT",
    html_url: `${githubProfile}/VincentBOT`,
    description: "A personality-driven Discord bot with semantic memory and a local control room.",
    cs: "Bot pro Discord s vlastní osobností. Má sémantickou paměť a ovládací panel, který běží lokálně.",
    de: "Ein Discord-Bot mit eigener Persönlichkeit, semantischem Gedächtnis und lokalem Dashboard.",
    stargazers_count: 1,
  },
  {
    name: "keylight",
    html_url: `${githubProfile}/keylight`,
    description: "A Flutter piano practice app with live chord identification, an interactive circle of fifths, and a multitrack audio and MIDI looper.",
    cs: "Appka na cvičení u klavíru napsaná ve Flutteru. Při hraní pozná akordy. Má taky interaktivní kvintový kruh a vícestopý looper pro audio i MIDI.",
    de: "Eine Flutter-App zum Klavierüben mit Live-Akkorderkennung, interaktivem Quintenzirkel und Mehrspur-Looper für Audio und MIDI.",
    stargazers_count: 0,
  },
  {
    name: "banditos-barber-shop",
    html_url: `${githubProfile}/banditos-barber-shop`,
    description: "A photo-led redesign for Banditos Barber Shop in Vrchlabí, built with Next.js, TypeScript and GSAP.",
    cs: "Redesign webu pro Banditos Barber Shop ve Vrchlabí. Hlavní slovo mají fotky, pod kapotou běží Next.js, TypeScript a GSAP.",
    de: "Ein neuer Webauftritt für den Banditos Barber Shop in Vrchlabí mit großen Fotos, umgesetzt mit Next.js, TypeScript und GSAP.",
    stargazers_count: 0,
  },
  {
    name: "franz-ferdinand-fanzine",
    html_url: `${githubProfile}/franz-ferdinand-fanzine`,
    description: "A neo-brutalist Franz Ferdinand fanzine built with Next.js and GSAP.",
    cs: "Neobrutalistický fanzin o kapele Franz Ferdinand vytvořený pomocí Next.js a GSAP.",
    de: "Ein neobrutalistisches Fanzine über die Band Franz Ferdinand, umgesetzt mit Next.js und GSAP.",
    stargazers_count: 0,
  },
];

export async function getRepositories(locale: Locale) {
  function localize(repo: GitHubRepository): GitHubRepository {
    if (locale === "en") return repo;
    const featured = featuredRepos.find(item => item.name === repo.name && item.description === repo.description);
    return featured ? { ...repo, description: featured[locale] } : repo;
  }

  const query = new URLSearchParams({ type: "owner", sort: "pushed", direction: "desc", per_page: "4" });
  const headers = new Headers({ Accept: "application/vnd.github+json" });
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(`https://api.github.com/users/${githubUser}/repos?${query}`, {
      headers,
      next: { revalidate: githubRefreshSeconds },
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

    const repositories: GitHubRepository[] = await response.json();
    return { repositories: repositories.map(localize), live: true };
  } catch {
    return { repositories: featuredRepos.map(localize), live: false };
  }
}
