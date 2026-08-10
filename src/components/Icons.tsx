"use client";

import {
  ShoppingBag as Bag,
  ShoppingCartSimple as Cart,
  Tag,
  Wallet,
  Package,
  Briefcase as Clutch,
  MagnifyingGlass as Search,
  Check,
  X,
  Star,
  Link,
  DeviceMobile as Smartphone,
  Globe,
  Heart,
  Storefront as Store,
  CreditCard,
  Bank,
  CheckCircle,
  XCircle,
  Envelope as Mail,
  Sparkle,
  Sun,
  Moon,
  Palette,
  Layout,
  Image,
  TextAa as Type,
  GridFour as Grid,
  List,
  Upload,
  User,
} from "phosphor-react";

interface IconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrap(Icon: any) {
  return function Wrapper({ className = "", size = 24, style }: IconProps) {
    return <Icon size={size} weight="light" className={className} style={style} />;
  };
}

export const BagIcon = wrap(Bag);
export const CartIcon = wrap(Cart);
export const TagIcon = wrap(Tag);
export const WalletIcon = wrap(Wallet);
export const PackageIcon = wrap(Package);
export const ClutchIcon = wrap(Clutch);
export const SearchIcon = wrap(Search);
export const CheckIcon = wrap(Check);
export const XIcon = wrap(X);
export const StarIcon = wrap(Star);
export const LinkIcon = wrap(Link);
export const SmartphoneIcon = wrap(Smartphone);
export const GlobeIcon = wrap(Globe);
export const HeartIcon = wrap(Heart);
export const StoreIcon = wrap(Store);
export const CreditCardIcon = wrap(CreditCard);
export const BankIcon = wrap(Bank);
export const CheckCircleIcon = wrap(CheckCircle);
export const XCircleIcon = wrap(XCircle);
export const MailIcon = wrap(Mail);
export const SparkleIcon = wrap(Sparkle);
export const SunIcon = wrap(Sun);
export const MoonIcon = wrap(Moon);
export const PaletteIcon = wrap(Palette);
export const LayoutIcon = wrap(Layout);
export const ImageIcon = wrap(Image);
export const TypeIcon = wrap(Type);
export const GridIcon = wrap(Grid);
export const ListIcon = wrap(List);
export const UploadIcon = wrap(Upload);
export const UserIcon = wrap(User);
