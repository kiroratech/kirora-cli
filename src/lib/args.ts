import { InvalidArgumentError } from 'commander';

/**
 * Parses an option's value as a decimal number. Throws InvalidArgumentError for
 * anything else, including hex, exponents and Infinity.
 */
export function parseNumber(value: string): number {
  const number = Number(value);
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(value.trim()) || !Number.isFinite(number)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return number;
}
