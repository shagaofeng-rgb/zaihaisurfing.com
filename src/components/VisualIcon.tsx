import '@/app/visual-icons.css';

export type VisualIconName =
  | 'battery' | 'charge' | 'chat' | 'engine' | 'fuel' | 'hull'
  | 'order' | 'package' | 'payment' | 'power' | 'shield' | 'size'
  | 'speed' | 'steering' | 'support' | 'time' | 'tools' | 'truck' | 'warning';

export default function VisualIcon({name, size = 22, className}: {
  name: VisualIconName;
  size?: number;
  className?: string;
}) {
  return <span
    aria-hidden="true"
    className={className ? `visual-icon ${className}` : 'visual-icon'}
    style={{width: size, height: size, maskImage: `url(/assets/visual-icons/${name}.svg)`}}
  />;
}
