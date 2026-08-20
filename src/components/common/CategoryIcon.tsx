import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Fuel,
  ShoppingBag,
  Zap,
  Home,
  HeartPulse,
  Film,
  Plane,
  Sparkles,
  GraduationCap,
  TrendingUp,
  CreditCard,
  MoreHorizontal,
  Coffee,
  Gift,
  Briefcase,
  Shield,
  Smartphone,
  Wifi,
  Tv,
  Dumbbell,
  BookOpen,
  DollarSign,
  Tag,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  Utensils,
  ShoppingCart,
  Car,
  Fuel,
  ShoppingBag,
  Zap,
  Home,
  HeartPulse,
  Film,
  Plane,
  Sparkles,
  GraduationCap,
  TrendingUp,
  CreditCard,
  MoreHorizontal,
  Coffee,
  Gift,
  Briefcase,
  Shield,
  Smartphone,
  Wifi,
  Tv,
  Dumbbell,
  BookOpen,
  DollarSign,
  Tag
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = '', size = 18, ...props }) => {
  const IconComponent = iconMap[iconName] || Tag;
  return <IconComponent size={size} className={className} {...props} />;
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'ShoppingCart',
  'Car',
  'Fuel',
  'ShoppingBag',
  'Zap',
  'Home',
  'HeartPulse',
  'Film',
  'Plane',
  'Sparkles',
  'GraduationCap',
  'TrendingUp',
  'CreditCard',
  'Coffee',
  'Gift',
  'Briefcase',
  'Shield',
  'Smartphone',
  'Wifi',
  'Tv',
  'Dumbbell',
  'BookOpen',
  'MoreHorizontal'
];
