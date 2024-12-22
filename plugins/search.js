import { bot } from '#lib';
import { pinterest, XSTRO } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';

bot(
	{
		pattern: 'lyrics',
		public: true,
		desc: 'Search Lyrics',
	},
	async (message, match) => {
		const req = match || message.reply_message?.text;
		if (!req) return message.send('_Give me song Name_');
		const res = await getJson(
			`https://itzpire.com/search/lyrics?query=${req}`,
		);
		const { title, album, thumb, lyrics } = res.data;
		const image = await getBuffer(thumb);
		return await message.send(image, {
			caption: `*${title}*\n\`\`\`${album}\n\n${lyrics}\`\`\``,
		});
	},
);

bot(
	{
		pattern: 'imdb',
		public: true,
		desc: 'Sends info of a movie or series.',
	},
	async (message, match) => {
		if (!match) return message.send('_Name a Series or movie._');
		const data = await getJson(
			`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(
				match,
			)}&plot=full`,
		);
		let imdbInfo = [
			`*Title:* ${data.Title}`,
			`*Year:* ${data.Year}`,
			`*Rated:* ${data.Rated}`,
			`*Released:* ${data.Released}`,
			`*Runtime:* ${data.Runtime}`,
			`*Genre:* ${data.Genre}`,
			`*Director:* ${data.Director}`,
			`*Writer:* ${data.Writer}`,
			`*Actors:* ${data.Actors}`,
			`*Plot:* ${data.Plot}`,
			`*Language:* ${data.Language}`,
			`*Country:* ${data.Country}`,
			`*Awards:* ${data.Awards}`,
			`*BoxOffice:* ${data.BoxOffice}`,
			`*Production:* ${data.Production}`,
			`*IMDb Rating:* ${data.imdbRating}`,
			`*IMDb Votes:* ${data.imdbVotes}`,
		].join('\n\n');
		const buff = await getBuffer(data.Poster);
		await message.send(buff, { caption: imdbInfo });
	},
);

bot(
	{
		pattern: 'weather ?(.*)',
		public: true,
		desc: 'weather info',
	},
	async (message, match) => {
		if (!match) return await message.send('*Example : weather delhi*');
		const data = await getJson(
			`http://api.openweathermap.org/data/2.5/weather?q=${match}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`,
		).catch(() => {});
		if (!data) return await message.send(`_${match} not found_`);
		const { name, timezone, sys, main, weather, visibility, wind } = data;
		const degree = [
			'N',
			'NNE',
			'NE',
			'ENE',
			'E',
			'ESE',
			'SE',
			'SSE',
			'S',
			'SSW',
			'SW',
			'WSW',
			'W',
			'WNW',
			'NW',
			'NNW',
		][Math.floor(wind.deg / 22.5 + 0.5) % 16];
		const formatTime = (timestamp, timezoneOffset) => {
			const localTime = new Date((timestamp + timezoneOffset) * 1000);
			return new Intl.DateTimeFormat('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true,
			}).format(localTime);
		};
		const sunrise = formatTime(sys.sunrise, timezone);
		const sunset = formatTime(sys.sunset, timezone);
		return await message.send(
			`*Name :* ${name}\n*Country :* ${sys.country}\n*Weather :* ${
				weather[0].description
			}\n*Temp :* ${Math.floor(
				main.temp,
			)}°\n*Feels Like :* ${Math.floor(
				main.feels_like,
			)}°\n*Humidity :* ${
				main.humidity
			}%\n*Visibility  :* ${visibility}m\n*Wind* : ${
				wind.speed
			}m/s ${degree}\n*Sunrise :* ${sunrise}\n*Sunset :* ${sunset}`,
		);
	},
);

bot(
	{
		pattern: 'define',
		public: true,
		desc: 'Define A Word',
	},
	async (message, match) => {
		if (!match) return message.send('```Provide A Word to Define```');
		const word = match.trim();
		const res = await getJson(
			`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
				word,
			)}`,
		);
		return res && res.length > 0
			? message.send(
					`\`\`\`${word}:\n${res[0]?.meanings?.[0]?.definitions?.[0]?.definition}\`\`\``,
			  )
			: message.send('```No definition found for this word.```');
	},
);

bot(
	{
		pattern: 'horo',
		public: true,
		desc: 'Gives horoscope info of user.',
	},
	async (message, match) => {
		const signs = [
			'aries',
			'taurus',
			'gemini',
			'cancer',
			'leo',
			'virgo',
			'libra',
			'scorpio',
			'sagittarius',
			'capricorn',
			'aquarius',
			'pisces',
		];
		if (!match)
			return message.send(
				'_Please provide a zodiac sign_\nValid signs: ' +
					signs.join(', '),
			);
		const sign = match.toLowerCase();
		if (!signs.includes(sign))
			return message.send(
				'_Invalid zodiac sign_\nValid signs: ' + signs.join(', '),
			);

		const res = await getJson(
			`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=TODAY`,
		);
		const { date, horoscope_data } = res.data;
		return message.send(
			`*Date:* ${date}\n*Horoscope:* ${horoscope_data}`,
		);
	},
);

bot(
	{
		pattern: 'google',
		public: true,
		desc: 'Perform Google Search',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide Search Query_');
		const res = await XSTRO.google(match);
		return message.send(`\`\`\`${res}\`\`\``);
	},
);

bot(
	{
		pattern: 'wallpaper',
		public: true,
		desc: 'Get Wallpapers',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me something to search for_');

		const res = await XSTRO.wallpaper(match);
		for (const item of res) {
			if (item.image) {
				await message.send(item.image);
			}
		}
	},
);

bot(
	{
		pattern: 'wikipedia',
		public: true,
		desc: 'Search wikipedia for information',
	},
	async (message, match) => {
		if (!match) return message.send('_Search a term like elon musk_');
		const res = await XSTRO.wikipedia(match);
		const { title, extract } = res;
		return await message.send(`\`\`\`${title}:\n\n${extract}\`\`\``);
	},
);

bot(
	{
		pattern: 'pinterest',
		public: true,
		desc: 'Search images from Pinterest',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me something to search for_');
		const res = await pinterest(match);
		return await message.send(res.url);
	},
);

bot(
	{
		pattern: 'bing',
		public: true,
		desc: 'Search Bing',
	},
	async (message, match) => {
		if (!match) return message.send('_Give Me Query_');
		const results = await XSTRO.bing(match);
		const data = results
			.map(
				(item, index) =>
					`${index + 1}. *${item.title}*\n${item.description}\n${
						item.link
					}`,
			)
			.join('\n\n');
		return await message.send(`*Search Results:*\n\n${data}`);
	},
);

bot(
	{
		pattern: 'technews',
		public: true,
		desc: 'Get Tech latest news',
	},
	async (message, match) => {
		const news = await XSTRO.news();
		if (!news?.length) return message.send('No news found');
		const formattedNews = news
			.map(
				(article, index) =>
					`*${index + 1}. ${article.title}*\n${
						article.description || ''
					}\n${article.link}`,
			)
			.join('\n\n');
		return message.send(`*Latest Tech News:*\n\n${formattedNews}`);
	},
);
