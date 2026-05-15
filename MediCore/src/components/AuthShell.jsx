const AuthShell = ({ title, subtitle, eyebrow, children, footer, wide = false }) => {
  return (
    <main className="auth-page min-h-[calc(100svh-73px)] px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-137px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">MediCore</p>
            <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-950 dark:text-white">
              One secure place to continue your care.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              Sign in once and MediCore will take you to the workspace connected with your account.
            </p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {["Private access", "Saved records", "Quick updates"].map((item) => (
                <div key={item} className="rounded-lg border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-lg border border-white/80 bg-white/90 p-6 text-left shadow-2xl shadow-teal-900/10 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/88 sm:p-8`}
        >
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}

          {footer && (
            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              {footer}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AuthShell;
