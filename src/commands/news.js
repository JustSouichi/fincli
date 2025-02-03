const yahooFinance = require('yahoo-finance2').default;

async function getNews(ticker) {
  try {
    const result = await yahooFinance.search(ticker);
    const news = result.news;
    if (!news || news.length === 0) {
      console.log('No news available for this ticker.');
      return;
    }
    news.slice(0, 5).forEach((article, index) => {
      console.log(`Article ${index + 1}:`);
      console.log(`Title: ${article.title}`);
      console.log(`Link: ${article.link}`);
      console.log(`Publish Time: ${article.provider_publish_time ? new Date(article.provider_publish_time * 1000).toLocaleString() : 'N/A'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching news:', error.message);
  }
}

module.exports = { getNews };
