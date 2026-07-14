const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function search() {
  const logPath = path.join('C:', 'Users', 'andre', '.gemini', 'antigravity', 'brain', '6d5b390a-3094-4bf6-a02e-d2c1cafe9ed3', '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) {
    console.log("Log path does not exist:", logPath);
    return;
  }

  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching steps 200 to 270...");
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 200 && obj.step_index <= 270) {
        if (obj.type === 'USER_INPUT' || (obj.type === 'PLANNER_RESPONSE' && obj.content && obj.content.length < 1500)) {
          console.log(`[Step ${obj.step_index}] ${obj.source}: ${obj.content || JSON.stringify(obj.tool_calls)}`);
        }
      }
    } catch (err) {
      // skip
    }
  }
}

search();
