import {
  BarChart3, BrainCircuit, Clapperboard, Code2, FileCode2, FileText, Globe, GraduationCap, Palette, PenLine,
  PenTool, Search, Smartphone, Sparkles, Wrench, type LucideIcon,
} from "lucide-react";

// Icons are referenced by name in the categories table; map them to components here.
const icons: Record<string, LucideIcon> = {
  globe: Globe, smartphone: Smartphone, "code-2": Code2, "pen-tool": PenTool, palette: Palette,
  "brain-circuit": BrainCircuit, "bar-chart-3": BarChart3, "file-code-2": FileCode2, wrench: Wrench,
  clapperboard: Clapperboard, "pen-line": PenLine, search: Search, "file-text": FileText,
  "graduation-cap": GraduationCap, sparkles: Sparkles,
};

export function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && icons[name]) || Sparkles;
  return <Icon className={className} aria-hidden />;
}
