#!/usr/bin/env node
// Prints the one-click MCP install links for Cursor and VS Code.
//   node scripts/install-links.mjs [server-url]   (default: production)
const url = process.argv[2] ?? 'https://api.jule.ai/mcp';
const name = 'jule';
const cursor = `cursor://anysphere.cursor-deeplink/mcp/install?name=${name}&config=${Buffer.from(JSON.stringify({ url })).toString('base64')}`;
const vscode = `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name, type: 'http', url }))}`;
console.log(`Cursor:   ${cursor}\nVS Code:  ${vscode}\nInsiders: ${vscode.replace('vscode:', 'vscode-insiders:')}`);
