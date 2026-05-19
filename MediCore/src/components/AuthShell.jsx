const AuthShell = ({ title, subtitle, eyebrow, children, footer, wide = false }) => {
  return (
    <main className="auth-page min-h-[calc(100svh-73px)] px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-137px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-lg font-black text-white shadow-sm dark:bg-teal-500 dark:text-slate-950">M</span>
              <div>
                <p className="text-lg font-black tracking-tight text-slate-950 dark:text-white">MediCore</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Care network</p>
              </div>
            </div>
            <h1 className="mt-8 text-5xl font-black leading-tight text-slate-950 dark:text-white">
              Healthcare operations without the clutter.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              Sign in once and MediCore will take you to the workspace connected with your account.
            </p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {["Role based", "Fast records", "Secure access"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-lg border border-slate-200 bg-white p-6 text-left shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 sm:p-8`}
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
