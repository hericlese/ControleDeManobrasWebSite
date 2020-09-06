

  function unhideregistro(){

    registrarempresa.classList.add("hide");
    registrarpessoa.classList.remove("hide"); //escondendo escopo registro empresa e pessoas
    
  
  } 
  function unhideregistro2(){
    
    registrarpessoa.classList.add("hide");
    registrarempresa.classList.remove("hide");  //escondendo escopo registro empresa e pessoas
  
  }
  function senhaForm(){
    let senha = document.forms["registrar"]["password"].value;
    let senha2 = document.forms["registrar"]["password2"].value;  

    if(senha != senha2){                                      //senhas diferentes
      alert("Suas senhas estão diferentes");
      return false;
    }
  }


function senhaForm2(){
  let senha = document.forms["registrarempresaform"]["passwordempresa"].value;
  let senha2 = document.forms["registrarempresaform"]["password3"].value;  

  if(senha != senha2){                                      //senhas diferentes
    alert("Suas senhas estão diferentes");
    return false;
  }
}

