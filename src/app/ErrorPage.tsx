import { Link, useRouteError } from 'react-router-dom';

export function ErrorPage() {
  const err = useRouteError() as { message?: string } | undefined;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-bold">Algo deu errado</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {err?.message ?? 'Erro inesperado.'} Seus dados continuam salvos no aparelho.
      </p>
      <Link to="/" reloadDocument className="btn-primary mt-6">
        Voltar para Hoje
      </Link>
    </div>
  );
}
