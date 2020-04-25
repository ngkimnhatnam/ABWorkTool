$("h1").click(function(){
	generatePassword()
})
$("#dice").click(function(){
	$("#password").val(generatePassword());
})
var characterArray = [	"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"
];

function generatePassword(){
	var sum = "";
	var charIndex;
	for(var i=0;i<8;i++){
		charIndex = getRandomInt(0, characterArray.length);
		sum = sum + characterArray[charIndex];
	}
	console.log(sum);
	return sum;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}






