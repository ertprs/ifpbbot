module.exports = function (list = []) {
	return list[Math.floor(Math.random() * list.length)]
}