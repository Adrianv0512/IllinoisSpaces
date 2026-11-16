import express from 'express'

const app = express()
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'illinois-spaces-api' })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`Illinois Spaces API listening on http://localhost:${port}`)
})
