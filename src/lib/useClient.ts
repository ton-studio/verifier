import { Address, TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useEffect, useMemo, useState } from "react";
import { useIsTestnet } from "../components/TestnetBar";
import { useQuery } from "@tanstack/react-query";
import { is } from "immer/dist/utils/common";

export function useSourcesRegistryAddress() {
  const isTestnet = useIsTestnet();
  return useMemo(() => {
    return Address.parse(
      isTestnet
        ? import.meta.env.VITE_SOURCES_REGISTRY_TESTNET
        : import.meta.env.VITE_SOURCES_REGISTRY,
    );
  }, [isTestnet]);
}

export function useClient() {
  const isTestnet = useIsTestnet();
  const { data, isLoading, error } = useQuery(["getHttpEndpoint", isTestnet], async () =>
    getHttpEndpoint({ network: isTestnet ? "testnet" : "mainnet" }),
  );
  const client = useMemo(() => {
    return data ? new TonClient({ endpoint: data }) : null;
  }, [data]);

  if (!isLoading && !data) {
    throw error;
  }
  return client;
}
