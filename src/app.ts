import express from 'express';
import cors from 'cors';
import OpenAI from "openai";

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

app.post('/api/data', async (req, res) => {
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

  console.log(response.output_text);
  

  // save user message and assistant response into a database

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