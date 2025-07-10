// src/inngest/functions.ts
import { z } from "zod";
import { openai, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "test/code.agent" },
    async ({ event, step }) => {

        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-test-tmp");
            return sandbox.sandboxId;
        });
        
        const codeAgent = createAgent({
            name: "code-agent",
            description: "An expert coding agent",
            system: PROMPT,
            model: openai({ 
                model: "gpt-4-turbo",
                defaultParameters: {
                    temperature: 0.1,
                }
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use the terminal to run commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }) => {
                        console.log(`--- Running command: ${command}`);
                        const sandbox = await getSandbox(sandboxId);
                        const result = await sandbox.commands.run(command);
                        console.log(`--- Command stdout: ${result.stdout}`);
                        return result.stdout;
                    },
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the sandbox",
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string(),
                            }),
                        ),
                    }),
                    handler: async ({ files }, { network }) => {
                        console.log(`--- Writing ${files.length} files`);
                        const updatedFiles = network.state.data.files || {};
                        const sandbox = await getSandbox(sandboxId);
                        for (const file of files) {
                            await sandbox.files.write(file.path, file.content);
                            updatedFiles[file.path] = file.content;
                        }
                        network.state.data.files = updatedFiles;
                        return `Successfully wrote ${files.length} files.`;
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Read files from the sandbox",
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async({ files }, { step }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file)
                                    contents.push({ path: file, content});
                                }
                                return JSON.stringify(contents);
                            } catch (e) {
                                return "Error reading files: " + e;
                            }
                        })
                    },
                })
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText = 
                        lastAssistantTextMessageContent(result);
                    
                        if (lastAssistantMessageText && network){
                            if (lastAssistantMessageText.includes("<task_summary>")){
                                network.state.data.summary = lastAssistantMessageText;
                            }
                        }
                    return result;
                },
            },
        });

        const network = createNetwork({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            router: async ({ network }) => {
                const summary = network.state.data.summary;

                if (summary) {
                    return;
                }

                return codeAgent;
            },
        });
        
        const result = await step.run("run-code-agent", () => {
            return network.run(event.data.value);
        });

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);

            return `https://${host}`;
        });

        return { 
            url: sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary,
        };
    },
);
