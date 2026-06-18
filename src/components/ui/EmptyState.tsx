interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-white/80 bg-white/70 px-6 py-12 text-center shadow-card backdrop-blur-xl">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-2xl shadow-card">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
