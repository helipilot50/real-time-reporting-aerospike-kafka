const request = require('request')

function intervalFunc() {
  console.log('Sending Ad event');
  // request.post('https://flaviocopes.com/todos', {
  //   json: {
  //     todo: 'Buy the milk'
  //   }
  // }, (error, res, body) => {
  //   if (error) {
  //     console.error(error)
  //     return
  //   }
  //   console.log(`statusCode: ${res.statusCode}`)
  //   console.log(body)
  // })
}

setInterval(intervalFunc, 1500);


