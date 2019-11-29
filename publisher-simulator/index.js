const request = require('request')




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

function intervalFunc() {
  console.log('Sending Ad event');
}

setInterval(intervalFunc, 1500);


