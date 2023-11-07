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
    let query = "india night"
    try {
        client.photos.search({ query, per_page: 1 }).then(photos => {
            let pexels = (photos.photos[0])
            console.log(pexels);
            res.render("index.ejs", {bgImage: pexels.src.original})
        })
    } catch (error) {
        res.render("index.ejs", {error: error.message})
    }
})


function getAQIDescription(aqi) {
    let description;
    let precautions;
  
    if (aqi >= 0 && aqi <= 50) {
      description = 'Good air quality. Enjoy outdoor activities!';
      precautions = 'No precautions needed.';
    } else if (aqi > 50 && aqi <= 100) {
      description = 'Moderate air quality. Most people can enjoy outdoor activities.';
      precautions = 'People with respiratory or heart conditions should reduce prolonged or heavy exertion.';
    } else if (aqi > 100 && aqi <= 150) {
      description = 'Unhealthy for sensitive groups. People with respiratory or heart conditions, children, and older adults should reduce prolonged or heavy exertion.';
      precautions = 'People with asthma, heart disease, and respiratory conditions should be cautious.';
    } else if (aqi > 150 && aqi <= 200) {
      description = 'Unhealthy air quality. Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
      precautions = 'People with respiratory or heart conditions should avoid prolonged outdoor exertion.';
    } else if (aqi > 200 && aqi <= 300) {
      description = 'Very unhealthy air quality. Health alert: everyone may experience more serious health effects.';
      precautions = 'People with respiratory or heart conditions should avoid outdoor activities.';
    } else if (aqi > 300) {
      description = 'Hazardous air quality. Health warning of emergency conditions: the entire population is likely to be affected.';
      precautions = 'Everyone should avoid all outdoor activities.';
    } else {
      description = 'Invalid AQI value.';
      precautions = 'N/A';
    }
  
    return {
      description,
      precautions,
    };
  }
  
  // Example usage:
  let aqi = 120;

  


app.post("/airCheck", async (req,res) =>{
    let city = req.body.city
    let query = city
    let pexels
    try {
        await client.photos.search({ query, per_page: 1 }).then(photos => {
            pexels = (photos.photos[0]);
            return pexels
        })
        console.log(pexels);
        const response = await axios.get(apiUrl,{
            params:{
                city: city
            },
            headers:{
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'air-quality-by-api-ninjas.p.rapidapi.com'
            }
        })
        const result = (response.data)
        const { description, precautions } = getAQIDescription(result.overall_aqi);
        res.render("index.ejs", {cardImage:pexels, airData: result, city:city, desc: description, prec: precautions })
    } catch (error) {
        res.render("index.ejs", {error: error.message})
    }
})

app.listen(PORT, (req,res) =>{
    console.log(PORT);
})