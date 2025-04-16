import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  linkText?: string;
  linkHref?: string;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  linkText,
  linkHref
}: SummaryCardProps) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className={`dashboard-card-icon ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="dashboard-card-content">
          <dl>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-slate-900 dark:text-white">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      {linkText && linkHref && (
        <div className="dashboard-card-footer">
          <div className="text-sm">
            <a href={linkHref} className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
              {linkText}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
