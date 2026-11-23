import Image from "next/image";

const sprites = {
  cat: [118, 118],
  cursor: [24, 38],
  knight: [57, 71],
  home: [70, 74],
  avatar: [69, 69],
} as const;

type SpriteProps = {
  name: keyof typeof sprites;
  className?: string;
  priority?: boolean;
};

export function Sprite({ name, className, priority }: SpriteProps) {
  const [width, height] = sprites[name];

  return (
    <Image
      src={`/pixel/${name}.png`}
      alt=""
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : undefined}
      draggable={false}
      unoptimized
    />
  );
}
