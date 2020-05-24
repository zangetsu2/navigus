var express         =require("express");
var app             =express();
var methodOverride  =require("method-override");
var expressSanitizer=require("express-sanitizer")
var bodyparser      =require("body-parser");
const mongoose      =require("mongoose");

mongoose.connect('mongodb://localhost:27017/crud', {useUnifiedTopology: true,useNewUrlParser: true,useFindAndModify: false });
app.use(bodyparser.urlencoded({entended: false}));
app.use(expressSanitizer());
app.set("view engine", "jade");
app.use(express.static("stylesheet"));
app.use(methodOverride("_method"));

//MOONGOOSE MODEL CONFIG
var appointmentSchema=new mongoose.Schema({
	name:String,
	phone:Number,
	email:String,
	date:String,
	password:String,
	Created:{type:Date,default:Date.now}
});
var database=mongoose.model("db",appointmentSchema); 

//Routes
app.get("/",function(req,res){
    res.sendFile("views/home.html",{root:__dirname});
});
app.get("/login",function(req,res){
	res.sendFile("views/login.html",{root:__dirname});
});
app.get("/signup",function(req,res){
	res.sendFile("views/signup.html",{root:__dirname});
});
app.post("/signup",function(req,res){
		var name=req.body.name;
		var phone=req.body.phone;
		var email=req.body.email;
		var date=req.body.date;
		var password=req.body.password;

	var item=new database({
		name:name,
		phone:phone,
		email:email,
		date:date,
		password:password
	});
	item.save(function(err,res1){
		if(err){
			throw err;
		}else{
			res.sendFile("views/home.html",{root:__dirname});
		}
	});
	
})

app.post("/login",function(req,res){
		var email=req.body.email;
		var password=req.body.password;
		database.findOne({email:email,password:password},function(err,res2){
			if(err){
				console.log(err);
				throw err;
				return res.status(500).send();
			}
			else if(!res2){
				return res.status(404).send();
			}
				res.sendFile("views/welcome.html",{root:__dirname});
		})
})

app.get("/getdetails",function(req,res){
		database.find({},function(err,details){
		if(err){
			console.log("error");
		}else{
			res.render("index.ejs", { details: details })
		}
	});
});






 async function init(database) {
	app.use(express.static(path.join(__dirname, 'views/index.html')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true })); //extended:true to encode objects and arrays  https://github.com/expressjs/body-parser#bodyparserurlencodedoptions

	const db = database.db('crud')
	const events = db.collection('dbs')



	app.get('/data', function (req, res) {
		database.find().toArray(function (err, data) {
			//set the id property for all client records to the database records, which are stored in ._id field
			for (var i = 0; i < data.length; i++){
				data[i].id = data[i]._id;
				delete data[i]["!nativeeditor_status"];
			}
			//output response
			res.send(data);
		});
	});


	// Routes HTTP POST requests to the specified path with the specified callback functions. For more information, see the routing guide.
	// http://expressjs.com/en/guide/routing.html

	app.post('/data', function (req, res) {
		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted"){
				tid = data._id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}

		if (mode == "updated") {
			events.updateOne({"_id": ObjectId(tid)}, {$set: data}, update_response);
		} else if (mode == "inserted") {
			events.insertOne(data, update_response);
		} else if (mode == "deleted") {
			events.deleteOne({"_id": ObjectId(tid)}, update_response)
		} else
			res.send("Not supported operation");
	});
}; 




app.listen(8000,function(){
	console.log("Server is running")
})