import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as Error;

  return (
    <div className="w-full h-full bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary-foreground">Oops!</h1>
        <p className="text-secondary-foreground">Sorry, an unexpected error has occurred.</p>
        <p className="text-destructive">
          <i>{error?.message || error?.toString() || "Unknown error"}</i>
        </p>
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
