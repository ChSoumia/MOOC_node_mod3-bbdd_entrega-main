const {User, Score} = require("./model.js").models;


//list para mostrar las puntuaciones de los usuarios ordenadas DESC
exports.list = async (rl) => {
    let scores_all = await Score.findAll(
      {include: [{model: User, as: 'player'}],
      order:[['wins','DESC']]
    
    }
        
      );

      scores_all.forEach(
        s =>  rl.log(`   ${s.player.name} | ${s.wins} | ${s.createdAt.toUTCString()}` ) 
       ); 

}

// Create para instancia y guardar las nuevas puntuaciones 
exports.create = async (userid,score) => {

  //Guarda en la base de datos los puntos ganados en la columna win y el user.id en el alias userId
  let verif = await Score.create(
    {wins: score,
    userId: userid}
  );

  if(!verif) throw new Error("No se pudo crear la puntuación");
  else   return 1;


}
