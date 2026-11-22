import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ExternalLink, HeartHandshake, ShieldCheck } from 'lucide-react';
import type { Language } from '../types/check';
import { getCopy } from '../data/translations';
import { OfficialSourcesCard } from './OfficialSourcesCard';
import { ScrollReveal } from './ScrollReveal';

interface AboutViewProps {
  language: Language;
  onStartCheck: () => void;

}

const RESOURCE_URLS = [
  'https://investor.sebi.gov.in/Investor-support.html',
  'https://scores.sebi.gov.in/',
  'https://cybercrime.gov.in/',
  'https://sachet.rbi.org.in/',
] as const;

export function AboutView({ language, onStartCheck }: AboutViewProps) {
  const copy = getCopy(language);
  const principleIcons = [HeartHandshake, ShieldCheck, BookOpen];

  return (
    <div className="space-y-8">
      {/* Human, Concise Editorial Intro */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        
