'use client';

import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  BellIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  ChartBarIcon,
  ChatCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FileTextIcon,
  GearIcon,
  HouseIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  SignOutIcon,
  StorefrontIcon,
  UsersIcon
} from '@phosphor-icons/react';

const icons = {
  arrow: ArrowRightIcon,
  refresh: ArrowsClockwiseIcon,
  bell: BellIcon,
  calendar: CalendarBlankIcon,
  chevron: CaretDownIcon,
  analytics: ChartBarIcon,
  inquiry: ChatCircleIcon,
  revenue: CurrencyDollarIcon,
  views: EyeIcon,
  content: FileTextIcon,
  system: GearIcon,
  dashboard: HouseIcon,
  menu: ListIcon,
  search: MagnifyingGlassIcon,
  products: PackageIcon,
  orders: ReceiptIcon,
  cart: ShoppingCartIcon,
  signout: SignOutIcon,
  store: StorefrontIcon,
  customers: UsersIcon
} as const;

export type AdminIconName = keyof typeof icons;

export default function AdminIcon({name, size = 20, className = ''}: {name: AdminIconName; size?: number; className?: string}) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={className} size={size} weight="regular" />;
}
