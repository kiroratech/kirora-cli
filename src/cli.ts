import { fileURLToPath } from 'node:url';
import { Command, CommanderError } from 'commander';
import { addAuthCommands } from './commands/auth.js';
import { addCompletion } from './commands/completion.js';
import { addDoctor } from './commands/doctor.js';
import { addResourceCommands } from './commands/resources.js';
import { addWebhooksListen } from './commands/webhooks-listen.js';
import { VERSION } from './lib/client.js';
import type { Io } from './lib/io.js';
import { errorBody, ReportedFailure } from './lib/output.js';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));

const EXAMPLES = `
Examples:
  kirora login
  kirora lists create --name VIPs
  kirora contacts list --paginate | jq -r .email
  kirora contacts identify --external-id cust_1042 --email ada@example.com
  kirora transactional send -d @message.json --idempotency-key order-1001
  kirora webhooks deliveries list
  kirora webhooks listen --url https://example.ngrok.app
  kirora campaigns --help

Credentials come from --profile or KIRORA_PROFILE, then KIRORA_API_KEY (with
KIRORA_API_URL and KIRORA_WORKSPACE), then the active login (kirora auth switch).
Logins are kept in $XDG_CONFIG_HOME/kirora/config.json (~/.config/kirora/config.json).

AI agents: read ${PACKAGE_ROOT}llms.txt first, then
${PACKAGE_ROOT}skills/kirora-cli/SKILL.md for every rule.
`;

/**
 * Runs one kirora command line and returns its exit code: 0 on success, 1 when the
 * command fails (its error printed to `io.stderr` as JSON), 2 when the command line
 * is wrong.
 */
export async function runCli(args: string[], io: Io): Promise<number> {
  try {
    await buildProgram(io).parseAsync(args, { from: 'user' });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      // Help and the version were printed as asked; help shown for a missing command
      // is text too. Anything else is a usage error, in the same shape as every failure.
      if (error.exitCode === 0) return 0;
      if (error.code !== 'commander.help') io.stderr(errorBody(error));
      return 2;
    }
    if (!(error instanceof ReportedFailure)) io.stderr(errorBody(error));
    return 1;
  }
}

function buildProgram(io: Io): Command {
  const program = new Command('kirora')
    .description('Call the Kirora API from a shell.')
    .version(VERSION, '-v, --version')
    .option('-p, --profile <name>', 'use a saved login other than the active one')
    .option('--workspace <externalId>', "a partner key's tenant")
    .option('-i, --include', 'print the HTTP status and headers before the body')
    .configureHelp({ showGlobalOptions: true })
    .configureOutput({ writeOut: io.stdout, writeErr: io.stderr, outputError: () => {} })
    .addHelpText('after', EXAMPLES)
    .exitOverride();

  addAuthCommands(program, io);
  addResourceCommands(program, io);
  addWebhooksListen(program, io);
  addDoctor(program, io);
  addCompletion(program, io);
  return program;
}
