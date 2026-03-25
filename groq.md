Create a new project or connect your existing project

To create a new project, execute create-next-app with npm, yarn, or pnpm to bootstrap the repo and run:


npx create-next-app my-groq-app
# or
yarn create next-app my-groq-app
# or
pnpm create next-app my-groq-app
To connect your existing project(s), click "Connect Project" and run vercel link in your CLI to link to the project locally.

2

Pull your latest environment variables

Run vercel env pull .env.development.local to make the latest environment variables available to your project locally.

3

Install the SDK

Add the Groq SDK to your project:


npm install groq-sdk
# or
yarn add groq-sdk
# or
pnpm add groq-sdk
4

Create (or edit) your project API route

Create an API route in your Next.js project at pages/api/groq-test.js:


import { Groq } from 'groq-sdk';

export default async function handler(req, res) {
  const groq = new Groq({ apiKey: process.env.YOUR_SECRET });
  
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Hello from Vercel!" }
      ]
    });
    
    res.status(200).json({ message: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}