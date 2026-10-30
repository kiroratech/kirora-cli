import { describe, expect, it } from 'vitest';
import { run, secretService } from '../src/lib/secrets.js';

describe('keychain commands', () => {
  /** The Secret Service, with secret-tool answering every command the same way. */
  const answering = (code: number | null, stderr = '') =>
    secretService(async () => ({ code, stdout: '', stderr }));

  it('reports a command that exits without reading the key, rather than crashing', async () => {
    const result = await run(
      process.execPath,
      ['-e', 'process.exit(3)'],
      // More than a pipe holds, so writing it fails once the command has exited.
      'k'.repeat(4_000_000),
    );

    expect(result.code).toBe(3);
  });

  it('tells a missing command from one that runs and fails, as keychain detection needs', async () => {
    expect((await run('kirora-no-such-command', [])).code).toBeNull();
    expect((await run(process.execPath, ['-e', 'process.exit(2)'])).code).toBe(2);
  });

  it("tells a key that isn't saved from a keyring that can't be read", async () => {
    expect(await answering(1).get('default.1')).toBeUndefined();
    await expect(
      answering(1, 'Cannot autolaunch D-Bus').get('default.1'),
    ).rejects.toMatchObject({
      code: 'KEYCHAIN_UNAVAILABLE',
    });
    await expect(answering(null).get('default.1')).rejects.toMatchObject({
      code: 'KEYCHAIN_UNAVAILABLE',
    });
  });

  it("fails a delete the keyring refuses, and passes one that's already gone", async () => {
    await expect(answering(1).delete('default.1')).resolves.toBeUndefined();
    await expect(
      answering(2, 'keyring unavailable').delete('default.1'),
    ).rejects.toMatchObject({
      code: 'KEYCHAIN_UNAVAILABLE',
    });
  });
});
