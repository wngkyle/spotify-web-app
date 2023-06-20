import React from "react"
import { Container } from "react-bootstrap"

const randomString = require('randomstring')

const auth_endpoint = "https://accounts.spotify.com/authorize"
const client_id = "1d9ed032c07a461d803df4e905fcae3c"
const response_type = "code"
const redirect_uri = "http://localhost:3000"
const scopes = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-modify-playback-state",
]
const prevState = randomString.generate(16)

const auth_url = `${auth_endpoint}?client_id=${client_id}&response_type=${response_type}&state=${prevState}&redirect_uri=${redirect_uri}&scope=${scopes.join(
  "%20"
)}`

export default function Login() {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    > 
      <a className="btn btn-success btn-lg" href={auth_url}>
        Login With Spotify
      </a>
    </Container>
  );
}
