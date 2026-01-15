import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sha256 } from "@aws-crypto/sha256-js";
import { useLoadContractInfo } from "./useLoadContractInfo";
import "@ton-community/contract-verifier-sdk";
import { useContractAddress } from "./useContractAddress";
import { useIsTestnet } from "../components/TestnetBar";
import { useLoadVerifierRegistryInfo } from "./useLoadVerifierRegistryInfo";
import { VerifierWithId } from "./wrappers/verifier-registry";
import { getSourcesData, SourcesData } from "./getSourcesData";

export const toSha256Buffer = (s: string) => {
  const sha = new Sha256();
  sha.update(s);
  return Buffer.from(sha.digestSync());
};

export async function getProofIpfsLink(
  hash: string,
  verifier: string,
  isTestnet: boolean,
): Promise<string | null> {
  return ContractVerifier.getSourcesJsonUrl(hash, {
    verifier,
    testnet: isTestnet,
  });
}

export type ContractProofData = Partial<SourcesData> & {
  hasOnchainProof: boolean;
};

export type ContractProofMap = Map<string, ContractProofData>;

export async function loadProofData(
  codeCellHashBase64: string,
  verifier: string,
  isTestnet: boolean,
) {
  const ipfsLink = await getProofIpfsLink(codeCellHashBase64, verifier, isTestnet);

  if (!ipfsLink) {
    return { hasOnchainProof: false, ipfsLink };
  }

  const sourcesData = await getSourcesData(ipfsLink);
  return {
    hasOnchainProof: true,
    ...sourcesData,
  };
}

export function hasAnyOnchainProof(proofs: ContractProofMap | undefined) {
  if (!proofs) return false;
  for (const proof of proofs.values()) {
    if (proof.hasOnchainProof) {
      return true;
    }
  }
  return false;
}

export function getMissingOnchainProofs(
  proofs: ContractProofMap | undefined,
  registry?: Record<string, VerifierWithId>,
) {
  if (!proofs || !registry) return [];
  return Object.values(registry).filter((verifier) => {
    const proof = proofs.get(verifier.id);
    return !proof?.hasOnchainProof;
  });
}

export function findProofByVerifierName(
  proofs: ContractProofMap | undefined,
  registry: Record<string, VerifierWithId> | undefined,
  verifierName: string,
) {
  if (!proofs || !registry) return undefined;
  const match = Object.entries(registry).find(([, config]) => config.name === verifierName);
  if (!match) return undefined;
  return proofs.get(match[0]);
}

export function getFirstAvailableProof(proofs: ContractProofMap | undefined) {
  if (!proofs) return undefined;
  for (const proof of proofs.values()) {
    if (proof.hasOnchainProof) {
      return proof;
    }
  }
  return proofs.values().next().value;
}

export function useLoadContractProof() {
  const { contractAddress } = useContractAddress() || "";
  const { data: contractInfo, error: contractError } = useLoadContractInfo();
  const { data: verifierRegistry } = useLoadVerifierRegistryInfo();
  const verifierEntries = useMemo(() => Object.entries(verifierRegistry ?? {}), [verifierRegistry]);
  const isTestnet = useIsTestnet();

  const { isLoading, error, data, refetch } = useQuery<ContractProofMap>({
    queryKey: [contractAddress, verifierEntries.map(([id]) => id).join("|"), isTestnet, "proofs"],
    enabled:
      !!contractAddress && !!contractInfo?.codeCellToCompileBase64 && verifierEntries.length > 0,
    retry: 2,
    queryFn: async () => {
      const map = new Map<string, ContractProofData>();
      if (!contractAddress || !contractInfo?.codeCellToCompileBase64) {
        return map;
      }

      await Promise.all(
        verifierEntries.map(async ([id, config]) => {
          const proof = await loadProofData(
            contractInfo.codeCellToCompileBase64,
            config.name,
            isTestnet,
          );
          map.set(id, proof);
        }),
      );
      return map;
    },
  });

  return { isLoading, error: error ?? contractError, data, refetch };
}
