export function Placeholder({ title }: { title: string }) {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Em construção.</p>
    </section>
  );
}
