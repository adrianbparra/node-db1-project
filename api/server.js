const express = require("express");

const db = require("../data/dbConfig.js");

const server = express();

server.use(express.json());

server.get("/api/accounts/",(req,res) => {

    const {limit, sortby, sortdir} = req.query;

    if(sortby === "budget" | sortby === "id" | sortby === "name" | sortby === undefined) {

        db("accounts").limit(limit? limit : Infinity).orderBy(sortby ? sortby : "id", sortdir ? sortdir : "asc")
        .then(accounts => {
            res.status(200).json(accounts)
        })
        .catch(err => {
            res.status(500).json({err, errorMessage: "Server error"})
        })

    } else {
        res.status(400).json({errorMessage: "Sort by only for name, id, or budget"})
    }

    
})

server.post("/api/accounts", accountMatch, (req, res) => {

    const accountInfo = req.body;
    if( "name" in accountInfo && "budget" in accountInfo) {

        db("accounts").insert(accountInfo)
        .then(count => {
            res.status(201).json({"id": count[0],...accountInfo})
        })
        .catch(err => {
            res.status(500).json({err, errorMessage: "Unable to add Account"})
        })

    } else {
        res.status(400).json({errorMessage: "Please include name and budget. Name has to be unique"})
    }

})

server.put("/api/accounts/:id", accountMatch, (req,res) => {
    
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





function accountMatch  (req,res,next) {

    // const { id } = req.params;
    const {name} = req.body;

    db("accounts").where("name", name).first()
        .then(account => {
            if(account) {
                res.status(400).json({errorMessage: "Account name is taken already"})
            } else {
                next()
            }
        })
        .catch(err => {
            res.status(500).json({errorMessage: "Server failed to match name"})
        })
}






module.exports = server;
