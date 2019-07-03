console.info('the application is working for 120 seconds');

$(document).ready(function(){
    chartRender(initialData[7].male_percent);   // renders donut chart
    setMarketsize(initialData);                 // inserts initial data into app
    postData(initialData);                      // posts initial data to JSON server and stsrts the app
});


// initial data
const initialData = [
    {"world_headcount": 132997229},
    {"headcount": 18619612},
    {"world_spending": 1023},
    {"spending": 143.18},
    {"gdp_headcount": 8},
    {"gdp_spending": 15},
    {"gdp": 2},
    {"male_percent": 44}
];


// posts initial data to JSON server
function postData(data) {
    $.ajax({
        url: "https://api.myjson.com/bins/",
        method: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        cache: false,
        data: JSON.stringify(data)
    }).done(function (response) {
        console.info('0 - sending initianl data');
        let interval = setInterval(function () { getData(response.uri) }, 2000);
        setTimeout(function () { clearInterval(interval) }, 120000);
    }).fail(function (error) {
        console.error('connecting ' + error.statusText);
    });
};


// gets data from JSON Server
function getData(url) {
    $.ajax({
        method: "GET",
        url: url,
        dataType: "json",
        cache: false
    }).done(function (response) {
        console.info('1 - geting data');
        setArrows(response[6]['gdp']);
        chartRender(response[7]['male_percent']);
        setMarketsize(response);
        putData(changeData(response), url);
    }).fail(function (error) {
        console.error('connecting ' + error.statusText);
    });
};


// puts modificated data to JSON Server
function putData(data, url) {
    $.ajax({
        url: url,
        method: "PUT",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data)
    }).done(function() {
        console.info('3 - sending updated data');
    }).fail(function (error) {
        console.error('connecting ' + error.statusText);
    });
};


// changes data
function changeData(data) {
    const array = ['-', '+'];
    const randomSign = array[Math.floor(Math.random() * array.length)];
    const randomIndex = Math.floor(Math.random() * data.length - 4);

    // random changes headcount and spending data
    for (let key in data[randomIndex]) {
        let newData = eval(data[randomIndex][key] + ' ' + randomSign + ' ' + data[randomIndex][key] * 0.05).toFixed(2);
        data[randomIndex][key] = Number(newData);
    };

    // changes gender_percent
    for (let key in data[data.length - 1]) {
        let newData = Math.round(eval(data[data.length - 1][key] + ' ' + randomSign + ' ' + data[data.length - 1][key] * 0.03));
        data[data.length - 1][key] = Number(newData);
    };

    // changes gdp_percent
    for (let key in data[data.length - 2]) {
        let newData = Math.round(eval(data[data.length - 2][key] + ' ' + randomSign + ' 1'));
        data[data.length - 2][key] = Number(newData);
    };

    // changes gdp_spending
    for (let key in data[data.length - 3]) {
        if (randomSign == '-') {
            data[data.length - 3][key] -= 2;
        } else if (randomSign == '+') {
            data[data.length - 3][key] += 2;
        }
    };

    // changes gdp_headcount
    for (let key in data[data.length - 4]) {
        if (randomSign == '-') {
            data[data.length - 4][key] -= 1;
        } else if (randomSign == '+') {
            data[data.length - 4][key] += 1;
        }
    };

    console.info('2 - changing random data');
    return data;
};


// chart rendering
function chartRender(inputData) {
    let width = 100;
    let height = 100;
    let outerRadius = width / 2;
    let innerRadius = width / 3.5;

    const data = [
        { start: 0, stop: 100 - inputData, color: "#0bd8aa" },
        { start: 100 - inputData, stop: 100, color: "#53a8e2" }
    ];

    let myScale = d3.scale
        .linear()
        .domain([0, 100])
        .range([0, 2 * Math.PI]);

    let svg = d3.select("div.svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-content", true);

    let arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(function(d){return myScale(d.start);})
        .endAngle(function(d){return myScale(d.stop);});

    svg.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", arc)
        .style("fill", function(d){return d.color;})
        .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
}


// innput data to website
function setMarketsize(data){
    let data_headcount = numberWithCommas(Math.round(data[1].headcount));
    let data_headcount_share = Math.round((data[1].headcount/data[0].world_headcount*100));
    let data_spending = data[3].spending.toFixed(2);
    let data_spending_share = Math.round(data[3].spending/data[2].world_spending*100);

    let top_container = $('.top_container'); 
    top_container.find('.headcount').text(data_headcount);
    top_container.find('.headcount_share').text(data_headcount_share);
    top_container.find('.spending').text('$' + data_spending);
    top_container.find('.spending_share').text(data_spending_share);

    let data_male_percent = data[7].male_percent;
    let data_gdp = data[6].gdp <= 0 ? data[6].gdp : "+" + data[6].gdp;
    let data_gdp_headcount = Math.round(data[4].gdp_headcount);
    let data_gdp_spending = Math.round(data[5].gdp_spending);

    let bottom_container = $('.bottom_container');
    bottom_container.find('.male').text(data_male_percent + '%');
    bottom_container.find('.female').text(100 - data_male_percent + '%');
    bottom_container.find('.gdp_percent').text(data_gdp + '%');
    bottom_container.find('.gdp_headcount').text(data_gdp_headcount + '%');
    bottom_container.find('.gdp_spending').text(data_gdp_spending + '%');

    function numberWithCommas(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
};


// arrow's condition
function setArrows(data) {
    let bottom_container = $('.bottom_container');
    let triangle_up = bottom_container.find('.triangle_up');
    let triangle_down = bottom_container.find('.triangle_down');

    let web_value = parseInt($(bottom_container).find('.gdp_percent').text());
    let api_value = Math.round(data);

    if (api_value > web_value){
        $(triangle_up).css('display', 'block');
        $(triangle_down).css('display', 'none');
    }
    else if(api_value < web_value){
        $(triangle_up).css('display', 'none');
        $(triangle_down).css('display', 'block');
    }
};
