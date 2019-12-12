const axios = require('axios');
const util = require('util')



class Api {
  constructor(baseUrl){
    this._baseUrl = baseUrl;
  }


  get baseUrl(){
    return this._baseUrl;
  }

// get and gather raw data from swapi
  async getAndGatherRawData(url = this.baseUrl){  // access this._baseUrl by getter

    try{
      const rawData = await axios.get(url); // fisrt call to get the 1st page of swapi raw data
      console.log(url);

      let rawDataArray = [];
      rawDataArray.push(rawData);

      const numberOfCalls = Math.ceil(rawData.data.count / 10); // count how many api calls are needed

      if (numberOfCalls >= 2 ){
        const promises = [];

        for (let i = 2; i <= numberOfCalls; i ++) {
          const url2 = `${url}/?page=${i}`;
          console.log(url2);
          promises.push(axios.get(url2));
        }

        const responses = await Promise.all(promises);
        rawDataArray = rawDataArray.concat(responses);  // all raw data pages into one array

        return rawDataArray;
      }
      return rawDataArray;
    }
    catch(error){
      console.log('getAndGatherRawData ERROR : ', error);
    }
  }


  async refineData(url = this.baseUrl){ // return an array containing the field 'results' of each element of rawDataArray
    try {
      const rawDataArray = await this.getAndGatherRawData(url);

      if(rawDataArray.length > 1){
        const refinedData = [];

        for (const pages of rawDataArray){
          for (const page of pages.data.results){
            refinedData.push(page)
          }
        }
        return refinedData;
      }
      return rawDataArray[0].data.results;
    }
    catch(error) {
      console.log('refineData ERROR : ', error);
    }
  }

}

// let api = new Api('https://swapi.co/api/people/?search=yoda');


// ex2
class Specie extends Api {
  constructor(baseUrl, route){
    super(baseUrl)
    this.route = route;
    this._url = baseUrl + route;
  }

  get url(){
    return this._url;
  }

  async getRefinedSpecies(){
    const refinedCharacters = await this.refineData(this.url);
    return refinedCharacters;
  }

  async getStarWarsSpeciesMoreThanTwoPeople(){
    try {
      const refinedSpecies = await this.refineData(this.url);
      // const refinedSpecies = await this.getRefinedSpecies();
      const speciesMoreThanTwo = [];

      for (const specie of refinedSpecies){
        if(specie.people.length >= 2){
          speciesMoreThanTwo.push(specie.name);
        };
      }
      console.log('speciesMoreThanTwo', speciesMoreThanTwo);
      return speciesMoreThanTwo;

    }
    catch (error) {
      console.log('getStarWarsSpeciesMoreThanTwoPeople ERROR : ', error);
    }
  }

}




class Character extends Api {
  constructor(baseUrl, route, name){
    super(baseUrl)
    this.route = route;
    this._url = baseUrl + route;
    this._name = name;
  }

  get url(){
    return this._url;
  }

  get name(){
    return this._name;
  }

  async getRefinedCharacters(){
    const refinedCharacters = await this.refineData(this.url);
    return refinedCharacters;
  }


  //ex 1
  async getStarWarsCharacterBySearch(){

    try {
      if (typeof this.name !== 'undefined' && this.name !== ''){
        const character = await this.getAndGatherRawData(`${this.url}/?search=${this.name}`);
        const characterName = character[0].data.results[0].name
        console.log(characterName);
        return characterName;
      }
      console.log('please give a name');
      return
    }
    catch (error) {
      console.log('getStarWarsCharacterBySearch ERROR : ', error);
    }


  }


  // ex 3
  async sumAllHumansSize(){
    try {

      console.log('sans getter : ', this._baseUrl);
      console.log('avec getter : ', this.baseUrl);

      const refinedCharacters = await this.refineData(this.url);
      // const refinedCharacters = await this.getRefinedCharacters();
      const sizeArray = [];

      for (const character of refinedCharacters){
        if(character.species.includes(`${this.baseUrl}/species/1/`)){
          const size = parseInt(character.height, 10);

          if (!isNaN(size)){
            sizeArray.push(size);
          }
        }
      }
      return this.sum(sizeArray);

    } catch (error) {
      console.log('sumAllHumansSize ERROR : ', error);
    }
  }


  sum(arg){
    if (Array.isArray(arg)){
      const result = arg.reduce((a, b)=>{
        return a + b;
      })
      console.log(result);
    } else {
      return
    }
  }


  async aggregateHumanData(){
    try {
      const refinedCharacters = await this.refineData(this.url);
      // const refinedCharacters = await this.getRefinedCharacters();

      const planet = new Planet('https://swapi.co/api', '/planets');
      const refinedPlanets = await planet.refineData('https://swapi.co/api/planets');
      // const refinedPlanets = await planet.getRefinedPlanets();

      const film = new Film('https://swapi.co/api', '/films');
      const refinedFilms = await film.refineData('https://swapi.co/api/films');
      // const refinedFilms = await film.getRefinedFilms();

      const aggregatedData = [];

      for (const character of refinedCharacters){
        if(character.species.includes(`${this.baseUrl}/species/1/`)){
          aggregatedData.push(character.name, character.height, character.mass);
          planet.addPlanets(aggregatedData, refinedPlanets, character);
          film.addFilms(aggregatedData, refinedFilms, character);

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

}




class Planet extends Api {
  constructor(baseUrl, route){
    super(baseUrl)
    this.route = route;
    this._url = baseUrl + route;
  }

  get url(){
    return this._url;
  }

  async getRefinedPlanets(){
    const refinedPlanets = await this.refineData(this.url);
    return refinedPlanets;
  }

   addPlanets(aggregatedData, refinedPlanets, character){
    for (const planet of refinedPlanets){
      if(planet.url === character.homeworld){
        aggregatedData.push(planet.name);
      }
    }
  }

}





class Film extends Api {
  constructor(baseUrl, route){
    super(baseUrl)
    this.route = route;
    this._url = baseUrl + route;
  }

  get url(){
    return this._url;
  }

  async getRefinedFilms(){
    const refinedFilms = await this.refineData(this.url);
    return refinedFilms;
  }

  addFilms(aggregatedData, refinedFilms, character){
    for (const film of refinedFilms){
      if(character.films.includes(film.url)){
        aggregatedData.push(film.title);
      }
    }
  }

}



// ex 2
// const specie = new Specie('https://swapi.co/api', '/species')
// specie.getStarWarsSpeciesMoreThanTwoPeople()

// ex 1 3 4
// let person = new Character('https://swapi.co/api', '/people', 'yoda');
// person.getStarWarsCharacterBySearch();
// person.sumAllHumansSize();
// person.aggregateHumanData();
