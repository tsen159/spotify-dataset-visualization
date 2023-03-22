const body = d3.select('body')

const titleSvg = body.append('svg')
  .attr("class", "svg")
  .attr('width', 960)
  .attr('height', 100);
const titleG = titleSvg.append('g')
titleG.append('text')
  .attr('class', 'main-title')
  .attr('y', 70)
  .attr('x', 210)
  .text('Spotify Tracks Dataset');

const width = 960;
const height = 650;
const margin = { top: 100, right: 200, bottom: 120, left: 150 };

const firstSvg = body.append('svg')
  .attr("class", "svg")
  .attr("width", width)
  .attr("height", height);
const secSvg = body.append('svg')
  .attr("class", "svg")
  .attr("width", width)
  .attr("height", height)
const thirdSvg = body.append('svg')
  .attr("class", "svg")
  .attr("width", width)
  .attr("height", height)
const forthSvg = body.append('svg')
  .attr("class", "svg")
  .attr("width", width)
  .attr("height", height)
  

// dropdown menu operations
const dropdownMenu = (selection, props) => {
  const {
    options,
    optionClicked,
    selectedOption
  } = props;
    
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
    	.on('change', function() {
      optionClicked(this.value);
    });
    
  const option = select.selectAll('option').data(options);
  option.enter().append('option')
    .merge(option)
    .attr('value', d => d)
    .property('selected', d => d === selectedOption)
    .text(d => d);
};



const quantFeatures = [
  'popularity', 'danceability', 'energy',
  'loudness', 'speechiness', 'acousticness', 'instrumentalness',
  'liveness', 'valence', 'tempo'
];

let data;
let dPopularity;
let dDanceability;
let dEnergy;
let dLoudness;
let dSpeechiness;
let dAcousticness;
let dInstrumentalness;
let dLiveness;
let dValence;
let dTempo;

// Feature correlation: heat map
const heatmap = (selection, props) => {
  const {
    dPopularity,
    dDanceability,
    dEnergy,
    dLoudness,
    dSpeechiness,
    dAcousticness,
    dInstrumentalness,
    dLiveness,
    dValence,
    dTempo,
    width,
    height,
    margin
  } = props;

  const title = 'Correlation between Track Features';

  const featureList = {
    'popularity': dPopularity, 
    'danceability': dDanceability, 
    'energy': dEnergy,
    'loudness': dLoudness, 
    'speechiness': dSpeechiness, 
    'acousticness': dAcousticness, 
    'instrumentalness': dInstrumentalness,
    'liveness': dLiveness, 
    'valence': dValence, 
    'tempo': dTempo
  }

  const correlation = (arrayX, arrayY) => {
    let meanX = d3.mean(arrayX);
    let meanY = d3.mean(arrayY);
    let a = 0;
    let b = 0;
    let c = 0
    for (let i = 0; i < arrayX.length; i++){
      let diffX = arrayX[i] - meanX;
      let diffY = arrayY[i] - meanY;
      a += diffX * diffY;
      b += diffX * diffX;
      c += diffY * diffY;
    }
    let corr = a / Math.sqrt( b * c );
    return corr;
  }

  let corrList = [];
  for (let i = 0; i < quantFeatures.length; i++) {
    let f1 = quantFeatures[i]
    for (let j = 0; j < quantFeatures.length; j++) {
      let f2 = quantFeatures[j];
      let corr = correlation(featureList[f1], featureList[f2]);
      let pair = [f1, f2, corr];
      corrList.push(pair);
    } 
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = selection.append('g')
  	.attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleBand()
    .range([0, innerWidth])
    .domain(quantFeatures)
    .padding(0.01);
  
  const yScale = d3.scaleBand()
    .range([0, innerHeight])
    .domain(quantFeatures)
    .padding(0.01);

  const xAxisG = g.append('g')
    .call(d3.axisBottom(xScale))
  	.attr('transform', `translate(0, ${innerHeight})`);
  xAxisG.selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-65)');
  xAxisG.select('.domain').remove();
  	
  const yAxisG = g.append('g')
    .call(d3.axisLeft(yScale))
    .selectAll('.domain')
  		.remove();

  const heatColor = d3.scaleLinear()
    .range(["#ECFCEF", "#01801E"])
    .domain([-1, 1]);

  g.selectAll().data(corrList)
    .enter().append('rect')
      .attr('x', function(d) { return xScale(d[0]) })
      .attr('y', function(d) { return yScale(d[1]) })
      .attr('width', xScale.bandwidth() )
      .attr('height', yScale.bandwidth() )
      .style('fill', function(d) { return heatColor(d[2]) } );

  g.selectAll().data(corrList)
    .enter().append('text')
      .style('text-anchor', 'middle')
      .style('font-size','0.8em')
      .style('fill','white')
      .attr('x', function(d) { return xScale(d[0]) + xScale.bandwidth()/2})
      .attr('y', function(d) { return yScale(d[1]) + yScale.bandwidth()/2 + 3})
      .text(function(d) { 
        let t = d3.format(".2f")(d[2]).toString();
        return t; });

  const heatRange = d3.range(-1, 1.02, 0.01);
  const h = innerHeight / heatRange.length + 3;
  
  const rangeScale = d3.scaleLinear()
    .range([innerHeight-5, 0])
    .domain([-1, 1]);

  const rangeG = g.selectAll().data(heatRange)
    .enter().append('rect')
      .style('fill', d => heatColor(d))
      .style('stroke-width', 0)
      .style('stoke', 'none')
      .attr('height', h)
      .attr('width', 10)
      .attr('x', innerWidth + 40)
      .attr('y', d => rangeScale(d))

  const rangeTickG = g.append('g')
    .call(d3.axisRight(rangeScale))
    .attr('transform', `translate(${innerWidth + 50}, 0)`)
    .selectAll('.domain')
  		.remove();

  g.append('text')
    .style('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('y', -30)
    .attr('x', innerWidth/2)
    .text(title);
}



let XColumn;
let YColumn;
let classSelected;
let color;

// Genre based: relation between features 
const genreBasedScatterplot = (selection, props) => {
  const {
    data,
    XColumn,
    YColumn,
    width,
    height,
    margin,
    classSelected
  } = props;
  
  let selectedData = 0;
  let j = 0;
  while (selectedData < 1000) {
    if (data[j]['track_genre'] == classSelected) {
      data.splice(j, 1);
      data.push(data[j]);
      selectedData += 1
      }
    else {
      j += 1;
    }
  }

  const title = 'Relation between Track Features';
  
  const xValue = d => d[XColumn]; //depend on the xColumn selected
  const xAxisLabel = XColumn;
  
  const yValue = d => d[YColumn];
  const yAxisLabel = YColumn;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //range
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();
    
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const g = selection.selectAll('.container').data([null]);
  const gEnter = g.enter().append('g')
    .attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);
  
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  //yAxis group
  const yAxisG = g.select('.y-axis');
  
  const yAxisGEnter = gEnter.append('g')
    .attr('class', 'y-axis');
  
  yAxisG.merge(yAxisGEnter)
    .call(yAxis);
    
  const yAxisLabelText = yAxisGEnter
    .append('text')
      .attr('class', 'axis-label')
      .attr('y', -70)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
    .merge(yAxisG.select('.axis-label'))
      .attr('x', -innerHeight / 2)
      .text(yAxisLabel);
  
  //xAxis group
  const xAxisG = g.select('.x-axis');
  
  const xAxisGEnter = gEnter.append('g')
    .attr('class', 'x-axis');
  
  xAxisG.merge(xAxisGEnter)
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('.domain').remove();
    
  const xAxisLabelText = xAxisGEnter
    .append('text')
      .attr('class', 'axis-label')
      .attr('y', 75)
      .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
      .attr('x', innerWidth / 2)
      .text(xAxisLabel);

  const circleRadius = (c) => {
    if (c == classSelected) {
      return 2;
    }
    else {
      return 1
    }
  }

  const circleColor = (c) => {
    if (c == classSelected) {
      return 'red';
    }
    else {
      return '#A9A9A9';
    }
  }

  const circleOpacity = (c) => {
    if (c == classSelected) {
      return 1;
    }
    else {
      return 0.5;
    }
  }
  // point circle
  const circles = g.merge(gEnter).selectAll('.circle').data(data);
  
  circles
    .enter().append('circle')
  	.merge(circles)
      .attr('class', 'circle')
      .attr('cy', d => yScale(yValue(d)))
      .attr('cx', d => xScale(xValue(d)))
      .attr('r', d => circleRadius(d.genre))
      .style('fill', d => circleColor(d.genre))
      .style('opacity', d => circleOpacity(d.genre));
  
  gEnter.append('text')
    .style('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('y', -30)
    .attr('x', innerWidth/2)
    .text(title);

  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', innerHeight - 210)
    .attr('x', innerWidth + 40)
    .text('Select a genre:');
  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', innerHeight - 79)
    .attr('x', innerWidth + 40)
    .text('X:');
  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', innerHeight - 39)
    .attr('x', innerWidth + 40)
    .text('Y:');
  
  
}



let keyStat;
// statistics on key/mode
const barChart = (selection, props) => {
  const {
    keyStat,
    width,
    height,
    margin
  } = props;
  const title = 'Key/Mode vs Number of Tracks';

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const keysText = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes = ['1', '0']

  const tickForamt = d3.scaleOrdinal()
    .domain(keys)
    .range(keysText);

  const xScale = d3.scaleBand()
      .domain(keys)
      .range([0, innerWidth])
      .padding([0.2]);

  const yScale = d3.scaleLinear()
      .domain([0, 14000])
      .range([innerHeight, 0]);

  const g = selection.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xAxisG = g.append('g')
      .call(d3.axisBottom(xScale).tickFormat(tickForamt).tickSizeOuter(0))
      .attr('transform', `translate(0, ${innerHeight})`);
  xAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', 50)
      .attr('x', innerWidth/2)
      .attr('fill', 'black')
      .text('Key');

  const yAxisG = g.append('g')
      .call(d3.axisLeft(yScale));
  yAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', -90)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('x', -innerHeight / 2)
      .text('Number of tracks');

  const stackData = d3.stack()
    .keys(modes)(keyStat);
  
  const modeColor = d3.scaleOrdinal()
    .domain(modes)
    .range(['#EE2B2B','#377eb8']);
  
  g.append('g').selectAll('g').data(stackData)
    .enter().append('g')
      .attr('fill', function(d) { return modeColor(d.key); })
      .selectAll('rect')
      // subgroup
      .data(function(d) { return d; })
      .enter().append('rect')
        .attr('x', d => xScale(d.data['key']))
        .attr('y', function(d) { return yScale(d[1]); })
        .attr('height', function(d) { return yScale(d[0]) - yScale(d[1]); })
        .attr('width', xScale.bandwidth());

  g.append('text')
    .style('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('y', -30)
    .attr('x', innerWidth/2)
    .text(title);
  
  g.append('rect')
    .attr('class', 'legend')
    .attr('y', innerHeight - 45)
    .attr('x', innerWidth + 50)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#EE2B2B');
  g.append('rect')
    .attr('class', 'legend')
    .attr('y', innerHeight - 90)
    .attr('x', innerWidth + 50)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#377eb8');
  g.append('text')
    .attr('class', 'legend')
    .attr('y', innerHeight - 30)
    .attr('x', innerWidth + 80)
    .text('major');
  g.append('text')
    .attr('class', 'legend')
    .attr('y', innerHeight - 76)
    .attr('x', innerWidth + 80)
    .text('minor');

}




let trackA;
let trackB;
let trackC;
let trackDetail;
let popTrack;

const features = [
  'popularity', 'danceability', 'energy',
  'loudness', 'acousticness',
  'liveness', 'valence', 'tempo'
];
// spider chart
const spiderChart = (selection, props) => {
  const {
    data,
    trackDetail,
    width,
    height,
    margin,
    trackA,
    trackB,
    trackC
  } = props;

  const title = 'Top 100 Popular Tracks Comparision'

  loudDomain = d3.extent(data, d => d.loudness);
  tempoDomain = d3.extent(data, d => d.tempo);

  let selectedTracks = [];
  const featureSelected = (track, index) => {
    selectedTracks[index] = {
      'trackName': track['track_name'],
      'popularity': track['popularity'],
      'danceability': track['danceability'] * 100,
      'energy': track['energy'] * 100,
      'loudness': Math.abs(track['loudness'] - loudDomain[0]) / (loudDomain[1] - loudDomain[0]) * 100, 
      //'speechiness': track['speechiness'] * 100, 
      'acousticness': track['acousticness'] * 100, 
      //'instrumentalness': track['instrumentalness'] * 100,
      'liveness': track['liveness'] * 100, 
      'valence': track['valence'] * 100, 
      'tempo': track['tempo'] / (tempoDomain[1] - tempoDomain[0]) * 100}
  }

  for (let i = 0; i < trackDetail.length; i++) {
    if (trackDetail[i]['track_name'] == trackA) {
      featureSelected(trackDetail[i], 0);
    }
    else if (trackDetail[i]['track_name'] == trackB) {
      featureSelected(trackDetail[i], 1);
    }
    else if (trackDetail[i]['track_name'] == trackC) {
      featureSelected(trackDetail[i], 2);
    }
  }

  const trackColor = d3.scaleOrdinal()
    .domain([trackA, trackB, trackC])
    .range(['#756DDE', '#6ABE6E', '#DE756D']);

  const className = (d) => {
    if (d.trackName == trackA) {
      return 'track-a';
    }
    else if (d.trackName == trackB) {
      return 'track-b';
    }
    else {
      return 'track-c';
    }
  }

  // highlight hovered track
  var highlight = function(d){
    // first every track turns grey
    d3.selectAll('.area')
      .transition().duration(100)
      //.style('stroke', 'lightgrey')      
      //.style('fill', 'lightgrey')
      .style('stroke-opacity', 0.2)
      .style('opacity', 0.2);

    // second the hovered track takes its color
    d3.selectAll("." + className(d))
      .transition().duration(100)
      .style('stroke', trackColor(d.trackName))
      .style('fill', trackColor(d.trackName))
      .style('stroke-opacity', 0.7)
      .style('opacity', 0.7);
  }

  // unhighlight
  var doNotHighlight = function(d){
    d3.selectAll('.area')
      .transition().duration(100).delay(200)
      .style('stroke', function(d){ return( trackColor(d.trackName)) })
      .style('fill', function(d){ return( trackColor(d.trackName)) })
      .style('stroke-opacity', 0.5)
      .style('opacity', 0.5);
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const centerX = innerWidth/2;
  const centerY = innerHeight/2;

  const radialScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, 200]);

  const ticks = [20, 40, 60, 80, 100];

  const g = selection.selectAll('.container').data([null]);
  const gEnter = g.enter().append('g')
    .attr('class', 'container');
  gEnter.merge(g)
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  ticks.forEach(t =>
    gEnter.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("fill", "none")
      .attr("stroke", '#635F5D')
      .attr("r", radialScale(t))
  );

  ticks.forEach(t =>
    gEnter.append('text')
      .attr('x', centerX + 5)
      .attr('y', centerY + radialScale(t) + 15)
      .style('fill', '#635F5D')
      .text(t.toString() + '%')
  );

  const angleToCoordinate = (angle, value) => {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": centerX + x, "y": centerY - y};
  }
  const adjustLabelCoordinate = (angle) => {
    let normal = angleToCoordinate(angle, 115);
    let x = normal.x;
    let y = normal.y;
    if (normal.x < centerX - 5) {
      x = normal.x - 5;
    }
    else if (normal.x >= centerX) {
      x = normal.x + 5;
    }
    if (normal.y < centerY) {
      y = normal.y + 0;
    }
    else if (normal.y > centerY + 10) {
      y = normal.y + 10;
    }
    return {"x": x, "y": y};
  }

  for (let i = 0; i < features.length; i++) {
    let featureName = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let lineCoordinate = angleToCoordinate(angle, 100);
    let labelCoordinate = adjustLabelCoordinate(angle);

    //draw axis line
    gEnter.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", lineCoordinate.x)
      .attr("y2", lineCoordinate.y)
      .style('stroke','#635F5D');

    //draw axis label
    gEnter.append("text")
      .attr('text-anchor', 'middle')
      .attr("x", labelCoordinate.x)
      .attr("y", labelCoordinate.y)
      .style('fill','black')
      .text(featureName);
  }


  function path(d) {
    return d3.line()(features.map(function(feature) { 
      let angle = (Math.PI / 2) + (2 * Math.PI * features.indexOf(feature) / features.length);
      let coord = angleToCoordinate(angle, d[feature]);
      return [coord.x, coord.y]; 
    }));
  }
  const areas = g.merge(gEnter).selectAll('path').data(selectedTracks);
  areas.enter().append('path')
      .merge(areas)
        .attr('d', path)
        .attr('class', function (d) { return 'area ' + className(d) })
        .attr('stroke-width', 3)
        .attr('stroke', function(d){ return( trackColor(d.trackName) )})
        .attr('fill', function(d){ return( trackColor(d.trackName) )})
        .attr('stroke-opacity', 1)
        .attr('opacity', 0.5)
        .on('mouseover', highlight)
        .on('mouseleave', doNotHighlight);
  //'#756DDE', '#6ABE6E', '#DE756D'
  gEnter.append('text')
    .style('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('y', -70)
    .attr('x', innerWidth/2)
    .text(title);
  gEnter.append('rect')
    .attr('class', 'legend')
    .attr('y', 93)
    .attr('x', innerWidth + 70)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#756DDE')
    .style('opacity', 0.7);
  gEnter.append('rect')
    .attr('class', 'legend')
    .attr('y', 193)
    .attr('x', innerWidth + 70)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#6ABE6E')
    .style('opacity', 0.7);
  gEnter.append('rect')
    .attr('class', 'legend')
    .attr('y', 293)
    .attr('x', innerWidth + 70)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#DE756D')
    .style('opacity', 0.7);
  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', 110)
    .attr('x', innerWidth + 100)
    .text('Track 1:');
  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', 210)
    .attr('x', innerWidth + 100)
    .text('Track 2:');
  gEnter.append('text')
    .attr('class', 'legend')
    .attr('y', 310)
    .attr('x', innerWidth + 100)
    .text('Track 3:');
}






// render funstions
const initial = () => {
  firstSvg.append('text')
    .attr('x', 50)
    .attr('y', 50)
    .attr('font-size', 20)
    .attr('font-family', 'Arial')
    .attr('class', 'welcoming')
    .text('Please wait...');
}

const renderFirstSvg = () => {

  firstSvg.call(heatmap, {
    dPopularity,
    dDanceability,
    dEnergy,
    dLoudness,
    dSpeechiness,
    dAcousticness,
    dInstrumentalness,
    dLiveness,
    dValence,
    dTempo,
    width,
    height,
    margin
  })

  firstSvg.select('.welcoming').remove();
}

const renderSecSvg = () => {

  d3.select('#class_a')
  	.call(dropdownMenu, {
      options: genre,
      optionClicked: classClicked => {
        classSelected = classClicked;
        renderSecSvg();
      },
      selectedOption: classSelected
    });


  d3.select('#x-menu_2')
  	.call(dropdownMenu, {
      options: quantFeatures,
      optionClicked: column => {
        XColumn = column;
        renderSecSvg();
      },
      selectedOption: XColumn
    });

  d3.select('#y-menu_2')
  	.call(dropdownMenu, {
      options: quantFeatures,
      optionClicked: column => {
        YColumn = column;
        renderSecSvg();
      },
      selectedOption: YColumn
    });

  secSvg.call(genreBasedScatterplot, {
    data,
    XColumn,
    YColumn,
    width,
    height,
    margin,
    classSelected
  })
}

const renderThirdSvg = () => {
  thirdSvg.call(barChart, {
    keyStat,
    width,
    height,
    margin
  })
}


const renderForthSvg = () => {
  d3.select('#track_a')
    .call(dropdownMenu, {
      options: popTrack,
      optionClicked: trackClicked => {
        if (trackClicked != trackB && trackClicked != trackC) {
          trackA = trackClicked;
        }
        else {
          trackA = trackA;
        }
        renderForthSvg();
      },
      selectedOption: trackA
    });
  d3.select('#track_b')
    .call(dropdownMenu, {
      options: popTrack,
      optionClicked: trackClicked => {
        if (trackClicked != trackA && trackClicked != trackC) {
          trackB = trackClicked;
        }
        else {
          trackB = trackB;
        }
        renderForthSvg();
      },
      selectedOption: trackB
    });
  d3.select('#track_c')
    .call(dropdownMenu, {
      options: popTrack,
      optionClicked: trackClicked => {
        if (trackClicked != trackA && trackClicked != trackB) {
          trackC = trackClicked;
        }
        else {
          trackC = trackC;
        }
        renderForthSvg();
      },
      selectedOption: trackC
    });

  forthSvg.call(spiderChart, {
    data,
    trackDetail,
    width,
    height,
    margin,
    trackA,
    trackB,
    trackC,
  })
}



initial();
// show charts
d3.csv('dataset.csv').then(dataLoaded => {
  data = dataLoaded;

  dPopularity = [];
  dDanceability = [];
  dEnergy = [];
  dLoudness = [];
  dSpeechiness = [];
  dAcousticness = [];
  dInstrumentalness = [];
  dLiveness = [];
  dValence = [];
  dTempo = [];
  
  genre = [];

  keyStat = [];
  for (let i = 0; i < 12; i++) {
    keyStat.push({'key': i, '1': 0, '0': 0})
  }

  popTrack = []; 
  trackDetail = []; // list of objects

  data.forEach(d => {
    d.trackId = d['track_id']
    d.artists = d['artists'];
    d.albumName = d['album_name'];
    d.trackName = d['track_name'];
    d.popularity = +d['popularity'];
    //d.duration = +d['duration_ms'];
    d.explicit = d['explicit'];
    d.danceability = +d['danceability'];
    d.energy = +d['energy'];
    d.key = +d['key'];
    d.loudness = +d['loudness'];
    d.mode = d['mode'];
    d.speechiness = +d['speechiness'];
    d.acousticness = +d['acousticness'];
    d.instrumentalness = +d['instrumentalness'];
    d.liveness = +d['liveness'];
    d.valence = +d['valence'];
    d.tempo = +d['tempo'];
    d.timeSignature = +d['time_signature'];
    d.genre = d['track_genre'];

    dPopularity.push(d.popularity);
    dDanceability.push(d.danceability);
    dEnergy.push(d.energy);
    dLoudness.push(d.loudness);
    dSpeechiness.push(d.speechiness);
    dAcousticness.push(d.acousticness);
    dInstrumentalness.push(d.instrumentalness);
    dLiveness.push(d.liveness);
    dValence.push(d.valence);
    dTempo.push(d.tempo);

    if (!genre.includes(d.genre)) {
      genre.push(d.genre);
    }

    if (d.key != -1) {
      keyStat[d.key][d.mode] += 1;
    }

    // store top 100 popular tracks
    if (popTrack.length < 100 && !popTrack.includes(d.trackName)) {
      if (popTrack.length == 0){
        trackDetail.push(d);
        popTrack.push(d.trackName);
      }
      else {
        let set = 0;
        for (let i = 0; i < popTrack.length; i++){
          if (trackDetail[i]['popularity'] < d.popularity) {
            trackDetail.splice(i, 0, d);
            popTrack.splice(i, 0, d.trackName);
            set = 1;
            break;
          }
        }
        if (set == 0) {
          trackDetail.push(d);
          popTrack.push(d.trackName);
        }
      }
    }

    else if (popTrack.length == 100 && !popTrack.includes(d.trackName)) {
      for (let i = 0; i < popTrack.length; i++){
        if (trackDetail[i]['popularity'] < d.popularity) {
          trackDetail.splice(i, 0, d);
          popTrack.splice(i, 0, d.trackName);
          
          trackDetail.pop();
          popTrack.pop();

          break;
        }
      }
    }

  })


  // initialization
  // features
  XColumn = 'energy';
  YColumn = 'loudness';
  // track genre
  classSelected = 'hard-rock';

  // tracks
  trackA = "I'm Good (Blue)";
  trackB = 'Calm Down (with Selena Gomez)';
  trackC = 'Glimpse of Us';
  
  renderFirstSvg();
  renderSecSvg();
  renderThirdSvg();
  renderForthSvg();
})

