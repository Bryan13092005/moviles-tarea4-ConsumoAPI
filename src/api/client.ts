import axios from 'axios'
//crear cliente
//baseURl
//headers

export const clientPokemon=axios.create({
    baseURL:process.env.EXPO_PUBLIC_POKEAPI_URL,
    headers:{'Content-Type':'application/json'}
})

export const userClient=axios.create({
    baseURL:process.env.EXPO_PUBLIC_MOCKAPI_URL,
    headers:{'Content-Type':'application/json'}
})