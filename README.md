# PokerAdda Colyseus multiplayer Card game
The game is developed using Unity, CSharp in the front-end Client and NodeJs, ExpressJs, Colyseus in the back-end Server

## Getting Started
### Server
    * Deploy the server code onto any cloud services like AWS, Microsoft Azure, Google Cloud, Digital Ocean, etc.,
    * This will generate a URL where the back-end Server is hosted.
    * Default port is 2567

### Client
    * Navigate to client/Assests/Scripts/Colyseus/GameClient.cs file
    * At line 42, change the value of "endpoint" variable to the above generated server URL
    * Build the .apk file out of the client code in Unity
    * Install the .apk file on any Android device and start playing PokerAdda

## How to play
    * Login with your Mobile number or Email address -> Navigates to Dashboard
    * The dashboard has a button in the center to play a practice game, Click on it.
    * The Server gets connected and waits for other players, if minimum players(2) join, the game starts
    * Once the game completes, 2nd round starts after displaying the Winning Screen on winners mobile
