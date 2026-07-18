function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <span className="material-symbols-outlined text-primary-container text-4xl! animate-spin" data-icon="progress_activity">
        progress_activity
      </span>
      <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}

export default LoadingState;
