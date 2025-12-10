import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[]; id: string } =
    await req.json();
  const { messages, id } = body;

  console.log('id', id);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: convertToModelMessages(messages),
    onFinish: (response) => {
      console.log(response.content);
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages }) => {
      console.log(
        'Finished processing messages for chat id:',
        id,
      );
      console.log('messages', messages);
    },
  });
};
