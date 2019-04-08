console.log('the application is working for 120 seconds');

$(document).ready(function(){
    chartRender(inputData[7].male_percent);
    setMarketsize(inputData); 
    postData(initialData);
});


//initial data
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

// JSON.stringify(obj) — converts an JavaScript object to a JSON string
// JSON.parse(str) — converts a JSON string back to a JavaScript object
const inputData = JSON.parse(JSON.stringify(initialData));


function postData(data) {
    //send data to JSON Server
    $.ajax({
        url: "https://api.myjson.com/bins/",
        method: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        cache: false,
        data: JSON.stringify(data)
    }).done(function (response) {
        console.log(response.uri);
        url = response.uri;

        let interval = setInterval(function () {
            getData(url);
        }, 2000);

        let timeout = setTimeout(function () {
            clearInterval(interval);
        }, 120000); 
    }).fail(function (error) {
        console.log('connecting ' + error.statusText);
    });
}


//get data from JSON Server
function getData(url) {
    $.ajax({
        method: "GET",
        url: url,
        dataType: "json",
        cache: false
    }).done(function (response) {
        console.log('connected');
        checkingArrows(response[6]['gdp']);
        chartRender(response[7]['male_percent']);
        setMarketsize(response);
        changeData(response);
        putData(response);
    }).fail(function (error) {
        console.log('connecting ' + error.statusText);
    });
}


//put modificated data to JSON Server
function putData(data) {
    $.ajax({
        url: url,
        method: "PUT",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data)
    }).done(function (response) {
        console.log('data updated');
    }).fail(function (error) {
        console.log('connecting ' + error.statusText);
    });
}


//changing data
function changeData(data) {
    const array = ['-', '+'];
    const randomSign = array[Math.floor(Math.random() * array.length)];
    const randomIndex = Math.floor(Math.random() * data.length - 4);

    //random changing headcount and spending data
    for (let key in data[randomIndex]) {
        let newData = eval(data[randomIndex][key] + ' ' + randomSign + ' ' + data[randomIndex][key] * 0.05).toFixed(2);
        data[randomIndex][key] = Number(newData);
    }
    //changing gender_percent
    for (let _key in data[data.length - 1]) {
        let _newData = Math.round(eval(data[data.length - 1][_key] + ' ' + randomSign + ' ' + data[data.length - 1][_key] * 0.03));
        data[data.length - 1][_key] = Number(_newData);
    }
    //changing gdp_percent
    for (let _key2 in data[data.length - 2]) {
        let _newData2 = Math.round(eval(data[data.length - 2][_key2] + ' ' + randomSign + ' 1'));
        data[data.length - 2][_key2] = Number(_newData2);
    }
    //changing gdp_spending
    for (let _key3 in data[data.length - 3]) {
        if (randomSign == '-') {
            data[data.length - 3][_key3] -= 2;
        } else if (randomSign == '+') {
            data[data.length - 3][_key3] += 2;
        }
    }
    //changing gdp_headcount
    for (let _key4 in data[data.length - 4]) {
        if (randomSign == '-') {
            data[data.length - 4][_key4] -= 1;
        } else if (randomSign == '+') {
            data[data.length - 4][_key4] += 1;
        }
    }
    return data;
}


//chart rendering
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


//innput data to website
function setMarketsize(data){
    let data_headcount = numberWithCommas(Math.round(data[1].headcount));
    let data_headcount_share = Math.round((data[1].headcount/data[0].world_headcount*100));
    let data_spending = data[3].spending.toFixed(2);
    let data_spending_share = Math.round(data[3].spending/data[2].world_spending*100)

    let top_container = $('.top_container'); 
    let headcount = top_container.find('.headcount').text(data_headcount);
    let headcount_share = top_container.find('.headcount_share').text(data_headcount_share);
    let spending = top_container.find('.spending').text('$' + data_spending);
    let spending_share = top_container.find('.spending_share').text(data_spending_share);

    let data_male_percent = data[7].male_percent;
    let data_gdp = data[6].gdp <= 0 ? data[6].gdp : "+" + data[6].gdp;
    let data_gdp_headcount = Math.round(data[4].gdp_headcount);
    let data_gdp_spending = Math.round(data[5].gdp_spending);

    let bottom_container = $('.bottom_container');
    let male_percent = bottom_container.find('.male').text(data_male_percent + '%');
    let female_percent = bottom_container.find('.female').text(100 - data_male_percent + '%');
    let gdp = bottom_container.find('.gdp_percent').text(data_gdp + '%');
    let gdp_headcount = bottom_container.find('.gdp_headcount').text(data_gdp_headcount + '%');
    let gdp_spending = bottom_container.find('.gdp_spending').text(data_gdp_spending + '%');

    function numberWithCommas(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}


//arrows conditions
function checkingArrows(data) {
    let bottom_container = $('.bottom_container');    
    let triangle_up = bottom_container.find('.triangle_up');
    let triangle_down = bottom_container.find('.triangle_down');   

    let web_value = parseInt($('.bottom_container').find('.gdp_percent').text());
    let api_value = Math.round(data);

    if (api_value > web_value){
        $(triangle_up).css('display', 'block');
        $(triangle_down).css('display', 'none');
    }
    else if(api_value < web_value){
        $(triangle_up).css('display', 'none');
        $(triangle_down).css('display', 'block');
    }
}