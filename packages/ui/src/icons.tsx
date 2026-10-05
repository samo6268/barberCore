import { forwardRef } from 'react';
import type { Icon, IconProps, IconWeight } from '@phosphor-icons/react';
import { HeartbeatIcon } from '@phosphor-icons/react/dist/ssr/Heartbeat';
import { ArrowDownRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowDownRight';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { MedalIcon } from '@phosphor-icons/react/dist/ssr/Medal';
import { SealCheckIcon } from '@phosphor-icons/react/dist/ssr/SealCheck';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { BellRingingIcon } from '@phosphor-icons/react/dist/ssr/BellRinging';
import { TextBIcon } from '@phosphor-icons/react/dist/ssr/TextB';
import { BookOpenTextIcon } from '@phosphor-icons/react/dist/ssr/BookOpenText';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { PaintBrushIcon } from '@phosphor-icons/react/dist/ssr/PaintBrush';
import { CalendarBlankIcon } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/ssr/CalendarDots';
import { CalendarSlashIcon } from '@phosphor-icons/react/dist/ssr/CalendarSlash';
import { CalendarPlusIcon } from '@phosphor-icons/react/dist/ssr/CalendarPlus';
import { CalendarXIcon } from '@phosphor-icons/react/dist/ssr/CalendarX';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { ChecksIcon } from '@phosphor-icons/react/dist/ssr/Checks';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { PlayCircleIcon } from '@phosphor-icons/react/dist/ssr/PlayCircle';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { CoinsIcon } from '@phosphor-icons/react/dist/ssr/Coins';
import { CopyIcon } from '@phosphor-icons/react/dist/ssr/Copy';
import { CreditCardIcon } from '@phosphor-icons/react/dist/ssr/CreditCard';
import { CrownIcon } from '@phosphor-icons/react/dist/ssr/Crown';
import { CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { NotePencilIcon } from '@phosphor-icons/react/dist/ssr/NotePencil';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { FileIcon } from '@phosphor-icons/react/dist/ssr/File';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { FunnelSimpleIcon } from '@phosphor-icons/react/dist/ssr/FunnelSimple';
import { FlowerLotusIcon } from '@phosphor-icons/react/dist/ssr/FlowerLotus';
import { GiftIcon } from '@phosphor-icons/react/dist/ssr/Gift';
import { GlobeHemisphereEastIcon } from '@phosphor-icons/react/dist/ssr/GlobeHemisphereEast';
import { GraduationCapIcon } from '@phosphor-icons/react/dist/ssr/GraduationCap';
import { HandPalmIcon } from '@phosphor-icons/react/dist/ssr/HandPalm';
import { TextHOneIcon } from '@phosphor-icons/react/dist/ssr/TextHOne';
import { TextHTwoIcon } from '@phosphor-icons/react/dist/ssr/TextHTwo';
import { HeartIcon } from '@phosphor-icons/react/dist/ssr/Heart';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { TextItalicIcon } from '@phosphor-icons/react/dist/ssr/TextItalic';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/ssr/SquaresFour';
import { LinkSimpleIcon } from '@phosphor-icons/react/dist/ssr/LinkSimple';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ListNumbersIcon } from '@phosphor-icons/react/dist/ssr/ListNumbers';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { MapTrifoldIcon } from '@phosphor-icons/react/dist/ssr/MapTrifold';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { MegaphoneSimpleIcon } from '@phosphor-icons/react/dist/ssr/MegaphoneSimple';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { ChatCircleTextIcon } from '@phosphor-icons/react/dist/ssr/ChatCircleText';
import { MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';
import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';
import { PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PrinterIcon } from '@phosphor-icons/react/dist/ssr/Printer';
import { QuotesIcon } from '@phosphor-icons/react/dist/ssr/Quotes';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';
import { FloppyDiskIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { ScissorsIcon } from '@phosphor-icons/react/dist/ssr/Scissors';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { ListChecksIcon } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { MagnifyingGlassMinusIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassMinus';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SlidersIcon } from '@phosphor-icons/react/dist/ssr/Sliders';
import { ShieldIcon } from '@phosphor-icons/react/dist/ssr/Shield';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { SprayBottleIcon } from '@phosphor-icons/react/dist/ssr/SprayBottle';
import { StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { StorefrontIcon } from '@phosphor-icons/react/dist/ssr/Storefront';
import { TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { TrashSimpleIcon } from '@phosphor-icons/react/dist/ssr/TrashSimple';
import { TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import { UserCheckIcon } from '@phosphor-icons/react/dist/ssr/UserCheck';
import { UserCircleCheckIcon } from '@phosphor-icons/react/dist/ssr/UserCircleCheck';
import { UserMinusIcon } from '@phosphor-icons/react/dist/ssr/UserMinus';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { WalletIcon } from '@phosphor-icons/react/dist/ssr/Wallet';
import { WindIcon } from '@phosphor-icons/react/dist/ssr/Wind';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { LightningIcon } from '@phosphor-icons/react/dist/ssr/Lightning';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { HairDryerIcon } from '@phosphor-icons/react/dist/ssr/HairDryer';

/**
 * The single icon entry point for Parnegarin.
 * Use duotone for expressive domain icons and regular for compact controls.
 * SSR variants work in both server and client components without a provider.
 */
function createIcon(Component: Icon, name: string, defaultWeight: IconWeight = 'duotone'): Icon {
  const ProductIcon = forwardRef<SVGSVGElement, IconProps>(
    ({ size = 20, weight = defaultWeight, alt, ...props }, ref) => {
      const labelled = Boolean(alt || props['aria-label'] || props['aria-labelledby']);
      return (
        <Component
          ref={ref}
          size={size}
          weight={weight}
          alt={alt}
          aria-hidden={labelled ? undefined : true}
          role={labelled ? 'img' : undefined}
          focusable="false"
          {...props}
          data-icon-library="phosphor"
          data-icon-name={name}
          data-icon-weight={weight}
        />
      );
    },
  );
  ProductIcon.displayName = `ParnegarinIcon(${name})`;
  return ProductIcon;
}

export type { IconProps, IconWeight };
export const Activity = /*#__PURE__*/ createIcon(HeartbeatIcon, 'Heartbeat');
export const ArrowDownRight = /*#__PURE__*/ createIcon(ArrowDownRightIcon, 'ArrowDownRight', 'regular');
export const ArrowLeft = /*#__PURE__*/ createIcon(ArrowLeftIcon, 'ArrowLeft', 'regular');
export const ArrowRight = /*#__PURE__*/ createIcon(ArrowRightIcon, 'ArrowRight', 'regular');
export const ArrowUpRight = /*#__PURE__*/ createIcon(ArrowUpRightIcon, 'ArrowUpRight', 'regular');
export const Award = /*#__PURE__*/ createIcon(MedalIcon, 'Medal');
export const BadgeCheck = /*#__PURE__*/ createIcon(SealCheckIcon, 'SealCheck');
export const Ban = /*#__PURE__*/ createIcon(ProhibitIcon, 'Prohibit');
export const BarChart3 = /*#__PURE__*/ createIcon(ChartBarIcon, 'ChartBar');
export const Bell = /*#__PURE__*/ createIcon(BellRingingIcon, 'BellRinging');
export const Bold = /*#__PURE__*/ createIcon(TextBIcon, 'TextB', 'regular');
export const BookOpen = /*#__PURE__*/ createIcon(BookOpenTextIcon, 'BookOpenText');
export const BriefcaseBusiness = /*#__PURE__*/ createIcon(BriefcaseIcon, 'Briefcase');
export const Brush = /*#__PURE__*/ createIcon(PaintBrushIcon, 'PaintBrush');
export const Calendar = /*#__PURE__*/ createIcon(CalendarBlankIcon, 'CalendarBlank');
export const CalendarCheck = /*#__PURE__*/ createIcon(CalendarCheckIcon, 'CalendarCheck');
export const CalendarClock = /*#__PURE__*/ createIcon(CalendarDotsIcon, 'CalendarDots');
export const CalendarDays = /*#__PURE__*/ createIcon(CalendarDotsIcon, 'CalendarDots');
export const CalendarOff = /*#__PURE__*/ createIcon(CalendarSlashIcon, 'CalendarSlash');
export const CalendarPlus2 = /*#__PURE__*/ createIcon(CalendarPlusIcon, 'CalendarPlus');
export const CalendarX2 = /*#__PURE__*/ createIcon(CalendarXIcon, 'CalendarX');
export const Check = /*#__PURE__*/ createIcon(CheckIcon, 'Check', 'regular');
export const CheckCheck = /*#__PURE__*/ createIcon(ChecksIcon, 'Checks', 'regular');
export const CheckCircle = /*#__PURE__*/ createIcon(CheckCircleIcon, 'CheckCircle');
export const CheckCircle2 = /*#__PURE__*/ createIcon(CheckCircleIcon, 'CheckCircle');
export const ChevronDown = /*#__PURE__*/ createIcon(CaretDownIcon, 'CaretDown', 'regular');
export const ChevronLeft = /*#__PURE__*/ createIcon(CaretLeftIcon, 'CaretLeft', 'regular');
export const ChevronRight = /*#__PURE__*/ createIcon(CaretRightIcon, 'CaretRight', 'regular');
export const ChevronUp = /*#__PURE__*/ createIcon(CaretUpIcon, 'CaretUp', 'regular');
export const CirclePlay = /*#__PURE__*/ createIcon(PlayCircleIcon, 'PlayCircle');
export const CircleUserRound = /*#__PURE__*/ createIcon(UserCircleIcon, 'UserCircle');
export const Clock = /*#__PURE__*/ createIcon(ClockIcon, 'Clock');
export const Clock3 = /*#__PURE__*/ createIcon(ClockIcon, 'Clock');
export const Coins = /*#__PURE__*/ createIcon(CoinsIcon, 'Coins');
export const Copy = /*#__PURE__*/ createIcon(CopyIcon, 'Copy');
export const CreditCard = /*#__PURE__*/ createIcon(CreditCardIcon, 'CreditCard');
export const Crown = /*#__PURE__*/ createIcon(CrownIcon, 'Crown');
export const DollarSign = /*#__PURE__*/ createIcon(CurrencyDollarIcon, 'CurrencyDollar');
export const Download = /*#__PURE__*/ createIcon(DownloadSimpleIcon, 'DownloadSimple');
export const Edit = /*#__PURE__*/ createIcon(NotePencilIcon, 'NotePencil');
export const Edit2 = /*#__PURE__*/ createIcon(PencilSimpleIcon, 'PencilSimple');
export const Eye = /*#__PURE__*/ createIcon(EyeIcon, 'Eye');
export const EyeOff = /*#__PURE__*/ createIcon(EyeSlashIcon, 'EyeSlash');
export const File = /*#__PURE__*/ createIcon(FileIcon, 'File');
export const FileCheck2 = /*#__PURE__*/ createIcon(ClipboardTextIcon, 'ClipboardText');
export const FileText = /*#__PURE__*/ createIcon(FileTextIcon, 'FileText');
export const Filter = /*#__PURE__*/ createIcon(FunnelSimpleIcon, 'FunnelSimple');
export const Flower2 = /*#__PURE__*/ createIcon(FlowerLotusIcon, 'FlowerLotus');
export const Gift = /*#__PURE__*/ createIcon(GiftIcon, 'Gift');
export const Globe = /*#__PURE__*/ createIcon(GlobeHemisphereEastIcon, 'GlobeHemisphereEast');
export const GraduationCap = /*#__PURE__*/ createIcon(GraduationCapIcon, 'GraduationCap');
export const Hand = /*#__PURE__*/ createIcon(HandPalmIcon, 'HandPalm');
export const Heading1 = /*#__PURE__*/ createIcon(TextHOneIcon, 'TextHOne', 'regular');
export const Heading2 = /*#__PURE__*/ createIcon(TextHTwoIcon, 'TextHTwo', 'regular');
export const Heart = /*#__PURE__*/ createIcon(HeartIcon, 'Heart', 'regular');
export const Image = /*#__PURE__*/ createIcon(ImageIcon, 'Image');
export const Italic = /*#__PURE__*/ createIcon(TextItalicIcon, 'TextItalic', 'regular');
export const LayoutDashboard = /*#__PURE__*/ createIcon(SquaresFourIcon, 'SquaresFour');
export const Link = /*#__PURE__*/ createIcon(LinkSimpleIcon, 'LinkSimple', 'regular');
export const List = /*#__PURE__*/ createIcon(ListBulletsIcon, 'ListBullets', 'regular');
export const ListOrdered = /*#__PURE__*/ createIcon(ListNumbersIcon, 'ListNumbers', 'regular');
export const Loader2 = /*#__PURE__*/ createIcon(SpinnerGapIcon, 'SpinnerGap', 'regular');
export const Lock = /*#__PURE__*/ createIcon(LockSimpleIcon, 'LockSimple');
export const LockKeyhole = /*#__PURE__*/ createIcon(LockKeyIcon, 'LockKey');
export const LogOut = /*#__PURE__*/ createIcon(SignOutIcon, 'SignOut');
export const Mail = /*#__PURE__*/ createIcon(EnvelopeSimpleIcon, 'EnvelopeSimple');
export const Map = /*#__PURE__*/ createIcon(MapTrifoldIcon, 'MapTrifold');
export const MapPin = /*#__PURE__*/ createIcon(MapPinIcon, 'MapPin');
export const Megaphone = /*#__PURE__*/ createIcon(MegaphoneSimpleIcon, 'MegaphoneSimple');
export const Menu = /*#__PURE__*/ createIcon(ListIcon, 'List', 'regular');
export const MessageSquare = /*#__PURE__*/ createIcon(ChatCircleTextIcon, 'ChatCircleText');
export const Minus = /*#__PURE__*/ createIcon(MinusIcon, 'Minus', 'regular');
export const MoreHorizontal = /*#__PURE__*/ createIcon(DotsThreeIcon, 'DotsThree', 'regular');
export const Phone = /*#__PURE__*/ createIcon(PhoneCallIcon, 'PhoneCall');
export const Play = /*#__PURE__*/ createIcon(PlayIcon, 'Play');
export const Plus = /*#__PURE__*/ createIcon(PlusIcon, 'Plus', 'regular');
export const Printer = /*#__PURE__*/ createIcon(PrinterIcon, 'Printer');
export const Quote = /*#__PURE__*/ createIcon(QuotesIcon, 'Quotes', 'regular');
export const RefreshCw = /*#__PURE__*/ createIcon(ArrowsClockwiseIcon, 'ArrowsClockwise', 'regular');
export const Save = /*#__PURE__*/ createIcon(FloppyDiskIcon, 'FloppyDisk');
export const Scissors = /*#__PURE__*/ createIcon(ScissorsIcon, 'Scissors');
export const Search = /*#__PURE__*/ createIcon(MagnifyingGlassIcon, 'MagnifyingGlass', 'regular');
export const SearchCheck = /*#__PURE__*/ createIcon(ListChecksIcon, 'ListChecks');
export const SearchX = /*#__PURE__*/ createIcon(MagnifyingGlassMinusIcon, 'MagnifyingGlassMinus');
export const Send = /*#__PURE__*/ createIcon(PaperPlaneTiltIcon, 'PaperPlaneTilt');
export const Settings = /*#__PURE__*/ createIcon(GearSixIcon, 'GearSix');
export const Settings2 = /*#__PURE__*/ createIcon(SlidersIcon, 'Sliders');
export const Shield = /*#__PURE__*/ createIcon(ShieldIcon, 'Shield');
export const ShieldCheck = /*#__PURE__*/ createIcon(ShieldCheckIcon, 'ShieldCheck');
export const SlidersHorizontal = /*#__PURE__*/ createIcon(SlidersHorizontalIcon, 'SlidersHorizontal');
export const Sparkles = /*#__PURE__*/ createIcon(SparkleIcon, 'Sparkle');
export const SprayCan = /*#__PURE__*/ createIcon(SprayBottleIcon, 'SprayBottle');
export const Star = /*#__PURE__*/ createIcon(StarIcon, 'Star', 'regular');
export const Store = /*#__PURE__*/ createIcon(StorefrontIcon, 'Storefront');
export const Tag = /*#__PURE__*/ createIcon(TagIcon, 'Tag');
export const Trash2 = /*#__PURE__*/ createIcon(TrashSimpleIcon, 'TrashSimple');
export const TrendingDown = /*#__PURE__*/ createIcon(TrendDownIcon, 'TrendDown');
export const TrendingUp = /*#__PURE__*/ createIcon(TrendUpIcon, 'TrendUp');
export const Upload = /*#__PURE__*/ createIcon(UploadSimpleIcon, 'UploadSimple');
export const User = /*#__PURE__*/ createIcon(UserCircleIcon, 'UserCircle');
export const UserCheck = /*#__PURE__*/ createIcon(UserCheckIcon, 'UserCheck');
export const UserRound = /*#__PURE__*/ createIcon(UserCircleIcon, 'UserCircle');
export const UserRoundCheck = /*#__PURE__*/ createIcon(UserCircleCheckIcon, 'UserCircleCheck');
export const UserX = /*#__PURE__*/ createIcon(UserMinusIcon, 'UserMinus');
export const Users = /*#__PURE__*/ createIcon(UsersThreeIcon, 'UsersThree');
export const Wallet = /*#__PURE__*/ createIcon(WalletIcon, 'Wallet');
export const WalletCards = /*#__PURE__*/ createIcon(WalletIcon, 'Wallet');
export const Wind = /*#__PURE__*/ createIcon(WindIcon, 'Wind');
export const X = /*#__PURE__*/ createIcon(XIcon, 'X', 'regular');
export const XCircle = /*#__PURE__*/ createIcon(XCircleIcon, 'XCircle');
export const Zap = /*#__PURE__*/ createIcon(LightningIcon, 'Lightning');
export const Info = /*#__PURE__*/ createIcon(InfoIcon, 'Info');
export const WarningCircle = /*#__PURE__*/ createIcon(WarningCircleIcon, 'WarningCircle');
export const HairDryer = /*#__PURE__*/ createIcon(HairDryerIcon, 'HairDryer');
