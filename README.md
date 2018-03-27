# Rock Paper Scissors

This is an ethereum blockchain implementation of rock paper scissors. It follows a hub and spoke model such that a `GameFactory` produces instances of `RockPaperScissors` games.

There is a UI component as well. At the root path `/`, the game facroty home page is diplayed. It will show a list of deployed games that are links to take you to `/games/{some game address}`. At the game detail page of a deployed game, an onlooker could view the state, or a participant can take their actions.

## Instructions to run

Clone this repository then run:

`npm install`
`npm run build`
`npm run start`

In another terminal, from the same directory, run the following:

`truffle develop`

then, in truffle...

`migrate --reset`
`deploy`

The UI should work after these steps.

## Screenshots

![1 - Home](https://imgur.com/yDxkLml)

![2 - Created a Contract](https://imgur.com/QdUxV9y)

![3 - Game Detail](https://imgur.com/SyFJDxb)
