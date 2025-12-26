import { useQuery } from "@tanstack/react-query";
import { Sha256 } from "@aws-crypto/sha256-js";
import { useLoadContractInfo } from "./useLoadContractInfo";
import "@ton-community/contract-verifier-sdk";
import { SourcesData } from "@ton-community/contract-verifier-sdk";
import { useContractAddress } from "./useContractAddress";
import { usePublishProof } from "./usePublishProof";
import { useIsTestnet } from "../components/TestnetBar";

export const toSha256Buffer = (s: string) => {
  const sha = new Sha256();
  sha.update(s);
  return Buffer.from(sha.digestSync());
};

export async function getProofIpfsLink(
  hash: string,
  verifierId: string,
  isTestnet: boolean,
): Promise<string | null> {
  return ContractVerifier.getSourcesJsonUrl(hash, {
    verifier: verifierId,
    testnet: isTestnet,
  });
}

type UseLoadContractProofArgs = {
  contractAddress?: string | null;
  verifier?: string;
};

export async function loadProofData(
  codeCellHashBase64: string,
  verifier: string,
  isTestnet: boolean,
) {
  const ipfsLink = await getProofIpfsLink(codeCellHashBase64, verifier, isTestnet);

  if (!ipfsLink) {
    return { hasOnchainProof: false, ipfsLink };
  }

  const sourcesData = await ContractVerifier.getSourcesData(ipfsLink, {
    testnet: isTestnet,
    ipfsConverter: (ipfsUrl: string) => {
      const endpoint = "https://gateway.pinata.cloud/ipfs/";
      return ipfsUrl.replace("ipfs://", endpoint);
    },
  });
  return {
    hasOnchainProof: true,
    ...sourcesData,
  };
}

export function useLoadContractProof({
  contractAddress: overrideAddress,
  verifier = "verifier.ton.org",
}: UseLoadContractProofArgs = {}) {
  const { contractAddress: defaultAddress } = useContractAddress();
  const contractAddress = overrideAddress ?? defaultAddress;
  const { data: contractInfo, error: contractError } = useLoadContractInfo(contractAddress);
  const { status: publishProofStatus } = usePublishProof(verifier);
  const isTestnet = useIsTestnet();

  const { isLoading, error, data, refetch } = useQuery<
    Partial<SourcesData> & {
      hasOnchainProof: boolean;
    }
  >(
    [contractAddress, verifier, isTestnet, "proof"],
    async () => {
      if (!contractAddress) {
        return {
          hasOnchainProof: false,
        };
      }

      if (!contractInfo?.codeCellToCompileBase64) {
        return { hasOnchainProof: false };
      }

      return loadProofData(contractInfo.codeCellToCompileBase64, verifier, isTestnet);
    },
    {
      enabled:
        !!contractAddress &&
        !!contractInfo?.codeCellToCompileBase64 &&
        publishProofStatus === "initial",
      retry: 2,
    },
  );

  return { isLoading, error: error ?? contractError, data, refetch };
}
