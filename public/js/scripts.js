

  function senhaForm(){
    let senha = document.forms["registrar"]["password"].value;
    let senha2 = document.forms["registrar"]["password2"].value;  

    if(senha != senha2){                                      //senhas diferentes
      alert("Suas senhas estão diferentes");
      return false;
    }
  }




