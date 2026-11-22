import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ExternalLink, HeartHandshake, ShieldCheck } from 'lucide-react';
import type { Language } from '../types/check';
import { getCopy } from '../data/translations';
import { OfficialSourcesCard } from './OfficialSourcesCard';
import { ScrollReveal } from './ScrollReveal';

interface AboutViewProps {
  language: Language;
  onStartCheck: () => void;
