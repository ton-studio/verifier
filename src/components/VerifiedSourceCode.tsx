import { useLoadContractSourceCode } from "../lib/useLoadContractSourceCode";
import React from "react";
import { SourcesData } from "@ton-community/contract-verifier-sdk";

interface VerifiedSourceCodeProps {
  button: React.ReactNode;
  proofData?: Partial<SourcesData>;
  domIds: {
    containerId: string;
    filesId: string;
    contentId: string;
  };
}

export function VerifiedSourceCode({ button, proofData, domIds }: VerifiedSourceCodeProps) {
  useLoadContractSourceCode(proofData, {
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
