//require('dotenv').config({path:'./env'})


import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";



dotenv.config({path:'./env'});
const app = express();


connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`server is running at port : ${process.env.PORT || 3000 }`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!!!!",err);
});

/*

const app = express()
( async () => {
    try {
          await mongoose.connect(${process.env.MONGODB_URL}/${DB_NAME})

          app.on("errror",(error) => {
            console.log("ERRR:",error);
            throw error
          })

          app.listen(process.env.PORT, () => {
              Console.log(app is listening on port ${process.env.PORT});
          }) 


    } catch (error) {
        console.error("ERROR: ",error)
        throw err
    }
})()
   
*/