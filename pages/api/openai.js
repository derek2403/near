import supportedChains from '../../data/supportedChain.json';

// Helper function to handle common typos and find closest matches
function findClosestMatch(input, type = 'chain') {
  if (!input) return null;
  
  const inputLower = input.toLowerCase();
  let matches = [];

  supportedChains.chains.forEach(chain => {
    if (type === 'chain') {
      // Check exact matches first
      if (chain.name.toLowerCase() === inputLower || 
          chain.aliases.includes(inputLower)) {
        matches.push({ name: chain.name, score: 1 });
        return;
      }

      // Check similarity with chain name
      const nameScore = calculateSimilarity(inputLower, chain.name.toLowerCase());
      
      // Check similarity with aliases
      const aliasScores = chain.aliases.map(alias => ({
        score: calculateSimilarity(inputLower, alias.toLowerCase()),
        name: chain.name
      }));

      matches.push({ name: chain.name, score: nameScore });
      matches.push(...aliasScores);

    } else if (type === 'currency') {
      // Check exact matches first
      if (chain.symbol.toLowerCase() === inputLower) {
        matches.push({ name: chain.symbol, score: 1 });
        return;
      }

      const score = calculateSimilarity(inputLower, chain.symbol.toLowerCase());
      matches.push({ name: chain.symbol, score });
    }
  });

  // Sort matches by score and get the best match
  matches.sort((a, b) => b.score - a.score);
  const bestMatch = matches[0];

  if (!bestMatch || bestMatch.score < 0.6) {
    return null;
  }

  return {
    match: bestMatch.name,
    score: bestMatch.score,
    needsConfirmation: bestMatch.score < 0.9
  };
}

const extractTransferParameters = async (content, openaiApiKey) => {
  try {
    const systemPrompt = `You are a helpful assistant that extracts transfer parameters from user messages.
    Analyze the message and extract ONLY the following parameters in a JSON format:
    {
      "amount": "number (the amount to transfer)",
      "currency": "string (one of: ${supportedChains.chains.map(c => c.symbol).join(', ')})",
      "destchain": "string (one of: ${supportedChains.chains.map(c => c.name).join(', ')})",
      "destwallet": "string (Ethereum address starting with 0x)"
    }

    Valid chains and their aliases:
    ${supportedChains.chains.map(c => 
      `${c.name}: ${[c.name.toLowerCase(), ...c.aliases].join(', ')}`
    ).join('\n')}

    Valid currencies: ${supportedChains.chains.map(c => c.symbol).join(', ')}

    If you see a typo or similar word, match it to the closest valid value.
    If any parameter is unclear or missing, set it to null.`;

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
    
    // Check if the API response is valid
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid API response structure');
    }

    let parameters;
    try {
      parameters = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      parameters = {
        amount: null,
        currency: null,
        destchain: null,
        destwallet: null
      };
    }

    // Process the parameters
    const suggestions = {};
    const processedParams = { ...parameters };

    // Check destination chain
    if (parameters.destchain) {
      const chainMatch = findClosestMatch(parameters.destchain, 'chain');
      if (chainMatch && chainMatch.needsConfirmation) {
        suggestions.destChain = {
          found: parameters.destchain,
          suggested: chainMatch.match,
          confidence: Math.round(chainMatch.score * 100) + '%'
        };
        processedParams.destchain = chainMatch.match;
      }
    }

    // Check currency
    if (parameters.currency) {
      const currencyMatch = findClosestMatch(parameters.currency, 'currency');
      if (currencyMatch && currencyMatch.needsConfirmation) {
        suggestions.currency = {
          found: parameters.currency,
          suggested: currencyMatch.match,
          confidence: Math.round(currencyMatch.score * 100) + '%'
        };
        processedParams.currency = currencyMatch.match;
      }
    }

    return {
      isComplete: !Object.values(processedParams).includes(null),
      needsConfirmation: Object.keys(suggestions).length > 0,
      params: processedParams,
      suggestions
    };

  } catch (error) {
    console.error('Error extracting parameters:', error);
    return {
      isComplete: false,
      needsConfirmation: false,
      params: {
        amount: null,
        currency: null,
        destchain: null,
        destwallet: null
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