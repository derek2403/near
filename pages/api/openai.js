import supportedChains from '../../data/supportedChain.json';

const extractTransferParameters = async (content, openaiApiKey) => {
  try {
    const systemPrompt = `You are a helpful assistant that extracts transfer parameters from user messages.
    Analyze the message and extract the following parameters in a JSON format:
    {
      "originchain": "string (one of: ${supportedChains.chains.map(c => c.name).join(', ')})",
      "destchain": "string (one of: ${supportedChains.chains.map(c => c.name).join(', ')})",
      "originwallet": "string (Ethereum address starting with 0x)",
      "destwallet": "string (Ethereum address starting with 0x)",
      "amount": "number",
      "currency": "string (one of: ${supportedChains.chains.map(c => c.symbol).join(', ')})"
    }

    If you see "ETH" or similar variations, use "ETH" as the currency.
    If you see "MATIC" or similar variations, use "MATIC" as the currency.
    If any parameter is unclear or missing, set it to null.
    Only respond with the JSON object, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract transfer parameters from this message: ${content}` }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data); // Debug log

    let parameters;
    try {
      parameters = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      parameters = {
        originchain: null,
        destchain: null,
        originwallet: null,
        destwallet: null,
        amount: null,
        currency: null
      };
    }

    // Add validation and suggestions logic...
    const suggestions = {};
    
    if (parameters.currency === 'EH') {
      suggestions.currency = {
        found: 'EH',
        suggested: 'ETH'
      };
    }

    return {
      isComplete: !Object.values(parameters).includes(null),
      needsConfirmation: Object.keys(suggestions).length > 0,
      params: parameters,
      suggestions
    };

  } catch (error) {
    console.error('Error extracting parameters:', error);
    return {
      isComplete: false,
      needsConfirmation: false,
      params: {
        originchain: null,
        destchain: null,
        originwallet: null,
        destwallet: null,
        amount: null,
        currency: null
      },
      suggestions: {}
    };
  }
};

// Helper function to find closest matching chain
function findClosestChain(input) {
  let bestMatch = null;
  let highestScore = 0;

  supportedChains.chains.forEach(chain => {
    const score = Math.max(
      ...chain.aliases.map(alias => 
        calculateSimilarity(input.toLowerCase(), alias.toLowerCase())
      )
    );
    if (score > highestScore) {
      highestScore = score;
      bestMatch = chain.name;
    }
  });

  return bestMatch;
}

// Helper function to find closest matching currency
function findClosestCurrency(input) {
  let bestMatch = null;
  let highestScore = 0;

  supportedChains.chains.forEach(chain => {
    const score = calculateSimilarity(input.toLowerCase(), chain.symbol.toLowerCase());
    if (score > highestScore) {
      highestScore = score;
      bestMatch = chain.symbol;
    }
  });

  return bestMatch;
}

// Levenshtein distance for string similarity
function calculateSimilarity(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Check if it's a transfer request
  const isTransferRequest = userInput.toLowerCase().includes('transfer') || 
                           userInput.toLowerCase().includes('send');

  if (isTransferRequest) {
    const transferResult = await extractTransferParameters(userInput, OPENAI_API_KEY);
    return res.status(200).json({ 
      type: 'transfer',
      params: transferResult
    });
  }

  // Handle non-transfer requests...
  // Rest of the code remains the same
}