import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState()
  const [refreshToken, setRefreshToken] = useState()
  const [expiresIn, setExpiresIn] = useState()

  useEffect(() => {
    axios
        .post("http://localhost:3001/login", {
            code,
        })
        .then((res) => {
            setAccessToken(res.data.accessToken)
            setRefreshToken(res.data.refreshToken)
            setExpiresIn(res.data.expiresIn)
            window.history.pushState({}, null, '/') // push the url into the root url, so it doesn't show on the window search bar
        })
        .catch((err) => {
            // The following line of the code redirect the user back to the login page
            window.location = '/'
            // However, the issue is not expired authorization code is invalid authorization
            // Redirecting users back to the login page only solve the issue of expiration 
        })
  }, [code])

  useEffect(() => {
    // This useEffect() is executed before refreshToken even has a value, and this cause an error in the program
    // So we add an if-else statement here to check if refreshToken has a value if not just simply  return 
    if (!refreshToken || !expiresIn) return 

    // To make sure we only do this refresh right before the token expire, we put this block of code inside timeout
    // Delay is in milliseconds
    // Set to refresh one minute before expiration
    const interval = setInterval(() => {
        axios
            .post("http://localhost:3001/refresh", {
                refreshToken,
            }) 
            .then((res) => {
                setAccessToken(res.data.accessToken)
                setExpiresIn(res.data.expiresIn)
            })
            .catch((err) => {
                window.location = '/' 
            })
    }, (expiresIn - 60) * 1000)
    // ISSUES:
    // Using setTimeout, the access token and expires in are not refreshing for some reason 
    // This is only run once
    // setTimeout() is executed only once
    // If you need repeated execution, you have to use setInterval()


    return () => clearInterval(interval)
    // This clear the timeout

  }, [refreshToken, expiresIn])

  return accessToken
  // This the token we need to access the functions in spotify like searching songs and artists, and playing and pausing songs
  // But the expiresIn = 3600 = 1 , so we need to constantly refresh the token  
}
