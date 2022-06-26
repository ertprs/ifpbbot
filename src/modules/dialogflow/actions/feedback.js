const { value } = require('pb-util')
const postGoogleForm = require('@helpers/post-google-form')

async function feedback(response, { from, platform, text }) {
	if (!response.queryResult.allRequiredParamsPresent) {
		return false
	}

	let { rating, feedback } = response.queryResult.parameters.fields
	rating = value.decode(rating)
	feedback = value.decode(feedback)

	const {
		FEEDBACK_FORM_ID,
		FEEDBACK_FORM_RATING_FIELD,
		FEEDBACK_FORM_FEEDBACK_FIELD
	} = process.env

	if (
		!FEEDBACK_FORM_ID ||
		!FEEDBACK_FORM_RATING_FIELD ||
		!FEEDBACK_FORM_FEEDBACK_FIELD
	) {
		throw new Error('Variáveis de ambiente da ação do feedback faltando')
	}

	return postGoogleForm(
		FEEDBACK_FORM_ID,
		{
			[FEEDBACK_FORM_RATING_FIELD]:	rating,
			[FEEDBACK_FORM_FEEDBACK_FIELD]: feedback
		}
	)
}

module.exports = feedback