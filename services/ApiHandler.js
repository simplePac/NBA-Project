const axios = require("axios");

class NbaApi {
  constructor() {
    this.api = axios.create({
      baseURL: "https://www.balldontlie.io/api/v1",
    });
  }

  getAllPlayers = (page) => this.api.get(`/players?page=${page}`);
  getPlayer = (player) => this.api.get(`/players?search=${player}`);
  getAllTeams = () => this.api.get("/teams");
}

module.exports = NbaApi;
