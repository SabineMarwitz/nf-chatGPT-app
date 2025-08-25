import express from 'express';
import cors from 'cors';
import OpenAI from "openai";
import {closeDB, connectDB, getDB, getAllChatEntries } from "./db/database";

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB().then(() => {

  // provide an endpoint for the frontend to fetch the full conversation
  // tbd: return the full conversation in the right format
  app.get('/history', async(req, res) => {
    const data = await getAllChatEntries();
    console.log(data);
  });
  
  app.post('/chat', async (req, res) => {
    
    // accept user message
    const requestData = req.body;
    console.log('Received JSON:', requestData);
    console.log();
    
    // call ChatGPT
    const response = await client.responses.create({
      model: 'gpt-5-nano',
      instructions: 'You are a helpful tutor', 
      input: requestData.question,
    });
    
    // save user message and assistant response into a database
    const db = getDB();
    db.run(`INSERT INTO chat_entries (question, answer) VALUES (?, ?);`, 
    requestData.question, response.output_text);
    
    // return assistant response as JSON
    res.json({ 
      User: requestData.question, 
      Assistant: response.output_text
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(
      `Open http://localhost:${PORT} in your browser.`
    );
  });
}).catch((error: Error) => {
  console.error("Failed to start Ddatabase server");
});  

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing database connection...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing database connection...");
  await closeDB();
  process.exit(0);
});
