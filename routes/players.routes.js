const router = require("express").Router();

const alert = require("alert");
const isLoggedIn = require("../middleware/isLoggedIn");
const Player = require("../models/Player.model");
const User = require("../models/User.model");
const Api = require("../services/ApiHandler");
const nbaApi = new Api();

//buscando jugador a través de la barra search
router.get("/search", (req, res) => {
  console.log(req.query.search);
  nbaApi
    .getPlayer(req.query.search)
    .then((player) => {
      // console.log(player.data)
      res.render("players/list", {
        players: player.data,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/players/:page/next", (req, res) => {
  let { page } = req.params;
  console.log(page);
  let actualPage = page;
  actualPage++;

  nbaApi
    .getAllPlayers(actualPage)
    .then((allPlayers) => {
      // console.log(allPlayers.data)
      res.render("players/list", {
        players: allPlayers.data,
        page: actualPage,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/players/:page/previous", (req, res) => {
  let { page } = req.params;
  let actualPage = page;
  actualPage--;

  nbaApi
    .getAllPlayers(actualPage)
    .then((allPlayers) =>
      res.render("players/list", { players: allPlayers.data, page: actualPage })
    )
    .catch((err) => console.log(err));
});

//Mostrar comunidad
router.get("/community", isLoggedIn, (req, res) => {
  User.find()
    .populate("favorites")
    .then((users) => {
      res.render("community", { users, userInSession: req.user });
    });
});

router.post("/community", (req, res) => {
  console.log(req.body);
  User.findByIdAndUpdate(req.body.id, { public: true }).then(() => {
    res.redirect("community");
  });
});

//Borra de comunidad
router.post("/no-community", (req, res) => {
  console.log(req.body);
  User.findByIdAndUpdate(req.body.id, { public: false }).then(() => {
    res.redirect("community");
  });
});

router.post("/voteUp", (req, res) => {
  User.findById(req.body.votedUser).then((user) => {
    if (user.votes.includes(req.body.loggedUser)) {
      res.redirect("community");
    } else {
      User.findByIdAndUpdate(req.body.votedUser, {
        $push: { votes: req.body.loggedUser },
      }).then((user) => {
        res.redirect("community");
      });
    }
  });
});

//Añade favoritos a mi Usuario
router.post("/add-favorite", isLoggedIn, (req, res) => {
  // console.log(req.body);
  const { first_name, last_name, position, apiId } = req.body;
  const team = ({ conference, full_name } = req.body);
  const query = { first_name, last_name, position, apiId, team };

  const idToCheck = req.body.apiId;

  User.findById(req.user._id).then((user) => {
    // console.log("REQ", req.user.favorites)
    // console.log("USER",user.favorites)
    if (user.favorites.length < 5) {
      Player.find({ apiId: idToCheck }).then((charArray) => {
        // console.log("AQUI VA EL CHARARRAY", charArray)
        if (charArray.length === 0) {
          // console.log("CREA AL JUGADOR!!!")
          Player.create(query)
            .then((result) => {
              // `Added to favorites`, result
              User.findByIdAndUpdate(req.user._id, {
                $push: { favorites: result._id },
              }).then(() => {
                res.redirect("/players/:page/next");
              });
            })
            .catch((err) => console.log(err));
        } else {
          // console.log("NO CREA AL JUGADOR!!")
          User.findById(req.user._id).then((user) => {
            if (!user.favorites.includes(charArray[0]._id)) {
              User.findByIdAndUpdate(req.user._id, {
                $push: { favorites: charArray[0]._id },
              }).then(() => {
                res.redirect("/players/:page/next");
              });
            } else {
              res.redirect("/players/:page/next");
            }
          });
          // res.redirect("/players/:page/next");
        }
      });
    } else {
      res.redirect("/profile");
    }
  });

  //comprobación de si ya tengo un favorito igual en mi perfil
});

//Vista de mi perfil
router.get("/profile", isLoggedIn, (req, res, next) => {
  // console.log("AQUI REQ USER", req.user)
  User.findById(req.user._id)
    .populate("favorites")
    .then((user) => {
      // console.log("AQUI EL USUARIO", user)
      res.render("profile", { user: user });
    });
});

//Borra un jugador de mi lista
router.post("/delete-favorite", isLoggedIn, (req, res) => {
  // console.log("ESTE ES EL ID: ", req.body)
  const { id } = req.body;

  User.findByIdAndUpdate(req.user._id, { $pull: { favorites: id } })
    .then(() => {
      res.redirect("/profile");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
