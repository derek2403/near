export default async function handler(req, res) {
  if (!process.env.NEARBLOCKS_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { accountId } = req.query;

  try {
    const response = await fetch(
      `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns?page=1&per_page=5&order=desc`,
      {
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${process.env.NEARBLOCKS_API_KEY}`
        }
      }
    );

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
} 