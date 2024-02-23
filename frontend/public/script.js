document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
  
    feedbackForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const submitFeedback = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        feedback: document.getElementById('feedback').value,
      };
  
      // Send feedback data to the server
      fetch('/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:  JSON.stringify(submitFeedback),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if(data.message === "Feedback send successful") {
              alert("Feedback send successful");            
          } else {
            alert("Something went wrong")
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });

function updateUI(data) {
    const container = document.getElementById('weather');

    container.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = '<p class="text-center">No data available</p>';
        return;
    }
    container.innerHTML = `
    <li class="one_third">
            <article><a href="#"><i class="fas fa-spray-can"></i></a>
              <h6 class="heading">Air Indix Qulity</h6>
              <p>AQI: ${data.airQualityIndex}<br>Real Feel: ${data.feelslike_c} °C<br>Pressure: ${data.pr} mbar</p>
            </article>
        </li>
        <li class="one_third">
            <article><a href="#"><i class="fas fa-spray-can"></i></a>
              <h6 class="heading">Weather</h6>
              <p>Temperature: ${data.temperature}°C<br>Condition: ${data.condition ? data.condition.text : 'Data not available'}<br>Humidity: ${data.humidity}%</p>
            </article>
        </li>
        <li class="one_third">
            <article><a href="#"><i class="fas fa-spray-can"></i></a>
              <h6 class="heading">Wind</h6>
              <p>Gust: ${data.gust_kph} Km/h<br>Wind Degree: ${data.wind_degree}<br>Wind: ${data.wind_kph} Km/h</p>
            </article>
        </li>
    `;

    
    const locationCard = document.createElement('li');
    locationCard.classList.add('one_third');

    locationCard.innerHTML = `
    <article><a href="#"><i class="fas fa-spray-can"></i></a>
      <h6 class="heading">Your Location</h6>
      <p><i class="fas fa-map-marker-alt fa-lg mb-3 text-primary"></i><span class="card-text h6"> City: ${data.location.name}</span><br>
      <i class="fas fa-map fa-lg mb-3 text-info"></i><span class="card-text h6"> Region: ${data.location.region}</span><br>
      <i class="fas fa-globe fa-lg mb-3 text-success"></i><span class="card-text h6"> Country: ${data.location.country}</span><br>
      <i class="far fa-clock fa-lg mb-3 text-warning"></i><span class="card-text h6"> Local Time: ${data.location.time}</span><br></p>
    </article>
`;

container.appendChild(locationCard);
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    resolve(userLocation);
                },
                error => {
                    console.error('Error getting user location:', error);
                    reject(error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

async function sendUserLocation(location) {
    return fetch('/user/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to send user location: ${response.statusText}`);
        }
        return response.text();
    })
    .catch(error => {
        console.error('Error sending user location:', error);
    });
}

async function fetchWeatherData(location) {
    const WEATHER_API_KEY = '937967e2eeff482b928100745241102';

    return fetch(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${location.latitude},${location.longitude}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received Weather Information data from Weather API:', data);

            if (data.location && data.current) {
                const weatherData = {
                    location: {
                        name: data.location.name,
                        country: data.location.country,
                        region: data.location.region,
                        time: data.location.localtime
                    },
                    temperature: data.current.temp_c,
                    humidity: data.current.humidity,
                    condition: data.current.condition,
                    gust_kph: data.current.gust_kph,
                    feelslike_c: data.current.feelslike_c,
                    wind_degree: data.current.wind_degree,
                    wind_kph: data.current.wind_kph
                };

                return weatherData;
            } else {
                console.error('Invalid API response structure. Missing required properties.');
                return null;
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            return null; 
        });
}

function initMap() {
    getUserLocation()
        .then(location => {
            const windyMapIframe = document.getElementById('windy');
            windyMapIframe.src = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=10&overlay=wind&product=ecmwf&level=surface&lat=${location.latitude}&lon=${location.longitude}&detailLat=${location.latitude}&detailLon=${location.longitude}&detail=true&pressure=true&message=true`;
        })
        .catch(error => {
            console.error('Error getting user location:', error);
        });
}

async function fetchAirQualityData(location) {
    const AIRVISUAL_API_KEY = 'b9670aa7-6c43-4bb3-9059-bcd388e68657';

    return fetch(`http://api.airvisual.com/v2/nearest_city?key=${AIRVISUAL_API_KEY}&lat=${location.latitude}&lon=${location.longitude}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received air quality data from AirVisual API:', data);

            if (data.data) {
                const airQualityData = {
                    city: data.data.city,
                    country: data.data.country,
                    airQualityIndex: data.data.current.pollution.aqius,
                    pr: data.data.current.weather.pr,
                };

                return airQualityData;
            } else {
                console.error('Invalid API response structure. Missing required properties.');
                return {}; 
            }
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
            return {}; 
        });
}

async function updateEnvironmentalData() {
    try {
        const location = await getUserLocation();

        const weatherData = await fetchWeatherData(location);

        const airQualityData = await fetchAirQualityData(location);

        if(weatherData.length != 0 && airQualityData.length != 0) {

        updateUI({
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            condition: {
                text: weatherData.condition.text,
                icon: weatherData.condition.icon,
            },
            feelslike_c: weatherData.feelslike_c,
            gust_kph: weatherData.gust_kph,
            wind_degree: weatherData.wind_degree,
            wind_kph: weatherData.wind_kph,

            airQualityIndex: airQualityData.airQualityIndex,
            pr: airQualityData.pr,

            location: {
                name: weatherData.location.name,
                region: weatherData.location.region,
                country: weatherData.location.country,
                time: weatherData.location.time,
            },
        });
    } else {
        console.log(`error fetching data`)
    }
    } catch (error) {
        console.error('Error updating environmental data:', error);
    }
}
updateEnvironmentalData();

setInterval(() => {
    updateEnvironmentalData();
}, 60000);