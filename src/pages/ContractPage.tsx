import "../App.css";
import { TopBar } from "../components/TopBar";
import { hasAnyOnchainProof, useLoadContractProof } from "../lib/useLoadContractProof";
import ContractSourceCode from "../components/ContractSourceCode";
import { useOverride } from "../lib/useOverride";
import { useFileStore } from "../lib/useFileStore";
import { Backdrop, Box, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import { useContractAddress } from "../lib/useContractAddress";
import React, { useEffect, useRef, useState } from "react";
import { ContractBlock } from "../components/ContractBlock";
import { CompilerBlock } from "../components/CompilerBlock";
import { AddSourcesBlock } from "../components/AddSourcesBlock";
import { PublishProof } from "../components/PublishProof";
import { Footer } from "../components/Footer";
import { CenteringWrapper } from "../components/Footer.styled";
import { AppNotification, NotificationType } from "../components/AppNotification";
import { NotificationTitle } from "../components/CompileOutput";
import { VerificationInfoBlock } from "../components/VerificationInfoBlock";
import { CenteringBox } from "../components/Common.styled";
import { useAddressHistory } from "../lib/useAddressHistory";
import { TestnetBar, useIsTestnet } from "../components/TestnetBar";
import { useRemoteConfig } from "../lib/useRemoteConfig";
import { useCompilerSettingsStore } from "../lib/useCompilerSettingsStore";
import { useCustomGetter } from "../lib/getter/useCustomGetter";
import { usePublishStore } from "../lib/usePublishSteps";
import { usePreload } from "../lib/usePreload";
import { ContentBox, ContractDataBox, OverflowingBox } from "../components/Layout";

function ContractPage() {
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();
  const canOverride = useOverride();
  const { contractAddress } = useContractAddress();
  const { isLoading, data: proofData, error } = useLoadContractProof();
  const { hasFiles, reset: resetFileStore } = useFileStore();
  const { reset: resetPublishStore } = usePublishStore();
  const { isPreloaded, clearPreloaded } = usePreload();
  const scrollToRef = useRef();
  const headerSpacings = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const showSkeleton = !error && isLoading && contractAddress;
  const isTestnet = useIsTestnet();
  const isInvalidAddress = contractAddress === null;

  useAddressHistory();

  useEffect(() => {
    if (!isPreloaded) {
      resetFileStore();
    } else {
      clearPreloaded();
    }
    resetPublishStore();
  }, [contractAddress]);

  const { clear: clearCustomGetter } = useCustomGetter();
  useEffect(() => {
    clearCustomGetter();
  }, [contractAddress]);

  useEffect(() => {
    window.scrollTo({ behavior: "auto", top: scrollToRef.current?.["offsetTop"] });
  }, [window.location.pathname]);

  const { initialize } = useCompilerSettingsStore();
  const { data: remoteConfig } = useRemoteConfig();
  const funcVersions = remoteConfig?.funcVersions ?? [];
  const tolkVersions = remoteConfig?.tolkVersions ?? [];
  useEffect(() => {
    if ((funcVersions?.length ?? 0) > 0) {
      initialize(funcVersions?.[0], tolkVersions?.[0]);
    }
  }, [funcVersions, tolkVersions]);

  const proofsLoaded = proofData !== undefined;
  const anyOnchainProof = hasAnyOnchainProof(proofData);

  return (
    <Box
      onDragEnter={() => setIsDragging(true)}
      onDrop={() => setIsDragging(false)}
      onClick={() => setIsDragging(false)}>
      <Backdrop
        sx={{ color: "#fff", zIndex: 4 }}
        open={isDragging}
        onDragEnd={() => setIsDragging(false)}
      />
      <Box ref={scrollToRef} />
      {isTestnet && <TestnetBar />}
      <TopBar />
      {isInvalidAddress && (
        <Box m={4}>
          <AppNotification
            singleLine
            type={NotificationType.ERROR}
            title={
              <CenteringBox sx={{ height: 42 }}>
                <span style={{ color: "#FC5656", marginRight: 4 }}>Error: </span>
                Invalid address
              </CenteringBox>
            }
            notificationBody={<Box />}
          />
        </Box>
      )}
      <ContentBox px={headerSpacings ? "20px" : 0}>
        {!!error && (
          <Box mt={4}>
            <AppNotification
              type={NotificationType.ERROR}
              title={
                <NotificationTitle>
                  <span style={{ color: "#FC5656" }}>Error: </span>
                  Unable to fetch contract data
                </NotificationTitle>
              }
              notificationBody={
                <Box sx={{ overflow: "auto", maxHeight: 300 }}>
                  <pre>
                    <code>{error.toString()}</code>
                  </pre>
                </Box>
              }
            />
          </Box>
        )}
        {showSkeleton && (
          <OverflowingBox sx={{ padding: "30px 24px 24px 24px" }} mb={3}>
            <CenteringBox mb={3}>
              <Skeleton variant="circular" width={41} height={41} sx={{ marginRight: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: "20px", width: 200 }} />
            </CenteringBox>
            <Skeleton variant="rectangular" width="100%" height={250} />
          </OverflowingBox>
        )}

        <ContractDataBox isMobile={isSmallScreen}>
          <ContractBlock />
          {anyOnchainProof && <CompilerBlock />}
        </ContractDataBox>
        {showSkeleton && (
          <OverflowingBox sx={{ padding: "30px 24px 24px 24px" }} mb={3}>
            <CenteringBox mb={3}>
              <Skeleton variant="circular" width={41} height={41} sx={{ marginRight: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: "20px", width: 200 }} />
            </CenteringBox>
            <Skeleton variant="rectangular" width="100%" height={250} />
          </OverflowingBox>
        )}
        {!isLoading && anyOnchainProof && <VerificationInfoBlock />}
        {contractAddress && proofsLoaded && (!anyOnchainProof || canOverride) && (
          <>
            <AddSourcesBlock contractAddress={contractAddress} />
            {hasFiles() && (
              <PublishProof verifier={"verifier.ton.org"} contractAddress={contractAddress} />
            )}
          </>
        )}
        {proofsLoaded && !hasFiles() ? (
          <OverflowingBox sx={{ padding: 0 }} mb={5}>
            <ContractSourceCode />
          </OverflowingBox>
        ) : (
          <>
            {showSkeleton && (
              <OverflowingBox sx={{ padding: "30px 24px 24px 24px" }} mb={5}>
                <CenteringBox mb={3}>
                  <Skeleton variant="circular" width={41} height={41} sx={{ marginRight: 2 }} />
                  <Skeleton variant="text" sx={{ fontSize: "20px", width: 250 }} />
                </CenteringBox>
                <Skeleton variant="rectangular" width="100%" height={500} />
              </OverflowingBox>
            )}
          </>
        )}
        {proofsLoaded && <Footer />}
      </ContentBox>
      {!proofsLoaded && (
        <CenteringWrapper sx={{ bottom: 0, width: "100%" }}>
          <Footer />
        </CenteringWrapper>
      )}
    </Box>
  );
}

export default ContractPage;
