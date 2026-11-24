import { profileLinks, githubUser } from "@/lib/profile";
import { localizedPath, type PagePath } from "@/lib/routes";
import { absoluteUrl, seoCopy, siteName } from "@/lib/seo";
import { translations, type Locale } from "@/lib/translations";

type Project = { name: string; html_url: string; description: string | null };

export function PageSchema({ locale, page, projects = [] }: { locale: Locale; page: PagePath; projects?: Project[] }) {
  const { title, description } = seoCopy[locale][page];
  const url = absoluteUrl(localizedPath(locale, page));
  const home = absoluteUrl(localizedPath(locale, "/"));
  const websiteId = absoluteUrl("/#website");
  const personId = absoluteUrl("/en/about#hman");
  const pageId = `${url}#page`;

  const graph: object[] = [{
    "@type": "WebSite",
    "@id": websiteId,
    url: absoluteUrl("/"),
    name: siteName,
    inLanguage: ["en", "cs", "de"],
    publisher: { "@id": personId },
  }, {
    "@type": "Person",
    "@id": personId,
    name: siteName,
    alternateName: githubUser,
    url: absoluteUrl("/en/about"),
    sameAs: Object.values(profileLinks),
  }];

  const pageData = { "@id": pageId, url, name: title, description, inLanguage: locale, isPartOf: { "@id": websiteId } };
  if (page === "/") {
    graph.push({ "@type": "WebPage", ...pageData, about: { "@id": personId } });
  } else {
    const breadcrumbId = `${url}#breadcrumb`;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: siteName, item: home },
        { "@type": "ListItem", position: 2, name: translations[locale][page.slice(1) as "about" | "contact" | "projects"].title, item: url },
      ],
    });
    const breadcrumb = { "@id": breadcrumbId };
    if (page === "/about") {
      graph.push({ "@type": "ProfilePage", ...pageData, breadcrumb, mainEntity: { "@id": personId } });
    } else if (page === "/contact") {
      graph.push({ "@type": "ContactPage", ...pageData, breadcrumb, about: { "@id": personId } });
    } else {
      graph.push({
        "@type": "CollectionPage", ...pageData, breadcrumb,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "SoftwareSourceCode",
              name: project.name,
              codeRepository: project.html_url,
              url: project.html_url,
              description: project.description ?? undefined,
            },
          })),
        },
      });
    }
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
