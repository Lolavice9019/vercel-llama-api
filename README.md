# Vercel Llama 3.1 8B Instruct Abliterated API

HTTP endpoint deployed on Vercel that proxies requests to the Hugging Face API for the `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated` model.

## Features

- **Zero local RAM consumption** - All inference runs on Hugging Face infrastructure
- **Automatic retry logic** - Up to 3 attempts with exponential backoff
- **Model loading handling** - Waits for cold-start model loading
- **Production-ready** - Environment-based authentication and error handling

## Endpoints

### GET `/`
Health check endpoint that returns API status.

**Response:**
```json
{
  "status": "active",
  "model": "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated",
  "endpoint": "/api/llama"
}
```

### POST `/api/llama`
Main inference endpoint.

**Request:**
```json
{
  "inputs": "Your prompt text here",
  "parameters": {
    "max_new_tokens": 128,
    "temperature": 0.7,
    "top_p": 0.9
  }
}
```

**Response:**
```json
[
  {
    "generated_text": "Model response here..."
  }
]
```

## Environment Variables

- `HF_API_TOKEN` - Your Hugging Face API token (required)

## Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variable: `vercel env add HF_API_TOKEN`
3. Deploy: `vercel deploy --prod`

## Testing

```bash
curl -X POST https://your-deployment.vercel.app/api/llama \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": "What is the capital of France?",
    "parameters": {
      "max_new_tokens": 128
    }
  }'
```

## Model Information

- **Model**: mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- **Source**: Hugging Face Inference API
- **Expected latency**: < 3 seconds

