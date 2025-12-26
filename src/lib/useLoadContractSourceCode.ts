import { SourcesData } from "@ton-community/contract-verifier-sdk";
import { useEffect } from "react";

type LoadContractSourceCodeOptions = {
  containerSelector: string;
  fileListSelector: string;
  contentSelector: string;
};

export function useLoadContractSourceCode(
  data: (Partial<SourcesData> & { files?: SourcesData["files"] }) | undefined,
  { containerSelector, fileListSelector, contentSelector }: LoadContractSourceCodeOptions,
) {
  useEffect(() => {
    if (!data?.files?.length) return;
    ContractVerifierUI.loadSourcesData(data as SourcesData, {
      containerSelector,
      fileListSelector,
      contentSelector,
      theme: "light",
    });
  }, [data, containerSelector, fileListSelector, contentSelector]);
}
