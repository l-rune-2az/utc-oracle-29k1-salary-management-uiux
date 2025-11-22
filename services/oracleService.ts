import type { Connection } from 'oracledb';
import { getOracleConnection, isOracleConfigured } from '@/lib/oracle';

type OracleBindParams = Record<string, unknown> | unknown[];

interface OracleExecuteOptions {
  autoCommit?: boolean;
}

async function withConnection<T>(handler: (connection: Connection) => Promise<T>): Promise<T> {
  const connection = await getOracleConnection();
  try {
    return await handler(connection);
  } finally {
    await connection.close();
  }
}

export class OracleService {
  static ensureConfigured() {
    if (!isOracleConfigured()) {
      throw new Error('Oracle connection is not configured. Please set the ORACLE_* environment variables.');
    }
  }

  static async select<T = Record<string, unknown>>(
    sql: string,
    bindParams: OracleBindParams = {},
  ): Promise<T[]> {
    this.ensureConfigured();
    return withConnection(async (connection) => {
      const result = await connection.execute<T>(sql, bindParams);
      return (result.rows ?? []) as T[];
    });
  }

  static async insert(
    sql: string,
    bindParams: OracleBindParams = {},
    options: OracleExecuteOptions = { autoCommit: true },
  ) {
    this.ensureConfigured();
    return withConnection(async (connection) => {
      const result = await connection.execute(sql, bindParams, {
        autoCommit: options.autoCommit,
      });
      return result.rowsAffected ?? 0;
    });
  }

  static async update(
    sql: string,
    bindParams: OracleBindParams = {},
    options: OracleExecuteOptions = { autoCommit: true },
  ) {
    return this.insert(sql, bindParams, options);
  }

  static async delete(
    sql: string,
    bindParams: OracleBindParams = {},
    options: OracleExecuteOptions = { autoCommit: true },
  ) {
    return this.insert(sql, bindParams, options);
  }
}

