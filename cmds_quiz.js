
const { User, Quiz, Score } = require("./model.js").models;
const scores = require("./cmds_score.js");

// Show all quizzes in DB including <id> and <author>
exports.list = async (rl) =>  {

  let quizzes = await Quiz.findAll(
    { include: [{
        model: User,
        as: 'author'
      }]
    }
  );
  quizzes.forEach( 
    q => rl.log(`  "${q.question}" (by ${q.author.name}, id=${q.id})`)
  );
}

// Create quiz with <question> and <answer> in the DB
exports.create = async (rl) => {

  let name = await rl.questionP("Enter user");
    let user = await User.findOne({where: {name}});
    if (!user) throw new Error(`User ('${name}') doesn't exist!`);

    let question = await rl.questionP("Enter question");
    if (!question) throw new Error("Response can't be empty!");

    let answer = await rl.questionP("Enter answer");
    if (!answer) throw new Error("Response can't be empty!");

    await Quiz.create( 
      { question,
        answer, 
        authorId: user.id
      }
    );
    rl.log(`   User ${name} creates quiz: ${question} -> ${answer}`);
}

// Test (play) quiz identified by <id>
exports.test = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let quiz = await Quiz.findByPk(Number(id));
  if (!quiz) throw new Error(`  Quiz '${id}' is not in DB`);

  let answered = await rl.questionP(quiz.question);

  if (answered.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
    rl.log(`  The answer "${answered}" is right!`);
  } else {
    rl.log(`  The answer "${answered}" is wrong!`);
  }
}


// Play quiz identified by <id>
exports.play = async (rl) => {
  
  let long = await Quiz.count();
  let quizzes_all = await Quiz.findAll();
  let quiz_p;
  let lista_ordenada =[];
  let elemento_lista;
  let lista_reordenada =[];
  let answered;
  let score = 0;


  // Crear una lista con los id de las preguntas
  quizzes_all.forEach(element => {
  lista_ordenada.push(element.id);
  })

  //lista nueva ordenada de manera aleatoria 
  for (i = 0; i < long ; i++){
    elemento_lista = lista_ordenada.splice((Math.floor(Math.random()*(long-i))),1);
    lista_reordenada.push(elemento_lista);
  };
  
  for (i = 0; i < long ; i++){ 
    quiz_p = await Quiz.findByPk(Number(lista_reordenada[i]));


    answered = await rl.questionP(quiz_p.question);
    if (answered.toLowerCase().trim()===quiz_p.answer.toLowerCase().trim()) {
      rl.log(`  The answer "${answered}" is right!`);
      score++;
    } else {
      rl.log(`  The answer "${answered}" is wrong!`);
      i = long;
      //rl.log(`   Score: ${score}`);
      //return;
    }
    
  };

  //Mostrar la puntuación
  rl.log(`   Score: ${score}`);

  //Pedir nombre para un nuevo registro en la tabla scores
  let name = await rl.questionP("Enter name");
  if (!name) throw new Error("Response can't be empty!");

  //Buscar el usuario en la base de datos para cargar la puntuación 
  let user = await User.findOne({
    where: {name},
  });

  if (!user) {
    await User.create( 
      { name, age: 0 }
    );

    user = await User.findOne({
      where: {name},
    });
  }

  let userId = user.id;

  let verif = await scores.create(userId,score);
  if(!verif) throw new Error("No se pudo crear la puntuación");

  //Guardar en la base de datos los puntos ganados en la columna win y el user.id en el alias userId al  cmds_score



  //Muestra los puntuación
  rl.log(`   User ${name} get ${score} points`);

}






// Update quiz (identified by <id>) in the DB
exports.update = async (rl) => {

  let id = await rl.questionP("Enter quizId");
  let quiz = await Quiz.findByPk(Number(id));

  let question = await rl.questionP(`Enter question (${quiz.question})`);
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP(`Enter answer (${quiz.answer})`);
  if (!answer) throw new Error("Response can't be empty!");

  quiz.question = question;
  quiz.answer = answer;
  await quiz.save({fields: ["question", "answer"]});

  rl.log(`  Quiz ${id} updated to: ${question} -> ${answer}`);
}

// Delete quiz & favourites (with relation: onDelete: 'cascade')
exports.delete = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let n = await Quiz.destroy({where: {id}});
  
  if (n===0) throw new Error(`  ${id} not in DB`);
  rl.log(`  ${id} deleted from DB`);
}

