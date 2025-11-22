const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  timeoutMs: toNumber(process.env.NEXT_PUBLIC_API_TIMEOUT, 15000),
};

