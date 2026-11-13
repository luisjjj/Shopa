import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-7 ${
        className ?? ""
      }`}
    >
      <div className="min-w-0">
        <h1 className="text-[1.375rem] sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
