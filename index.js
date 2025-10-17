import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const HF_MODEL_URL = "https://api-inference.huggingface.co/models/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated";

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "active",
    model: "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated",
    endpoint: "/api/llama"
  });
});

// Main API endpoint
app.post("/api/llama", async (req, res) => {
  try {
    const { inputs, parameters = {} } = req.body;
    
    if (!inputs) {
      return res.status(400).json({ error: "Missing 'inputs' field in request body" });
    }

    // Set default parameters
    const requestBody = {
      inputs,
      parameters: {
        max_new_tokens: parameters.max_new_tokens || 128,
        temperature: parameters.temperature || 0.7,
        top_p: parameters.top_p || 0.9,
        ...parameters
      }
    };

    // Forward request to Hugging Face with retry logic
    let attempts = 0;
    let lastError = null;
    
    while (attempts < 3) {
      try {
        const response = await fetch(HF_MODEL_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (!response.ok) {
          // Handle Hugging Face API errors
          if (response.status === 503 && result.error && result.error.includes("loading")) {
            // Model is loading, wait and retry
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
            attempts++;
            continue;
          }
          return res.status(response.status).json(result);
        }

        return res.json(result);
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
      }
    }

    // All retries failed
    return res.status(500).json({ 
      error: "Failed to connect to Hugging Face API after 3 attempts",
      details: lastError.message 
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// For local testing
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`API active on port ${PORT}`);
  });
}

export default app;

