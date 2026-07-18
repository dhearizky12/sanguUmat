function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
      <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-container text-3xl!" data-icon={icon}>
          {icon}
        </span>
      </div>
      <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
      {message && <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{message}</p>}
    </div>
  );
}

export default EmptyState;
