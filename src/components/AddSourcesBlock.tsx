import React from "react";
import { CenteringBox, DataBox } from "./Common.styled";
import { useFileStore } from "../lib/useFileStore";
import {
  DEFAULT_VERIFIER,
  useSubmitSources,
  useSubmitSourcesEntries,
} from "../lib/useSubmitSources";
import { FileUploaderArea } from "./FileUploaderArea";
import { FileTable } from "./FileTable";
import CompilerSettings from "./CompilerSettings";
import { CompileOutput } from "./CompileOutput";
import { Box, styled } from "@mui/system";
import { AppButton } from "./AppButton";
import { SECTIONS, STEPS, usePublishStore } from "../lib/usePublishSteps";
import { CircularProgress, Fade } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import ConnectButton from "./ConnectButton";
import { VerifierWithId } from "../lib/wrappers/verifier-registry";
import { ContractProofData } from "../lib/useLoadContractProof";

const ContentBox = styled(Box)({
  padding: "15px 24px",
});

const PrefillButtonWrapper = styled(Box)({
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 2,
});

type AddSourcesBlockProps = {
  contractAddress: string;
  missingVerifiers?: VerifierWithId[];
  availableProof?: ContractProofData;
};

export function AddSourcesBlock({
  contractAddress,
  missingVerifiers = [],
  availableProof,
}: AddSourcesBlockProps) {
  const walletAddress = useTonAddress();
  const { hasFiles, addFiles, reset: resetFiles } = useFileStore();
  const { step, proceedToPublish, toggleSection, currentSection } = usePublishStore();
  const activeVerifierName = missingVerifiers[0]?.name ?? DEFAULT_VERIFIER;
  const { mutate, data, error, isLoading } = useSubmitSources(contractAddress, activeVerifierName);
  const entries = useSubmitSourcesEntries(contractAddress);

  const readyPublishCount = missingVerifiers.length
    ? missingVerifiers.filter((verifier) => entries[verifier.name]?.data?.result?.msgCell).length
    : data?.result?.msgCell
      ? 1
      : 0;
  const canPublish = readyPublishCount > 0;

  const onSectionExpand = () => toggleSection(SECTIONS.SOURCES);

  const canPrefill = !!availableProof?.files?.length;

  const handlePrefill = async () => {
    if (!availableProof?.files?.length) return;
    resetFiles();

    const generatedFiles = availableProof.files.map((file) => {
      const segments = file.name.split("/");
      const baseName = segments.pop() ?? file.name;
      const generated = new File([file.content], baseName, { type: "text/plain" });
      const normalizedPath = segments.length > 0 ? `${segments.join("/")}/${baseName}` : baseName;
      Object.defineProperty(generated, "path", {
        value: normalizedPath,
        configurable: true,
      });
      return generated;
    });

    await addFiles(generatedFiles);
  };

  const compileVerifiers =
    missingVerifiers.length > 0 ? missingVerifiers.map((verifier) => verifier.name) : undefined;

  return (
    <DataBox>
      <Box
        sx={{ cursor: step === STEPS.PUBLISH && canPublish ? "pointer" : "inherit" }}
        onClick={onSectionExpand}>
        <Box sx={{ position: "relative" }}>
          <FileUploaderArea />
          {canPrefill && (
            <PrefillButtonWrapper
              onClick={(event) => {
                event.stopPropagation();
              }}>
              <AppButton
                fontSize={12}
                fontWeight={600}
                textColor="#000"
                height={32}
                width={180}
                background="#fff"
                hoverBackground="#F5F5F5"
                onClick={handlePrefill}>
                Load verified sources
              </AppButton>
            </PrefillButtonWrapper>
          )}
        </Box>
      </Box>
      {currentSection === SECTIONS.SOURCES && (
        <Fade in={currentSection === SECTIONS.SOURCES}>
          <ContentBox>
            <>
              {hasFiles() && (
                <>
                  <FileTable canPublish={canPublish} />
                  <CompilerSettings canPublish={canPublish} />
                </>
              )}
              {(data || error) && <CompileOutput contractAddress={contractAddress} />}
              {hasFiles() && (
                <CenteringBox sx={{ justifyContent: "center" }} mt={3} mb="9px">
                  {!walletAddress ? (
                    <ConnectButton />
                  ) : !data?.result?.msgCell ? (
                    <AppButton
                      disabled={!hasFiles()}
                      fontSize={14}
                      fontWeight={800}
                      textColor="#fff"
                      height={44}
                      width={144}
                      background="#1976d2"
                      hoverBackground="#156cc2"
                      onClick={() => {
                        mutate(
                          compileVerifiers
                            ? {
                                verifiers: compileVerifiers,
                              }
                            : null,
                        );
                      }}>
                      {isLoading && (
                        <CircularProgress
                          sx={{
                            color: "#fff",
                            height: "20px !important",
                            width: "20px !important",
                          }}
                        />
                      )}
                      Compile
                    </AppButton>
                  ) : (
                    <AppButton
                      disabled={step === STEPS.PUBLISH}
                      fontSize={14}
                      fontWeight={800}
                      textColor="#fff"
                      height={44}
                      width={144}
                      background="#1976d2"
                      hoverBackground="#156cc2"
                      onClick={proceedToPublish}>
                      Ready to publish
                    </AppButton>
                  )}
                </CenteringBox>
              )}
            </>
          </ContentBox>
        </Fade>
      )}
    </DataBox>
  );
}
