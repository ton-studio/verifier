import compilerIcon from "../assets/compiler.svg";
import { DataBlock, DataRowItem } from "./DataBlock";
import {
  findProofByVerifierName,
  getFirstAvailableProof,
  useLoadContractProof,
} from "../lib/useLoadContractProof";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
  funcVersionToLink,
  fiftVersionToLink,
  tactVersionToLink,
  tolkVersionToLink,
  dropPatchVersionZero,
} from "../utils/linkUtils";
import {
  FiftCliCompileSettings,
  FuncCompilerSettings,
  TactCliCompileSettings,
  TolkCliCompileSettings,
} from "@ton-community/contract-verifier-sdk";
import { useLoadVerifierRegistryInfo } from "../lib/useLoadVerifierRegistryInfo";

TimeAgo.addDefaultLocale(en);

export function CompilerBlock() {
  const { data: proofs } = useLoadContractProof();
  const { data: verifierRegistry } = useLoadVerifierRegistryInfo();
  const proof =
    findProofByVerifierName(proofs, verifierRegistry, "verifier.ton.org") ??
    getFirstAvailableProof(proofs);

  const compilerSettings = proof?.compilerSettings;

  const dataRows: DataRowItem[] = [];

  if (proof) {
    dataRows.push({
      title: "Compiler",
      value: `${proof.compiler ?? ""}`,
    });

    if (proof.compiler === "func") {
      const funcVersion = (compilerSettings as FuncCompilerSettings)?.funcVersion;
      dataRows.push({
        title: "Version",
        value: funcVersion,
        color: "#0088CC",
        customLink: funcVersion && funcVersionToLink(funcVersion),
      });
    } else if (proof.compiler === "fift") {
      const fiftVersion = (compilerSettings as FiftCliCompileSettings)?.fiftVersion;
      dataRows.push({
        title: "Version",
        value: fiftVersion,
        color: "#0088CC",
        customLink: fiftVersionToLink(fiftVersion),
      });
    } else if (proof.compiler === "tact") {
      const tactVersion = (compilerSettings as TactCliCompileSettings)?.tactVersion;
      dataRows.push({
        title: "Version",
        value: tactVersion,
        color: "#0088CC",
        customLink: tactVersionToLink(tactVersion),
      });
    } else if (proof.compiler === "tolk") {
      const tolkVersion = (compilerSettings as TolkCliCompileSettings)?.tolkVersion;
      dataRows.push({
        title: "Version",
        value: dropPatchVersionZero(tolkVersion),
        color: "#0088CC",
        customLink: tolkVersionToLink(tolkVersion),
      });
    }
    if (proof.compiler === "func") {
      dataRows.push({
        title: "Command",
        value: (compilerSettings as FuncCompilerSettings)?.commandLine,
        showIcon: true,
        tooltip: true,
      });
    }
    dataRows.push({
      title: "Verified on",
      value: proof.verificationDate?.toLocaleDateString() ?? "",
    });
  }

  return <DataBlock title="Compiler" icon={compilerIcon} dataRows={dataRows} isFlexibleWrapper />;
}
