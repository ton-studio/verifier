import { Box, Skeleton, Typography, useTheme, useMediaQuery, styled } from "@mui/material";
import React from "react";
import { useLoadVerifierRegistryInfo } from "../lib/useLoadVerifierRegistryInfo";
import { CenteringBox } from "./Common.styled";
import { CopyHash } from "./CopyHash";
import { DataBlock, DataRowItem } from "./DataBlock";
import { VerifierWithId } from "../lib/wrappers/verifier-registry";
import verificationIcon from "../assets/verification-popup.svg";

const VerifierCard = ({ verifierId, config }: { verifierId: string; config: VerifierWithId }) => {
  const dataRows: DataRowItem[] = [
    {
      title: "Verifier ID",
      value: <CopyHash value={verifierId} maxSize={36} />,
    },
    { title: "URL", value: config.url },
    { title: "Admin", value: config.admin.toString(), showIcon: true },
    { title: "Quorum", value: String(config.quorum) },
    {
      title: "Endpoints",
      value: (
        <>
          {Object.entries(config.pubKeyEndpoints).map(([pubKey, endpoint]) => (
            <Typography key={pubKey} sx={{ fontSize: 13, color: "#4A4C4F" }}>
              {endpoint} <CopyHash value={pubKey} />
            </Typography>
          ))}
        </>
      ),
    },
  ];

  return (
    <DataBlock title={config.name} icon={verificationIcon} dataRows={dataRows} isFlexibleWrapper />
  );
};

const ContractsWrapper = styled(Box)(({ theme }) => ({
  maxWidth: 1160,
  width: "calc(100% - 50px)",
  paddingTop: 20,
  margin: "0 auto",
}));

export function VerifierListBlock() {
  const { data, isLoading } = useLoadVerifierRegistryInfo();
  const verifiers = Object.entries(data ?? {});
  const hasVerifiers = verifiers.length > 0;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ContractsWrapper>
      <Typography variant="h6">
        <b>Verifiers</b>
      </Typography>
      {isLoading && !hasVerifiers && (
        <Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
        </Box>
      )}
      {hasVerifiers ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
          }}>
          {verifiers.map(([id, config]) => (
            <VerifierCard key={id} verifierId={id} config={config} />
          ))}
        </Box>
      ) : (
        !isLoading && (
          <CenteringBox>
            <Typography sx={{ fontSize: 14, color: "#4A4C4F" }}>
              No verifiers available for this network.
            </Typography>
          </CenteringBox>
        )
      )}
    </ContractsWrapper>
  );
}
