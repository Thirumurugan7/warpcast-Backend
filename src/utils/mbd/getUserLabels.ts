const axios = require('axios');

export const getUserLabels = async (userId: string) => {
  const url = 'https://api.mbd.xyz/v1/farcaster/casts/feed/for-you';
  const headers = {
    'HTTP-Referer': 'https://docs.mbd.xyz/',
    'X-Title': 'mbd_docs',
    'accept': 'application/json',
    'content-type': 'application/json',
    'x-api-key': 'mbd-1e4d8dd37944abfd650de2c3cd8a2d39cda43e1b607041ba3939350e84faa736',
  };

  const data = {
    user_id: userId,
    return_ai_labels: true,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Initialize an array to store items sorted by score
    const sortedItems = [...response.data.body].sort((a, b) => b.score - a.score);

    // Get top 3 items by score
    const topItems = sortedItems.slice(0, 3);

    // Extract item_ids for top items
    const topItemIds = topItems.map(item => ({
      item_id: item.item_id,
      score: item.score
    }));

    console.log('Top 3 Items by Score:', topItemIds);

    // If you need to fetch additional data about these items (like topics),
    // you would need to make additional API calls here
    
    return topItemIds;
  } catch (error:any) {
    console.error('Error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch user labels: ${error.message}`);
    }
    throw new Error('Failed to fetch user labels.');
  }
}