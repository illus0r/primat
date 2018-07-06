var width = 900,
    height = 500;
var svg = d3.select("body").append("svg").attr("width",width).attr("height",height);
var zoomedArea=svg.append("g").attr("class","zoomable");
var g = svg.append("g");

var x = d3.scaleLinear()
    .domain([-70, 10])
    .range([50, width-50]);

var xAxis = d3.axisBottom(x);
var xAxisPeriods=d3.axisTop(x);

var zoom = d3.zoom()
    .scaleExtent([1, 1])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var periods=[];
var pp;
d3.tsv("Primat - Layers.tsv").then(function (data) { // make axis with periods from tsv
    data.forEach(function (d) {
        periods.push(d.date_start*(-1));
    });
    g.append("g").attr("class", "axis axis--x")
        .call(xAxis.tickSize(5).tickSizeInner(5).tickSizeOuter(5) //ticks format
        .tickValues(periods));
    pp=data;
    return data;
});
console.log(pp);

var periodNames = ["мел","палеоцен", "эоцен", "олигоцен","миоцен","плиоцен","плейстоцен","голоцен"];
g.append("g").attr("class", "axis periods")
    .call(xAxisPeriods
        .tickValues([-105.5,-61,-44.95,-28.465,-14.1815,-3.5695,-0.90885,0])
        .tickFormat(function (d,i) {
            return periodNames[i];
        })
        .tickPadding(5)
        .tickSize(0));

d3.tsv("Primat - from PDF.tsv").then(function(d) { //read data from tsv

    zoomedArea.selectAll("rect").data(d).enter().append("rect") //create lines of period
        .on ("click",handleGenusClick)
        .attr("rx", 1)
        .attr("ry", 1)
        .attr("x", (d) => x(-1 * d.period_start))
        .attr("y", (d, i) => i * 20 + 30)
        .attr("width", function (d, i) {
            wid = x(d.period_start) - x(d.period_end); //calculate length of line
            if (wid<5) wid=5;
            return wid;
        })
        .attr("height", 2)
        .attr("stroke", "none")
        .attr("fill", "#c061c0");

    svg.call(zoom).transition()
        .duration(1500)
        .call(zoom.transform, d3.zoomIdentity
            .scale(1)
            .translate(0, 0));

    zoomedArea.selectAll('text.genus').data(d).enter().append("text")//create signs for lines
        .attr("class","genus")
        .text(function(d){
            if (d.genus=="—") { // oh really, no genus?
                if (d.subfamily=="—") return d.family;
                else return d.subfamily;
            }
            else return d.genus})
        .attr("x", function (d) {
            return x(-1*d.period_start);
        })
        .attr("y", function (d, j) {
            return j * 20+28 ;
        });
});

function zoomed() {
    var t = d3.event.transform, xt = t.rescaleX(x);
    g.select(".axis--x").call(xAxis.scale(xt));
    g.select(".periods").call(xAxisPeriods.scale(xt));

    //zoomedArea.attr("transform",  `scale(`+d3.event.transform.k+`, 1)` );
    //console.log(d3.event.transform.k);
    zoomedArea.attr("transform",  d3.event.transform );
    //view.attr('transform', `scale(${d3.event.transform.k}, 1)`);
}

function handleGenusClick(d,i) { //TODO: genus details overlay
    var x=d3.select(this).attr("x");
    var y=d3.select(this).attr("y");
    svg.append("rect")
        .attr("id", "onGenusClick")
        .attr("x", x)
        .attr("transform",  d3.select(this).transform )
        .attr("y",y);
    console.log("click on "+d.genus+ x);
}

var vertical = svg.append("path").attr("class", "trackLine");//add the mouse-tracking vertical line

var begunokG=svg.append("g").attr("id","begunok");
var begunokRect=begunokG.append("rect");
var begunokText= begunokG.append("text");

svg.on("mousemove", function(){
    mousex = d3.mouse(this);
    vertical.style("display", null).attr("d", function () {
        var d = "M" + mousex[0] + "," + (height);
        d += " " + mousex[0] + "," + 10;
        return d;
    });
    begunokRect.attr("id","begunok").attr("y",-20)
        .attr( "x",function (d){return (mousex[0]-35)});

    var format = d3.format(".1f");
    var time=-x.invert(mousex[0]);
    //console.log(time);
    d3.tsv("Primat - Layers.tsv").then(function (data) { //
        data.forEach(function (d,i,a) {
           if (i<a.length-1) {
               //console.log(a[i].date_start +" " + time +" "+ a[i + 1].date_start);
               if (a[i].date_start > time && a[i + 1].date_start <time) {
                   //console.log("период " + a[i].layer_ru + "  " + a[i].sublayer);
                   begunokText.text(a[i].sublayer + "  " + a[i].layer_ru)
                       .attr("x",function () {return (mousex[0]-30)})
                       .attr("y",-5);
               }
           }
        })
    })
    /*begunokText.text(format(x.invert(mousex[0])))
        .attr("x",function () {return (mousex[0]-20)})
        .attr("y",-5);*/
})
    /*.on("mouseout", function(){ //hide the line
    mousex = d3.mouse(this);
    mousex = mousex[0] + 5;
    vertical.style("display", "none")});*/