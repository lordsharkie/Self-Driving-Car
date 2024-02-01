const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

const N=50;
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}
//traffic
// const traffic = [];
// const carWidth = 30;
// const carHeight = 50;
// const numCars = 150;

// for (let i = 0; i < numCars; i++) {
//   let lane = Math.floor(Math.random() * 3); // Randomly choose one of the three lanes (0, 1, or 2)
//   let positionY = -i * 200 - 100; // Ensure no overlapping by spacing them apart
//   let color = getRandomColor();

//   traffic.push(new Car(road.getLaneCenter(lane), positionY, carWidth, carHeight, 'DUMMY', 2, color));
// }

// function getRandomColor() {
//   // This function generates a random color in the form of "rgb(R, G, B)"
//   const R = Math.floor(Math.random() * 256);
//   const G = Math.floor(Math.random() * 256);
//   const B = Math.floor(Math.random() * 256);
//   return `rgb(${R}, ${G}, ${B})`;
// }
const traffic = [];
const carWidth = 30;
const carHeight = 50;
const numCars = 50;

for (let i = 0; i < numCars; i++) {
  let lane;
  let positionY;

  if (i % 5 === 0) {
    // Send two cars on different lanes every 5 iterations
    lane = i % 2 === 0 ? 0 : 2; // Alternate between lanes 0 and 2
    positionY = -i * 200 - 100; // Ensure no overlapping by spacing them apart
  } else {
    lane = Math.floor(Math.random() * 3); // Randomly choose one of the three lanes (0, 1, or 2)
    positionY = -i * 200 - 100; // Ensure no overlapping by spacing them apart
  }

  let color = getRandomColor();
  traffic.push(new Car(road.getLaneCenter(lane), positionY, carWidth, carHeight, 'DUMMY', 2, color));
}

function getRandomColor() {
  // This function generates a random color in the form of "rgb(R, G, B)"
  const R = Math.floor(Math.random() * 256);
  const G = Math.floor(Math.random() * 256);
  const B = Math.floor(Math.random() * 256);
  return `rgb(${R}, ${G}, ${B})`;
}

const displaySavedButton = document.getElementById('display-saved-button');
displaySavedButton.addEventListener('click', displaySavedNetwork);
  function displaySavedNetwork () {
    let savedBestBrain = localStorage.getItem('bestBrain')
    if (savedBestBrain) {
      savedBestBrain = JSON.parse(savedBestBrain)
      console.log('Saved Neural Network:', savedBestBrain)
      alert('Saved Neural Network:\n' + JSON.stringify(savedBestBrain, null, 2))
    } else {
      alert('No saved neural network found.')
    }}

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}