const axios = require('axios');
const util = require('util')


// ex 1
// return 'yoda'
const getStarWarsCharacter = async(name) => {

  const url = `https://swapi.co/api/people/?search=${name}`;
  try{
    const response = await axios.get(url);
    const data = response.data;
    const characterName = data.results[0].name;

    console.log(characterName);
    return characterName;
  }
  catch(error){
    console.log('ERROR : ', error)
  }
}
// getStarWarsCharacter('yoda');




// helper function to get and gather raw data from swapi into one array
const getData = async(url, callback = null) => {
  try{

    const response1 = await axios.get(url); // fisrt call to get the 1st page of swapi raw data
    console.log(url);

    let rawDataArray = [];
    rawDataArray.push(response1);

    const numberOfCalls = Math.ceil(response1.data.count / 10); // count how many api calls are needed

    if (numberOfCalls >= 2 ){
      const promises = [];

      for (let i = 2; i <= numberOfCalls; i ++) {
        const url2 = `${url}/?page=${i}`;
        console.log(url2);
        promises.push(axios.get(url2));
      }

      const responses = await Promise.all(promises);
      rawDataArray = rawDataArray.concat(responses);  // all raw data pages into one array

      if(callback !== null){
        console.log('with callback');
        callback(refineData(rawDataArray));
      } else {
        console.log('no callback');
        return refineData(rawDataArray);
      }
    }
    return refineData(rawDataArray);;
  }
  catch(error){
    console.log('ERROR !: ', error);
  }
}


// return an array containing the field 'results' of each element of rawDataArray
const refineData = (rawData) => {

  const refinedData = [];

  for (const pages of rawData){
    for (const page of pages.data.results){
      refinedData.push(page)
    }
  }
  return refinedData;
}

// getData('https://swapi.co/api/people');
// getData('https://swapi.co/api/species');




// ex 2
// return species than contains more than 2 people
const getStarWarsSpeciesMoreThanTwoPeople = (refinedData) => {

  const speciesMoreThanTwo = [];

  for (const specie of refinedData){
    if(specie.people.length >= 2){
      speciesMoreThanTwo.push(specie.name);
    };
  }
  console.log(speciesMoreThanTwo);
  return speciesMoreThanTwo;

  // const result = refinedData.filter(specie => { // other way to do it
    //   if (specie.people.length >= 2 ){
      //     console.log(specie.name)
      //     return specie.name;
      //   }
      // })
}

// getData('https://swapi.co/api/species', getStarWarsSpeciesMoreThanTwoPeople);




// ex 3
// return the sum of all humans size
const sumAllHumansSize = (refinedData) => {

  const sizeArray = [];

  for (const character of refinedData){
    if(character.species.includes("https://swapi.co/api/species/1/")){
      const size = parseInt(character.height, 10);
      // console.log(size);
      if (!isNaN(size)){
        sizeArray.push(size);
      }
    }
  }
  return sum(sizeArray);
}


const sum = (arg) => {
  if (Array.isArray(arg)){
    const result = arg.reduce((a, b)=>{
      return a + b;
    })
    console.log(result);
  } else {
    return
  }
}

// getData('https://swapi.co/api/people', sumAllHumansSize);



// ex 4
// return an array containing all humans infos (name, size, mass, films, planets)
const aggregateHumanData = async(refinedData) => {
  try {
    const refinedPlanets = await getData('https://swapi.co/api/planets');
    const refinedFilms = await getData('https://swapi.co/api/films');

    const aggregatedData = [];


    for (const character of refinedData){
      if(character.species.includes("https://swapi.co/api/species/1/")){
        aggregatedData.push(character.name, character.height, character.mass);
        addPlanets(aggregatedData, refinedPlanets, character);
        addFilms(aggregatedData, refinedFilms, character);

        aggregatedData.push( '------------------------------');
      }
    }
    console.log(util.inspect(aggregatedData, { maxArrayLength: null })) // useful to display more than 100 elements in terminal
    return aggregatedData;
  }
    catch(error) {
      console.log(error);
    }
}


const addPlanets = (aggregatedData, refinedPlanets, character) => {
    for (const planet of refinedPlanets){
      if(planet.url === character.homeworld){
        aggregatedData.push(planet.name);
      }
    }
}


const addFilms = (aggregatedData, refinedFilms, character) => {
    for (const film of refinedFilms){
      if(character.films.includes(film.url)){
        aggregatedData.push(film.title);
      }
    }
}

// getData('https://swapi.co/api/people', aggregateHumanData);
