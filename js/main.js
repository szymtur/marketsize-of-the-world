$(document).ready(function() {
    chartRender(INITIAL_DATA.male_percent);     // rendering donut chart
    setMarketsize(INITIAL_DATA);                // inserting initial data into app
    fetchMarketsizeData();                      // fetching data from fake api
});


const INITIAL_DATA = {
    "world_headcount": 132997229,
    "world_spending": 1023,
    "headcount": 18619612,
    "spending": 143.18,
    "gdp_headcount": 8,
    "gdp_spending": 15,
    "gdp": 12,
    "male_percent": 44
};

const OPTIONS = {
    METHOD: 'GET',
    URL: 'http://www.marketsize-fake-data-api.com',
    CONTENT_TYPE: 'application/json',
    DATA_TYPE: 'json',
    TIMEOUT: 1500
}


// fake ajax response
$.ajax = function(options) {
    const deferred = $.Deferred();

    if (options.method !== OPTIONS.METHOD) {
        setTimeout(function() {
            console.error(options.method, options.url, 400, '(Bad Request)')
            deferred.reject({status: 400, statusText: 'Bad Request'});
        }, OPTIONS.TIMEOUT);
        return deferred.promise();
    }

    if (options.url !== OPTIONS.URL) {
        setTimeout(function() {
            console.error(options.method, options.url, 404, '(Not Found)')
            deferred.reject({status: 404, statusText: 'Not Found'});
        }, OPTIONS.TIMEOUT);
        return deferred.promise();
    }

    setTimeout(function() {
        deferred.resolve(INITIAL_DATA);
    }, OPTIONS.TIMEOUT);
    return deferred.promise();
};


// changing initial data
function changeData(data) {
    // changes headcount data
    const headcount = INITIAL_DATA.headcount;
    INITIAL_DATA.headcount = Math.random() < 0.5 ? headcount + headcount * 0.0001 : headcount - headcount * 0.0001;

    // changes spending data
    const spending = INITIAL_DATA.spending;
    INITIAL_DATA.spending = Math.random() < 0.5 ? spending + spending * 0.005 : spending - spending * 0.005;

    // changes male_percent data
    const malePercent = INITIAL_DATA.male_percent;
    const newMalePercent = Math.random() < 0.5 ? malePercent + malePercent * 0.03 : malePercent - malePercent * 0.03;
    INITIAL_DATA.male_percent = Math.round(newMalePercent);


    // changes gdp_percent data
    INITIAL_DATA.gdp = Math.random() < 0.5 ? INITIAL_DATA.gdp + 0.4 : INITIAL_DATA.gdp - 0.4;

    // changes gdp_spending data
    INITIAL_DATA.gdp_spending = Math.random() < 0.5 ? INITIAL_DATA.gdp_spending + 0.5 : INITIAL_DATA.gdp_spending - 0.5;

    // changes gdp_headcount data
    INITIAL_DATA.gdp_headcount = Math.random() < 0.5 ? INITIAL_DATA.gdp_headcount + 0.5 : INITIAL_DATA.gdp_headcount - 0.5;
};


// inserting data to the html DOM document
function setMarketsize(data){
    const top_container = $('.top_container'); 
    top_container.find('.headcount').text(numberWithCommas(Math.round(data.headcount)));
    top_container.find('.headcount_share').text(Math.round((data.headcount/data.world_headcount*100)));
    top_container.find('.spending').text('$' + data.spending.toFixed(2));
    top_container.find('.spending_share').text(Math.round(data.spending/data.world_spending*100));

    const bottom_container = $('.bottom_container');
    bottom_container.find('.male').text(data.male_percent + '%');
    bottom_container.find('.female').text(100 - data.male_percent + '%');
    bottom_container.find('.gdp_percent').text(Math.round(data.gdp <= 0 ? Math.abs(data.gdp) : data.gdp) + '%');
    bottom_container.find('.gdp_headcount').text(Math.round(data.gdp_headcount) + '%');
    bottom_container.find('.gdp_spending').text(Math.round(data.gdp_spending) + '%');

    function numberWithCommas(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
};


// arrow's condition
function setArrows(data) {
    const bottom_container = $('.bottom_container');
    const triangle_up = bottom_container.find('.triangle_up');
    const triangle_down = bottom_container.find('.triangle_down');

    const web_value = parseInt($(bottom_container).find('.gdp_percent').text());
    const new_value = Math.round(data);

    if (new_value == web_value || web_value == 0) {
        $(triangle_up).css('display', 'none');
        $(triangle_down).css('display', 'none');
    }
    else if (new_value > web_value) {
        $(triangle_up).css('display', 'block');
        $(triangle_down).css('display', 'none');
    }
    else if (new_value < web_value) {
        $(triangle_up).css('display', 'none');
        $(triangle_down).css('display', 'block');
    }
};


// chart rendering
function chartRender(inputData) {
    const width = 100;
    const height = 100;
    const outerRadius = width / 2;
    const innerRadius = width / 3.5;

    const data = [
        { start: 0, stop: 100 - inputData, color: "#0bd8aa" },
        { start: 100 - inputData, stop: 100, color: "#53a8e2" }
    ];

    const myScale = d3.scale
        .linear()
        .domain([0, 100])
        .range([0, 2 * Math.PI]);

    const svg = d3.select("div.svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-content", true);

    const arc = d3.svg.arc()
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


// fetching data from fake api
function fetchMarketsizeData() {
    $.ajax({
        method: OPTIONS.METHOD,
        url: OPTIONS.URL,
        dataType: OPTIONS.DATA_TYPE,
    }).done(function (response) {
        console.info('connected to:', OPTIONS.URL);
        setArrows(response.gdp);
        chartRender(response.male_percent);
        setMarketsize(response);
        changeData(response);
        fetchMarketsizeData();
    }).fail(function (error) {
        console.error('connecting error:', error.status, error.statusText);
    });
};