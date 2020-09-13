const express = require('express');
const exphbs =  require('express-handlebars');
const path=  require('path'); // auxiliar em localizar os diretorios
const mysql = require('mysql');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const e = require('express');

const app = express();
const port = 3002;


//conexão com mysql
const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: '',
    database: 'marinedatabase'
    
    });


/// CRIPTOGRAFIA

//password 
const getRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') // convert em hexadecimal
        .slice(0,length); 
};

const sha512 = function(password,salt){
      let   hash = crypto.createHmac('sha512',salt); 
      hash.update(password);
      let value = hash.digest('hex');
      return {
          salt:salt,
          passwordHash:value
      };
};

function saltHashPassword(userPassword){
    let salt = getRandomString(16); // Gera string aleatoria de 16 caracters para Salt
    let passwordData= sha512(userPassword,salt); // validação para login
    return passwordData;
}

function checkHashPassword(userPassword,salt)  // validação para login
{
    let passwordData = sha512(userPassword,salt);
    return passwordData;

}



// ROTAS

app.use(bodyParser.json()); //Aceitar parametros Json
app.use(bodyParser.urlencoded({extended: true})); //aceitar parametros de URL codificada

// static folder css
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------USE view-------------------------------
app.set('vews',path.join(__dirname, 'views'));//diretorio de vews render path do node pra auxiliar e encontrar diretorios
app.engine('handlebars',exphbs({defaultLayout:'main'})); //dizendo qual pagina padrão para renderizar.
app.set('view engine','handlebars'); //dizendo qual framework ira renderizar as views


const apiteste = [{"MMSI":"Teste0","IMO":"9034731","SHIP_ID":"359396","LAT":"-23.6932198","LON":"-46.7838357","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"Teste","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"Teste1","IMO":"9034731","SHIP_ID":"359396","LAT":"-4.1675703","LON":"-56.9199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"Teste2","IMO":"9034731","SHIP_ID":"359396","LAT":"-3.8675703","LON":"-56.2199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"Teste3","IMO":"9015462","SHIP_ID":"359396","LAT":"47.758499","LON":"-57.9199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"Teste4","IMO":"9015462","SHIP_ID":"359396","LAT":"-4.5675703","LON":"-57.3199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"Teste5","IMO":"9015462","SHIP_ID":"359396","LAT":"-2.1675703","LON":"-55.5199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"304010417","IMO":"9015462","SHIP_ID":"359396","LAT":"-2.8675703","LON":"-55.1199389","SPEED":"74","HEADING":"329","COURSE":"327","STATUS":"0","TIMESTAMP":"2017-05-19T09:39:57","DSRC":"TER","UTC_SECONDS":"54","SHIPNAME":"DORNUM","SHIPTYPE":"70","CALLSIGN":"V2OZ","FLAG":"AG","LENGTH":"81.7900009","WIDTH":"11.3000002","GRT":"1662","DWT":"2369","DRAUGHT":"44","YEAR_BUILT":"1993","ROT":"6","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"GREENORE","ETA":"2017-05-20T08:00:00","CURRENT_PORT":"","LAST_PORT":"BILBAO ANCH","LAST_PORT_TIME":"2017-05-16T15:37:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"20648","LAST_PORT_UNLOCODE":"","LAST_PORT_COUNTRY":"ES","NEXT_PORT_ID":"251","NEXT_PORT_UNLOCODE":"IEGRN","NEXT_PORT_NAME":"GREENORE","NEXT_PORT_COUNTRY":"IE","ETA_CALC":"2017-05-21T09:55:00","ETA_UPDATED":"2017-05-19T09:07:00","DISTANCE_TO_GO":"407","DISTANCE_TRAVELLED":"364","AVG_SPEED":"8.5","MAX_SPEED":"8.80000019"},
{"MMSI":"215819000","IMO":"9034731","SHIP_ID":"150559","LAT":"47.926899","LON":"-5.531450","SPEED":"122","HEADING":"162","COURSE":"157","STATUS":"0","TIMESTAMP":"2017-05-19T09:44:27","DSRC":"TER","UTC_SECONDS":"28","SHIPNAME":"TOUR MARGAUX","SHIPTYPE":"81","CALLSIGN":"9HBW8","FLAG":"MT","LENGTH":"113.639999","WIDTH":"17.7000008","GRT":"5499","DWT":"8674","DRAUGHT":"64","YEAR_BUILT":"1993","ROT":"0","TYPE_NAME":"Oil/Chemical Tanker","AIS_TYPE_SUMMARY":"Tanker","DESTINATION":"BILBAO","ETA":"2017-05-20T16:00:00","CURRENT_PORT":"","LAST_PORT":"HAMBURG","LAST_PORT_TIME":"2017-05-16T15:04:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"172","LAST_PORT_UNLOCODE":"DEHAM","LAST_PORT_COUNTRY":"DE","NEXT_PORT_ID":"1271","NEXT_PORT_UNLOCODE":"ESBIO","NEXT_PORT_NAME":"BILBAO","NEXT_PORT_COUNTRY":"ES","ETA_CALC":"2017-05-20T11:27:00","ETA_UPDATED":"2017-05-19T09:13:00","DISTANCE_TO_GO":"295","DISTANCE_TRAVELLED":"782","AVG_SPEED":"12","MAX_SPEED":"13.3999996"},
{"MMSI":"255925000","IMO":"9184433","SHIP_ID":"300518","LAT":"-23.691086","LON":"-46.7832217","SPEED":"79","HEADING":"316","COURSE":"311","STATUS":"0","TIMESTAMP":"2017-05-19T09:43:53","DSRC":"TER","UTC_SECONDS":"52","SHIPNAME":"BULNES","SHIPTYPE":"70","CALLSIGN":"CQWC","FLAG":"PT","LENGTH":"85.6600037","WIDTH":"13.0200005","GRT":"2469","DWT":"3700","DRAUGHT":"58","YEAR_BUILT":"2001","ROT":"22","TYPE_NAME":"General Cargo","AIS_TYPE_SUMMARY":"Cargo","DESTINATION":"SAINT MALO","ETA":"2017-05-20T09:00:00","CURRENT_PORT":"","LAST_PORT":"BAYONNE","LAST_PORT_TIME":"2017-05-17T16:05:00","CURRENT_PORT_ID":"","CURRENT_PORT_UNLOCODE":"","CURRENT_PORT_COUNTRY":"","LAST_PORT_ID":"508","LAST_PORT_UNLOCODE":"FRBAY","LAST_PORT_COUNTRY":"FR","NEXT_PORT_ID":"500","NEXT_PORT_UNLOCODE":"FRSML","NEXT_PORT_NAME":"SAINT MALO","NEXT_PORT_COUNTRY":"FR","ETA_CALC":"2017-05-20T09:11:00","ETA_UPDATED":"2017-05-19T09:43:00","DISTANCE_TO_GO":"183","DISTANCE_TRAVELLED":"333","AVG_SPEED":"7.80000019","MAX_SPEED":"8.5"}]


app.listen(port, function(){
    console.log("Porta funcionando!")

});

app.get('/', (req , res) => {
    res.render('home');                 //determinando a rota vew pagina principal
});

app.get('/sobre', (req , res) => {
    res.render('sobre');                 //determinando a rota vew pagina sobre
});
app.get('/maps', (req , res) => {
    res.render('maps');                 //determinando a rota vew pagina maps
   
});

app.get('/team', (req , res) => {
    res.render('team');                 //determinando a rota vew pagina team
         
});

app.get('/mapageral', (req , res) => {
    res.render('mapageral');                 //determinando a rota vew pagina principal
         
});


app.get('/apimarine', (req , res) => {

    res.send(apiteste);                 //enviando dados da API
});

app.get('/login', (req , res) => {
    res.render('login');                 //determinando a rota vew pagina login
});

app.get('/cadastrar', (req , res) => {
    res.render('cadastrar');                 //determinando a rota vew pagina cadastar
});

app.get('/gerenciar', (req , res) => {
    res.render('gerenciar');                 //determinando a rota vew pagina login
});

app.get('/gerenciar/alterar', (req , res) => {
    res.render('gerenciaalterar');                 //determinando a rota vew pagina login
});

app.get('/perfil', (req , res) => {
    res.render('perfil');                 //determinando a rota vew pagina login
});




// registrando profissional
app.post('/cadastrar/',(req,res,next)=>{
    
    let post_data = req.body; //pegando parametros do POST

    let plaint_password = post_data.password; // pegando parametros do form post

    let hash_data = saltHashPassword(plaint_password);

    let password = hash_data.passwordHash; // pegando valor hash

    let salt = hash_data.salt; //get salt

    let name = post_data.name;
    let email = post_data.email;

    con.query('SELECT * FROM usuario_pratico where email=?',[email], function(err,result,fields){ //procurando se existe email na tabela profissionais
        con.on('error',function(err){
            console.log('[MySQL ERROR]',err);
        });

        if(result && result.length)
            res.json('Usuario Existente!!!'); //retornando caso tenha
        else        
        {                    // caso nao tenha em nenhuma das 2 tableas crie um novo usuario profissional       
                    con.query('INSERT INTO `usuario_pratico`(`name`, `email`, `encrypted_password`, `salt`, `created_at`, `updated_at`) VALUES (?,?,?,?,NOW(),NOW())',[name,email,password,salt],
                    function(err,result,fields){
                        con.on('error',function(err){
                            console.log('[MySQL ERROR',err);

                            res.render('home');
                            //res.json('Erro ao Registrar:',err );
                            
                        });

                        res.json('Registrado com sucesso!');
                    })   
                }
                });
        
    });




//Login
app.post('/loginauth/',(req,res,next)=>{
    let post_data = req.body;

    //extrai senha e email para o request
    let user_password = post_data.password;
    let email = post_data.email;

    con.query('SELECT * FROM usuario_pratico where email=?',[email], function(err,result,fields){
        con.on('error',function(err){
            console.log('[MySQL ERROR]',err);
        });


        if(result && result.length) //caso encontre email colete a senha e  o email para comparação ao banco na tablea usuario_profissional
        {
            
            let salt = result[0].salt;  //pega resultado salt caso seja um conta existente
            let encrypted_password = result[0].encrypted_password;
            // hash passaword do login co salt no banco de dados
            let hashed_password = checkHashPassword(user_password,salt).passwordHash;

            if(encrypted_password == hashed_password){

               
                console.log(JSON.stringify(result,['id','name','email']))
                res.end(JSON.stringify(result,['id','name','email']));
              
               // res.render('home');
               // res.end(JSON.stringify(result[0]),console.log(`Usuario logou ${email}`),) // se senha for verdadeira , retorna todos informações do usuario
                    
                }
             else
                    res.end(JSON.stringify('Senha digitada inválida'));    

             }
        else //caso não encontre em nehuma tabela, usuario nao exite
        {
            res.json('Usuario Não Existente!!!');
        }
    });

})


app.get('/gerenciausuarios', (req , res) => {

    con.query('SELECT * FROM usuario_pratico',function(error,result,fields){
        con.on('error',function(err){
            console.log('[MYSQL]ERROR',err);
        });
            if(result && result.length)
            {
                res.end(JSON.stringify(result,['id','name','email']));
            }
            else
            {
                res.end(JSON.stringify('Sem historico de usuarios'));
            }
    });
    
})

//alterar user
app.post('/atualizar',(req,res,next)=>{

    let post_data = req.body; //pegando parametros do POST

    let plaint_password = post_data.password; // pegando parametros do form post

    let hash_data = saltHashPassword(plaint_password);

    let password = hash_data.passwordHash; // pegando valor hash

    let salt = hash_data.salt; //get salt

    let name = post_data.name;
    let id = post_data.id;
    let email = post_data.email;

           
    con.query('SELECT * FROM usuario_pratico where id=?',[id], function(err,result,fields){
        con.on('error',function(err){
            console.log('[MySQL ERROR]',err);
        });


            if(result && result.length)
            {
          
           
          //      UPDATE `usuario_pratico` SET `name` = 'Hericles Gustavo Araujo de Melo', `email` = 'teste@gmail.com' WHERE `usuario_pratico`.`id` = 6;

          query = "UPDATE `usuario_pratico` SET `name` = " +`"${name}" , `+ " `encrypted_password` =  " +`"${password}"  , `+ " `salt` =  " +`"${salt}" , ` +  "`updated_at` = NOW() " + " WHERE `usuario_pratico`.`id` = " +id;
            
           
                con.query(query,function(err,result,fields){
                    con.on('error',function(err){
                        console.log('[MYSQL]ERROR',err);
                    
                    });
                            if(result)
                            {

                                    //res.end(JSON.stringify(result));
                                   res.render('home');
                                    
                            }
                            else
                            { 
                            
                                res.end(JSON.stringify('Erro ao atualizar valor'));
                                console.log(query)
                        }  
                });

                  
            }
            else        
            {   
                res.json('erro ao atualizar');
            } 
            
            
        });   

        });

    
