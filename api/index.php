<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
if(isset($_POST['name']) && isset($_POST['score'])){
  saveScore();
}else{
  getScore();
}

function getConn(){
  return new PDO('mysql:host=localhost;dbname=dkranking','root','',array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
}
function getScore(){
  $stmt = getConn()->query("SELECT * FROM score ORDER BY score DESC LIMIT 50");
  $scores = $stmt->fetchAll(PDO::FETCH_OBJ);
  echo json_encode($scores);
}
 function saveScore(){
  try {
    $name  = @$_POST['name'];
    $score = @$_POST['score'];
    $stmt = getConn();
    $stmt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt->prepare("INSERT INTO `score` (`name`, `score`) VALUES (:name, :score)")->execute(array(
        ':name'  => $name,
        ':score' => $score
      ));
    echo json_encode(array('message' => 'ok'));
  } catch(PDOException $e) {
    echo json_encode(array('message' => 'error', 'error' => $e->getMessage()));
  }
}