const restify = require('restify')
const mongoose = require('mongoose')
const corsMiddleware = require('restify-cors-middleware')

mongoose.connect('mongodb://localhost/my-api-rest', { useNewUrlParser: true})
  .then(_=> {
    const server = restify.createServer({
      name: "my-rest-api",
      version: "1.0.0",
      ignoreTrailingSlash: true
    })

    const cors = corsMiddleware({
      preflightMaxAge: 5,
      origins: ['*'],
      allowHeaders: ['*'],
      exposeHeaders: ['*']
    })

    // Libera acesso para domínios externos
    server.pre(cors.preflight)
    server.use(cors.actual)

    server.use(restify.plugins.bodyParser())

    const alunoSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      }
    })

    const Aluno = mongoose.model('Aluno', alunoSchema)

    server.get('/alunos', (req, res, next) => {
      Aluno.find()
        .then(alunos => {
          res.json(alunos)
          return next()
        })
        .catch(console.error)
    })

    server.get('/alunos/:id', (req, res, next) => {
      Aluno.findById(req.params.id)
        .then(aluno => {
          if (aluno) {
            res.json(aluno)
          } else {
            res.status(404)
            res.json({ message: 'Not Found!'})
          }   
          return next() 
        }) 
    })

    server.post('/alunos', (req, res, next) => {
      const aluno = new Aluno(req.body)
        aluno.save()
        .then(aluno => {
          res.json(aluno)
        })
        .catch(error => {
          res.status(400)
          res.json({ message: error.message })
        })
        return next()
    })

    server.put('/alunos/:id', (req, res, next) => {
      Aluno.findByIdAndUpdate(req.params.id, req.body)
        .then(aluno => {
          if (aluno) {
            res.json({ message: 'Update is succefull'})
          } else {
            res.status(404)
            res.json({ message: 'Not Found!'})
          }   
          return next() 
        }) 
    })

    server.listen(3000, () => {
      console.log("API listening on 3000")
    })
}).catch(console.error)