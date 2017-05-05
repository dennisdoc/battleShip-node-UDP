const dgram = require('dgram');
const server = dgram.createSocket('udp4');

var point={x:3,y:3};
var vezEnum=["usuario1","usuario2"];
var usuarioAtual=null;
var vez=vezEnum[0];
var message = new Buffer(JSON.stringify(point));
var PORT2 = 33333;
var HOST2 = '192.168.100.39';

var PORT = 33334;
var HOST = '127.0.0.1';

var user1Field=generateField(9,9);

var user2Field=generateField(9,9);

function generateField(sizeY,sizeX){
  var field=[];
  var numberBoats=0;
  var limit=12;
  for(var i=0;i<sizeY;i++){
    var line=[];
    for(var j=0;j<sizeX;j++){
      var value;
      if(numberBoats>=limit){
        value=0;
      }else{
        value=Math.random() >= 0.15 ? 0:1;
        if(value==1){
          numberBoats++;
        }
      }
      line.push(value);
    }
    field.push(line)
  }
  return field;
}

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  var params=JSON.parse(msg);
  var mensagem=params.sucesso ? 'Acertou':'Falhou';
  console.log("Voce Levou Ataque que " + mensagem);
  vez=params.user;
  setUsuarioAtual(vez);
  if(params.user==vezEnum[0]){
    user1Field=params.field;
  }else{
    user2field=params.field;
  }
  printCampo(params.field);
  verificaTermino(params.field);
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT,HOST);

var stdin = process.openStdin();

function setUsuarioAtual(usuario){
  if(usuarioAtual==null){
    usuarioAtual=usuario;
  }
}

function atacar(point){
  if(vez==usuarioAtual || usuarioAtual==null){
    point.x--;
    point.y--;
    var field= getField();
    var target=vez==vezEnum[0] ? vezEnum[1]:vezEnum[0];
    setUsuarioAtual(vez);
    if(field[point.y] && field[point.y][point.x]!=undefined){
      var sucesso;
      if(field[point.y][point.x]==1){
        sucesso=true;
        console.log('Voce Acertou '+target +' no ponto ' + getPonto(point));
        field[point.y][point.x]=0;
      }else{
        sucesso=false;
        console.log('Voce Errou ' +target +' no ponto ' + getPonto(point));
      }
      console.log("Vez do "+target);
      verificaTermino(field);
      trocaVez();

      var message=new Buffer(JSON.stringify({user:vez,field:field,sucesso:sucesso}));
      server.send(message, 0, message.length, PORT2, HOST2, function(err, bytes) {
        if (err) throw err;
        // console.log('UDP message sent to ' + HOST2 +':'+ PORT2);
      });
    }else{
      console.log("Ponto Inexistente");
    }
  }else{
    console.log("Não e sua vez.Aguarde...");
    console.log("Seu campo:");
    printCampo(usuarioAtual==vezEnum[0] ?user1Field:user2Field);
  }
}

function getField(){
  return vez==vezEnum[0] ?user1Field:user2Field;
}

function verificaTermino(field){
  for(var i=0;i<field.length;i++){
    for(var j=0;j<field[i].length;j++){
      if(field[i][j]==1){
        return ;
      }
    }
  }
  console.log("Finished");
  server.close();
  process.exit()
}

function printCampo(field){
  if(usuarioAtual!=null){
    var xPrint=" x";
    for(var i=0;i<field.length;i++){
      var print="";
      for(var j=0;j<field[i].length;j++){
        if(i==0){
          var espaco=j >9  ? " ":"  ";
          xPrint=xPrint+espaco+(j+1);
        }
        print=print+(field[i][j]==1 ? ' + ':' - ');
      }
      if(i==0){
        console.log(xPrint);
        console.log("y");
      }
      var espacoy=i >9  ? "":"  ";
      console.log((i+1) +espacoy+print);
    }
  }
}

function trocaVez(){
  vez==vezEnum[0] ? vez=vezEnum[1]:vez=vezEnum[0];
}

function getPonto(point){
  return "("+(point.x+1)+","+(point.y+1)+")";
}

stdin.addListener("data", function(d) {
    if(d.toString().indexOf(",")>0){
      var array=d.toString().split(",");
      console.log("you entered: [" +
      array[0] +","+array[1]+ "]");
      point.x=Number(array[0]);
      point.y=Number(array[1]);
      atacar(point);
    }else{
      console.log("digite formatdo correto: (x,y)");
    }
});
