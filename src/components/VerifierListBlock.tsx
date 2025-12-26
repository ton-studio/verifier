import { Box, Skeleton, Typography, useTheme, useMediaQuery } from "@mui/material";
import React from "react";
import { useLoadVerifierRegistryInfo } from "../lib/useLoadVerifierRegistryInfo";
import { CenteringBox, DataBox, IconBox, TitleBox, TitleText } from "./Common.styled";
import verified from "../assets/verified-light.svg";

const VerifierCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        border: "1px solid rgba(114, 138, 150, 0.24)",
        borderRadius: 12,
        padding: 2,
        minWidth: 250,
        flex: 1,
      }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>{title}</Typography>
      {children}
    </Box>
  );
};

export function VerifierListBlock() {
  const { data, isLoading } = useLoadVerifierRegistryInfo();
  const verifiers = Object.entries(data ?? {});
  const hasVerifiers = verifiers.length > 0;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <DataBox>
      <TitleBox mb={2}>
        <CenteringBox sx={{ width: "100%", justifyContent: "flex-start" }}>
          <IconBox>
            <img src={verified} alt="Verifier icon" width={41} height={41} />
          </IconBox>
          <TitleText>Supported verifiers</TitleText>
        </CenteringBox>
      </TitleBox>
      {isLoading && !hasVerifiers && (
        <Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Box>
      )}
      {hasVerifiers ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            flexWrap: "wrap",
            gap: 2,
          }}>
          {verifiers.map(([id, config]) => (
            <VerifierCard key={id} title={config.name}>
              <Typography sx={{ fontSize: 14, color: "#4A4C4F" }}>
                <b>ID:</b> {id}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#4A4C4F" }}>
                <b>URL:</b> {config.url}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#4A4C4F" }}>
                <b>Admin:</b> {config.admin.toString()}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#4A4C4F" }}>
                <b>Quorum:</b> {config.quorum}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Endpoints</Typography>
                {Object.entries(config.pubKeyEndpoints).map(([pubKey, endpoint]) => (
                  <Typography key={pubKey} sx={{ fontSize: 13, color: "#4A4C4F" }}>
                    {endpoint} ({pubKey.slice(0, 6)}…)
                  </Typography>
                ))}
              </Box>
            </VerifierCard>
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
    </DataBox>
  );
}
