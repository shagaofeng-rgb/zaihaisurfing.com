import {ArrowRightIcon, PackageIcon, LifebuoyIcon, ShieldCheckIcon, CompassIcon, WrenchIcon, GlobeHemisphereWestIcon} from '@phosphor-icons/react/dist/ssr';

const icons = {arrow: ArrowRightIcon, package: PackageIcon, support: LifebuoyIcon, check: ShieldCheckIcon, ride: CompassIcon, operation: WrenchIcon, global: GlobeHemisphereWestIcon};

export default function DesignIcon({name = 'arrow'}: {name?: keyof typeof icons}) {
  const Icon = icons[name];
  return <span className="design-icon"><Icon size={24} weight="regular" aria-hidden="true" /></span>;
}
