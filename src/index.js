const express = require("express")
const http = require("http")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const cors = require("cors")


const {PORT} = require("../env")
const { models } = require("./models/index");


const app = express()
const server = http.createServer(app)

models;

app.use(cors({origin: '*'}))
app.use(helmet())
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: false}))

app.use('/',  require("./routes/public.routes") )
app.use('/',  require("./routes/private.routes") )



app.use((err,req,res,next) => res.status(500).send(err))


process.on('SIGINT',()=>{
    server.close(()=>{
        console.log('n\sutting down gracefully')
        process.exit(0)
    })

    
})


app.listen(PORT, ()=> console.log("server running at port" + PORT))