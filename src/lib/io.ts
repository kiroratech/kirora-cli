import type { Environment, Secrets } from './config.js';

/** What a command may use of the process it runs in. */
export type Io = {
  env: Environment;
  fetch?: typeof globalThis.fetch;
  /** Writes to stdout, resolving once stdout can take more: await it in a loop. */
  stdout: (text: string) => Promise<void>;
  /** Writes a body to stdout as it arrives, as fast as stdout takes it. */
  pipeStdout: (body: NonNullable<Response['body']>) => Promise<void>;
  stderr: (text: string) => void;
  readStdin: () => Promise<string>;
  /** Asks for a secret, such as an API key, without showing it. */
  readSecret: (message: string) => Promise<string>;
  /** Whether someone is at a terminal to answer prompts. */
  interactive: boolean;
  /** Asks a yes-or-no question; resolves true only for yes. */
  confirm: (message: string) => Promise<boolean>;
  secrets: Secrets;
  /**
   * Calls `handler` on Ctrl+C, or when whatever reads stdout goes away. Returns a
   * function that stops calling it.
   */
  onInterrupt: (handler: () => void) => () => void;
};

/** The flags every command accepts. */
export type GlobalFlags = { include?: boolean; workspace?: string; profile?: string };
