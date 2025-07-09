import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {

        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-test-tmp");
            return sandbox.sandboxId;
        });
        
        const codeAgent = createAgent({
            name: "code-agent",
            system: "You are an expert next.js developer. you write readable, maintainable code You write simple NextDataPathnameNormalizer.js & React snippets"
            ,
            model: openai({ model: "gpt-4o"}),
        });

        const { output } = await codeAgent.run(
            `Write the following snippet: ${event.data.value}`,
        );

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);

            return `https://${host}`;
        });
        
        console.log(output)

        return { output, sandboxUrl };
    },
);
