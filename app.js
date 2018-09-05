var http    = require('http');
var url     = require('url');
var router  = require('routes')();
var swig    = require('swig');
var qString = require('querystring');
var connection  = require('mysql');
var con     = connection.createConnection({
    host    : "localhost",
    port    : 3306,
    database: "nodejs",
    user    : "root",
    password: ""
});

router.addRoute('/',function(req,res){
    con.query("SELECT * FROM mahasiswa",(err,rows,field) => {
        if(err) throw err;
        
        var html = swig.compileFile('./template/index.html')({
            title   : "Data mahasiswa",
            data    : rows
        });
    
        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    });

});

router.addRoute('/insert',(req,res) => {
    if(req.method.toUpperCase() == "POST"){
        var data_post = "";
        req.on('data',(chuncks)=>{
            data_post += chuncks;
        });

        req.on('end',function(){
            data_post  = qString.parse(data_post);
            con.query("insert into mahasiswa set ?",data_post,(err,field) => {
                if(err) throw err;

                res.writeHead(302,{"Location" : "/"});
                res.end();
            });
        });
    }else{

        var html = swig.compileFile('./template/form.html')();

        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    }

});

router.addRoute('/update/:id',(req,res) => {

    console.log(this.params.id);

    con.query("select * from mahasiswa where ?",
        {
            no_induk : this.params.id
        },(err,rows,field) =>{
        if(rows.length){
            var data    = rows[0];

            if(req.method.toUpperCase() == "POST")
            {

            }else{
                var html = swig.compileFile("./template/form_update.html")({
                    data : data
                });
                res.writeHead(200,{"Content-Type" : "text/html"});
                res.end(html);
            }
        }
    });
});

router.addRoute('/delete',(req,res) => {
    con.query("DELETE FROM mahasiswa WHERE ?",{
        no_induk : "123456781"
    },(err,fields) => {
        if(err)throw err;

        res.writeHead(200,{"Content-Type" : "text/plain"});
        res.end(fields.affectedRows+" Rows Deleted");
    });
});


http.createServer((req,res) => {
    var path    = url.parse(req.url).pathname;
    var match   = router.match(path);

    if(match)
    {
        match.fn(req,res);
    }else{
        var html    = swig.compileFile('./template/404.html')();
        res.writeHead(404,{"Content-Type" : "text/html"});
        res.end(html);
    }
}).listen(8888);

console.log("Server is running.....");