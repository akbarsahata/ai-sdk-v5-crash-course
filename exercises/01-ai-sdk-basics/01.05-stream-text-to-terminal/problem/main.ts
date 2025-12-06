import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

const model = google('gemini-2.0-flash');

const prompt =
  'Write me a 5 to 10 minutes islamic talk about being financially independent for college students';

const stream = streamText({
  model,
  prompt,
}); // TODO - stream some text with the model above.

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
