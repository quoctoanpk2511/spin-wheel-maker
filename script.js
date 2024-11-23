function processFileData(jsonData) {
  const wheel = document.getElementById("wheel");
  const spinBtn = document.getElementById("spin-btn");
  const finalValue = document.getElementById("final-value");
  const tableData = document.getElementById("table-data");

  const items = jsonData;

  //Create table data
  items.forEach((item) => {
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    td1.appendChild(document.createTextNode(item.id));
    td2.appendChild(document.createTextNode(item.title));
    tr.appendChild(td1);
    tr.appendChild(td2);
    tableData.appendChild(tr);
  })

  //Size of each piece
  const data = [];
  //Labels
  const labels = [];

  //Subtract degrees
  function subtractDegrees(degrees1, degrees2) {
    return (degrees1 - degrees2 + 360) % 360; // Return data [0, 360)
  }

  //Get random result by weight
  function weightedRandomDegree(data) {
    const totalWeight = data.reduce((total, item) => total + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < data.length; i++) {
      const { minDegree, maxDegree, weight } = data[i];
      random -= weight;
      if (random <= 0) {
        return Math.floor(Math.random() * (maxDegree - minDegree + 1) + minDegree);
      }
    }
  }

  const rotationValues = []
  const degreeRange = 360 / items.length;
  let startAngle = 90

  //Push data to object that stores values of minimum and maximum angle for a value
  for (let i = 0; i < items.length; i++) {
    data.push(1);
    labels.push(items[i].id)
    let subDegree = subtractDegrees(startAngle, degreeRange);
    if (startAngle == 0) {
      rotationValues.push({ minDegree: subDegree, maxDegree: 360, id: items[i].id, value: items[i].title, weight: items[i].weight });
    } else if (startAngle < degreeRange) {
      rotationValues.push({ minDegree: 0, maxDegree: startAngle, id: items[i].id, value: items[i].title, weight: items[i].weight });
      rotationValues.push({ minDegree: subDegree, maxDegree: 360, id: items[i].id, value: items[i].title, weight: items[i].weight });
    } else {
      rotationValues.push({ minDegree: subDegree, maxDegree: startAngle, id: items[i].id, value: items[i].title, weight: items[i].weight });
    }
    startAngle = subDegree;
  }

  //Background color for each piece
  var pieColors = [
    "#8b35bc",
    "#b163da",
    // "#8b35bc",
    // "#b163da",
    // "#8b35bc",
    // "#b163da",
  ];
  //Create chart
  let myChart = new Chart(wheel, {
    //Plugin for displaying text on pie chart
    plugins: [ChartDataLabels],
    //Chart Type Pie
    type: "pie",
    data: {
      //Labels(values which are to be displayed on chart)
      labels: labels,
      //Settings for dataset/pie
      datasets: [
        {
          backgroundColor: pieColors,
          data: data,
        },
      ],
    },
    options: {
      //Responsive chart
      responsive: true,
      animation: { duration: 0 },
      plugins: {
        //hide tooltip and legend
        tooltip: false,
        legend: {
          display: false,
        },
        //display labels inside pie chart
        datalabels: {
          color: "#ffffff",
          formatter: (_, context) => context.chart.data.labels[context.dataIndex],
          font: { size: 24 },
        },
      },
    },
  });

  //display value based on the randomAngle
  const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
      //if the angleValue is between min and max then display it
      if (angleValue > i.minDegree && angleValue <= i.maxDegree) {
        finalValue.innerHTML = `<p>Result: No ${i.id}</p>`;
        spinBtn.disabled = false;
        break;
      }
    }
  };

  //Spinner count
  let count = 0;
  //100 rotations for animation and last rotation for result
  let resultValue = 101;
  //Start spinning
  spinBtn.addEventListener("click", () => {
    let audio = new Audio("./music2.mp3");
    spinBtn.disabled = true;
    //Empty final value
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    //Generate random degrees to stop at
    let randomDegree = weightedRandomDegree(rotationValues);

    // let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
    // let randomDegree = 89;
    rotationValues.forEach((value) => {
      if (value.minDegree <= randomDegree && randomDegree <= value.minDegree + 3) {
        randomDegree = randomDegree + 3;
      }
    })
    //Interval for rotation animation
    let rotationInterval = window.setInterval(() => {
      //Set rotation for piechart
      /*
      Initially to make the piechart rotate faster we set resultValue to 101 so it rotates 101 degrees at a time and this reduces by 1 with every count. Eventually on last rotation we rotate by 1 degree at a time.
      */
      myChart.options.rotation = myChart.options.rotation + resultValue;
      //Update chart with new value;
      myChart.update();
      audio.play();
      //If rotation>360 reset it back to 0
      if (myChart.options.rotation >= 360) {
        count += 1;
        resultValue -= 5;
        myChart.options.rotation = 0;
      } else if (count > 15 && myChart.options.rotation == randomDegree) {
        audio.pause();
        valueGenerator(randomDegree);
        clearInterval(rotationInterval);
        count = 0;
        resultValue = 101;
        new Audio('./success.mp3').play();
      }
      // audio.play();
    }, 10);
  });
  document.getElementById("spin-container").style.display = "flex";
}
