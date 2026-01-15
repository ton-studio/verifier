import { useLoadContractSourceCode } from "../lib/useLoadContractSourceCode";
import React, { useMemo } from "react";
import { ContractProofData } from "../lib/useLoadContractProof";
import { getValidSources } from "../lib/getSourcesData";

interface VerifiedSourceCodeProps {
  button: React.ReactNode;
  proofData?: ContractProofData;
  domIds: {
    containerId: string;
    filesId: string;
    contentId: string;
  };
}

export function VerifiedSourceCode({ button, proofData, domIds }: VerifiedSourceCodeProps) {
  const dataForSourceCode = useMemo(() => {
    if (!proofData) return undefined;
    const validFiles = getValidSources(proofData.files);
    return { ...proofData, files: validFiles };
  }, [proofData]);

  useLoadContractSourceCode(dataForSourceCode, {
    containerSelector: `#${domIds.containerId}`,
    fileListSelector: `#${domIds.filesId}`,
    contentSelector: `#${domIds.contentId}`,
  });

  return (
    <div id={domIds.containerId} style={{ color: "black" }}>
      <div id={domIds.filesId}></div>
      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        <div id={domIds.contentId}></div>
        <div style={{ position: "absolute", top: -73, right: -24, zIndex: 3 }}>{button}</div>
      </div>
    </div>
  );
}
