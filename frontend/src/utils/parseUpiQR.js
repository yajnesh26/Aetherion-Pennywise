export function parseUPIQR(data) {
  try {
    const url = new URL(data);

    return {
      upi: url.searchParams.get("pa"),
      name: decodeURIComponent(url.searchParams.get("pn") || "UPI Merchant"),
    };
  } catch {
    return null;
  }
}