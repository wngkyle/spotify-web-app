require("dotenv").config() // this will load in the env variables
const express = require("express")
const SpotifyWebApi = require("spotify-web-api-node")
const cors = require("cors")
const bodyParser = require("body-parser")
const lyricsFinder = require("lyrics-finder") // ISSUES

const app = express()
app.use(cors())
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID, 
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken, 
    })
    spotifyApi
        .refreshAccessToken()
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                expiresIn: data.body.expires_in
            })
        })
        .catch((err) => {
            res.sendStatus(400)
        })
});

app.post("/login", (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({ 
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID, 
        clientSecret: process.env.CLIENT_SECRET // this will be stored in a .env later for safety purposes
    });

    spotifyApi
        .authorizationCodeGrant(code)
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            })
        })
        .catch((err) => {
            res.sendStatus(400)
        })
})

// The 'async' keyword makes it a asynchronous function
app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No Lyrics Found"
    res.json({lyrics})
})
 
app.listen(3001)


