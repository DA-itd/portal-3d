export type ViewMode = 'portal' | 'space3d';

export type ColorTheme = 'tecnm' | 'cyber' | 'gold';

export type PlanetType = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars';

export interface ServiceModuleItem {
  id: string;
  title: string;
  code: string;
  description: string;
  url: string;
  isRestricted?: boolean;
  category: 'tutorias' | 'actualizacion' | 'calidad' | 'siape';
  badgeColor?: string;
  icon: string;
  node3DId?: string;
}

export interface Node3DData {
  id: string;
  title: string;
  planetName: string;
  subtitle: string;
  color: string;
  accentColor: string;
  orbitRadius: number;
  initialAngle: number;
  orbitSpeed: number;
  radius: number;
  type: PlanetType;
  description: string;
  actionUrl?: string;
  actionText?: string;
  links?: { label: string; url: string }[];
}
