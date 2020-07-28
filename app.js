var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const port = 3000;
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body : String,
    created : {type : Date, default: Date.now}
})

var Blog= mongoose.model("Blog", blogSchema);

// Blog.create({
//     title:"Test Blog",
//     image:"https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60",
//     body:"This is the First Blog"
// });

//RESTFUL ROUTES
app.get("/",function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index",{blogs:blogs});
        }

    })
    //res.render("index");
});

app.get("/blogs/new", function(req,res){
    res.render("new");
});

app.post("/blogs", function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show",{blog:foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit",{blog:foundBlog});
        }
    })
    
});

//update route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog,function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//delete route
app.delete("/blogs/:id", function(req,res){
    // destroy blog 
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});

app.listen(port,function(){
    console.log(`server running on ${port}`);
})