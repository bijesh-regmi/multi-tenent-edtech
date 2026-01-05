import express from "express"

const app = express()


app.get("/get-app", (req, res) => {
    res.send(`
        <h1>Hello app</h1>
        `)
})
export default app


