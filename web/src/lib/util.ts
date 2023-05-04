export const capitalize = (s: String) => s[0].toUpperCase() + s.slice(1)

export const formConverter = (obj: Object): { [key: string]: any } => {
	Object.keys(obj)
		.filter((key) => key.includes('-'))
		.forEach((key) => {
			const newKey = key
				.split('-')
				.map((e, i) => (i ? e[0].toUpperCase() + e.slice(1) : e))
				.join('')

			obj[newKey] = obj[key]
			delete obj[key]
		})
	return obj
}
