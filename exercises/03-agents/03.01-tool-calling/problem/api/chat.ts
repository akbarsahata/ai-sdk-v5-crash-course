import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import * as fsTools from "./file-system-functionality.ts"
import z from 'zod';


export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: convertToModelMessages(messages),
    system: `
      You are a helpful assistant that can use a sandboxed file system to create, edit and delete files.

      You have access to the following tools:
      - writeFile
      - readFile
      - deletePath
      - listDirectory
      - createDirectory
      - exists
      - searchFiles

      Use these tools to record notes, create todo lists, and edit documents for the user.

      Use markdown files to store information.
    `,
    tools: {
      writeFile: tool({
        description: 'Writes a file to the sandboxed file system. ' +
          'Takes a file path and the file contents as input. ' +
          'If the file already exists, it will be overwritten.',
        inputSchema: z.object({
          filePath: z.string().describe('The path to the file to write.'),
          content: z.string().describe('The contents to write to the file.'),
        }),
        execute: async ({ filePath, content }) => {
          console.log(`Writing file at ${filePath} with content length ${content.length}`);
          return fsTools.writeFile(filePath, content);
        },
      }),
      readFile: tool({
        description: 'Reads the contents of a file from the sandboxed file system. ' +
          'Takes a file path as input and returns the file contents.',
        inputSchema: z.object({
          filePath: z.string().describe('The path to the file to read.'),
        }),
        execute: async ({ filePath }) => {
          return fsTools.readFile(filePath);
        },
      }),
      deletePath: tool({
        description: 'Deletes a file or directory from the sandboxed file system. ' +
          'Takes a file or directory path as input. ' +
          'If it is a directory, it will be deleted recursively.',
        inputSchema: z.object({
          pathToDelete: z.string().describe('The path to the file or directory to delete.'),
        }),
        execute: async ({ pathToDelete }) => {
          return fsTools.deletePath(pathToDelete);
        },
      }),
      listDirectory: tool({
        description: 'Lists the contents of a directory in the sandboxed file system. ' +
          'Takes a directory path as input and returns an array of items with their names, types, and sizes.',
        inputSchema: z.object({
          dirPath: z.string().describe('The path to the directory to list. Defaults to "." (current directory).').default('.'),
        }),
        execute: async ({ dirPath }) => {
          return fsTools.listDirectory(dirPath);
        },
      }),
      createDirectory: tool({
        description: 'Creates a new directory in the sandboxed file system. ' +
          'Takes a directory path as input. ' +
          'Creates parent directories recursively if they do not exist.',
        inputSchema: z.object({
          dirPath: z.string().describe('The path to the directory to create.'),
        }),
        execute: async ({ dirPath }) => {
          return fsTools.createDirectory(dirPath);
        },
      }),
      exists: tool({
        description: 'Checks if a file or directory exists in the sandboxed file system. ' +
          'Takes a path as input and returns whether it exists.',
        inputSchema: z.object({
          pathToCheck: z.string().describe('The path to check for existence.'),
        }),
        execute: async ({ pathToCheck }) => {
          return fsTools.exists(pathToCheck);
        },
      }),
      searchFiles: tool({
        description: 'Searches for files matching a pattern in the sandboxed file system. ' +
          'Supports wildcard (*) pattern matching. ' +
          'Searches recursively from the specified directory.',
        inputSchema: z.object({
          pattern: z.string().describe('The pattern to search for (supports * wildcard).'),
          searchDir: z.string().describe('The directory to start searching from. Defaults to "." (current directory).').default('.'),
        }),
        execute: async ({ pattern, searchDir }) => {
          return fsTools.searchFiles(pattern, searchDir);
        },
      }),
    },
    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse();
};
