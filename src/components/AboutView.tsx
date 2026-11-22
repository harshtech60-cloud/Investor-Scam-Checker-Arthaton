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

export function AboutView({ language, onStartCheck }: AboutViewProps) 
