const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const EventSource = require("eventsource");

// Polyfill EventSource for Node.js
global.EventSource = EventSource;

class MCPClientWrapper {
    constructor() {
        this.client = null;
        this.transport = null;
        this.isConnected = false;
        // FastMCP SSE endpoint (assuming default 8000 port for now)
        this.serverUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/sse";
    }

    async connect() {
        if (this.isConnected) return;

        try {
            console.log(`Connecting to AI service at ${this.serverUrl}...`);
            this.transport = new SSEClientTransport(new URL(this.serverUrl));
            this.client = new Client({
                name: "etasha-backend-client",
                version: "1.0.0"
            }, {
                capabilities: {
                    tools: {}
                }
            });

            await this.client.connect(this.transport);
            this.isConnected = true;
            console.log("Connected to AI service successfully!");
        } catch (error) {
            console.error("Failed to connect to AI service:", error.message);
            this.isConnected = false;
        }
    }

    async callTool(toolName, args) {
        if (!this.isConnected) {
            await this.connect();
        }
        
        try {
            const result = await this.client.callTool({
                name: toolName,
                arguments: args
            });
            // The result is typically an array of content blocks.
            // We expect the first block to be text containing the JSON response.
            if (result?.isError) {
                const errorText = result.content?.find((block) => block.type === "text")?.text || "AI tool failed";
                throw new Error(errorText);
            }
            if (result && result.content && result.content.length > 0) {
                const textContent = result.content[0].text;
                try {
                    return JSON.parse(textContent);
                } catch (e) {
                    return textContent; // Return raw string if not JSON
                }
            }
            return null;
        } catch (error) {
            console.error(`Error calling AI tool ${toolName}:`, error);
            throw error;
        }
    }
}

const mcpClient = new MCPClientWrapper();

module.exports = mcpClient;
