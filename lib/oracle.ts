import type { Connection, Pool } from 'oracledb';
import { serverConfig, isOracleConfigured } from '@/config/serverConfig';

let oracleLib: typeof import('oracledb') | null = null;
let oraclePool: Pool | null = null;

async function getOracleLib() {
  if (!oracleLib) {
    const module = await import('oracledb');
    oracleLib = module.default ?? module;
    oracleLib.outFormat = oracleLib.OUT_FORMAT_OBJECT;
  }
  return oracleLib;
}

export async function initOraclePool(): Promise<Pool> {
  if (!isOracleConfigured()) {
    throw new Error('Oracle credentials are missing. Please set ORACLE_* environment variables.');
  }

  if (oraclePool) {
    return oraclePool;
  }

  const oracledb = await getOracleLib();
  oraclePool = await oracledb.createPool({
    user: serverConfig.oracle.user,
    password: serverConfig.oracle.password,
    connectString: serverConfig.oracle.connectString,
    poolMin: serverConfig.oracle.poolMin,
    poolMax: serverConfig.oracle.poolMax,
    poolIncrement: serverConfig.oracle.poolIncrement,
  });

  return oraclePool;
}

export async function getOracleConnection(): Promise<Connection> {
  const pool = oraclePool ?? (await initOraclePool());
  return pool.getConnection();
}

export async function closeOraclePool() {
  if (oraclePool) {
    await oraclePool.close(10);
    oraclePool = null;
  }
}

export { isOracleConfigured };