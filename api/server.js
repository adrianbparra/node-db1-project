const express = require("express");

const db = require("../data/dbConfig.js");

const server = express();

server.use(express.json());

server.get("/api/accounts",(req,res) => {
    db("accounts")
        .then(accounts => {
            res.status(200).json(accounts)
        })
        .catch(err => {
            res.status(500).json({err, errorMessage: "No response from server"})
        })
})

server.post("/api/accounts", (req, res) => {

    const accountInfo = req.body;
    if( "name" in accountInfo && "budget" in accountInfo) {

        db("accounts").insert(accountInfo)
        .then(count => {
            res.status(201).json({count})
        })
        .catch(err => {
            res.status(500).json({err, errorMessage: "Unable to add Account"})
        })

    } else {
        res.status(400).json({errorMessage: "Please include name and budget."})
    }

})

server.put("/api/accounts/:id", (req,res) => {
    
    const {name, budget} = req.body;
    const { id } = req.params;

    
    if( name || budget) {
        
        
        db("accounts").where({id}).update({name,budget})
            .then(count => {
                if(count > 0){
                    res.status(201).json({"Updated" : {id,name,budget},count})
                } else {
                    res.status(404).json({errorMessage: "No account updated"})
                }
                
            })
            .catch(err => res.status(500).json({ errorMessage: "Unable to update account"}))
    
    } else {
        res.status(400).json({errorMessage: "Please include name or budget to change"})
    }

})


server.delete("/api/accounts/:id", (req,res) => {
    const { id } = req.params;

    db("accounts").where({id}).del()
        .then(count => {
            count ? res.status(201).json({count}) : res.status(404).json({errorMessage: "Unable to find account ID"})
            
        })
        .catch(err => res.status(500).json({err, errorMessage: "Unable to delete account"}))
    
})


server.get("/api/accounts/:id", (req,res) => {
    const { id } = req.params;

    db("accounts").where({id}).first()
        .then(account =>{
            
            if(account) {
                res.status(200).json(account)
            } else {

                res.status(404).json({errorMessage: "No account found with matching ID"})
            }
        })
        .catch(err => res.status(500).json({errorMessage:"Server Error unable to search"}))
})






module.exports = server;
