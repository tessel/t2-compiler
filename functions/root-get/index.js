// import config from 'shep-config'

export function handler (event, context, callback) {
  // Replace below with your own code!
  console.log(JSON.stringify(event))
  console.log(JSON.stringify(context))

  callback(null, { statusCode: 200, headers: {}, body: 'success!' })
}
