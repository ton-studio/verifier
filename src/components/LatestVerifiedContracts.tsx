import { Box, Skeleton, styled, Typography } from "@mui/material";
import { useLoadLatestVerified } from "../lib/useLoadLatestVerified";
import { useRef } from "react";
import { useNavigatePreserveQuery } from "../lib/useNavigatePreserveQuery";
import { useLoadVerifierRegistryInfo } from "../lib/useLoadVerifierRegistryInfo";
import { CopyHash } from "./CopyHash";

const Contract = styled(Box)(({ theme }) => ({
  background: "white",
  padding: "16px 20px",
  borderRadius: 10,
  boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
  border: "0.5px solid rgba(114, 138, 150, 0.24)",
  cursor: "pointer",
  [theme.breakpoints.down("sm")]: {
    width: 280,
  },
}));

const ContractsWrapper = styled(Box)(({ theme }) => ({
  maxWidth: 1160,
  width: "calc(100% - 50px)",
  paddingTop: 20,
  margin: "0 auto",
}));

const ContractsList = styled(Box)({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 24,
  margin: "0 auto",
  justifyContent: "left",
  overflow: "auto",
  marginTop: 24,
  "-webkit-text-size-adjust": "100%",
});

const AddressText = styled(Box)({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 16,
  color: "#728A96",
});

const CompilerText = styled(Box)({
  marginLeft: "auto",
  fontSize: 14,
  background: "#F0F0F099",
  color: "#728A9699",
  padding: "2px 12px",
  borderRadius: 4,
});

export function LatestVerifiedContracts() {
  const { data: latestVerifiedContracts, isLoading } = useLoadLatestVerified();
  const { data: verifierRegistry } = useLoadVerifierRegistryInfo();
  const navigate = useNavigatePreserveQuery();
  const skeletons = useRef(new Array(30).fill(null).map((_) => Math.random() * 100));

  return (
    <ContractsWrapper>
      <Typography variant="h6">
        <b>Latest verified contracts</b>
      </Typography>
      <ContractsList>
        {isLoading &&
          skeletons.current.map((width: number) => (
            <Skeleton
              sx={{ borderRadius: 2 }}
              variant="rectangular"
              width={400 + width}
              height={70}></Skeleton>
          ))}
        {latestVerifiedContracts?.map((contract) => {
          const verifierName = contract.verifierId
            ? verifierRegistry?.["0x" + contract.verifierId]?.name
            : undefined;
          const verifiedDate =
            contract.timestamp && new Date(contract.timestamp * 1000).toLocaleDateString();
          return (
            <Contract
              onClick={(e) => {
                navigate(`/${contract.address}`);
              }}>
              <AddressText>{contract.address}</AddressText>
              <div style={{ display: "flex", alignItems: "center", marginTop: 6.5 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#728A9699",
                  }}>
                  {contract.mainFile}
                </Typography>
                <CompilerText>{contract.compiler}</CompilerText>
              </div>
              {verifierName || contract.verifierId || verifiedDate ? (
                <Typography sx={{ fontSize: 13, color: "#728A96", marginTop: 4 }}>
                  Verified {verifiedDate && <>on&nbsp;{verifiedDate}</>}{" "}
                  {verifierName ? (
                    <>by&nbsp;{verifierName}</>
                  ) : contract.verifierId ? (
                    <>
                      by&nbsp;
                      <CopyHash value={contract.verifierId} maxSize={18} />
                    </>
                  ) : null}
                </Typography>
              ) : null}
            </Contract>
          );
        })}
      </ContractsList>
    </ContractsWrapper>
  );
}
