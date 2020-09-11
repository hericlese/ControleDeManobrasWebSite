const crypto = require('crypto');
const uuid = require('uuid');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { exit } = require('process');
const PORT = 3001;


//conexão com mysql
const con = mysql.createConnection({
host:'localhost',
user:'root',
password: '',
database: 'EncontreJaDatabase'

});

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
    let passwordData= sha512(userPassword,salt);
    return passwordData;
}

function checkHashPassword(userPassword,salt)
{
    let passwordData = sha512(userPassword,salt);
    return passwordData;

}

const app = express();
app.use(bodyParser.json()); //Aceitar parametros Json
app.use(bodyParser.urlencoded({extended: true})); //aceitar parametros de URL codificada

//Start servidor local
app.listen(PORT, () =>{
    console.log(`Servidor Rodando na porta ${PORT}`);
})




// registrando profissional
app.post('/registrarusuario/',(req,res,next)=>{
    let post_data = req.body; //pegando parametros do POST
    let uid = uuid.v4(); // pegando codigo uuid v4
    let plaint_password = post_data.password; // pegando parametros do form post
    let hash_data = saltHashPassword(plaint_password);
    let password = hash_data.passwordHash; // pegando valor hash
    let salt = hash_data.salt; //get salt

    let name = post_data.name;
    let email = post_data.email;
    let email_contato = post_data.email_contato;
    let empresa = post_data.email_contato;
    let data = post_data.data;
    let telefone = post_data.telefone;
    let sexo = post_data.sexo;
    let cidade = post_data.cidade;
    let estado = post_data.estado;

    con.query('SELECT * FROM usuario_profissional where email=?',[email], function(err,result,fields){ //procurando se existe email na tabela profissionais
        con.on('error',function(err){
            console.log('[MySQL ERROR]',err);
        });

        if(result && result.length)
            res.json('Usuario Existente!!!'); //retornando caso tenha
        else        
        { //caso nao tenha busque se tem na tabela empresa
            con.query('SELECT * FROM usuario_empresa where email=?',[email], function(err,result,fields){
                con.on('error',function(err){
                    console.log('[MySQL ERROR]',err);
                });

                if(result && result.length){        //caso tenha retorna resposta            
                    res.json('Usuario existente, cadastre-se com outro email!');
                }    
                else        
                {                       // caso nao tenha em nenhuma das 2 tableas crie um novo usuario profissional       
                    con.query('INSERT INTO `usuario_profissional`(`unique_id`, `name`, `email`, `encrypted_password`, `salt`, `email_contato`, `empresa`, `data`, `telefone`, `sexo`, `cidade`, `estado`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())',[uid,name,email,password,salt,email_contato,empresa,data,telefone,sexo,cidade,estado],
                    function(err,result,fields){
                        con.on('error',function(err){
                            console.log('[MySQL ERROR',err);
                            res.json('Erro ao Registrar:',err );
                        });
                        res.json('Registrado com sucesso!');
                    })   
                }
                });
        }
    });
})



// registrando empresa
app.post('/registrarempresa/',(req,res,next)=>{
    let post_data = req.body; //pegando parametros do POST
    let uid = uuid.v4(); // pegando codigo uuid v4
    let plaint_password = post_data.password; // pegando parametros do form post
    let hash_data = saltHashPassword(plaint_password);
    let password = hash_data.passwordHash; // pegando valor hash
    let salt = hash_data.salt; //get salt

    let name = post_data.name;
    let email = post_data.email;
    let empresa = post_data.empresa;
    let responsavel = post_data.responsavel;
    let description = post_data.description;
    let email_contato = post_data.email_contato;   

con.query('SELECT * FROM usuario_empresa where email=?',[email], function(err,result,fields){ //procurando se existe email na tabela empresas
    con.on('error',function(err){
        console.log('[MySQL ERROR]',err);
    });

    if(result && result.length)
        res.json('Usuario existente, cadastre-se com outro email!'); //retornando caso tenha
    else        
    { //caso nao tenha busque se tem na tabela profissional
        con.query('SELECT * FROM usuario_profissional where email=?',[email], function(err,result,fields){
            con.on('error',function(err){
                console.log('[MySQL ERROR]',err);
            });

            if(result && result.length){  //caso tenha retorna resposta            
                res.json('Usuario existente, cadastre-se com outro email!');
            }    
            else        
            {          // caso nao tenha em nenhuma das 2 tableas crie um novo usuario profissional       
                con.query('INSERT INTO `usuario_empresa`(`nique_id`, `name`, `email`, `encrypted_password`, `salt`, `empresa`, `responsavel`, `description_empresa`,`email_contato`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())',[uid,name,email,password,salt,empresa,responsavel,description,email_contato],
                function(err,result,fields){
                    con.on('error',function(err){
                        console.log('[MySQL ERROR',err);
                        res.json('Erro ao Registrar:',err );
                    });
                    
                    res.json('Registrado com sucesso!');
                })   
            }
            });
    }
});
})



//Login
app.post('/login/',(req,res,next)=>{
    let post_data = req.body;

    //extrai senha e email para o request
    let user_password = post_data.password;
    let email = post_data.email;

    con.query('SELECT * FROM usuario_profissional where email=?',[email], function(err,result,fields){
        con.on('error',function(err){
            console.log('[MySQL ERROR]',err);
        });

        if(result && result.length) //caso encontre email colete a senha e  o email para comparação ao banco na tablea 
        {
                    let salt = result[0].salt;  //pega resultado salt caso seja um conta existente
                    let encrypted_password = result[0].encrypted_password;
                    // hash passaword do login co salt no banco de dados
                    let hashed_password = checkHashPassword(user_password,salt).passwordHash;
                                    
                    if(encrypted_password == hashed_password)
                        res.end(JSON.stringify(result[0]),console.log(`Usuario logou ${email}`)) // se senha for verdadeira , retorna todos informações do usuario
                        
                        
                    else
                        res.end(JSON.stringify('Senha digitada inválida'));        
        }

        else    //caso não encontre email busque na tabela empresa e colete a senha o email para comparação ao banco
       
        {                   con.query('SELECT * FROM usuario_empresa where email=?',[email], function(err,result,fields){
                            con.on('error',function(err){
                                console.log('[MySQL ERROR]',err);
                            });

                            if(result && result.length)
                            {
                        
                                let salt = result[0].salt;  //pega resultado salt caso seja um conta existente
                                let encrypted_password = result[0].encrypted_password;
                                // hash passaword do login co salt no banco de dados
                                let hashed_password = checkHashPassword(user_password,salt).passwordHash;
                                
                                if(encrypted_password == hashed_password)
                                
                                    res.end(JSON.stringify(result[0]),console.log(`Usuario logou ${email}`)) // se senha for verdadeira , retorna todos informações do usuario
                                    
                                else
                                    res.end(JSON.stringify('Senha digitada inválida'))       
                            }
                            else //caso não encontre em nehuma tabela, usuario nao exite
                            {
                                res.json('Usuario Não Existente!!!');
                            }
        })
     }
        
    });

})




// Cadastrar Vagas 
app.post('/cadastrarvagas/',(req,res,next)=>{
    let post_data = req.body; //pegando parametros do POST
  
    let id_empresa = post_data.id_empresa;
    let cargo = post_data.cargo;
    let empresa = post_data.empresa;
    let competencia1 = post_data.competencia1;
    let competencia1nivel = post_data.competencia1nivel;
    let competencia2 = post_data.competencia2;
    let competencia2nivel = post_data.competencia2nivel;
    let competencia3 = post_data.competencia3;
    let competencia3nivel = post_data.competencia3nivel;  
    let vagas = post_data.vagas;  
    let description = post_data.description;  
    let contrato = post_data.contrato;     
    let cidade = post_data.cidade;
    let estado = post_data.estado;
            

    
                con.query('INSERT INTO `empresa_vagas`(`cargo`, `empresa`, `competencia_1`, `competencia_1_nivel`, `competencia_2`, `competencia_2_nivel`, `competencia_3`, `competencia_3_nivel`, `vagas`, `description`, `fk_empresa`, `contrato`,`cidade`,`estado`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[cargo,empresa,competencia1,competencia1nivel,competencia2,competencia2nivel,competencia3,competencia3nivel,vagas,description,id_empresa,contrato,cidade,estado],
             
                function(err,result,fields){
                    con.on('error',function(err){
                        console.log('[MySQL ERROR',err);
                        res.json('Erro ao Registrar:',err );
                    });
                    
                    res.json('Vaga registrada com sucesso!'),
                    res.end(console.log(`Inserindo ${cargo} ${empresa} ${competencia1} ${competencia1nivel} ${competencia2} ${competencia2nivel} ${competencia3} ${competencia3nivel} ${vagas} ${description} ${id_empresa} ${contrato} ${cidade} ${estado}` ));
                })   
 
 })




 // Cadastrar Curriculos
app.post('/cadastrarcurriculo/',(req,res,next)=>{
    let post_data = req.body; //pegando parametros do POST
  
    let id_usuario = post_data.id_usuario;
    let name = post_data.name;
    let objetivo = post_data.objetivo;
    let formacao = post_data.formacao;
    let experiencia1 = post_data.experiencia1;
    let experiencia2 = post_data.experiencia2;
    let experiencia3 = post_data.experiencia3;
    let cursos = post_data.cursos;
    let links = post_data.links;  
    let competenciaextra = post_data.competenciaextra;


    let competencia1 = post_data.competencia1;
    let nivel1 = post_data.nivel1;
    let competencia2 = post_data.competencia2;
    let nivel2 = post_data.nivel2;
    let competencia3 = post_data.competencia3;
    let nivel3 = post_data.nivel3;

    let chave1 = post_data.chave1;
    let chave2 = post_data.chave2;
    let chave3 = post_data.chave3;
    let chave4 = post_data.chave4;
    let chave5 = post_data.chave5;
    let cidade = post_data.cidade;
    let estado = post_data.estado;
    let sexo = post_data.sexo;
    let idade = post_data.idade

                //inserindo Curriculo ao banco
                con.query('INSERT INTO `usuario_curriculo`(`name`, `objetivo`, `formacao`, `experiencia_1`, `experiencia_2`, `experiencia_3`, `cursos`, `links`, `competencia_extras`, `fk_profissional`, `chave1`, `chave2`, `chave3`, `chave4`, `chave5`, `competencia1`, `nivel1`, `competencia2`, `nivel2`, `competencia3`, `nivel3`, `cidade_curriculo`, `estado_curriculo`, `sexo_curriculo`, `idade`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[name,objetivo,formacao,experiencia1,experiencia2,experiencia3,cursos,links,competenciaextra,id_usuario,chave1,chave2,chave3,chave4,chave5,competencia1,nivel1,competencia2,nivel2,competencia3,nivel3,cidade,estado,sexo,idade],
             
                function(err,result,fields){
                    con.on('error',function(err){
                        console.log('[MySQL ERROR',err);
                        res.json('Erro ao Registrar:',err );
                    });
                

                    res.json('Curriculo registrado com sucesso!'),
                    res.end(console.log(`Inserindo Curriculo: ${name} ${objetivo} ${formacao} ${experiencia2} ${experiencia3} ${cursos} ${links} ${competenciaextra} ${id_usuario}` ));
                    res.end(console.log(`Inserindo Competencias: ${competencia1} ${nivel1}  \n ${competencia2} ${nivel2} \n ${competencia3} ${nivel3} \n ${chave1}${chave2}${chave3}${chave4}${chave5}`, ));

});
})




app.get("/cargosbase",(req,res,next)=>{
    con.query('SELECT * FROM empresa_vagas',function(error,result,fields){
        con.on('error',function(err){
            console.log('[MYSQL]ERROR',err);
        });
            if(result && result.length)
            {
                res.end(JSON.stringify(result,['cargo']));
            }
            else
            {
                res.end(JSON.stringify('Sem historico de cargos'));
            }
    });
    
})



app.post("/buscarvagas",(req,res,next)=>{
    
    let post_data = req.body;

    let cargo1 = post_data.cargo1;
    
    let competencia1 = post_data.competencia1;
    if (competencia1 == undefined){
        competencia1 = "";
    }
    let competencia1nivel = post_data.competencia1nivel;
    if (competencia1nivel == undefined){
        competencia1nivel = "";
    }
    let competencia2 = post_data.competencia2;
    if (competencia2 == undefined){
        competencia2 = "";
    }
    let competencia2nivel = post_data.competencia2nivel;
    if (competencia2nivel == undefined){
        competencia2nivel = "";
    }
    let competencia3 = post_data.competencia3;
    if (competencia3 == undefined){
        competencia3 = "";
    }
    let competencia3nivel = post_data.competencia3nivel;
    if (competencia3nivel == undefined){
        competencia3nivel = "";
    }
   
    let estado = post_data.estado;
    if (estado == undefined){
        estado = "";
    }
    let cidade = post_data.cidade;
    if (cidade == undefined){
        cidade = "";
    }


    //Filtro de busca, todas as combinações de competencia apartir de 3 campos diferentes de ordens diferentes

    let query = `SELECT * FROM empresa_vagas WHERE cargo LIKE ('%${cargo1}%')
                AND competencia_1 LIKE '%${competencia1}%' and competencia_2 LIKE '%${competencia2}%' and competencia_3 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'
                or cargo LIKE ('%${cargo1}%') and  competencia_1 LIKE '%${competencia1}%' and competencia_3 LIKE '%${competencia2}%' and competencia_2 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'
                or cargo LIKE ('%${cargo1}%') and  competencia_2 LIKE '%${competencia1}%' and competencia_3 LIKE '%${competencia2}%' and competencia_1 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'
                or cargo LIKE ('%${cargo1}%') and  competencia_2 LIKE '%${competencia1}%' and competencia_2 LIKE '%${competencia2}%' and competencia_3 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'
                or cargo LIKE ('%${cargo1}%') and  competencia_3 LIKE '%${competencia1}%' and competencia_1 LIKE '%${competencia2}%' and competencia_2 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'
                or cargo LIKE ('%${cargo1}%') and  competencia_3 LIKE '%${competencia1}%' and competencia_2 LIKE '%${competencia2}%' and competencia_1 LIKE '%${competencia3}%' and cidade like '%${cidade}%' and estado LIKE '%${estado}%'`; 
          
    console.log(query);

    con.query(query,function(err,result,fields){
        con.on('error',function(err){
            console.log('[MYSQL]ERROR',err);
        
        });
                if(result && result.length && cargo1 != "")
                {

                        res.end(JSON.stringify(result));

                        console.log(`result json${result}`);
                }
                else
                { 
                   
                    res.end(JSON.stringify('Sem vagas com esses parametros, tente buscar por outro cargo'));
            }  
    });

})


app.get("/cargosbase",(req,res,next)=>{
    con.query('SELECT * FROM empresa_vagas',function(error,result,fields){
        con.on('error',function(err){
            console.log('[MYSQL]ERROR',err);
        });
            if(result && result.length)
            {
                res.end(JSON.stringify(result,['cargo']));
            }
            else
            {
                res.end(JSON.stringify('Sem historico de cargos'));
            }
    });
    
});




app.post("/buscarprofissional",(req,res,next)=>{
    
    let post_data = req.body;

    let cargo1 = post_data.cargo1;
    if (cargo1 == undefined){
        cargo1 = "";
    }

    let competencia1 = post_data.competencia1;
    if (competencia1 == undefined){
        competencia1 = "";
    }
    let competencia1nivel = post_data.competencia1nivel;
    if (competencia1nivel == undefined){
        competencia1nivel = "";
    }
    let competencia2 = post_data.competencia2;
    if (competencia2 == undefined){
        competencia2 = "";
    }
    let competencia2nivel = post_data.competencia2nivel;
    if (competencia2nivel == undefined){
        competencia2nivel = "";
    }
    let competencia3 = post_data.competencia3;
    if (competencia3 == undefined){
        competencia3 = "";
    }
    let competencia3nivel = post_data.competencia3nivel;
    if (competencia3nivel == undefined){
        competencia3nivel = "";
    }
   
    let estado = post_data.estado;
    if (estado == undefined){
        estado = "";
    }
    let cidade = post_data.cidade;
    if (cidade == undefined){
        cidade = "";
    }


    //Filtro de busca, todas as combinações de competencia apartir de 3 e 5 cargos diferentes campos diferentes de ordens diferentes 

    let querybusca = `  
SELECT * FROM usuario_curriculo WHERE cidade_curriculo LIKE '%${cidade}%' and estado_curriculo  LIKE '%${estado}%'and competencia1 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
AND chave1 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' AND competencia1 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND  chave1 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
and  chave1 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
and chave1 LIKE '%${cargo1}%' 
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND chave1 LIKE  '%${cargo1}%'
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
AND chave1 LIKE  '%${cargo1}%'


or cidade_curriculo LIKE '%${cidade}%' and estado_curriculo  LIKE '%${estado}%'and competencia1 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
AND chave2 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' AND competencia1 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND  chave2 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
and  chave2 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
and chave2 LIKE '%${cargo1}%' 
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND chave2 LIKE  '%${cargo1}%'
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
AND chave2 LIKE  '%${cargo1}%'



    or cidade_curriculo LIKE '%${cidade}%' and estado_curriculo  LIKE '%${estado}%'and competencia1 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
AND chave3 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' AND competencia1 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND  chave3 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
and  chave3 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
and chave3 LIKE '%${cargo1}%' 
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND chave3 LIKE  '%${cargo1}%'
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
AND chave3 LIKE  '%${cargo1}%'



    or cidade_curriculo LIKE '%${cidade}%' and estado_curriculo  LIKE '%${estado}%'and competencia1 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
AND chave4 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' AND competencia1 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND  chave4 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
and  chave4 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
and chave4 LIKE '%${cargo1}%' 
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND chave4 LIKE  '%${cargo1}%'
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
AND chave4 LIKE  '%${cargo1}%'


        or cidade_curriculo LIKE '%${cidade}%' and estado_curriculo  LIKE '%${estado}%'and competencia1 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
AND chave5 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' AND competencia1 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND  chave5 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia3 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
and  chave5 LIKE '%${cargo1}%'
or cidade_curriculo LIKE  '%%' and estado_curriculo  LIKE '%${estado}%' and competencia2 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia3 LIKE '%${competencia3}%'
and chave5 LIKE '%${cargo1}%' 
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia1 LIKE '%${competencia2}%' and competencia2 LIKE '%${competencia3}%'
AND chave5 LIKE  '%${cargo1}%'
or cidade_curriculo like  '%%' and estado_curriculo  LIKE '%${estado}%'  and competencia3 LIKE '%${competencia1}%' and competencia2 LIKE '%${competencia2}%' and competencia1 LIKE '%${competencia3}%'
AND chave5 LIKE  '%${cargo1}%'
  
    `            
    con.query(querybusca,function(err,result,fields){
        con.on('error',function(err){
            console.log('[MYSQL]ERROR',err);
        
        });
        console.log(`${cargo1}/${competencia1}`);
                if(result && result.length && cargo1 != "" || competencia1 != "")
                {
                        res.end(JSON.stringify(result));

                        console.log(querybusca);
                }
                else
                { 
                   
                res.end(JSON.stringify('Sem Profissionais com esses parametros, tente buscar por outro cargo ou competencia'));

                console.log(querybusca);

        
                       
                }  
    });

});





/*


*/

/*

Algoritimo inner join 
 // coletando so ID para innerjoin
                    var id = (JSON.stringify(result,['id']));   
                
                      //Enner Join email contato e descrição da empresa
                    let queryinner = `SELECT email_contato,description_empresa FROM usuario_empresa INNER JOIN empresa_vagas ON usuario_empresa.id = empresa_vagas.fk_empresa WHERE fk_empresa = ${id}`
                        
                    con.query(queryinner,function(err,result,fields){
                        con.on('error',function(err){
                            console.log('[MYSQL]ERROR',err);
                        });  
                        
                          console.log(`result inner${result}`);

                    });
                    */
