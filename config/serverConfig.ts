const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

export const serverConfig = {
  oracle: {
    user: process.env.ORACLE_USER ?? '',
    password: process.env.ORACLE_PASSWORD ?? '',
    connectString: process.env.ORACLE_CONNECTION_STRING ?? '',
    poolMin: toNumber(process.env.ORACLE_POOL_MIN, 1),
    poolMax: toNumber(process.env.ORACLE_POOL_MAX, 5),
    poolIncrement: toNumber(process.env.ORACLE_POOL_INCREMENT, 1),
  },
  useMockData: toBoolean(process.env.USE_MOCK_DATA, true),
};

export const isOracleConfigured = () => {
  const { user, password, connectString } = serverConfig.oracle;
  return Boolean(user && password && connectString);
};

