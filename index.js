import express from "express";
import axios from "axios";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import 'dotenv/config';
import { createClient } from 'pexels';
import { error, log } from "console";



// Defining the Port and Express Server
const PORT = process.env.PORT
const app = express()

// Api Url
const apiUrl = "https://air-quality-by-api-ninjas.p.rapidapi.com/v1/airquality"
const pexelsApiUrl = "https://api.pexels.com/v1/"

// Api Key
const rapidApiKey = process.env.AIRCHECK_API_KEY
const pexelsApiKey = process.env.PEXELS_API_KEY

// Creating Pexels API Client
const client = createClient(pexelsApiKey);

// Defining middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.get("/", async (req,res) =>{
    let query = "night city"
    // try {
    //     client.photos.search({ query, per_page: 1 }).then(photos => {
    //         let pexels = JSON.stringify(photos)
    //         console.log(photos);
    //         res.render("index.ejs", {bgImage: pexels})
    //     })
    // } catch (error) {
    //     res.render("index.ejs", {error: error.message})
    // }

    res.render("index.ejs")
})


app.post("/airCheck", async (req,res) =>{
    let city = req.body.city
    let query = city
    let pexels
    try {
        await client.photos.search({ query, per_page: 1 }).then(photos => {
            pexels = JSON.stringify(photos.photos[0]);
            return pexels
        })
        console.log(pexels.url);
        const response = await axios.get(apiUrl,{
            params:{
                city: city
            },
            headers:{
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'air-quality-by-api-ninjas.p.rapidapi.com'
            }
        })
        const result = JSON.stringify(response.data)
        res.render("index.js", {cardImage:pexels, airData: result })
    } catch (error) {
        res.render("index.ejs", {error: error.message})
    }
})

app.listen(PORT, (req,res) =>{
    console.log(PORT);
})