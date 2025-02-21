// import { useState } from "react";
// import { toast } from "sonner";

// const useFetch = (callback: any) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState<boolean | null>(null);
//   const [error, setError] = useState(null);

//   const fn = async (...args) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await callback(...args);
//       setData(response);
//       setError(null);
//     } catch (error: any) {
//       setError(error);
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, fn, setData };
// };

// export default useFetch;

import { useState } from "react";
import { toast } from "sonner";

// Generic type for the hook
type UseFetchCallback<TArgs extends any[], TResponse> = (...args: TArgs) => Promise<TResponse>;

interface UseFetchResult<TArgs extends any[], TResponse> {
  data: TResponse | undefined;
  loading: boolean;
  error: Error | null;
  fn: (...args: TArgs) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<TResponse | undefined>>;
}

function useFetch<TArgs extends any[], TResponse>(
  callback: UseFetchCallback<TArgs, TResponse>
): UseFetchResult<TArgs, TResponse> {
  const [data, setData] = useState<TResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await callback(...args);
      setData(response);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}

export default useFetch;
