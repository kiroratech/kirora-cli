import { Argument, type Command, type Option } from 'commander';
import type { Io } from '../lib/io.js';
import { DEFAULT_ACTION } from './resources.js';
import { json } from '../lib/output.js';

type CommandNode = {
  name: string;
  aliases?: string[];
  description: string;
  arguments?: { name: string; required: boolean }[];
  options?: { flags: string; description: string; choices?: string[] }[];
  commands?: CommandNode[];
};

const SCRIPTS = {
  bash: `_kirora() {
  local IFS=$'\\n'
  COMPREPLY=($(kirora __complete -- "\${COMP_WORDS[@]:1:COMP_CWORD}" 2>/dev/null))
}
complete -o default -F _kirora kirora
`,
  zsh: `#compdef kirora
_kirora() {
  local -a candidates
  candidates=("\${(@f)$(kirora __complete -- "\${(@)words[2,CURRENT]}" 2>/dev/null)}")
  compadd -a candidates
}
compdef _kirora kirora
`,
  fish: `complete -c kirora -f -a '(kirora __complete -- (commandline -opc)[2..-1] (commandline -ct))'
`,
};
type Shell = keyof typeof SCRIPTS;

/**
 * Adds `commands`, `completion`, and the hidden `__complete` that the completion
 * scripts call, to `program`.
 */
export function addCompletion(program: Command, io: Io): void {
  program
    .command('commands')
    .description('print every command, with its arguments and options, as JSON')
    .action(() => io.stdout(json(commandTree(program))));
  program
    .command('completion')
    .description('print a shell completion script')
    .addArgument(new Argument('<shell>').choices(Object.keys(SCRIPTS)))
    .addHelpText(
      'after',
      `
Examples:
  echo 'source <(kirora completion bash)' >> ~/.bashrc
  echo 'source <(kirora completion zsh)' >> ~/.zshrc     # after compinit
  kirora completion fish > ~/.config/fish/completions/kirora.fish
`,
    )
    .action((shell: Shell) => io.stdout(SCRIPTS[shell]));
  program
    .command('__complete', { hidden: true })
    .argument('[words...]')
    .action((words: string[]) => {
      const candidates = complete(program, words);
      if (candidates.length > 0) io.stdout(`${candidates.join('\n')}\n`);
    });
}

function commandTree(command: Command): CommandNode {
  const options = command
    .createHelp()
    .visibleOptions(command)
    .map((option) => ({
      flags: option.flags,
      description: option.description,
      ...(option.argChoices && { choices: option.argChoices }),
    }));
  const commands = visibleCommands(command).map(commandTree);
  return {
    name: command.name(),
    ...(command.aliases().length > 0 && { aliases: command.aliases() }),
    description: command.description(),
    ...(command.registeredArguments.length > 0 && {
      arguments: command.registeredArguments.map((argument) => ({
        name: argument.name(),
        required: argument.required,
      })),
    }),
    ...(options.length > 0 && { options }),
    ...(commands.length > 0 && { commands }),
  };
}

function complete(program: Command, words: string[]): string[] {
  const typed = words.slice(0, -1);
  const partial = words.at(-1) ?? '';
  let command = program;
  let pending: Option | undefined;
  for (const word of typed) {
    if (pending) {
      pending = undefined;
      continue;
    }
    if (word.startsWith('-')) {
      const option = findOption(command, word);
      if (option && (option.required || option.optional) && !word.includes('=')) {
        pending = option;
      }
      continue;
    }
    const next = visibleCommands(command).find(
      (sub) => sub.name() === word || sub.aliases().includes(word),
    );
    if (next) command = next;
  }

  // `kirora lists --limit 5` runs `lists list`, a group's default, so its flags count.
  const listing = visibleCommands(command).find((sub) => sub.name() === DEFAULT_ACTION);
  const flags = [...optionsInScope(command), ...(listing ? listing.options : [])]
    .filter((option) => !option.hidden)
    .flatMap((option) => [option.long, option.short])
    .filter((flag): flag is string => !!flag);
  const candidates = pending
    ? (pending.argChoices ?? [])
    : partial.startsWith('-')
      ? [...new Set(flags)]
      : visibleCommands(command).map((sub) => sub.name());
  return candidates.filter((candidate) => candidate.startsWith(partial));
}

function visibleCommands(command: Command): Command[] {
  return command
    .createHelp()
    .visibleCommands(command)
    .filter((sub) => sub.name() !== 'help');
}

function optionsInScope(command: Command): Option[] {
  const help = command.createHelp();
  return [...help.visibleOptions(command), ...help.visibleGlobalOptions(command)];
}

function findOption(command: Command, word: string): Option | undefined {
  const flag = word.split('=')[0];
  for (let each: Command | null = command; each; each = each.parent) {
    const found = each.options.find(
      (option) => option.long === flag || option.short === flag,
    );
    if (found) return found;
  }
  return undefined;
}
