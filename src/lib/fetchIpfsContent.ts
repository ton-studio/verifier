export async function fetchIpfsContent(hash: string): Promise<{ response: Response; url: string }> {
  const primaryUrl = `https://ipfs.ton.org/ipfs/${hash}`;
  const secondaryUrl = `https://files.orbs.network/ipfs/${hash}`;
  const fallbackUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;

  const primaryResponse = await fetch(primaryUrl);
  if (primaryResponse.status !== 403 && primaryResponse.status < 500) {
    return { response: primaryResponse, url: primaryUrl };
  }

  const secondaryResponse = await fetch(secondaryUrl);
  if (secondaryResponse.status !== 403 && secondaryResponse.status < 500) {
    return { response: secondaryResponse, url: secondaryUrl };
  }

  return { response: await fetch(fallbackUrl), url: fallbackUrl };
}
