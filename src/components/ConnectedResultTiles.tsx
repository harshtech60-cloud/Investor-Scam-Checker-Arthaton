import { motion } from 'motion/react';
import {
  ArrowDown,
  BadgeCheck,
  ChevronRight,
  Globe,
  MessageSquareText,
  Wallet,
} from 'lucide-react';
import type { Language, PillarFinding, PillarStatus } from '../types/check';
import { getCopy } from '../data/translations';
import { useCardTilt } from '../utils/useCardTilt';
import { StatusIndicator } from './StatusIndicator';

interface ConnectedResultTilesProps {
  language: Language;
  pillars: PillarFinding[];
  selectedPillarId: PillarFinding['id'] | null;
  expandedPillarIds?: PillarFinding['id'][];
  staggerKey?: string | null;
  onSelectPillar: (pillarId: PillarFinding['id']) => void;
}

const PILLAR_ICONS: Record<PillarFinding['id'], typeof MessageSquareText> = {
  message: MessageSquareText,
  sebi: BadgeCheck,
  link: Globe,
  payment: Wallet,
  
