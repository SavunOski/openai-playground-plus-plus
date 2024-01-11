# OpenAI Playground+

Play with OpenAI API's using your own API Key. Your API Key is stored and used only from your browser.

[Playground+](https://openai-playground-plus.vercel.app)

## API's

These OpenAI API's are currently supported in the playground.

- Chat Completions (including vision model)
- Images
- Files
- Assistants (Coming soon...!)
- Moderations

[OpenAI API Reference](https://platform.openai.com/docs/api-reference)

[OpenAI Docs](https://platform.openai.com/docs/overview)

## Tokenizer

Tool to help you understand how text is tokenized by a model and the total count of tokens.

Tokenizer uses [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer) npm package, which is a port of OpenAI's [tiktoken](https://github.com/openai/tiktoken).

# Run locally

Follow these steps to run the app locally.

- Install dependencies

```bash
npm install
```

- Start development server

```bash
npm run dev
```

You can access the app on http://localhost:3000

# Build

Run the following script to build the app.

```bash
npm run build
```
