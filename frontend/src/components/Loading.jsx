function Loading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="fixed inset-0 girih-pattern pointer-events-none opacity-80"></div>
      {/* <div className="fixed inset-0 bg-linear-to-b from-primary-container/20 via-transparent to-primary-container/40 pointer-events-none"></div> */}
      <main className="relative z-10 flex flex-col items-center text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-title-md font-bold text-primary-container">Sangu Umat</span>
          <p className="">Seeking wisdom for your journey...</p>
          <div className="mt-4 w-64 h-1 bg-secondary-container rounded-full overflow-hidden relative">
            <div className="absolute h-full bg-gold rounded-full progress-animation bg-surface-variant"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Loading;
