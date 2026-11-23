import { getCopy } from "@/lib/locale";
import type { Metadata } from "next";
import { PixelIcon } from "@/components/pixel-icon";
import { RippleText } from "@/components/ripple-text";
import { InnerScreen } from "@/components/inner-screen";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getCopy()).about.title };
}

const categories = [
  { key: "software", effect: "decode", icon: "code" },
  { key: "graphics", effect: "ink", icon: "paint" },
  { key: "hardware", effect: "signal", icon: "hardware" },
] as const;

export default async function AboutPage() {
  const { about } = await getCopy();
  return (
    <InnerScreen title={<><RippleText text={about.prefix} /> <span className="accent"><RippleText text={about.creator} focusable /></span></>} footer={<RippleText text={about.footer} />}>
      <div className="about-content">
        <p className="about-intro" data-enter><RippleText text={about.intro} /></p>
        <div className="about-grid">
          {categories.map(({ key, effect, icon }) => (
            <section key={key} className="skill-group" aria-labelledby={effect} data-enter>
              <h2 id={effect}>
                <PixelIcon name={icon} />
                <RippleText text={about[key].title} effect={effect} focusable />
              </h2>
              <ul>
                {about[key].items.map((item, index) => <li key={index}><RippleText text={item} effect={effect} /></li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </InnerScreen>
  );
}
