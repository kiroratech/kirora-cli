import type { KiroraError, KiroraResponseError } from '@kirora/node';
import { CommanderError } from 'commander';

/**
 * Every code the CLI itself puts in `{ error: { code } }`, with what it means. API
 * errors carry the API's own codes instead.
 */
export const CLI_ERROR_CODES = {
  USAGE_ERROR: 'The command couldn’t be read; nothing was sent. Exits 2.',
  NOT_LOGGED_IN: 'No saved login and no KIRORA_API_KEY.',
  PROFILE_NOT_FOUND: 'No saved profile has that name.',
  NO_ACTIVE_PROFILE: 'The active profile isn’t saved; the message lists those that are.',
  PROFILE_EXISTS: 'A profile already has the name to rename to.',
  INVALID_PROFILE_NAME: 'A profile name needs letters, digits, ".", "_" or "-".',
  KEY_NOT_FOUND: 'The keychain has no key for the profile.',
  KEY_NOT_DELETED: 'Logged out, but the key is still in the keychain; retried later.',
  KEYCHAIN_UNAVAILABLE: 'The system keychain couldn’t be read or written.',
  CONFIG_INVALID: 'The config file isn’t a set of saved logins.',
  CONFIG_LOCKED: 'Another kirora kept the config locked for too long.',
  CONFIRMATION_REQUIRED: 'A delete without --yes where no one can be asked.',
  CANCELLED: 'A delete the person at the terminal declined.',
  INVALID_RESPONSE: 'The API answered with something the CLI can’t use.',
  CONNECTION_ERROR: 'No response from the API.',
  TIMEOUT: 'The API took too long to respond.',
  DOWNLOAD_FAILED: 'A download stopped before it was complete.',
  PORT_UNAVAILABLE: 'webhooks listen couldn’t listen on its --port.',
  ALREADY_SUBSCRIBED:
    'webhooks listen: the URL already has a webhook, named in the message.',
  WEBHOOK_NOT_DELETED: 'webhooks listen stopped with its webhook still subscribed.',
  INTERRUPTED: 'webhooks listen was stopped while its webhook was being made.',
  CLI_ERROR: 'Anything else, such as a file that can’t be read.',
} as const;

export type CliErrorCode = keyof typeof CLI_ERROR_CODES;

/** A failure of the CLI's own, printed in the same shape as an API error. */
export class CliError extends Error {
  constructor(
    readonly code: CliErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CliError';
  }
}

/** Thrown by a command that has already printed why it failed, to exit 1 without printing more. */
export class ReportedFailure extends Error {
  constructor() {
    super('The command failed, and said why.');
    this.name = 'ReportedFailure';
  }
}

export function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

// The library's errors are told apart by name, so it needn't be loaded just to check.
const isNamed = (error: unknown, ...names: string[]) =>
  error instanceof Error && names.includes(error.name);

/** The library's error for an API answer that wasn't a success. */
export const isApiError = (error: unknown): error is KiroraError =>
  isNamed(error, 'KiroraError');

/**
 * Formats any error as the JSON printed to stderr: `{ error: { code, message } }`,
 * with an API error's status, field errors and request id when it has them.
 */
export function errorBody(error: unknown): string {
  if (isApiError(error)) {
    const { code, message, status, errors, details, requestId, retryAfterSeconds } =
      error;
    return json({
      error: {
        code,
        message,
        status,
        ...(errors.length > 0 && { errors }),
        details,
        requestId,
        retryAfterSeconds,
      },
    });
  }
  if (isNamed(error, 'KiroraResponseError')) {
    const { message, status, requestId } = error as KiroraResponseError;
    return cliError('INVALID_RESPONSE', message, { status, requestId });
  }
  if (isNamed(error, 'KiroraTimeoutError')) return cliError('TIMEOUT', messageOf(error));
  if (isNamed(error, 'KiroraConnectionError')) {
    return cliError('CONNECTION_ERROR', messageOf(error));
  }
  if (error instanceof CommanderError) {
    return cliError('USAGE_ERROR', error.message.replace(/^error: /, ''), {
      hint: 'Run kirora <command> --help for its arguments and flags.',
    });
  }
  if (error instanceof CliError) return cliError(error.code, error.message);
  return cliError('CLI_ERROR', messageOf(error));
}

function cliError(code: CliErrorCode, message: string, more: object = {}): string {
  return json({ error: { code, message, ...more } });
}

/**
 * Escapes control characters (`\u001b` for ESC) in text from the API, such as a
 * workspace name, so status lines printed to a terminal can't carry its escape codes.
 */
export function printable(text: string): string {
  return text.replace(
    /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
