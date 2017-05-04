const dgram = require('dgram');
const server = dgram.createSocket('udp4');

var point={x:3,y:3};
var vezEnum=["usuario1","usuario2"];
var vez=vezEnum[0];
var message = new Buffer(JSON.stringify(point));
var PORT = 33333;
var HOST = '127.0.0.1';
var PORT2 = 33333;
var HOST2 = '127.0.0.1';

var user1Field=[
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0]
];

var user2Field=[
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0],
  [0,0,0,1,0,0,0,0,1,0]
];

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  var params=JSON.parse(msg);
  var mensagem=params.sucesso ? 'Acertou':'Falhou';
  console.log(params.user + " Levou Ataque que " + mensagem);
  if(params.user==vezEnum[0]){
    user1Field=params.field;
  }else{
    user2field=params.field;
  }
  printCampo(params.field);
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);

var stdin = process.openStdin();

function atacar(point){
  point.x--;
  point.y--;
  var field= getField();
  var target=vez==vezEnum[0] ? vezEnum[1]:vezEnum[0];
  if(field[point.y] && field[point.y][point.x]!=undefined){
    var sucesso;
    if(field[point.y][point.x]==1){
      sucesso=true;
      console.log(vez+ ' Acertou '+target +' no ponto ' + getPonto(point));
      field[point.y][point.x]=0;
    }else{
      sucesso=false;
      console.log(vez+ ' Errou ' +target +' no ponto ' + getPonto(point));
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
}

function printCampo(field){
  for(var i=0;i<field.length;i++){
    var print="";
    for(var j=0;j<field[i].length;j++){
      print=print+(field[i][j]==1 ? '+':'-');
    }
    console.log(print);
  }
}

function trocaVez(){
  vez==vezEnum[0] ? vez=vezEnum[1]:vez=vezEnum[0];
}

function getPonto(point){
  return "("+(point.x+1)+","+(point.y+1)+")";
}

stdin.addListener("data", function(d) {
    console.log("you entered: [" +
    d.toString().trim().charAt(0) +","+d.toString().trim().charAt(1)+ "]");
    point.x=Number(d.toString().trim().charAt(0));
    point.y=Number(d.toString().trim().charAt(1));
    atacar(point);
});
