import { PageSchema } from "@/components/page-schema";
import { pageMetadata } from "@/lib/seo";
import { DecodeText } from "@/components/decode-text";
import { getCopy, getLocale } from "@/lib/locale";
import type { Metadata } from "next";
import { InnerScreen } from "@/components/inner-screen";
import { PixelIcon } from "@/components/pixel-icon";
import { profileLinks, githubUser } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "/contact");
}
export default async function ContactPage() {
  const locale = await getLocale();
  const { contact } = await getCopy();

  const profiles = [
    { name: "Instagram", handle: "@h.pilot.fpv", href: profileLinks.instagram, icon: "camera" },
    { name: "Telegram", handle: "@hmandev", href: profileLinks.telegram, icon: "message" },
    { name: contact.github, handle: `@${githubUser}`, href: profileLinks.github, icon: "github" },
    { name: "Buy Me a Coffee", handle: "@hman", href: profileLinks.coffee, icon: "coffee" },
  ] as const;

  const email = process.env.CONTACT_EMAIL?.trim();

  return (
    <InnerScreen title={<><span className="accent"><DecodeText text={contact.accent} /></span><DecodeText text={contact.rest} /></>} footer={<DecodeText text={contact.footer} />}>
      <PageSchema locale={locale} page="/contact" />
      <div className="contact-content">
        <p className="contact-intro" data-enter><DecodeText text={contact.intro} /></p>
        <ul className="contact-links grid gap-5">
          {email && (
            <li data-enter>
              <a className="pixel-panel contact-link" href={`mailto:${email}`} data-motion="panel">
                <PixelIcon name="mail" className="contact-icon" />
                <span className="contact-label"><strong><DecodeText text={contact.email} /></strong><span>{email}</span></span>
                <PixelIcon name="external" className="contact-arrow" />
              </a>
            </li>
          )}
          {profiles.map(({ name, handle, href, icon }) => (
            <li key={href} data-enter>
              <a className="pixel-panel contact-link" href={href} target="_blank" rel="noreferrer" data-motion="panel">
                <PixelIcon name={icon} className="contact-icon" />
                <span className="contact-label"><strong><DecodeText text={name} /></strong><span>{handle}</span></span>
                <PixelIcon name="external" className="contact-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </InnerScreen>
  );
}
