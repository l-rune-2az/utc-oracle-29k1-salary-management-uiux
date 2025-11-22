declare module 'oracledb' {
  export const OUT_FORMAT_OBJECT: number;
  export let outFormat: number;

  export interface ExecuteOptions {
    autoCommit?: boolean;
  }

  export interface ExecuteResult<T = unknown> {
    rows?: T[];
    rowsAffected?: number;
  }

  export interface Connection {
    execute<T = unknown>(
      sql: string,
      bindParams?: Record<string, unknown> | unknown[],
      options?: ExecuteOptions,
    ): Promise<ExecuteResult<T>>;
    close(): Promise<void>;
  }

  export interface PoolAttributes {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(gracePeriod?: number): Promise<void>;
  }

  export function createPool(attributes: PoolAttributes): Promise<Pool>;
  export function getConnection(): Promise<Connection>;
}

