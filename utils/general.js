module.exports.getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports.encryptText = (content, secretKey) => {
	const data = Array.from(content);
	const key = Array.from(secretKey);
	for (let i = 0; i < data.length; i++) {
		data[i] = String.fromCharCode(data[i].charCodeAt(0) ^ key[i % key.length].charCodeAt(0));
	}
	return data.join('');
};