import { useQuery } from "@tanstack/react-query";

import { randomFromArray, useBackends } from "./useSubmitSources";

type LatestContract = {
  address: string;
  mainFile: string;
  compiler: string;
  verifierId?: string;
  timestamp?: number;
};

export function useLoadLatestVerified() {
  const backends = useBackends("verifier.ton.org");
  const backend = randomFromArray(backends);

  const { isLoading, error, data } = useQuery<LatestContract[]>({
    queryKey: ["latestVerifiedContracts", backend],
    enabled: !!backend,
    queryFn: async () => {
      const response = await fetch(`${backend}/latestVerified`, {
        method: "GET",
      });

      const latestVerified = (await response.json()) as LatestContract[];

      return latestVerified.slice(0, 100);
    },
  });

  return { isLoading, error, data };
}
