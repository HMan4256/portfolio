import { PageSchema } from "@/components/page-schema";
import { pageMetadata } from "@/lib/seo";
import { DecodeText } from "@/components/decode-text";
import { getCopy, getLocale } from "@/lib/locale";
import type { Metadata } from "next";
import { InnerScreen } from "@/components/inner-screen";
import { PixelIcon } from "@/components/pixel-icon";
import { githubProfile, githubUser } from "@/lib/profile";
import { getRepositories } from "@/lib/repositories";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "/projects");
}
export default async function ProjectsPage() {
  const locale = await getLocale();
  const { projects } = await getCopy();
  const { repositories, live } = await getRepositories(locale);
  const plurals = new Intl.PluralRules(locale);
  function starCount(count: number) {
    const form = plurals.select(count);
    const label = projects.stars[form === "one" || form === "few" ? form : "other"];
    return `${count.toLocaleString(locale)} ${label}`;
  }

  return (
    <InnerScreen
      title={<DecodeText text={projects.heading} />}
      footer={<a href={`${githubProfile}?tab=repositories`} target="_blank" rel="noreferrer"><DecodeText text={projects.footer} /></a>}
    >
      <PageSchema locale={locale} page="/projects" projects={repositories} />
      <div className="projects-content">
        <p className="projects-intro" data-enter><DecodeText text={projects.intro} /></p>
        {repositories.length > 0 ? (
          <>
            <a className="repo-owner" href={githubProfile} target="_blank" rel="noreferrer" data-enter>
              <PixelIcon name="github" /> {githubUser}
            </a>
            <ul className="repo-list">
              {repositories.map((repo) => (
                <li key={repo.html_url} data-enter>
                  <a className="repo-row" href={repo.html_url} target="_blank" rel="noreferrer">
                    <h2>{repo.name}</h2>
                    <p><DecodeText text={repo.description ?? ""} /></p>
                    <span className="repo-stars"><DecodeText text={starCount(repo.stargazers_count)} /></span>
                    <PixelIcon name="external" className="repo-open" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="project-status"><DecodeText text={projects.empty} /></p>
        )}
        {!live && (
          <p className="project-status"><DecodeText text={projects.offline} /></p>
        )}
      </div>
    </InnerScreen>
  );
}
