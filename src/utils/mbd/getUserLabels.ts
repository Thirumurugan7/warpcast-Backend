const axios = require('axios');

export const getUserLabels = async (userId: string) => {
  const url = 'https://api.mbd.xyz/v1/farcaster/casts/feed/for-you';
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-api-key': 'mbd-1e4d8dd37944abfd650de2c3cd8a2d39cda43e1b607041ba3939350e84faa736'
  };

  const data = {
    user_id: '3',
    return_metadata: true
  };

  // try {
  //   const response = await axios.post(url, data, { headers });

  //   console.log("response",response.data.body);
    
  //   // Initialize an array to store items sorted by score
  //   const sortedItems = [...response.data.body].sort((a, b) => b.score - a.score);

  //   // Get top 3 items by score
  //   const topItems = sortedItems.slice(0, 3);

  //   // Extract item_ids for top items
  //   const topItemIds = topItems.map(item => ({
  //     item_id: item.item_id,
  //     score: item.score,
  //     labels: item.metadata.ai_labels.topics
  //   }));

  //   console.log('Top 3 Items by Score:', topItemIds);
    
  //   return topItemIds;
  // } catch (error:any) {
  //   console.error('Error:', error);
  //   if (axios.isAxiosError(error)) {
  //     throw new Error(`Failed to fetch user labels: ${error.message}`);
  //   }
  //   throw new Error('Failed to fetch user labels.');
  // }

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Response:', response.data);

    // Initialize an array to store unique top topics
    const topTopics = [];

    // Initialize a set to track added topics
    const addedTopics = new Set();

    // Loop through the items in the response body
    for (let item of response.data.body) {
      // Check if the current item has topics and add unique topics to the array
      if (item.metadata.ai_labels.topics.length > 0) {
        for (let topic of item.metadata.ai_labels.topics) {
          if (!addedTopics.has(topic)) {
            topTopics.push(topic);
            addedTopics.add(topic);
          }

          // Break if we have collected 3 topics
          if (topTopics.length >= 3) {
            break;
          }
        }
      }

      // Break the loop if we have collected 3 topics
      if (topTopics.length >= 3) {
        break;
      }
    }

    console.log('Top 3 Unique Topics:', topTopics);

    return topTopics; // Return top topics array if needed
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch user labels.');
  }
}