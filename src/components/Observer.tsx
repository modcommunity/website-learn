import { Observer } from "tailwindcss-intersect/observer";
import { useEffect } from "react";
 
export default function ObserverProvider ({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    Observer.start();
  }, []);
 
  return <>{children}</>;
}