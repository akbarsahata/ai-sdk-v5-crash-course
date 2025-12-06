import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const output = streamText({
  model: google('gemini-2.0-flash-lite'),
  prompt: `ada berapa macam jenis pempek dan berasal dari mana saja? jelaskan secara ringkas`,
});

const tokenizer = new Tiktoken(o200k_base);

for await (const chunk of output.textStream) {
  process.stdout.write(chunk);
}

const outputText = await output.text;

console.log(); // Empty log to separate the output from the usage

// TODO: Print the usage to the console
const usage = await output.usage;
console.log('Usage:', usage);
const inputTokens = tokenizer.encode(
  `ada berapa macam jenis pempek dan berasal dari mana saja? jelaskan secara ringkas`,
);
console.log('Input tokens:');
console.dir(inputTokens, { depth: null, maxArrayLength: 20 });
console.log('Output tokens:');
const outputTokens = tokenizer.encode(outputText);
console.dir(outputTokens, { depth: null, maxArrayLength: 20 });
console.log(
  'Input token count (from usage):',
  usage.inputTokens,
);
console.log(
  'Output token count (from usage):',
  usage.outputTokens,
);
