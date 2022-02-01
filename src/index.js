import express from 'express'
import { handleRequest } from './requesthandler.js'

const PORT = process.env.PORT || 3001

const app = express()
app.use(express.json())

app.get('/api/welcome', (req, res) => {
  res.json({ message: 'Hello from damagejs!' })
})

app.post('/api/calculate', (req, res) => {
  console.log(req.method)
  console.dir(req.body)
  const ret = handleRequest(req.body)
  console.dir(ret)
  res.json(ret)
})

app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`)
})
