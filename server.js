const express = require("express")
const app = express()
const exphbs = require("express-handlebars");
const path = require("path")
const bodyParser = require("body-parser");
const db = require("./db/index")
const jwt = require("jsonwebtoken")

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.set("view engine", "handlebars");  // ocupara el motor de plantilla handlebars
app.engine("handlebars", exphbs({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname +"/views/components",
}))

app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));
app.use( "/assets", express.static(__dirname + "/public/assets"))
app.use( "/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
app.use( "/bootstrapjs", express.static(__dirname + "/node_modules/bootstrap/dist/js"))

app.use( "/jquery", express.static(__dirname + "/node_modules/jquery/dist"))

app.get('/', (req, res ) => {
  res.render("Home", {layout: "Home"})
})
// register
app.get("/users/register", (req, res) => {
    res.render( "Register", { layout: "Register"})
})

app.get("/users/login", (req, res) => {
  res.render( "Login", { layout: "Login"})
})

//desactivar cuando este lista la aplicacion
// app.get("/users/dashboard", (req, res) => {
//   res.render( "Dashboard", { layout: "Dashboard"})
// })
// app.get("/users/dashboard/perfil", (req, res) => {
//   res.render( "Profile", { layout: "Profile"})
// })
// app.get("/users/dashboard/transferencia", (req, res) => {
//   res.render( "Transfer", { layout: "Transfer"})
// })

app.post('/users/register', async (req, res) => {
    let { name, email, rut, address, password, password2} = req.body;
    // console. log({
    //   name, email, rut, address, password, password2
    // })
    let errors = [];
    if(!name || !email || !rut || !address || !password || !password2){
      errors.push({ message: "Por favor ingrese todos los campos"});
    }
    if(password.length < 6){
      errors.push({message: "El password no puede tener menos de 6 caracteres"});
    }
    if(password != password2){
      errors.push({message: "Los passwords deben ser iguales"});
    }
    if (errors.length > 0) {
      res.render("Register", {
          layout:"Register",
          errors,
      })
    }else{
      const usuario = await db.nuevoUsuario(name, email, rut, address, password) 
      //console.log(usuario)
      if(!usuario){
        errors.push({message: "Usuario no registrado"})
      }else{
        res.redirect("/users/login")
      }
    }
})
//login
app.post('/verify', async (req,res) => {
  let { rut, password } = req.body;
  // console.log(req.body)
  // console.log(rut, password)
  let user = await db.getUsuario(rut, password);
  if (user) {
    // if(user.auth){                   
    if(user.rut == rut && user.password == password){     
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 180,
          data: user,
        },
        process.env.SECRET_KEY
      );
      res.status(200).send(token);
    }else {
      res.status(401).send({
        error: "Usuario no validado",
        code: 401,
      });
    }
  } else {
    res.status(404).send({
      error: "Usuario o contraseña incorrecto",
      code: 404,
    })
  }
});
//persistencia del token
// app.get("/users/dashboard", function (req, res) {
//   let { token } = req.query;
//   jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//     err
//       ? res.status(401).send(
//           res.send({
//             error: "401 No autorizado",
//             message: "Usted no esta autorizado para estar aqui",
//             token_error: err.message,
//           })
//       )
//       :res.render( "Dashboard", { 
//         layout: "Dashboard",
//         nombre: decoded.data.name,
//         token: token,
//       });    
//   });
// });

//get transfers con persistencia
app.get("/users/dashboard", (req, res) => {
  let { token } = req.query;
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if(err){
      res.status(401).send(
        res.send({
          error: "401 No autorizado",
          message: "Usted no esta autorizado para estar aqui",
          token_error: err.message,
        })
      )
    }else{
      let transfers;
      try {
        const id = decoded.data.id;
        transfers = await db.getTransfers(id);
        res.render( "Dashboard", { 
          layout: "Dashboard",
          nombre: decoded.data.name,
          token: token,
          transfers,
        })
      } catch (e) {
        console.log(e);
        res.status(500).send({error: "500 Internal Server Error", message: e });
      }
    }    
  });
});

app.get("/users/dashboard/transferencia", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
    if (err) {
      const { message } = err;
      res.status(401).send({ error: "401 Unauthorized", message });
    } else {
      res.render( "Transfer", { layout: "Transfer", user: data, token})
    }
  });
})

app.post("/transferencias", (req, res) => {
  let { token } = req.query;
  const transfer = req.body
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) {
      const { message } = err;
      res.status(401).send({ error: "401 Unauthorized", message });
    } else {
      try {
        const id_from  = decoded.data.id;
        const result = await db.newTransfer(transfer, id_from);
        res.status(201).send(result);
      } catch (e) {
        console.log(e);
        res
          .status(500)
          .send({ error: "500 Internal Server Error", message: e });
      }
    }
  });
});

app.get("/users/dashboard/perfil", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
    if (err) {
      const { message } = err;
      res.status(401).send({ error: "401 Unauthorized", message });
    } else {
      res.render( "Profile", { layout: "Profile", user: data, token})
    }
  });
})

app.get("*", (req, res) => {
  res.render("404", {layout: "404"})
})

app.listen(PORT, () => { 
  console.log(`Your app listening on port ${PORT}`)
})