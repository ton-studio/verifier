import { useQuery } from "@tanstack/react-query";
import { Address } from "ton";
import { useClient } from "./useClient";
import { VerifierRegistry as VerifierRegistryContract } from "./wrappers/verifier-registry";
import { useLoadSourcesRegistryInfo } from "./useLoadSourcesRegistryInfo";

export function useLoadVerifierRegistryInfo() {
  const { data: sourceRegistryData } = useLoadSourcesRegistryInfo();
  const tc = useClient();
  return useQuery(
    ["verifierRegistry", sourceRegistryData?.verifierRegistry],
    async () => {
      if (!tc) throw new Error("Client is not initialized");
      const contract = tc.open(
        VerifierRegistryContract.createFromAddress(
          Address.parse(sourceRegistryData!.verifierRegistry),
        ),
      );
      const verifiers = await contract.getVerifiers();
      return verifiers;
    },
    { enabled: !!sourceRegistryData && !!tc },
  );
}
