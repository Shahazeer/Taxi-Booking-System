const express = require('express')
const app = express()
const mysql = require('mysql2')
const path=require('path')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.set('view engine','ejs')
app.get("/",(req,res)=>{
    res.sendFile(__dirname+'/log.html')
})
let con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"toor",
    database:"Taxi"
})

con.connect((err)=>{
    if(err)
    console.log(err);
    else{
        console.log("Connected to Taxi");
    }
})
const rate=20
let trip=0;
app.post("/submit-trip-details",(req,res)=>{
    let cust_name=req.body.name
    let destination=req.body.dest
    let date=req.body.date
    let phone=parseInt(req.body.phone)
    let cabName=req.body.cabName
    let sql="select tot_dist from dest_details where dest_name='"+destination+"';"
    // res.sendFile(__dirname+"\\Invoice.html")
     con.query(sql,(err,result)=>{
        let sql1="select taxi_amount,driver_id from taxi where taxi_type='"+cabName+"';"
        con.query(sql1,(err,result1)=>{
            let bill_amt=(result1[0].taxi_amount)*(result[0].tot_dist);
            //console.log(bill_amt);
            trip++;
            let sql2="select taxi_id from taxi where taxi_type='"+cabName+"';"
            //console.log(cabName)
            con.query(sql2,(err,result2)=>{
                let sql3="insert into trip_details values("+trip+",'"+date+"',"+bill_amt+","+result[0].tot_dist+",'"+cust_name+"',"+result1[0].driver_id+","+result2[0].taxi_id+",'"+destination+"')";
                console.log(sql3)
                con.query(sql3,(err,result3)=>{
                    console.log(cabName);
                    res.render("pages/Invoice",{passenger:cust_name,dest:destination,date:date,cabName:cabName,driver_id:result1[0].driver_id,bill_amount:bill_amt})
                }) 
            })
        })
    })
})
app.post("/sign-in", (req, res) => {
    const user = req.body.email
    //usr=req.body.user
    const pass = req.body.password
    console.log(user,pass)
    let sql = "select password from user where email='" + user + "';";
    con.query(sql, (err, result) => {
        console.log(result)
        const password = result[0].password
        if (pass == password) {
            res.sendFile(__dirname+"\\index.html")
        }
        else {
            res.redirect("/")
        }
    })
})
app.post("/admin-login", (req, res) => {
    const user = req.body.email
    //usr=req.body.user
    const pass = req.body.password
    console.log(user,pass)
    let sql = "select password from admin where email='" + user + "';";
    con.query(sql, (err, result) => {
        console.log(result)
        const password = result[0].password
        if (pass == password) {
            let sql="select * from trip_details;"
            con.query(sql,(err,result)=>{
                console.log(result);
                res.render('pages/Dashboard',{values:result})
            })
        }
        else {
            res.redirect("/")
        }
    })
})
app.post("/delete-trip",(req,res)=>{
    let sql="delete from trip_details where trip_id="+parseInt(req.body.btn)+";"
    con.query(sql,(err,result)=>{
        let sql1="select * from trip_details;"
        con.query(sql1,(err,result1)=>{
            res.render("pages/Dashboard",{values:result1})
        })
    })
})
app.listen(3000,()=>{
    console.log("Server is running")
})
